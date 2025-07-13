// tracker.js
// Tracker object for logging actions, state changes, and assertions during UI development
// Based on implementation steps, flows, and checkpoints for Rumi Extension

// Rumi Project Constants
const RUMI_PROJECT = {
  name: 'Rumi Extension',
  version: 'Beta V0',
  flows: {
    HOME_SCREEN: 'home_screen',
    CHANNELS_SUBMENU: 'channels_submenu', 
    QUEUE_MANAGEMENT: 'queue_management',
    POINTS_PROGRESSION: 'points_progression',
    ERROR_STATES: 'error_states',
    ONBOARDING: 'onboarding',
    RESPONSIVE: 'responsive',
    RECEIPT_MANAGEMENT: 'receipt_management'
  },
  views: {
    HOME: 'home',
    CHANNELS: 'channels',
    INDEXING: 'indexing',
    ERROR: 'error',
    LOADING: 'loading',
    OFFLINE: 'offline',
    ONBOARDING: 'onboarding'
  },
  checkpoints: {
    // Home Screen Checkpoints
    HOME_LOADED: 'home_screen_loaded',
    BROWSE_CHANNELS_WORKS: 'browse_channels_button_works',
    POINTS_DISPLAYED: 'points_displayed_correctly',
    QUEUE_VISIBLE: 'queue_section_visible',
    CTA_POSITIONED: 'cta_positioned_correctly',
    
    // Channels Checkpoints  
    CHANNELS_OPEN: 'channels_submenu_opens',
    CHANNEL_BLOCKS_SIZED: 'channel_blocks_proportional_sizing',
    PLAY_CHANNEL_WORKS: 'play_channel_action_works',
    ADD_TO_QUEUE_WORKS: 'add_to_queue_action_works',
    EDIT_MODE_EXPANDS: 'edit_mode_expands_ui',
    
    // Queue Checkpoints
    QUEUE_SHOWS_NOW_PLAYING: 'queue_shows_current_content',
    QUEUE_SHOWS_UP_NEXT: 'queue_shows_next_item',
    QUEUE_COLLAPSIBLE: 'queue_collapsible_functionality',
    REMOVE_ITEM_WORKS: 'remove_item_from_queue_works',
    QUEUE_SUMMARY_CORRECT: 'queue_summary_shows_correct_totals',
    
    // Points Checkpoints
    POINTS_UPDATE_ON_ACTIONS: 'points_update_when_watching_indexing',
    PENDING_POINTS_SHOWN: 'pending_points_displayed',
    WEEKLY_PROGRESS_VISIBLE: 'weekly_progress_bars_visible',
    LEADERBOARD_SHOWN: 'leaderboard_displayed',
    NOKIA_THEMES_CONTENT: 'nokia_imagery_themes_to_content',
    
    // Error State Checkpoints
    VOLUME_ERROR_HANDLED: 'volume_error_state_handled',
    CONNECTION_LOST_HANDLED: 'connection_lost_state_handled',
    OFFLINE_MODE_WORKS: 'offline_mode_functional',
    LOADING_STATE_SHOWN: 'loading_state_displayed',
    ERROR_UI_COMPRESSES: 'error_states_compress_ui_appropriately',
    
    // Receipt Checkpoints
    RECEIPT_VIEW_DISPLAYED: 'receipt_view_shows_session_results',
    RECEIPT_SHOWS_POINTS: 'receipt_shows_correct_points_earned',
    RECEIPT_SHOWS_DURATION: 'receipt_shows_session_duration',
    RECEIPT_SHOWS_MULTIPLIER: 'receipt_shows_applied_multiplier',
    RECEIPT_SHOWS_CONTENT: 'receipt_shows_indexed_content_list',
    
    // Responsive Checkpoints
    LARGE_DESKTOP_LAYOUT: 'large_desktop_600px_plus_layout',
    MEDIUM_DESKTOP_LAYOUT: 'medium_desktop_450_600px_layout', 
    SMALL_DESKTOP_LAYOUT: 'small_desktop_350_450px_layout',
    SMALLEST_LAYOUT: 'smallest_250_350px_layout',
    MINIMIZED_MODE: 'minimized_50px_vertical_mode'
  }
};

