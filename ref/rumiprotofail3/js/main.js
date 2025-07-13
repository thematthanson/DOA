/**
 * Rumi Main Application
 * Main application controller that initializes and coordinates all components
 */

(function(window) {
    'use strict';

    // Main Application Namespace
    window.RumiApp = {
        version: '2.0.0',
        
        // Application state
        state: {
            isInitialized: false,
            isActive: false,
            currentSection: 1,
            currentMode: null,
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

        // Event system
        events: {
            listeners: {},
            
            on: function(event, callback) {
                if (!this.listeners[event]) {
                    this.listeners[event] = [];
                }
                this.listeners[event].push(callback);
            },
            
            off: function(event, callback) {
                if (this.listeners[event]) {
                    const index = this.listeners[event].indexOf(callback);
                    if (index > -1) {
                        this.listeners[event].splice(index, 1);
                    }
                }
            },
            
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

        // Core methods
        methods: {
            /**
             * Initialize the application
             */
            init: function() {
                console.log('🎯 RUMI: Initializing main application...');
                
                // Initialize components
                this.initComponents();
                
                // Set up event listeners
                this.setupEventListeners();
                
                // Initialize UI
                this.initUI();
                
                // Load content
                this.loadContent();
                
                this.state.isInitialized = true;
                console.log('🎯 RUMI: Main application initialized');
            },

            /**
             * Initialize all components
             */
            initComponents: function() {
                // Initialize ASCII Art Engine
                if (window.AsciiArtEngine) {
                    window.AsciiArtEngine.setConfig({
                        defaultFont: 'doom',
                        defaultStyle: 'green',
                        enableColors: true
                    });
                    console.log('🎯 RUMI: ASCII Art Engine initialized');
                }

                // Initialize Enhanced ASCII Display
                if (window.EnhancedAsciiDisplay) {
                    window.EnhancedAsciiDisplay.init();
                    console.log('🎯 RUMI: Enhanced ASCII Display initialized');
                }

                // Initialize Backend Engine
                if (window.RumiBackend) {
                    window.RumiBackend.init();
                    console.log('🎯 RUMI: Backend Engine initialized');
                }

                // Initialize Backend Integration
                if (window.RumiIntegration) {
                    window.RumiIntegration.init();
                    console.log('🎯 RUMI: Backend Integration initialized');
                }
            },

            /**
             * Set up event listeners
             */
            setupEventListeners: function() {
                // Backend events
                if (window.RumiIntegration) {
                    window.RumiIntegration.on('showDetected', (show) => {
                        this.handleShowDetected(show);
                    });
                    
                    window.RumiIntegration.on('automodeContentGenerated', (session) => {
                        this.handleContentGenerated(session);
                    });
                    
                    window.RumiIntegration.on('pointsChanged', (points) => {
                        this.handlePointsChanged(points);
                    });
                    
                    window.RumiIntegration.on('multiplierChanged', (multiplier) => {
                        this.handleMultiplierChanged(multiplier);
                    });
                    
                    window.RumiIntegration.on('errorStateChanged', (errorData) => {
                        this.handleErrorStateChanged(errorData);
                    });
                }

                // ASCII Display events
                if (window.EnhancedAsciiDisplay) {
                    this.events.on('asciiUpdate', (content) => {
                        window.EnhancedAsciiDisplay.update(content);
                    });
                }

                // DOM events
                document.addEventListener('DOMContentLoaded', () => {
                    this.setupDOMEventListeners();
                });
            },

            /**
             * Set up DOM event listeners
             */
            setupDOMEventListeners: function() {
                // Section navigation
                const sectionButtons = document.querySelectorAll('.section-button');
                sectionButtons.forEach(button => {
                    button.addEventListener('click', (e) => {
                        const section = e.target.dataset.section;
                        this.navigateToSection(section);
                    });
                });

                // Detection controls
                const detectionButton = document.getElementById('start-detection');
                if (detectionButton) {
                    detectionButton.addEventListener('click', () => {
                        this.startDetection();
                    });
                }

                // Automode controls
                const automodeButton = document.getElementById('start-automode');
                if (automodeButton) {
                    automodeButton.addEventListener('click', () => {
                        this.startAutomode();
                    });
                }

                // Show selection
                const showSelect = document.getElementById('show-select');
                if (showSelect) {
                    showSelect.addEventListener('change', (e) => {
                        this.selectShow(e.target.value);
                    });
                }

                // Bucket selection
                const bucketSelect = document.getElementById('bucket-select');
                if (bucketSelect) {
                    bucketSelect.addEventListener('change', (e) => {
                        this.selectBucket(e.target.value);
                    });
                }

                // Debug controls
                const debugButtons = document.querySelectorAll('.debug-button');
                debugButtons.forEach(button => {
                    button.addEventListener('click', (e) => {
                        const action = e.target.dataset.action;
                        this.handleDebugAction(action);
                    });
                });
            },

            /**
             * Initialize UI
             */
            initUI: function() {
                // Show initial section
                this.showSection(1);
                
                // Update displays
                this.updatePointsDisplay();
                this.updateMultiplierDisplay();
                this.updateModeDisplay();
                
                // Show ready state
                if (window.EnhancedAsciiDisplay) {
                    window.EnhancedAsciiDisplay.showReady();
                }
            },

            /**
             * Load content
             */
            loadContent: function() {
                if (window.RumiIntegration) {
                    window.RumiIntegration.loadContent().then(() => {
                        console.log('🎯 RUMI: Content loaded');
                        this.populateDropdowns();
                    });
                }
            },

            /**
             * Populate dropdowns
             */
            populateDropdowns: function() {
                if (window.RumiBackend) {
                    const content = window.RumiBackend.getContent();
                    
                    // Populate show dropdown
                    this.populateShowDropdown(content);
                    
                    // Populate bucket dropdown
                    this.populateBucketDropdown(content);
                }
            },

            /**
             * Populate show dropdown
             */
            populateShowDropdown: function(content) {
                const showSelect = document.getElementById('show-select');
                if (!showSelect) return;
                
                showSelect.innerHTML = '<option value="">Select a Show</option>';
                content.forEach(show => {
                    const option = document.createElement('option');
                    option.value = show.id;
                    option.textContent = show.title;
                    showSelect.appendChild(option);
                });
            },

            /**
             * Populate bucket dropdown
             */
            populateBucketDropdown: function(content) {
                const bucketSelect = document.getElementById('bucket-select');
                if (!bucketSelect) return;
                
                const genres = [...new Set(content.map(item => item.genre))];
                bucketSelect.innerHTML = '<option value="">Select a Genre</option>';
                genres.forEach(genre => {
                    const option = document.createElement('option');
                    option.value = genre;
                    option.textContent = genre;
                    bucketSelect.appendChild(option);
                });
            },

            /**
             * Navigate to section
             */
            navigateToSection: function(sectionNumber) {
                this.hideAllSections();
                this.showSection(sectionNumber);
                this.state.currentSection = sectionNumber;
                
                console.log('🎯 RUMI: Navigated to section', sectionNumber);
            },

            /**
             * Hide all sections
             */
            hideAllSections: function() {
                const sections = document.querySelectorAll('.section');
                sections.forEach(section => {
                    section.style.display = 'none';
                });
            },

            /**
             * Show section
             */
            showSection: function(sectionNumber) {
                const section = document.getElementById(`section-${sectionNumber}`);
                if (section) {
                    section.style.display = 'block';
                }
            },

            /**
             * Start detection
             */
            startDetection: function() {
                if (window.RumiIntegration) {
                    window.RumiIntegration.startDetection();
                    this.state.currentMode = 'detection';
                    this.updateModeDisplay();
                    
                    // Show loading in ASCII display
                    if (window.EnhancedAsciiDisplay) {
                        window.EnhancedAsciiDisplay.showLoading();
                    }
                    
                    console.log('🎯 RUMI: Detection started');
                }
            },

            /**
             * Start automode
             */
            startAutomode: function() {
                if (!this.state.currentBucket) {
                    alert('Please select a genre bucket first');
                    return;
                }
                
                if (window.RumiIntegration) {
                    window.RumiIntegration.startAutomode(this.state.currentBucket, 120);
                    this.state.currentMode = 'automode';
                    this.updateModeDisplay();
                    
                    // Show loading in ASCII display
                    if (window.EnhancedAsciiDisplay) {
                        window.EnhancedAsciiDisplay.showLoading();
                    }
                    
                    console.log('🎯 RUMI: Automode started with bucket:', this.state.currentBucket);
                }
            },

            /**
             * Select show
             */
            selectShow: function(showId) {
                if (window.RumiBackend) {
                    const content = window.RumiBackend.getContent();
                    const show = content.find(item => item.id == showId);
                    
                    if (show) {
                        this.state.detectedShow = show;
                        this.updateShowDisplay(show);
                        
                        // Generate ASCII art for the show
                        if (window.EnhancedAsciiDisplay && window.AsciiArtEngine) {
                            const asciiArt = window.AsciiArtEngine.fromMetadata(show, {
                                showTitle: true,
                                showGenre: true,
                                showService: true,
                                addBorder: true
                            });
                            
                            window.EnhancedAsciiDisplay.displayStatic(asciiArt);
                        }
                        
                        console.log('🎯 RUMI: Show selected:', show.title);
                    }
                }
            },

            /**
             * Select bucket
             */
            selectBucket: function(bucket) {
                this.state.currentBucket = bucket;
                console.log('🎯 RUMI: Bucket selected:', bucket);
            },

            /**
             * Handle show detected
             */
            handleShowDetected: function(show) {
                this.state.detectedShow = show;
                this.updateShowDisplay(show);
                
                // Generate ASCII art for the show
                if (window.EnhancedAsciiDisplay && window.AsciiArtEngine) {
                    const asciiArt = window.AsciiArtEngine.fromMetadata(show, {
                        showTitle: true,
                        showGenre: true,
                        showService: true,
                        addBorder: true
                    });
                    
                    window.EnhancedAsciiDisplay.displayStatic(asciiArt);
                }
                
                console.log('🎯 RUMI: Show detected:', show.title);
            },

            /**
             * Handle content generated
             */
            handleContentGenerated: function(session) {
                // Generate ASCII art for the session
                if (window.EnhancedAsciiDisplay && window.AsciiArtEngine) {
                    const asciiArt = window.AsciiArtEngine.fromMetadata({
                        title: `${session.genre} Session`,
                        genre: session.genre,
                        service: 'Automode'
                    }, {
                        showTitle: true,
                        showGenre: true,
                        addBorder: true
                    });
                    
                    window.EnhancedAsciiDisplay.displayStatic(asciiArt);
                }
                
                console.log('🎯 RUMI: Content generated:', session);
            },

            /**
             * Handle points changed
             */
            handlePointsChanged: function(points) {
                this.state.totalPoints = points;
                this.updatePointsDisplay();
            },

            /**
             * Handle multiplier changed
             */
            handleMultiplierChanged: function(multiplier) {
                this.state.currentMultiplier = multiplier;
                this.updateMultiplierDisplay();
            },

            /**
             * Handle error state changed
             */
            handleErrorStateChanged: function(errorData) {
                if (errorData.error) {
                    this.showError(errorData.error);
                } else {
                    this.clearError();
                }
            },

            /**
             * Update points display
             */
            updatePointsDisplay: function() {
                const pointsElement = document.getElementById('points-display');
                if (pointsElement) {
                    pointsElement.textContent = this.state.totalPoints.toFixed(2);
                }
            },

            /**
             * Update multiplier display
             */
            updateMultiplierDisplay: function() {
                const multiplierElement = document.getElementById('multiplier-display');
                if (multiplierElement) {
                    multiplierElement.textContent = `${this.state.currentMultiplier.toFixed(1)}x`;
                }
            },

            /**
             * Update mode display
             */
            updateModeDisplay: function() {
                const modeElement = document.getElementById('mode-display');
                if (modeElement) {
                    modeElement.textContent = this.state.currentMode ? this.state.currentMode.toUpperCase() : 'IDLE';
                }
            },

            /**
             * Update show display
             */
            updateShowDisplay: function(show) {
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

            /**
             * Show error
             */
            showError: function(error) {
                const errorElement = document.getElementById('error-display');
                if (errorElement) {
                    errorElement.textContent = error.message || error;
                    errorElement.style.display = 'block';
                    
                    // Show error in ASCII display
                    if (window.EnhancedAsciiDisplay) {
                        window.EnhancedAsciiDisplay.showError(error.message || error);
                    }
                    
                    setTimeout(() => {
                        errorElement.style.display = 'none';
                    }, 5000);
                }
            },

            /**
             * Clear error
             */
            clearError: function() {
                const errorElement = document.getElementById('error-display');
                if (errorElement) {
                    errorElement.style.display = 'none';
                }
            },

            /**
             * Handle debug action
             */
            handleDebugAction: function(action) {
                switch (action) {
                    case 'addPoints':
                        this.addPoints(10);
                        break;
                    case 'increaseMultiplier':
                        this.increaseMultiplier(0.1);
                        break;
                    case 'testError':
                        this.showError('Test error message');
                        break;
                    case 'testAscii':
                        this.testAsciiArt();
                        break;
                    default:
                        console.log('🎯 RUMI: Unknown debug action:', action);
                }
            },

            /**
             * Add points
             */
            addPoints: function(amount) {
                if (window.RumiIntegration) {
                    window.RumiIntegration.addPoints(amount, this.state.currentMultiplier);
                }
            },

            /**
             * Increase multiplier
             */
            increaseMultiplier: function(amount) {
                if (window.RumiIntegration) {
                    window.RumiIntegration.increaseMultiplier(amount);
                }
            },

            /**
             * Test ASCII art
             */
            testAsciiArt: function() {
                if (window.EnhancedAsciiDisplay) {
                    window.EnhancedAsciiDisplay.displayText('TEST', 'doom', 'cyan', 'wave');
                }
            },

            /**
             * Get application state
             */
            getState: function() {
                return { ...this.state };
            },

            /**
             * Set application state
             */
            setState: function(newState) {
                Object.assign(this.state, newState);
            }
        },

        // Public API
        init: function() {
            return this.methods.init.call(this);
        },

        navigateToSection: function(section) {
            return this.methods.navigateToSection.call(this, section);
        },

        startDetection: function() {
            return this.methods.startDetection.call(this);
        },

        startAutomode: function() {
            return this.methods.startAutomode.call(this);
        },

        selectShow: function(showId) {
            return this.methods.selectShow.call(this, showId);
        },

        selectBucket: function(bucket) {
            return this.methods.selectBucket.call(this, bucket);
        },

        addPoints: function(amount) {
            return this.methods.addPoints.call(this, amount);
        },

        increaseMultiplier: function(amount) {
            return this.methods.increaseMultiplier.call(this, amount);
        },

        showError: function(error) {
            return this.methods.showError.call(this, error);
        },

        clearError: function() {
            return this.methods.clearError.call(this, error);
        },

        getState: function() {
            return this.methods.getState.call(this);
        },

        setState: function(newState) {
            return this.methods.setState.call(this, newState);
        },

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

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.RumiApp.init();
        });
    } else {
        window.RumiApp.init();
    }

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = window.RumiApp;
    }

})(typeof window !== 'undefined' ? window : this); 