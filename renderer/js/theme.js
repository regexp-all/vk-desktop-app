/* 
  Copyright © 2018 danyadev

  Контактные данные:
   vk: https://vk.com/danyadev
   telegram: https://t.me/danyadev
   альтернативная ссылка: https://t.elegram.ru/danyadev
   github: https://github.com/danyadev/vk-desktop-app
*/

'use strict';

var link = document.createElement('link'),
    settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8')).settings;

link.rel = 'stylesheet';
link.href = `themes/${settings.theme}.css`;
link.className = 'black-style-link';

module.exports = type => {
  if((type && type == 'white') || (!type && settings.theme == 'white')) {
    if(qs('.black-style-link')) document.head.removeChild(qs('.black-style-link'));
    return;
  }
  
  if(type) link.href = `themes/${type}.css`;
  
  if(qs('.black-style-link')) document.head.removeChild(qs('.black-style-link'));
  
  document.head.appendChild(link);
}