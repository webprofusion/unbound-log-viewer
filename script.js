class UnboundLogParser {
    constructor() {
        this.logData = [];
        this.filteredData = [];
        this.stats = {
            total: 0,
            errors: 0,
            warnings: 0,
            info: 0,
            debug: 0
        };

        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.browseBtn = document.getElementById('browseBtn');
        this.controlsSection = document.getElementById('controlsSection');
        this.statsSection = document.getElementById('statsSection');
        this.logSection = document.getElementById('logSection');
        this.logContent = document.getElementById('logContent');
        this.searchInput = document.getElementById('searchInput');
        this.clearBtn = document.getElementById('clearBtn');
        this.exportBtn = document.getElementById('exportBtn');

        // Tab elements
        this.fileTab = document.getElementById('fileTab');
        this.urlTab = document.getElementById('urlTab');
        this.fileTabContent = document.getElementById('fileTabContent');
        this.urlTabContent = document.getElementById('urlTabContent');

        // URL input elements
        this.urlInput = document.getElementById('urlInput');
        this.fetchBtn = document.getElementById('fetchBtn');
        this.loadingIndicator = document.getElementById('loadingIndicator');

        // Filter checkboxes
        this.showErrors = document.getElementById('showErrors');
        this.showWarnings = document.getElementById('showWarnings');
        this.showInfo = document.getElementById('showInfo');
        this.showDebug = document.getElementById('showDebug');

        // Stats elements
        this.totalLines = document.getElementById('totalLines');
        this.errorCount = document.getElementById('errorCount');
        this.warningCount = document.getElementById('warningCount');
        this.infoCount = document.getElementById('infoCount');
    }

    setupEventListeners() {
        // File upload events
        this.browseBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Drag and drop events
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

        // Tab events
        this.fileTab.addEventListener('click', () => this.switchTab('file'));
        this.urlTab.addEventListener('click', () => this.switchTab('url'));

        // URL fetch events
        this.fetchBtn.addEventListener('click', () => this.handleUrlFetch());
        this.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleUrlFetch();
            }
        });

        // Filter events
        this.showErrors.addEventListener('change', () => this.applyFilters());
        this.showWarnings.addEventListener('change', () => this.applyFilters());
        this.showInfo.addEventListener('change', () => this.applyFilters());
        this.showDebug.addEventListener('change', () => this.applyFilters());

        // Search events
        this.searchInput.addEventListener('input', () => this.applyFilters());
        this.clearBtn.addEventListener('click', () => this.clearSearch());

        // Export event
        this.exportBtn.addEventListener('click', () => this.exportResults());
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        if (!file.type.includes('text') && !file.name.endsWith('.log')) {
            alert('Please select a valid log file (.log or .txt)');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            this.parseLogContent(content);
            this.showSections();
        };
        reader.readAsText(file);
    }

    parseLogContent(content) {
        const lines = content.split('\n');
        this.logData = [];
        this.stats = { total: 0, errors: 0, warnings: 0, info: 0, debug: 0 };

        lines.forEach((line, index) => {
            if (line.trim() === '') return;

            const parsedLine = this.parseLogLine(line, index + 1);
            if (parsedLine) {
                this.logData.push(parsedLine);
                this.stats.total++;
                this.stats[parsedLine.level]++;
            }
        });

        this.filteredData = [...this.logData];
        this.updateStats();
        this.renderLogs();
    }

    parseLogLine(line, lineNumber) {
        // Unbound log patterns - more comprehensive matching
        const patterns = [
            // Standard Unbound log format: timestamp [pid:thread] level: message
            /^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+\[(\d+:\d+)\]\s+(error|warning|info|debug|notice):\s*(.+)$/i,

            // Alternative format: timestamp level [pid:thread]: message
            /^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+(error|warning|info|debug|notice)\s+\[(\d+:\d+)\]:\s*(.+)$/i,

            // Simple format: timestamp level: message
            /^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+(error|warning|info|debug|notice):\s*(.+)$/i,

            // Syslog format: Mon DD HH:MM:SS hostname unbound[pid]: level: message
            /^(\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+\S+\s+unbound(?:\[\d+\])?:\s+(error|warning|info|debug|notice):\s*(.+)$/i
        ];

        for (const pattern of patterns) {
            const match = line.match(pattern);
            if (match) {
                let timestamp, level, message, pid;

                if (match.length === 5) {
                    [, timestamp, pid, level, message] = match;
                } else if (match.length === 4) {
                    [, timestamp, level, message] = match;
                } else {
                    continue;
                }

                return {
                    lineNumber,
                    timestamp: timestamp.trim(),
                    level: this.normalizeLevel(level.toLowerCase()),
                    message: message.trim(),
                    pid: pid || '',
                    originalLine: line,
                    severity: this.getSeverity(level.toLowerCase())
                };
            }
        }

        // If no pattern matches, treat as info level with generic parsing
        const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})|(\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})/);
        const timestamp = timestampMatch ? timestampMatch[0] : 'Unknown';

        // Check for error keywords in the message
        const errorKeywords = ['error', 'fail', 'exception', 'critical', 'fatal', 'denied', 'refused', 'timeout'];
        const warningKeywords = ['warning', 'warn', 'deprecated', 'retry', 'slow', 'suspect'];

        let detectedLevel = 'info';
        const lowerLine = line.toLowerCase();

        if (errorKeywords.some(keyword => lowerLine.includes(keyword))) {
            detectedLevel = 'errors';
        } else if (warningKeywords.some(keyword => lowerLine.includes(keyword))) {
            detectedLevel = 'warnings';
        }

        return {
            lineNumber,
            timestamp,
            level: detectedLevel,
            message: line.replace(timestamp, '').trim(),
            pid: '',
            originalLine: line,
            severity: this.getSeverity(detectedLevel)
        };
    }

    normalizeLevel(level) {
        const levelMap = {
            'error': 'errors',
            'err': 'errors',
            'warning': 'warnings',
            'warn': 'warnings',
            'info': 'info',
            'information': 'info',
            'debug': 'debug',
            'notice': 'info'
        };
        return levelMap[level] || 'info';
    }

    getSeverity(level) {
        const severityMap = {
            'errors': 1,
            'warnings': 2,
            'info': 3,
            'debug': 4
        };
        return severityMap[level] || 3;
    }

    updateStats() {
        this.totalLines.textContent = this.stats.total;
        this.errorCount.textContent = this.stats.errors;
        this.warningCount.textContent = this.stats.warnings;
        this.infoCount.textContent = this.stats.info;
    }

    renderLogs() {
        this.logContent.innerHTML = '';

        this.filteredData.forEach(logEntry => {
            const entryElement = this.createLogEntryElement(logEntry);
            this.logContent.appendChild(entryElement);
        });
    }

    createLogEntryElement(logEntry) {
        const div = document.createElement('div');
        div.className = `log-entry ${logEntry.level.replace('s', '')}`;
        div.dataset.level = logEntry.level;
        div.dataset.lineNumber = logEntry.lineNumber;

        const timestamp = document.createElement('span');
        timestamp.className = 'log-timestamp';
        timestamp.textContent = logEntry.timestamp;

        const level = document.createElement('span');
        level.className = `log-level ${logEntry.level.replace('s', '')}`;
        level.textContent = logEntry.level.replace('s', '').toUpperCase();

        const message = document.createElement('span');
        message.className = 'log-message';
        message.innerHTML = this.highlightKeywords(logEntry.message);

        div.appendChild(timestamp);
        div.appendChild(level);
        if (logEntry.pid) {
            const pid = document.createElement('span');
            pid.className = 'log-pid';
            pid.textContent = `[${logEntry.pid}]`;
            div.appendChild(pid);
        }
        div.appendChild(message);

        return div;
    }

    highlightKeywords(message) {
        const keywords = [
            'error', 'fail', 'failed', 'failure', 'exception', 'critical', 'fatal',
            'denied', 'refused', 'timeout', 'unreachable', 'invalid', 'corrupt',
            'warning', 'warn', 'deprecated', 'retry', 'slow', 'suspect',
            'query', 'response', 'recursion', 'validation', 'dnssec'
        ];

        let highlightedMessage = message;
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            highlightedMessage = highlightedMessage.replace(regex, `<span class="keyword">${keyword}</span>`);
        });

        return highlightedMessage;
    }

    applyFilters() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const showErrors = this.showErrors.checked;
        const showWarnings = this.showWarnings.checked;
        const showInfo = this.showInfo.checked;
        const showDebug = this.showDebug.checked;

        this.filteredData = this.logData.filter(entry => {
            // Level filter
            let levelMatch = false;
            if (entry.level === 'errors' && showErrors) levelMatch = true;
            if (entry.level === 'warnings' && showWarnings) levelMatch = true;
            if (entry.level === 'info' && showInfo) levelMatch = true;
            if (entry.level === 'debug' && showDebug) levelMatch = true;

            // Search filter
            const searchMatch = !searchTerm ||
                entry.message.toLowerCase().includes(searchTerm) ||
                entry.timestamp.toLowerCase().includes(searchTerm);

            return levelMatch && searchMatch;
        });

        this.renderLogs();

        // Highlight search terms
        if (searchTerm) {
            this.highlightSearchTerms(searchTerm);
        }
    }

    highlightSearchTerms(searchTerm) {
        const entries = this.logContent.querySelectorAll('.log-entry');
        entries.forEach(entry => {
            if (entry.textContent.toLowerCase().includes(searchTerm)) {
                entry.classList.add('highlight');
            }
        });
    }

    clearSearch() {
        this.searchInput.value = '';
        this.applyFilters();
    }

    exportResults() {
        const exportData = {
            summary: {
                totalLines: this.stats.total,
                errors: this.stats.errors,
                warnings: this.stats.warnings,
                info: this.stats.info,
                debug: this.stats.debug,
                exportDate: new Date().toISOString()
            },
            logs: this.filteredData
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `unbound-log-analysis-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    showSections() {
        this.controlsSection.style.display = 'block';
        this.statsSection.style.display = 'block';
        this.logSection.style.display = 'block';
    }

    switchTab(tabType) {
        if (tabType === 'file') {
            this.fileTab.classList.add('active');
            this.urlTab.classList.remove('active');
            this.fileTabContent.style.display = 'block';
            this.urlTabContent.style.display = 'none';
        } else {
            this.urlTab.classList.add('active');
            this.fileTab.classList.remove('active');
            this.urlTabContent.style.display = 'block';
            this.fileTabContent.style.display = 'none';
        }
    }

    async handleUrlFetch() {
        const url = this.urlInput.value.trim();
        if (!url) {
            alert('Please enter a valid URL');
            return;
        }

        this.showLoadingState(true);
        this.fetchBtn.disabled = true;

        try {
            const logContent = await this.fetchLogFromUrl(url);
            this.parseLogContent(logContent);
            this.showSections();
        } catch (error) {
            console.error('Error fetching log:', error);
            alert('Failed to fetch log from URL (CORS probably blocks fetch from this URL). Please check the URL and try again.\n\nError: ' + error.message);
        } finally {
            this.showLoadingState(false);
            this.fetchBtn.disabled = false;
        }
    }

    isValidUnboundTestUrl(url) {
        try {
            const urlObj = new URL(url);
            // Accept various unbound test domains and similar log services
            const validDomains = [
                'unboundtest.com',
                'www.unboundtest.com',
                'dns.lookup.dog',
                'dnscheck.tools',
                'dnschecker.org'
            ];

            return validDomains.some(domain =>
                urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
            );
        } catch {
            return false;
        }
    }

    async fetchLogFromUrl(url) {
        // For security reasons, we need to use a CORS proxy or handle this server-side
        // For now, we'll try to fetch directly and handle CORS issues
        try {

            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'text/plain, text/html, */*'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            let content = await response.text();

            // If the response is HTML, try to extract log content
            if (contentType && contentType.includes('text/html')) {
                content = this.extractLogFromHtml(content);
            }

            return content;
        } catch (error) {
            // Try using a CORS proxy as fallback
            return await this.fetchWithCorsProxy(url);
        }
    }

    async fetchWithCorsProxy(url) {
        // Use a public CORS proxy service
        const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;

        try {
            const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'text/plain, text/html, */*'
                }
            });

            if (!response.ok) {
                throw new Error(`Proxy request failed: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            let content = await response.text();

             // If the response is HTML, try to extract log content
            if (contentType && contentType.includes('text/html')) {
                content = this.extractLogFromHtml(content);
            }

            return content;
        } catch (error) {
            throw new Error(`Failed to fetch via proxy: ${error.message}`);
        }
    }

    extractLogFromHtml(htmlContent) {
        // Create a temporary DOM element to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        // Look for common patterns in unbound test result pages
        let logContent = '';

        // Try to find pre-formatted text blocks
        const preElements = tempDiv.querySelectorAll('pre');
        if (preElements.length > 0) {
            logContent = Array.from(preElements)
                .map(pre => pre.textContent)
                .join('\n');
        }

        // Try to find code blocks
        if (!logContent) {
            const codeElements = tempDiv.querySelectorAll('code');
            if (codeElements.length > 0) {
                logContent = Array.from(codeElements)
                    .map(code => code.textContent)
                    .join('\n');
            }
        }

        // Try to find text content that looks like logs
        if (!logContent) {
            const textContent = tempDiv.textContent || tempDiv.innerText || '';
            const lines = textContent.split('\n');

            // Filter lines that look like log entries
            const logLines = lines.filter(line => {
                const trimmed = line.trim();
                return trimmed && (
                    /^\d{4}-\d{2}-\d{2}/.test(trimmed) || // Date format
                    /^\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}/.test(trimmed) || // Syslog format
                    trimmed.includes('[') && trimmed.includes(']:') || // Bracket format
                    /\b(error|warning|info|debug|notice)\b/i.test(trimmed) // Log levels
                );
            });

            if (logLines.length > 0) {
                logContent = logLines.join('\n');
            }
        }

        // If still no content found, return the plain text
        if (!logContent) {
            logContent = tempDiv.textContent || tempDiv.innerText || htmlContent;
        }

        return logContent;
    }

    showLoadingState(show) {
        this.loadingIndicator.style.display = show ? 'flex' : 'none';
    }
}

