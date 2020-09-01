import React, { Component } from 'react';

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
  canvas = null;

  componentDidMount() {
    const { canvas } = this;
    const { source, width, height } = this.props;
    console.info('skr: canvas', this.canvas);

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

  getLinearGradient(startColor, stopColor) {
    const { ctx } = this;
    const lgr = ctx.createLinearGradient(ctx.width / 2 - R2, ctx.height / 2, ctx.width / 2 + R2, ctx.height / 2);
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

      part.lgr = this.getLinearGradient(part.startColor, part.stopColor);
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

  draw() {
    const { source } = this;
    console.info('skr: source', source);

    source.forEach((s) => {
      const { startPer, per, lgr, ellipseColor } = s;
      const startDeg = startPer * ANGLE_360;
      const endDeg = (startPer + per) * ANGLE_360;

      this.drawRing(startDeg, endDeg, lgr, ellipseColor);
    });
    this.drawEllipse(0, source[0].ellipseColor);
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
