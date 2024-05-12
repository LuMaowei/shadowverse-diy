import { WindowName } from '../src/types';
import { ClientInterface } from '../src/main/db/types';

declare global {
  interface ContextType {
    NODE_ENV: string;
    platform: string;
    ROOT_PATH: string;

    locale: string;
    sqlClient: ClientInterface;

    // for other window
    windowOpen: (args: Windows.Args) => void;
    windowClose: (name: WindowName) => void;
  }

  interface Window {
    Context: ContextType;

    // for theme
  }
}
