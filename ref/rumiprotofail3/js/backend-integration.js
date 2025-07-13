/**
 * Rumi Backend Integration
 * Integration layer between backend engine and UI components
 */

(function(window) {
    'use strict';

    // Backend Integration Namespace
    window.RumiIntegration = {
        version: '1.0.0',
        
        // Event system
        events: {
            listeners: {},
            
            // Add event listener
            on: function(event, callback) {
                if (!this.listeners[event]) {
                    this.listeners[event] = [];
                }
                this.listeners[event].push(callback);
            },
            
            // Remove event listener
            off: function(event, callback) {
                if (this.listeners[event]) {
                    const index = this.listeners[event].indexOf(callback);
                    if (index > -1) {
                        this.listeners[event].splice(index, 1);
                    }
                }
            },
            
            // Emit event
            emit: function(event, data) {
                if (this.listeners[event]) {
                    this.listeners[event].forEach(callback => {
                        try {
                            callback(data);
                        } catch (error) {
                            console.error('🎯 RUMI: Event callback error:', error);
                        }
                    });
                }
            }
        },

        // UI integration
        ui: {
            // Update points display
            updatePoints: function(points) {
                const pointsElement = document.getElementById('points-display');
                if (pointsElement) {
                    pointsElement.textContent = points.toFixed(2);
                }
                
                // Update pending points
                const pendingElement = document.getElementById('pending-points');
                if (pendingElement) {
                    const pending = RumiBackend.points.getPending();
                    pendingElement.textContent = pending.toFixed(2);
                }
            },

            // Update multiplier display
            updateMultiplier: function(multiplier) {
                const multiplierElement = document.getElementById('multiplier-display');
                if (multiplierElement) {
                    multiplierElement.textContent = `${multiplier.toFixed(1)}x`;
                }
            },

            // Update show info
            updateShowInfo: function(show) {
                const showElement = document.getElementById('show-info');
                if (showElement && show) {
                    showElement.innerHTML = `
                        <div class="show-title">${show.title}</div>
                        <div class="show-details">
                            <span class="show-genre">${show.genre}</span>
                            <span class="show-service">${show.service}</span>
                        </div>
                    `;
                }
            },

            // Update mode display
            updateMode: function(mode) {
                const modeElement = document.getElementById('mode-display');
                if (modeElement) {
                    modeElement.textContent = mode.toUpperCase();
                    modeElement.className = `mode-display ${mode}-mode`;
                }
            },

            // Show error
            showError: function(error) {
                const errorElement = document.getElementById('error-display');
                if (errorElement) {
                    errorElement.textContent = error.message || error;
                    errorElement.style.display = 'block';
                    
                    // Auto-hide after 5 seconds
                    setTimeout(() => {
                        errorElement.style.display = 'none';
                    }, 5000);
                }
            },

            // Clear error
            clearError: function() {
                const errorElement = document.getElementById('error-display');
                if (errorElement) {
                    errorElement.style.display = 'none';
                }
            },

            // Update ASCII display
            updateAsciiDisplay: function(content) {
                if (window.AsciiDisplay) {
                    window.AsciiDisplay.update(content);
                }
            },

            // Update channel display
            updateChannel: function(content) {
                const channelFrame = document.getElementById('channel-frame');
                if (channelFrame && channelFrame.contentWindow) {
                    channelFrame.contentWindow.postMessage({
                        type: 'updateContent',
                        content: content
                    }, '*');
                }
            }
        },

        // Content integration
        content: {
            // Load and integrate content
            load: function() {
                return RumiBackend.loadContent().then(() => {
                    console.log('🎯 RUMI: Content loaded and integrated');
                    
                    // Populate UI with content
                    this.populateUI();
                    
                    // Emit content loaded event
                    RumiIntegration.events.emit('contentLoaded', RumiBackend.getContent());
                });
            },

            // Populate UI with content
            populateUI: function() {
                const content = RumiBackend.getContent();
                
                // Populate genre dropdowns
                this.populateGenreDropdowns(content);
                
                // Populate service dropdowns
                this.populateServiceDropdowns(content);
            },

            // Populate genre dropdowns
            populateGenreDropdowns: function(content) {
                const genres = [...new Set(content.map(item => item.genre))];
                const genreDropdowns = document.querySelectorAll('.genre-select');
                
                genreDropdowns.forEach(dropdown => {
                    dropdown.innerHTML = '<option value="">Select Genre</option>';
                    genres.forEach(genre => {
                        const option = document.createElement('option');
                        option.value = genre;
                        option.textContent = genre;
                        dropdown.appendChild(option);
                    });
                });
            },

            // Populate service dropdowns
            populateServiceDropdowns: function(content) {
                const services = [...new Set(content.map(item => item.service))];
                const serviceDropdowns = document.querySelectorAll('.service-select');
                
                serviceDropdowns.forEach(dropdown => {
                    dropdown.innerHTML = '<option value="">Select Service</option>';
                    services.forEach(service => {
                        const option = document.createElement('option');
                        option.value = service;
                        option.textContent = service;
                        dropdown.appendChild(option);
                    });
                });
            }
        },

        // Detection integration
        detection: {
            // Start detection with UI updates
            start: function() {
                RumiBackend.startDetection();
                
                // Update UI
                RumiIntegration.ui.updateMode('detection');
                
                // Emit detection started event
                RumiIntegration.events.emit('detectionStarted');
                
                console.log('🎯 RUMI: Detection started with UI integration');
            },

            // Stop detection with UI updates
            stop: function() {
                RumiBackend.stopDetection();
                
                // Update UI
                RumiIntegration.ui.updateMode('idle');
                
                // Emit detection stopped event
                RumiIntegration.events.emit('detectionStopped');
                
                console.log('🎯 RUMI: Detection stopped with UI integration');
            },

            // Handle show detection
            handleShowDetected: function(show) {
                // Update UI
                RumiIntegration.ui.updateShowInfo(show);
                
                // Generate ASCII art for the show
                if (window.AsciiArtEngine) {
                    const asciiArt = window.AsciiArtEngine.fromMetadata(show, {
                        showTitle: true,
                        showGenre: true,
                        showService: true,
                        addBorder: true
                    });
                    
                    RumiIntegration.ui.updateAsciiDisplay(asciiArt);
                }
                
                // Emit show detected event
                RumiIntegration.events.emit('showDetected', show);
                
                console.log('🎯 RUMI: Show detected and integrated:', show.title);
            }
        },

        // Automode integration
        automode: {
            // Start automode with UI updates
            start: function(bucket, duration) {
                RumiBackend.startAutomode(bucket, duration);
                
                // Update UI
                RumiIntegration.ui.updateMode('automode');
                
                // Emit automode started event
                RumiIntegration.events.emit('automodeStarted', { bucket, duration });
                
                console.log('🎯 RUMI: Automode started with UI integration');
            },

            // Stop automode with UI updates
            stop: function() {
                RumiBackend.stopAutomode();
                
                // Update UI
                RumiIntegration.ui.updateMode('idle');
                
                // Emit automode stopped event
                RumiIntegration.events.emit('automodeStopped');
                
                console.log('🎯 RUMI: Automode stopped with UI integration');
            },

            // Handle content generation
            handleContentGenerated: function(session) {
                // Update channel with generated content
                RumiIntegration.ui.updateChannel(session);
                
                // Generate ASCII art for the session
                if (window.AsciiArtEngine) {
                    const asciiArt = window.AsciiArtEngine.fromMetadata({
                        title: `${session.genre} Session`,
                        genre: session.genre,
                        service: 'Automode'
                    }, {
                        showTitle: true,
                        showGenre: true,
                        addBorder: true
                    });
                    
                    RumiIntegration.ui.updateAsciiDisplay(asciiArt);
                }
                
                // Emit content generated event
                RumiIntegration.events.emit('contentGenerated', session);
                
                console.log('🎯 RUMI: Content generated and integrated:', session);
            }
        },

        // Points integration
        points: {
            // Add points with UI updates
            add: function(amount, multiplier) {
                RumiBackend.addPoints(amount, multiplier);
                
                // Update UI
                const totalPoints = RumiBackend.getPoints();
                RumiIntegration.ui.updatePoints(totalPoints);
                
                // Emit points added event
                RumiIntegration.events.emit('pointsAdded', { amount, multiplier, total: totalPoints });
                
                console.log('🎯 RUMI: Points added with UI integration:', amount);
            },

            // Handle points change
            handlePointsChanged: function(points) {
                RumiIntegration.ui.updatePoints(points);
            }
        },

        // Multiplier integration
        multiplier: {
            // Increase multiplier with UI updates
            increase: function(amount) {
                RumiBackend.increaseMultiplier(amount);
                
                // Update UI
                const multiplier = RumiBackend.getMultiplier();
                RumiIntegration.ui.updateMultiplier(multiplier);
                
                // Emit multiplier increased event
                RumiIntegration.events.emit('multiplierIncreased', { amount, current: multiplier });
                
                console.log('🎯 RUMI: Multiplier increased with UI integration:', multiplier);
            },

            // Handle multiplier change
            handleMultiplierChanged: function(multiplier) {
                RumiIntegration.ui.updateMultiplier(multiplier);
            }
        },

        // Error integration
        errors: {
            // Set error with UI updates
            set: function(type, error) {
                RumiBackend.setError(type, error);
                
                // Update UI
                RumiIntegration.ui.showError(error);
                
                // Emit error set event
                RumiIntegration.events.emit('errorSet', { type, error });
                
                console.log('🎯 RUMI: Error set with UI integration:', type, error);
            },

            // Clear error with UI updates
            clear: function(type) {
                RumiBackend.clearError(type);
                
                // Update UI
                RumiIntegration.ui.clearError();
                
                // Emit error cleared event
                RumiIntegration.events.emit('errorCleared', { type });
                
                console.log('🎯 RUMI: Error cleared with UI integration:', type);
            },

            // Handle error state change
            handleErrorStateChanged: function(errorData) {
                if (errorData.error) {
                    RumiIntegration.ui.showError(errorData.error);
                } else {
                    RumiIntegration.ui.clearError();
                }
            }
        },

        // Session integration
        session: {
            // Start session with UI updates
            start: function(mode, options) {
                RumiBackend.startSession(mode, options);
                
                // Update UI based on mode
                if (mode === 'detection') {
                    RumiIntegration.detection.start();
                } else if (mode === 'automode') {
                    RumiIntegration.automode.start(options.bucket, options.duration);
                }
                
                // Emit session started event
                RumiIntegration.events.emit('sessionStarted', { mode, options });
                
                console.log('🎯 RUMI: Session started with UI integration:', mode);
            },

            // End session with UI updates
            end: function() {
                RumiBackend.endSession();
                
                // Update UI
                RumiIntegration.ui.updateMode('idle');
                RumiIntegration.ui.updateShowInfo(null);
                
                // Emit session ended event
                RumiIntegration.events.emit('sessionEnded');
                
                console.log('🎯 RUMI: Session ended with UI integration');
            }
        },

        // Public API
        init: function() {
            console.log('🎯 RUMI: Backend integration initialized');
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load content
            return this.content.load();
        },

        // Set up event listeners
        setupEventListeners: function() {
            // Backend events
            if (window.RumiEvents) {
                window.RumiEvents.on('showDetected', (show) => {
                    this.detection.handleShowDetected(show);
                });
                
                window.RumiEvents.on('automodeContentGenerated', (session) => {
                    this.automode.handleContentGenerated(session);
                });
                
                window.RumiEvents.on('pointsChanged', (points) => {
                    this.points.handlePointsChanged(points);
                });
                
                window.RumiEvents.on('multiplierChanged', (multiplier) => {
                    this.multiplier.handleMultiplierChanged(multiplier);
                });
                
                window.RumiEvents.on('errorStateChanged', (errorData) => {
                    this.errors.handleErrorStateChanged(errorData);
                });
            }
        },

        // Detection API
        startDetection: function() {
            return this.detection.start();
        },

        stopDetection: function() {
            return this.detection.stop();
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

        // Multiplier API
        increaseMultiplier: function(amount) {
            return this.multiplier.increase(amount);
        },

        // Error API
        setError: function(type, error) {
            return this.errors.set(type, error);
        },

        clearError: function(type) {
            return this.errors.clear(type);
        },

        // Session API
        startSession: function(mode, options) {
            return this.session.start(mode, options);
        },

        endSession: function() {
            return this.session.end();
        },

        // Event API
        on: function(event, callback) {
            return this.events.on(event, callback);
        },

        off: function(event, callback) {
            return this.events.off(event, callback);
        },

        emit: function(event, data) {
            return this.events.emit(event, data);
        }
    };

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = window.RumiIntegration;
    }

})(typeof window !== 'undefined' ? window : this); 