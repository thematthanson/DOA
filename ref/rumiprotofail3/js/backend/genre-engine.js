// ================================
// RUMI GENRE ENGINE
// Genre analysis and recommendation system
// ================================

import monitor from '../core/performance-monitor.js';
import messageBus from '../core/message-bus.js';
import session from './session-manager.js';
import { ContentManager } from './content-manager.js';

export class GenreEngine {
    constructor() {
        // Engine settings
        this.settings = {
            minConfidenceScore: 0.6,
            maxGenresPerSession: 3,
            genreChangeThreshold: 0.8,
            analysisWindowSize: 10,
            cooldownPeriod: 300000 // 5 minutes
        };

        // Engine state
        this.state = {
            currentGenre: null,
            lastGenreChange: null,
            genreHistory: [],
            confidenceScores: {},
            analysisWindow: [],
            lastAnalysis: null
        };

        // Initialize performance monitoring
        monitor.setThreshold('genreAnalysis', 200);
        monitor.setThreshold('recommendationCalc', 150);

        // Message bus topics
        this.topics = {
            genreChange: 'genre:change',
            genreAnalysis: 'genre:analysis',
            recommendation: 'genre:recommendation'
        };

        // Genre definitions and rules
        this.genreRules = {
            action: {
                keywords: ['fast', 'intense', 'combat', 'fight', 'battle'],
                tempo: { min: 120, max: 180 },
                intensity: { min: 0.7, max: 1.0 }
            },
            adventure: {
                keywords: ['explore', 'journey', 'quest', 'discover'],
                tempo: { min: 90, max: 140 },
                intensity: { min: 0.4, max: 0.8 }
            },
            puzzle: {
                keywords: ['solve', 'think', 'logic', 'pattern'],
                tempo: { min: 60, max: 100 },
                intensity: { min: 0.2, max: 0.6 }
            },
            strategy: {
                keywords: ['plan', 'build', 'manage', 'control'],
                tempo: { min: 80, max: 120 },
                intensity: { min: 0.3, max: 0.7 }
            }
        };

        this.contentManager = new ContentManager();
    }

    // ================================
    // GENRE ANALYSIS
    // ================================

    /**
     * Analyze content for genre matching
     * @param {Object} content Content to analyze
     * @returns {Object} Analysis results
     */
    async analyzeContent(content) {
        monitor.startMetric('genreAnalysis');

        try {
            const scores = {};
            const metadata = this.extractMetadata(content);

            // Calculate scores for each genre
            Object.entries(this.genreRules).forEach(([genre, rules]) => {
                scores[genre] = this.calculateGenreScore(metadata, rules);
            });

            // Update analysis window
            this.state.analysisWindow.push({
                timestamp: Date.now(),
                scores,
                metadata
            });

            // Trim window if needed
            if (this.state.analysisWindow.length > this.settings.analysisWindowSize) {
                this.state.analysisWindow.shift();
            }

            // Update confidence scores
            this.updateConfidenceScores();

            // Check for genre change
            this.checkGenreChange();

            // Record analysis time
            this.state.lastAnalysis = Date.now();

            // Notify about analysis
            messageBus.publish(this.topics.genreAnalysis, {
                scores,
                metadata,
                confidence: this.state.confidenceScores
            });

            // Analyze content and update genre state
            const genre = await this.contentManager.getShowGenre(content.title);
            
            this.state.currentGenre = genre;
            this.state.lastAnalysis = Date.now();
            this.state.genreHistory.push({
                genre: genre,
                timestamp: Date.now(),
                confidence: 0.95
            });
            
            return genre;
        } finally {
            monitor.endMetric('genreAnalysis');
        }
    }

    /**
     * Extract metadata from content
     * @param {Object} content Content to analyze
     * @returns {Object} Extracted metadata
     */
    extractMetadata(content) {
        return {
            keywords: this.extractKeywords(content.text || ''),
            tempo: this.calculateTempo(content.actions || []),
            intensity: this.calculateIntensity(content.events || []),
            patterns: this.detectPatterns(content.sequence || [])
        };
    }

