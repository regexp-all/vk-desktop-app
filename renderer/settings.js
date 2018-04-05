const vkapi = require('./vkapi');
const utils = require('./utils');
const USERS_PATH = utils.USERS_PATH;
const MENU_WIDTH = utils.MENU_WIDTH;
const keys = utils.keys;

var menu_settings_item = document.querySelector('.menu_settings_item'),
    modal_settings_wrapper = document.querySelector('.modal_settings_wrapper'),
    menu = document.querySelector('.menu'),
    modal_settings = document.querySelector('.modal_settings'),
    settings_close = document.querySelector('.settings_close'),
    settings_menu_item = document.querySelector('.settings_menu_item');
    
var toggleSettings = () => {
  if(modal_settings_wrapper.style.display == 'none' || modal_settings_wrapper.style.display == '') {
    modal_settings_wrapper.style.display = 'flex';
    setTimeout(() => modal_settings_wrapper.style.opacity = 1, 0);
  } else {
    modal_settings_wrapper.style.opacity = 0;
    setTimeout(() => modal_settings_wrapper.style.display = 'none', 400);
  }
}

settings_close.addEventListener('click', toggleSettings);

modal_settings_wrapper.addEventListener('click', e => {
  if(e.target == modal_settings_wrapper) toggleSettings();
});

settings_menu_item.addEventListener('contextmenu', () => {
  require('./utils.js').showContextMenu([
    {
      label: 'Открыть настройки',
      click: () => settings_menu_item.click()
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
  editOnline,
  toggleSettings
}