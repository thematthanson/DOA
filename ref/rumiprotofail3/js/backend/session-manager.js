// ================================
// RUMI SESSION MANAGER
// Session and state management system
// ================================

import monitor from '../core/performance-monitor.js';
import messageBus from '../core/message-bus.js';
import multiplier from './multiplier-calculator.js';

class RumiSessionManager {
    constructor() {
        // Session settings
        this.settings = {
            maxSessionDuration: 3600000, // 1 hour
            inactivityTimeout: 300000,   // 5 minutes
            autoSaveInterval: 60000,     // 1 minute
            maxHistorySize: 1000
        };

        // Session state
        this.state = {
            isActive: false,
            isPaused: false,
            startTime: null,
            lastActivityTime: null,
            totalPoints: 0,
            pendingPoints: 0,
            sessionHistory: [],
            currentGenre: null,
            autoSaveTimer: null
        };

        // Initialize performance monitoring
        monitor.setThreshold('sessionUpdate', 100);
        monitor.setThreshold('stateSync', 150);

        // Message bus topics
        this.topics = {
            sessionStart: 'session:start',
            sessionEnd: 'session:end',
            sessionPause: 'session:pause',
            sessionResume: 'session:resume',
            stateUpdate: 'session:state',
            pointsUpdate: 'session:points'
        };

        // Initialize auto-save
        this.initializeAutoSave();
    }

    // ================================
    // SESSION MANAGEMENT
    // ================================

    /**
     * Start a new session
     * @param {Object} config Initial session configuration
     */
    startSession(config = {}) {
        monitor.startMetric('sessionUpdate');

        try {
            // Reset state
            this.state.isActive = true;
            this.state.isPaused = false;
            this.state.startTime = Date.now();
            this.state.lastActivityTime = Date.now();
            this.state.totalPoints = 0;
            this.state.pendingPoints = 0;
            this.state.sessionHistory = [];
            this.state.currentGenre = config.genre || null;

            // Reset multiplier
            multiplier.reset();

            // Start auto-save
            this.initializeAutoSave();

            // Notify about session start
            messageBus.publish(this.topics.sessionStart, {
                timestamp: this.state.startTime,
                config
            });

            return true;
        } catch (error) {
            console.error('Failed to start session:', error);
            return false;
        } finally {
            monitor.endMetric('sessionUpdate');
        }
    }

    /**
     * End current session
     * @param {string} reason Reason for ending session
     */
    endSession(reason = 'manual') {
        if (!this.state.isActive) return false;

        monitor.startMetric('sessionUpdate');

        try {
            // Calculate final stats
            const duration = Date.now() - this.state.startTime;
            const stats = this.calculateSessionStats();

            // Clear state
            this.state.isActive = false;
            this.state.isPaused = false;
            this.clearAutoSave();

            // Add to history
            this.state.sessionHistory.push({
                startTime: this.state.startTime,
                endTime: Date.now(),
                duration,
                totalPoints: this.state.totalPoints,
                genre: this.state.currentGenre,
                stats,
                reason
            });

            // Trim history if needed
            if (this.state.sessionHistory.length > this.settings.maxHistorySize) {
                this.state.sessionHistory = this.state.sessionHistory.slice(-this.settings.maxHistorySize);
            }

            // Notify about session end
            messageBus.publish(this.topics.sessionEnd, {
                duration,
                stats,
                reason
            });

            return true;
        } finally {
            monitor.endMetric('sessionUpdate');
        }
    }

    /**
     * Pause current session
     */
    pauseSession() {
        if (!this.state.isActive || this.state.isPaused) return false;

        this.state.isPaused = true;
        this.clearAutoSave();

        messageBus.publish(this.topics.sessionPause, {
            timestamp: Date.now(),
            duration: Date.now() - this.state.startTime
        });

        return true;
    }

    /**
     * Resume paused session
     */
    resumeSession() {
        if (!this.state.isActive || !this.state.isPaused) return false;

        this.state.isPaused = false;
        this.state.lastActivityTime = Date.now();
        this.initializeAutoSave();

        messageBus.publish(this.topics.sessionResume, {
            timestamp: Date.now()
        });

        return true;
    }

    // ================================
    // STATE MANAGEMENT
    // ================================

    /**
     * Update session state
     * @param {Object} updates State updates to apply
     */
    updateState(updates) {
        monitor.startMetric('stateSync');

        try {
            // Apply updates
            Object.entries(updates).forEach(([key, value]) => {
                if (key in this.state) {
                    this.state[key] = value;
                }
            });

            // Update activity time
            this.state.lastActivityTime = Date.now();

            // Notify about state update
            messageBus.publish(this.topics.stateUpdate, {
                ...this.getState(),
                updateTime: Date.now()
            });

            return true;
        } finally {
            monitor.endMetric('stateSync');
        }
    }

    /**
     * Update points
     * @param {number} points Points to add
     * @param {boolean} isPending Whether points are pending
     */
    updatePoints(points, isPending = false) {
        if (isPending) {
            this.state.pendingPoints += points;
        } else {
            this.state.totalPoints += points;
            this.state.pendingPoints = Math.max(0, this.state.pendingPoints - points);
        }

        messageBus.publish(this.topics.pointsUpdate, {
            totalPoints: this.state.totalPoints,
            pendingPoints: this.state.pendingPoints,
            lastUpdate: points
        });
    }

    // ================================
    // UTILITY FUNCTIONS
    // ================================

    /**
     * Initialize auto-save timer
     */
    initializeAutoSave() {
        this.clearAutoSave();
        this.state.autoSaveTimer = setInterval(() => {
            if (this.state.isActive && !this.state.isPaused) {
                this.saveState();
            }
        }, this.settings.autoSaveInterval);
    }

    /**
     * Clear auto-save timer
     */
    clearAutoSave() {
        if (this.state.autoSaveTimer) {
            clearInterval(this.state.autoSaveTimer);
            this.state.autoSaveTimer = null;
        }
    }

    /**
     * Save current state
     */
    saveState() {
        try {
            const state = this.getState();
            localStorage.setItem('rumiSessionState', JSON.stringify(state));
            return true;
        } catch (error) {
            console.error('Failed to save state:', error);
            return false;
        }
    }

    /**
     * Load saved state
     */
    loadState() {
        try {
            const saved = localStorage.getItem('rumiSessionState');
            if (saved) {
                const state = JSON.parse(saved);
                this.updateState(state);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to load state:', error);
            return false;
        }
    }

    /**
     * Calculate session statistics
     * @returns {Object} Session statistics
     */
    calculateSessionStats() {
        return {
            duration: Date.now() - this.state.startTime,
            pointsPerMinute: this.state.totalPoints / ((Date.now() - this.state.startTime) / 60000),
            maxMultiplier: multiplier.getState().multiplier,
            genre: this.state.currentGenre
        };
    }

    /**
     * Get current state
     * @returns {Object} Current state snapshot
     */
    getState() {
        return {
            isActive: this.state.isActive,
            isPaused: this.state.isPaused,
            startTime: this.state.startTime,
            lastActivityTime: this.state.lastActivityTime,
            totalPoints: this.state.totalPoints,
            pendingPoints: this.state.pendingPoints,
            currentGenre: this.state.currentGenre,
            stats: this.calculateSessionStats()
        };
    }

    /**
     * Get session history
     * @param {number} limit Maximum number of entries
     * @returns {Array} Session history
     */
    getHistory(limit = 10) {
        return this.state.sessionHistory
            .slice(-limit)
            .map(session => ({
                ...session,
                age: Date.now() - session.endTime
            }));
    }
}

export default new RumiSessionManager(); 