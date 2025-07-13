// ================================
// RUMI STATE MANAGEMENT SYSTEM
// Centralized state for all components
// ================================

// Note: This file is loaded in browser environment, so we'll use global references
// instead of ES6 imports to avoid module loading issues

// Initialize state
const initialState = {
            // Core application state
    mode: 'detected',
    sessionTime: 0,
    multiplier: 1.0,
    points: 0,
    chainBonus: 0,
    intelligence: 'Content Intelligence',
    paused: false,
    blockProgression: {
        type: 'normal',
        blocks: [],
        delay: 1000
    },
            isActive: false,
            isIndexing: false,
    currentBlock: null,
    currentShow: null
};

class RumiStateCore {
    constructor() {
        this.state = { ...initialState };
        this.listeners = new Set();
        this.initializeSync();
    }
    
    // State getters
    getState(key = null) {
        if (key === null) {
        return { ...this.state };
        }
        return this.state[key];
    }
    
    get(key) {
        return this.state[key];
    }
    
    // State setters
    setState(key, value) {
        console.log('Setting state', key + ':', value);
        this.state[key] = value;
        this.notifyListeners();
    }

    // Test-required methods
    async detectShow(showTitle) {
        try {
            // Use global content manager if available
            if (window.RumiContent) {
                const detected = await window.RumiContent.detectShow(showTitle);
                if (detected) {
                    this.setState('currentShow', showTitle);
                }
                return detected;
            }
            return false;
        } catch (error) {
            console.error('🎯 STATE: Show detection error:', error);
            return false;
        }
    }

    async getContentBlocks(showTitle) {
        try {
            // Use global content manager if available
            if (window.RumiContent) {
                const blocks = await window.RumiContent.getContentBlocks(showTitle);
                this.setState('blockProgression', {
                    ...this.state.blockProgression,
                    blocks: blocks
                });
                return blocks;
            }
            return [];
        } catch (error) {
            console.error('🎯 STATE: Content blocks error:', error);
            return [];
        }
    }

    async getShowGenre(showTitle) {
        try {
            // Use global content manager if available
            if (window.RumiContent) {
                return await window.RumiContent.getShowGenre(showTitle);
            }
            return 'Unknown';
        } catch (error) {
            console.error('🎯 STATE: Genre lookup error:', error);
            return 'Unknown';
        }
    }

    pause() {
        this.setState('paused', true);
        return true;
    }
    
    resume() {
        this.setState('paused', false);
        return true;
    }

    isPaused() {
        return this.state.paused;
    }
    
    getCurrentBlock() {
        return this.state.currentBlock;
    }
    
    progressBlock() {
        const { blocks, currentIndex } = this.state.blockProgression;
        const nextIndex = (currentIndex || 0) + 1;

        if (nextIndex < blocks.length) {
            this.setState('blockProgression', {
                ...this.state.blockProgression,
                currentIndex: nextIndex
            });
            this.setState('currentBlock', blocks[nextIndex]);
        } else {
            // End of blocks
            this.setState('currentBlock', null);
        }
    }

    async initializeShow(showTitle) {
        try {
            // Step 1: Detect show
            const detected = await this.detectShow(showTitle);
            if (!detected) {
                throw new Error(`Failed to detect show: ${showTitle}`);
    }
    
            // Step 2: Get content blocks
            const blocks = await this.getContentBlocks(showTitle);
            if (!blocks.length) {
                throw new Error(`No content blocks found for: ${showTitle}`);
    }
    
            // Step 3: Get genre
            const genre = await this.getShowGenre(showTitle);

            // Step 4: Initialize state
            this.setState('currentShow', showTitle);
            this.setState('blockProgression', {
                type: 'normal',
                blocks: blocks,
                delay: 1000,
                currentIndex: 0
            });
            this.setState('currentBlock', blocks[0]);
            this.setState('isActive', true);
            this.setState('isIndexing', false);
            this.setState('paused', false);

            return true;
        } catch (error) {
            console.error('🎯 STATE: Show initialization error:', error);
            return false;
    }
    }

    // Sync management
    async initializeSync() {
        try {
            // Initialize sync if available
            if (window.RumiSync) {
                await window.RumiSync.initialize(this.state);
                console.log('🎯 STATE: Sync initialized');
            }
        } catch (error) {
            console.error('🎯 STATE: Sync initialization error:', error);
        }
    }

    // Listener management
    addListener(callback) {
        this.listeners.add(callback);
    }

    removeListener(callback) {
        this.listeners.delete(callback);
    }
    
    notifyListeners() {
        for (const listener of this.listeners) {
                try {
                listener(this.state);
                } catch (error) {
                console.error('🎯 STATE: Listener error:', error);
                }
        }
    }
    
    // Reset state
    reset() {
        this.state = { ...initialState };
        this.notifyListeners();
        }

    setMode(mode) {
        if (mode !== 'detected' && mode !== 'auto') {
            console.error('🎯 STATE: Invalid mode:', mode);
            return;
        }

        // Set state
        this.setState('mode', mode);
        this.setState('currentMode', mode);
        
        // Update body class for styling
        const body = document.querySelector('body');
        if (body) {
            body.classList.remove('detected-mode', 'auto-mode', 'mode-detected', 'mode-auto');
            body.classList.add(`${mode}-mode`);
        }
        
        // Update UI styles if UI component is available
        if (window.RumiUI && window.RumiUI.updateUIStyles) {
            window.RumiUI.updateUIStyles({ mode: mode });
        }
        
        console.log(`🎯 STATE: Mode set to ${mode}`);
    }

    // ================================
    // ADDITIONAL API FOR MODULE COMPATIBILITY
    // ================================

    // Simple points accumulator used by indexing engine
    addPoints(points = 0) {
        const current = this.get('points') || 0;
        this.setState('points', current + points);
    }

    setMultiplier(value) {
        this.setState('multiplier', value);
    }

    // Bulk update helper expected by some modules
    update(partial) {
        if (partial && typeof partial === 'object') {
            Object.entries(partial).forEach(([k, v]) => {
                this.state[k] = v;
            });
            this.notifyListeners();
        }
    }

    // AddStateHandler proxy for legacy code (subscribe to a specific key)
    addStateHandler(key, handler) {
        const wrapped = (state) => {
            handler(state[key]);
        };
        this.addListener(wrapped);
    }

    // Stubbed session start expected by indexing engine
    async startSession(mode = 'detected') {
        this.setMode(mode);
        this.setState('isIndexing', true);
        return true;
    }

    handleShowInterrupt() {
        // Placeholder – real implementation would evaluate and possibly pause
    }
}

const rumiStateInstance = new RumiStateCore();

// Preserve class reference globally in case any module needs it
window.RumiStateClass = RumiStateCore;

// Expose singleton instance globally (legacy)
window.RumiState = rumiStateInstance;
window.rumiState = rumiStateInstance;

// ES module exports: provide instance as named and default export
export const RumiState = rumiStateInstance;
export default rumiStateInstance; 