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
const USERS_PATH = __dirname + '\/users.json';

var menu_items = document.querySelector('.menu'),
    content = document.querySelector('.content'),
    wrapper_login = document.querySelector('.wrapper_login'),
    wrapper_content = document.querySelector('.wrapper_content'),
    audioplayer = document.querySelector('.audioplayer'),
    open_menu = document.querySelector('.open_menu'),
    menu = document.querySelector('.menu'),
    account_icon = document.querySelector('.acc_icon');
    
// функция, которая запускает все части клиента
var startVK = (users, user) => {
  let loadAudio = () => {
    setTimeout(() => audio.load(user), 300);
    menu_items.children[3].removeEventListener('click', loadAudio);
  }
  
  menu_items.children[3].addEventListener('click', loadAudio);
}

menu_items.children[0].classList.add('tab_active');
content.children[0].classList.add('content_active');

[].slice.call(menu_items.children).forEach(item => {
  item.addEventListener('click', function(){
    if(document.querySelector('.tab_active') == this) return;
    let tabIndex = [].slice.call(menu_items.children).indexOf(this);
    menu.style.left = '-46px';
    content.style.marginLeft = '0px';
    if(tabIndex == 9) return; // для кнопки настроек (пока нет модалки)

    document.querySelector('.tab_active').classList.remove('tab_active');
    document.querySelector('.content_active').classList.remove('content_active');

    menu_items.children[tabIndex].classList.add('tab_active');
    content.children[tabIndex].classList.add('content_active');
  });
});

menu.style.left = '-46px';

open_menu.addEventListener('click', () => {
  if(menu.style.left == '-46px') {
    menu.style.left = '0px';
    content.style.marginLeft = '46px';
  } else {
    menu.style.left = '-46px';
    content.style.marginLeft = '0px';
  }
});

content.addEventListener('click', () => {
  if(menu.style.left == '0px') {
    menu.style.left = '-46px';
    content.style.marginLeft = '0px';
  }
});
document.querySelector('.menu_settings_icon').addEventListener('click', () => {
  if(getCurrentWindow().isDevToolsOpened()) getCurrentWindow().closeDevTools();
  else getCurrentWindow().openDevTools();
});
    
document.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    shell.openExternal(e.target.href);
  });
});

window.addEventListener('scroll', () => {
  if(window.scrollY >= 100) {
    audioplayer.style.position = 'fixed';
    audioplayer.style.marginTop = '44px';
    document.querySelector('.pl50').style.display = 'block';
  } else {
    audioplayer.style.position = '';
    audioplayer.style.marginTop = '';
    document.querySelector('.pl50').style.display = 'none';
  }
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
  account_icon.style.backgroundImage = `url('${users[user_id].photo_50}')`;
  
  startVK(users, users[user_id]);
} else { // если нет, то вставляем форму авторизации
  let input_form = document.querySelector('.input_form'),
      login_input = document.querySelector('.login_input'),
      password_input = document.querySelector('.password_input input'),
      show_password = document.querySelector('.show_password'),
      twofa_info = document.querySelector('.twofa_info'),
      error_info = document.querySelector('.error_info'),
      login_button = document.querySelector('.login_button'),
      sms_code = document.querySelector('.sms_code_input'),
      captcha_modal = document.querySelector('.captcha_modal'),
      captcha_btn = document.querySelector('.captcha_btn input'),
      captcha_input = document.querySelector('.captcha_key input'),
      captcha_img = document.querySelector('.captcha_img img'),
      captcha_sid, captcha_key, code;
      
  wrapper_login.style.display = 'flex';
  
  captcha_img.addEventListener('click', () => {
    captcha_img.src += ~captcha_img.src.indexOf("rnd=") ? "1" : "&rnd=1";
  });
  
  captcha_btn.addEventListener('click', () => {
    captcha_key = captcha_input.value;
    captcha_modal.style.display = 'none';
    captcha_input.value = '';
    auth();
  });
  
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
  captcha_input.onkeydown = e => { if(e.keyCode == 13) captcha_btn.click() }

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
  
  let auth = () => {
    vkapi.auth({
      login: login_input.value,
      password: password_input.value,
      platform: [0, 'Android'],
      captcha_sid: captcha_sid,
      captcha_key: captcha_key,
      code: sms_code.value,
      v: 5.73
    }, data => {
      login_button.removeAttribute('disabled');
      
      if(data.error) {
        if(data.error == 'need_captcha') {
          captcha_img.src = data.captcha_img;
          captcha_modal.style.display = 'flex';
          captcha_input.focus();
          captcha_sid = data.captcha_sid;
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
      captcha_modal.style.display = 'none';
      wrapper_login.style.display = 'none';
      wrapper_content.style.display = 'block';
      
      users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
      let keys = Object.keys(users), user_id;
      keys.forEach(key => { if(users[key].active) user_id = key });
      account_icon.style.backgroundImage = `url('${users[user_id].photo_50}')`;
      
      startVK(users, users[user_id]);
    });
  }
}