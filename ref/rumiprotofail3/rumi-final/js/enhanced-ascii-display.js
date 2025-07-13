// ================================
// ENHANCED RUMI ASCII DISPLAY
// Content-based ASCII art generation with animation
// ================================

console.log('🎨 Enhanced ASCII: Module loading...');

class EnhancedRumiASCII {
    static DEBUG = true;
    static initialized = false;
    static asciiArtLibrary = null;
    static animationInterval = null;
    static currentContent = null;
    static nounCache = new Map();

    // Content noun extraction patterns
    static NOUN_PATTERNS = {
        // Character types
        characters: ['hero', 'villain', 'protagonist', 'antagonist', 'detective', 'spy', 'soldier', 'pilot', 'doctor', 'scientist', 'teacher', 'student', 'parent', 'child', 'friend', 'enemy', 'leader', 'follower', 'warrior', 'mage', 'archer', 'knight', 'princess', 'king', 'queen', 'prince', 'wizard', 'witch', 'monster', 'dragon', 'ghost', 'alien', 'robot', 'cyborg', 'android', 'human', 'creature', 'beast', 'animal'],
        
        // Objects and items
        objects: ['sword', 'gun', 'knife', 'shield', 'armor', 'helmet', 'crown', 'ring', 'necklace', 'book', 'scroll', 'map', 'key', 'door', 'window', 'car', 'ship', 'plane', 'train', 'bike', 'motorcycle', 'spaceship', 'rocket', 'missile', 'bomb', 'explosive', 'weapon', 'tool', 'device', 'machine', 'computer', 'phone', 'tablet', 'camera', 'microscope', 'telescope', 'clock', 'watch', 'mirror', 'lamp', 'light', 'fire', 'water', 'earth', 'air', 'stone', 'metal', 'wood', 'glass', 'plastic', 'fabric', 'paper', 'ink', 'paint', 'brush', 'pencil', 'pen'],
        
        // Locations and environments
        locations: ['castle', 'tower', 'fortress', 'palace', 'temple', 'church', 'school', 'hospital', 'office', 'factory', 'warehouse', 'shop', 'store', 'market', 'street', 'road', 'bridge', 'tunnel', 'cave', 'mountain', 'forest', 'desert', 'ocean', 'sea', 'river', 'lake', 'island', 'city', 'town', 'village', 'country', 'planet', 'moon', 'star', 'galaxy', 'universe', 'dimension', 'world', 'realm', 'kingdom', 'empire', 'nation', 'state', 'province', 'region', 'area', 'zone', 'district', 'neighborhood', 'community', 'society', 'civilization'],
        
        // Actions and events
        actions: ['fight', 'battle', 'war', 'conflict', 'struggle', 'challenge', 'quest', 'mission', 'journey', 'adventure', 'exploration', 'discovery', 'invention', 'creation', 'destruction', 'transformation', 'evolution', 'revolution', 'rebellion', 'revolution', 'uprising', 'resistance', 'victory', 'defeat', 'triumph', 'failure', 'success', 'achievement', 'accomplishment', 'goal', 'objective', 'target', 'aim', 'purpose', 'mission', 'duty', 'responsibility', 'obligation', 'commitment', 'dedication', 'loyalty', 'betrayal', 'treason', 'crime', 'justice', 'law', 'order', 'chaos', 'peace', 'harmony', 'balance', 'equilibrium', 'stability', 'instability', 'change', 'growth', 'development', 'progress', 'advancement', 'improvement', 'enhancement', 'upgrade', 'modification', 'alteration', 'adjustment', 'adaptation', 'evolution', 'mutation', 'transformation', 'metamorphosis', 'transcendence', 'ascension', 'descent', 'fall', 'rise', 'climb', 'descend', 'ascend', 'move', 'travel', 'journey', 'wander', 'roam', 'explore', 'search', 'seek', 'find', 'discover', 'uncover', 'reveal', 'expose', 'hide', 'conceal', 'protect', 'defend', 'attack', 'assault', 'invade', 'conquer', 'defeat', 'overcome', 'survive', 'live', 'die', 'kill', 'save', 'rescue', 'help', 'aid', 'assist', 'support', 'guide', 'lead', 'follow', 'obey', 'disobey', 'rebel', 'resist', 'fight', 'struggle', 'suffer', 'endure', 'persist', 'continue', 'stop', 'start', 'begin', 'end', 'finish', 'complete', 'accomplish', 'achieve', 'succeed', 'fail', 'lose', 'win', 'triumph', 'victory', 'defeat', 'loss', 'gain', 'earn', 'receive', 'give', 'take', 'steal', 'borrow', 'lend', 'buy', 'sell', 'trade', 'exchange', 'share', 'divide', 'multiply', 'add', 'subtract', 'calculate', 'compute', 'think', 'reason', 'logic', 'intuition', 'emotion', 'feeling', 'sensation', 'perception', 'awareness', 'consciousness', 'mind', 'brain', 'heart', 'soul', 'spirit', 'body', 'flesh', 'bone', 'blood', 'skin', 'hair', 'eye', 'ear', 'nose', 'mouth', 'tongue', 'tooth', 'hand', 'finger', 'arm', 'leg', 'foot', 'toe', 'head', 'face', 'neck', 'shoulder', 'chest', 'back', 'stomach', 'waist', 'hip', 'knee', 'ankle', 'wrist', 'elbow', 'knee', 'ankle', 'joint', 'muscle', 'nerve', 'vein', 'artery', 'organ', 'cell', 'molecule', 'atom', 'particle', 'energy', 'force', 'power', 'strength', 'weakness', 'ability', 'skill', 'talent', 'gift', 'curse', 'blessing', 'miracle', 'magic', 'science', 'technology', 'art', 'music', 'dance', 'poetry', 'literature', 'story', 'tale', 'legend', 'myth', 'history', 'past', 'present', 'future', 'time', 'space', 'dimension', 'reality', 'dream', 'nightmare', 'fantasy', 'imagination', 'creativity', 'inspiration', 'motivation', 'desire', 'passion', 'love', 'hate', 'anger', 'fear', 'joy', 'sadness', 'happiness', 'sorrow', 'grief', 'pain', 'pleasure', 'comfort', 'discomfort', 'ease', 'difficulty', 'simplicity', 'complexity', 'order', 'chaos', 'peace', 'war', 'life', 'death', 'birth', 'rebirth', 'resurrection', 'immortality', 'mortality', 'eternity', 'infinity', 'finite', 'infinite', 'limited', 'unlimited', 'possible', 'impossible', 'real', 'unreal', 'true', 'false', 'right', 'wrong', 'good', 'evil', 'light', 'dark', 'day', 'night', 'morning', 'evening', 'dawn', 'dusk', 'sunrise', 'sunset', 'noon', 'midnight', 'hour', 'minute', 'second', 'moment', 'instant', 'period', 'era', 'age', 'epoch', 'century', 'decade', 'year', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond', 'microsecond', 'nanosecond', 'picosecond', 'femtosecond', 'attosecond', 'zeptosecond', 'yoctosecond']
    };

    static async init() {
        if (this.initialized) return;
        
        // Initialize ASCII Art library
        await this.initializeAsciiArtLibrary();
        
        this.initialized = true;
        if (this.DEBUG) console.log('🎨 Enhanced ASCII: Initialized with content-based generation');
    }

    static async initializeAsciiArtLibrary() {
        // Load ASCII Art library from CDN
        if (!window.AsciiArt) {
            await this.loadAsciiArtLibrary();
        }
        
        this.asciiArtLibrary = window.AsciiArt;
        if (this.DEBUG) console.log('🎨 Enhanced ASCII: ASCII Art library loaded');
    }

    static async loadAsciiArtLibrary() {
        return new Promise((resolve, reject) => {
            // Load the main ASCII Art library
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/ascii-art@2.8.5/dist/ascii-art.js';
            script.onload = () => {
                if (this.DEBUG) console.log('🎨 Enhanced ASCII: ASCII Art library loaded from CDN');
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Extract nouns from content description
    static extractNouns(content) {
        const nouns = [];
        const text = (content.description || content.title || '').toLowerCase();
        
        // Extract nouns from patterns
        Object.entries(this.NOUN_PATTERNS).forEach(([category, categoryNouns]) => {
            categoryNouns.forEach(noun => {
                if (text.includes(noun.toLowerCase())) {
                    nouns.push({ noun, category });
                }
            });
        });
        
        // Add genre-specific nouns
        if (content.genre) {
            nouns.push(...this.getGenreSpecificNouns(content.genre));
        }
        
        return nouns.slice(0, 5); // Limit to top 5 nouns
    }

    static getGenreSpecificNouns(genre) {
        const genreNouns = {
            'drama': ['emotion', 'conflict', 'relationship', 'family', 'love', 'loss', 'struggle', 'journey'],
            'comedy': ['laugh', 'joke', 'fun', 'humor', 'wit', 'silly', 'funny', 'amusing'],
            'sci-fi': ['space', 'future', 'technology', 'robot', 'alien', 'spaceship', 'planet', 'time'],
            'horror': ['fear', 'monster', 'ghost', 'dark', 'night', 'shadow', 'death', 'evil'],
            'action': ['fight', 'battle', 'weapon', 'hero', 'villain', 'explosion', 'chase', 'adventure'],
            'romance': ['love', 'heart', 'romance', 'kiss', 'relationship', 'passion', 'emotion'],
            'thriller': ['suspense', 'mystery', 'tension', 'danger', 'chase', 'investigation', 'clue'],
            'fantasy': ['magic', 'wizard', 'dragon', 'castle', 'kingdom', 'quest', 'adventure', 'mythical']
        };
        
        return (genreNouns[genre.toLowerCase()] || []).map(noun => ({ noun, category: 'genre' }));
    }

    // Generate ASCII art based on content nouns
    static async generateContentBasedArt(content, meta = {}) {
        const nouns = this.extractNouns(content);
        if (this.DEBUG) console.log('🎨 Enhanced ASCII: Extracted nouns:', nouns);
        
        if (nouns.length === 0) {
            return this.generateFallbackArt(content, meta);
        }
        
        // Select primary noun for ASCII generation
        const primaryNoun = nouns[0];
        const asciiArt = await this.generateNounBasedArt(primaryNoun, content, meta);
        
        return this.combineWithMetadata(asciiArt, content, meta, nouns);
    }

    static async generateNounBasedArt(nounData, content, meta) {
        const { noun, category } = nounData;
        
        try {
            // Generate ASCII art using the library
            if (this.asciiArtLibrary && this.asciiArtLibrary.font) {
                const art = await this.asciiArtLibrary.font(noun.toUpperCase(), 'Standard').completed();
                return this.animateAsciiArt(art, category, meta.elapsedTime || 0);
            }
        } catch (error) {
            if (this.DEBUG) console.warn('🎨 Enhanced ASCII: Font generation failed, using fallback:', error);
        }
        
        // Fallback to pattern-based generation
        return this.generatePatternBasedArt(noun, category, meta.elapsedTime || 0);
    }

    static generatePatternBasedArt(noun, category, elapsedTime) {
        const patterns = {
            characters: [
                ['  ╭─────╮  ', '  │  👤  │  ', '  │  HERO │  ', '  ╰─────╯  '],
                ['  ╭─────╮  ', '  │  🛡️  │  ', '  │  WAR  │  ', '  ╰─────╯  '],
                ['  ╭─────╮  ', '  │  ⚔️  │  ', '  │  FIGHT│  ', '  ╰─────╯  ']
            ],
            objects: [
                ['  ╭─────╮  ', '  │  ⚡  │  ', '  │  ITEM │  ', '  ╰─────╯  '],
                ['  ╭─────╮  ', '  │  🔧  │  ', '  │  TOOL │  ', '  ╰─────╯  '],
                ['  ╭─────╮  ', '  │  ⚔️  │  ', '  │  WEAPON│  ', '  ╰─────╯  ']
            ],
            locations: [
                ['  ╭─────╮  ', '  │  🏰  │  ', '  │  PLACE│  ', '  ╰─────╯  '],
                ['  ╭─────╮  ', '  │  🌍  │  ', '  │  WORLD│  ', '  ╰─────╯  '],
                ['  ╭─────╮  ', '  │  🚀  │  ', '  │  SPACE│  ', '  ╰─────╯  ']
            ],
            actions: [
                ['  ╭─────╮  ', '  │  ⚡  │  ', '  │  ACTION│  ', '  ╰─────╯  '],
                ['  ╭─────╮  ', '  │  🔥  │  ', '  │  EVENT │  ', '  ╰─────╯  '],
                ['  ╭─────╮  ', '  │  ⚔️  │  ', '  │  BATTLE│  ', '  ╰─────╯  ']
            ],
            genre: [
                ['  ╭─────╮  ', '  │  🎭  │  ', '  │  GENRE│  ', '  ╰─────╯  '],
                ['  ╭─────╮  ', '  │  🎬  │  ', '  │  STYLE│  ', '  ╰─────╯  '],
                ['  ╭─────╮  ', '  │  🎨  │  ', '  │  THEME│  ', '  ╰─────╯  ']
            ]
        };
        
        const categoryPatterns = patterns[category] || patterns.genre;
        const patternIndex = Math.floor(elapsedTime / 3) % categoryPatterns.length;
        const basePattern = categoryPatterns[patternIndex];
        
        // Animate the pattern
        return this.animatePattern(basePattern, elapsedTime);
    }

    static animatePattern(pattern, elapsedTime) {
        const shiftAmount = Math.floor(elapsedTime * 0.5) % 10;
        const waveEffect = Math.sin(elapsedTime * 0.3) * 2;
        
        return pattern.map((line, index) => {
            const shift = (shiftAmount + Math.floor(waveEffect * index)) % line.length;
            return line.substring(shift) + line.substring(0, shift);
        }).join('\n');
    }

    static animateAsciiArt(art, category, elapsedTime) {
        const lines = art.split('\n');
        const shiftAmount = Math.floor(elapsedTime * 0.2) % 5;
        const waveEffect = Math.sin(elapsedTime * 0.4) * 1;
        
        return lines.map((line, index) => {
            const shift = (shiftAmount + Math.floor(waveEffect * index)) % line.length;
            return line.substring(shift) + line.substring(0, shift);
        }).join('\n');
    }

    static combineWithMetadata(asciiArt, content, meta, nouns) {
        const title = content.title || 'Unknown';
        const genre = content.genre || 'general';
        const duration = meta.duration || '';
        const index = meta.index || '';
        const total = meta.total || '';
        
        // Create metadata string
        let metadata = `[${duration}m] [${index}/${total}] ${title}`;
        if (genre) metadata += ` | ${genre.toUpperCase()}`;
        
        // Add noun information
        if (nouns.length > 0) {
            const nounList = nouns.slice(0, 3).map(n => n.noun).join(', ');
            metadata += ` | ${nounList}`;
        }
        
        // Create the complete display
        return `
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
${asciiArt.split('\n').map(line => `║ ${line.padEnd(70)} ║`).join('\n')}
║                                                                              ║
║  ${metadata.padEnd(68)}  ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
        `.trim();
    }

    static generateFallbackArt(content, meta) {
        const title = content.title || 'Unknown';
        const genre = content.genre || 'general';
        
        return `
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                           ${title.toUpperCase().padEnd(40)}                                 ║
║                                                                              ║
║                              [${genre.toUpperCase()}]                                    ║
║                                                                              ║
║                              INDEXING...                                    ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
        `.trim();
    }

    // Main generation function
    static async generate(title, meta = {}) {
        await this.init();
        
        if (this.DEBUG) console.log('🎨 Enhanced ASCII: Generating for:', title);
        
        // Create content object from title and meta
        const content = {
            title: title,
            genre: meta.genre || 'general',
            description: meta.description || '',
            duration: meta.duration,
            season: meta.season,
            episode: meta.episode
        };
        
        const art = await this.generateContentBasedArt(content, meta);
        if (this.DEBUG) console.log('🎨 Enhanced ASCII: Generated content-based art');
        return art;
    }

    // Integration methods
    static async drawAscii(title, meta) {
        const art = await this.generate(title, meta);
        const display = document.querySelector('.nokia-visual .content-display');
        if (display) {
            await this.animateTransition(display, art);
            this.startAnimationLoop(display, title, meta);
            if (this.DEBUG) console.log('🎨 Enhanced ASCII: Injected into DOM');
        }
    }

    static async animateTransition(display, newArt) {
        const currentContent = display.innerHTML;
        const newContent = `<pre>${newArt}</pre>`;
        
        display.style.transition = 'opacity 0.3s ease-out';
        display.style.opacity = '0';
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        display.innerHTML = newContent;
        display.style.opacity = '1';
    }

    static startAnimationLoop(display, title, meta) {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }
        
        const updateInterval = window.fastMode ? 50 : 100;
        
        this.animationInterval = setInterval(async () => {
            const currentTime = Date.now() / 1000;
            const updatedMeta = { ...meta, elapsedTime: currentTime };
            const newArt = await this.generate(title, updatedMeta);
            
            display.innerHTML = `<pre>${newArt}</pre>`;
        }, updateInterval);
    }

    static stopAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
        if (this.DEBUG) console.log('🎨 Enhanced ASCII: Animation stopped');
    }

    // Additional integration methods
    static async generateNokiaDisplay(title, meta = {}) {
        return await this.generate(title, meta);
    }

    static updateNokiaSection(asciiArt) {
        const display = document.querySelector('.nokia-visual .content-display');
        if (display) {
            display.innerHTML = `<pre>${asciiArt}</pre>`;
        }
    }

    static startAnimation(mode, data) {
        const title = data?.title || data?.bucket || 'READY';
        const meta = {
            title: title,
            genre: data?.genre || 'general',
            description: data?.description || '',
            duration: data?.duration || '',
            index: data?.index || '',
            total: data?.total || '',
            service: data?.service || 'RUMI',
            elapsedTime: Date.now() / 1000
        };
        
        this.drawAscii(title, meta);
    }

    static updateContent(data) {
        const title = data?.title || 'READY';
        const meta = {
            title: title,
            genre: data?.genre || 'general',
            description: data?.description || '',
            duration: data?.duration || '',
            index: data?.index || '',
            total: data?.total || '',
            service: data?.service || 'RUMI',
            elapsedTime: Date.now() / 1000
        };
        
        this.drawAscii(title, meta);
    }

    static initialize() {
        this.init().then(() => {
            this.drawAscii('READY', {
                duration: 0,
                index: 0,
                total: 0,
                title: 'READY',
                genre: 'SYSTEM',
                service: 'RUMI',
                elapsedTime: Date.now() / 1000
            });
        });
    }
}

// Create global instance
window.EnhancedRumiAscii = new EnhancedRumiASCII();

// Initialize and render READY placeholder immediately
console.log('🎨 Enhanced ASCII: Starting initialization...');
EnhancedRumiASCII.init?.().then(() => {
    console.log('🎨 Enhanced ASCII: Init complete, drawing READY...');
    EnhancedRumiASCII.drawAscii?.('READY', {
        duration: 0,
        index: 0,
        total: 0,
        title: 'READY',
        genre: 'SYSTEM',
        service: 'RUMI',
        elapsedTime: Date.now() / 1000
    });
}).catch(err => {
    console.error('🎨 Enhanced ASCII: Init failed:', err);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedRumiASCII;
} 