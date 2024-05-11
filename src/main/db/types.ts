import type { LogFunctions } from 'electron-log';

export type DataInterface = {
  close: () => Promise<void>;
  removeDB: () => Promise<void>;
  getTableNames: () => Promise<any>;
  getRoles: (
    params: DB.Role & { pageSize?: number; current?: number },
  ) => Promise<any>;
  setRole: (params: DB.Role) => void;
  deleteRole: (params: DB.Role) => void;
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
