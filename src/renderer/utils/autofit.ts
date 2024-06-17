export interface IgnoreOption {
  el: string;
  height?: string;
  width?: string;
  scale?: number;
  fontSize?: number;
}

export interface AutofitOption {
  el?: string;
  dw?: number;
  dh?: number;
  resize?: boolean;
  ignore?: (IgnoreOption | string)[];
  transition?: number;
  delay?: number;
  limit?: number;
}

export interface KeepfitOption {
  dw: number;
  dh: number;
  dom: HTMLElement;
  ignore: (IgnoreOption | string)[];
  limit: number;
  currWidth?: number;
  currHeight?: number;
}

export interface ElRectificationOption {
  el: string;
  isKeepRatio?: boolean;
  level?: number;
  offsetWidth?: number;
  offsetHeight?: number;
}

export interface Autofit {
  isAutofitRunnig: boolean;

  /**
   * - el（可选）：渲染的元素，默认是 "body"
   * - dw（可选）：设计稿的宽度，默认是 1920
   * - dh（可选）：设计稿的高度，默认是 1080
   * - resize（可选）：是否监听resize事件，默认是 true
   * - ignore(可选)：忽略缩放的元素（该元素将反向缩放），参数见readme.md
   * - transition（可选）：过渡时间，默认是 0
   * - delay（可选）：延迟，默认是 0
   */
  init(options: AutofitOption): void;

  off(id?: string): void;
}

let currRenderDom: string | null = null;
let currelRectification: string = '';
let currelRectificationLevel: number = 1;
let currelRectificationIsKeepRatio: boolean = true;
let resizeListener: EventListenerOrEventListenerObject;
let timer: NodeJS.Timeout;
let currScale: number = 1;
let isElRectification: boolean = false;
const autofit: Autofit = {
  isAutofitRunnig: false,
  init(options = {}) {
    const {
      dw = 1920,
      dh = 1080,
      el = 'body',
      resize = true,
      ignore = [],
      transition = 'none',
      delay = 0,
      limit = 0,
    } = options;
    currRenderDom = el;
    const dom = document.querySelector(el) as HTMLElement;
    if (!dom) {
      return;
    }
    const style = document.createElement('style');
    const ignoreStyle = document.createElement('style');
    style.lang = 'text/css';
    ignoreStyle.lang = 'text/css';
    style.id = 'autofit-style';
    ignoreStyle.id = 'ignoreStyle';
    style.innerHTML = `body {overflow: hidden;}`;
    const bodyEl = document.querySelector('body')!;
    bodyEl.appendChild(style);
    bodyEl.appendChild(ignoreStyle);
    dom.style.height = `${dh}px`;
    dom.style.width = `${dw}px`;
    dom.style.transformOrigin = `0 0`;
    dom.style.overflow = 'hidden';
    keepFit({ dw, dh, dom, ignore, limit });
    resizeListener = () => {
      clearTimeout(timer);
      if (delay != 0)
        timer = setTimeout(() => {
          keepFit({ dw, dh, dom, ignore, limit });
          isElRectification &&
            elRectification({
              el: currelRectification,
              isKeepRatio: currelRectificationIsKeepRatio,
              level: currelRectificationLevel,
            });
        }, delay);
      else {
        keepFit({ dw, dh, dom, ignore, limit });
        isElRectification &&
          elRectification({
            el: currelRectification,
            isKeepRatio: currelRectificationIsKeepRatio,
            level: currelRectificationLevel,
          });
      }
    };
    resize && window.addEventListener('resize', resizeListener);
    this.isAutofitRunnig = true;
    setTimeout(() => {
      dom.style.transition = `${transition}s`;
    });
  },
  off(el = 'body') {
    try {
      isElRectification = false;
      window.removeEventListener('resize', resizeListener);
      const autofitStyleDom = document.querySelector(
        '#autofit-style',
      ) as HTMLElement;
      autofitStyleDom.remove();
      const ignoreStyleDOM = document.querySelector('#ignoreStyle');
      ignoreStyleDOM && ignoreStyleDOM.remove();
      const currDom = document.querySelector(currRenderDom || el);
      // @ts-ignore
      currDom.style = '';
      isElRectification && offelRectification();
    } catch (error) {
      this.isAutofitRunnig = false;
    }
    this.isAutofitRunnig && console.log(`autofit.js is off`);
  },
};

