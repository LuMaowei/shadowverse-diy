import { WindowName } from '../src/types';
import { ClientInterface } from '../src/main/db/types';

declare global {
  let UserInfo: DB.UserAttributes;

  interface ContextType {
    NODE_ENV: string;
    platform: string;
    ROOT_PATH: string;

    getUserInfo: () => DB.UserAttributes;
    updateUserInfo: (userInfo: DB.UserAttributes) => unknown;

    locale: string;
    sqlClient: ClientInterface;

    // for login window
    loginSuccessed: (userInfo: DB.UserAttributes) => void;
    closeLogin: () => void;

    // for other window
    windowOpen: (args: Windows.Args) => void;
    windowClose: (name: WindowName) => void;
  }

  interface Window {
    Context: ContextType;

    // for theme
  }
}
