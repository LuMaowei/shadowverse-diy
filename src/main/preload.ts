import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import sqlClient from './db/client';

const {
  close,
  removeDB,
  getTraits,
  setTrait,
  deleteTrait,
  getAbilities,
  setAbility,
  deleteAbility,
  getCardPacks,
  setCardPack,
  deleteCardPack,
  getCards,
  setCard,
  deleteCard,
  getCard,
} = sqlClient;

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: string, arg?: any) {
      ipcRenderer.send(channel, arg);
    },
    on(channel: string, func: (arg: any) => void) {
      const subscription = (_event: IpcRendererEvent, arg: any) => func(arg);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: string, func: (arg: any) => void) {
      ipcRenderer.once(channel, (_event, arg) => func(arg));
    },
  },
};

const contextHandler = {
  platform: process.platform,
  NODE_ENV: process.env.NODE_ENV,
  ROOT_PATH: window.location.href.startsWith('file') ? '../../' : '/',
  store: {
    get(key: string) {
      return ipcRenderer.sendSync('electron-store-get', key);
    },
    set(key: string, value: any) {
      return ipcRenderer.send('electron-store-set', key, value);
    },
  },
  sqlClient: {
    close,
    removeDB,
    getTraits,
    setTrait,
    deleteTrait,
    getAbilities,
    setAbility,
    deleteAbility,
    getCardPacks,
    setCardPack,
    deleteCardPack,
    getCards,
    setCard,
    deleteCard,
    getCard,
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);
contextBridge.exposeInMainWorld('Context', contextHandler);

export type ElectronHandler = typeof electronHandler;
