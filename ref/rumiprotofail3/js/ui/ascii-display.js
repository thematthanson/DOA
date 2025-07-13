// ================================
// RUMI ASCII DISPLAY
// Nokia-style ASCII art display
// ================================

console.log('🎯 ASCII: Module loading...');

export class RumiASCII {
    static DEBUG = true;
    static initialized = false;
    static fontReady = null;
    static animationInterval = null;

    static async init() {
        if (this.initialized) return;
        
        // Wait for figlet to be available
        await new Promise((resolve) => {
            let tries = 0;
            const check = () => {
                if (window.figlet && window.figlet.loadFont) {
                    resolve();
                } else if (tries++ < 30) {
                    setTimeout(check, 100);
                } else {
                    console.warn('ASCII: figlet library not found');
                    resolve();
                }
            };
            check();
        });

        // Load Standard font from CDN
        if (window.figlet && window.figlet.loadFont) {
            this.fontReady = new Promise((res, rej) => {
                // Load font from CDN
                fetch('https://unpkg.com/figlet@1.5.2/fonts/Standard.flf')
                    .then(response => response.text())
                    .then(fontData => {
                        window.figlet.parseFont('Standard', fontData);
                        if (this.DEBUG) console.log('🎯 ASCII: Standard font loaded from CDN');
                        res();
                    })
                    .catch(err => {
                        console.error('ASCII: font load failed', err);
                        rej(err);
                    });
            });
        }

        this.initialized = true;
        if (this.DEBUG) console.log('🎯 ASCII: Simple generator initialized');
    }

    static generateSimpleBanner(text, meta = {}) {
        return this.generateSceneArt(text, meta);
    }

    static generateSceneArt(title, meta = {}) {
        const genre = meta.genre || 'general';
        const width = 40;
        const height = 8;
        
        // Get animated ASCII pattern based on genre
        const pattern = this.getAnimatedPattern(genre, meta.elapsedTime || 0);
        
        // Create scrolling title text
        const scrollingTitle = this.createScrollingTitle(title, meta.elapsedTime || 0, width);
        
        // Create scrolling metadata
        const scrollingMetadata = this.createScrollingMetadata(meta, meta.elapsedTime || 0);
        
        return pattern + '\n' + scrollingTitle + '\n' + scrollingMetadata;
    }

    static getAnimatedPattern(genre, elapsedTime) {
        const templates = {
            'drama': [
                ["        ########################        ","       ##<<<<<<<<<<<<<<<<<<<<##       ","      ##################################      ","     ##>>>>>>>>>>>>>>>>>>>>>>>>##     ","    ####################################    ","   ##<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<##   ","  ######################################  "," ######################################## "],
                ["      ##################################      ","     ##////////////////////////##     ","    ####################################    ","   ##\\\\\\\\\\\\\\\\\\\\\\\\##   ","  ######################################  "," ##////////////////////////## ","########################################"," ##\\\\\\\\\\\\\\\\\\\\\\\\## "],
                ["        ########################        ","       ##========================##       ","      ##################################      ","     ##++++++++++++++++++++++++##     ","    ####################################    ","   ##============================##   ","  ######################################  "," ######################################## "]
            ],
            'sci-fi': [
                ["  ########################################  ","    ##||||||||||||||||||||||||||||##    ","   ##..####....####....####....####....##   ","     ##<<<<<<<<<<<<>>>>>>>>>>>>>>##     ","   ##..####....####....####....####....##   ","  ########################################  "," ##||||||||||||||||||||||||||||## ","########################################"],
                ["          ################          ","        ##================##        ","    ####################################    ","      ##////////////////////////##      ","      ##~~~~~~~~~~~~~~~~~~~~~~~~##      ","          ################          ","        ##================##        ","    ####################################    "],
                ["    ########################    ","   ##||||||||||||||||||||##   ","  ##################################  "," ##>>>>>>>>>>>>>>>>>>>>>>>>## ","########################################"," ##||||||||||||||||||||||||## "]
            ],
            'comedy': [
                ["        ########################        ","       ##~~~~~~~~~~~~~~~~~~~~~~~~##       ","      ##################################      ","     ##^^^^^^^^^^^^^^^^^^^^^^^^##     ","    ####################################    ","   ##vvvvvvvvvvvvvvvvvvvvvvvvvvvv##   ","  ######################################  "," ######################################## "],
                ["      ##################################      ","     ##{{{{{{{{{{{{{{{{{{{{{{{{{{{{##     ","    ####################################    ","   ##}}}}}}}}}}}}}}}}}}}}}}}}##   ","  ######################################  "," ##{{{{{{{{{{{{{{{{{{{{{{{{{{{{## ","########################################"," ##}}}}}}}}}}}}}}}}}}}}}}}}## "],
                ["        ########################        ","       ##))))))))))))))))))))))))##       ","      ##################################      ","     ##((((((((((((((((((((((((##     ","    ####################################    ","   ##))))))))))))))))))))))))##   ","  ######################################  "," ######################################## "]
            ],
            'horror': [
                ["        ########################        ","       ##@@@@@@@@@@@@@@@@@@@@@@@@##       ","      ##################################      ","     ##$$$$$$$$$$$$$$$$$$$$$$$$##     ","    ####################################    ","   ##%%%%%%%%%%%%%%%%%%%%%%%%%%%%##   ","  ######################################  "," ######################################## "],
                ["      ##################################      ","     ##!!!!!!!!!!!!!!!!!!!!!!!!##     ","    ####################################    ","   ##????????????????????????##   ","  ######################################  "," ##!!!!!!!!!!!!!!!!!!!!!!!!## ","########################################"," ##????????????????????????## "],
                ["        ########################        ","       ##~~~~~~~~~~~~~~~~~~~~~~~~##       ","      ##################################      ","     ##@@@@@@@@@@@@@@@@@@@@@@@@##     ","    ####################################    ","   ##$$$$$$$$$$$$$$$$$$$$$$$$##   ","  ######################################  "," ######################################## "]
            ],
            'general': [
                ["        ########################        ","       ##WWWWWWWWWWWWWWWWWWWWWWWW##       ","      ##################################      ","     ##################################     ","    ####################################    ","   ##888888888888888888888888888888##   ","  ######################################  "," ######################################## "],
                ["      ##################################      ","     ##@@@@@@@@@@@@@@@@@@@@@@@@@@@@##     ","    ####################################    ","   ##000000000000000000000000000000##   ","  ######################################  "," ##@@@@@@@@@@@@@@@@@@@@@@@@@@@@## ","########################################"," ##000000000000000000000000000000## "],
                ["        ########################        ","       ##============================##       ","      ##################################      ","     ##++++++++++++++++++++++++++++##     ","    ####################################    ","   ##============================##   ","  ######################################  "," ######################################## "]
            ]
        };
        
        const genreTemplates = templates[genre.toLowerCase()] || templates.general;
        // Faster template cycling in fast mode
        const cycleSpeed = window.fastMode ? 1.5 : 3.0;
        const templateIndex = Math.floor(elapsedTime / cycleSpeed) % genreTemplates.length;
        const template = genreTemplates[templateIndex];
        
        // Apply animation effects
        const animatedTemplate = this.animateTemplate(template, elapsedTime);
        
        return animatedTemplate.join('\n');
    }