    /**
     * Calculate genre match score
     * @param {Object} metadata Content metadata
     * @param {Object} rules Genre rules
     * @returns {number} Match score (0-1)
     */
    calculateGenreScore(metadata, rules) {
        // Keyword match score
        const keywordScore = rules.keywords.reduce((score, keyword) => {
            return score + (metadata.keywords.includes(keyword) ? 1 : 0);
        }, 0) / rules.keywords.length;

        // Tempo match score
        const tempoScore = metadata.tempo >= rules.tempo.min && 
            metadata.tempo <= rules.tempo.max ? 1 : 0;

        // Intensity match score
        const intensityScore = metadata.intensity >= rules.intensity.min && 
            metadata.intensity <= rules.intensity.max ? 1 : 0;

        // Combined score with weights
        return (keywordScore * 0.4) + (tempoScore * 0.3) + (intensityScore * 0.3);
    }

    /**
     * Update confidence scores based on analysis window
     */
    updateConfidenceScores() {
        const scores = {};

        // Calculate average scores over window
        Object.keys(this.genreRules).forEach(genre => {
            const genreScores = this.state.analysisWindow
                .map(analysis => analysis.scores[genre]);
            
            scores[genre] = genreScores.reduce((sum, score) => sum + score, 0) / 
                genreScores.length;
        });

        this.state.confidenceScores = scores;
    }

    /**
     * Check if genre change is needed
     */
    checkGenreChange() {
        // Skip if in cooldown
        if (this.state.lastGenreChange && 
            Date.now() - this.state.lastGenreChange < this.settings.cooldownPeriod) {
            return;
        }

        // Get highest confidence genre
        const [topGenre, topScore] = Object.entries(this.state.confidenceScores)
            .reduce((best, [genre, score]) => {
                return score > best[1] ? [genre, score] : best;
            }, ['', 0]);

        // Check if change is needed
        if (topScore >= this.settings.genreChangeThreshold && 
            topGenre !== this.state.currentGenre) {
            this.changeGenre(topGenre);
        }
    }

    /**
     * Change current genre
     * @param {string} newGenre New genre to switch to
     */
    changeGenre(newGenre) {
        // Update state
        this.state.currentGenre = newGenre;
        this.state.lastGenreChange = Date.now();

        // Add to history
        this.state.genreHistory.push({
            genre: newGenre,
            timestamp: Date.now(),
            confidence: this.state.confidenceScores[newGenre]
        });

        // Notify about change
        messageBus.publish(this.topics.genreChange, {
            genre: newGenre,
            confidence: this.state.confidenceScores[newGenre],
            previousGenre: this.state.genreHistory.length > 1 ? 
                this.state.genreHistory[this.state.genreHistory.length - 2].genre : null
        });

        // Update session
        session.updateState({ currentGenre: newGenre });
    }

    // ================================
    // RECOMMENDATION ENGINE
    // ================================

    /**
     * Get genre recommendations
     * @param {Object} context Current context
     * @returns {Array} Recommended genres
     */
    getRecommendations(context = {}) {
        monitor.startMetric('recommendationCalc');

        try {
            const recommendations = [];
            const currentScores = { ...this.state.confidenceScores };

            // Apply context modifiers
            if (context.userPreference) {
                Object.keys(currentScores).forEach(genre => {
                    if (context.userPreference.includes(genre)) {
                        currentScores[genre] *= 1.2;
                    }
                });
            }

            // Sort by score
            const sortedGenres = Object.entries(currentScores)
                .sort(([,a], [,b]) => b - a)
                .filter(([,score]) => score >= this.settings.minConfidenceScore)
                .slice(0, this.settings.maxGenresPerSession);

            // Build recommendations
            sortedGenres.forEach(([genre, score]) => {
                recommendations.push({
                    genre,
                    confidence: score,
                    rules: this.genreRules[genre],
                    isCurrentGenre: genre === this.state.currentGenre
                });
            });

            // Notify about recommendations
            messageBus.publish(this.topics.recommendation, {
                recommendations,
                context
            });

            return recommendations;
        } finally {
            monitor.endMetric('recommendationCalc');
        }
    }

    // ================================
    // UTILITY FUNCTIONS
    // ================================

