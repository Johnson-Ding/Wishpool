// 全局数据刷新事件系统
class EventEmitter {
  private listeners: Record<string, Array<() => void>> = {};

  on(event: string, listener: () => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  off(event: string, listener: () => void) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(l => l !== listener);
  }

  emit(event: string) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(listener => listener());
  }
}

export const globalEvents = new EventEmitter();

// 数据刷新事件常量
export const EVENTS = {
  WISH_CREATED: 'wish_created',
  WISH_UPDATED: 'wish_updated',
  WISH_DELETED: 'wish_deleted',
} as const;