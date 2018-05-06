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

var emoji = require('./emoji')

var start_from = '';
var news_content = qs('.news_content'),
  content = qs('.content');

var load = () => {
  console.log('news loaded');
}

// var a = new Date(1524849777 * 1000);
// a.toLocaleString('ru-RU');
// filters: 'post,photo,photo_tag,friends_recomm,ads_app,ads_site,ads_post,ads_app_slider',
// ^ ОСТАВИТЬ РЕКЛАМА ^
// all filters:
// post photo photo_tag wall_photo friend note audio video

var getNews = () => {
  vkapi.method('execute.getNewsfeedSmart', {
    count: 15,
    func_v: 5,
    start_from: start_from,
    filters: 'post,photo,photo_tag',
    fields: 'id,emoji,first_name,first_name_dat,first_name_acc,last_name,last_name_acc,last_name_gen,sex,screen_name,photo_50,photo_100,online,video_files'
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
        head_data,
        head_name, time = new Date(item.date * 1000),
        this_time = new Date,
        parsed_time = '',
        zero = time.getMinutes() < 10 ? '0' : '',
        mins = zero + time.getMinutes(),
        text = item.text.replace(/\n/g, '<br>'),
        months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля',
                  'августа', 'сентября', 'октября', 'ноября', 'декабря'];

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
      } else {
        head_data = data.response.profiles.find(el => el.id == item.source_id);
        head_name = `${head_data.first_name} ${head_data.last_name}`;
      }
      
      if(item.copy_history) {
        text += '*репост*<br>';
      }

      if (item.attachments) {
        text += '<br>';
        
        console.log(item.attachments);

        for (let j = 0; j < item.attachments.length; j++) {
          let attach = item.attachments[j];

          if (attach.type == 'photo') {
            text += `<img src="${attach.photo.photo_604}" class="post_img"><br>`;
          } else if(attach.type == 'audio') {
            text += '*аудиозапись*<br>';
          } else if(attach.type == 'article') {
            text += '*стилизированная ссылка*<br>';
          } else if(attach.type == 'poll') {
            text += '*голосование*<br>';
          } else if(attach.type == 'video') {
            text += '*Видеозапись*<br>';
          } else if(attach.type == 'doc') {
            text += '*Документ*<br>';
          } else {
            text += `<br>Неизвестный тип прикрепления.<br>
                     Скиньте текст ниже <a href="https://vk.com/danyadev">разработчику</a>.<br>
                     ${JSON.stringify(attach)}<br>`
          }
        }
      }

      if (emoji.isEmoji(text)) text = emoji.replace(text);

      let sign = '';

      if (item.signer_id) {
        let signer = data.response.profiles.find(el => el.id == item.signer_id);

        sign = `<br><div class='post_signer'>${signer.first_name} ${signer.last_name}</div>`;
      }

      news_content.innerHTML += `
        <div class='news_block theme_block'>
          <div class='post_header'>
            <img src="${head_data.photo_50}" class="post_header_img">
            <div class="post_names">
              <div class="post_name">${head_name}</div>
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

getNews();

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

//   data.response.items.forEach(item => {
//     let text = '';
// 
//     if(item.type == 'friend') {
//       let creator = data.response.profiles.find(el => el.id == item.source_id);
// 
//       text += `${creator.first_name} ${creator.last_name} добавил${creator.sex == 1 ? 'a' : ''} в друзья `;
// 
//       item.friends.items.forEach((item_, i) => {
//         let user = data.response.profiles.find(el => el.id == item_.user_id);
//         text += `${user.first_name_acc} ${user.last_name_acc}`;
// 
//         if(i == item.friends.items.length-1) text += '.';
//         else text += ', ';
//       })
//     } else if(item.type == 'audio' && item.audio) {
//       let block = { innerHTML: '' };
// 
//       item.audio.items.forEach(audio_item => {
//         block.innerHTML += `
//           *аудиозапись*<br>
//         `.trim();
//       });
// 
//       text += block.innerHTML;
//     } else if(item.type == 'post') {
//       let rev = it => {
//         text += it.text.replace(/\n/g, '<br>') || ' ';
//         if(it.copy_history) rev(it.copy_history[0]);
//       }
// 
//       rev(item);
// 
//       if(item.attachments) {
//         text += '<div class="news_attachments">'
//         item.attachments.forEach(attach => {
//           if(attach.type == 'video') {
//             text += '*видеозапись*';
//           } else if(attach.type == 'photo') {
//             text += `<img src="${attach.photo.photo_604}" style="max-width: 100%">`;
//           }
//         });
//         text += '</div>'
//       }
//     } else if(item.type == 'video') {
//       item.video.items.forEach(video => {
//         text += '*видеозапись*';
//       });
//     } else if(item.type == 'wall_photo') {
//       item.photos.items.forEach(photo => {
//         text += `<img src="${photo.photo_604}" style="max-width: 100%">`;
//       });
//     }
// 
//     let head_data, head_name;
// 
//     if(item.source_id.toString()[0] == '-') {
//       item.source_id = item.source_id.toString().replace(/-/, '');
//       head_data = data.response.groups.find(el => el.id == item.source_id);
//       head_name = item.name;
// 
//       console.log('группа', head_data);
//       // группа
//     } else {
//       head_data = data.response.profiles.find(el => el.id == item.source_id);
//       head_name = `${item.first_name} ${item.last_name}`;
// 
//       console.log('человек', head_data);
//       // чел
//     }
// 
//     news_content.innerHTML += `
//       <div class='news_block theme_block'>
//         <div class='news_head'>
//           <img src="${head_data.photo_50}" class="news_head_img">
//           <div class="news_head_names">
//             <div class="news_head_name"></div>
//             <div class="news_head_time"></div>
//           </div>
//         </div>
//         ${text || 'Техническая информация:<br>' + JSON.stringify(item)}
//       </div>
//     `.trim();
//   });

module.exports = {
  load, getNews
}