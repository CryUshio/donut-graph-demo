import Timeline from 'skryu-timeline';
import { drawRoundedRect, wrapText } from './lib';
import { RafRunner } from './RafRunner.class';

export class Legend {
  constructor({ ctx, x, y, textMaxWidth, endX, startColor, stopColor, text }) {
    this.ctx = ctx;
    this.x = x; // 横线的起点 x 坐标
    this.y = y; // 横线的 y 坐标
    this.endX = endX; // 横线的终点 x 坐标
    this.text = text; // 图例文字
    this.textMaxWidth = textMaxWidth; // 图例文字最大宽度
    this.dot = { // 图例起点小圆点属性
      r: 2.5,
      opacity: 0.8,
    };
    this.icon = { // 图例 icon 属性
      h: 12,
      w: 12,
      r: 5,   // 圆角半径
      marginRight: 4,
      startColor, // 渐变色起点
      stopColor   // 渐变色终点
    };
  }

  // 图标和文字距离横线的数值
  static MARGIN_BOTTOM = 4;
  // 文字的行高
  static LINE_HEIGHT = 14;

  // 图例起点和线条的过渡时间
  static DOT_AND_LINE_DURATION = 300;
  // 图例图标和标题的过渡时间
  static ICON_AND_TITLE_DURATION = 300;

  draw() {
    const { x, endX, text } = this;
    const { w, marginRight } = this.icon;

    const { textW, textH, texts } = this.measureText(text);
    const iconX = endX > x ? endX - w - marginRight - textW : endX;
    const iconOffsetY = -(textH - Legend.LINE_HEIGHT) / texts.length;

    const timeline = new Timeline();
    timeline.add({
        handler: () => {
          this.drawLegendDot();
          this.drawLegendLine();
        },
        wait: Legend.DOT_AND_LINE_DURATION
      }).add({
        handler: () => {
          this.drawLegendIcon(iconX, iconOffsetY);
          this.drawLegendText(textW, textH, texts);
        }
      })
      .run();
  }

  measureText(text) {
    const { ctx, textMaxWidth } = this;
    const { w, marginRight } = this.icon;
    
    ctx.save();
    ctx.font = '12px Arial';
    ctx.fillStyle = '#000000';
    ctx.textBaseline = 'bottom';
    
    const maxWidth = textMaxWidth - w - marginRight * 2;
    const texts = wrapText(ctx, text, maxWidth, 2);
    const textW = texts.reduce((tw, r) => {
      const tmpW = ctx.measureText(r).width;
      return Math.max(tw, tmpW);
    }, 0);
    const textH = texts.length * Legend.LINE_HEIGHT;

    ctx.restore();

    return { textW, textH, texts };
  }

  drawLegendDot() {
    const { ctx, x, y } = this;
    const { r, opacity: endOpacity } = this.dot;

    const raf = new RafRunner();
    raf.handler((opacity, oldOpacity) => {
      ctx.save();
      // 这里是在上一次基础上画，所以计算透明度差值就好，否则透明度叠加之后会比预期更高
      ctx.globalAlpha = opacity - oldOpacity;

      ctx.beginPath();
      ctx.fillStyle = '#FFFFFF';
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    });
    raf.start(0, endOpacity, Legend.DOT_AND_LINE_DURATION);
  }

  /**
   * 线条伸展动画
   * @param lineStart 开始 x 坐标
   * @param lineEnd 结束 x 坐标
   */
  drawLegendLine() {
    const { ctx, x, y, endX } = this;
    const { r } = this.dot;
    const lineStart = endX > x ? x + r : x - r;
    const lineEnd = endX;

    const raf = new RafRunner();
    raf.handler((x) => {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(lineStart, y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#E6E6E6';
      ctx.strokeWidth = 0.5;
      ctx.stroke();
      ctx.restore();
    });
    raf.start(lineStart, lineEnd, Legend.DOT_AND_LINE_DURATION);
  }

  /**
   * @param {number} iconX 图例 x 坐标
   * @param {number} iconOffsetY 图例 y 偏移，用于适配多行图例标题的情况
   */
  drawLegendIcon(iconX, iconOffsetY) {
    const { ctx, x, y } = this;
    const { w, h, r, startColor, stopColor } = this.icon;
    const iconY = y - h - Legend.MARGIN_BOTTOM + iconOffsetY;

    const raf = new RafRunner();
    raf.handler((opacity) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.clearRect(iconX, iconY, w, h);

      const lgr = ctx.createLinearGradient(x, iconY, x, iconY + h);
      lgr.addColorStop(0, startColor);
      lgr.addColorStop(1, stopColor);

      ctx.fillStyle = lgr;
      drawRoundedRect(ctx, iconX, iconY, w, h, r);
      ctx.fill();

      ctx.restore();
    });
    raf.start(0, 1, Legend.ICON_AND_TITLE_DURATION);
  }

  /**
   * @param {number} textW 文字宽度
   * @param {number} textH 文字高度
   * @param {string} text  文字内容
   */
  drawLegendText(textW, textH, text) {
    const { ctx, x, y, endX } = this;
    const { w, marginRight } = this.icon;

    const offsetY = 3; // 用于调整实际渲染与预期的位置偏差

    const raf = new RafRunner();
    raf.handler((opacity) => {
      ctx.save();
      ctx.globalAlpha = opacity;

      ctx.font = '12px Arial';
      ctx.fillStyle = '#000000';
      ctx.textBaseline = 'top';

      const textX = endX > x ? endX - textW : endX + w + marginRight;
      const textY = y - textH - Legend.MARGIN_BOTTOM + offsetY;

      ctx.clearRect(textX, textY, textW, textH);

      for (let i = 0; i < text.length; i++) {
        const ty = i * Legend.LINE_HEIGHT;
        ctx.fillText(text[i], textX, textY + ty);
      }

      ctx.restore();
    });
    raf.start(0, 1, Legend.ICON_AND_TITLE_DURATION);
  }
}
