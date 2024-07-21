import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'node:path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    paintWhenInitiallyHidden: true,
    autoHideMenuBar: true,
    icon: join(__dirname, "../../resources/icon.png"),
    webPreferences: {
      preload: join(__dirname, `../preload/index.js`)
    }
  });

  mainWindow.on(`ready-to-show`, () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: `deny` };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env[`ELECTRON_RENDERER_URL`]) {
    mainWindow.loadURL(process.env[`ELECTRON_RENDERER_URL`]);
  } else {
    mainWindow.loadFile(join(__dirname, `../renderer/index.html`));
  }
}

app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId(`com.jackdotjs.vincent`);

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on(`browser-window-created`, (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC test
  ipcMain.on(`ping`, () => console.log(`pong`));

  ipcMain.handle(`readConfig`, (await import(`./api/readConfig`)).default);
  ipcMain.handle(`writeConfig`, (await import(`./api/writeConfig`)).default);
  ipcMain.handle(`fetchDictionaryList`, (await import(`./api/fetchDictionaryList`)).default);
  ipcMain.handle(`fetchDictionary`, (await import(`./api/fetchDictionary`)).default);

  createWindow();

  app.on(`activate`, function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS.
app.on(`window-all-closed`, () => {
  if (process.platform !== `darwin`) {
    app.quit();
  }
});