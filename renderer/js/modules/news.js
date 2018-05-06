/* 
  Copyright © 2018 danyadev
  Лицензия - Apache 2.0

  Контактные данные:
   vk: https://vk.com/danyadev
   или https://vk.com/danyadev0
   telegram: https://t.me/danyadev
   github: https://github.com/danyadev/vk-desktop-app
*/

'use strict';

const emoji = require('./emoji');
const request = utils.request;

var news_content = qs('.news_content'),
    content = qs('.content'),
    start_from = '';

var load = () => {
  request({
    host: 'raw.githubusercontent.com',
    path: '/danyadev/data/master/develop'
  }, res => {
    let ver_list = Buffer.alloc(0);
  
    res.on('data', ch => ver_list = Buffer.concat([ver_list, ch]));
    res.on('end', () => {
      danyadev.verified = JSON.parse(ver_list);
      getNews();
    });
  });
}

// ads filters: friends_recomm,ads_app,ads_site,ads_post,ads_app_slider
// all filters: post,photo,photo_tag,wall_photo,friend,note,audio,video

var getNews = () => {
  vkapi.method('execute.getNewsfeedSmart', {
    count: 15,
    func_v: 5,
    start_from: start_from,
    filters: 'post,photo,photo_tag',
    fields: 'id,verified,first_name,first_name_dat,first_name_acc,last_name,last_name_acc,last_name_gen,sex,screen_name,photo_50,photo_100,online,video_files'
  }, data => {
    qs('.news_content_err').style.display = 'none';

    if (!data.response.next_from) {
      qs('.news_content_err').style.display = '';
      qs('.news_inet_err').innerHTML = `Показаны последние новости`;

      return;
    }

    start_from = data.response.next_from;

    for (let i = 0; i < data.response.items.length; i++) {
      let item = data.response.items[i],
          time = new Date(item.date * 1000),
          this_time = new Date,
          parsed_time = '',
          zero = time.getMinutes() < 10 ? '0' : '',
          mins = zero + time.getMinutes(),
          text = item.text.replace(/\n/g, '<br>'),
          months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля',
                    'августа', 'сентября', 'октября', 'ноября', 'декабря'
                   ],
          verified = '', sign = '', head_data, head_name;

      if (item.caption && item.caption.type == "explorebait") continue;

      if (this_time.toLocaleDateString() == time.toLocaleDateString()) {
        parsed_time += 'Сегодня в ';
      } else if (this_time.getFullYear() == time.getFullYear()) {
        parsed_time += `${time.getDate()} ${months[time.getMonth()]} в `;
      } else {
        parsed_time += `${time.getDate()} ${months[time.getMonth()]} ${time.getFullYear()} в `;
      }

      parsed_time += `${time.getHours()}:${mins}`;

      if (item.source_id.toString()[0] == '-') {
        item.source_id = item.source_id.toString().replace(/-/, '');
        head_data = data.response.groups.find(el => el.id == item.source_id);
        head_name = head_data.name;
        
        if(head_data.verified || danyadev.verified[1].includes(head_data.id)) {
          verified = '<img class="friend_verify" src="images/verify.png">';
        }
      } else {
        head_data = data.response.profiles.find(el => el.id == item.source_id);
        head_name = `${head_data.first_name} ${head_data.last_name}`;
        
        if(head_data.verified || danyadev.verified[0].includes(head_data.id)) {
          verified = '<img class="friend_verify" src="images/verify.png">';
        }
      }
      
      if(item.copy_history) {
        text += '<br>*репост*';
      }

      if (item.attachments) {
        for (let j = 0; j < item.attachments.length; j++) {
          let attach = item.attachments[j];
          
          text += '<br>';

          if (attach.type == 'photo') {
            text += `<img src="${attach.photo.photo_604}" class="post_img">`;
          } else if(attach.type == 'audio') {
            text += '*аудиозапись*';
          } else if(attach.type == 'article') {
            text += '*стилизированная ссылка*';
          } else if(attach.type == 'poll') {
            text += '*голосование*';
          } else if(attach.type == 'video') {
            text += '*Видеозапись*';
          } else if(attach.type == 'doc') {
            text += '*Документ*';
          } else {
            text += `Неизвестный тип прикрепления.<br>
                     Скиньте текст ниже <a href="https://vk.com/danyadev">разработчику</a>.<br>
                     ${JSON.stringify(attach)}
                    `;
          }
        }
      }

      if (emoji.isEmoji(text)) text = emoji.replace(text);

      if (item.signer_id) {
        let signer = data.response.profiles.find(el => el.id == item.signer_id);

        sign = `<br><div class='post_signer'>${signer.first_name} ${signer.last_name}</div>`;
      }

      news_content.innerHTML += `
        <div class='news_block theme_block'>
          <div class='post_header'>
            <img src="${head_data.photo_50}" class="post_header_img">
            <div class="post_names">
              <div class="post_name">${head_name} ${verified}</div>
              <div class="post_time">${parsed_time}</div>
            </div>
          </div>
          <div class="post_content">${text} ${sign}</div>
        </div>
      `.trim();
    }

    loadNewNews();
  }, 'news_inet_err');
}

var loadNewNews = start_from => {
  content.addEventListener('scroll', renderNewItems);

  let h = window.screen.height > news_content.clientHeight;

  if (h || news_content.clientHeight - window.outerHeight < window.scrollY) renderNewItems();
}

var renderNewItems = () => {
  let h = window.screen.height > news_content.clientHeight,
      l = news_content.clientHeight - window.outerHeight < content.scrollTop,
      a = qs('.news_content').parentNode.classList.contains('content_active');

  if (a && (h || l)) {
    content.removeEventListener('scroll', renderNewItems);
    getNews();
  }
}

// if(item.type == 'friend') {
//   let creator = data.response.profiles.find(el => el.id == item.source_id);
// 
//   text += `${creator.first_name} ${creator.last_name} добавил${creator.sex == 1 ? 'a' : ''} в друзья `;
// 
//   item.friends.items.forEach((item_, i) => {
//     let user = data.response.profiles.find(el => el.id == item_.user_id);
//     text += `${user.first_name_acc} ${user.last_name_acc}`;
// 
//     if(i == item.friends.items.length-1) text += '.';
//     else text += ', ';
//   })

module.exports = {
  load, getNews
}