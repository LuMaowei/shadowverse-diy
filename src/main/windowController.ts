import { BrowserWindow, ipcMain } from 'electron';

export default function windowController(window: BrowserWindow) {
  ipcMain.on('window:minimize', () => {
    window.minimize();
  });

  ipcMain.on('window:maximize', () => {
    if (!window.isMaximized()) {
      window.maximize();
    } else {
      window.unmaximize();
    }
  });

  ipcMain.on('window:close', () => {
    window.close();
  });

  window.on('maximize', () => {
    window.webContents.send('isMaximized', true);
  });

  window.on('unmaximize', () => {
    window.webContents.send('isMaximized', false);
  });
}
