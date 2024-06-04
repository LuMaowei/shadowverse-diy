import { h, VNode } from 'snabbdom';
import { SlateElement } from '@wangeditor/editor';
import { AbilityElement } from './custom-types';
import { jsonParse } from '../../../utils';

function renderAbility(elem: SlateElement): VNode {
  const { info } = elem as AbilityElement;
  // @ts-ignore
  const { label } = jsonParse(info, {});
  return h(
    'span',
    {
      props: {
        contentEditable: false,
      },
      style: {
        display: 'inline-block',
        color: '#f5c05e',
        marginRight: '0.5rem',
      },
    },
    label,
  );
}

const conf = {
  type: 'ability',
  renderElem: renderAbility,
};

export default conf;
