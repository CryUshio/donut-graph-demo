/**
 * @param {number} ratio 缩放比例
 * 
 */
export const ratioPixel = (ratio) => {
  /**
   * @param {number} px 像素
   */
  return (n) => {
    return ratio * n;
  };
}

/**
 * 
 * @param {number} num 角度 0-360
 * 
 * @returns {number} 对应的 PI 角度值
 */
export const deg = (num) => {
  return num / 180 * Math.PI;
}

/**
 * 将以 y 正半轴为起始的角度，映射到 arc 方法的角度
 * @param {number} num 角度 0-360
 * 
 * @returns {number} 对应的 arc 角度值，0 轴为 y 轴正半轴, arc 0 轴为 x 轴正半轴
 */
export const arcDeg = (num) => {
  return deg(num) - 0.5 * Math.PI;
}


export const easeInOut = (percentComplete) => {
  return percentComplete - Math.sin(percentComplete * 2 * Math.PI) / (2 * Math.PI);
}


/** 获取字体换行情况
 * @param {CanvasContext} ctx
 * @param {string} text
 * @param {number} maxWidth 行最大宽度
 * @param {number} maxLen 最大行数
 * 
 * @returns {Array[string]} 按行返回文字数组
 */
export const wrapText = (ctx, text, maxWidth, maxLen = 1) => {
  const textW = ctx.measureText(text).width;
  // 一行能装下就直接返回
  if (textW <= maxWidth) {
    return [text];
  }

  // 保存剩余没有处理的文本
  let tmpText = text;
  const textList = [];
  const ellipses = '...';
  const ellipsesW = ctx.measureText(ellipses).width;

  // 计算非最后一行的文本，并更新 tmpText
  for (let i = 0; i < maxLen - 1; i++) {
    if (!tmpText) {
      break;
    }
    const { text: lineText, pos } = getLineText(tmpText, maxWidth);
    textList.push(lineText);
    tmpText = tmpText.slice(pos);
  }

  // 计算最后一行的文本；因为最后一行可能会显示省略号所以单独处理
  if (tmpText) {
    const lineW = maxWidth - ellipsesW;
    const { text: lineText, pos } = getLineText(tmpText, lineW);
    const remainText = tmpText.slice(pos);
    const remainTextW = ctx.measureText(remainText).width;

    if (remainTextW > ellipsesW) {
      textList.push(lineText + ellipses);
    } else {
      textList.push(lineText + remainText);
    }
  }

  return textList;

  // 获取一行的文字，并返回后一个字的下标
  function getLineText(_text, _width) {
    const letterW = ctx.measureText('屌').width;
    const startPos = Math.floor(_width / letterW);

    for (let p = startPos; p < _text.length; p++) {
      const tmp = _text.slice(0, p);
      const tmpW = ctx.measureText(tmp).width;
      if (tmpW > _width) {
        return {
          text: _text.slice(0, p - 1),
          pos: p - 1
        };
      }
    }

    return {
      text: _text,
      pos: _text.length
    };
  }
}

/**
 * 画圆角矩形
 */
export const drawRoundedRect = (ctx, x, y, width, height, r) => {
  ctx.beginPath(); // draw top and top right corner 
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r); // draw right side and bottom right corner 
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r); // draw bottom and bottom left corner 
  ctx.arcTo(x, y + height, x, y + height - r, r); // draw left and top left corner 
  ctx.arcTo(x, y, x + r, y, r);
}

/**
 * 通过 duration 计算传入数据每一帧的变化插值
 */
const FRAMES_PER_SEC = 60;
export const computeInterpolationPerFrame = (total, duration) => {
  return total / (duration / 1000 * FRAMES_PER_SEC);
}

/**
 * 清除一个圆形区域
 */
export const clearArc = (ctx, x, y, r) => {
  let progress = 1;
  clear();

  function clear() {
    if (progress > 2 * r) {
      return;
    }

    const h = progress > r ? progress - r : r - progress;
    const w = 2 * ((r * r - h * h) ** 0.5);

    ctx.clearRect(x - w / 2, y + progress - r, w, 1);
    progress++;
    clear();
  }
}
