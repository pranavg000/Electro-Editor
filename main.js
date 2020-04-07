const { app, BrowserWindow, Menu, globalShortcut, ipcMain } = require('electron')

function createWindow () {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: true
    }
  })
  globalShortcut.register('CmdOrCtrl+Z', () => win.webContents.send('UNDO_NEEDED'));
  globalShortcut.register('CmdOrCtrl+Y', () => win.webContents.send('REDO_NEEDED'));
  globalShortcut.register('CmdOrCtrl+F', () => win.webContents.send('FIND'));
  globalShortcut.register('CmdOrCtrl+Shift+S', () => win.webContents.send('SAVE_NEEDED'));
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
      label: app.getName(),
      submenu: [
        {
          label: 'Save',
          // accelerator: 'CmdOrCtrl+S',
          click: () => { 
            win.webContents.send('SAVE_NEEDED'); 
          }
        },
        {
          label: 'Save all',
          // accelerator: 'CmdOrCtrl+Shift+S',
          click: () => { 
            win.webContents.send('SAVE_ALL_NEEDED'); 
          }
        },
        {
          label: 'Undo',
          // accelerator: 'CmdOrCtrl+Z',
          click: () => { 
              win.webContents.send('UNDO_NEEDED');             
          }
        },
        {
          label: 'Find',
          // accelerator: 'CmdOrCtrl+Z',
          click: () => { 
              win.webContents.send('FIND');             
          }
        },
      ]
    }
  ]))

  // and load the index.html of the app.
  win.loadFile('src/index.html')
  win.maximize()
  // Open the DevTools.
  win.webContents.openDevTools()

  


}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.on('APP_QUIT', function (event, arg) {
    app.quit();
})
