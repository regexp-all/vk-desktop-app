/* 
  Copyright © 2018 danyadev

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

/* Контактные данные:
   vk: https://vk.com/danyadev
   telegram: https://t.me/danyadev
   email: danyadev@mail.ru
   gmail: danyadev0@gmail.com
   github: https://github.com/danyadev/vk-desktop-app
*/

// отключение предупреждения в консоли
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

try {
  require('./../reload/node_modules/electron-reload')(__dirname, {
    ignored: [
      __dirname + '/.git',
      __dirname + '/index.js',
      __dirname + '/LICENSE',
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

var settings = {
  window: { width: 720, height: 480 },
  audio: { volume: 0.63 }
};

if(!fs.existsSync(SETTINGS_PATH)) fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
else {
  let _settings = fs.readFileSync(SETTINGS_PATH, 'utf-8');
  if(_settings == '' || _settings == '{}' || !JSON.parse(_settings).audio) {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
  } else settings = JSON.parse(_settings);
}

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