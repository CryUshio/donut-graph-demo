const FRAMES_PER_SEC = 60;

export class RafRunner {
  constructor(requestAnimationFrame = window.requestAnimationFrame.bind(window)) {
    this._requestAnimationFrame = requestAnimationFrame;
    this._timingFunction = (x) => x;
  }

  __loop__() {
    const { from, to, _tick, _tickProgress } = this;
    const preTickValue = typeof this.tickValue === 'undefined' ? from : this.tickValue;

    if (this._tickProgress >= 1) {
      this.loopFunction(to, preTickValue);
      return;
    }
    
    this.tickValue = from + this._timingFunction(_tickProgress) * (to - from);
    this._tickProgress += _tick;
    this.loopFunction(this.tickValue, preTickValue);

    this._requestAnimationFrame(this.__loop__.bind(this));
  }

  /**
   * 处理器
   * @param {Function} handler 处理函数，拥有两个形参
   * 
   * handler = (val, preVal) => void
   */
  handler(handler) {
    this.loopFunction = handler;
  }

  /**
   * 启动
   * @param {number} from 开始值
   * @param {number} to 结束值
   * @param {number} duration millisecond，持续时间
   * @param {function} timingFunction 可选，默认 linear; e.g. timing = (x) => y
   */
  start(from, to, duration, timingFunction) {
    this.from = from;
    this.to = to;
    this._tick = 1 / (duration / 1000 * FRAMES_PER_SEC);
    this._tickProgress = 0;

    if (timingFunction) {
      this._timingFunction = timingFunction;
    }

    this.__loop__();
  }
}
