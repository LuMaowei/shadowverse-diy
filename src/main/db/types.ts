import type { LogFunctions } from 'electron-log';

export type DataInterface = {
  close: () => Promise<void>;
  removeDB: () => Promise<void>;
  getTableNames: () => Promise<any>;
  getRoles: (params: any) => Promise<any>;
  setRole: (params: any) => void;
  deleteRole: (params: any) => void;
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
