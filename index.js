/* 
  Copyright © 2018 danyadev

  Контактные данные:
   vk: https://vk.com/danyadev
   telegram: https://t.me/danyadev
   альтернативная ссылка: https://t.elegram.ru/danyadev
   github: https://github.com/danyadev/vk-desktop-app
*/

// отключение предупреждения в консоли
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
})} catch(e){}

const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const SETTINGS_PATH = __dirname + '\/renderer\/settings.json';

var settings = fs.readFileSync(SETTINGS_PATH, 'utf-8');

app.on('window-all-closed', () => {
  if(process.platform != 'darwin') app.quit();
});

app.on('ready', () => {
  let winOpts = {
    width: settings.window.width,
    height: settings.window.height,
    minWidth: 620,
    minHeight: 480,
    show: false
  }
  
  if(settings.window.x && settings.window.y) {
    winOpts.x = settings.window.x < 0 ? 0 : settings.window.x;
    winOpts.y = settings.window.y < 0 ? 0 : settings.window.y;
  }
  
  win = new BrowserWindow(winOpts);
  
  win.setMenu(null); // удаление меню
  win.loadFile('renderer/index.html');
  win.on('ready-to-show', () => win.show());
  win.on('closed', () => win = null);
});