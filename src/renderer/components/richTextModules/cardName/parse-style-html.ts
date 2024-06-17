import { Descendant, Text } from 'slate';
import { CardNameText } from './custom-types';
import $, { DOMElement, getStyleValue } from '../dom';

export default function parseStyleHtml(
  text: DOMElement,
  node: Descendant,
): Descendant {
  const $text = $(text);
  if (!Text.isText(node)) return node;

  const textNode = node as CardNameText;

  const color = getStyleValue($text, 'color');
  if (color) {
    textNode.color = color;
  }

  return textNode;
}
