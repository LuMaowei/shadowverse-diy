import { ClientInterface } from '../src/main/db/types';

declare global {
  interface ContextType {
    NODE_ENV: string;
    platform: string;
    ROOT_PATH: string;

    locale: string;
    sqlClient: ClientInterface;
  }

  interface Window {
    Context: ContextType;
  }
}