// Initialize the parser when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.unboundParser = new UnboundLogParser();
});

// Add some sample functionality for demo purposes
window.loadSampleLog = function () {
    const sampleLog = `2024-07-02 10:15:23 [1234:0] info: unbound 1.17.1 start time
2024-07-02 10:15:23 [1234:0] info: listening on port 53
2024-07-02 10:15:24 [1234:1] info: query example.com A IN
2024-07-02 10:15:25 [1234:1] warning: validation failure for example.com A IN
2024-07-02 10:15:26 [1234:2] error: failed to contact server 8.8.8.8#53
2024-07-02 10:15:27 [1234:1] info: response for example.com A IN
2024-07-02 10:15:28 [1234:3] error: timeout for query test.com AAAA IN
2024-07-02 10:15:29 [1234:0] warning: dnssec validation failed for invalid.dnssec-failed.org
2024-07-02 10:15:30 [1234:4] debug: cache lookup for www.google.com A IN
2024-07-02 10:15:31 [1234:4] info: cached response for www.google.com A IN`;

    const parser = new UnboundLogParser();
    parser.parseLogContent(sampleLog);
    parser.showSections();
};

// Add sample URL for testing
window.loadSampleUrl = function () {
    const parser = window.unboundParser;
    if (parser) {
        parser.switchTab('url');
        parser.urlInput.value = 'https://unboundtest.com/m/CAA/test.com/JIKBAWFU';
    }
};
