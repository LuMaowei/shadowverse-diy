import followerBronze from '../../../assets/resources/cardFrame/followerBronze.png';
import followerSilver from '../../../assets/resources/cardFrame/followerSilver.png';
import followerGold from '../../../assets/resources/cardFrame/followerGold.png';
import followerLegendary from '../../../assets/resources/cardFrame/followerLegendary.png';
import spellBronze from '../../../assets/resources/cardFrame/spellBronze.png';
import spellSilver from '../../../assets/resources/cardFrame/spellSilver.png';
import spellGold from '../../../assets/resources/cardFrame/spellGold.png';
import spellLegendary from '../../../assets/resources/cardFrame/spellLegendary.png';
import amuletBronze from '../../../assets/resources/cardFrame/amuletBronze.png';
import amuletSilver from '../../../assets/resources/cardFrame/amuletSilver.png';
import amuletGold from '../../../assets/resources/cardFrame/amuletGold.png';
import amuletLegendary from '../../../assets/resources/cardFrame/amuletLegendary.png';
import reborn from '../../../assets/resources/cardFrame/reborn.png';

export interface Types {
  key: string;
  name: string;
}

export interface Rarities {
  key: string;
  name: string;
}

export interface Frames {
  key: string;
  name: string;
  frame: string;
}

export type IsReborn = boolean;

export interface FramesMap {
  [key: string]: Frames;
}

const typesList = ['follower', 'spell', 'amulet'];
const raritiesList = ['bronze', 'silver', 'gold', 'legendary'];
const framesList = [
  'follower_bronze',
  'follower_silver',
  'follower_gold',
  'follower_legendary',
  'spell_bronze',
  'spell_silver',
  'spell_gold',
  'spell_legendary',
  'amulet_bronze',
  'amulet_silver',
  'amulet_gold',
  'amulet_legendary',
];

const framesMap: FramesMap = {
  follower_bronze: {
    key: 'follower_bronze',
    name: '从者_青铜',
    frame: followerBronze,
  },
  follower_silver: {
    key: 'follower_silver',
    name: '从者_白银',
    frame: followerSilver,
  },
  follower_gold: {
    key: 'follower_gold',
    name: '从者_黄金',
    frame: followerGold,
  },
  follower_legendary: {
    key: 'follower_legendary',
    name: '从者_传说',
    frame: followerLegendary,
  },
  spell_bronze: {
    key: 'spell_bronze',
    name: '法术_青铜',
    frame: spellBronze,
  },
  spell_silver: {
    key: 'spell_silver',
    name: '法术_白银',
    frame: spellSilver,
  },
  spell_gold: {
    key: 'spell_gold',
    name: '法术_黄金',
    frame: spellGold,
  },
  spell_legendary: {
    key: 'spell_legendary',
    name: '法术_传说',
    frame: spellLegendary,
  },
  amulet_bronze: {
    key: 'amulet_bronze',
    name: '护符_青铜',
    frame: amuletBronze,
  },
  amulet_silver: {
    key: 'amulet_silver',
    name: '护符_白银',
    frame: amuletSilver,
  },
  amulet_gold: {
    key: 'amulet_gold',
    name: '护符_黄金',
    frame: amuletGold,
  },
  amulet_legendary: {
    key: 'amulet_legendary',
    name: '护符_传说',
    frame: amuletLegendary,
  },
};

const rebornFrame = reborn;

export default framesMap;
export { typesList, raritiesList, framesList, rebornFrame };
