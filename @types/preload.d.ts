import { ClientInterface } from '../src/main/db/types';

declare global {
  interface ContextType {
    NODE_ENV: string;
    platform: string;
    ROOT_PATH: string;

    locale: string;
    sqlClient: ClientInterface;
    store: {
      get: (key: string) => any;
      set: (key: string, value: any) => void;
    };
  }

  interface Window {
    Context: ContextType;
  }
}
