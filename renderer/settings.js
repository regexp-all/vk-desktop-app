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
   email: nemov.danil@mail.ru
   github: https://github.com/danyadev/vk-desktop-app
*/

'use strict';

const vkapi = require('./vkapi');
const utils = require('./utils');
const USERS_PATH = utils.USERS_PATH;
const MENU_WIDTH = utils.MENU_WIDTH;
const keys = utils.keys;

var settings_item = document.querySelector('.settings_item');

settings_item.addEventListener('contextmenu', () => {
  require('./utils.js').showContextMenu([
    {
      label: 'Открыть настройки',
      click: () => settings_item.click()
    },
    {
      label: 'Открыть DevTools',
      click: () => {
        if(getCurrentWindow().isDevToolsOpened()) getCurrentWindow().closeDevTools();
        else getCurrentWindow().openDevTools();
        
        menu.style.left = MENU_WIDTH;
      }
    }
  ]);
});

var editOnline = data => {
  let users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8')), user;
      
  Object.keys(users).forEach(user_id => {
    if(users[user_id].active) user = users[user_id];
  });
  
  vkapi.resetOnline({
    grant_type: 'password',
    login: user.login,
    password: user.password,
    client_id: null,// айди выбранного приложения  keys[authInfo.platform[0]][0],
    client_secret: null, // секрет выбранного приложения keys[authInfo.platform[0]][1],
    '2fa_supported': true,
    scope: 'nohttps,all',
    force_sms: true,
    v: 5.73
  }, data => {
    // туто применение/включение капчи/ввода кода из смс
  });
}

module.exports = {
  editOnline
}