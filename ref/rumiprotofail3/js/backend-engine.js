/**
 * Rumi Backend Engine
 * Core backend functionality for content management, state management, and processing
 */

(function(window) {
    'use strict';

    // Backend Engine Namespace
    window.RumiBackend = {
        version: '1.0.0',
        
        // Core state
        state: {
            isActive: false,
            currentMode: null, // 'detection', 'automode', 'indexing'
            detectedShow: null,
            currentBucket: null,
            totalPoints: 0,
            pendingPoints: 0,
            currentMultiplier: 1.0,
            chainBonus: 0,
            intelligence: false,
            turboMode: false,
            cacheControl: true,
            errors: {
                volume: null,
                speed: null,
                system: null
            }
        },

        // Content management
        content: {
            library: [],
            genres: [],
            services: [],
            
            // Load content library
            load: function() {
                return new Promise((resolve) => {
                    // Simulate content loading
                    this.library = [
                        { id: 1, title: 'Breaking Bad', genre: 'Drama', service: 'Netflix', duration: 45 },
                        { id: 2, title: 'The Office', genre: 'Comedy', service: 'Netflix', duration: 22 },
                        { id: 3, title: 'Stranger Things', genre: 'Sci-Fi', service: 'Netflix', duration: 50 },
                        { id: 4, title: 'Friends', genre: 'Comedy', service: 'HBO Max', duration: 22 },
                        { id: 5, title: 'Game of Thrones', genre: 'Fantasy', service: 'HBO Max', duration: 60 }
                    ];
                    
                    this.genres = [...new Set(this.library.map(item => item.genre))];
                    this.services = [...new Set(this.library.map(item => item.service))];
                    
                    resolve(this.library);
                });
            },

            // Get content by genre
            getByGenre: function(genre) {
                return this.library.filter(item => item.genre === genre);
            },

            // Get content by service
            getByService: function(service) {
                return this.library.filter(item => item.service === service);
            },

            // Create session content
            createSession: function(duration, genre) {
                const genreContent = this.getByGenre(genre);
                const sessionItems = [];
                let totalDuration = 0;
                
                while (totalDuration < duration && genreContent.length > 0) {
                    const item = genreContent[Math.floor(Math.random() * genreContent.length)];
                    sessionItems.push(item);
                    totalDuration += item.duration;
                }
                
                return {
                    items: sessionItems,
                    totalDuration: totalDuration,
                    genre: genre
                };
            }
        },

        // Detection engine
        detection: {
            isDetecting: false,
            detectedShows: [],
            
            // Start detection
            start: function() {
                this.isDetecting = true;
                RumiBackend.state.currentMode = 'detection';
                console.log('🎯 RUMI: Detection started');
                
                // Simulate show detection
                this.simulateDetection();
            },

            // Stop detection
            stop: function() {
                this.isDetecting = false;
                console.log('🎯 RUMI: Detection stopped');
            },

            // Simulate show detection
            simulateDetection: function() {
                if (!this.isDetecting) return;
                
                const shows = RumiBackend.content.library;
                const randomShow = shows[Math.floor(Math.random() * shows.length)];
                
                this.detectedShows.push(randomShow);
                RumiBackend.state.detectedShow = randomShow;
                
                // Trigger detection event
                if (window.RumiEvents) {
                    window.RumiEvents.emit('showDetected', randomShow);
                }
                
                console.log('🎯 RUMI: Show detected:', randomShow.title);
            },

            // Get detected shows
            getDetectedShows: function() {
                return this.detectedShows;
            }
        },

        // Automode engine
        automode: {
            isActive: false,
            currentBucket: null,
            sessionDuration: 0,
            
            // Start automode
            start: function(bucket, duration) {
                this.isActive = true;
                this.currentBucket = bucket;
                this.sessionDuration = duration || 120; // 2 hours default
                RumiBackend.state.currentMode = 'automode';
                RumiBackend.state.currentBucket = bucket;
                
                console.log('🎯 RUMI: Automode started with bucket:', bucket);
                
                // Start content generation
                this.generateContent();
            },

            // Stop automode
            stop: function() {
                this.isActive = false;
                console.log('🎯 RUMI: Automode stopped');
            },

            // Generate content for automode
            generateContent: function() {
                if (!this.isActive) return;
                
                const session = RumiBackend.content.createSession(this.sessionDuration, this.currentBucket);
                
                // Trigger automode event
                if (window.RumiEvents) {
                    window.RumiEvents.emit('automodeContentGenerated', session);
                }
                
                console.log('🎯 RUMI: Automode content generated:', session);
            }
        },

        // Points system
        points: {
            // Add points
            add: function(amount, multiplier = 1.0) {
                const totalAmount = amount * multiplier;
                RumiBackend.state.pendingPoints += totalAmount;
                RumiBackend.state.totalPoints += totalAmount;
                
                console.log('🎯 RUMI: Points added:', totalAmount);
                
                // Trigger points event
                if (window.RumiEvents) {
                    window.RumiEvents.emit('pointsChanged', RumiBackend.state.totalPoints);
                }
            },

            // Get total points
            getTotal: function() {
                return RumiBackend.state.totalPoints;
            },

            // Get pending points
            getPending: function() {
                return RumiBackend.state.pendingPoints;
            },

            // Reset points
            reset: function() {
                RumiBackend.state.totalPoints = 0;
                RumiBackend.state.pendingPoints = 0;
                RumiBackend.state.currentMultiplier = 1.0;
                RumiBackend.state.chainBonus = 0;
            }
        },

        // Multiplier system
        multiplier: {
            // Increase multiplier
            increase: function(amount = 0.1) {
                RumiBackend.state.currentMultiplier += amount;
                console.log('🎯 RUMI: Multiplier increased to:', RumiBackend.state.currentMultiplier);
                
                // Trigger multiplier event
                if (window.RumiEvents) {
                    window.RumiEvents.emit('multiplierChanged', RumiBackend.state.currentMultiplier);
                }
            },

            // Reset multiplier
            reset: function() {
                RumiBackend.state.currentMultiplier = 1.0;
                console.log('🎯 RUMI: Multiplier reset');
            },

            // Get current multiplier
            get: function() {
                return RumiBackend.state.currentMultiplier;
            }
        },

        // Error handling
        errors: {
            // Set error state
            set: function(type, error) {
                RumiBackend.state.errors[type] = error;
                console.log('🎯 RUMI: Error set:', type, error);
                
                // Trigger error event
                if (window.RumiEvents) {
                    window.RumiEvents.emit('errorStateChanged', { type, error });
                }
            },

            // Clear error
            clear: function(type) {
                RumiBackend.state.errors[type] = null;
                console.log('🎯 RUMI: Error cleared:', type);
            },

            // Get error
            get: function(type) {
                return RumiBackend.state.errors[type];
            },

            // Check if any errors exist
            hasErrors: function() {
                return Object.values(RumiBackend.state.errors).some(error => error !== null);
            }
        },

        // Session management
        session: {
            // Start new session
            start: function(mode, options = {}) {
                RumiBackend.state.isActive = true;
                RumiBackend.state.currentMode = mode;
                
                if (mode === 'detection') {
                    RumiBackend.detection.start();
                } else if (mode === 'automode') {
                    RumiBackend.automode.start(options.bucket, options.duration);
                }
                
                console.log('🎯 RUMI: Session started:', mode);
            },

            // End session
            end: function() {
                RumiBackend.state.isActive = false;
                RumiBackend.detection.stop();
                RumiBackend.automode.stop();
                
                console.log('🎯 RUMI: Session ended');
            },

            // Get session info
            getInfo: function() {
                return {
                    isActive: RumiBackend.state.isActive,
                    mode: RumiBackend.state.currentMode,
                    detectedShow: RumiBackend.state.detectedShow,
                    currentBucket: RumiBackend.state.currentBucket,
                    totalPoints: RumiBackend.state.totalPoints,
                    multiplier: RumiBackend.state.currentMultiplier
                };
            }
        },

        // Utility functions
        utils: {
            // Format duration
            formatDuration: function(seconds) {
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                
                if (hours > 0) {
                    return `${hours}h ${minutes}m`;
                } else {
                    return `${minutes}m`;
                }
            },

            // Generate random ID
            generateId: function() {
                return Math.random().toString(36).substr(2, 9);
            },

            // Deep clone object
            clone: function(obj) {
                return JSON.parse(JSON.stringify(obj));
            }
        },

        // Public API
        init: function() {
            console.log('🎯 RUMI: Backend engine initialized');
            return this.content.load();
        },

        // Content API
        loadContent: function() {
            return this.content.load();
        },

        getContent: function() {
            return this.content.library;
        },

        // Detection API
        startDetection: function() {
            return this.detection.start();
        },

        stopDetection: function() {
            return this.detection.stop();
        },

        getDetectedShows: function() {
            return this.detection.getDetectedShows();
        },

        // Automode API
        startAutomode: function(bucket, duration) {
            return this.automode.start(bucket, duration);
        },

        stopAutomode: function() {
            return this.automode.stop();
        },

        // Points API
        addPoints: function(amount, multiplier) {
            return this.points.add(amount, multiplier);
        },

        getPoints: function() {
            return this.points.getTotal();
        },

        // Multiplier API
        increaseMultiplier: function(amount) {
            return this.multiplier.increase(amount);
        },

        getMultiplier: function() {
            return this.multiplier.get();
        },

        // Error API
        setError: function(type, error) {
            return this.errors.set(type, error);
        },

        clearError: function(type) {
            return this.errors.clear(type);
        },

        getError: function(type) {
            return this.errors.get(type);
        },

        // Session API
        startSession: function(mode, options) {
            return this.session.start(mode, options);
        },

        endSession: function() {
            return this.session.end();
        },

        getSessionInfo: function() {
            return this.session.getInfo();
        },

        // State API
        getState: function() {
            return this.utils.clone(this.state);
        },

        setState: function(newState) {
            Object.assign(this.state, newState);
        }
    };

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = window.RumiBackend;
    }

})(typeof window !== 'undefined' ? window : this); 