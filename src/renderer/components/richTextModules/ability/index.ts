import { IModuleConf } from '@wangeditor/editor';
import withAbility from './plugin';
import renderElemConf from './render-elem';
import elemToHtmlConf from './elem-to-html';
import parseHtmlConf from './parse-elem-html';

const abilityModule: Partial<IModuleConf> = {
  editorPlugin: withAbility,
  renderElems: [renderElemConf],
  elemsToHtml: [elemToHtmlConf],
  parseElemsHtml: [parseHtmlConf],
};

export default abilityModule;
