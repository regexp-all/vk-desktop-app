/* 
  Copyright © 2018 danyadev

  Контактные данные:
   vk: https://vk.com/danyadev
   telegram: https://t.me/danyadev
   альтернативная ссылка: https://t.elegram.ru/danyadev
   github: https://github.com/danyadev/vk-desktop-app
*/

'use strict';

const vkapi = require('./../vkapi');

var group_wrap = qs('.group_wrap'),
    content = qs('.content');

danyadev.groups = {};

danyadev.groups.count = 0;
danyadev.groups.loaded = 0;
danyadev.groups.list = [];

var load = () => {
  // для чего-то
}

var pad = (n, text_forms) => {
  n = Math.abs(n) % 100;
  
  let n1 = n % 10;
  
  if(n > 10 && n < 20) return text_forms[2];
  if(n1 > 1 && n1 < 5) return text_forms[1];
  if(n1 == 1) return text_forms[0];
  
  return text_forms[2];
}

var getAllGroups = offset => {
  vkapi.method('groups.get', {
    extended: true,
    fields: 'members_count,activity',
    offset: offset
  }, data => {
    danyadev.groups.count = data.response.count;
    danyadev.groups.list = danyadev.groups.list.concat(data.response.items);
    
    if(danyadev.groups.list.length < data.response.count) {
      getAllGroups(offset + 1000);
    } else render();
  });
}

getAllGroups(0);

var render = () => {
  let block = { innerHTML: '' },
      endID = danyadev.groups.loaded + 15;
  
  let renderItem = () => {
    let group = danyadev.groups.list[danyadev.groups.loaded],
        members = 'подписчик' + pad(group.members_count, ['', 'а', 'ов']),
        name;
    
    if(group.deactivated) {
      name = '<div class="group_type">Сообщество заблокировано</div>';
    } else if(!group.members_count) {
      name = `
        <div class="group_type">${group.activity}</div>
        <div class="group_subs">Сообщество заблокировано</div>
      `.trim();
    }
    else {
        name = `
          <div class="group_type">${group.activity}</div>
          <div class="group_subs">${group.members_count.toLocaleString('ru-RU')} ${members}</div>
      `.trim();
    }
    
    block.innerHTML += `
      <div class="group_item theme_block">
        <img src="${group.photo_100}" class="group_img">
        <div class="group_names">
          <div class="group_name">${group.name}</div>
          ${name}
        </div>
      </div>
    `;
    
    danyadev.groups.loaded++;
    
    if(danyadev.groups.list[danyadev.groups.loaded] && danyadev.groups.loaded < endID) {
      setTimeout(renderItem, 0);
    } else {
      group_wrap.innerHTML += block.innerHTML;
      
      if(danyadev.groups.loaded < danyadev.groups.count) loadGroupsBlock();
    }
  }
  
  renderItem();
}

var renderNewItems = () => {
  let h = window.screen.height > group_wrap.clientHeight,
      l = group_wrap.clientHeight - window.outerHeight - 100 < content.scrollTop,
      a = qs('.group_wrap').parentNode.classList.contains('content_active');
  
  if(a && (h || l)) {
    content.removeEventListener('scroll', renderNewItems);
    render();
  }
}

var loadGroupsBlock = () => {
  content.addEventListener('scroll', renderNewItems);
  
  let h = window.screen.height > group_wrap.clientHeight,
      l = group_wrap.clientHeight - window.outerHeight - 100 < content.scrollTop;
  
  if(h || l) renderNewItems();
}

module.exports = {
  load
}