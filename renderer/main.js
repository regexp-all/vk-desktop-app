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
   email: danyadev@mail.ru
   gmail: danyadev0@gmail.com
   github: https://github.com/danyadev/vk-desktop-app
*/

'use strict';

var tabs = document.querySelector('.tabs'),
    content = document.querySelector('.content');

tabs.children[0].classList.add('tab_active');
content.children[0].classList.add('content_active');

[].slice.call(tabs.children).forEach(tab => {
  tab.addEventListener('click', e => {
    if(document.querySelector('.tab_active') == e.target) return;
    let tabIndex = [].slice.call(tabs.children).indexOf(e.target);
    
    document.querySelector('.tab_active').classList.remove('tab_active');
    document.querySelector('.content_active').classList.remove('content_active');
    
    tabs.children[tabIndex].classList.add('tab_active');
    content.children[tabIndex].classList.add('content_active');
  });
});

const fs = require('fs');
const vkapi = require('./vkapi');

var users = fs.readFileSync('./renderer/users.json', 'utf-8'),
    wrapper_login = document.querySelector('.wrapper_login'),
    wrapper_content = document.querySelector('.wrapper_content');

if(users == '{}') {
  wrapper_login.style.display = 'block';
  // пустой файлик, нужно ввести данные в поле
  // vkapi.auth login, password, platform
} else {
  wrapper_content.style.display = 'block';
  
  users = JSON.parse(users);
  let keys = Object.keys(users), user_id;
  keys.forEach(key => { if(users[key].active) user_id = key });
  user = users[user_id];
  
  // user - инфа о юзере из users.json
  // весь код, передача параметров другим функциям
}