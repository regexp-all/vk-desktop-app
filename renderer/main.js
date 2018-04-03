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

const { shell, getCurrentWindow } = require('electron').remote;
const fs = require('fs');
const vkapi = require('./vkapi');
const audio = require('./audio');
const captcha = require('./captcha');
const USERS_PATH = __dirname + '\/users.json';
const MENU_WIDTH = '-260px';

var header = document.querySelector('.header'),
    menu_items = document.querySelector('.menu'),
    content = document.querySelector('.content'),
    wrapper_login = document.querySelector('.wrapper_login'),
    wrapper_content = document.querySelector('.wrapper_content'),
    audioplayer = document.querySelector('.audioplayer'),
    open_menu = document.querySelector('.open_menu'),
    open_menu_icon = document.querySelector('.open_menu_icon'),
    menu = document.querySelector('.menu'),
    account_icon = document.querySelector('.acc_icon'),
    full_name = document.querySelector('.menu_acc_name'),
    acc_status = document.querySelector('.menu_acc_status'),
    menu_account_bgc = document.querySelector('.menu_account_bgc');
    
// функция, которая запускает все части клиента
var startVK = (users, user) => {
  account_icon.style.backgroundImage = menu_account_bgc.style.backgroundImage = `url('${user.photo_100}')`;
  full_name.innerHTML = `${user.first_name} ${user.last_name}`;
  
  setTimeout(() => vkapi.method('users.get', { fields: 'status' }, 
           data => acc_status.innerHTML = data.response[0].status), 350);
  
  let loadAudio = () => {
    setTimeout(() => audio.load(user), 600);
    menu_items.children[3].removeEventListener('click', loadAudio);
  }
  
  menu_items.children[3].addEventListener('click', loadAudio);
}

menu_items.children[0].classList.add('menu_item_active');
content.children[0].classList.add('content_active');

[].slice.call(menu_items.children).forEach(item => {
  item.addEventListener('click', function() {
    let tab = [].slice.call(menu_items.children).indexOf(this);
    if(tab == 0) return;
    
    menu.style.left = MENU_WIDTH;
    if(document.querySelector('.menu_item_active') == this) return;
    
    if(tab == 9) {
      if(getCurrentWindow().isDevToolsOpened()) getCurrentWindow().closeDevTools();
      else getCurrentWindow().openDevTools();
      return;
    }

    document.querySelector('.menu_item_active').classList.remove('menu_item_active');
    document.querySelector('.content_active').classList.remove('content_active');

    menu_items.children[tab].classList.add('menu_item_active');
    content.children[tab].classList.add('content_active');
  });
});

menu.style.left = MENU_WIDTH; // первично скрываем панельку

open_menu.addEventListener('click', () => { // открытие/зактытие панельки
  if(menu.style.left == MENU_WIDTH) menu.style.left = '0px';
  else menu.style.left = MENU_WIDTH;
});

content.addEventListener('click', () => { // скрытие панели при клике на контент
  if(menu.style.left == '0px') menu.style.left = MENU_WIDTH;
});

header.addEventListener('click', e => { // скрытие панели при клике на шапку
  if(e.target == open_menu_icon) return;
  if(menu.style.left == '0px') menu.style.left = MENU_WIDTH;
});

account_icon.addEventListener('click', () => {
  menu.style.left = MENU_WIDTH;
  
  document.querySelector('.menu_item_active').classList.remove('menu_item_active');
  document.querySelector('.content_active').classList.remove('content_active');

  menu_items.children[0].classList.add('menu_item_active');
  content.children[0].classList.add('content_active');
});
    
document.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    shell.openExternal(e.target.href);
  });
});

if(!fs.existsSync(USERS_PATH)) fs.writeFileSync(USERS_PATH, '{}');

var users = fs.readFileSync(USERS_PATH, 'utf-8');
if(users.trim() == '') {
  users = {};
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
} else users = JSON.parse(users);

if(Object.keys(users).length >= 1) { // если есть хоть 1 юзер, то идем дальше
  wrapper_content.style.display = 'block';
  
  let keys = Object.keys(users), user_id;
  keys.forEach(key => { if(users[key].active) user_id = key });
  
  startVK(users, users[user_id]);
} else { // если нет, то вставляем форму авторизации
  let input_form = document.querySelector('.input_form'),
      login_input = document.querySelector('.login_input'),
      password_input = document.querySelector('.password_input input'),
      show_password = document.querySelector('.show_password'),
      twofa_info = document.querySelector('.twofa_info'),
      error_info = document.querySelector('.error_info'),
      login_button = document.querySelector('.login_button'),
      sms_code = document.querySelector('.sms_code_input');
      
  wrapper_login.style.display = 'flex';
  
  // кнопка для показа и скрытия пароля
  show_password.addEventListener('click', () => {
    if([].slice.call(show_password.classList).indexOf('active') != -1) {
      show_password.classList.remove('active');
      password_input.type = 'password';
    } else {
      show_password.classList.add('active');
      password_input.type = 'text';
    }
  });
  
  login_input.onkeydown = password_input.onkeydown = e => {
    if(e.keyCode == 13 && !login_button.hasAttribute('disabled')) login_button.click();
  }
  
  sms_code.onkeydown = e => { if(e.keyCode == 13) login_button.click() }

  login_input.oninput = password_input.oninput = () => {
    if(login_input.value.trim() != '' &&
       password_input.value.trim() != '' &&
       login_button.hasAttribute('disabled')) {
      login_button.removeAttribute('disabled');
    }
    
    if(login_input.value.trim() == '' || password_input.value.trim() == '')
      login_button.setAttribute('disabled', '');
  }

  login_button.addEventListener('click', () => {
    auth();
    login_button.setAttribute('disabled', '');
  });
  
  let auth = (mainAuth) => {
    vkapi.auth({
      login: login_input.value,
      password: password_input.value,
      platform: [0, 'Android'],
      captcha_sid: mainAuth && mainAuth.sid,
      captcha_key: mainAuth && mainAuth.key,
      code: sms_code.value,
      v: 5.73
    }, data => {
      login_button.removeAttribute('disabled');
      
      if(data.error) {
        if(data.error == 'need_captcha') {
          captcha(data.captcha_img, data.captcha_sid, (key, sid) => auth({key, sid}));
        }
        
        if(data.error_description == 'Username or password is incorrect')
          error_info.innerHTML = 'Неверный логин или пароль';
        
        if(data.error == 'need_validation') {
          sms_code.style.display = 'block';
          sms_code.focus();
          twofa_info.innerHTML = `Смс придет на номер ${data.phone_mask}`;
        }
        
        if(data.error_description == 'code is invalid') error_info.innerHTML = 'Неверный код';
        
        return;
      }
      
      error_info.innerHTML = '';
      twofa_info.innerHTML = '';
      wrapper_login.style.display = 'none';
      wrapper_content.style.display = 'block';
      
      users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
      let keys = Object.keys(users), user_id;
      keys.forEach(key => { if(users[key].active) user_id = key });
      
      startVK(users, users[user_id]);
    });
  }
}