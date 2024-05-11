// Disable no-unused-vars, broken for spread args
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import sqlClient from './db/client';

const { close, removeDB, getTableNames, getRoles, setRole, deleteRole } =
  sqlClient;

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
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
    getTableNames,
    getRoles,
    setRole,
    deleteRole,
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);
contextBridge.exposeInMainWorld('Context', contextHandler);

export type ElectronHandler = typeof electronHandler;
