# 🧪 Layout Fixes Testing Guide

## Quick Test (Recommended)

### Step 1: Open Genre Channel
1. Open `Genre-channel_v2.html` in your browser
2. Wait for the page to fully load (you should see "Genre Channel loaded and ready" in console)

### Step 2: Open Console
1. Press `F12` to open Developer Tools
2. Click on the "Console" tab
3. Make sure you're in the console (not Elements, Network, etc.)

### Step 3: Run Simple Test
Copy and paste this **entire block** into the console:

```javascript
(function() {
    console.log('🧪 Simple Layout Fixes Test Starting...');
    
    // Check if layout fixer exists
    if (typeof window.genreChannelLayoutFixer === 'undefined') {
        console.log('❌ Layout fixer not found');
        console.log('Available window objects with "genre":', Object.keys(window).filter(key => key.includes('genre')));
        return;
    }
    
    console.log('✅ Layout fixer found');
    console.log('Current status:', window.genreChannelLayoutFixer.isEnabled ? 'Enabled' : 'Disabled');
    
    // Enable if not already enabled
    if (!window.genreChannelLayoutFixer.isEnabled) {
        window.genreChannelLayoutFixer.enable();
        console.log('✅ Layout fixer enabled');
    }
    
    // Test basic functionality
    try {
        window.genreChannelLayoutFixer.test();
        console.log('✅ Layout fixer test completed');
    } catch (error) {
        console.log('❌ Layout fixer test failed:', error.message);
    }
    
    // Check current content
    if (typeof window.currentContent !== 'undefined') {
        console.log('✅ Current content found, length:', window.currentContent ? window.currentContent.length : 0);
    } else {
        console.log('❌ Current content not found');
    }
    
    // Check program track
    const programTrack = document.getElementById('program-track');
    if (programTrack) {
        const blocks = programTrack.querySelectorAll('.program-slot');
        console.log('✅ Program track found with', blocks.length, 'blocks');
    } else {
        console.log('❌ Program track not found');
    }
    
    console.log('🧪 Simple test complete!');
})();
```

### Step 4: Check Results
You should see output like:
```
🧪 Simple Layout Fixes Test Starting...
✅ Layout fixer found
Current status: Enabled
✅ Layout fixer test completed
✅ Current content found, length: 0
✅ Program track found with 1 blocks
🧪 Simple test complete!
```

## Individual Commands

If you want to test specific functions, you can run these commands one by one:

### Check Layout Fixer Status
```javascript
console.log('Layout fixer exists:', typeof window.genreChannelLayoutFixer !== 'undefined');
console.log('Layout fixer enabled:', window.genreChannelLayoutFixer?.isEnabled || false);
```

### Enable Layout Fixer
```javascript
window.genreChannelLayoutFixer.enable();
```

### Test Layout Fixer
```javascript
window.genreChannelLayoutFixer.test();
```

### Check Current Content
```javascript
console.log('Current content:', window.currentContent);
console.log('Content length:', window.currentContent ? window.currentContent.length : 0);
```

### Check Program Track
```javascript
const track = document.getElementById('program-track');
console.log('Program track found:', !!track);
if (track) {
    const blocks = track.querySelectorAll('.program-slot');
    console.log('Blocks found:', blocks.length);
}
```

## Troubleshooting

### If Layout Fixer Not Found
1. Check if the page is fully loaded
2. Look for any JavaScript errors in the console
3. Verify that `genre-channel-layout-fixes.js` is in the same directory as `Genre-channel_v2.html`

### If Test Fails
1. Check the console for error messages
2. Make sure you're copying the entire test block (including the `(function() { ... })();` wrapper)
3. Try refreshing the page and running the test again

### If Console Shows Syntax Errors
1. Make sure you're in the Console tab, not Elements
2. Copy the test code exactly as shown (don't add extra characters)
3. Press Enter after pasting the entire block

## Expected Behavior

When the layout fixes are working correctly:

✅ **Layout fixer loads automatically**  
✅ **Functions are overridden (removeContent, updateProgramTrack, etc.)**  
✅ **Blocks are positioned without overlaps**  
✅ **Remove buttons work and slide blocks left**  
✅ **"+" button appears only at the end**  
✅ **No JavaScript errors in console**  

## Manual Testing Steps

1. **Add some content** using the "EDIT GENRE" button
2. **Try removing content** - blocks should slide left
3. **Check for overlaps** - blocks should not overlap
4. **Look for "+" button** - should only appear at the end
5. **Test hover popups** - should work without breaking layout

## Support

If you're still having issues:
1. Check the browser console for any error messages
2. Verify all files are in the correct directory
3. Try a different browser
4. Check if JavaScript is enabled in your browser 