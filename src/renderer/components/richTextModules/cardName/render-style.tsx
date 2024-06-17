import { Descendant } from 'slate';
import { VNode, VNodeStyle } from 'snabbdom';
import { CardNameText } from './custom-types';

export function addVnodeStyle(vnode: VNode, newStyle: VNodeStyle) {
  if (vnode.data == null) vnode.data = {};
  const { data } = vnode;
  if (data.style == null) data.style = {};

  Object.assign(data.style, newStyle);
}

export default function renderStyle(node: Descendant, vnode: VNode): VNode {
  const { color } = node as CardNameText;
  const styleVnode: VNode = vnode;

  if (color) {
    addVnodeStyle(styleVnode, { color });
  }

  return styleVnode;
}
