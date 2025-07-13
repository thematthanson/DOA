// ================================
// RUMI STATE MANAGER
// Consolidated state management for the entire application
// ================================

window.RumiState = {
    // Core application state
    app: {
        // Flow state
        entryPoint: null, // 'detection' or 'automode'
        pendingEntryPoint: null,
        pendingDetectedShow: null,
        pendingBucket: 'Content Intelligence',
        currentBucket: 'Content Intelligence',
        detectedShow: null,
        isIndexing: false,
        indexingStartTime: null,
        sessionDuration: 0,
        
        // Points and multipliers
        totalPoints: 4349,
        totalPendingPoints: 200,
        baseRate: 0.1,
        currentMultiplier: 1.0,
        
        // UI state
        channelExpanded: false,
        rumiChannelExpanded: false,
        learningInsightsExpanded: false,
        trainingProgressExpanded: false,
        
        // Content management
        automodeContentItems: [],
        currentContentIndex: 0,
        playedContent: [],
        
        // Fast mode
        fastMode: {
            active: false,
            mode: null,
            speedMultiplier: 1,
            ludicrousMode: false
        },
        
        // Debug
        debugSkipCooldown: 0
    },

    // Session state (from backend)
    session: {
        processedContent: [],
        totalPoints: 0,
        startTime: null,
        cumulativeTime: 0,
        blockStates: new Map(),
        currentMultiplier: 1.0,
        baseRate: 0.1
    },

    // Content library
    contentLibrary: [],

    // UI state
    ui: {
        currentSection: null,
        sections: {
            'section-1': { visible: false, active: false },
            'section-2a': { visible: false, active: false },
            'section-2b': { visible: false, active: false },
            'section-3a': { visible: false, active: false },
            'section-3b': { visible: false, active: false },
            'section-4a': { visible: false, active: false }
        },
        asciiDisplay: {
            currentContent: null,
            animationActive: false,
            lastUpdate: null
        },
        channel: {
            mode: 'detection',
            content: [],
            expanded: false
        }
    },

    // Debug state
    debug: {
        enabled: false,
        logs: [],
        errors: [],
        performance: {
            startTime: null,
            metrics: {}
        }
    },

    // Session persistence and points carryover
    sessionStorage: {
        lifetimePoints: 0,
        pendingPoints: 0,
        sessionHistory: [],
        lastSessionDate: null
    },

    // ================================
    // STATE MANAGEMENT METHODS
    // ================================

    // Initialize state
    async init() {
        console.log('🎯 STATE: Initializing state manager...');
        
        // Load content library
        await this.loadContentLibrary();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize debug if needed
        if (this.debug.enabled) {
            this.debug.performance.startTime = Date.now();
        }
        
        // Initialize session storage
        this.initSessionStorage();
        
        console.log('🎯 STATE: State manager initialized');
        window.RumiEvents.emit(window.RumiEventTypes.BACKEND_READY, this);
    },

    // Load content library
    async loadContentLibrary() {
        // Load from CSV - no fallback content
        try {
            console.log('🎯 STATE: Loading from CSV...');
            const response = await fetch('data/content-library-expanded.csv');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const csvText = await response.text();
            const lines = csvText.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            
            this.contentLibrary = [];
            
            for (let i = 1; i < lines.length; i++) {
                const values = this.parseCSVLine(lines[i]);
                if (values.length >= headers.length) {
                    const item = {};
                    
                    headers.forEach((header, index) => {
                        item[header.toLowerCase()] = values[index] ? values[index].trim().replace(/"/g, '') : '';
                    });
                    
                    // Convert duration to number
                    if (item.duration_minutes) {
                        item.duration = parseInt(item.duration_minutes);
                    } else if (item.duration) {
                        item.duration = parseInt(item.duration);
                    } else {
                        item.duration = 45;
                    }
                    
                    this.contentLibrary.push(item);
                }
            }
            
            console.log(`🎯 STATE: Loaded ${this.contentLibrary.length} items from CSV`);
            
        } catch (error) {
            console.error('❌ STATE: CSV loading failed:', error.message);
            console.error('💥 CRITICAL ERROR: State manager requires CSV data - no fallback available');
            this.contentLibrary = [];
            throw new Error('Content library CSV could not be loaded - system cannot function without data');
        }
    },

    // Helper method for parsing CSV lines with quotes
    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current);
        return values;
    },

    // Set up event listeners
    setupEventListeners() {
        // Listen for session events
        window.RumiEvents.on(window.RumiEventTypes.SESSION_START, (data) => {
            this.session.startTime = Date.now();
            this.session.cumulativeTime = 0;
            this.session.totalPoints = 0;
            this.session.processedContent = [];
            this.app.isIndexing = true;
            this.app.indexingStartTime = Date.now();
            this.updateUI();
        });

        window.RumiEvents.on(window.RumiEventTypes.SESSION_STOP, (data) => {
            this.app.isIndexing = false;
            this.app.sessionDuration = this.session.cumulativeTime;
            this.updateUI();
        });

        // Listen for content events
        window.RumiEvents.on(window.RumiEventTypes.CONTENT_LOADED, (content) => {
            this.ui.asciiDisplay.currentContent = content;
            this.updateUI();
        });

        // Listen for UI events
        window.RumiEvents.on(window.RumiEventTypes.UI_SECTION_CHANGE, (section) => {
            this.setCurrentSection(section);
        });
    },

    // Update UI state
    updateUI() {
        window.RumiEvents.emit(window.RumiEventTypes.UI_UPDATE, this.ui);
    },

    // Set current section
    setCurrentSection(sectionId) {
        // Hide all sections
        Object.keys(this.ui.sections).forEach(key => {
            this.ui.sections[key].visible = false;
            this.ui.sections[key].active = false;
        });

        // Show target section
        if (this.ui.sections[sectionId]) {
            this.ui.sections[sectionId].visible = true;
            this.ui.sections[sectionId].active = true;
            this.ui.currentSection = sectionId;
        }

        this.updateUI();
    },

    // Get content by genre
    getContentByGenre(genre) {
        return this.contentLibrary.filter(item => 
            item.genre && item.genre.toLowerCase() === genre.toLowerCase()
        );
    },

    // Get random content
    getRandomContent(limit = 10) {
        const shuffled = [...this.contentLibrary].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, limit);
    },

    // Update session data
    updateSession(sessionData) {
        this.session = { ...this.session, ...sessionData };
        window.RumiEvents.emit(window.RumiEventTypes.SESSION_UPDATE, this.session);
    },

    // Update app state
    updateApp(appData) {
        this.app = { ...this.app, ...appData };
        this.updateUI();
    },

    // Get current state for debugging
    getState() {
        return {
            app: this.app,
            session: this.session,
            ui: this.ui,
            debug: this.debug
        };
    },

    // Reset state
    reset() {
        this.app = {
            entryPoint: null,
            pendingEntryPoint: null,
            pendingDetectedShow: null,
            pendingBucket: 'Content Intelligence',
            currentBucket: 'Content Intelligence',
            detectedShow: null,
            isIndexing: false,
            indexingStartTime: null,
            sessionDuration: 0,
            totalPoints: 4349,
            totalPendingPoints: 200,
            baseRate: 0.1,
            currentMultiplier: 1.0,
            channelExpanded: false,
            rumiChannelExpanded: false,
            learningInsightsExpanded: false,
            trainingProgressExpanded: false,
            automodeContentItems: [],
            currentContentIndex: 0,
            playedContent: [],
            fastMode: {
                active: false,
                mode: null,
                speedMultiplier: 1,
                ludicrousMode: false
            },
            debugSkipCooldown: 0
        };

        this.session = {
            processedContent: [],
            totalPoints: 0,
            startTime: null,
            cumulativeTime: 0,
            blockStates: new Map(),
            currentMultiplier: 1.0,
            baseRate: 0.1
        };

        this.updateUI();
        console.log('🎯 STATE: State reset complete');
    },

    // ================================
    // SESSION PERSISTENCE
    // ================================

    initSessionStorage() {
        // Load existing session data
        const stored = localStorage.getItem('rumi-session-data');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.sessionStorage = { ...this.sessionStorage, ...data };
                console.log('📊 STATE: Loaded session data:', this.sessionStorage);
            } catch (error) {
                console.error('❌ STATE: Failed to load session data:', error);
            }
        }

        // Initialize if first time
        if (this.sessionStorage.lifetimePoints === 0) {
            this.sessionStorage.lifetimePoints = 4349; // Default starting points
            this.sessionStorage.pendingPoints = 200;
            this.saveSessionData();
        }
    },

    saveSessionData() {
        try {
            localStorage.setItem('rumi-session-data', JSON.stringify(this.sessionStorage));
            console.log('💾 STATE: Session data saved');
        } catch (error) {
            console.error('❌ STATE: Failed to save session data:', error);
        }
    },

    addPoints(points, type = 'pending') {
        if (type === 'pending') {
            this.sessionStorage.pendingPoints += points;
        } else {
            this.sessionStorage.lifetimePoints += points;
        }
        this.saveSessionData();
        this.updatePointsDisplay();
        console.log(`💰 STATE: Added ${points} ${type} points`);
    },

    finalizePendingPoints() {
        this.sessionStorage.lifetimePoints += this.sessionStorage.pendingPoints;
        this.sessionStorage.pendingPoints = 0;
        this.saveSessionData();
        this.updatePointsDisplay();
        console.log('✅ STATE: Pending points finalized');
    },

    updatePointsDisplay() {
        const primaryDisplay = document.getElementById('points-primary-display');
        const secondaryDisplay = document.getElementById('points-secondary-display');
        
        if (primaryDisplay) {
            primaryDisplay.textContent = `${this.sessionStorage.lifetimePoints.toLocaleString()} LIFETIME POINTS`;
        }
        
        if (secondaryDisplay) {
            secondaryDisplay.textContent = `+${this.sessionStorage.pendingPoints} pending from today`;
        }
    }
};

// Initialize state manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.RumiState.init();
}); 