import { app, contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import path from 'path';
import sqlClient from './db/client';

const {
  close,
  removeDB,
  getRoles,
  setRole,
  deleteRole,
  getTypes,
  setType,
  deleteType,
  getRarities,
  setRarity,
  deleteRarity,
  getFrames,
  setFrame,
  deleteFrame,
  getTraits,
  setTrait,
  deleteTrait,
  getAbilities,
  setAbility,
  deleteAbility,
  getCards,
  setCard,
  deleteCard,
  getCardDetails,
  setCardDetails,
  deleteCardDetails,
} = sqlClient;

const getAssetPath = (...paths: string[]): string => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  return path.join(RESOURCES_PATH, ...paths);
};

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
  getAssetPath,
  sqlClient: {
    close,
    removeDB,
    getRoles,
    setRole,
    deleteRole,
    getTypes,
    setType,
    deleteType,
    getRarities,
    setRarity,
    deleteRarity,
    getFrames,
    setFrame,
    deleteFrame,
    getTraits,
    setTrait,
    deleteTrait,
    getAbilities,
    setAbility,
    deleteAbility,
    getCards,
    setCard,
    deleteCard,
    getCardDetails,
    setCardDetails,
    deleteCardDetail,
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);
contextBridge.exposeInMainWorld('Context', contextHandler);

export type ElectronHandler = typeof electronHandler;
