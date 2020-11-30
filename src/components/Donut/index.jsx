import React, { Component } from 'react';
import { Legend } from './Legend.class';
import { RafRunner } from './RafRunner.class';
import { easeInOut, deg, arcDeg, wrapText, ratioPixel } from './lib';

import { ColorSet } from './const';
import './index.scss';

const ratio = 2;

const R1 = 54; // 内半径
const R2 = 74; // 外半径
const EllipseR1 = 10; // 椭圆长半径
const EllipseR2 = 4; // 椭圆短半径

const ANGLE_360 = 360;
const ANGLE_180 = 180;
const ANGLE_90 = 90;

class Donut extends Component {
  static defaultProps = {
    showLegend: true
  }

  canvas = null;

  componentDidMount() {
    const { canvas } = this;
    const { source, width, height } = this.props;

    canvas.width = width * ratio;
    canvas.height = height * ratio;

    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
    ctx.width = width;
    ctx.height = height;

    this.ctx = ctx;
    this.source = this.handlePartsData(source);
    this.draw();
  }

  getLinearGradient(startColor, stopColor, linearAngle = 0) {
    const { ctx } = this;

    const rotate = deg(linearAngle);
    const startX = ctx.width / 2 - R2 * Math.cos(rotate);
    const startY = ctx.height / 2 - R2 * Math.sin(rotate);
    const endX = ctx.width / 2 + R2 * Math.cos(rotate);
    const endY = ctx.height / 2 + R2 * Math.sin(rotate);

    const lgr = ctx.createLinearGradient(startX, startY, endX, endY);
    lgr.addColorStop(0, startColor);
    lgr.addColorStop(1, stopColor);
    return lgr;
  }

  // 设置 part 颜色并将线性渐变计算结果缓存在 part 里面
  handlePartsData(source) {
    let basePer = 0;
    const parts = source.map((p, i) => {
      const part = { ...ColorSet[i % ColorSet.length], ...p };
      console.info('skr: part', part);

      part.lgr = this.getLinearGradient(part.startColor, part.stopColor, part.linearAngle);
      part.startPer = basePer;

      basePer += part.per;

      return part;
    });

    return parts;
  }

  drawEllipse(rotate, color) {
    const { ctx } = this;

    rotate = deg(rotate);

    // 不使用画布旋转时的坐标计算方法
    // const x = ctx.width / 2 + (R1 + R2) / 2 * Math.cos(rotate);
    // const y = ctx.height / 2 + (R1 + R2) / 2 * Math.sin(rotate);

    // 画布旋转时，只需要让椭圆圆心定位在弧线的 0 度处
    const x = 0;
    const y = -(R1 + R2) / 2;

    ctx.save();
    // 设置 canvas 中心到画布中心并旋转
    ctx.translate(ctx.width / 2, ctx.height / 2);
    ctx.rotate(rotate);

    ctx.moveTo(x, y);
    ctx.beginPath();
    ctx.fillStyle = color;
    // ellipse 的第五个参数 rotate 有兼容性问题无法旋转，但是椭圆可以画出来
    // ctx.ellipse(x, y, EllipseR2, EllipseR1, rotate, 0, 2 * Math.PI);
    ctx.ellipse(x, y, EllipseR2, EllipseR1, 0, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
  }

  drawRing(startDeg, endDeg, strokeStyle, ellipseColor) {
    const { ctx } = this;
    ctx.save();
    ctx.strokeStyle = strokeStyle;
    ctx.beginPath();
    ctx.lineWidth = (R2 - R1);
    ctx.arc(ctx.width / 2, ctx.height / 2, (R1 + R2) / 2, arcDeg(startDeg), arcDeg(endDeg));
    ctx.stroke();
    ctx.restore();
    this.drawEllipse(startDeg, ellipseColor);
    this.drawEllipse(endDeg, ellipseColor);
  }

  drawPartLegend(part) {
    const { ctx } = this;

    const { startPer, per, startColor, stopColor, text } = part;
    // 计算区域开始角度和结束角度的中间值: (startPer + (startPer + per)) / 2
    // 如果第一部分占比超过 50%，让图例显示在右侧正中，即 90 度位置
    const middleDeg = (startPer === 0 && per > 0.5) ? ANGLE_90 : ANGLE_360 * (startPer * 2 + per) / 2;

    // 下面是简单的三角函数计算图例在圆环上的起始点
    const x = ctx.width / 2 + (R1 + R2) / 2 * Math.cos(arcDeg(middleDeg));
    const y = ctx.height / 2 + (R1 + R2) / 2 * Math.sin(arcDeg(middleDeg));
    // 限制文字宽度
    const textMaxWidth = ctx.width / 2 - R2;

    // 小于 180 说明在右边
    const endX = middleDeg <= ANGLE_180 ? ctx.width : 0;
    const legend = new Legend({ ctx, x, y, textMaxWidth, endX, startColor, stopColor, text });
    legend.draw();
  }

  /**
   * 渲染甜甜圈中心文字
   */
  drawCenterText(text, color) {
    const { ctx } = this;

    const Padding = 8;
    const x = ctx.width / 2;
    const y = ctx.height / 2;

    ctx.save();
    ctx.font = '12px Arial';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const texts = wrapText(ctx, text, (R1 - Padding) * 2, 2);
    const lineHeight = 16;
    const middleIndex = (texts.length - 1) / 2;

    for (let i = 0; i < texts.length; i++) {
      const ty = (i - middleIndex) * lineHeight;
      ctx.fillText(texts[i], x, y + ty);
    }

    ctx.restore();
  }

  draw() {
    const { source } = this;
    const { showLegend } = this.props;

    // this.drawCenterText('学习类型', '#818181');

    if (source.length === 0) {
      return;
    }

    const raf = new RafRunner();

    let pos = 0;
    raf.handler((recPer, prePer) => {
      let recentPart = source[pos];
      const { startPer, per } = recentPart;

      // 渲染完某个部分之后，渲染下一个部分
      if (recPer >= startPer + per) {
        // 渲染上个部分
        const startDeg = ANGLE_360 * startPer;
        const endDeg = ANGLE_360 * (startPer + per);
        this.drawRing(startDeg, endDeg, recentPart.lgr, recentPart.ellipseColor);
        
        if (showLegend) {
          this.drawPartLegend(recentPart);
        }


        // 跳到下一个部分
        pos++;
        recentPart = source[pos];
        if (!recentPart) {
          this.drawEllipse(0, source[0].ellipseColor);
          return;
        }
      }

      // 渲染实时动画部分
      const startDeg = ANGLE_360 * recentPart.startPer;
      const endDeg = ANGLE_360 * recPer;
      this.drawRing(startDeg, endDeg, recentPart.lgr, recentPart.ellipseColor);

      // 第一部分起点椭圆在最上层
      this.drawEllipse(0, source[0].ellipseColor);
    });
    raf.start(0, 1, 800, easeInOut);
  }

  render() {
    const { width, height } = this.props;

    return (
      <div style={{ width, height }}>
        <canvas className="donut" ref={(r) => this.canvas = r}></canvas>
      </div>
    );
  }
}

export default Donut;