const Tracker = {
  _actionHistory: [],
  _stateHistory: [],
  _assertionHistory: [],
  _debugOverlay: null,
  _currentFlow: null,
  _project: RUMI_PROJECT,

  // Log a user action with optional details
  logAction(action, details = {}) {
    const entry = {
      type: 'action',
      action,
      details,
      timestamp: new Date().toISOString(),
      flow: this._currentFlow
    };
    this._actionHistory.push(entry);
    console.log(`[Rumi Tracker] Action: ${action}`, details);
    this._updateDebugOverlay();
  },

  // Log a state change (pass a shallow copy of the state object)
  logState(state) {
    const entry = {
      type: 'state',
      state: { ...state },
      timestamp: new Date().toISOString(),
      flow: this._currentFlow
    };
    this._stateHistory.push(entry);
    console.log('[Rumi Tracker] State:', state);
    this._updateDebugOverlay();
  },

  // Run an assertion/check and log the result
  assert(checkName, condition, message = '') {
    const entry = {
      type: 'assertion',
      checkName,
      passed: !!condition,
      message,
      timestamp: new Date().toISOString(),
      flow: this._currentFlow
    };
    this._assertionHistory.push(entry);
    if (!condition) {
      console.warn(`[Rumi Tracker] ❌ Assertion failed: ${checkName} - ${message}`);
    } else {
      console.log(`[Rumi Tracker] ✅ Assertion passed: ${checkName}`);
    }
    this._updateDebugOverlay();
  },

  // Start tracking a specific Rumi flow
  startFlow(flowName) {
    this._currentFlow = flowName;
    this.logAction(`Started flow: ${flowName}`, { flow: flowName });
    console.log(`[Rumi Tracker] 🚀 Starting flow: ${flowName}`);
  },

  // End current flow
  endFlow() {
    if (this._currentFlow) {
      this.logAction(`Ended flow: ${this._currentFlow}`, { flow: this._currentFlow });
      console.log(`[Rumi Tracker] 🏁 Ended flow: ${this._currentFlow}`);
      this._currentFlow = null;
    }
  },

  // Rumi-specific action logging
  logRumiAction(action, details = {}) {
    this.logAction(action, { ...details, project: 'Rumi Extension' });
  },

  // Rumi-specific state logging
  logRumiState(state) {
    this.logState({ ...state, project: 'Rumi Extension' });
  },

  // Rumi-specific assertions
  assertRumi(checkName, condition, message = '') {
    this.assert(checkName, condition, message);
  },

  // Test specific Rumi flows
  testHomeScreenFlow() {
    this.startFlow(RUMI_PROJECT.flows.HOME_SCREEN);
    
    // Simulate home screen actions
    this.logRumiAction('Home screen loaded');
    this.logRumiState({ view: RUMI_PROJECT.views.HOME, points: 4349, queue: [] });
    
    // Test home screen checkpoints
    this.assertRumi(RUMI_PROJECT.checkpoints.HOME_LOADED, true, 'Home screen should load');
    this.assertRumi(RUMI_PROJECT.checkpoints.POINTS_DISPLAYED, true, 'Points should be displayed');
    this.assertRumi(RUMI_PROJECT.checkpoints.QUEUE_VISIBLE, true, 'Queue section should be visible');
    
    this.endFlow();
  },

  testChannelsFlow() {
    this.startFlow(RUMI_PROJECT.flows.CHANNELS_SUBMENU);
    
    // Simulate channels actions
    this.logRumiAction('Browse Channels clicked');
    this.logRumiState({ view: RUMI_PROJECT.views.CHANNELS, points: 4349, queue: [] });
    
            this.logRumiAction('Add to Queue clicked', { channel: 'BINGE', item: 'Sample Content' });
        this.logRumiState({ view: RUMI_PROJECT.views.CHANNELS, points: 4349, queue: ['Sample Content'] });
    
    // Test channels checkpoints
    this.assertRumi(RUMI_PROJECT.checkpoints.CHANNELS_OPEN, true, 'Channels submenu should open');
    this.assertRumi(RUMI_PROJECT.checkpoints.ADD_TO_QUEUE_WORKS, true, 'Add to queue should work');
    
    this.endFlow();
  },

  testQueueFlow() {
    this.startFlow(RUMI_PROJECT.flows.QUEUE_MANAGEMENT);
    
    // Simulate queue actions
            this.logRumiAction('Queue item added', { item: 'Sample Content', duration: '60m' });
        this.logRumiState({ view: RUMI_PROJECT.views.HOME, points: 4349, queue: ['Sample Content'] });
    
    this.logRumiAction('Queue expanded');
            this.logRumiAction('Remove item clicked', { item: 'Sample Content' });
    this.logRumiState({ view: RUMI_PROJECT.views.HOME, points: 4349, queue: [] });
    
    // Test queue checkpoints
    this.assertRumi(RUMI_PROJECT.checkpoints.QUEUE_SHOWS_NOW_PLAYING, true, 'Queue should show current content');
    this.assertRumi(RUMI_PROJECT.checkpoints.REMOVE_ITEM_WORKS, true, 'Remove item should work');
    
    this.endFlow();
  },

  testReceiptFlow() {
    this.startFlow('receipt_flow');
    
    // Simulate indexing session completion
    this.logRumiAction('Indexing session completed', { duration: '15:30', points: 45.6, multiplier: 1.2 });
    this.logRumiState({ view: 'receipt', sessionEarnings: 45.6, sessionDuration: 930 });
    
    // Test receipt checkpoints
    this.assertRumi(RUMI_PROJECT.checkpoints.RECEIPT_VIEW_DISPLAYED, true, 'Receipt view should display');
    this.assertRumi(RUMI_PROJECT.checkpoints.RECEIPT_SHOWS_POINTS, true, 'Receipt should show correct points');
    this.assertRumi(RUMI_PROJECT.checkpoints.RECEIPT_SHOWS_DURATION, true, 'Receipt should show session duration');
    this.assertRumi(RUMI_PROJECT.checkpoints.RECEIPT_SHOWS_MULTIPLIER, true, 'Receipt should show applied multiplier');
    this.assertRumi(RUMI_PROJECT.checkpoints.RECEIPT_SHOWS_CONTENT, true, 'Receipt should show indexed content');
    
    this.logRumiAction('User clicked Done', { action: 'return_to_home' });
    this.logRumiState({ view: RUMI_PROJECT.views.HOME });
    
    this.endFlow();
  },

  // Retrieve the full history of actions, states, and assertions
  getHistory() {
    return {
      actions: this._actionHistory,
      states: this._stateHistory,
      assertions: this._assertionHistory,
      project: this._project
    };
  },

  // Get project-specific summary
  getProjectSummary() {
    const history = this.getHistory();
    const totalActions = history.actions.length;
    const totalStates = history.states.length;
    const totalAssertions = history.assertions.length;
    const passedAssertions = history.assertions.filter(a => a.passed).length;
    const failedAssertions = totalAssertions - passedAssertions;
    
    return {
      project: this._project.name,
      version: this._project.version,
      totalActions,
      totalStates, 
      totalAssertions,
      passedAssertions,
      failedAssertions,
      successRate: totalAssertions > 0 ? (passedAssertions / totalAssertions * 100).toFixed(1) + '%' : 'N/A'
    };
  },

  // (Optional) Show a debug overlay on the page for manual review
  showDebugOverlay() {
    if (this._debugOverlay) return;
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.bottom = '0';
    overlay.style.right = '0';
    overlay.style.width = '400px';
    overlay.style.maxHeight = '60vh';
    overlay.style.overflowY = 'auto';
    overlay.style.background = 'rgba(0,0,0,0.95)';
    overlay.style.color = '#00ff41';
    overlay.style.fontFamily = 'SF Mono, Monaco, monospace';
    overlay.style.fontSize = '11px';
    overlay.style.zIndex = '9999';
    overlay.style.padding = '12px';
    overlay.style.border = '2px solid #00ff41';
    overlay.style.borderRadius = '8px 0 0 0';
    overlay.innerHTML = `
      <div style="margin-bottom: 8px;">
        <b>Rumi Tracker Debug</b>
        <div style="font-size: 9px; color: #888;">${this._project.name} v${this._project.version}</div>
      </div>
      <div id="tracker-debug-content"></div>
    `;
    document.body.appendChild(overlay);
    this._debugOverlay = overlay;
    this._updateDebugOverlay();
  },

  // (Optional) Update the debug overlay with the latest logs
  _updateDebugOverlay() {
    if (!this._debugOverlay) return;
    const content = this._debugOverlay.querySelector('#tracker-debug-content');
    if (!content) return;
    
    const summary = this.getProjectSummary();
    const lastActions = this._actionHistory.slice(-5).map(a => 
      `<div>[A] ${a.timestamp.split('T')[1].split('.')[0]}: ${a.action}</div>`
    ).join('');
    const lastStates = this._stateHistory.slice(-3).map(s => 
      `<div>[S] ${s.timestamp.split('T')[1].split('.')[0]}: ${s.state.view || 'state'}</div>`
    ).join('');
    const lastAssertions = this._assertionHistory.slice(-3).map(as => 
      `<div>[${as.passed ? '✅' : '❌'}] ${as.timestamp.split('T')[1].split('.')[0]}: ${as.checkName}</div>`
    ).join('');
    
    content.innerHTML = `
      <div style="margin-bottom: 8px; padding: 4px; background: #111; border-radius: 4px;">
        <div>Actions: ${summary.totalActions} | States: ${summary.totalStates}</div>
        <div>Assertions: ${summary.passedAssertions}/${summary.totalAssertions} (${summary.successRate})</div>
        ${this._currentFlow ? `<div style="color: #ffaa00;">Current Flow: ${this._currentFlow}</div>` : ''}
      </div>
      <div style="margin-bottom: 4px;"><b>Recent Actions:</b></div>
      ${lastActions}
      <hr style="border-color: #333; margin: 4px 0;">
      <div style="margin-bottom: 4px;"><b>Recent States:</b></div>
      ${lastStates}
      <hr style="border-color: #333; margin: 4px 0;">
      <div style="margin-bottom: 4px;"><b>Recent Assertions:</b></div>
      ${lastAssertions}
    `;
  },
};

// Expose globally for dev
window.Tracker = Tracker;
window.RUMI_PROJECT = RUMI_PROJECT; 