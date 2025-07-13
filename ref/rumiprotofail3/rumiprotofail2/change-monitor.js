// ================================
// CHANGE MONITORING AGENT
// Protects against breaking changes during modifications
// ================================

window.ChangeMonitor = {
    // Current state snapshot
    baselineState: {},
    
    // Critical functions and their signatures
    criticalFunctions: {},
    
    // UI element selectors that must remain functional
    criticalUIElements: {},
    
    // Performance benchmarks
    performanceBaseline: {},
    
    // Error tracking
    errorLog: [],
    
    // Change validation rules
    validationRules: {},

    // ================================
    // INITIALIZATION
    // ================================
    
    initialize() {
        console.log('🛡️ CHANGE MONITOR: Initializing change monitoring agent...');
        
        // Check if we're on the genre channel page - disable if so
        if (document.title.includes('Genre Channel') || window.location.pathname.includes('Genre-channel')) {
            console.log('🛡️ CHANGE MONITOR: Genre channel page detected - disabling monitor');
            this.isDisabled = true;
            return;
        }

        // ======================================
        // ENSURE CRITICAL GLOBAL FUNCTIONS EXIST
        // Auto-create lightweight stubs so that
        // Change-Monitor doesn't spam warnings
        // and other modules can safely call them
        // without triggering runtime errors.
        // The real implementations should overwrite
        // these stubs when they become available.
        // ======================================

        [
            'startSession',
            'endSession',
            'calculatePoints',
            'processCurrentContentWithLudicrous',
            'showSessionReceipt',
            'showReceiptView',
            'initializeCSVBuckets',
            'getContentId',
            'isDuplicateContent'
        ].forEach(fnName => {
            if (typeof window[fnName] !== 'function') {
                window[fnName] = function stubbedFunction() {
                    console.warn(`⚠️ Stub function "${fnName}" called – no real implementation yet.`);
                    return undefined;
                };
            }
        });

        // --------------------------------------------------
        // Install global debug shortcuts (once per session)
        // --------------------------------------------------
        if (!window.__RUMI_DEBUG_SHORTCUTS_INSTALLED) {
            window.__RUMI_DEBUG_SHORTCUTS_INSTALLED = true;
            document.addEventListener('keydown', (e) => {
                // Ignore typing inside form fields / editable areas
                const t = e.target;
                if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;

                if (!e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;

                switch (e.key.toLowerCase()) {
                    case 't': // Shift+T – Toggle Turbo
                        window.toggleTurboMode?.();
                        break;
                    case 's': // Shift+S – Skip current block
                        window.skipCurrent?.();
                        break;
                    case 'f': // Shift+F – +5 min
                        window.advanceSession?.(300);
                        break;
                    case 'g': // Shift+G – +20 min
                        window.advanceSession?.(1200);
                        break;
                    case 'r': // Shift+R – Return / reset view
                        window.returnToEntryPoint?.();
                        break;
                    default:
                        return; // Unhandled shortcut
                }

                e.preventDefault();
            });
            console.log('⌨️ CHANGE MONITOR: Debug keyboard shortcuts installed (Shift+T/S/F/G/R)');
        }

        // --------------------------------------------------
        // Auto receipt / Nokia sync helper
        // --------------------------------------------------
        if (!window.__RUMI_AUTO_RECEIPT_HELPER) {
            window.__RUMI_AUTO_RECEIPT_HELPER = true;

            const indexedSet = new Set();

            function handleIndexed(title) {
                if (!title || indexedSet.has(title)) return;
                indexedSet.add(title);

                window.appState.indexedContent = window.appState.indexedContent || [];
                if (!window.appState.indexedContent.some(i => i.title === title)) {
                    window.appState.indexedContent.push({ title });
                }

                const total = (window.appState.automodeContentItems || []).length;
                if (total && indexedSet.size >= total) {
                    console.log('📑 AUTO-RECEIPT: All content indexed – calling completeSession()');
                    if (typeof window.completeSession === 'function') {
                        window.completeSession();
                    }
                }
            }

            // Listen to postMessage updates from channel frames
            window.addEventListener('message', (evt) => {
                const d = evt.data;
                if (d && d.type === 'rumi:updateBlockState' && d.payload?.state === 'indexed') {
                    handleIndexed(d.payload.title);
                }
            });

            // Hook into updateBlockStateUI in case blocks are updated internally
            const origUpdate = window.updateBlockStateUI;
            if (typeof origUpdate === 'function') {
                window.updateBlockStateUI = function(t, s) {
                    if (s === 'indexed') handleIndexed(t);
                    return origUpdate.apply(this, arguments);
                };
            }

            console.log('🧮 CHANGE MONITOR: Auto-receipt helper installed');
        }

        // --------------------------------------------------
        // Handle sessionComplete from genre channel
        // --------------------------------------------------
        if (!window.__RUMI_SESSION_COMPLETE_MONITOR) {
            window.__RUMI_SESSION_COMPLETE_MONITOR = true;
            window.addEventListener('message', (evt) => {
                if (!evt.data || evt.data.type !== 'sessionComplete') return;
                const payload = evt.data.payload || {};
                console.log('🛡️ CHANGE MONITOR: sessionComplete received', payload);

                const { indexedContent = [] } = payload;
                if (Array.isArray(indexedContent) && indexedContent.length) {
                    window.appState.indexedContent = indexedContent;
                }

                window.appState.sessionCompleted = true;

                if (typeof window.stopPointsEarning === 'function') window.stopPointsEarning();

                const durSec = (Date.now() - (window.appState.indexingStartTime || Date.now()))/1000;
                const earnings = window.appState.sessionEarnings || 0;
                const mult = window.appState.currentMultiplier || 1;
                if (typeof window.showReceipt === 'function') {
                    window.showReceipt(earnings, durSec, mult);
                }
            });
        }

        this.captureBaselineState();
        this.defineCriticalFunctions();
        this.defineCriticalUIElements();
        this.setupValidationRules();
        this.startMonitoring();
        
        console.log('✅ CHANGE MONITOR: Monitoring agent active');

        // ==================================================
        // RUMI CHANNEL MANAGER & DEBUG HIJACK
        // ==================================================
        if (!window.RumiChannelManager) {
            console.log('🛡️ CHANGE MONITOR: Initializing Rumi Channel Manager...');
            
            const CHANNEL_SRC = 'genre-channel-optimized.html';

            const RumiChannelManager = {
                iframe: null,
                isReady: false,
                pendingMessages: [],

                initialize: function() {
                    document.addEventListener('DOMContentLoaded', () => {
                        this.iframe = document.querySelector(`iframe[src*="${CHANNEL_SRC}"]`);
                        if (!this.iframe) {
                            this.iframe = document.querySelector('iframe');
                        }

                        if (this.iframe) {
                             if (!this.iframe.src.includes(CHANNEL_SRC)) {
                                this.iframe.src = CHANNEL_SRC;
                            }
                            console.log('🛡️ RCM: Attached to iframe:', this.iframe);
                        } else {
                            console.error('🛡️ RCM: FATAL - Could not find the genre channel iframe.');
                            return;
                        }

                        window.addEventListener('message', this.handleMessage.bind(this));
                        this.wireDebugControls();
                    });
                },

                handleMessage: function(event) {
                    // Only listen for messages from our specific channel iframe
                    if (event.source !== this.iframe.contentWindow) return;

                    if (event.data?.type === 'genreChannelReady') {
                        console.log('🛡️ RCM: Channel is ready. Processing pending messages.');
                        this.isReady = true;
                        this.sendPendingMessages();
                    }
                },

                sendMessage: function(message) {
                    if (this.isReady && this.iframe && this.iframe.contentWindow) {
                        this.iframe.contentWindow.postMessage(message, '*');
                    } else {
                        this.pendingMessages.push(message);
                    }
                },

                sendPendingMessages: function() {
                    while (this.pendingMessages.length > 0) {
                        const message = this.pendingMessages.shift();
                        this.sendMessage(message);
                    }
                },

                wireDebugControls: function() {
                    console.log('🛡️ RCM: Wiring up debug controls...');
                    const advanceChannelTime = (seconds) => {
                        this.sendMessage({ type: 'rumi:advanceTime', seconds: seconds });
                    };

                    const skipChannelBlock = () => {
                        const currentIndex = window.appState?.currentContentIndex ?? 0;
                        this.sendMessage({ type: 'rumi:setIndex', index: currentIndex + 1 });
                    };

                    document.querySelectorAll('#turbo-skip-controls [data-skip]').forEach(btn => {
                        const secondsToSkip = parseInt(btn.dataset.skip, 10) * 60;
                        const newBtn = btn.cloneNode(true);
                        btn.parentNode.replaceChild(newBtn, btn);
                        newBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            advanceChannelTime(secondsToSkip);
                        });
                    });

                    const skipBlockBtn = document.getElementById('skip-block');
                    if (skipBlockBtn) {
                        const newSkipBtn = skipBlockBtn.cloneNode(true);
                        skipBlockBtn.parentNode.replaceChild(newSkipBtn, skipBlockBtn);
                        newSkipBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            skipChannelBlock();
                        });
                    }
                    console.log('🛡️ RCM: ✅ Debug controls wired.');
                }
            };

            RumiChannelManager.initialize();
            window.RumiChannelManager = RumiChannelManager;
        }

        // ==================================================
        // END RUMI CHANNEL MANAGER
        // ==================================================
    },

    // ================================
    // BASELINE CAPTURE
    // ================================
    
    captureBaselineState() {
        console.log('📸 CHANGE MONITOR: Capturing baseline state...');
        
        // Capture app state
        this.baselineState.appState = {
            isIndexing: window.appState?.isIndexing || false,
            currentMultiplier: window.appState?.currentMultiplier || 1.0,
            sessionDuration: window.appState?.sessionDuration || 45,
            baseRate: window.appState?.baseRate || 0.1,
            automodeContentItems: window.appState?.automodeContentItems || [],
            currentContentIndex: window.appState?.currentContentIndex || 0
        };
        
        // Capture critical global objects
        this.baselineState.globals = {
            hasLudicrousSpeedManager: !!window.LudicrousSpeedManager,
            hasRumiIntegration: !!window.RumiIntegration,
            hasRumiBackend: !!window.RumiBackend,
            hasContentBlockStateManager: !!window.ContentBlockStateManager
        };
        
        // Capture UI state
        this.baselineState.ui = {
            channelFrames: {
                main: !!document.getElementById('channel-frame'),
                indexing: !!document.getElementById('channel-frame-indexing')
            },
            criticalButtons: {
                automode: !!document.querySelector('.automode-button'),
                streamDetector: !!document.querySelector('.stream-detector'),
                settings: !!document.querySelector('.settings-button')
            }
        };
        
        // Capture performance baseline
        this.performanceBaseline = {
            timestamp: Date.now(),
            memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 0
        };
        
        console.log('📸 CHANGE MONITOR: Baseline captured:', this.baselineState);
    },

    // ================================
    // CRITICAL FUNCTION DEFINITIONS
    // ================================
    
    defineCriticalFunctions() {
        this.criticalFunctions = {
            // Core session functions
            startSession: {
                required: true,
                signature: 'function',
                dependencies: ['appState']
            },
            endSession: {
                required: true,
                signature: 'function',
                dependencies: ['appState']
            },
            completeSession: {
                required: true,
                signature: 'function',
                dependencies: ['appState', 'showSessionReceipt']
            },
            
            // Points calculation
            calculatePoints: {
                required: true,
                signature: 'function',
                dependencies: ['appState']
            },
            
            // Content processing
            processCurrentContentWithLudicrous: {
                required: true,
                signature: 'function',
                dependencies: ['LudicrousSpeedManager', 'appState']
            },
            
            // UI functions
            showSessionReceipt: {
                required: true,
                signature: 'function',
                dependencies: []
            },
            showReceiptView: {
                required: true,
                signature: 'function',
                dependencies: []
            },
            
            // Integration functions
            initializeCSVBuckets: {
                required: true,
                signature: 'function',
                dependencies: []
            },

            // New functions
            getContentId: () => typeof window.getContentId === 'function',
            isDuplicateContent: () => typeof window.isDuplicateContent === 'function'
        };
    },

    // ================================
    // CRITICAL UI ELEMENTS
    // ================================
    
    defineCriticalUIElements() {
        this.criticalUIElements = {
            // Main containers
            simulationContainer: '.simulation-container',
            entryPointPanel: '.entry-point-panel',
            holisticPanel: '.holistic-panel',
            
            // Critical buttons
            automodeButton: '.automode-button',
            streamDetector: '.stream-detector',
            settingsButton: '.settings-button',
            
            // Channel frames
            channelFrame: '#channel-frame',
            channelFrameIndexing: '#channel-frame-indexing',
            
            // Status displays
            holisticShowInfo: '#holistic-show-info',
            holisticAnimation: '#holistic-animation',
            holisticProgress: '#holistic-progress',
            
            // Message areas
            messageArea: '.message-area',
            
            // Points display
            pointsTotal: '.points-total',
            pointsPending: '.points-pending'
        };
    },

    // ================================
    // VALIDATION RULES
    // ================================
    
    setupValidationRules() {
        this.validationRules = {
            // Function existence rules
            functions: {
                required: ['startSession', 'endSession', 'calculatePoints', 'processCurrentContentWithLudicrous'],
                optional: ['showSessionReceipt', 'showReceiptView', 'initializeCSVBuckets']
            },
            
            // UI element rules
            ui: {
                required: ['.simulation-container', '.entry-point-panel', '.automode-button', '.stream-detector'],
                optional: ['.settings-button', '.holistic-panel']
            },
            
            // State consistency rules
            state: {
                multiplierRange: { min: 0.1, max: 10.0 },
                sessionDurationRange: { min: 1, max: 120 },
                baseRateRange: { min: 0.01, max: 1.0 }
            },
            
            // Performance thresholds
            performance: {
                maxMemoryIncrease: 50 * 1024 * 1024, // 50MB
                maxFunctionCallTime: 1000, // 1 second
                maxUIUpdateTime: 100 // 100ms
            }
        };
    },

    // ================================
    // MONITORING SYSTEM
    // ================================
    
    startMonitoring() {
        // Monitor function calls
        this.monitorFunctionCalls();
        
        // Monitor UI changes
        this.monitorUIChanges();
        
        // Monitor state changes
        this.monitorStateChanges();
        
        // Monitor performance
        this.monitorPerformance();
        
        // Monitor errors
        this.monitorErrors();
        
        console.log('👁️ CHANGE MONITOR: All monitoring systems active');
    },

    monitorFunctionCalls() {
        // Wrap critical functions to monitor their execution
        Object.keys(this.criticalFunctions).forEach(funcName => {
            if (window[funcName] && typeof window[funcName] === 'function') {
                const original = window[funcName];
                window[funcName] = (...args) => {
                    const startTime = performance.now();
                    try {
                        const result = original.apply(this, args);
                        const endTime = performance.now();
                        
                        this.logFunctionCall(funcName, endTime - startTime, 'success');
                        return result;
                    } catch (error) {
                        const endTime = performance.now();
                        this.logFunctionCall(funcName, endTime - startTime, 'error', error);
                        throw error;
                    }
                };
            }
        });

        // Check for missing functions
        Object.keys(this.criticalFunctions).forEach(funcName => {
            if (typeof window[funcName] !== 'function') {
                console.warn(`⚠️ change-monitor: ${funcName} function is missing!`);
            }
        });
    },

    monitorUIChanges() {
        if (this.isDisabled) return;
        
        // Monitor DOM changes for critical elements
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    this.checkUIElementIntegrity();
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    },

    monitorStateChanges() {
        // Monitor appState changes
        if (window.appState) {
            const originalAppState = window.appState;
            
            window.appState = new Proxy(originalAppState, {
                set: (target, prop, value) => {
                    const oldValue = target[prop];
                    target[prop] = value;
                    
                    this.validateStateChange(prop, oldValue, value);
                    return true;
                }
            });
        }
    },

    monitorPerformance() {
        // Periodic performance checks
        setInterval(() => {
            this.checkPerformance();
        }, 5000); // Every 5 seconds
    },

    monitorErrors() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.logError('JavaScript Error', event.error);
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', event.reason);
        });
    },

    // ================================
    // VALIDATION METHODS
    // ================================
    
    validateStateChange(property, oldValue, newValue) {
        const rules = this.validationRules.state;
        
        switch (property) {
            case 'currentMultiplier':
                if (newValue < rules.multiplierRange.min || newValue > rules.multiplierRange.max) {
                    this.logWarning(`Multiplier out of range: ${newValue}`, {
                        property,
                        oldValue,
                        newValue,
                        range: rules.multiplierRange
                    });
                }
                break;
                
            case 'sessionDuration':
                if (newValue < rules.sessionDurationRange.min || newValue > rules.sessionDurationRange.max) {
                    this.logWarning(`Session duration out of range: ${newValue}`, {
                        property,
                        oldValue,
                        newValue,
                        range: rules.sessionDurationRange
                    });
                }
                break;
                
            case 'baseRate':
                if (newValue < rules.baseRateRange.min || newValue > rules.baseRateRange.max) {
                    this.logWarning(`Base rate out of range: ${newValue}`, {
                        property,
                        oldValue,
                        newValue,
                        range: rules.baseRateRange
                    });
                }
                break;
        }
    },

    checkUIElementIntegrity() {
        if (this.isDisabled) return;
        
        const required = this.validationRules.ui.required;
        const missing = [];
        
        required.forEach(selector => {
            if (!document.querySelector(selector)) {
                missing.push(selector);
            }
        });
        
        if (missing.length > 0) {
            this.logError('Critical UI elements missing', { missing });
        }
    },

    checkPerformance() {
        const currentMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        const memoryIncrease = currentMemory - this.performanceBaseline.memoryUsage;
        
        if (memoryIncrease > this.validationRules.performance.maxMemoryIncrease) {
            this.logWarning('Memory usage increased significantly', {
                increase: memoryIncrease,
                threshold: this.validationRules.performance.maxMemoryIncrease
            });
        }
    },

    // ================================
    // LOGGING METHODS
    // ================================
    
    logFunctionCall(funcName, duration, status, error = null) {
        if (this.isDisabled) return;
        
        const logEntry = {
            timestamp: Date.now(),
            type: 'function_call',
            function: funcName,
            duration,
            status,
            error: error?.message
        };
        
        this.errorLog.push(logEntry);
        
        if (status === 'error' || duration > this.validationRules.performance.maxFunctionCallTime) {
            console.warn('⚠️ CHANGE MONITOR:', logEntry);
        }
    },

    logError(message, details) {
        if (this.isDisabled) return;
        
        const logEntry = {
            timestamp: Date.now(),
            type: 'error',
            message,
            details
        };
        
        this.errorLog.push(logEntry);
        console.error('❌ CHANGE MONITOR:', logEntry);
    },

    logWarning(message, details) {
        if (this.isDisabled) return;
        
        const logEntry = {
            timestamp: Date.now(),
            type: 'warning',
            message,
            details
        };
        
        this.errorLog.push(logEntry);
        console.warn('⚠️ CHANGE MONITOR:', logEntry);
    },

    // ================================
    // VALIDATION REPORTS
    // ================================
    
    generateValidationReport() {
        const report = {
            timestamp: Date.now(),
            baselineState: this.baselineState,
            currentState: this.captureCurrentState(),
            errors: this.errorLog.filter(log => log.type === 'error'),
            warnings: this.errorLog.filter(log => log.type === 'warning'),
            performance: this.getPerformanceMetrics(),
            recommendations: this.generateRecommendations()
        };
        
        console.log('📊 CHANGE MONITOR: Validation Report', report);
        return report;
    },

    captureCurrentState() {
        return {
            appState: {
                isIndexing: window.appState?.isIndexing || false,
                currentMultiplier: window.appState?.currentMultiplier || 1.0,
                sessionDuration: window.appState?.sessionDuration || 45,
                baseRate: window.appState?.baseRate || 0.1
            },
            globals: {
                hasLudicrousSpeedManager: !!window.LudicrousSpeedManager,
                hasRumiIntegration: !!window.RumiIntegration,
                hasRumiBackend: !!window.RumiBackend
            },
            ui: {
                channelFrames: {
                    main: !!document.getElementById('channel-frame'),
                    indexing: !!document.getElementById('channel-frame-indexing')
                }
            }
        };
    },

    getPerformanceMetrics() {
        return {
            memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 0,
            errorCount: this.errorLog.filter(log => log.type === 'error').length,
            warningCount: this.errorLog.filter(log => log.type === 'warning').length,
            functionCallCount: this.errorLog.filter(log => log.type === 'function_call').length
        };
    },

    generateRecommendations() {
        const recommendations = [];
        
        // Check for missing critical functions
        Object.keys(this.criticalFunctions).forEach(funcName => {
            if (!window[funcName]) {
                recommendations.push(`Missing critical function: ${funcName}`);
            }
        });
        
        // Check for performance issues
        const slowCalls = this.errorLog.filter(log => 
            log.type === 'function_call' && log.duration > this.validationRules.performance.maxFunctionCallTime
        );
        
        if (slowCalls.length > 0) {
            recommendations.push(`Found ${slowCalls.length} slow function calls`);
        }
        
        // Check for UI issues
        const missingUI = this.validationRules.ui.required.filter(selector => 
            !document.querySelector(selector)
        );
        
        if (missingUI.length > 0) {
            recommendations.push(`Missing UI elements: ${missingUI.join(', ')}`);
        }
        
        return recommendations;
    },

    // ================================
    // UTILITY METHODS
    // ================================
    
    isSystemHealthy() {
        const report = this.generateValidationReport();
        return report.errors.length === 0 && report.recommendations.length === 0;
    },

    getErrorSummary() {
        const errors = this.errorLog.filter(log => log.type === 'error');
        const warnings = this.errorLog.filter(log => log.type === 'warning');
        
        return {
            totalErrors: errors.length,
            totalWarnings: warnings.length,
            recentErrors: errors.slice(-5),
            recentWarnings: warnings.slice(-5)
        };
    },

    clearLogs() {
        this.errorLog = [];
        console.log('🧹 CHANGE MONITOR: Logs cleared');
    },

    // Get status for consistency with other agents
    getStatus() {
        return {
            isActive: true, // Change monitor is always active when loaded
            recentIssues: this.errorLog.slice(-5),
            errorCount: this.errorLog.filter(log => log.type === 'error').length,
            warningCount: this.errorLog.filter(log => log.type === 'warning').length,
            systemHealthy: this.isSystemHealthy()
        };
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ChangeMonitor.initialize();
    });
} else {
    window.ChangeMonitor.initialize();
}

// Also expose as lowercase for consistency with other agents
window.changeMonitor = window.ChangeMonitor;

console.log('🛡️ CHANGE MONITOR: Agent loaded and ready'); 