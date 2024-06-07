import type { LogFunctions } from 'electron-log';

export type DataInterface = {
  close: () => Promise<void>;
  removeDB: () => Promise<void>;
  getTraits: (params: DB.Traits) => Promise<any>;
  setTrait: (params: DB.Traits) => void;
  deleteTrait: (params: DB.Traits) => void;
  getAbilities: (params: DB.Abilities) => Promise<any>;
  setAbility: (params: DB.Abilities) => void;
  deleteAbility: (params: DB.Abilities) => void;
  getCardPacks: (params: DB.CardPacks) => Promise<any>;
  setCardPack: (params: DB.CardPacks) => void;
  deleteCardPack: (params: DB.CardPacks) => void;
  getCards: (params: DB.Cards & { traitIds?: number[] }) => Promise<any>;
  setCard: (
    params: DB.Cards & {
      tokenIds?: number[];
      parentIds?: number[];
      cardDetails?: (DB.CardDetails & { abilityIds?: number[] })[];
      traitIds?: number[];
    },
  ) => Promise<number | bigint | undefined>;
  deleteCard: (params: DB.Cards) => void;
  getCard: (params: DB.Cards) => Promise<any>;
};

export type ClientInterface = DataInterface & {
  // Client-side only
  shutdown: () => Promise<void>;
};

export type ServerInterface = DataInterface & {
  // Server-side only
  initialize: (options: {
    configDir: string;
    key: string;
    logger: Omit<LogFunctions, 'log'>;
  }) => Promise<void>;
};
