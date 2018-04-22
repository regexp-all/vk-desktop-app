/* 
  Copyright © 2018 danyadev

  Контактные данные:
   vk: https://vk.com/danyadev
   telegram: https://t.me/danyadev
   альтернативная ссылка: https://t.elegram.ru/danyadev
   github: https://github.com/danyadev/vk-desktop-app
*/

'use strict';

const vkapi = require('./vkapi');
const utils = require('./utils');
const USERS_PATH = utils.USERS_PATH;
const MENU_WIDTH = utils.MENU_WIDTH;
const keys = utils.keys;

var settings_item = qs('.settings_item'),
    settings_tabs = qs('.settings_tabs'),
    settings_content_block = qs('.settings_content_block');
    
settings_tabs.children[0].classList.add('settings_tab_active');
settings_content_block.children[0].classList.add('settings_content_active');

[].slice.call(settings_tabs.children).forEach(item => {
  item.addEventListener('click', function() {
    if(qs('.settings_tab_active') == this) return;
    let tab = [].slice.call(settings_tabs.children).indexOf(this);

    qs('.settings_tab_active').classList.remove('settings_tab_active');
    qs('.settings_content_active').classList.remove('settings_content_active');

    settings_tabs.children[tab].classList.add('settings_tab_active');
    settings_content_block.children[tab].classList.add('settings_content_active');
  });
});

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
    force_sms: true
  }, data => {
    // туто применение/включение капчи/ввода кода из смс
  });
}

module.exports = {
  editOnline
}