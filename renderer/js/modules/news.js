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

var news_content = qs('.news_content');

var load = () => {
  console.log('news loaded');
}

vkapi.method('execute.getNewsfeedSmart', {
  count: 20,
  fields: 'id,first_name,first_name_dat,first_name_acc,last_name,last_name_acc,last_name_gen,sex,screen_name,photo_50,photo_100,online,video_files'
}, data => {
  qs('.news_block_err').style.display = 'none';
  
  data.response.items.forEach(item => {
    let text = '';
  
    if(item.type == 'friend') {
      let creator = data.response.profiles.find(el => el.id == item.source_id);
      
      text += `${creator.first_name} ${creator.last_name} добавил${creator.sex == 1 ? 'a' : ''} в друзья `;
  
      item.friends.items.forEach((item_, i) => {
        let user = data.response.profiles.find(el => el.id == item_.user_id);
        text += `${user.first_name_acc} ${user.last_name_acc}`;
        
        if(i == item.friends.items.length-1) text += '.';
        else text += ', ';
      })
    } else if(item.type == 'audio' && item.audio) {
      let block = { innerHTML: '' };
      
      item.audio.items.forEach(audio_item => {
        block.innerHTML += `
          *аудиозапись*<br>
        `.trim();
      });
      
      text += block.innerHTML;
    } else if(item.type == 'post') {
      let rev = it => {
        text += it.text.replace(/\n/g, '<br>');
        if(it.copy_history) rev(it.copy_history[0]);
      }
      
      rev(item);
      
      if(item.attachments) {
        text += '<div class="news_attachments">'
        item.attachments.forEach(attach => {
          if(attach.type == 'video') {
            text += '*видеозапись*';
            // text += `<iframe src="${attach.video.player}" height="287px" width="510px"></iframe>`;
          } else if(attach.type == 'photo') {
            text += `<img src="${attach.photo.photo_604}" height='210px'>`;
          }
        });
        text += '</div>'
      }
    } else if(item.type == 'video') {
      item.video.items.forEach(video => {
        text += '*видеозапись*';
        // text += `<iframe src="${video.player}" height="287px" width="510px"></iframe>`;
      });
    } else if(item.type == 'wall_photo') {
      item.photos.items.forEach(photo => {
        text += `<img src="${photo.photo_604}" height='210px'>`;
      });
    }
  
    news_content.innerHTML += `<div class='news_block theme_block'>
    ${text || 'Техническая информация:<br>' + JSON.stringify(item)}
    </div>`
  });
}, 'news_inet_err');

module.exports = {
  load
}