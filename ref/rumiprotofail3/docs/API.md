# RUMI Project API Documentation

## Core APIs

### State Management API (`js/core/state-management.js`)

#### RumiStateManager
```typescript
interface RumiState {
  isActive: boolean;
  isIndexing: boolean;
  isPaused: boolean;
  entryPoint: string | null;
  currentMode: 'detection' | 'indexing';
  sessionStartTime: number | null;
  // ... other state properties
}

class RumiStateManager {
  // Get current state
  getState(): RumiState;
  
  // Update state with validation
  setState(updates: Partial<RumiState>): void;
  
  // Subscribe to state changes
  subscribe(callback: (state: RumiState) => void): () => void;
  
  // Get state history
  getHistory(): RumiState[];
}
```

### Animation Engine API (`js/core/animation-engine.js`)

#### RumiAnimationEngine
```typescript
interface AnimationConfig {
  start: number;
  end: number;
  duration: number;
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  onUpdate: (value: number) => void;
  onComplete?: () => void;
}

class RumiAnimationEngine {
  // Start a new animation
  animate(config: AnimationConfig): string;
  
  // Cancel animation by ID
  cancel(animationId: string): void;
  
  // Pause all animations
  pauseAll(): void;
  
  // Resume all animations
  resumeAll(): void;
}
```

### Performance Monitor API (`js/core/performance-monitor.js`)

#### RumiPerformanceMonitor
```typescript
interface MetricConfig {
  name: string;
  threshold?: number;
  callback?: (value: number) => void;
}

class RumiPerformanceMonitor {
  // Start timing a metric
  startMetric(name: string): void;
  
  // End timing and get duration
  endMetric(name: string): number;
  
  // Record a single metric value
  recordMetric(name: string, value: number): void;
  
  // Get metric statistics
  getStats(name: string): {
    min: number;
    max: number;
    avg: number;
    recent: number;
  };
}
```

### Message Bus API (`js/core/message-bus.js`)

#### RumiMessageBus
```typescript
interface Message {
  type: string;
  payload: any;
  priority?: 'high' | 'normal' | 'low';
}

class RumiMessageBus {
  // Subscribe to messages
  subscribe(type: string, callback: (msg: Message) => void): () => void;
  
  // Publish a message
  publish(type: string, payload: any, priority?: 'high' | 'normal' | 'low'): void;
  
  // Clear message queue
  clear(): void;
}
```

## Backend APIs

### Content Manager API (`js/backend/content-manager.js`)

#### RumiContentManager
```typescript
interface ContentFilter {
  genre?: string;
  type?: string;
  tags?: string[];
}

class RumiContentManager {
  // Load content library
  loadContent(): Promise<void>;
  
  // Filter content
  filterContent(filter: ContentFilter): ContentItem[];
  
  // Get content by ID
  getContent(id: string): ContentItem | null;
}
```

### Error Handler API (`js/core/error-handling.js`)

#### RumiErrorHandler
```typescript
interface ErrorContext {
  component: string;
  severity: 'low' | 'medium' | 'high';
  retryCount?: number;
}

class RumiErrorHandler {
  // Handle error with context
  handleError(error: Error, context: ErrorContext): Promise<void>;
  
  // Register error recovery strategy
  registerStrategy(type: string, handler: (error: Error) => Promise<void>): void;
  
  // Get error history
  getErrorHistory(): Error[];
}
```

## Channel APIs

### Timeline Manager API (`js/channel/timeline-manager.js`)

#### RumiTimelineManager
```typescript
interface TimelineBlock {
  id: string;
  duration: number;
  content: ContentItem;
}

class RumiTimelineManager {
  // Add block to timeline
  addBlock(block: TimelineBlock): void;
  
  // Update block progress
  updateProgress(blockId: string, progress: number): void;
  
  // Get current timeline state
  getTimelineState(): {
    currentBlock: TimelineBlock;
    progress: number;
    totalDuration: number;
  };
}
```

## UI Components API (`js/ui/components.js`)

### RumiUI
```typescript
interface UIConfig {
  theme: 'light' | 'dark';
  animations: boolean;
  debug: boolean;
}

class RumiUI {
  // Initialize UI with config
  initialize(config: UIConfig): void;
  
  // Show notification
  notify(message: string, type: 'info' | 'success' | 'error'): void;
  
  // Update progress indicator
  updateProgress(percent: number): void;
}
```

## Events and Messaging

### Core Events
- `state:change` - State updates
- `animation:frame` - Animation frame update
- `performance:threshold` - Performance threshold exceeded
- `error:occurred` - Error occurred
- `content:loaded` - Content library loaded
- `channel:progress` - Channel progress update

### Message Types
- `state.update` - State change message
- `animation.control` - Animation control command
- `error.recovery` - Error recovery action
- `content.request` - Content request message
- `channel.command` - Channel control command

## Usage Examples

### State Management
```javascript
const state = new RumiStateManager();

// Subscribe to state changes
const unsubscribe = state.subscribe((newState) => {
  console.log('State updated:', newState);
});

// Update state
state.setState({
  isActive: true,
  currentMode: 'indexing'
});
```

### Animation
```javascript
const animator = new RumiAnimationEngine();

// Create animation
const animId = animator.animate({
  start: 0,
  end: 100,
  duration: 1000,
  easing: 'easeInOut',
  onUpdate: (value) => {
    element.style.opacity = value / 100;
  }
});
```

### Performance Monitoring
```javascript
const monitor = new RumiPerformanceMonitor();

// Track operation timing
monitor.startMetric('operation');
// ... perform operation
const duration = monitor.endMetric('operation');

// Record specific metric
monitor.recordMetric('memory', performance.memory.usedJSHeapSize);
```

### Message Bus
```javascript
const bus = new RumiMessageBus();

// Subscribe to messages
bus.subscribe('content.request', (msg) => {
  contentManager.getContent(msg.payload.id);
});

// Publish message
bus.publish('content.request', { id: '123' });
```

## Error Handling

All APIs use a consistent error handling approach:

1. Operational errors are handled automatically
2. Critical errors are reported to RumiErrorHandler
3. All errors include context for debugging
4. Recovery strategies are attempted when possible

Example:
```javascript
try {
  await contentManager.loadContent();
} catch (error) {
  await errorHandler.handleError(error, {
    component: 'ContentManager',
    severity: 'high'
  });
}
```

## Best Practices

1. **State Management**
   - Always use setState for updates
   - Subscribe to minimal state subset
   - Clean up subscriptions

2. **Animation**
   - Use requestAnimationFrame
   - Batch DOM updates
   - Cancel unused animations

3. **Performance**
   - Monitor critical operations
   - Set appropriate thresholds
   - React to performance drops

4. **Error Handling**
   - Provide error context
   - Implement recovery strategies
   - Log error patterns

5. **Message Bus**
   - Use typed messages
   - Handle message priority
   - Clean up subscribers 