// ================================
// RUMI DEBUG TOOLS
// Debug panel and testing utilities
// ================================

import monitor from '../core/performance-monitor.js';
import messageBus from '../core/message-bus.js';
import multiplier from './multiplier-calculator.js';
import session from './session-manager.js';
import genre from './genre-engine.js';

class RumiDebugTools {
    constructor() {
        // Debug panel state
        this.state = {
            isVisible: false,
            activeTab: 'performance',
            logBuffer: [],
            maxLogEntries: 1000,
            watchList: new Map(),
            breakpoints: new Set(),
            mockData: new Map()
        };

        // Initialize message bus topics
        this.topics = {
            debugLog: 'debug:log',
            debugError: 'debug:error',
            debugWatch: 'debug:watch',
            debugBreak: 'debug:break'
        };

        // Initialize performance monitoring
        monitor.setThreshold('debugUpdate', 50);

        // Subscribe to all message bus topics for logging
        this.initializeMessageLogging();
    }

    // ================================
    // DEBUG PANEL UI
    // ================================

    /**
     * Create and show debug panel
     */
    showPanel() {
        if (this.state.isVisible) return;

        // Create panel container
        const panel = document.createElement('div');
        panel.id = 'rumi-debug-panel';
        panel.className = 'debug-panel';
        panel.innerHTML = `
            <div class="debug-header">
                <h3>Rumi Debug Panel</h3>
                <div class="debug-tabs">
                    <button data-tab="performance">Performance</button>
                    <button data-tab="state">State</button>
                    <button data-tab="logs">Logs</button>
                    <button data-tab="testing">Testing</button>
                </div>
                <button class="close-btn">&times;</button>
            </div>
            <div class="debug-content">
                <div class="tab-content" data-tab="performance"></div>
                <div class="tab-content" data-tab="state"></div>
                <div class="tab-content" data-tab="logs"></div>
                <div class="tab-content" data-tab="testing"></div>
            </div>
        `;

        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            .debug-panel {
                position: fixed;
                right: 20px;
                bottom: 20px;
                width: 400px;
                height: 600px;
                background: #1e1e1e;
                color: #fff;
                border: 1px solid #333;
                border-radius: 8px;
                font-family: monospace;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            }
            .debug-header {
                padding: 10px;
                border-bottom: 1px solid #333;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .debug-header h3 {
                margin: 0;
                color: #0f0;
            }
            .debug-tabs {
                display: flex;
                gap: 5px;
            }
            .debug-tabs button {
                background: #333;
                color: #fff;
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
            }
            .debug-tabs button.active {
                background: #0f0;
                color: #000;
            }
            .debug-content {
                flex: 1;
                overflow: auto;
                padding: 10px;
            }
            .tab-content {
                display: none;
                height: 100%;
            }
            .tab-content.active {
                display: block;
            }
            .close-btn {
                position: absolute;
                right: 10px;
                top: 10px;
                background: none;
                border: none;
                color: #fff;
                font-size: 20px;
                cursor: pointer;
            }
            .log-entry {
                margin: 5px 0;
                padding: 5px;
                border-radius: 4px;
            }
            .log-entry.error { background: rgba(255,0,0,0.2); }
            .log-entry.warn { background: rgba(255,255,0,0.2); }
            .log-entry.info { background: rgba(0,255,255,0.2); }
            .state-item {
                margin: 5px 0;
                padding: 5px;
                background: #333;
                border-radius: 4px;
            }
            .test-button {
                background: #0f0;
                color: #000;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                margin: 5px;
                cursor: pointer;
            }
            .test-button:hover {
                background: #0c0;
            }
        `;

        // Add to document
        document.head.appendChild(styles);
        document.body.appendChild(panel);

        // Initialize event listeners
        this.initializePanelEvents(panel);

        // Show initial content
        this.state.isVisible = true;
        this.updatePanel();
    }

    /**
     * Initialize panel event listeners
     * @param {HTMLElement} panel Debug panel element
     */
    initializePanelEvents(panel) {
        // Tab switching
        panel.querySelectorAll('.debug-tabs button').forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Close button
        panel.querySelector('.close-btn').addEventListener('click', () => {
            this.hidePanel();
        });

        // Keyboard shortcut (Ctrl+Shift+D)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                this.togglePanel();
            }
        });
    }

    /**
     * Switch active tab
     * @param {string} tab Tab name
     */
    switchTab(tab) {
        this.state.activeTab = tab;
        this.updatePanel();
    }

    /**
     * Update panel content
     */
    updatePanel() {
        monitor.startMetric('debugUpdate');

        try {
            const panel = document.getElementById('rumi-debug-panel');
            if (!panel) return;

            // Update tab buttons
            panel.querySelectorAll('.debug-tabs button').forEach(button => {
                button.classList.toggle('active', button.dataset.tab === this.state.activeTab);
            });

            // Update content
            const content = panel.querySelector(`[data-tab="${this.state.activeTab}"]`);
            if (!content) return;

            switch (this.state.activeTab) {
                case 'performance':
                    content.innerHTML = this.renderPerformanceTab();
                    break;
                case 'state':
                    content.innerHTML = this.renderStateTab();
                    break;
                case 'logs':
                    content.innerHTML = this.renderLogsTab();
                    break;
                case 'testing':
                    content.innerHTML = this.renderTestingTab();
                    this.initializeTestButtons(content);
                    break;
            }
        } finally {
            monitor.endMetric('debugUpdate');
        }
    }

    /**
     * Hide debug panel
     */
    hidePanel() {
        const panel = document.getElementById('rumi-debug-panel');
        if (panel) {
            panel.remove();
        }
        this.state.isVisible = false;
    }

    /**
     * Toggle panel visibility
     */
    togglePanel() {
        if (this.state.isVisible) {
            this.hidePanel();
        } else {
            this.showPanel();
        }
    }

    // ================================
    // TAB RENDERERS
    // ================================

    /**
     * Render performance tab content
     * @returns {string} HTML content
     */
    renderPerformanceTab() {
        const metrics = monitor.getAllMetrics();
        return `
            <h4>Performance Metrics</h4>
            ${Object.entries(metrics).map(([name, data]) => `
                <div class="state-item">
                    <strong>${name}</strong><br>
                    Average: ${data.average.toFixed(2)}ms<br>
                    Last: ${data.last.toFixed(2)}ms<br>
                    Min: ${data.min.toFixed(2)}ms<br>
                    Max: ${data.max.toFixed(2)}ms
                </div>
            `).join('')}
        `;
    }

    /**
     * Render state tab content
     * @returns {string} HTML content
     */
    renderStateTab() {
        const states = {
            Session: session.getState(),
            Multiplier: multiplier.getState(),
            Genre: genre.getState()
        };

        return `
            <h4>Application State</h4>
            ${Object.entries(states).map(([name, state]) => `
                <div class="state-item">
                    <strong>${name}</strong><br>
                    <pre>${JSON.stringify(state, null, 2)}</pre>
                </div>
            `).join('')}
        `;
    }

    /**
     * Render logs tab content
     * @returns {string} HTML content
     */
    renderLogsTab() {
        return `
            <h4>Debug Logs</h4>
            <button class="test-button" onclick="window.rumiDebug.clearLogs()">Clear Logs</button>
            <div class="log-container">
                ${this.state.logBuffer.map(log => `
                    <div class="log-entry ${log.level}">
                        <strong>[${log.timestamp.toISOString()}] ${log.level.toUpperCase()}</strong><br>
                        ${log.message}
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Render testing tab content
     * @returns {string} HTML content
     */
    renderTestingTab() {
        return `
            <h4>Testing Tools</h4>
            <div class="test-section">
                <h5>Session Tests</h5>
                <button class="test-button" data-test="startSession">Start New Session</button>
                <button class="test-button" data-test="endSession">End Session</button>
                <button class="test-button" data-test="togglePause">Toggle Pause</button>
            </div>
            <div class="test-section">
                <h5>Multiplier Tests</h5>
                <button class="test-button" data-test="addPoints">Add Points</button>
                <button class="test-button" data-test="updateChain">Update Chain</button>
                <button class="test-button" data-test="resetMultiplier">Reset Multiplier</button>
            </div>
            <div class="test-section">
                <h5>Genre Tests</h5>
                <button class="test-button" data-test="analyzeContent">Analyze Content</button>
                <button class="test-button" data-test="getRecommendations">Get Recommendations</button>
                <button class="test-button" data-test="resetGenre">Reset Genre</button>
            </div>
            <div class="test-section">
                <h5>Mock Data</h5>
                <button class="test-button" data-test="generateMock">Generate Mock Data</button>
                <button class="test-button" data-test="clearMock">Clear Mock Data</button>
            </div>
        `;
    }

    // ================================
    // TESTING FUNCTIONS
    // ================================

    /**
     * Initialize test button handlers
     * @param {HTMLElement} container Testing tab container
     */
    initializeTestButtons(container) {
        const handlers = {
            startSession: () => {
                session.startSession({ genre: 'test' });
                this.log('Started new test session');
            },
            endSession: () => {
                session.endSession('test');
                this.log('Ended current session');
            },
            togglePause: () => {
                const isPaused = session.getState().isPaused;
                if (isPaused) {
                    session.resumeSession();
                    this.log('Resumed session');
                } else {
                    session.pauseSession();
                    this.log('Paused session');
                }
            },
            addPoints: () => {
                const points = multiplier.calculatePoints(100, { difficulty: 0.5 });
                session.updatePoints(points);
                this.log(`Added ${points} points`);
            },
            updateChain: () => {
                const newMultiplier = multiplier.updateChain(true);
                this.log(`Updated chain, new multiplier: ${newMultiplier}`);
            },
            resetMultiplier: () => {
                multiplier.reset();
                this.log('Reset multiplier');
            },
            analyzeContent: () => {
                const mockContent = this.generateMockContent();
                const results = genre.analyzeContent(mockContent);
                this.log('Content analysis results:', results);
            },
            getRecommendations: () => {
                const recommendations = genre.getRecommendations();
                this.log('Genre recommendations:', recommendations);
            },
            resetGenre: () => {
                genre.reset();
                this.log('Reset genre engine');
            },
            generateMock: () => {
                this.generateMockData();
                this.log('Generated mock data');
            },
            clearMock: () => {
                this.state.mockData.clear();
                this.log('Cleared mock data');
            }
        };

        container.querySelectorAll('[data-test]').forEach(button => {
            const handler = handlers[button.dataset.test];
            if (handler) {
                button.addEventListener('click', handler);
            }
        });
    }

    /**
     * Generate mock content for testing
     * @returns {Object} Mock content
     */
    generateMockContent() {
        return {
            text: 'Player engaged in intense combat with multiple enemies, showing strategic planning and quick reflexes.',
            actions: Array(10).fill(null).map((_, i) => ({
                type: 'combat',
                timestamp: Date.now() - (i * 1000)
            })),
            events: [
                { type: 'critical', timestamp: Date.now() },
                { type: 'major', timestamp: Date.now() - 1000 },
                { type: 'minor', timestamp: Date.now() - 2000 }
            ],
            sequence: [1, 2, 3, 1, 2, 3, 4, 5, 6]
        };
    }

    /**
     * Generate mock data for testing
     */
    generateMockData() {
        this.state.mockData.set('session', {
            duration: 3600000,
            points: 10000,
            genre: 'action'
        });

        this.state.mockData.set('multiplier', {
            base: 1.0,
            chain: 5,
            bonus: 0.5
        });

        this.state.mockData.set('genre', {
            current: 'action',
            confidence: 0.85,
            history: ['puzzle', 'action']
        });
    }

    // ================================
    // LOGGING AND MONITORING
    // ================================

    /**
     * Initialize message bus logging
     */
    initializeMessageLogging() {
        messageBus.subscribe('*', (topic, data) => {
            this.log(`Message: ${topic}`, data, 'info');
        });

        // Override console methods
        const originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error
        };

        console.log = (...args) => {
            this.log(args.join(' '), null, 'info');
            originalConsole.log.apply(console, args);
        };

        console.warn = (...args) => {
            this.log(args.join(' '), null, 'warn');
            originalConsole.warn.apply(console, args);
        };

        console.error = (...args) => {
            this.log(args.join(' '), null, 'error');
            originalConsole.error.apply(console, args);
        };
    }

    /**
     * Add log entry
     * @param {string} message Log message
     * @param {*} data Additional data
     * @param {string} level Log level
     */
    log(message, data = null, level = 'info') {
        const entry = {
            timestamp: new Date(),
            message: data ? `${message}\n${JSON.stringify(data, null, 2)}` : message,
            level
        };

        this.state.logBuffer.push(entry);

        // Trim buffer if needed
        if (this.state.logBuffer.length > this.state.maxLogEntries) {
            this.state.logBuffer = this.state.logBuffer.slice(-this.state.maxLogEntries);
        }

        // Update panel if visible
        if (this.state.isVisible && this.state.activeTab === 'logs') {
            this.updatePanel();
        }

        // Publish to message bus
        messageBus.publish(this.topics.debugLog, entry);
    }

    /**
     * Clear log buffer
     */
    clearLogs() {
        this.state.logBuffer = [];
        this.updatePanel();
    }

    // ================================
    // WATCH AND BREAKPOINTS
    // ================================

    /**
     * Add watch expression
     * @param {string} name Watch name
     * @param {Function} callback Watch callback
     */
    addWatch(name, callback) {
        this.state.watchList.set(name, callback);
    }

    /**
     * Remove watch expression
     * @param {string} name Watch name
     */
    removeWatch(name) {
        this.state.watchList.delete(name);
    }

    /**
     * Add breakpoint
     * @param {string} condition Breakpoint condition
     */
    addBreakpoint(condition) {
        this.state.breakpoints.add(condition);
    }

    /**
     * Remove breakpoint
     * @param {string} condition Breakpoint condition
     */
    removeBreakpoint(condition) {
        this.state.breakpoints.delete(condition);
    }

    /**
     * Check breakpoints
     * @param {Object} context Current context
     */
    checkBreakpoints(context) {
        this.state.breakpoints.forEach(condition => {
            try {
                if (new Function('context', `return ${condition}`)(context)) {
                    this.log(`Breakpoint hit: ${condition}`, context, 'warn');
                    debugger;
                }
            } catch (error) {
                this.log(`Breakpoint error: ${error.message}`, { condition, error }, 'error');
            }
        });
    }
}

// Create global instance
window.rumiDebug = new RumiDebugTools();

export default window.rumiDebug; 