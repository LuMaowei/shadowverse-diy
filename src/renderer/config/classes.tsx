import forestAvatar from '../../../assets/resources/classesAvatar/forest.png';
import forestGem from '../../../assets/resources/classesGem/forest.png';
import forestEmblem from '../../../assets/resources/classesEmblem/forest.png';
import forestBackground from '../../../assets/resources/classesBackground/forest.png';
import swordAvatar from '../../../assets/resources/classesAvatar/sword.png';
import swordGem from '../../../assets/resources/classesGem/sword.png';
import swordEmblem from '../../../assets/resources/classesEmblem/sword.png';
import swordBackground from '../../../assets/resources/classesBackground/sword.png';
import runeAvatar from '../../../assets/resources/classesAvatar/rune.png';
import runeGem from '../../../assets/resources/classesGem/rune.png';
import runeEmblem from '../../../assets/resources/classesEmblem/rune.png';
import runeBackground from '../../../assets/resources/classesBackground/rune.png';
import dragonAvatar from '../../../assets/resources/classesAvatar/dragon.png';
import dragonGem from '../../../assets/resources/classesGem/dragon.png';
import dragonEmblem from '../../../assets/resources/classesEmblem/dragon.png';
import dragonBackground from '../../../assets/resources/classesBackground/dragon.png';
import shadowAvatar from '../../../assets/resources/classesAvatar/shadow.png';
import shadowGem from '../../../assets/resources/classesGem/shadow.png';
import shadowEmblem from '../../../assets/resources/classesEmblem/shadow.png';
import shadowBackground from '../../../assets/resources/classesBackground/shadow.png';
import bloodAvatar from '../../../assets/resources/classesAvatar/blood.png';
import bloodGem from '../../../assets/resources/classesGem/blood.png';
import bloodEmblem from '../../../assets/resources/classesEmblem/blood.png';
import bloodBackground from '../../../assets/resources/classesBackground/blood.png';
import havenAvatar from '../../../assets/resources/classesAvatar/haven.png';
import havenGem from '../../../assets/resources/classesGem/haven.png';
import havenEmblem from '../../../assets/resources/classesEmblem/haven.png';
import havenBackground from '../../../assets/resources/classesBackground/haven.png';
import portalAvatar from '../../../assets/resources/classesAvatar/portal.png';
import portalGem from '../../../assets/resources/classesGem/portal.png';
import portalEmblem from '../../../assets/resources/classesEmblem/portal.png';
import portalBackground from '../../../assets/resources/classesBackground/portal.png';
import neutralAvatar from '../../../assets/resources/classesAvatar/neutral.png';
import neutralGem from '../../../assets/resources/classesGem/neutral.png';
import neutralEmblem from '../../../assets/resources/classesEmblem/neutral.png';
import neutralBackground from '../../../assets/resources/classesBackground/neutral.png';

export interface Classes {
  key: string;
  name: string;
  avatar: string;
  gem: string;
  emblem: string;
  background: string;
}

export interface ClassesMap {
  [key: string]: Classes;
}

const classesList = [
  'forest',
  'sword',
  'rune',
  'dragon',
  'shadow',
  'blood',
  'haven',
  'portal',
  'neutral',
];

const classesMap: ClassesMap = {
  forest: {
    key: 'forest',
    name: '精灵',
    avatar: forestAvatar,
    gem: forestGem,
    emblem: forestEmblem,
    background: forestBackground,
  },
  sword: {
    key: 'sword',
    name: '皇家护卫',
    avatar: swordAvatar,
    gem: swordGem,
    emblem: swordEmblem,
    background: swordBackground,
  },
  rune: {
    key: 'rune',
    name: '巫师',
    avatar: runeAvatar,
    gem: runeGem,
    emblem: runeEmblem,
    background: runeBackground,
  },
  dragon: {
    key: 'dragon',
    name: '龙族',
    avatar: dragonAvatar,
    gem: dragonGem,
    emblem: dragonEmblem,
    background: dragonBackground,
  },
  shadow: {
    key: 'shadow',
    name: '死灵法师',
    avatar: shadowAvatar,
    gem: shadowGem,
    emblem: shadowEmblem,
    background: shadowBackground,
  },
  blood: {
    key: 'blood',
    name: '吸血鬼',
    avatar: bloodAvatar,
    gem: bloodGem,
    emblem: bloodEmblem,
    background: bloodBackground,
  },
  haven: {
    key: 'haven',
    name: '主教',
    avatar: havenAvatar,
    gem: havenGem,
    emblem: havenEmblem,
    background: havenBackground,
  },
  portal: {
    key: 'portal',
    name: '复仇者',
    avatar: portalAvatar,
    gem: portalGem,
    emblem: portalEmblem,
    background: portalBackground,
  },
  neutral: {
    key: 'neutral',
    name: '中立',
    avatar: neutralAvatar,
    gem: neutralGem,
    emblem: neutralEmblem,
    background: neutralBackground,
  },
};

export default classesMap;
export { classesList };
