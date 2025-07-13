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

    // Turbo Mode integration (replacement for deprecated Ludicrous Mode)
    ludicrousMode: {
        // NOTE: object name kept for backwards-compat; treat as Turbo internally
        isActive: false,
        speedMultiplier: 30, // capped turbo speed
        originalTimerInterval: null,
        originalProgressInterval: null,
        acceleratedSessionTime: 0,
        lastUpdateTime: null
    },

    // Clamp helper
    clampSpeed(mult) {
        const MAX_TURBO = 30;
        return Math.min(Math.max(mult, 1), MAX_TURBO);
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
        this.hookTurboMode();
        this.hookOptimizedGenreChannel();
        this.hookTransitionSystem();
        
        console.log('✅ INTEGRATION: Backend integration complete');

        // -----------------------------------------------------------------
        // Subscribe to global RumiBus events so integration stays in sync
        // -----------------------------------------------------------------
        if (window.RumiBus && typeof window.RumiBus.subscribe === 'function') {
            window.RumiBus.subscribe('session:init', (session) => {
                console.log('🔗 INTEGRATION: Received session:init via RumiBus', session);
                this.sharedSession = session;
            });

            window.RumiBus.subscribe('session:pointer', ({ index }) => {
                if (typeof index === 'number') {
                    window.appState.currentContentIndex = index;
                    this.ludicrousMode.contentProcessingIndex = index;
                    console.log('🔗 INTEGRATION: Pointer synced via RumiBus – currentContentIndex =', index);
                }
            });

            window.RumiBus.subscribe('turbo:on', ({ speed }) => {
                this.ludicrousMode.speedMultiplier = speed || this.ludicrousMode.speedMultiplier;
                console.log('🔗 INTEGRATION: Turbo ON (speed', speed, ') via RumiBus');
            });

            window.RumiBus.subscribe('turbo:off', () => {
                this.ludicrousMode.speedMultiplier = 1;
                console.log('🔗 INTEGRATION: Turbo OFF via RumiBus');
            });
        }
    },

    // ================================
    // TURBO MODE INTEGRATION
    // ================================
    
    hookTurboMode() {
        console.log('⚡ INTEGRATION: Hooking into Turbo Mode...');
        
        // Hook into LudicrousSpeedManager
        if (window.LudicrousSpeedManager) {
            this.hookLudicrousSpeedManager();
        } else {
            // Wait for LudicrousSpeedManager to be available
            setTimeout(() => this.hookTurboMode(), 500);
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
        
        // Override speed multiplier to enforce cap
        window.LudicrousSpeedManager.speedMultiplier = this.clampSpeed(window.LudicrousSpeedManager.speedMultiplier || 30);
        
        window.LudicrousSpeedManager.activate = () => {
            console.log('⚡ INTEGRATION: Turbo Mode activated');
            // Clamp speed every activation in case external code changed it
            window.LudicrousSpeedManager.speedMultiplier = this.clampSpeed(window.LudicrousSpeedManager.speedMultiplier);
            this.ludicrousMode.speedMultiplier = window.LudicrousSpeedManager.speedMultiplier;
            this.ludicrousMode.isActive = true;
            this.ludicrousMode.lastUpdateTime = Date.now();
            this.accelerateBackendSystems();
            return originalActivate.call(window.LudicrousSpeedManager);
        };
        
        window.LudicrousSpeedManager.deactivate = () => {
            console.log('🛑 INTEGRATION: Turbo Mode deactivated – restoring normal speed');
            this.ludicrousMode.isActive = false;
            this.restoreNormalSpeed();
            return originalDeactivate.call(window.LudicrousSpeedManager);
        };
        
        console.log('✅ INTEGRATION: Turbo hooks installed (max 30×)');
    },

    accelerateBackendSystems() {
        // Initialize session state for Turbo Mode
        this.initializeTurboSession();
        
        // Accelerate timer updates
        this.accelerateTimer();
        
        // Accelerate progress bar updates
        this.accelerateProgressBar();
        
        // Accelerate points earning
        this.acceleratePointsEarning();
        
        console.log(`⚡ INTEGRATION: All backend systems accelerated to ${this.ludicrousMode.speedMultiplier}x speed (Turbo)`);
    },

    initializeTurboSession() {
        // Initialize session state for Turbo Mode
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
            
            console.log('🚀 INTEGRATION: Turbo session initialized');
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
        
        // Remove Turbo Mode visual indicators
        this.removeTurboVisualIndicators();
        
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

    removeTurboVisualIndicators() {
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
        
        // Remove Turbo Mode status displays
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
                    // Accelerate session time by turbo speed multiplier
                    const now = Date.now();
                    const realElapsed = (now - this.ludicrousMode.lastUpdateTime) / 1000;
                    const acceleratedElapsed = realElapsed * this.ludicrousMode.speedMultiplier;
                    
                    this.ludicrousMode.acceleratedSessionTime += acceleratedElapsed;
                    this.ludicrousMode.lastUpdateTime = now;
                    
                    // Store duration in MINUTES to match existing frontend expectations
                    if (window.appState.sessionDuration === undefined) {
                        window.appState.sessionDuration = 0;
                    }
                    window.appState.sessionDuration = this.ludicrousMode.acceleratedSessionTime / 60;
                    
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
            
            // Add Turbo Mode visual indicator
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
            
            // Add Turbo Mode visual indicator
            if (this.ludicrousMode.isActive) {
                horizontalProgressBar.style.backgroundColor = '#ffff00';
                horizontalProgressBar.style.boxShadow = '0 0 10px #ffff00';
            }
        }
    },

    updateContentProgression(acceleratedElapsed) {
        // Robust block progression detection – ensures no skips even at high multipliers.
        if (!window.appState || !window.appState.automodeContentItems) return;

        // Use the integration-tracked elapsed time (seconds)
        const prevElapsed = this.ludicrousMode.prevElapsedTime || 0;
        const currElapsed = this.ludicrousMode.acceleratedSessionTime || 0;

        const items = window.appState.automodeContentItems;

        // Helper to normalise duration to seconds
        const parseDurationSeconds = (duration) => {
            if (typeof duration === 'number') return duration; // already seconds
            if (typeof duration === 'string') {
                if (duration.includes(':')) {
                    const [m, s] = duration.split(':').map(Number);
                    return (m * 60) + (s || 0);
                }
                // Assume numeric string represents minutes
                const num = parseFloat(duration);
                return isNaN(num) ? 60 : num * 60;
            }
            return 60; // fallback 1 minute
        };

        let cumulative = 0;
        let currentIndex = window.appState.currentContentIndex || 0;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const dur = parseDurationSeconds(item.duration);
            const blockStart = cumulative;
            const blockEnd = cumulative + dur;

            // Detect completed blocks that were crossed since last tick
            if (prevElapsed < blockEnd && currElapsed >= blockEnd) {
                console.log(`✅ Block completed: ${item.title}`);
            }

            // Determine which block we are currently in
            if (currElapsed >= blockStart && currElapsed < blockEnd) {
                currentIndex = i;
            }

            cumulative = blockEnd;
        }

        // If we've surpassed all blocks, stay on last
        if (currElapsed >= cumulative) currentIndex = items.length - 1;

        // Never allow regression — if another subsystem already advanced the pointer, keep the higher value
        if (currentIndex < (window.appState.currentContentIndex || 0)) {
            currentIndex = window.appState.currentContentIndex;
        }

        // If block changed, trigger transition & logging
        if (window.appState.currentContentIndex !== currentIndex) {
            window.appState.currentContentIndex = currentIndex;
            const currentItem = items[currentIndex];
            console.log(`➡️  Starting new block: ${currentItem.title} (index ${currentIndex})`);
            this.triggerContentTransition(currentIndex);
        }

        // Persist for next tick
        this.ludicrousMode.prevElapsedTime = currElapsed;
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
                    
                    // Add Turbo Mode indicator
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
        // Accelerate points earning by turbo speed multiplier
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
            
            console.log(`⚡ TURBO POINTS: Accelerated points to ${acceleratedPoints.toFixed(2)} (${this.ludicrousMode.speedMultiplier}x speed, ${acceleratedMultiplier.toFixed(1)}x multiplier)`);
            
            // Update UI to show accelerated multiplier
            this.updateMultiplierDisplay(acceleratedMultiplier);
        }
    },

    accelerateMultiplier(currentMultiplier) {
        // Accelerate multiplier progression by turbo speed multiplier
        if (!this.ludicrousMode.isActive) return currentMultiplier;
        
        // Calculate how much time has passed in accelerated time
        const acceleratedElapsed = this.ludicrousMode.acceleratedSessionTime;
        
        // Multiplier increases by 0.1 every 5 minutes (300 seconds) in normal mode
        // In Turbo Mode, this happens «speedMultiplier» times faster (every second / speedMultiplier)
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
        // Override the updateAnimationPanel function to work with Turbo Mode
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
        
        // Hook into transition system multiplier updates for Turbo Mode
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
        const channelFrames = document.querySelectorAll('iframe[src*="genre-channel-optimized"]');
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
        const channelFrames = document.querySelectorAll('iframe[src*="genre-channel-optimized"]');
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
        
        // Update backend with block state if function exists
        if (typeof window.RumiBackend.updateBlockState === 'function') {
            window.RumiBackend.updateBlockState(update.title, update.state);
        } else {
            console.warn('⚠️ INTEGRATION: updateBlockState not available on backend (stubbed during tests)');
        }
        
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
                // Send to optimized channel with the correct payload structure expected by OptimizedGenreChannel
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

                // Call original function (which already broadcasts using payload)
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
        console.log(`🚀 Turbo Mode Active: ${this.ludicrousMode.isActive}`);
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
            turboModeActive: this.ludicrousMode.isActive
        };
    },

    hookTransitionSystem() {
        if (!window.transitionSystem || this.transitionSystemHooked) return;
        
        console.log('🔗 INTEGRATION: Hooking into transition system...');
        
        // Hook into transition system methods for Turbo Mode
        if (window.transitionSystem.updateSessionTime) {
            const originalUpdateSessionTime = window.transitionSystem.updateSessionTime;
            window.transitionSystem.updateSessionTime = (sessionTime) => {
                if (this.ludicrousMode.isActive) {
                    const acceleratedSessionTime = sessionTime * this.ludicrousMode.speedMultiplier;
                    console.log(`⚡ INTEGRATION: Transition system session time accelerated - ${sessionTime}s → ${acceleratedSessionTime}s`);
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
                    console.log(`⚡ INTEGRATION: Transition system indexing progress accelerated - ${minutes}min → ${acceleratedMinutes}min`);
                    return originalUpdateIndexingProgress.call(window.transitionSystem, acceleratedMinutes);
                }
                return originalUpdateIndexingProgress.call(window.transitionSystem, minutes);
            };
        }
        
        this.transitionSystemHooked = true;
        console.log('✅ INTEGRATION: Transition system hooks installed');
    },

    updateTurboModeStatus() {
        // Update UI elements to show Turbo Mode status
        const statusElements = document.querySelectorAll('[id*="ludicrous"], [class*="ludicrous"]');
        statusElements.forEach(element => {
            if (element.textContent.includes('LUDICROUS') || element.textContent.includes('SPEED')) {
                element.textContent = `⚡ TURBO MODE ACTIVE (${this.ludicrousMode.speedMultiplier}x)`;
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
        
        // Update progress bar color to indicate Turbo Mode
        const progressBars = document.querySelectorAll('.progress-bar, .horizontal-progress-bar-fill');
        progressBars.forEach(bar => {
            if (this.ludicrousMode.isActive) {
                bar.style.backgroundColor = '#ffff00';
                bar.style.boxShadow = '0 0 10px #ffff00';
            }
        });
    },

    hookPointsCalculation() {
        // Safely hook into currentMultiplier so we can override it during Turbo
        if (!window.appState || window.appState.currentMultiplier === undefined) return;

        // Preserve original descriptor so we can restore it later if needed
        if (!this._originalMultiplierDescriptor) {
            this._originalMultiplierDescriptor = Object.getOwnPropertyDescriptor(window.appState, 'currentMultiplier');
        }

        // Mutable copy holds the live multiplier value
        let liveMultiplier = window.appState.currentMultiplier;

        Object.defineProperty(window.appState, 'currentMultiplier', {
            configurable: true,
            enumerable: true,
            get: () => {
                if (this.ludicrousMode.isActive) {
                    return this.accelerateMultiplier(liveMultiplier);
                }
                return liveMultiplier;
            },
            set: (value) => {
                liveMultiplier = value;
                return true;
            }
        });

        console.log('⚡ INTEGRATION: Points calculation hooked for Turbo multiplier');
    },

    activateTurboMode() {
        console.log('⚡ INTEGRATION: Activating Turbo Mode...');
        
        this.ludicrousMode.isActive = true;
        this.ludicrousMode.lastUpdateTime = Date.now();
        
        // Initialize session state
        this.initializeTurboSession();
        
        // Hook into points calculation
        this.hookPointsCalculation();
        
        // Accelerate all backend systems
        this.accelerateBackendSystems();
        
        // Update UI to show Turbo Mode is active
        this.updateTurboModeStatus();
        
        console.log(`⚡ INTEGRATION: Turbo Mode activated - All systems accelerated to ${this.ludicrousMode.speedMultiplier}x`);
    },

    deactivateTurboMode() {
        console.log('🛑 INTEGRATION: Deactivating Turbo Mode...');
        
        // Persist final accelerated session time back to canonical state
        const acceleratedSecs = this.ludicrousMode.acceleratedSessionTime || 0;
        const minutesFinal    = acceleratedSecs / 60;
        console.log(`⌛ TURBO FINAL TIME   : ${(acceleratedSecs).toFixed(1)}s (${minutesFinal.toFixed(2)} min)`);
        console.log(`⌛ SESSION BEFORE SAVE: ${(window.appState.sessionDuration || 0).toFixed(2)} min`);

        // Commit to appState so post-turbo UI sees the updated value
        window.appState.sessionDuration = minutesFinal;

        console.log(`✅ SESSION AFTER SAVE : ${(window.appState.sessionDuration).toFixed(2)} min`);

        this.ludicrousMode.isActive = false;

        // Restore normal speed
        this.restoreNormalSpeed();

        // Remove Turbo Mode visual indicators
        this.removeTurboVisualIndicators();

        console.log('🛑 INTEGRATION: Turbo Mode deactivated - All systems restored to normal speed');
    },

    // Clamp helper
    clampSpeed(mult) {
        const MAX_TURBO = 30;
        return Math.min(Math.max(mult, 1), MAX_TURBO);
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
        
        // Update Turbo Mode status if active
        if (window.RumiIntegration.ludicrousMode.isActive) {
            window.RumiIntegration.updateTurboModeStatus();
        }
    }
}, 5000); // Update every 5 seconds 