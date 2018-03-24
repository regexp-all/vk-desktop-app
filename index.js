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

const { app, BrowserWindow } = require('electron');

try { // это находится за пределами моего проекта и используется всеми другими моими проектами.
      // так сделано чтобы в node_modules небыло лишних вещей
  require('./../reload/node_modules/electron-reload')(__dirname, {
    ignored: [
      __dirname + '/.git',
      __dirname + '/.gitignore',
      __dirname + '/index.js',
      __dirname + '/LICENSE',
      __dirname + '/renderer/users.json',
      __dirname + '/README.md',
      __dirname + '/node_modules',
      __dirname + '/package.json',
      __dirname + '/package_lock.json'
    ]
})} catch(e){}

app.on('window-all-closed', () => {
  if(process.platform !== 'darwin'){
    app.quit();
  }
});

app.on('ready', () => {
  win = new BrowserWindow({
    width: 720,
    height: 480,
    minWidth: 720,
    minHeight: 480,
    show: false
  });

  win.loadFile('renderer/index.html');
  win.on('ready-to-show', () => win.show());
  win.on('closed', () => win = null);
});