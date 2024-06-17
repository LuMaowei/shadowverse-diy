import { Descendant, Text } from 'slate';
import $, { getOuterHTML, getTagName, isPlainText } from '../dom';
import { CardNameText } from './custom-types';

export default function styleToHtml(
  textNode: Descendant,
  textHtml: string,
): string {
  if (!Text.isText(textNode)) return textHtml;

  const { color } = textNode as CardNameText;
  if (!color) return textHtml;

  let $text;

  if (isPlainText(textHtml)) {
    // textHtml 是纯文本，不是 html tag
    $text = $(`<span>${textHtml}</span>`);
  } else {
    // textHtml 是 html tag
    $text = $(textHtml);
    const tagName = getTagName($text);
    if (tagName !== 'span') {
      // 如果不是 span ，则包裹一层，接下来要设置 css
      $text = $(`<span>${textHtml}</span>`);
    }
  }

  // 设置样式
  if (color) $text.css('color', color);

  // 输出 html
  return getOuterHTML($text);
}
