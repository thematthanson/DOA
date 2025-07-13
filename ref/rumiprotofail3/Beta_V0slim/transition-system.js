/**
 * TRANSITION SYSTEM MODULE
 * 
 * This module provides a safe, testable implementation of the show transition system
 * that was prototyped in transition-test.html. It includes:
 * 
 * - Content tracking and state management
 * - Multiplier progression system
 * - Smooth show transitions with coordinated UI updates
 * - Session management and receipt generation
 * - Unit testing utilities
 */

// ============================================================================
// TRANSITION SYSTEM STATE MANAGEMENT
// ============================================================================

class TransitionSystem {
    constructor() {
        this.state = {
            // Core state
            currentShow: null,
            isIndexing: false,
            isTransitioning: false,
            multiplier: 1.0,
            
            // Session tracking
            sessionTime: 0, // Total session time in seconds
            totalSessionLength: 0, // Total duration of all content in session (minutes)
            timeIndexed: 0, // Time indexed in current show (minutes)
            
            // Multiplier system
            multiplierThresholds: [
                { time: 60, multiplier: 1.2 },   // 1 hour = 1.2x
                { time: 120, multiplier: 1.5 },  // 2 hours = 1.5x
                { time: 180, multiplier: 2.0 }   // 3 hours = 2.0x
            ],
            
            // Content tracking
            completedContent: new Set(), // Track completed content IDs
            playedContent: [], // Array of {title, timeIndexed, points, multiplier, duration}
            baseRate: 0.1, // Points per minute
            
            // Session management
            sessionId: Date.now(),
            
            // Callbacks for UI updates
            uiCallbacks: {
                onStateChange: null,
                onShowChange: null,
                onMultiplierChange: null,
                onProgressUpdate: null,
                onSessionComplete: null
            }
        };
        
        this.log = [];
        this.testMode = false;
    }

    // ============================================================================
    // CORE STATE MANAGEMENT
    // ============================================================================

    /**
     * Initialize the transition system with a starting show
     */
    initialize(show, options = {}) {
        this.logEntry('Initializing transition system', 'info');
        
        this.state.currentShow = show;
        this.state.isIndexing = true;
        this.state.totalSessionLength = show.duration || 0;
        this.state.timeIndexed = 0;
        this.state.sessionTime = 0;
        this.state.multiplier = 1.0;
        
        // Apply options
        if (options.multiplierThresholds) {
            this.state.multiplierThresholds = options.multiplierThresholds;
        }
        if (options.baseRate) {
            this.state.baseRate = options.baseRate;
        }
        if (options.uiCallbacks) {
            this.state.uiCallbacks = { ...this.state.uiCallbacks, ...options.uiCallbacks };
        }
        
        this.logEntry(`Initialized with: ${show.title} (${show.duration}min)`, 'info');
        this.triggerUIUpdate('state');
    }

    /**
     * Update session time and recalculate multiplier
     */
    updateSessionTime(seconds) {
        const oldMultiplier = this.state.multiplier;
        this.state.sessionTime = seconds;
        this.state.multiplier = this.calculateMultiplier(seconds);
        
        if (this.state.multiplier !== oldMultiplier) {
            this.logEntry(`Multiplier changed: ${oldMultiplier.toFixed(1)}x → ${this.state.multiplier.toFixed(1)}x`, 'info');
            this.triggerUIUpdate('multiplier');
        }
    }

    /**
     * Update indexing progress for current show
     */
    updateIndexingProgress(minutes) {
        this.state.timeIndexed += minutes;
        this.logEntry(`Indexed ${minutes} minutes. Total: ${this.state.timeIndexed}/${this.state.totalSessionLength}`, 'info');
        this.triggerUIUpdate('progress');
    }

    /**
     * Calculate multiplier based on session time
     */
    calculateMultiplier(sessionTime) {
        let multiplier = 1.0;
        for (const threshold of this.state.multiplierThresholds) {
            if (sessionTime >= threshold.time * 60) { // Convert minutes to seconds
                multiplier = threshold.multiplier;
            }
        }
        return multiplier;
    }

    // ============================================================================
    // SHOW TRANSITION MANAGEMENT
    // ============================================================================

