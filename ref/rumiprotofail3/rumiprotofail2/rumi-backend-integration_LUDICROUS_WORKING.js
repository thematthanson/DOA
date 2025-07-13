// ================================
// RUMI BACKEND INTEGRATION SHIM
// Seamlessly replaces frontend calculations with backend engine
// Zero UI changes - maintains exact same behavior
// ================================

window.RumiIntegration = {
    // Track if backend is ready
    backendReady: false,
    
    // Original functions backup (for fallback)
    originalFunctions: {},

    // Ludicrous Mode integration
    ludicrousMode: {
        isActive: false,
        speedMultiplier: 300,
        originalTimerInterval: null,
        originalProgressInterval: null,
        acceleratedSessionTime: 0,
        lastUpdateTime: null
    },

    // Track if transition system has been hooked
    transitionSystemHooked: false,

    // ================================
    // INITIALIZATION
    // ================================
    
    async initialize() {
        console.log('🔗 INTEGRATION: Initializing backend integration...');
        
        // Wait for backend to be available
        if (!window.RumiBackend) {
            console.warn('⚠️ INTEGRATION: Backend not loaded yet, retrying...');
            setTimeout(() => this.initialize(), 100);
            return;
        }
        
        // Wait for content library to load
        let attempts = 0;
        while (window.RumiBackend.contentLibrary.length === 0 && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (window.RumiBackend.contentLibrary.length === 0) {
            console.warn('⚠️ INTEGRATION: Content library not loaded, proceeding with fallback');
        }
        
        this.backendReady = true;
        this.hookIntoFrontend();
        this.fixTimelinePopup();
        this.hookLudicrousMode();
        this.hookOptimizedGenreChannel();
        
        console.log('✅ INTEGRATION: Backend integration complete');
    },

    // ================================
    // LUDICROUS MODE INTEGRATION
    // ================================
    
    hookLudicrousMode() {
        console.log('🚀 INTEGRATION: Hooking into Ludicrous Mode...');
        
        // Hook into LudicrousSpeedManager
        if (window.LudicrousSpeedManager) {
            this.hookLudicrousSpeedManager();
        } else {
            // Wait for LudicrousSpeedManager to be available
            setTimeout(() => this.hookLudicrousMode(), 500);
        }
        
        // Hook into timer and progress systems
        this.hookTimerAcceleration();
        this.hookProgressAcceleration();
        this.hookPointsAcceleration();
        
        // Hook into animation panel updates
        this.hookAnimationPanel();
    },

    hookLudicrousSpeedManager() {
        const originalActivate = window.LudicrousSpeedManager.activate;
        const originalDeactivate = window.LudicrousSpeedManager.deactivate;
        
        window.LudicrousSpeedManager.activate = () => {
            console.log('🚀 INTEGRATION: Ludicrous Mode activated - accelerating backend systems');
            this.ludicrousMode.isActive = true;
            this.ludicrousMode.lastUpdateTime = Date.now();
            this.accelerateBackendSystems();
            return originalActivate.call(window.LudicrousSpeedManager);
        };
        
        window.LudicrousSpeedManager.deactivate = () => {
            console.log('🛑 INTEGRATION: Ludicrous Mode deactivated - restoring normal speed');
            this.ludicrousMode.isActive = false;
            this.restoreNormalSpeed();
            return originalDeactivate.call(window.LudicrousSpeedManager);
        };
        
        console.log('✅ INTEGRATION: LudicrousSpeedManager hooks installed');
    },

    accelerateBackendSystems() {
        // Initialize session state for Ludicrous Mode
        this.initializeLudicrousSession();
        
        // Accelerate timer updates
        this.accelerateTimer();
        
        // Accelerate progress bar updates
        this.accelerateProgressBar();
        
        // Accelerate points earning
        this.acceleratePointsEarning();
        
        console.log('⚡ INTEGRATION: All backend systems accelerated to 300x speed');
    },

    initializeLudicrousSession() {
        // Initialize session state for Ludicrous Mode
        if (window.appState) {
            // Set initial session duration if not already set
            if (window.appState.sessionDuration === undefined) {
                window.appState.sessionDuration = 0;
            }
            
            // Initialize multiplier tracking
            if (window.appState.currentMultiplier === undefined) {
                window.appState.currentMultiplier = 1.0;
            }
            
            // Initialize session earnings tracking
            if (window.appState.sessionEarnings === undefined) {
                window.appState.sessionEarnings = 0;
            }
            
            // Set initial accelerated time
            this.ludicrousMode.acceleratedSessionTime = 0;
            this.ludicrousMode.lastUpdateTime = Date.now();
            
            console.log('🚀 INTEGRATION: Ludicrous session initialized');
            console.log(`   Initial multiplier: ${window.appState.currentMultiplier}x`);
            console.log(`   Speed multiplier: ${this.ludicrousMode.speedMultiplier}x`);
        }
    },

    restoreNormalSpeed() {
        // Restore normal timer speed
        if (this.ludicrousMode.originalTimerInterval) {
            clearInterval(this.ludicrousMode.originalTimerInterval);
            this.ludicrousMode.originalTimerInterval = null;
        }
        
        // Restore normal progress speed
        if (this.ludicrousMode.originalProgressInterval) {
            clearInterval(this.ludicrousMode.originalProgressInterval);
            this.ludicrousMode.originalProgressInterval = null;
        }
        
        // Restore original timers
        this.restoreOriginalTimers();
        
        // Remove Ludicrous Mode visual indicators
        this.removeLudicrousVisualIndicators();
        
        console.log('🐌 INTEGRATION: Backend systems restored to normal speed');
    },

    restoreOriginalTimers() {
        // Restart original point accrual if it was stopped
        if (window.appState && window.appState.isIndexing && !window.pointAccrualInterval) {
            // Restart the original point accrual system
            if (typeof startPointsEarning === 'function') {
                startPointsEarning();
                console.log('🚀 INTEGRATION: Restored original point accrual system');
            }
        }
        
        // Restart original animation updates if needed
        if (window.appState && window.appState.isIndexing && !window.animationUpdateInterval) {
            // Restart the original animation system
            if (typeof updateAnimationPanel === 'function') {
                const elapsedTime = (Date.now() - window.appState.indexingStartTime) / 1000;
                updateAnimationPanel(elapsedTime);
                console.log('🚀 INTEGRATION: Restored original animation system');
            }
        }
    },

    removeLudicrousVisualIndicators() {
        // Remove yellow color from progress bars
        const progressBars = document.querySelectorAll('.progress-bar, .horizontal-progress-bar-fill, #indexing-progress-bar');
        progressBars.forEach(bar => {
            bar.style.backgroundColor = '';
            bar.style.boxShadow = '';
        });
        
        // Remove yellow color from timer displays
        const timerElements = document.querySelectorAll('[id*="timer"], [class*="timer"], [id*="time"], [class*="time"]');
        timerElements.forEach(element => {
            element.style.color = '';
            element.style.textShadow = '';
        });
        
        // Remove Ludicrous Mode status displays
        const statusElements = document.querySelectorAll('[id*="ludicrous"], [class*="ludicrous"]');
        statusElements.forEach(element => {
            if (element.textContent.includes('LUDICROUS MODE ACTIVE')) {
                element.textContent = 'NORMAL MODE';
                element.style.color = '';
                element.style.textShadow = '';
            }
        });
    },

    accelerateTimer() {
        // Override existing timer intervals to prevent conflicts
        this.overrideExistingTimers();
        
        // Find and accelerate the main timer interval
        if (window.appState && window.appState.isIndexing) {
            // Accelerate session time updates
            this.ludicrousMode.originalTimerInterval = setInterval(() => {
                if (this.ludicrousMode.isActive && window.appState) {
                    // Accelerate session time by 300x
                    const now = Date.now();
                    const realElapsed = (now - this.ludicrousMode.lastUpdateTime) / 1000;
                    const acceleratedElapsed = realElapsed * this.ludicrousMode.speedMultiplier;
                    
                    this.ludicrousMode.acceleratedSessionTime += acceleratedElapsed;
                    this.ludicrousMode.lastUpdateTime = now;
                    
                    // Update session duration with accelerated time
                    if (window.appState.sessionDuration === undefined) {
                        window.appState.sessionDuration = 0;
                    }
                    window.appState.sessionDuration = this.ludicrousMode.acceleratedSessionTime;
                    
                    // Accelerate points earning with multiplier
                    this.acceleratePointsEarning();
                    
                    // Update content progression
                    this.updateContentProgression(acceleratedElapsed);
                    
                    // Update visual elements
                    this.updateVisualElements(acceleratedElapsed);
                }
            }, 100); // Update every 100ms for smooth acceleration
        }
    },

    overrideExistingTimers() {
        // Override existing point accrual interval to prevent conflicts
        if (window.pointAccrualInterval) {
            clearInterval(window.pointAccrualInterval);
            console.log('🚀 INTEGRATION: Overridden existing point accrual interval');
        }
        
        // Override existing indexing timer interval
        if (window.indexingTimerInterval) {
            clearInterval(window.indexingTimerInterval);
            console.log('🚀 INTEGRATION: Overridden existing indexing timer interval');
        }
        
        // Override existing animation update interval
        if (window.animationUpdateInterval) {
            clearInterval(window.animationUpdateInterval);
            console.log('🚀 INTEGRATION: Overridden existing animation update interval');
        }
    },

    updateVisualElements(acceleratedElapsed) {
        // Update progress bars with accelerated progress
        this.updateProgressBars();
        
        // Update content progression with accelerated time
        this.updateContentProgression(acceleratedElapsed);
        
        // Update timer displays with accelerated time
        this.updateTimerDisplays();
    },

    updateProgressBars() {
        // Update vertical progress bar
        const progressBarElement = document.getElementById('indexing-progress-bar');
        if (progressBarElement && window.appState) {
            const totalDuration = window.appState.totalSessionDuration || 60; // Default 60 minutes
            const currentDuration = window.appState.sessionDuration || 0;
            const progress = Math.min((currentDuration / totalDuration) * 100, 100);
            progressBarElement.style.width = `${progress}%`;
            
            // Add Ludicrous Mode visual indicator
            if (this.ludicrousMode.isActive) {
                progressBarElement.style.backgroundColor = '#ffff00';
                progressBarElement.style.boxShadow = '0 0 10px #ffff00';
            }
        }
        
        // Update horizontal progress bar
        const horizontalProgressBar = document.querySelector('.horizontal-progress-bar-fill');
        if (horizontalProgressBar && window.appState) {
            const totalDuration = window.appState.totalSessionDuration || 60;
            const currentDuration = window.appState.sessionDuration || 0;
            const progress = Math.min((currentDuration / totalDuration) * 100, 100);
            horizontalProgressBar.style.width = `${progress}%`;
            
            // Add Ludicrous Mode visual indicator
            if (this.ludicrousMode.isActive) {
                horizontalProgressBar.style.backgroundColor = '#ffff00';
                horizontalProgressBar.style.boxShadow = '0 0 10px #ffff00';
            }
        }
    },

    updateContentProgression(acceleratedElapsed) {
        // Update content index based on accelerated time
        if (window.appState && window.appState.automodeContentItems) {
            const currentTime = window.appState.sessionDuration || 0;
            
            // Calculate which content item should be active
            let cumulativeTime = 0;
            let targetIndex = 0;
            
            for (let i = 0; i < window.appState.automodeContentItems.length; i++) {
                const item = window.appState.automodeContentItems[i];
                let itemDuration = 0;
                
                // Handle different duration formats
                if (typeof item.duration === 'number') {
                    itemDuration = item.duration / 60; // Convert seconds to minutes
                } else if (typeof item.duration === 'string' && item.duration.includes(':')) {
                    const parts = item.duration.split(':');
                    itemDuration = parseInt(parts[0]) + (parseInt(parts[1]) / 60);
                } else {
                    itemDuration = 1; // Default 1 minute if duration is unknown
                }
                
                if (currentTime >= cumulativeTime && currentTime < cumulativeTime + itemDuration) {
                    targetIndex = i;
                    break;
                }
                cumulativeTime += itemDuration;
            }
            
            // Update content index if it has changed
            if (window.appState.currentContentIndex !== targetIndex) {
                window.appState.currentContentIndex = targetIndex;
                const currentItem = window.appState.automodeContentItems[targetIndex];
                console.log(`🚀 INTEGRATION: Content progression accelerated - Index: ${targetIndex}, Content: ${currentItem?.title}, Time: ${currentTime.toFixed(1)}min`);
                
                // Trigger content transition
                this.triggerContentTransition(targetIndex);
            }
        }
    },

    triggerContentTransition(newIndex) {
        // Update learning text for new content
        if (window.updateAutomodeProgressText && window.appState.automodeContentItems) {
            const currentItem = window.appState.automodeContentItems[newIndex];
            if (currentItem) {
                const learningText = `${currentItem.title} learning content analysis`;
                window.updateAutomodeProgressText(learningText);
                console.log(`🚀 INTEGRATION: Content transition - ${currentItem.title}`);
            }
        }
        
        // Update animation panel with new content
        if (window.updateAnimationPanel) {
            const elapsedTime = window.appState.sessionDuration * 60; // Convert to seconds
            window.updateAnimationPanel(elapsedTime);
        }
    },

    updateTimerDisplays() {
        // Update any timer display elements
        const timerElements = document.querySelectorAll('[id*="timer"], [class*="timer"], [id*="time"], [class*="time"]');
        timerElements.forEach(element => {
            if (element.textContent.includes(':') || element.textContent.includes('min')) {
                const currentTime = window.appState.sessionDuration || 0;
                const minutes = Math.floor(currentTime);
                const seconds = Math.floor((currentTime - minutes) * 60);
                const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                
                // Only update if it's a time display
                if (element.textContent.match(/\d+:\d+/)) {
                    element.textContent = timeString;
                    
                    // Add Ludicrous Mode indicator
                    if (this.ludicrousMode.isActive) {
                        element.style.color = '#ffff00';
                        element.style.textShadow = '0 0 5px #ffff00';
                    }
                }
            }
        });
    },

    updateAcceleratedPointsDisplay() {
        // Update points display with accelerated earning
        if (window.appState && window.appState.baseRate) {
            const baseRate = window.appState.baseRate || 0.1;
            const multiplier = window.appState.currentMultiplier || 1.0;
            const pointsEarned = (this.ludicrousMode.acceleratedSessionTime / 60) * baseRate * multiplier; // Convert to minutes
            
            // Update total points
            if (window.appState.totalPoints !== undefined) {
                window.appState.totalPoints += pointsEarned;
            }
            
            // Update points display element if it exists
            const pointsElement = document.getElementById('points-display');
            if (pointsElement && window.appState.totalPoints !== undefined) {
                pointsElement.textContent = `${window.appState.totalPoints.toFixed(1)} POINTS`;
            }
            
            // Update session earnings for receipt
            if (window.appState.sessionEarnings !== undefined) {
                window.appState.sessionEarnings += pointsEarned;
            }
        }
    },

    accelerateProgressBar() {
        // Accelerate progress bar updates
        this.ludicrousMode.originalProgressInterval = setInterval(() => {
            if (this.ludicrousMode.isActive && window.appState) {
                // Update progress bar with accelerated progress
                const progressBarElement = document.getElementById('indexing-progress-bar');
                if (progressBarElement && window.appState.sessionDuration) {
                    const totalDuration = window.appState.totalSessionDuration || 60; // Default 60 minutes
                    const progress = Math.min((window.appState.sessionDuration / totalDuration) * 100, 100);
                    progressBarElement.style.width = `${progress}%`;
                    
                    // Update horizontal progress bar if it exists
                    const horizontalProgressBar = document.querySelector('.horizontal-progress-bar-fill');
                    if (horizontalProgressBar) {
                        horizontalProgressBar.style.width = `${progress}%`;
                    }
                }
            }
        }, 50); // Update every 50ms for smooth progress
    },

    acceleratePointsEarning() {
        // Accelerate points earning by 300x
        if (this.ludicrousMode.isActive && window.appState) {
            // Calculate accelerated points
            const baseRate = window.appState.baseRate || 0.1;
            const currentMultiplier = window.appState.currentMultiplier || 1.0;
            const acceleratedMultiplier = this.accelerateMultiplier(currentMultiplier);
            
            // Calculate points with accelerated multiplier
            const acceleratedPoints = baseRate * acceleratedMultiplier * this.ludicrousMode.speedMultiplier;
            
            // Update session earnings
            if (window.appState.sessionEarnings === undefined) {
                window.appState.sessionEarnings = 0;
            }
            window.appState.sessionEarnings += acceleratedPoints;
            
            console.log(`🚀 LUDICROUS POINTS: Accelerated points to ${acceleratedPoints.toFixed(2)} (300x speed, ${acceleratedMultiplier.toFixed(1)}x multiplier)`);
            
            // Update UI to show accelerated multiplier
            this.updateMultiplierDisplay(acceleratedMultiplier);
        }
    },

    accelerateMultiplier(currentMultiplier) {
        // Accelerate multiplier progression by 300x
        if (!this.ludicrousMode.isActive) return currentMultiplier;
        
        // Calculate how much time has passed in accelerated time
        const acceleratedElapsed = this.ludicrousMode.acceleratedSessionTime;
        
        // Multiplier increases by 0.1 every 5 minutes (300 seconds) in normal mode
        // In Ludicrous Mode, this happens 300x faster (every 1 second)
        const multiplierIncreaseInterval = 300 / this.ludicrousMode.speedMultiplier; // 1 second
        const multiplierIncreases = Math.floor(acceleratedElapsed / multiplierIncreaseInterval);
        
        // Calculate accelerated multiplier
        const acceleratedMultiplier = 1.0 + (multiplierIncreases * 0.1);
        
        // Cap multiplier at reasonable level (e.g., 10x)
        const maxMultiplier = 10.0;
        const finalMultiplier = Math.min(acceleratedMultiplier, maxMultiplier);
        
        return finalMultiplier;
    },

    updateMultiplierDisplay(acceleratedMultiplier) {
        // Update multiplier display in UI
        const multiplierElement = document.querySelector('.multiplier-display, .current-multiplier');
        if (multiplierElement) {
            multiplierElement.textContent = `${acceleratedMultiplier.toFixed(1)}x`;
            multiplierElement.style.color = '#ffaa00'; // Orange to indicate acceleration
        }
        
        // Update any other multiplier displays
        const allMultiplierElements = document.querySelectorAll('[data-multiplier-display]');
        allMultiplierElements.forEach(element => {
            element.textContent = `${acceleratedMultiplier.toFixed(1)}x`;
            element.style.color = '#ffaa00';
        });
    },

    hookTimerAcceleration() {
        // Hook into any existing timer systems
        if (window.appState) {
            const originalAppState = window.appState;
            
            // Create proxy to intercept session time access
            window.appState = new Proxy(originalAppState, {
                get(target, prop) {
                    if (prop === 'sessionDuration' && window.RumiIntegration.ludicrousMode.isActive) {
                        // Return accelerated session duration
                        return window.RumiIntegration.ludicrousMode.acceleratedSessionTime / 60; // Convert to minutes
                    }
                    return target[prop];
                },
                set(target, prop, value) {
                    target[prop] = value;
                    return true;
                }
            });
        }
    },

    hookProgressAcceleration() {
        // Hook into progress bar updates
        const originalUpdateProgress = window.updateProgress;
        if (originalUpdateProgress) {
            window.updateProgress = (progress) => {
                if (this.ludicrousMode.isActive) {
                    // Accelerate progress updates
                    const acceleratedProgress = Math.min(progress * this.ludicrousMode.speedMultiplier, 100);
                    return originalUpdateProgress(acceleratedProgress);
                }
                return originalUpdateProgress(progress);
            };
        }
    },

    hookPointsAcceleration() {
        // Hook into points display updates
        const originalUpdatePoints = window.updatePoints;
        if (originalUpdatePoints) {
            window.updatePoints = (points) => {
                if (this.ludicrousMode.isActive) {
                    // Accelerate points display
                    const acceleratedPoints = points * this.ludicrousMode.speedMultiplier;
                    return originalUpdatePoints(acceleratedPoints);
                }
                return originalUpdatePoints(points);
            };
        }
    },

    hookAnimationPanel() {
        // Override the updateAnimationPanel function to work with Ludicrous Mode
        if (window.updateAnimationPanel) {
            const originalUpdateAnimationPanel = window.updateAnimationPanel;
            
            window.updateAnimationPanel = (elapsedTime) => {
                if (this.ludicrousMode.isActive) {
                    // Use accelerated time for animation updates
                    const acceleratedTime = elapsedTime * this.ludicrousMode.speedMultiplier;
                    console.log(`🚀 INTEGRATION: Animation panel accelerated - Original: ${elapsedTime}s, Accelerated: ${acceleratedTime}s`);
                    return originalUpdateAnimationPanel.call(this, acceleratedTime);
                }
                return originalUpdateAnimationPanel.call(this, elapsedTime);
            };
            
            console.log('✅ INTEGRATION: Animation panel hooks installed');
        }
    },

    // ================================
    // FRONTEND HOOKS (ZERO UI CHANGES)
    // ================================
    
    hookIntoFrontend() {
        console.log('🔗 INTEGRATION: Hooking into frontend calculations...');
        
        // Hook into points calculations
        this.hookPointsCalculations();
        
        // Hook into multiplier system  
        this.hookMultiplierSystem();
        
        // Hook into session management
        this.hookSessionManagement();
        
        // Hook into receipt generation
        this.hookReceiptGeneration();
    },

    hookPointsCalculations() {
        // Find and replace existing points calculations
        const originalCalculatePoints = window.calculatePoints || function(duration, baseRate, multiplier) {
            return duration * 60 * baseRate * multiplier;
        };
        
        // Store original for fallback
        this.originalFunctions.calculatePoints = originalCalculatePoints;
        
        // Replace with backend calculation
        window.calculatePoints = (duration, baseRate = 0.1, sessionTime = null) => {
            if (!this.backendReady || !window.RumiBackend) {
                return originalCalculatePoints(duration, baseRate, 1.0);
            }
            
            const result = window.RumiBackend.calculateLegacyPoints(duration, baseRate, sessionTime);
            console.log(`🔗 INTEGRATION: Points calculation - ${duration}min = ${result.points.toFixed(1)} pts (avg ${result.multiplier.toFixed(1)}x)`);
            return result.points;
        };
    },

    hookMultiplierSystem() {
        // Hook into appState.currentMultiplier updates
        if (window.appState) {
            const originalAppState = window.appState;
            
            // Create proxy to intercept multiplier access
            window.appState = new Proxy(originalAppState, {
                get(target, prop) {
                    if (prop === 'currentMultiplier' && window.RumiIntegration.backendReady) {
                        // Return dynamic multiplier from backend
                        return window.RumiBackend.getCurrentMultiplier();
                    }
                    return target[prop];
                },
                set(target, prop, value) {
                    target[prop] = value;
                    return true;
                }
            });
        }
        
        // Hook into transition system multiplier updates for Ludicrous Mode
        if (window.transitionSystem) {
            const originalUpdateSessionTime = window.transitionSystem.updateSessionTime;
            if (originalUpdateSessionTime) {
                window.transitionSystem.updateSessionTime = (sessionTime) => {
                    if (this.ludicrousMode.isActive) {
                        // Accelerate session time for multiplier calculation
                        const acceleratedSessionTime = sessionTime * this.ludicrousMode.speedMultiplier;
                        console.log(`🚀 INTEGRATION: Accelerating transition system session time - Original: ${sessionTime}s, Accelerated: ${acceleratedSessionTime}s`);
                        return originalUpdateSessionTime.call(window.transitionSystem, acceleratedSessionTime);
                    }
                    return originalUpdateSessionTime.call(window.transitionSystem, sessionTime);
                };
            }
            
            const originalCalculateMultiplier = window.transitionSystem.calculateMultiplier;
            if (originalCalculateMultiplier) {
                window.transitionSystem.calculateMultiplier = (sessionTime) => {
                    if (this.ludicrousMode.isActive) {
                        // Use accelerated session time for multiplier calculation
                        const acceleratedSessionTime = sessionTime * this.ludicrousMode.speedMultiplier;
                        console.log(`🚀 INTEGRATION: Accelerating multiplier calculation - Original: ${sessionTime}s, Accelerated: ${acceleratedSessionTime}s`);
                        return originalCalculateMultiplier.call(window.transitionSystem, acceleratedSessionTime);
                    }
                    return originalCalculateMultiplier.call(window.transitionSystem, sessionTime);
                };
            }
        }
    },

    hookSessionManagement() {
        // Hook into session start/stop functions
        const originalStartSession = window.startSession || function() {};
        const originalEndSession = window.endSession || function() {};
        
        this.originalFunctions.startSession = originalStartSession;
        this.originalFunctions.endSession = originalEndSession;
        
        window.startSession = (...args) => {
            if (this.backendReady && window.RumiBackend) {
                window.RumiBackend.startSession();
                console.log('🔗 INTEGRATION: Session started with backend');
            }
            return originalStartSession.apply(this, args);
        };
        
        window.endSession = (...args) => {
            if (this.backendReady && window.RumiBackend) {
                const sessionData = window.RumiBackend.getSessionForUI();
                console.log('🔗 INTEGRATION: Session ended, backend data:', sessionData);
            }
            return originalEndSession.apply(this, args);
        };
    },

    hookReceiptGeneration() {
        // Hook into showReceiptView function
        const originalShowReceiptView = window.showReceiptView;
        
        if (originalShowReceiptView) {
            this.originalFunctions.showReceiptView = originalShowReceiptView;
            
            window.showReceiptView = (sessionEarnings, sessionDuration, finalMultiplier) => {
                if (this.backendReady && window.RumiBackend) {
                    // Get enhanced data from backend
                    const backendSession = window.RumiBackend.getSessionForUI();
                    
                    // Use backend points if available
                    if (backendSession.totalPoints > 0) {
                        console.log('🔗 INTEGRATION: Using backend session data for receipt');
                        sessionEarnings = backendSession.totalPoints;
                        finalMultiplier = backendSession.currentMultiplier;
                    }
                }
                
                // Call original with potentially enhanced data
                return originalShowReceiptView(sessionEarnings, sessionDuration, finalMultiplier);
            };
        }
    },

    // ================================
    // TIMELINE POPUP FIX
    // ================================
    
    fixTimelinePopup() {
        console.log('🔧 INTEGRATION: Fixing timeline popup system...');
        
        // Remove conflicting hover event listeners
        this.removeConflictingHoverListeners();
        
        // Implement clean popup system
        this.setupCleanPopupSystem();
        
        console.log('✅ INTEGRATION: Timeline popup system fixed');
    },

    removeConflictingHoverListeners() {
        // Find elements with conflicting hover listeners
        const timelineElements = document.querySelectorAll('[class*="timeline"], [class*="block"], [class*="progress"]');
        
        timelineElements.forEach(element => {
            // Clone element to remove all event listeners
            const newElement = element.cloneNode(true);
            element.parentNode.replaceChild(newElement, element);
        });
    },

    setupCleanPopupSystem() {
        // Create single popup element if it doesn't exist
        let popup = document.getElementById('timeline-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'timeline-popup';
            popup.style.cssText = `
                position: fixed;
                background: #222;
                border: 1px solid #ffff00;
                border-radius: 4px;
                padding: 8px 12px;
                font-family: 'SF Mono', monospace;
                font-size: 11px;
                color: #fff;
                z-index: 10000;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s ease;
                max-width: 250px;
                word-wrap: break-word;
            `;
            document.body.appendChild(popup);
        }
        
        // Add clean hover system to timeline elements
        document.addEventListener('mouseover', (e) => {
            const timelineElement = e.target.closest('[class*="timeline"], [class*="block"], [class*="progress"]');
            if (timelineElement && timelineElement.dataset.popupContent) {
                this.showPopup(popup, timelineElement.dataset.popupContent, e);
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            const timelineElement = e.target.closest('[class*="timeline"], [class*="block"], [class*="progress"]');
            if (timelineElement) {
                this.hidePopup(popup);
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (popup.style.opacity === '1') {
                this.updatePopupPosition(popup, e);
            }
        });
    },

    showPopup(popup, content, event) {
        popup.innerHTML = content;
        popup.style.opacity = '1';
        this.updatePopupPosition(popup, event);
    },

    hidePopup(popup) {
        popup.style.opacity = '0';
    },

    updatePopupPosition(popup, event) {
        const x = event.clientX + 10;
        const y = event.clientY - 10;
        
        // Keep popup within viewport
        const rect = popup.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width - 10;
        const maxY = window.innerHeight - rect.height - 10;
        
        popup.style.left = Math.min(x, maxX) + 'px';
        popup.style.top = Math.max(10, Math.min(y, maxY)) + 'px';
    },

    // ================================
    // OPTIMIZED GENRE CHANNEL INTEGRATION
    // ================================
    
    // Hook into optimized genre channel message handling
    hookOptimizedGenreChannel() {
        console.log('🎯 INTEGRATION: Hooking into optimized genre channel...');
        
        // Listen for messages from optimized genre channel
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type) {
                this.handleOptimizedChannelMessage(event.data);
            }
        });
        
        // Set up message handlers for optimized channel
        this.setupOptimizedChannelHandlers();
        
        console.log('✅ INTEGRATION: Optimized genre channel hooks installed');
    },
    
    // Handle messages from optimized genre channel
    handleOptimizedChannelMessage(message) {
        switch (message.type) {
            case 'genreChannelReady':
                console.log('🎯 INTEGRATION: Optimized genre channel ready');
                this.sendBackendDataToChannel();
                break;
                
            case 'populateWithContent':
                console.log('🎯 INTEGRATION: Populating optimized channel with content:', message.genre);
                this.populateOptimizedChannel(message.genre);
                break;
                
            case 'rumi:showDetected':
                console.log('🎯 INTEGRATION: Show detected in optimized channel:', message.show);
                this.handleShowDetection(message.show);
                break;
                
            case 'rumi:updateBlockState':
                console.log('🔄 INTEGRATION: Block state updated in optimized channel:', message);
                this.handleBlockStateUpdate(message);
                break;
                
            case 'indexedContentUpdate':
                console.log('📊 INTEGRATION: Indexed content update from optimized channel:', message.payload);
                this.handleIndexedContentUpdate(message.payload);
                break;
                
            case 'contentPopulationComplete':
                console.log('✅ INTEGRATION: Content population complete in optimized channel:', message.payload);
                this.handleContentPopulationComplete(message.payload);
                break;
        }
    },
    
    // Send backend data to optimized channel
    sendBackendDataToChannel() {
        if (!this.backendReady || !window.RumiBackend) {
            return;
        }
        
        const backendData = {
            contentLibrary: window.RumiBackend.contentLibrary,
            sessionData: window.RumiBackend.getSessionForUI(),
            configuration: {
                timelineDuration: 180,
                multiplierThresholds: [90, 180],
                multiplierValues: [1.0, 1.2, 1.4]
            }
        };
        
        // Send to all genre channel iframes
        const channelFrames = document.querySelectorAll('iframe[src*="Genre-channel_v2"]');
        channelFrames.forEach(frame => {
            try {
                frame.contentWindow.postMessage({
                    type: 'backendData',
                    payload: backendData
                }, '*');
                console.log('📡 INTEGRATION: Sent backend data to optimized channel');
            } catch (error) {
                console.warn('⚠️ INTEGRATION: Could not send backend data to channel:', error);
            }
        });
    },
    
    // Populate optimized channel with backend content
    populateOptimizedChannel(genre) {
        if (!this.backendReady || !window.RumiBackend) {
            return;
        }
        
        // Get genre-filtered content from backend
        const genreContent = window.RumiBackend.contentLibrary.filter(item => 
            item.genre && item.genre.toLowerCase() === genre.toLowerCase()
        );
        
        // Send to optimized channel
        const channelFrames = document.querySelectorAll('iframe[src*="Genre-channel_v2"]');
        channelFrames.forEach(frame => {
            try {
                frame.contentWindow.postMessage({
                    type: 'populateWithContent',
                    content: genreContent,
                    genre: genre,
                    source: 'backend'
                }, '*');
                console.log(`📡 INTEGRATION: Sent ${genreContent.length} items to optimized channel for ${genre}`);
            } catch (error) {
                console.warn('⚠️ INTEGRATION: Could not populate optimized channel:', error);
            }
        });
    },
    
    // Handle show detection from optimized channel
    handleShowDetection(show) {
        if (!this.backendReady || !window.RumiBackend) {
            return;
        }
        
        // Process show detection with backend
        const enhancedShow = this.enhanceContentData(show);
        
        // Update backend session
        window.RumiBackend.processShowDetection(enhancedShow);
        
        console.log('🎯 INTEGRATION: Processed show detection with backend:', enhancedShow);
    },
    
    // Handle block state updates from optimized channel
    handleBlockStateUpdate(update) {
        if (!this.backendReady || !window.RumiBackend) {
            return;
        }
        
        // Update backend with block state
        window.RumiBackend.updateBlockState(update.title, update.state);
        
        console.log('🔄 INTEGRATION: Updated block state in backend:', update);
    },
    
    // Handle indexed content updates from optimized channel
    handleIndexedContentUpdate(update) {
        if (!this.backendReady || !window.RumiBackend) {
            return;
        }
        
        // Update backend with indexed content
        window.RumiBackend.updateIndexedContent(update.indexedContent);
        
        console.log('📊 INTEGRATION: Updated indexed content in backend:', update);
    },
    
    // Handle content population complete from optimized channel
    handleContentPopulationComplete(complete) {
        if (!this.backendReady || !window.RumiBackend) {
            return;
        }
        
        // Notify backend of content population
        window.RumiBackend.notifyContentPopulationComplete(complete);
        
        console.log('✅ INTEGRATION: Content population complete in backend:', complete);
    },
    
    // Set up message handlers for optimized channel
    setupOptimizedChannelHandlers() {
        // Override existing message handlers to work with optimized channel
        const originalSendShowDetection = window.sendShowDetection;
        if (originalSendShowDetection) {
            window.sendShowDetection = (show) => {
                if (!show) {
                    // Preserve original behaviour but avoid posting malformed legacy messages
                    return originalSendShowDetection(show);
                }

                // Post to all optimized genre channel iframes
                const channelFrames = document.querySelectorAll('iframe[src*="genre-channel-optimized"]');
                channelFrames.forEach(frame => {
                    try {
                        frame.contentWindow.postMessage({
                            type: 'rumi:showDetected',
                            payload: show
                        }, '*');
                    } catch (error) {
                        console.warn('⚠️ INTEGRATION: Could not send show detection to optimized channel:', error);
                    }
                });

                // Fallback to original implementation
                return originalSendShowDetection(show);
            };
        }
    },

    // ================================
    // COMPATIBILITY HELPERS
    // ================================
    
    // Enhance existing content with backend data
    enhanceContentData(content) {
        if (!this.backendReady || !window.RumiBackend) {
            return content;
        }
        
        // Add backend-calculated points
        const pointsData = window.RumiBackend.calculateSegmentedPoints(content.duration || 30);
        
        return {
            ...content,
            backendPoints: pointsData.totalPoints,
            backendSegments: pointsData.segments,
            backendMultiplier: pointsData.averageMultiplier
        };
    },

    // Update UI elements with backend data (maintains existing styling)
    updateUIWithBackendData() {
        if (!this.backendReady || !window.RumiBackend) {
            return;
        }
        
        const sessionData = window.RumiBackend.getSessionForUI();
        
        // Update points displays (if they exist)
        const pointsElements = document.querySelectorAll('[id*="points"], [class*="points"]');
        pointsElements.forEach(element => {
            if (element.textContent.includes('POINTS') && sessionData.totalPoints > 0) {
                // Update with backend data while preserving format
                const currentText = element.textContent;
                const newText = currentText.replace(/[\d.]+/, sessionData.totalPoints.toFixed(0));
                element.textContent = newText;
            }
        });
        
        // Update multiplier displays (if they exist)
        const multiplierElements = document.querySelectorAll('[id*="multiplier"], [class*="multiplier"]');
        multiplierElements.forEach(element => {
            if (element.textContent.includes('x')) {
                element.textContent = `${sessionData.currentMultiplier.toFixed(1)}x`;
            }
        });
    },

    // ================================
    // DEBUGGING & VALIDATION
    // ================================
    
    validateIntegration() {
        console.log('🧪 INTEGRATION: Validation check');
        console.log(`🔗 Backend Ready: ${this.backendReady}`);
        console.log(`📊 Content Library: ${window.RumiBackend?.contentLibrary?.length || 0} items`);
        console.log(`🎯 Functions Hooked: ${Object.keys(this.originalFunctions).length}`);
        console.log(`🚀 Ludicrous Mode Active: ${this.ludicrousMode.isActive}`);
        console.log(`⚡ Speed Multiplier: ${this.ludicrousMode.speedMultiplier}x`);
        
        // Test calculation
        if (this.backendReady) {
            const testPoints = window.calculatePoints(60); // 60 minute test
            console.log(`🧪 Test Calculation: 60min = ${testPoints} points`);
        }
        
        return {
            backendReady: this.backendReady,
            functionsHooked: Object.keys(this.originalFunctions).length > 0,
            popupSystemFixed: !!document.getElementById('timeline-popup'),
            ludicrousModeActive: this.ludicrousMode.isActive
        };
    },

    hookTransitionSystem() {
        if (!window.transitionSystem || this.transitionSystemHooked) return;
        
        console.log('🔗 INTEGRATION: Hooking into transition system...');
        
        // Hook into transition system methods for Ludicrous Mode
        if (window.transitionSystem.updateSessionTime) {
            const originalUpdateSessionTime = window.transitionSystem.updateSessionTime;
            window.transitionSystem.updateSessionTime = (sessionTime) => {
                if (this.ludicrousMode.isActive) {
                    const acceleratedSessionTime = sessionTime * this.ludicrousMode.speedMultiplier;
                    console.log(`🚀 INTEGRATION: Transition system session time accelerated - ${sessionTime}s → ${acceleratedSessionTime}s`);
                    return originalUpdateSessionTime.call(window.transitionSystem, acceleratedSessionTime);
                }
                return originalUpdateSessionTime.call(window.transitionSystem, sessionTime);
            };
        }
        
        if (window.transitionSystem.updateIndexingProgress) {
            const originalUpdateIndexingProgress = window.transitionSystem.updateIndexingProgress;
            window.transitionSystem.updateIndexingProgress = (minutes) => {
                if (this.ludicrousMode.isActive) {
                    const acceleratedMinutes = minutes * this.ludicrousMode.speedMultiplier;
                    console.log(`🚀 INTEGRATION: Transition system indexing progress accelerated - ${minutes}min → ${acceleratedMinutes}min`);
                    return originalUpdateIndexingProgress.call(window.transitionSystem, acceleratedMinutes);
                }
                return originalUpdateIndexingProgress.call(window.transitionSystem, minutes);
            };
        }
        
        this.transitionSystemHooked = true;
        console.log('✅ INTEGRATION: Transition system hooks installed');
    },

    updateLudicrousModeStatus() {
        // Update UI elements to show Ludicrous Mode status
        const statusElements = document.querySelectorAll('[id*="ludicrous"], [class*="ludicrous"]');
        statusElements.forEach(element => {
            if (element.textContent.includes('LUDICROUS') || element.textContent.includes('SPEED')) {
                element.textContent = `🚀 LUDICROUS MODE ACTIVE (${this.ludicrousMode.speedMultiplier}x)`;
                element.style.color = '#ffff00';
                element.style.textShadow = '0 0 10px #ffff00';
            }
        });
        
        // Update speed indicator if it exists
        const speedIndicator = document.getElementById('speed-indicator');
        if (speedIndicator) {
            speedIndicator.textContent = `${this.ludicrousMode.speedMultiplier}x SPEED`;
            speedIndicator.style.color = '#ffff00';
        }
        
        // Update progress bar color to indicate Ludicrous Mode
        const progressBars = document.querySelectorAll('.progress-bar, .horizontal-progress-bar-fill');
        progressBars.forEach(bar => {
            if (this.ludicrousMode.isActive) {
                bar.style.backgroundColor = '#ffff00';
                bar.style.boxShadow = '0 0 10px #ffff00';
            }
        });
    },

    hookPointsCalculation() {
        // Hook into the points calculation to use accelerated multiplier
        if (window.appState && window.appState.currentMultiplier !== undefined) {
            // Create a proxy to intercept multiplier access
            const originalMultiplier = window.appState.currentMultiplier;
            
            Object.defineProperty(window.appState, 'currentMultiplier', {
                get: () => {
                    if (this.ludicrousMode.isActive) {
                        // Return accelerated multiplier
                        const acceleratedMultiplier = this.accelerateMultiplier(originalMultiplier);
                        return acceleratedMultiplier;
                    }
                    return originalMultiplier;
                },
                set: (value) => {
                    // Update the original value
                    originalMultiplier = value;
                }
            });
            
            console.log('🚀 INTEGRATION: Points calculation hooked to use accelerated multiplier');
        }
    },

    activateLudicrousMode() {
        console.log('🚀 INTEGRATION: Activating Ludicrous Mode...');
        
        this.ludicrousMode.isActive = true;
        this.ludicrousMode.lastUpdateTime = Date.now();
        
        // Initialize session state
        this.initializeLudicrousSession();
        
        // Hook into points calculation
        this.hookPointsCalculation();
        
        // Accelerate all backend systems
        this.accelerateBackendSystems();
        
        // Update UI to show Ludicrous Mode is active
        this.updateLudicrousModeStatus();
        
        console.log('🚀 INTEGRATION: Ludicrous Mode activated - All systems accelerated to 300x');
    },

    deactivateLudicrousMode() {
        console.log('🛑 INTEGRATION: Deactivating Ludicrous Mode...');
        
        this.ludicrousMode.isActive = false;
        
        // Restore normal speed
        this.restoreNormalSpeed();
        
        // Remove Ludicrous Mode visual indicators
        this.removeLudicrousVisualIndicators();
        
        console.log('🛑 INTEGRATION: Ludicrous Mode deactivated - All systems restored to normal speed');
    },
};

// ================================
// AUTO-INITIALIZATION
// ================================

console.log('🔗 RUMI INTEGRATION SHIM Loaded');

// Initialize when DOM and backend are ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.RumiIntegration.initialize();
    });
} else {
    window.RumiIntegration.initialize();
}

// Periodic UI updates (maintains backend sync)
setInterval(() => {
    if (window.RumiIntegration.backendReady) {
        window.RumiIntegration.updateUIWithBackendData();
        
        // Check if transition system is now available and hook into it
        if (window.transitionSystem && !window.RumiIntegration.transitionSystemHooked) {
            window.RumiIntegration.hookTransitionSystem();
        }
        
        // Update Ludicrous Mode status if active
        if (window.RumiIntegration.ludicrousMode.isActive) {
            window.RumiIntegration.updateLudicrousModeStatus();
        }
    }
}, 5000); // Update every 5 seconds 