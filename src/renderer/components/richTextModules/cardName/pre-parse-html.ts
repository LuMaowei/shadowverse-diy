import $, { DOMElement, getTagName } from '../dom';

function preParse(fontElem: DOMElement): DOMElement {
  const $font = $(fontElem);
  const tagName = getTagName($font);
  if (tagName !== 'font') return fontElem;

  const color = $font.attr('color') || '';
  if (color) {
    $font.removeAttr('color');
    $font.css('color', color);
  }

  return $font[0];
}

export default {
  selector: 'font',
  preParseHtml: preParse,
};
