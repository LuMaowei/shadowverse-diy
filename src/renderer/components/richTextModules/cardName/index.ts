import { IModuleConf } from '@wangeditor/core';
import renderStyle from './render-style';
import styleToHtml from './style-to-html';
import preParseHtmlConf from './pre-parse-html';
import parseStyleHtml from './parse-style-html';
import colorMenuConf from './menu';

const cardName: Partial<IModuleConf> = {
  renderStyle,
  styleToHtml,
  preParseHtml: [preParseHtmlConf],
  parseStyleHtml,
  menus: [colorMenuConf],
};

export default cardName;
