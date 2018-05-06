/* 
  Copyright © 2018 danyadev
  Лицензия - Apache 2.0

  Контактные данные:
   vk: https://vk.com/danyadev
   или https://vk.com/danyadev0
   telegram: https://t.me/danyadev
   github: https://github.com/danyadev/vk-desktop-app
*/

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

try {
  require('./../reload/node_modules/electron-reload')(__dirname, {
    ignored: [
      __dirname + '/.git',
      __dirname + '/index.js',
      __dirname + '/renderer/users.json',
      __dirname + '/renderer/settings.json',
      __dirname + '/README.md',
      __dirname + '/node_modules',
      __dirname + '/package.json'
    ]
  });
} catch(e) {};

const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const SETTINGS_PATH = __dirname + '/renderer/settings.json';

var settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));

app.on('window-all-closed', () => {
  if(process.platform != 'darwin') app.quit();
});

app.on('ready', () => {
  let opts = {
    width: settings.window.width,
    height: settings.window.height,
    minWidth: 640,
    minHeight: 480,
    show: false
  }
  
  if(settings.window.x && settings.window.y) {
    opts.x = settings.window.x < 0 ? 0 : settings.window.x;
    opts.y = settings.window.y < 0 ? 0 : settings.window.y;
  }
  
  win = new BrowserWindow(opts);
  
  win.setMenu(null); // удаление меню
  win.loadFile('renderer/index.html');
  win.on('ready-to-show', win.show);
  win.on('closed', () => win = null);
});