import BaseMenu from './BaseMenu';

const FONT_COLOR_SVG =
  '<svg viewBox="0 0 1024 1024"><path d="M64 864h896v96H64zM360.58 576h302.85l81.53 224h102.16L579.24 64H444.77L176.89 800h102.16l81.53-224zM512 159.96L628.49 480H395.52L512 159.96z"></path></svg>';

class ColorMenu extends BaseMenu {
  readonly title = '标记为卡片';

  readonly iconSvg = FONT_COLOR_SVG;

  readonly mark = 'color';
}

export default ColorMenu;