    /**
     * Perform a smooth transition from current show to new show
     */
    async transitionToShow(newShow) {
        if (!this.state.currentShow) {
            throw new Error('No current show to transition from');
        }

        this.logEntry('=== SMOOTH SHOW TRANSITION STARTED ===', 'info');
        this.logEntry(`From: ${this.state.currentShow.title}`, 'info');
        this.logEntry(`To: ${newShow.title}`, 'info');

        this.state.isTransitioning = true;
        this.triggerUIUpdate('state');

        // Record the played content for receipt
        if (this.state.timeIndexed > 0) {
            const points = this.state.timeIndexed * this.state.baseRate * this.state.multiplier;
            this.state.playedContent.push({
                title: this.state.currentShow.title,
                timeIndexed: this.state.timeIndexed,
                points: points,
                multiplier: this.state.multiplier,
                duration: this.state.currentShow.duration
            });
            this.logEntry(`Recorded played content: ${this.state.currentShow.title} - ${this.state.timeIndexed}min indexed, ${points.toFixed(2)} points`, 'info');
        }

        // Mark the previous show as completed
        this.markContentAsCompleted(this.state.currentShow.id || this.state.currentShow.title);

        // Update current show
        const oldShow = this.state.currentShow;
        this.state.currentShow = newShow;

        // Add the new show's duration to total session length
        this.state.totalSessionLength += newShow.duration || 0;

        // Reset time indexed for the new show
        this.state.timeIndexed = 0;

        this.logEntry(`Total session length increased to ${this.state.totalSessionLength} minutes`, 'info');
        this.logEntry(`Progress reset for new show: ${newShow.title}`, 'info');

        // Simulate transition delay
        await this.delay(1000);

        this.state.isTransitioning = false;
        this.triggerUIUpdate('show');
        this.logEntry('=== SMOOTH SHOW TRANSITION COMPLETED ===', 'info');
    }

    /**
     * Complete the current show (user action)
     */
    completeCurrentShow() {
        if (!this.state.currentShow) return;

        if (this.state.timeIndexed > 0) {
            const points = this.state.timeIndexed * this.state.baseRate * this.state.multiplier;
            this.state.playedContent.push({
                title: this.state.currentShow.title,
                timeIndexed: this.state.timeIndexed,
                points: points,
                multiplier: this.state.multiplier,
                duration: this.state.currentShow.duration
            });
            this.logEntry(`Completed current show: ${this.state.currentShow.title} - ${this.state.timeIndexed}min indexed, ${points.toFixed(2)} points`, 'info');
        }

        this.markContentAsCompleted(this.state.currentShow.id || this.state.currentShow.title);
    }

    // ============================================================================
    // CONTENT TRACKING
    // ============================================================================

    /**
     * Mark content as completed (cannot be removed until next session)
     */
    markContentAsCompleted(contentId) {
        this.state.completedContent.add(contentId);
        this.logEntry(`Content marked as completed: ${contentId}`, 'info');
    }

    /**
     * Check if content is completed
     */
    isContentCompleted(contentId) {
        return this.state.completedContent.has(contentId);
    }

    /**
     * Check if content can be removed (not completed)
     */
    canRemoveContent(contentId) {
        return !this.isContentCompleted(contentId);
    }

    /**
     * Start a new session (reset completed content)
     */
    startNewSession() {
        this.logEntry('Starting new session...', 'info');
        this.state.completedContent.clear();
        this.state.sessionTime = 0;
        this.state.multiplier = 1.0;
        this.state.playedContent = [];
        this.state.sessionId = Date.now();
        this.logEntry('New session started - all content can be removed again', 'info');
    }

    // ============================================================================
    // SESSION MANAGEMENT
    // ============================================================================

    /**
     * Get session receipt with detailed breakdown
     */
    getSessionReceipt() {
        this.completeCurrentShow(); // Complete current show if there's indexed time

        const totalPoints = this.state.playedContent.reduce((sum, item) => sum + item.points, 0);
        const totalTimeIndexed = this.state.playedContent.reduce((sum, item) => sum + item.timeIndexed, 0);

        const receipt = {
            sessionId: this.state.sessionId,
            totalPoints: totalPoints,
            totalTimeIndexed: totalTimeIndexed,
            numberOfShows: this.state.playedContent.length,
            finalMultiplier: this.state.multiplier,
            sessionDuration: this.state.sessionTime,
            playedContent: [...this.state.playedContent],
            timestamp: Date.now()
        };

        this.logEntry('=== SHOWING RECEIPT ===', 'info');
        this.logEntry(`Total session points: ${totalPoints.toFixed(2)}`, 'info');
        this.logEntry(`Total time indexed: ${totalTimeIndexed} minutes`, 'info');
        this.logEntry(`Number of shows played: ${this.state.playedContent.length}`, 'info');

        // Show detailed breakdown
        this.state.playedContent.forEach((item, index) => {
            this.logEntry(`${index + 1}. ${item.title}: ${item.timeIndexed}min indexed, ${item.points.toFixed(2)} points (${item.multiplier.toFixed(1)}x multiplier)`, 'info');
        });

        this.logEntry('=== END RECEIPT ===', 'info');
        return receipt;
    }

