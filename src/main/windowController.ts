import { BrowserWindow, dialog, ipcMain, shell } from 'electron';

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

  ipcMain.on('open-file-dialog', (event, eventId) => {
    dialog
      .showOpenDialog({
        properties: ['openFile'],
      })
      .then((res) => {
        event.sender.send(`selected-file-${eventId}`, res);
      });
  });

  ipcMain.on('open-url', (event, url) => {
    shell.openExternal(url);
  });
}
