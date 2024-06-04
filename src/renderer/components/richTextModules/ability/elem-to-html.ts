import { SlateElement } from '@wangeditor/editor';
import { AbilityElement } from './custom-types';
import { jsonParse } from '../../../utils/utils';

function abilityToHtml(elem: SlateElement): string {
  const { info } = elem as AbilityElement;
  // @ts-ignore
  const { label } = jsonParse(info, {});
  return `<span data-w-e-type='ability' data-w-e-is-void data-w-e-is-inline data-info='${info}'>${label}</span>`;
}

const conf = {
  type: 'ability',
  elemToHtml: abilityToHtml,
};

export default conf;