function elRectification({
  el,
  isKeepRatio = true,
  level = 1,
  offsetWidth = 0,
  offsetHeight = 0,
}: ElRectificationOption) {
  currelRectification = el;
  currelRectificationLevel = level;
  currelRectificationIsKeepRatio = isKeepRatio;
  const currEl = document.querySelectorAll(el) as NodeListOf<HTMLElement>;
  if (currEl.length == 0) {
    return;
  }
  for (const item of currEl) {
    const rectification = currScale == 1 ? 1 : currScale * level;
    if (!isElRectification) {
      // @ts-ignore
      item.originalWidth = item.clientWidth;
      // @ts-ignore
      item.originalHeight = item.clientHeight;
    }
    if (isKeepRatio) {
      // @ts-ignore
      item.style.width = `${item.originalWidth * rectification}px`;
      // @ts-ignore
      item.style.height = `${item.originalHeight * rectification}px`;
    } else {
      item.style.width = `calc(${100 * rectification}% - ${offsetWidth}px)`;
      item.style.height = `calc(${100 * rectification}% - ${offsetHeight}px)`;
    }
    item.style.transform = `scale(${1 / currScale})`;
    item.style.transformOrigin = `${offsetWidth} ${offsetHeight}`;
  }
  isElRectification = true;
}

function offelRectification() {
  if (!currelRectification) return;
  for (const item of document.querySelectorAll(
    currelRectification,
  ) as NodeListOf<HTMLElement>) {
    item.style.width = ``;
    item.style.height = ``;
    item.style.transform = ``;
  }
}

function restoreScale(dom: HTMLElement, invert: boolean) {
  if (invert) {
    dom.style.transform = `scale(1)`;
  } else {
    dom.style.transform = `scale(${currScale})`;
  }
}

function getCurrentScale() {
  return currScale;
}

function keepFit({
  dw,
  dh,
  dom,
  ignore,
  limit,
  currWidth,
  currHeight,
}: KeepfitOption) {
  const clientHeight = currHeight || document.documentElement.clientHeight;
  const clientWidth = currWidth || document.documentElement.clientWidth;
  currScale =
    clientWidth / clientHeight < dw / dh ? clientWidth / dw : clientHeight / dh;
  currScale =
    Math.abs(1 - currScale) > limit ? Number(currScale.toFixed(2)) : 1;
  const height = Math.round(clientHeight / currScale);
  const width = Math.round(clientWidth / currScale);
  dom.style.height = `${height}px`;
  dom.style.width = `${width}px`;
  dom.style.transform = `scale(${currScale})`;
  const ignoreStyleDOM = document.querySelector('#ignoreStyle') as HTMLElement;
  ignoreStyleDOM.innerHTML = '';
  for (const item of ignore) {
    let itemEl: string;
    let itemScale;
    let itemFontSize;
    let itemWidth;
    let itemHeight;
    if (typeof item === 'string') {
      itemEl = item;
    } else {
      itemEl = item.el;
      itemScale = item.scale;
      itemFontSize = item.fontSize;
      itemWidth = item.width;
      itemHeight = item.height;
    }
    if (!itemEl) {
      continue;
    }
    const realScale = itemScale || 1 / currScale;
    const realFontSize = realScale != currScale ? itemFontSize : 'autofit';
    const realWidth = realScale != currScale ? itemWidth : 'autofit';
    const realHeight = realScale != currScale ? itemHeight : 'autofit';
    const regex = new RegExp(`${itemEl}(\x20|{)`, 'gm');
    const isIgnored = regex.test(ignoreStyleDOM.innerHTML);
    if (isIgnored) {
      continue;
    }
    ignoreStyleDOM.innerHTML += `\n${itemEl} {
      transform: scale(${realScale})!important;
      transform-origin: 0 0;
      width: ${realWidth}!important;
      height: ${realHeight}!important;
    }`;
    if (realFontSize) {
      ignoreStyleDOM.innerHTML += `\n${itemEl} div ,${itemEl} span,${itemEl} a,${itemEl} * {
        font-size: ${realFontSize}px;
      }`;
    }
  }
}

export { elRectification, keepFit, restoreScale, getCurrentScale };
export default autofit;
