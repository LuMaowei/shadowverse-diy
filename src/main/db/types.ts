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
