// ================================
// RUMI E2E TESTS
// End-to-end test suite for genre channel functionality
// ================================

// Note: This file is loaded in browser environment, so we'll use global references
// instead of ES6 imports to avoid module loading issues

class E2ETests {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0
        };
        
        // Initialize test functions map
        this.testFunctions = {
            'show-detection': this.testShowDetection.bind(this),
            'content-blocks': this.testContentBlocks.bind(this),
            'genre-matching': this.testGenreMatching.bind(this),
            'pause-resume': this.testPauseResume.bind(this),
            'block-progression': this.testBlockProgression.bind(this)
        };
        
        // Initialize test data
        this.initializeTestData();

        // Update initial styles - defer until after initialization
        setTimeout(() => {
            if (window.rumiState) {
                this.updateUIStyles(window.rumiState.get('mode'));
            }
        }, 100);
    }
    
    initializeTestData() {
        this.testData = {
            shows: [
                {
                    title: 'Breaking Bad S05E16 - Felina',
                    genre: 'Drama',
                    duration: 47,
                    blocks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                },
                {
                    title: 'Stranger Things S04E09 - Piggyback',
                    genre: 'Thriller',
                    duration: 51,
                    blocks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
                },
                {
                    title: 'The Office S03E20 - Product Recall',
                    genre: 'Comedy',
                    duration: 22,
                    blocks: [1, 2, 3, 4, 5]
                }
            ],
            modes: ['detected', 'auto']
        };
    }

    // ================================
    // TEST RUNNERS
    // ================================

    async runAllTests() {
        console.log('🎯 TEST: Starting E2E test suite...');
        const testOutput = document.getElementById('testOutput');
        
        try {
            // Reset test results
            this.testResults = {
                passed: 0,
                failed: 0,
                total: 0
            };
            
            // Run each test function
            for (const [testName, testFn] of Object.entries(this.testFunctions)) {
                testOutput.textContent += `\nRunning test: ${testName}...\n`;
                await testFn.call(this);
                this.updateTestResults();
            }
            
            // Report final results
            this.reportResults();
        } catch (error) {
            console.error('🎯 TEST ERROR:', error);
            testOutput.textContent += `\nTest suite failed: ${error.message}\n`;
        }
    }

    async runTest(testName) {
        console.log(`🎯 TEST: Running ${testName}...`);
        const testOutput = document.getElementById('testOutput');
        
        try {
            const testFn = this.testFunctions[testName];
            if (!testFn) {
                throw new Error(`Test "${testName}" not found`);
            }
            
            // Reset test results
            this.testResults = {
                passed: 0,
                failed: 0,
                total: 0
            };
            
            // Run the test
            testOutput.textContent += `\nRunning test: ${testName}...\n`;
            await testFn.call(this);
            this.updateTestResults();
            
            // Report results
            this.reportResults();
        } catch (error) {
            console.error('🎯 TEST ERROR:', error);
            testOutput.textContent += `\nTest failed: ${error.message}\n`;
        }
    }

    // ================================
    // TEST UTILITIES
    // ================================

    assertTest(name, condition, message = '') {
        this.testResults.total++;
        if (condition) {
            this.testResults.passed++;
            console.log(`✅ ${name} passed`);
        } else {
            this.testResults.failed++;
            console.error(`❌ ${name} failed:`, message);
        }
    }

    updateTestResults() {
        // Update UI counters
        document.getElementById('passed-count').textContent = this.testResults.passed;
        document.getElementById('failed-count').textContent = this.testResults.failed;
        document.getElementById('total-count').textContent = this.testResults.total;
    }

    reportResults() {
        const testOutput = document.getElementById('testOutput');
        testOutput.textContent += `\n=== Test Results ===\n`;
        testOutput.textContent += `Passed: ${this.testResults.passed}\n`;
        testOutput.textContent += `Failed: ${this.testResults.failed}\n`;
        testOutput.textContent += `Total: ${this.testResults.total}\n`;
    }

    // ================================
    // TEST IMPLEMENTATIONS
    // ================================

    async testShowDetection() {
        console.log('🎯 TEST: Testing show detection...');
        try {
            for (const show of this.testData.shows) {
                if (window.rumiState) {
                    const detected = await window.rumiState.detectShow(show.title);
                    this.assertTest(`Show detection for ${show.title}`, detected, `Failed to detect ${show.title}`);
                } else {
                    this.assertTest(`Show detection for ${show.title}`, false, 'RumiState not available');
                }
            }
        } catch (error) {
            this.assertTest('Show detection test', false, error.message);
        }
    }

    async testContentBlocks() {
        console.log('🎯 TEST: Testing content blocks...');
        try {
            for (const show of this.testData.shows) {
                if (window.rumiState) {
                    const blocks = await window.rumiState.getContentBlocks(show.title);
                    const blockCountMatch = blocks && blocks.length === show.blocks.length;
                    this.assertTest(`Content blocks for ${show.title}`, blockCountMatch, `Block count mismatch for ${show.title}`);
                } else {
                    this.assertTest(`Content blocks for ${show.title}`, false, 'RumiState not available');
                }
            }
        } catch (error) {
            this.assertTest('Content blocks test', false, error.message);
        }
    }

    async testGenreMatching() {
        console.log('🎯 TEST: Testing genre matching...');
        try {
            for (const show of this.testData.shows) {
                if (window.rumiState) {
                    const genre = await window.rumiState.getShowGenre(show.title);
                    const genreMatch = genre === show.genre;
                    this.assertTest(`Genre matching for ${show.title}`, genreMatch, `Expected ${show.genre}, got ${genre}`);
                } else {
                    this.assertTest(`Genre matching for ${show.title}`, false, 'RumiState not available');
                }
            }
        } catch (error) {
            this.assertTest('Genre matching test', false, error.message);
        }
    }

    async testPauseResume() {
        console.log('🎯 TEST: Testing pause/resume functionality...');
        try {
            if (window.rumiState) {
                window.rumiState.pause();
                this.assertTest('Pause functionality', window.rumiState.isPaused(), 'Failed to enter paused state');
                
                window.rumiState.resume();
                this.assertTest('Resume functionality', !window.rumiState.isPaused(), 'Failed to resume from paused state');
            } else {
                this.assertTest('Pause/Resume functionality', false, 'RumiState not available');
            }
        } catch (error) {
            this.assertTest('Pause/resume test', false, error.message);
        }
    }

    async testBlockProgression() {
        console.log('🎯 TEST: Testing block progression...');
        const testOutput = document.getElementById('testOutput');
        
        try {
            if (!window.rumiState) {
                this.assertTest('Block progression test', false, 'RumiState not available');
                return;
            }
            
            // Test block progression for each show
            for (const show of this.testData.shows) {
                testOutput.textContent += `\nTesting block progression for: ${show.title}\n`;
                
                // Initialize show
                await window.rumiState.initializeShow(show.title);
                
                // Test progression through blocks
                let success = true;
                for (let i = 0; i < show.blocks.length; i++) {
                    const currentBlock = window.rumiState.getCurrentBlock();
                    const expectedBlockNumber = show.blocks[i];

                    if (!currentBlock || currentBlock.block !== expectedBlockNumber) {
                        testOutput.textContent += `  ❌ Mismatch at index ${i}: Expected block ${expectedBlockNumber}, Got ${currentBlock ? currentBlock.block : 'null'}\n`;
                        success = false;
                        break;
                    }
                    
                    // Progress to the next block for the next iteration
                    if (i < show.blocks.length - 1) {
                        window.rumiState.progressBlock();
                    }
                }
                
                this.assertTest(`Block progression for ${show.title}`, success, 'Block mismatch during progression');
            }
        } catch (error) {
            console.error('🎯 TEST ERROR:', error);
            this.assertTest('Block progression test', false, error.message);
        }
    }

    updateUIStyles(mode) {
        const body = document.querySelector('body');
        if (body) {
            const modeName = mode && mode.mode ? mode.mode : 'detected';
            body.classList.remove('detected-mode', 'auto-mode');
            body.classList.add(`${modeName}-mode`);
        }

        const color = mode && mode.mode === 'auto' ? '#ffff00' : '#00ff41';
        document.documentElement.style.setProperty('--current-mode-color', color);
        
        const bg = mode && mode.mode === 'auto' ? 'rgba(255, 255, 0, 0.1)' : 'rgba(0, 255, 65, 0.1)';
        document.documentElement.style.setProperty('--current-mode-bg', bg);
    }
}

// Make E2ETests globally available
window.E2ETests = E2ETests;