    /**
     * Extract keywords from text
     * @param {string} text Text to analyze
     * @returns {Array} Extracted keywords
     */
    extractKeywords(text) {
        // Simple keyword extraction
        return text.toLowerCase()
            .split(/\W+/)
            .filter(word => word.length > 3);
    }

    /**
     * Calculate tempo from actions
     * @param {Array} actions List of actions
     * @returns {number} Calculated tempo
     */
    calculateTempo(actions) {
        if (!actions.length) return 0;

        // Calculate average time between actions
        const intervals = actions.slice(1).map((action, i) => 
            action.timestamp - actions[i].timestamp);
        
        const averageInterval = intervals.reduce((sum, interval) => 
            sum + interval, 0) / intervals.length;

        // Convert to BPM-like value
        return Math.round(60000 / averageInterval);
    }

    /**
     * Calculate intensity from events
     * @param {Array} events List of events
     * @returns {number} Calculated intensity (0-1)
     */
    calculateIntensity(events) {
        if (!events.length) return 0;

        // Calculate intensity based on event types and frequency
        const intensityMap = {
            critical: 1.0,
            major: 0.7,
            minor: 0.3,
            info: 0.1
        };

        return events.reduce((sum, event) => 
            sum + (intensityMap[event.type] || 0), 0) / events.length;
    }

    /**
     * Detect patterns in sequence
     * @param {Array} sequence List of items
     * @returns {Object} Detected patterns
     */
    detectPatterns(sequence) {
        // Simple pattern detection
        return {
            repeating: this.findRepeatingPatterns(sequence),
            progressive: this.findProgressivePatterns(sequence)
        };
    }

    /**
     * Find repeating patterns
     * @param {Array} sequence List of items
     * @returns {Array} Repeating patterns
     */
    findRepeatingPatterns(sequence) {
        const patterns = [];
        const maxLength = Math.floor(sequence.length / 2);

        for (let len = 2; len <= maxLength; len++) {
            for (let i = 0; i <= sequence.length - len * 2; i++) {
                const pattern = sequence.slice(i, i + len);
                const next = sequence.slice(i + len, i + len * 2);

                if (JSON.stringify(pattern) === JSON.stringify(next)) {
                    patterns.push(pattern);
                }
            }
        }

        return patterns;
    }

    /**
     * Find progressive patterns
     * @param {Array} sequence List of items
     * @returns {Array} Progressive patterns
     */
    findProgressivePatterns(sequence) {
        const patterns = [];
        const maxLength = Math.floor(sequence.length / 2);

        for (let len = 2; len <= maxLength; len++) {
            for (let i = 0; i <= sequence.length - len * 2; i++) {
                const pattern = sequence.slice(i, i + len);
                const next = sequence.slice(i + len, i + len * 2);

                if (this.isProgressive(pattern, next)) {
                    patterns.push([pattern, next]);
                }
            }
        }

        return patterns;
    }

    /**
     * Check if two sequences form a progressive pattern
     * @param {Array} first First sequence
     * @param {Array} second Second sequence
     * @returns {boolean} Whether sequences form a progressive pattern
     */
    isProgressive(first, second) {
        if (first.length !== second.length) return false;

        const diff = second[0] - first[0];
        return first.every((item, i) => second[i] - item === diff);
    }

    /**
     * Get current state
     * @returns {Object} Current state
     */
    getState() {
        return {
            currentGenre: this.state.currentGenre,
            lastGenreChange: this.state.lastGenreChange,
            confidenceScores: { ...this.state.confidenceScores },
            analysisWindow: [...this.state.analysisWindow],
            genreHistory: [...this.state.genreHistory]
        };
    }

    /**
     * Reset engine state
     */
    reset() {
        this.state = {
            currentGenre: null,
            lastGenreChange: null,
            genreHistory: [],
            confidenceScores: {},
            analysisWindow: [],
            lastAnalysis: null
        };
        
        messageBus.publish(this.topics.genreChange, { genre: null });
    }

    // Test-required methods
    async getShowGenre(showTitle) {
        try {
            return await this.contentManager.getShowGenre(showTitle);
        } catch (error) {
            console.error('🎯 GENRE: Genre lookup error:', error);
            return 'Unknown';
        }
    }
} 