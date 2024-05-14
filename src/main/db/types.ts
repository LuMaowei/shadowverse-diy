import type { LogFunctions } from 'electron-log';

export type DataInterface = {
  close: () => Promise<void>;
  removeDB: () => Promise<void>;
  getRoles: (
    params: DB.Role & { pageSize?: number; current?: number },
  ) => Promise<any>;
  setRole: (params: DB.Role) => void;
  deleteRole: (params: DB.Role) => void;
  getTypes: (
    params: DB.Type & { pageSize?: number; current?: number },
  ) => Promise<any>;
  setType: (params: DB.Type) => void;
  deleteType: (params: DB.Type) => void;
  getRarities: (
    params: DB.Rarity & { pageSize?: number; current?: number },
  ) => Promise<any>;
  setRarity: (params: DB.Rarity) => void;
  deleteRarity: (params: DB.Rarity) => void;
  getFrames: (
    params: DB.Frame & { pageSize?: number; current?: number },
  ) => Promise<any>;
  setFrame: (params: DB.Frame) => void;
  deleteFrame: (params: DB.Frame) => void;
  getTraits: (
    params: DB.Trait & { pageSize?: number; current?: number },
  ) => Promise<any>;
  setTrait: (params: DB.Trait) => void;
  deleteTrait: (params: DB.Trait) => void;
  getAbilities: (
    params: DB.Ability & { pageSize?: number; current?: number },
  ) => Promise<any>;
  setAbility: (params: DB.Ability) => void;
  deleteAbility: (params: DB.Ability) => void;
  getCards: (
    params: DB.Card & { pageSize?: number; current?: number },
  ) => Promise<any>;
  setCard: (params: DB.Card) => void;
  deleteCard: (params: DB.Card) => void;
  getCardDetails: (
    params: DB.CardDetails & { pageSize?: number; current?: number },
  ) => Promise<any>;
  setCardDetails: (params: DB.CardDetails) => void;
  deleteCardDetails: (params: DB.CardDetails) => void;
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
