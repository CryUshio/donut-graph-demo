import React, { Component } from 'react';
import './index.less';

const ratio = 2;

const R1 = 54; // 内半径
const R2 = 74; // 外半径
const EllipseR1 = 10; // 椭圆长半径
const EllipseR2 = 4; // 椭圆短半径

const ROTATE_360 = 360;
const ROTATE_180 = 180;
const ROTATE_90 = 90;

class Donut extends Component {
  canvas = null;

  componentDidMount() {
    const { canvas } = this;
    const { width, height } = this.props;
    console.info('skr: canvas', this.canvas);

    canvas.width = width * ratio;
    canvas.height = height * ratio;

    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);

    this.ctx = ctx;
    this.draw();
  }

  draw() {

  }

  render() {
    const { width, height } = this.props;

    return (
      <div className="donut" style={{ width, height }}>
        <canvas ref={(r) => this.canvas = r}></canvas>
      </div>
    );
  }
}

export default Donut;
