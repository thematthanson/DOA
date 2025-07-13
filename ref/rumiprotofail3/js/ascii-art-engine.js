/**
 * ASCII Art Engine - Browser-Compatible Version
 * Based on ascii-art-master library, simplified for browser use
 * Provides font rendering, styling, and ASCII art generation capabilities
 */

(function(window) {
    'use strict';

    // ASCII Art Engine Namespace
    window.AsciiArtEngine = {
        version: '2.8.5-browser',
        
        // Core configuration
        config: {
            defaultFont: 'standard',
            defaultStyle: 'green',
            maxWidth: 80,
            animationSpeed: 100,
            enableColors: true
        },

        // Font definitions (simplified figlet fonts)
        fonts: {
            standard: {
                height: 6,
                chars: {
                    'A': ['  A  ', ' A A ', 'AAAAA', 'A   A', 'A   A'],
                    'B': ['BBBB ', 'B   B', 'BBBB ', 'B   B', 'BBBB '],
                    'C': [' CCCC', 'C    ', 'C    ', 'C    ', ' CCCC'],
                    'D': ['DDDD ', 'D   D', 'D   D', 'D   D', 'DDDD '],
                    'E': ['EEEEE', 'E    ', 'EEE  ', 'E    ', 'EEEEE'],
                    'F': ['FFFFF', 'F    ', 'FFF  ', 'F    ', 'F    '],
                    'G': [' GGG ', 'G    ', 'G  GG', 'G   G', ' GGG '],
                    'H': ['H   H', 'H   H', 'HHHHH', 'H   H', 'H   H'],
                    'I': [' III ', '  I  ', '  I  ', '  I  ', ' III '],
                    'J': ['   JJ', '    J', '    J', 'J   J', ' JJJ '],
                    'K': ['K   K', 'K  K ', 'KKK  ', 'K  K ', 'K   K'],
                    'L': ['L    ', 'L    ', 'L    ', 'L    ', 'LLLLL'],
                    'M': ['M   M', 'MM MM', 'M M M', 'M   M', 'M   M'],
                    'N': ['N   N', 'NN  N', 'N N N', 'N  NN', 'N   N'],
                    'O': [' OOO ', 'O   O', 'O   O', 'O   O', ' OOO '],
                    'P': ['PPPP ', 'P   P', 'PPPP ', 'P    ', 'P    '],
                    'Q': [' QQQ ', 'Q   Q', 'Q   Q', 'Q  Q ', ' QQ Q'],
                    'R': ['RRRR ', 'R   R', 'RRRR ', 'R  R ', 'R   R'],
                    'S': [' SSSS', 'S    ', ' SSS ', '    S', 'SSSS '],
                    'T': ['TTTTT', '  T  ', '  T  ', '  T  ', '  T  '],
                    'U': ['U   U', 'U   U', 'U   U', 'U   U', ' UUU '],
                    'V': ['V   V', 'V   V', 'V   V', ' V V ', '  V  '],
                    'W': ['W   W', 'W   W', 'W W W', 'WW WW', 'W   W'],
                    'X': ['X   X', ' X X ', '  X  ', ' X X ', 'X   X'],
                    'Y': ['Y   Y', ' Y Y ', '  Y  ', '  Y  ', '  Y  '],
                    'Z': ['ZZZZZ', '   Z ', '  Z  ', ' Z   ', 'ZZZZZ'],
                    ' ': ['     ', '     ', '     ', '     ', '     '],
                    '0': [' 000 ', '0   0', '0   0', '0   0', ' 000 '],
                    '1': ['  1  ', ' 11  ', '  1  ', '  1  ', ' 111 '],
                    '2': [' 222 ', '2   2', '   2 ', '  2  ', '22222'],
                    '3': [' 333 ', '3   3', '  33 ', '3   3', ' 333 '],
                    '4': ['   4 ', '  44 ', ' 4 4 ', '44444', '   4 '],
                    '5': ['55555', '5    ', '5555 ', '    5', '5555 '],
                    '6': ['  66 ', ' 6   ', '6666 ', '6   6', ' 666 '],
                    '7': ['77777', '   7 ', '  7  ', ' 7   ', '7    '],
                    '8': [' 888 ', '8   8', ' 888 ', '8   8', ' 888 '],
                    '9': [' 999 ', '9   9', ' 9999', '    9', ' 999 '],
                    '!': ['  !  ', '  !  ', '  !  ', '     ', '  !  '],
                    '?': [' ??? ', '?   ?', '   ? ', '     ', '  ?  '],
                    '.': ['     ', '     ', '     ', '     ', '  .  '],
                    ',': ['     ', '     ', '     ', '  ,  ', ' ,   '],
                    ':': ['     ', '  :  ', '     ', '  :  ', '     '],
                    ';': ['     ', '  ;  ', '     ', '  ;  ', ' ;   '],
                    '-': ['     ', '     ', '-----', '     ', '     '],
                    '_': ['     ', '     ', '     ', '     ', '_____'],
                    '=': ['     ', '=====', '     ', '=====', '     '],
                    '+': ['     ', '  +  ', ' +++ ', '  +  ', '     '],
                    '*': ['     ', ' * * ', '  *  ', ' * * ', '     '],
                    '/': ['    /', '   / ', '  /  ', ' /   ', '/    '],
                    '\\': ['\\    ', ' \\   ', '  \\  ', '   \\ ', '    \\'],
                    '|': ['  |  ', '  |  ', '  |  ', '  |  ', '  |  '],
                    '(': ['  (  ', ' (   ', ' (   ', ' (   ', '  (  '],
                    ')': ['  )  ', '   ) ', '   ) ', '   ) ', '  )  '],
                    '[': ['  [[ ', ' [   ', ' [   ', ' [   ', '  [[ '],
                    ']': ['  ]] ', '   ] ', '   ] ', '   ] ', '  ]] '],
                    '{': ['   { ', '  {  ', ' {   ', '  {  ', '   { '],
                    '}': [' }   ', '  }  ', '   } ', '  }  ', ' }   '],
                    '<': ['   < ', '  <  ', ' <   ', '  <  ', '   < '],
                    '>': [' >   ', '  >  ', '   > ', '  >  ', ' >   '],
                    '@': [' @@@ ', '@   @', '@ @@ ', '@    ', ' @@@ '],
                    '#': [' # # ', '#####', ' # # ', '#####', ' # # '],
                    '$': ['  $  ', ' $$$ ', '$ $  ', ' $$$ ', '  $  '],
                    '%': ['%   %', '   % ', '  %  ', ' %   ', '%   %'],
                    '^': ['  ^  ', ' ^ ^ ', '     ', '     ', '     '],
                    '&': [' &   ', '& &  ', ' &   ', '& & &', ' & & '],
                    '~': ['     ', ' ~ ~ ', '~ ~  ', '     ', '     ']
                }
            },
            doom: {
                height: 6,
                chars: {
                    'A': [' AAA ', 'A   A', 'AAAAA', 'A   A', 'A   A'],
                    'B': ['BBBB ', 'B   B', 'BBBB ', 'B   B', 'BBBB '],
                    'C': [' CCCC', 'C    ', 'C    ', 'C    ', ' CCCC'],
                    'D': ['DDDD ', 'D   D', 'D   D', 'D   D', 'DDDD '],
                    'E': ['EEEEE', 'E    ', 'EEE  ', 'E    ', 'EEEEE'],
                    'F': ['FFFFF', 'F    ', 'FFF  ', 'F    ', 'F    '],
                    'G': [' GGG ', 'G    ', 'G  GG', 'G   G', ' GGG '],
                    'H': ['H   H', 'H   H', 'HHHHH', 'H   H', 'H   H'],
                    'I': [' III ', '  I  ', '  I  ', '  I  ', ' III '],
                    'J': ['   JJ', '    J', '    J', 'J   J', ' JJJ '],
                    'K': ['K   K', 'K  K ', 'KKK  ', 'K  K ', 'K   K'],
                    'L': ['L    ', 'L    ', 'L    ', 'L    ', 'LLLLL'],
                    'M': ['M   M', 'MM MM', 'M M M', 'M   M', 'M   M'],
                    'N': ['N   N', 'NN  N', 'N N N', 'N  NN', 'N   N'],
                    'O': [' OOO ', 'O   O', 'O   O', 'O   O', ' OOO '],
                    'P': ['PPPP ', 'P   P', 'PPPP ', 'P    ', 'P    '],
                    'Q': [' QQQ ', 'Q   Q', 'Q   Q', 'Q  Q ', ' QQ Q'],
                    'R': ['RRRR ', 'R   R', 'RRRR ', 'R  R ', 'R   R'],
                    'S': [' SSSS', 'S    ', ' SSS ', '    S', 'SSSS '],
                    'T': ['TTTTT', '  T  ', '  T  ', '  T  ', '  T  '],
                    'U': ['U   U', 'U   U', 'U   U', 'U   U', ' UUU '],
                    'V': ['V   V', 'V   V', 'V   V', ' V V ', '  V  '],
                    'W': ['W   W', 'W   W', 'W W W', 'WW WW', 'W   W'],
                    'X': ['X   X', ' X X ', '  X  ', ' X X ', 'X   X'],
                    'Y': ['Y   Y', ' Y Y ', '  Y  ', '  Y  ', '  Y  '],
                    'Z': ['ZZZZZ', '   Z ', '  Z  ', ' Z   ', 'ZZZZZ'],
                    ' ': ['     ', '     ', '     ', '     ', '     ']
                }
            }
        },

        // ANSI color codes
        colors: {
            black: '\x1b[30m',
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            magenta: '\x1b[35m',
            cyan: '\x1b[36m',
            white: '\x1b[37m',
            reset: '\x1b[0m',
            bright: {
                black: '\x1b[90m',
                red: '\x1b[91m',
                green: '\x1b[92m',
                yellow: '\x1b[93m',
                blue: '\x1b[94m',
                magenta: '\x1b[95m',
                cyan: '\x1b[96m',
                white: '\x1b[97m'
            }
        },

        // CSS color equivalents for browser
        cssColors: {
            black: '#000000',
            red: '#ff0000',
            green: '#00ff00',
            yellow: '#ffff00',
            blue: '#0000ff',
            magenta: '#ff00ff',
            cyan: '#00ffff',
            white: '#ffffff',
            bright: {
                black: '#666666',
                red: '#ff6666',
                green: '#66ff66',
                yellow: '#ffff66',
                blue: '#6666ff',
                magenta: '#ff66ff',
                cyan: '#66ffff',
                white: '#ffffff'
            }
        },

        // Core methods
        methods: {
            /**
             * Render text using a figlet font
             * @param {string} text - Text to render
             * @param {string} fontName - Font to use (default: 'standard')
             * @param {object} options - Rendering options
             * @returns {string} Rendered ASCII art
             */
            font: function(text, fontName, options) {
                fontName = fontName || this.config.defaultFont;
                options = options || {};
                
                const font = this.fonts[fontName];
                if (!font) {
                    throw new Error(`Font '${fontName}' not found`);
                }

                const chars = text.toUpperCase().split('');
                const lines = new Array(font.height).fill('');
                
                chars.forEach(char => {
                    const charLines = font.chars[char] || font.chars[' '];
                    charLines.forEach((line, index) => {
                        lines[index] += line + ' ';
                    });
                });

                return lines.join('\n');
            },

            /**
             * Apply ANSI styling to text
             * @param {string} text - Text to style
             * @param {string} style - Style name
             * @param {boolean} reset - Whether to reset styles at end
             * @returns {string} Styled text
             */
            style: function(text, style, reset) {
                if (!this.config.enableColors) {
                    return text;
                }

                const color = this.colors[style] || this.colors.green;
                const resetCode = reset ? this.colors.reset : '';
                
                return color + text + resetCode;
            },

            /**
             * Create a bordered box around text
             * @param {string} text - Text to border
             * @param {object} options - Border options
             * @returns {string} Bordered text
             */
            border: function(text, options) {
                options = options || {};
                const lines = text.split('\n');
                const maxWidth = Math.max(...lines.map(line => line.length));
                
                const topBorder = '┌' + '─'.repeat(maxWidth) + '┐';
                const bottomBorder = '└' + '─'.repeat(maxWidth) + '┘';
                
                const borderedLines = lines.map(line => {
                    const padding = ' '.repeat(maxWidth - line.length);
                    return '│' + line + padding + '│';
                });
                
                return [topBorder, ...borderedLines, bottomBorder].join('\n');
            },

            /**
             * Generate ASCII art from text with animation
             * @param {string} text - Text to animate
             * @param {object} options - Animation options
             * @returns {Promise} Promise that resolves with animated frames
             */
            animate: function(text, options) {
                return new Promise((resolve) => {
                    options = options || {};
                    const frames = [];
                    const fontName = options.font || this.config.defaultFont;
                    const style = options.style || this.config.defaultStyle;
                    
                    // Generate base frame
                    const baseFrame = this.methods.font.call(this, text, fontName);
                    const lines = baseFrame.split('\n');
                    
                    // Create animation frames
                    for (let i = 0; i < lines.length; i++) {
                        const frame = lines.slice(0, i + 1).join('\n');
                        frames.push(this.methods.style.call(this, frame, style, true));
                    }
                    
                    // Add reverse animation
                    for (let i = lines.length - 1; i >= 0; i--) {
                        const frame = lines.slice(0, i + 1).join('\n');
                        frames.push(this.methods.style.call(this, frame, style, true));
                    }
                    
                    resolve(frames);
                });
            },

            /**
             * Generate ASCII art from content metadata
             * @param {object} metadata - Content metadata
             * @param {object} options - Generation options
             * @returns {string} Generated ASCII art
             */
            fromMetadata: function(metadata, options) {
                options = options || {};
                
                // Extract key information
                const title = metadata.title || 'Unknown';
                const genre = metadata.genre || 'Unknown';
                const service = metadata.service || 'Unknown';
                
                // Generate ASCII art
                let art = '';
                
                if (options.showTitle) {
                    art += this.methods.font.call(this, title, 'doom', options) + '\n\n';
                }
                
                if (options.showGenre) {
                    art += this.methods.style.call(this, `Genre: ${genre}`, 'cyan', true) + '\n';
                }
                
                if (options.showService) {
                    art += this.methods.style.call(this, `Service: ${service}`, 'yellow', true) + '\n';
                }
                
                if (options.addBorder) {
                    art = this.methods.border.call(this, art, options);
                }
                
                return art;
            }
        },

        // Public API
        font: function(text, fontName, options) {
            return this.methods.font.call(this, text, fontName, options);
        },

        style: function(text, style, reset) {
            return this.methods.style.call(this, text, style, reset);
        },

        border: function(text, options) {
            return this.methods.border.call(this, text, options);
        },

        animate: function(text, options) {
            return this.methods.animate.call(this, text, options);
        },

        fromMetadata: function(metadata, options) {
            return this.methods.fromMetadata.call(this, metadata, options);
        },

        // Configuration methods
        setConfig: function(newConfig) {
            Object.assign(this.config, newConfig);
        },

        getConfig: function() {
            return { ...this.config };
        }
    };

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = window.AsciiArtEngine;
    }

})(typeof window !== 'undefined' ? window : this); 