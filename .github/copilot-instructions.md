<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Unbound Log Parser Project Instructions

This is a web-based Unbound DNS log parser built with HTML, CSS, and vanilla JavaScript. The project helps analyze Unbound DNS server logs by highlighting errors, warnings, and other important events.

## Project Structure
- `index.html` - Main HTML interface with drag-and-drop file upload
- `styles.css` - Responsive CSS styling with modern design
- `script.js` - JavaScript log parsing logic and UI interactions

## Key Features
- Drag-and-drop log file upload
- URL fetching from external sources (unboundtest.com, etc.)
- Real-time log parsing with multiple Unbound log format support
- Error/warning/info highlighting with color coding
- Search and filter functionality
- Statistics dashboard showing log summary
- Export functionality for analysis results
- CORS proxy support for cross-origin requests

## Code Guidelines
- Use modern JavaScript (ES6+) features
- Maintain responsive design principles
- Follow accessibility best practices
- Keep functions modular and well-documented
- Use semantic HTML elements
- Implement proper error handling for file operations

## Unbound Log Formats Supported
- Standard format: `timestamp [pid:thread] level: message`
- Alternative format: `timestamp level [pid:thread]: message`
- Simple format: `timestamp level: message`
- Syslog format: `Mon DD HH:MM:SS hostname unbound[pid]: level: message`

## Log Levels
- Error: Critical issues, failed operations, timeouts
- Warning: Validation failures, deprecated features, performance issues
- Info: General operational messages, queries, responses
- Debug: Detailed debugging information (optional display)

When making changes, ensure cross-browser compatibility and maintain the existing design aesthetic.