    /**
     * Get current state for UI updates
     */
    getCurrentState() {
        return {
            currentShow: this.state.currentShow,
            isIndexing: this.state.isIndexing,
            isTransitioning: this.state.isTransitioning,
            multiplier: this.state.multiplier,
            sessionTime: this.state.sessionTime,
            totalSessionLength: this.state.totalSessionLength,
            timeIndexed: this.state.timeIndexed,
            completedContent: Array.from(this.state.completedContent),
            playedContent: [...this.state.playedContent]
        };
    }

    // ============================================================================
    // UI INTEGRATION
    // ============================================================================

    /**
     * Trigger UI update callbacks
     */
    triggerUIUpdate(type) {
        const callbacks = this.state.uiCallbacks;
        
        switch (type) {
            case 'state':
                if (callbacks.onStateChange) {
                    callbacks.onStateChange(this.getCurrentState());
                }
                break;
            case 'show':
                if (callbacks.onShowChange) {
                    callbacks.onShowChange(this.state.currentShow, this.getCurrentState());
                }
                break;
            case 'multiplier':
                if (callbacks.onMultiplierChange) {
                    callbacks.onMultiplierChange(this.state.multiplier, this.getCurrentState());
                }
                break;
            case 'progress':
                if (callbacks.onProgressUpdate) {
                    callbacks.onProgressUpdate(this.state.timeIndexed, this.state.totalSessionLength, this.getCurrentState());
                }
                break;
        }
    }

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================

    /**
     * Format time in HH:MM:SS format
     */
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Delay function for async operations
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Log entry for debugging and testing
     */
    logEntry(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const entry = {
            timestamp,
            message,
            type,
            state: this.getCurrentState()
        };
        
        this.log.push(entry);
        
        if (this.testMode) {
            console.log(`[${timestamp}] ${message}`);
        }
    }

    /**
     * Clear log
     */
    clearLog() {
        this.log = [];
    }

    /**
     * Get log entries
     */
    getLog() {
        return [...this.log];
    }

    /**
     * Enable/disable test mode
     */
    setTestMode(enabled) {
        this.testMode = enabled;
    }
}

// ============================================================================
// UNIT TESTING UTILITIES
// ============================================================================

class TransitionSystemTests {
    constructor() {
        this.tests = [];
        this.results = [];
    }

    /**
     * Add a test case
     */
    addTest(name, testFunction) {
        this.tests.push({ name, testFunction });
    }

    /**
     * Run all tests
     */
    async runTests() {
        console.log('=== TRANSITION SYSTEM UNIT TESTS ===');
        
        for (const test of this.tests) {
            try {
                console.log(`Running test: ${test.name}`);
                await test.testFunction();
                this.results.push({ name: test.name, status: 'PASS' });
                console.log(`✓ ${test.name} - PASSED`);
            } catch (error) {
                this.results.push({ name: test.name, status: 'FAIL', error: error.message });
                console.log(`✗ ${test.name} - FAILED: ${error.message}`);
            }
        }

        this.printResults();
    }

