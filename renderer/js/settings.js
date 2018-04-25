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
const keys = utils.keys;

var settings_item = qs('.settings_item'),
    settings_tabs = qs('.settings_tabs'),
    settings_content_block = qs('.settings_content_block'),
    select = qs('.select'),
    select_list = qs('.select_list'),
    select_selected = qs('.select_selected');
    
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
  utils.showContextMenu([
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

var optionBlock = '',
    themeList = fs.readdirSync(__dirname + '/../themes')
                .map(item => item.replace(/\.css/, ''));

themeList.unshift('white');

for(let i=0; i<themeList.length; i++) {
  optionBlock += `<div class="option">${themeList[i]}</div>`
}

select_list.innerHTML = optionBlock;

select_selected.innerHTML = settings_json.settings.theme;

select.addEventListener('click', () => {
  if(qs('.select_opened')) {
    select.classList.remove('select_opened');
  } else {
    select.classList.add('select_opened');
    
    // активируем активный элемент
    if(!qs('.active')) {
      let themeID = themeList.indexOf(settings_json.settings.theme);
      
      select_list.children[themeID].classList.add('active');
    }
  }
});

select_list.addEventListener('mousemove', () => {
  qs('.active').classList.remove('active');
  
  event.target.classList.add('active');
});

select_list.addEventListener('mousedown', () => {
  select_selected.innerHTML = event.target.innerHTML;
  settings_json.settings.theme = event.target.innerHTML;
  
  theme(event.target.innerHTML);
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings_json, null, 2));
});

// var editOnline = data => {
//   let users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8')), user;
// 
//   Object.keys(users).forEach(user_id => {
//     if(users[user_id].active) user = users[user_id];
//   });
// 
//   vkapi.resetOnline({
//     grant_type: 'password',
//     login: user.login,
//     password: user.password,
//     client_id: null,// айди выбранного приложения  keys[authInfo.platform[0]][0],
//     client_secret: null, // секрет выбранного приложения keys[authInfo.platform[0]][1],
//     '2fa_supported': true,
//     scope: 'nohttps,all',
//     force_sms: true
//   }, data => {
//     // туто применение/включение капчи/ввода кода из смс
//   });
// }
// 
// module.exports = {
//   editOnline
// }