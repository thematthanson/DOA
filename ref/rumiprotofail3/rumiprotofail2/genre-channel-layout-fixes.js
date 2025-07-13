// Genre Channel Layout Fixes
// Legacy layout fixes for genre channel (now integrated with comprehensive overlap fix)

console.log('📐 Genre Channel Layout Fixes loaded (legacy support)');

// Legacy layout fixer object for backward compatibility
window.genreChannelLayoutFixer = {
    isEnabled: false,
    
    enable() {
        this.isEnabled = true;
        console.log('📐 Legacy layout fixer enabled (deprecated - use comprehensive overlap fix)');
    },
    
    disable() {
        this.isEnabled = false;
        console.log('📐 Legacy layout fixer disabled');
    },
    
    test() {
        console.log('📐 Legacy layout fixer test (deprecated)');
        return { status: 'deprecated' };
    },
    
    preventOverlaps() {
        console.log('📐 Legacy preventOverlaps called (deprecated - use comprehensive overlap fix)');
    },
    
    slideBlocksLeft() {
        console.log('📐 Legacy slideBlocksLeft called (deprecated - use comprehensive overlap fix)');
    }
};

// Auto-enable for backward compatibility - DISABLED to prevent conflicts
// document.addEventListener('DOMContentLoaded', () => {
//     setTimeout(() => {
//         window.genreChannelLayoutFixer.enable();
//     }, 1000);
// }); 