    /**
     * Print test results
     */
    printResults() {
        console.log('\n=== TEST RESULTS ===');
        const passed = this.results.filter(r => r.status === 'PASS').length;
        const failed = this.results.filter(r => r.status === 'FAIL').length;
        
        console.log(`Total: ${this.results.length}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);
        
        if (failed > 0) {
            console.log('\nFailed tests:');
            this.results.filter(r => r.status === 'FAIL').forEach(r => {
                console.log(`  - ${r.name}: ${r.error}`);
            });
        }
    }

    /**
     * Assertion helper
     */
    assert(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }

    /**
     * Assert equality
     */
    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(`${message}: expected ${expected}, got ${actual}`);
        }
    }
}

// ============================================================================
// PRE-BUILT TEST SUITE
// ============================================================================

function createTransitionSystemTestSuite() {
    const testSuite = new TransitionSystemTests();
    
    // Test 1: Basic initialization
    testSuite.addTest('Basic Initialization', async () => {
        const system = new TransitionSystem();
        const testShow = { title: 'Test Show', duration: 120, id: 'test-show' };
        
        system.initialize(testShow);
        const state = system.getCurrentState();
        
        testSuite.assertEqual(state.currentShow.title, 'Test Show', 'Current show title');
        testSuite.assertEqual(state.totalSessionLength, 120, 'Total session length');
        testSuite.assertEqual(state.multiplier, 1.0, 'Initial multiplier');
        testSuite.assert(state.isIndexing, 'Should be indexing');
        testSuite.assert(!state.isTransitioning, 'Should not be transitioning');
    });

    // Test 2: Multiplier progression
    testSuite.addTest('Multiplier Progression', async () => {
        const system = new TransitionSystem();
        const testShow = { title: 'Test Show', duration: 120, id: 'test-show' };
        
        system.initialize(testShow);
        
        // Test 30 minutes (should be 1.0x)
        system.updateSessionTime(30 * 60);
        testSuite.assertEqual(system.state.multiplier, 1.0, '30 minutes multiplier');
        
        // Test 90 minutes (should be 1.2x)
        system.updateSessionTime(90 * 60);
        testSuite.assertEqual(system.state.multiplier, 1.2, '90 minutes multiplier');
        
        // Test 150 minutes (should be 1.5x)
        system.updateSessionTime(150 * 60);
        testSuite.assertEqual(system.state.multiplier, 1.5, '150 minutes multiplier');
        
        // Test 200 minutes (should be 2.0x)
        system.updateSessionTime(200 * 60);
        testSuite.assertEqual(system.state.multiplier, 2.0, '200 minutes multiplier');
    });

    // Test 3: Show transition
    testSuite.addTest('Show Transition', async () => {
        const system = new TransitionSystem();
        const show1 = { title: 'Show 1', duration: 120, id: 'show-1' };
        const show2 = { title: 'Show 2', duration: 90, id: 'show-2' };
        
        system.initialize(show1);
        system.updateIndexingProgress(60); // Index 60 minutes
        
        await system.transitionToShow(show2);
        
        const state = system.getCurrentState();
        testSuite.assertEqual(state.currentShow.title, 'Show 2', 'Current show after transition');
        testSuite.assertEqual(state.timeIndexed, 0, 'Time indexed reset');
        testSuite.assertEqual(state.totalSessionLength, 210, 'Total session length updated');
        testSuite.assertEqual(state.playedContent.length, 1, 'Played content recorded');
        testSuite.assertEqual(state.playedContent[0].title, 'Show 1', 'Played content title');
        testSuite.assertEqual(state.playedContent[0].timeIndexed, 60, 'Played content time indexed');
    });

    // Test 4: Content completion tracking
    testSuite.addTest('Content Completion Tracking', async () => {
        const system = new TransitionSystem();
        const testShow = { title: 'Test Show', duration: 120, id: 'test-show' };
        
        system.initialize(testShow);
        
        testSuite.assert(!system.isContentCompleted('test-show'), 'Content should not be completed initially');
        testSuite.assert(system.canRemoveContent('test-show'), 'Content should be removable initially');
        
        system.markContentAsCompleted('test-show');
        
        testSuite.assert(system.isContentCompleted('test-show'), 'Content should be completed');
        testSuite.assert(!system.canRemoveContent('test-show'), 'Completed content should not be removable');
        
        system.startNewSession();
        
        testSuite.assert(!system.isContentCompleted('test-show'), 'Content should not be completed after new session');
        testSuite.assert(system.canRemoveContent('test-show'), 'Content should be removable after new session');
    });

    // Test 5: Session receipt
    testSuite.addTest('Session Receipt', async () => {
        const system = new TransitionSystem();
        const show1 = { title: 'Show 1', duration: 120, id: 'show-1' };
        const show2 = { title: 'Show 2', duration: 90, id: 'show-2' };
        
        system.initialize(show1);
        system.updateSessionTime(90 * 60); // 1.2x multiplier
        system.updateIndexingProgress(60);
        
        await system.transitionToShow(show2);
        system.updateIndexingProgress(45);
        
        const receipt = system.getSessionReceipt();
        
        testSuite.assertEqual(receipt.numberOfShows, 2, 'Number of shows in receipt');
        testSuite.assertEqual(receipt.totalTimeIndexed, 105, 'Total time indexed');
        testSuite.assert(receipt.totalPoints > 0, 'Should have points');
        testSuite.assert(receipt.playedContent.length === 2, 'Should have 2 played content items');
    });

    return testSuite;
}

// ============================================================================
// EXPORT FOR USE IN MAIN SYSTEM
// ============================================================================

// Make available globally for integration with main system
window.TransitionSystem = TransitionSystem;
window.TransitionSystemTests = TransitionSystemTests;
window.createTransitionSystemTestSuite = createTransitionSystemTestSuite;

// Auto-run tests if in test mode
if (typeof window !== 'undefined' && window.location.search.includes('test=true')) {
    console.log('Running transition system tests...');
    const testSuite = createTransitionSystemTestSuite();
    testSuite.runTests();
}
