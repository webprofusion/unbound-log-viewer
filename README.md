# Unbound Log Parser

A modern, web-based tool for parsing and analyzing Unbound DNS server logs with intelligent error detection and highlighting.

## Features

- **Drag & Drop Interface**: Simply drag your log files into the browser
- **Multiple Log Formats**: Supports various Unbound log formats including standard, syslog, and custom formats
- **Smart Parsing**: Automatically detects and categorizes log entries by severity
- **Real-time Filtering**: Filter logs by level (Error, Warning, Info, Debug)
- **Search Functionality**: Search through log entries with real-time highlighting
- **Statistics Dashboard**: View summary statistics of your log analysis
- **Export Results**: Export filtered results as JSON for further analysis
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Supported Log Formats

The parser recognizes several Unbound log formats:

1. **Standard Format**: `timestamp [pid:thread] level: message`
2. **Alternative Format**: `timestamp level [pid:thread]: message`
3. **Simple Format**: `timestamp level: message`
4. **Syslog Format**: `Mon DD HH:MM:SS hostname unbound[pid]: level: message`

## Log Levels

- **Error**: Critical issues, failed operations, timeouts, connection failures
- **Warning**: Validation failures, DNSSEC issues, performance warnings
- **Info**: General operational messages, queries, responses, status updates
- **Debug**: Detailed debugging information (hidden by default)

## Usage

1. Open `index.html` in your web browser
2. Drag and drop your Unbound log file onto the upload area, or click to browse files
3. Use the filter controls to show/hide different log levels
4. Search for specific terms using the search box
5. View statistics in the summary dashboard
6. Export results for further analysis

## Sample Log Entry

```
2024-07-02 10:15:25 [1234:1] warning: validation failure for example.com A IN
2024-07-02 10:15:26 [1234:2] error: failed to contact server 8.8.8.8#53
2024-07-02 10:15:27 [1234:1] info: response for example.com A IN
```

## Development

This is a client-side application built with:
- HTML5 for structure
- CSS3 with modern features (Grid, Flexbox, Animations)
- Vanilla JavaScript (ES6+) for functionality

No server or build process required - simply open the HTML file in a modern web browser.

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## File Structure

```
UnboundLogView/
├── index.html          # Main application interface
├── styles.css          # Styling and responsive design
├── script.js           # Log parsing and UI logic
├── README.md           # This file
└── .github/
    └── copilot-instructions.md  # Development guidelines
```

## Contributing

When contributing to this project:
1. Maintain the existing code style and structure
2. Test with various Unbound log formats
3. Ensure responsive design principles are followed
4. Update documentation for new features

## License

This project is open source and available under the MIT License.
