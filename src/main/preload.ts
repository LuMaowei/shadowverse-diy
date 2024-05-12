// Disable no-unused-vars, broken for spread args
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import sqlClient from './db/client';

const { close, removeDB, getRoles, setRole, deleteRole } = sqlClient;

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
  sqlClient: {
    close,
    removeDB,
    getRoles,
    setRole,
    deleteRole,
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);
contextBridge.exposeInMainWorld('Context', contextHandler);

export type ElectronHandler = typeof electronHandler;
