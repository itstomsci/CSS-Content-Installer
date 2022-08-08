const { BrowserWindow, shell, app } = require('electron');
const { join } = require('path');

function createWindow() {
  const browserWindow = new BrowserWindow({
    width: 600,
    height: 350,
    center: true,
    resizable: false,
    fullscreenable: false,
    title: 'CS:S Content Installer',
    icon: join(__dirname, 'assets/logo.ico'),
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      devTools: false,
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  browserWindow.loadFile('index.html');

  browserWindow.once('ready-to-show', () => {
    browserWindow.show();

    browserWindow.removeMenu();
  });

  browserWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();

    if (url != event.sender.getURL()) shell.openExternal(url);
  });

  browserWindow.webContents.on('zoom-changed', event => {
    event.preventDefault();
  });
}

app.whenReady().then(() => {
  app.setAppUserModelId('CS:S Content Installer');

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length == 0) createWindow();
  });

  const singleInstance = app.requestSingleInstanceLock();

  if (singleInstance) createWindow();
  else app.quit();
});

app.on('second-instance', () => {
  const browserWindow = BrowserWindow.getAllWindows()[0];

  if (browserWindow)
    if (browserWindow.isEnabled()) browserWindow.show();
    else browserWindow.focus();
});

app.on('window-all-closed', () => {
  if (process.platform != 'darwin') app.quit();
});
