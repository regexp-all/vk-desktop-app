/* 
  Copyright © 2018 danyadev

  Контактные данные:
   vk: https://vk.com/danyadev
   telegram: https://t.me/danyadev
   альтернативная ссылка: https://t.elegram.ru/danyadev
   github: https://github.com/danyadev/vk-desktop-app
*/

'use strict';

const { Menu, getCurrentWindow } = require('electron').remote

module.exports = {
  showContextMenu: t => Menu.buildFromTemplate(t).popup(getCurrentWindow()),
  USERS_PATH: __dirname + '/../users.json',
  SETTINGS_PATH: __dirname + '/../settings.json',
  MENU_WIDTH: '-260px',
  update: (() => {
    try {
      return require('./../../dev.json').update;
    } catch(e) {
      return true;
    }
  })(),
  keys: [
    [2274003, 'hHbZxrka2uZ6jB1inYsH'], // 0  Android
    [3140623, 'VeWdmVclDCtn6ihuP1nt'], // 1  iPhone
    [3682744, 'mY6CDUswIVdJLCD3j15n'], // 2  iPad
    [3697615, 'AlVXZFMUqyrnABp8ncuU'], // 3  Windows
    [2685278, 'lxhD8OD7dMsqtXIm5IUY'], // 4  Kate Mobile
    [5027722, 'Skg1Tn1r2qEbbZIAJMx3'], // 5  VK Messenger
    [4580399, 'wYavpq94flrP3ERHO4qQ'], // 6  Snapster (Android)
    [2037484, 'gpfDXet2gdGTsvOs7MbL'], // 7  Symbian (Nokia)
    [3502557, 'PEObAuQi6KloPM4T30DV'], // 9  Windows Phone
    [3469984, 'kc8eckM3jrRj8mHWl9zQ'], // 10 Lynt
    [3032107, 'NOmHf1JNKONiIG5zPJUu']  // 11 Vika (Blackberry)
  ]
}