    static animateTemplate(template, elapsedTime) {
        // Dynamic shifting animation - faster in fast mode
        const baseShiftSpeed = 0.2;
        const fastModeMultiplier = window.fastMode ? 2.5 : 1.0;
        const shiftSpeed = baseShiftSpeed * fastModeMultiplier;
        const shiftAmount = Math.floor(elapsedTime * shiftSpeed);
        
        // Add some wave effect for more dynamism
        const waveEffect = Math.sin(elapsedTime * 0.5) * 2;
        
        return template.map((row, index) => {
            const shift = (shiftAmount + Math.floor(waveEffect * index)) % row.length;
            return row.substring(shift) + row.substring(0, shift);
        });
    }

    static createScrollingTitle(title, elapsedTime, width) {
        // Faster scrolling in fast mode
        const baseScrollSpeed = 0.1;
        const fastModeMultiplier = window.fastMode ? 3.0 : 1.0;
        const scrollSpeed = baseScrollSpeed * fastModeMultiplier;
        const scrollPosition = Math.floor(elapsedTime * scrollSpeed);
        
        // Create scrolling text effect
        const paddedTitle = title.padEnd(width + 10);
        const scrollOffset = scrollPosition % paddedTitle.length;
        const visibleText = paddedTitle.substring(scrollOffset, scrollOffset + width - 2);
        
        return `╔════════════════════════════════════════════════════╗\n║ ${visibleText.padEnd(width - 2)} ║\n╚════════════════════════════════════════════════════╝`;
    }

