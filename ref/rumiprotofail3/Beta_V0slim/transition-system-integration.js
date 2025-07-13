// ============================================================================
// TRANSITION SYSTEM INTEGRATION FUNCTIONS
// ============================================================================

// Global transition system instance
let transitionSystem = null;

// Initialize transition system with UI callbacks
function initializeTransitionSystem() {
    if (typeof TransitionSystem === 'undefined') {
        console.warn('TransitionSystem not loaded - skipping initialization');
        return;
    }

    console.log('Initializing transition system...');
    
    transitionSystem = new TransitionSystem();
    
    // Set up UI callbacks
    transitionSystem.state.uiCallbacks = {
        onStateChange: (newState) => {
            console.log('Transition system state changed:', newState);
            // Sync with app state
            appState.isIndexing = newState.isIndexing;
            appState.isTransitioning = newState.isTransitioning;
            updateUI();
        },
        
        onShowChange: (newShow) => {
            console.log('Show changed:', newShow);
            // Update app state with new show
            if (appState.entryPoint === 'detection') {
                appState.detectedShow = newShow;
                appState.originalShow = appState.originalShow || newShow;
            }
            updateUI();
        },
        
        onMultiplierChange: (newMultiplier) => {
            console.log('Multiplier changed:', newMultiplier);
            appState.currentMultiplier = newMultiplier;
            updatePointsDisplay();
        },
        
        onProgressUpdate: (progress) => {
            console.log('Progress updated:', progress);
            // Update session earnings based on progress
            if (appState.entryPoint === 'detection' && appState.detectedShow) {
                const timeIndexedMinutes = progress.timeIndexed;
                const points = timeIndexedMinutes * (appState.baseRate || 0.1) * progress.multiplier;
                appState.sessionEarnings = points;
                updatePointsDisplay();
            }
        },
        
        onSessionComplete: (receipt) => {
            console.log('Session completed:', receipt);
            appState.sessionCompleted = true;
            // Store receipt for display
            appState.sessionReceipt = receipt;
            showSessionReceipt(receipt);
        }
    };
    
    console.log('Transition system initialized successfully');
}

// Integrate transition system with existing content tracking
function integrateTransitionSystemWithContentTracking() {
    if (!transitionSystem) return;
    
    // Sync played content with transition system
    appState.playedContent.forEach(contentId => {
        transitionSystem.markContentAsCompleted(contentId);
    });
    
    // Sync channel content
    appState.channelContent.forEach((contentSet, channelName) => {
        contentSet.forEach(contentId => {
            // Mark as in channel but not completed
            if (!transitionSystem.isContentCompleted(contentId)) {
                // This content is available in the channel
                console.log(`Content ${contentId} available in channel ${channelName}`);
            }
        });
    });
    
    console.log('Transition system integrated with content tracking');
}

// Enhanced content tracking functions that work with transition system
function markContentAsPlayedWithTransition(content) {
    const contentId = generateContentId(content);
    
    // Use existing function
    markContentAsPlayed(content);
    
    // Also mark in transition system
    if (transitionSystem) {
        transitionSystem.markContentAsCompleted(contentId);
    }
}

// Enhanced show transition function
async function transitionToShowWithSystem(newShow) {
    if (!transitionSystem || !appState.detectedShow) {
        console.warn('Transition system or current show not available');
        return;
    }
    
    try {
        // Use transition system for smooth transition
        await transitionSystem.transitionToShow(newShow);
        
        // Update app state
        appState.interruptNewShow = newShow;
        appState.showInterruptTimestamp = Date.now();
        
        console.log('Show transition completed via transition system');
        
    } catch (error) {
        console.error('Error during show transition:', error);
        // Fallback to direct state update
        appState.interruptNewShow = newShow;
        appState.showInterruptTimestamp = Date.now();
    }
}

// Enhanced session management
function startIndexingWithTransitionSystem() {
    // Use existing startIndexing logic
    startIndexing();
    
    // Initialize transition system if not already done
    if (!transitionSystem) {
        initializeTransitionSystem();
    }
    
    // Initialize transition system with current show
    if (appState.entryPoint === 'detection' && appState.detectedShow) {
        const showData = {
            id: generateContentId(appState.detectedShow),
            title: appState.detectedShow.title,
            duration: appState.detectedShow.duration || 45,
            type: 'show'
        };
        
        transitionSystem.initialize(showData, {
            baseRate: appState.baseRate || 0.1,
            multiplierThresholds: [
                { time: 60, multiplier: 1.2 },
                { time: 120, multiplier: 1.5 },
                { time: 180, multiplier: 2.0 }
            ]
        });
        
        console.log('Transition system initialized with detected show:', showData);
    }
}

// Enhanced session completion
function completeSessionWithTransitionSystem() {
    if (!transitionSystem) {
        console.warn('Transition system not available for session completion');
        return;
    }
    
    // Complete current show in transition system
    transitionSystem.completeCurrentShow();
    
    // Get session receipt
    const receipt = transitionSystem.getSessionReceipt();
    
    // Update app state
    appState.sessionCompleted = true;
    appState.sessionReceipt = receipt;
    
    // Show receipt
    showSessionReceipt(receipt);
    
    console.log('Session completed via transition system');
}

// Function to show session receipt (placeholder - implement UI as needed)
function showSessionReceipt(receipt) {
    console.log('=== SESSION RECEIPT ===');
    console.log('Session ID:', receipt.sessionId);
    console.log('Total Time:', receipt.totalTime);
    console.log('Final Multiplier:', receipt.finalMultiplier);
    console.log('Total Points:', receipt.totalPoints);
    console.log('Content Played:');
    receipt.content.forEach(item => {
        console.log(`  - ${item.title}: ${item.timeIndexed}min, ${item.points} points (${item.multiplier}x)`);
    });
    console.log('=====================');
    
    // TODO: Implement UI display for receipt
    // This could be a modal, overlay, or dedicated receipt view
}

// Debug function for transition system
function debugTransitionSystem() {
    if (!transitionSystem) {
        console.log('Transition system not initialized');
        return;
    }
    
    console.log('=== TRANSITION SYSTEM DEBUG ===');
    const state = transitionSystem.getCurrentState();
    console.log('Current State:', state);
    console.log('Log:', transitionSystem.getLog());
    console.log('=== END TRANSITION SYSTEM DEBUG ===');
}

// ============================================================================
// END TRANSITION SYSTEM INTEGRATION
// ============================================================================ 