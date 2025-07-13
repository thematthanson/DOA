/**
 * Enhanced ASCII Display
 * Advanced ASCII art display with dynamic content generation and animations
 * Integrates with AsciiArtEngine for robust ASCII art generation
 */

(function(window) {
    'use strict';

    // Enhanced ASCII Display Namespace
    window.EnhancedAsciiDisplay = {
        version: '2.0.0',
        
        // Configuration
        config: {
            containerId: 'ascii-display',
            animationSpeed: 100,
            scrollSpeed: 50,
            enableAnimations: true,
            enableScrolling: true,
            enableDynamicContent: true,
            defaultFont: 'doom',
            defaultStyle: 'green',
            maxWidth: 80,
            autoUpdate: true,
            updateInterval: 5000
        },

        // State
        state: {
            isActive: false,
            currentContent: null,
            animationFrame: null,
            scrollPosition: 0,
            currentFrame: 0,
            animationFrames: [],
            isAnimating: false,
            isScrolling: false
        },

        // Content templates
        templates: {
            ready: {
                text: 'RUMI READY',
                font: 'doom',
                style: 'green',
                animation: 'typewriter'
            },
            loading: {
                text: 'LOADING',
                font: 'standard',
                style: 'yellow',
                animation: 'pulse'
            },
            error: {
                text: 'ERROR',
                font: 'doom',
                style: 'red',
                animation: 'shake'
            },
            success: {
                text: 'SUCCESS',
                font: 'doom',
                style: 'green',
                animation: 'bounce'
            }
        },

        // Animation patterns
        animations: {
            typewriter: {
                frames: [],
                generate: function(text, font, style) {
                    const frames = [];
                    const asciiText = window.AsciiArtEngine ? 
                        window.AsciiArtEngine.font(text, font) : text;
                    const lines = asciiText.split('\n');
                    
                    for (let i = 0; i < lines.length; i++) {
                        const frame = lines.slice(0, i + 1).join('\n');
                        frames.push(window.AsciiArtEngine ? 
                            window.AsciiArtEngine.style(frame, style, true) : frame);
                    }
                    
                    return frames;
                }
            },
            
            pulse: {
                frames: [],
                generate: function(text, font, style) {
                    const frames = [];
                    const asciiText = window.AsciiArtEngine ? 
                        window.AsciiArtEngine.font(text, font) : text;
                    
                    // Create pulse effect by varying intensity
                    for (let i = 0; i < 10; i++) {
                        const intensity = Math.sin(i * 0.5) * 0.5 + 0.5;
                        const frame = window.AsciiArtEngine ? 
                            window.AsciiArtEngine.style(asciiText, style, true) : asciiText;
                        frames.push(frame);
                    }
                    
                    return frames;
                }
            },
            
            shake: {
                frames: [],
                generate: function(text, font, style) {
                    const frames = [];
                    const asciiText = window.AsciiArtEngine ? 
                        window.AsciiArtEngine.font(text, font) : text;
                    const lines = asciiText.split('\n');
                    
                    // Create shake effect
                    for (let i = 0; i < 8; i++) {
                        const offset = Math.sin(i) * 2;
                        const frame = lines.map(line => ' '.repeat(Math.abs(offset)) + line).join('\n');
                        frames.push(window.AsciiArtEngine ? 
                            window.AsciiArtEngine.style(frame, style, true) : frame);
                    }
                    
                    return frames;
                }
            },
            
            bounce: {
                frames: [],
                generate: function(text, font, style) {
                    const frames = [];
                    const asciiText = window.AsciiArtEngine ? 
                        window.AsciiArtEngine.font(text, font) : text;
                    const lines = asciiText.split('\n');
                    
                    // Create bounce effect
                    for (let i = 0; i < 12; i++) {
                        const offset = Math.abs(Math.sin(i * 0.5)) * 3;
                        const frame = '\n'.repeat(Math.floor(offset)) + asciiText;
                        frames.push(window.AsciiArtEngine ? 
                            window.AsciiArtEngine.style(frame, style, true) : frame);
                    }
                    
                    return frames;
                }
            },
            
            wave: {
                frames: [],
                generate: function(text, font, style) {
                    const frames = [];
                    const asciiText = window.AsciiArtEngine ? 
                        window.AsciiArtEngine.font(text, font) : text;
                    const lines = asciiText.split('\n');
                    
                    // Create wave effect
                    for (let i = 0; i < 20; i++) {
                        const frame = lines.map((line, index) => {
                            const waveOffset = Math.sin(index * 0.5 + i * 0.3) * 3;
                            return ' '.repeat(Math.max(0, waveOffset)) + line;
                        }).join('\n');
                        
                        frames.push(window.AsciiArtEngine ? 
                            window.AsciiArtEngine.style(frame, style, true) : frame);
                    }
                    
                    return frames;
                }
            }
        },

        // Core methods
        methods: {
            /**
             * Initialize the display
             */
            init: function() {
                console.log('🎯 RUMI: Enhanced ASCII Display initializing...');
                
                this.container = document.getElementById(this.config.containerId);
                if (!this.container) {
                    console.error('🎯 RUMI: ASCII display container not found:', this.config.containerId);
                    return false;
                }
                
                this.state.isActive = true;
                this.setupContainer();
                this.showReady();
                
                console.log('🎯 RUMI: Enhanced ASCII Display initialized');
                return true;
            },

            /**
             * Set up the display container
             */
            setupContainer: function() {
                this.container.style.fontFamily = 'monospace';
                this.container.style.fontSize = '12px';
                this.container.style.lineHeight = '1.2';
                this.container.style.whiteSpace = 'pre';
                this.container.style.overflow = 'hidden';
                this.container.style.textAlign = 'center';
                this.container.style.color = '#00ff41';
                this.container.style.backgroundColor = '#000';
                this.container.style.padding = '10px';
                this.container.style.border = '1px solid #333';
                this.container.style.borderRadius = '4px';
                this.container.style.minHeight = '200px';
                this.container.style.display = 'flex';
                this.container.style.alignItems = 'center';
                this.container.style.justifyContent = 'center';
            },

            /**
             * Show ready state
             */
            showReady: function() {
                this.displayTemplate('ready');
            },

            /**
             * Show loading state
             */
            showLoading: function() {
                this.displayTemplate('loading');
            },

            /**
             * Show error state
             */
            showError: function(message) {
                this.displayTemplate('error');
                if (message) {
                    setTimeout(() => {
                        this.displayText(message, 'standard', 'red');
                    }, 2000);
                }
            },

            /**
             * Show success state
             */
            showSuccess: function() {
                this.displayTemplate('success');
            },

            /**
             * Display a template
             */
            displayTemplate: function(templateName) {
                const template = this.templates[templateName];
                if (!template) {
                    console.error('🎯 RUMI: Template not found:', templateName);
                    return;
                }
                
                this.displayText(template.text, template.font, template.style, template.animation);
            },

            /**
             * Display text with ASCII art
             */
            displayText: function(text, font, style, animation) {
                if (!this.state.isActive) return;
                
                // Stop current animation
                this.stopAnimation();
                
                // Generate ASCII art
                let asciiArt = '';
                if (window.AsciiArtEngine) {
                    asciiArt = window.AsciiArtEngine.font(text, font || this.config.defaultFont);
                    if (style) {
                        asciiArt = window.AsciiArtEngine.style(asciiArt, style, true);
                    }
                } else {
                    asciiArt = text;
                }
                
                // Store current content
                this.state.currentContent = {
                    text: text,
                    font: font,
                    style: style,
                    ascii: asciiArt
                };
                
                // Handle animation
                if (animation && this.config.enableAnimations) {
                    this.startAnimation(text, font, style, animation);
                } else {
                    this.displayStatic(asciiArt);
                }
            },

            /**
             * Display static content
             */
            displayStatic: function(content) {
                if (!this.container) return;
                
                this.container.innerHTML = content;
                this.container.style.color = this.getColorForStyle(this.state.currentContent?.style);
            },

            /**
             * Start animation
             */
            startAnimation: function(text, font, style, animationType) {
                if (!this.animations[animationType]) {
                    console.error('🎯 RUMI: Animation not found:', animationType);
                    this.displayStatic(this.state.currentContent.ascii);
                    return;
                }
                
                this.state.animationFrames = this.animations[animationType].generate(text, font, style);
                this.state.currentFrame = 0;
                this.state.isAnimating = true;
                
                this.animateFrame();
            },

            /**
             * Animate frame
             */
            animateFrame: function() {
                if (!this.state.isAnimating || !this.state.animationFrames.length) {
                    this.state.isAnimating = false;
                    return;
                }
                
                const frame = this.state.animationFrames[this.state.currentFrame];
                this.displayStatic(frame);
                
                this.state.currentFrame = (this.state.currentFrame + 1) % this.state.animationFrames.length;
                
                this.state.animationFrame = setTimeout(() => {
                    this.animateFrame();
                }, this.config.animationSpeed);
            },

            /**
             * Stop animation
             */
            stopAnimation: function() {
                this.state.isAnimating = false;
                if (this.state.animationFrame) {
                    clearTimeout(this.state.animationFrame);
                    this.state.animationFrame = null;
                }
            },

            /**
             * Display content from metadata
             */
            displayFromMetadata: function(metadata, options) {
                if (!window.AsciiArtEngine) {
                    console.error('🎯 RUMI: ASCII Art Engine not available');
                    return;
                }
                
                options = options || {};
                
                try {
                    const asciiArt = window.AsciiArtEngine.fromMetadata(metadata, {
                        showTitle: options.showTitle !== false,
                        showGenre: options.showGenre !== false,
                        showService: options.showService !== false,
                        addBorder: options.addBorder !== false
                    });
                    
                    this.displayStatic(asciiArt);
                    
                    // Store metadata content
                    this.state.currentContent = {
                        metadata: metadata,
                        ascii: asciiArt,
                        type: 'metadata'
                    };
                    
                } catch (error) {
                    console.error('🎯 RUMI: Error generating ASCII art from metadata:', error);
                    this.showError('Failed to generate ASCII art');
                }
            },

            /**
             * Start scrolling animation
             */
            startScrolling: function() {
                if (!this.config.enableScrolling || this.state.isScrolling) return;
                
                this.state.isScrolling = true;
                this.scrollContent();
            },

            /**
             * Stop scrolling animation
             */
            stopScrolling: function() {
                this.state.isScrolling = false;
            },

            /**
             * Scroll content
             */
            scrollContent: function() {
                if (!this.state.isScrolling || !this.state.currentContent) return;
                
                const content = this.state.currentContent.ascii;
                const lines = content.split('\n');
                
                // Rotate lines
                const rotatedLines = [...lines.slice(1), lines[0]];
                const scrolledContent = rotatedLines.join('\n');
                
                this.displayStatic(scrolledContent);
                this.state.currentContent.ascii = scrolledContent;
                
                setTimeout(() => {
                    this.scrollContent();
                }, this.config.scrollSpeed);
            },

            /**
             * Get color for style
             */
            getColorForStyle: function(style) {
                if (!window.AsciiArtEngine) return '#00ff41';
                
                const cssColors = window.AsciiArtEngine.cssColors;
                return cssColors[style] || cssColors.green;
            },

            /**
             * Update display with new content
             */
            update: function(content) {
                if (typeof content === 'string') {
                    this.displayText(content, this.config.defaultFont, this.config.defaultStyle);
                } else if (typeof content === 'object' && content.metadata) {
                    this.displayFromMetadata(content.metadata, content.options);
                } else if (typeof content === 'object' && content.text) {
                    this.displayText(content.text, content.font, content.style, content.animation);
                } else {
                    console.error('🎯 RUMI: Invalid content format:', content);
                }
            },

            /**
             * Clear display
             */
            clear: function() {
                if (this.container) {
                    this.container.innerHTML = '';
                }
                this.stopAnimation();
                this.stopScrolling();
                this.state.currentContent = null;
            },

            /**
             * Set configuration
             */
            setConfig: function(newConfig) {
                Object.assign(this.config, newConfig);
            },

            /**
             * Get current state
             */
            getState: function() {
                return {
                    isActive: this.state.isActive,
                    isAnimating: this.state.isAnimating,
                    isScrolling: this.state.isScrolling,
                    currentContent: this.state.currentContent,
                    config: { ...this.config }
                };
            }
        },

        // Public API
        init: function() {
            return this.methods.init.call(this);
        },

        showReady: function() {
            return this.methods.showReady.call(this);
        },

        showLoading: function() {
            return this.methods.showLoading.call(this);
        },

        showError: function(message) {
            return this.methods.showError.call(this, message);
        },

        showSuccess: function() {
            return this.methods.showSuccess.call(this);
        },

        displayText: function(text, font, style, animation) {
            return this.methods.displayText.call(this, text, font, style, animation);
        },

        displayFromMetadata: function(metadata, options) {
            return this.methods.displayFromMetadata.call(this, metadata, options);
        },

        startScrolling: function() {
            return this.methods.startScrolling.call(this);
        },

        stopScrolling: function() {
            return this.methods.stopScrolling.call(this);
        },

        update: function(content) {
            return this.methods.update.call(this, content);
        },

        clear: function() {
            return this.methods.clear.call(this);
        },

        setConfig: function(newConfig) {
            return this.methods.setConfig.call(this, newConfig);
        },

        getState: function() {
            return this.methods.getState.call(this);
        }
    };

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = window.EnhancedAsciiDisplay;
    }

})(typeof window !== 'undefined' ? window : this); 