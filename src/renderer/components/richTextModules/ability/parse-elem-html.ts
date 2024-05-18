import { SlateElement } from '@wangeditor/editor';
import { AbilityElement } from './custom-types';

function parseHtml(elem: any): SlateElement {
  const info = elem.getAttribute('data-info') || '';
  return {
    type: 'ability',
    info,
    children: [{ text: '' }], // void node 必须有一个空白 text
  } as AbilityElement;
}

const parseHtmlConf = {
  selector: 'span[data-w-e-type="ability"]',
  parseElemHtml: parseHtml,
};

export default parseHtmlConf;