    static createScrollingMetadata(meta, elapsedTime) {
        const duration = meta.duration || '';
        const index = meta.index || '';
        const total = meta.total || '';
        const title = meta.title || '';
        const genre = meta.genre || '';
        const season = meta.season || '';
        const episode = meta.episode || '';
        const description = meta.description || '';
        const service = meta.service || '';
        const year = meta.year || '';
        
        if (this.DEBUG) console.log('🎯 ASCII: Creating metadata with:', { duration, index, total, title, genre, season, episode, service, year });
        
        // Create enhanced metadata string with more robust content data
        let metadata = `[${duration}m] [${index}/${total}] ${title}`;
        
        // If we have no meaningful data, show a fallback
        if (!duration && !index && !total && !title) {
            metadata = `[READY] [0/0] Waiting for content...`;
        }
        
        // Add genre if available
        if (genre) {
            metadata += ` | ${genre.toUpperCase()}`;
        }
        
        // Add service if available
        if (service) {
            metadata += ` | ${service}`;
        }
        
        // Add season/episode info if available
        if (season && episode && season !== 'N/A') {
            metadata += ` | S${season}E${episode}`;
        } else if (season && season !== 'N/A') {
            metadata += ` | S${season}`;
        }
        
        // Add year if available (for movies)
        if (year && !season) {
            metadata += ` | ${year}`;
        }
        
        // Add description snippet if available (truncated)
        if (description && description.length > 0) {
            const descSnippet = description.substring(0, 30) + (description.length > 30 ? '...' : '');
            metadata += ` | ${descSnippet}`;
        }
        
        if (this.DEBUG) console.log('🎯 ASCII: Final metadata string:', metadata);
        
        // Faster scrolling in fast mode
        const baseScrollSpeed = 0.08;
        const fastModeMultiplier = window.fastMode ? 2.5 : 1.0;
        const scrollSpeed = baseScrollSpeed * fastModeMultiplier;
        const scrollPosition = Math.floor(elapsedTime * scrollSpeed);
        
        // Create scrolling effect
        const width = 40;
        const paddedMetadata = metadata.padEnd(width + 40); // More padding for longer content
        const scrollOffset = scrollPosition % paddedMetadata.length;
        const visibleMetadata = paddedMetadata.substring(scrollOffset, scrollOffset + width - 2);
        
        if (this.DEBUG) console.log('🎯 ASCII: Visible metadata:', visibleMetadata);
        
        // For debugging, use simple metadata without animation
        if (this.DEBUG) {
            return `╔════════════════════════════════════════════════════╗\n║ ${metadata.substring(0, width - 2).padEnd(width - 2)} ║\n╚════════════════════════════════════════════════════╝`;
        }
        
        // Normal scrolling metadata
        return `╔════════════════════════════════════════════════════╗\n║ <span class="metadata-crawl">${visibleMetadata.padEnd(width - 2)}</span> ║\n╚════════════════════════════════════════════════════╝`;
    }

    static async generate(title, meta = {}) {
        await this.init();

        if (this.DEBUG) console.log('🎯 ASCII: Generating for:', title);
        
        // Generate animated ASCII art
        const animatedArt = this.generateSceneArt(title, meta);
        if (this.DEBUG) console.log('🎯 ASCII generated ok');
        return animatedArt;
    }

    static async drawAscii(title, meta) {
        const art = await this.generate(title, meta);
        const display = document.querySelector('.nokia-visual .content-display');
        if (display) {
            // Animate the transition
            await this.animateTransition(display, art);
            // Start continuous animation loop
            this.startAnimationLoop(display, title, meta);
            if (this.DEBUG) console.log('🎯 ASCII injected into DOM');
        }
    }

    static async animateTransition(display, newArt) {
        const currentContent = display.innerHTML;
        const newContent = `<pre>${newArt}</pre>`;
        
        // Fade out current content
        display.style.transition = 'opacity 0.3s ease-out';
        display.style.opacity = '0';
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Update content
        display.innerHTML = newContent;
        
        // Fade in new content
        display.style.opacity = '1';
        
        // Start metadata crawl animation for the new content
        setTimeout(() => this.startMetadataCrawl(display), 100);
    }

    static startMetadataCrawl(display) {
        const metadataElement = display.querySelector('.metadata-crawl');
        if (metadataElement) {
            // Reset position
            metadataElement.style.transform = 'translateX(100%)';
            
            // Animate crawl
            setTimeout(() => {
                metadataElement.style.transition = 'transform 8s linear';
                metadataElement.style.transform = 'translateX(-100%)';
            }, 100);
        }
    }

    static startAnimationLoop(display, title, meta) {
        // Clear any existing animation loop
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }
        
        // Adjust update frequency based on fast mode
        const updateInterval = window.fastMode ? 50 : 100; // Faster updates in fast mode
        
        // Start new animation loop
        this.animationInterval = setInterval(async () => {
            const currentTime = Date.now() / 1000;
            const updatedMeta = { ...meta, elapsedTime: currentTime };
            const newArt = await this.generate(title, updatedMeta);
            
            // Update without fade transition for smooth animation
            display.innerHTML = `<pre>${newArt}</pre>`;
        }, updateInterval);
    }

    static stopAnimationLoop() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
    }

    static async stopAnimation() {
        this.stopAnimationLoop();
        if (this.DEBUG) console.log('🎯 ASCII: Animation stopped');
    }
}

// Create global instance
window.RumiAscii = new RumiASCII();

// Initialize and render READY placeholder immediately
console.log('🎯 ASCII: Starting initialization...');
RumiASCII.init?.().then(() => {
    console.log('🎯 ASCII: Init complete, drawing READY...');
    RumiASCII.drawAscii?.('READY', {
        duration: 0,
        index: 0,
        total: 0,
        title: 'READY',
        genre: 'SYSTEM',
        service: 'RUMI',
        elapsedTime: Date.now() / 1000
    });
}).catch(err => {
    console.error('🎯 ASCII: Init failed:', err);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RumiASCII;
} 