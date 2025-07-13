// ================================
// RUMI MULTIPLIER CALCULATOR
// Points and multiplier calculation system
// ================================

import monitor from '../core/performance-monitor.js';
import messageBus from '../core/message-bus.js';

class RumiMultiplierCalculator {
    constructor() {
        // Base multiplier settings
        this.settings = {
            baseMultiplier: 1.0,
            maxMultiplier: 10.0,
            minMultiplier: 0.5,
            chainBonus: 0.1,
            timeBonus: 0.05,
            penaltyFactor: 0.25
        };

        // Current state
        this.state = {
            currentMultiplier: 1.0,
            chainCount: 0,
            lastActionTime: Date.now(),
            bonusTimeWindow: 5000, // 5 seconds
            pointsHistory: []
        };

        // Initialize performance monitoring
        monitor.setThreshold('multiplierCalc', 50); // 50ms threshold
        monitor.setThreshold('pointsCalc', 100); // 100ms threshold

        // Message bus topics
        this.topics = {
            multiplierUpdate: 'multiplier:update',
            pointsAwarded: 'points:awarded',
            chainBonus: 'chain:bonus'
        };
    }

    // ================================
    // MULTIPLIER CALCULATIONS
    // ================================

    /**
     * Calculate current multiplier based on various factors
     * @returns {number} Current multiplier value
     */
    calculateMultiplier() {
        monitor.startMetric('multiplierCalc');

        try {
            // Base multiplier
            let multiplier = this.state.currentMultiplier;

            // Chain bonus
            if (this.state.chainCount > 0) {
                multiplier += this.settings.chainBonus * this.state.chainCount;
            }

            // Time bonus
            const timeSinceLastAction = Date.now() - this.state.lastActionTime;
            if (timeSinceLastAction < this.state.bonusTimeWindow) {
                multiplier += this.settings.timeBonus;
            }

            // Clamp multiplier
            multiplier = Math.max(this.settings.minMultiplier,
                Math.min(this.settings.maxMultiplier, multiplier));

            // Update state
            this.state.currentMultiplier = multiplier;

            // Notify about update
            messageBus.publish(this.topics.multiplierUpdate, {
                multiplier,
                chainCount: this.state.chainCount
            });

            return multiplier;
        } finally {
            monitor.endMetric('multiplierCalc');
        }
    }

    /**
     * Update chain count and recalculate multiplier
     * @param {boolean} success Whether the action was successful
     */
    updateChain(success) {
        if (success) {
            this.state.chainCount++;
            messageBus.publish(this.topics.chainBonus, {
                chainCount: this.state.chainCount,
                bonus: this.settings.chainBonus * this.state.chainCount
            });
        } else {
            this.state.chainCount = 0;
        }

        this.state.lastActionTime = Date.now();
        return this.calculateMultiplier();
    }

    // ================================
    // POINTS CALCULATIONS
    // ================================

    /**
     * Calculate points for an action
     * @param {number} basePoints Base points for the action
     * @param {Object} context Additional context for calculation
     * @returns {number} Final points awarded
     */
    calculatePoints(basePoints, context = {}) {
        monitor.startMetric('pointsCalc');

        try {
            // Get current multiplier
            const multiplier = this.calculateMultiplier();

            // Calculate points with multiplier
            let points = basePoints * multiplier;

            // Apply context modifiers
            if (context.difficulty) {
                points *= (1 + context.difficulty * 0.1);
            }

            if (context.quality) {
                points *= (1 + context.quality * 0.05);
            }

            if (context.penalty) {
                points *= (1 - this.settings.penaltyFactor);
            }

            // Round to nearest integer
            points = Math.round(points);

            // Record in history
            this.state.pointsHistory.push({
                timestamp: Date.now(),
                basePoints,
                multiplier,
                finalPoints: points,
                context
            });

            // Notify about points
            messageBus.publish(this.topics.pointsAwarded, {
                points,
                multiplier,
                context
            });

            return points;
        } finally {
            monitor.endMetric('pointsCalc');
        }
    }

    // ================================
    // STATE MANAGEMENT
    // ================================

    /**
     * Reset multiplier and chain state
     */
    reset() {
        this.state.currentMultiplier = this.settings.baseMultiplier;
        this.state.chainCount = 0;
        this.state.lastActionTime = Date.now();
        this.state.pointsHistory = [];

        messageBus.publish(this.topics.multiplierUpdate, {
            multiplier: this.state.currentMultiplier,
            chainCount: 0
        });
    }

    /**
     * Update calculator settings
     * @param {Object} newSettings New settings to apply
     */
    updateSettings(newSettings) {
        this.settings = {
            ...this.settings,
            ...newSettings
        };

        // Recalculate with new settings
        this.calculateMultiplier();
    }

    /**
     * Get points history for analysis
     * @param {number} limit Maximum number of entries to return
     * @returns {Array} Points history
     */
    getHistory(limit = 100) {
        return this.state.pointsHistory
            .slice(-limit)
            .map(entry => ({
                ...entry,
                age: Date.now() - entry.timestamp
            }));
    }

    /**
     * Get current state snapshot
     * @returns {Object} Current state
     */
    getState() {
        return {
            multiplier: this.state.currentMultiplier,
            chainCount: this.state.chainCount,
            timeSinceLastAction: Date.now() - this.state.lastActionTime,
            settings: { ...this.settings }
        };
    }
}

export default new RumiMultiplierCalculator(); 