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

const { shell } = require('electron').remote;
const fs = require('fs');
const vkapi = require('./vkapi');

var tabs = document.querySelector('.tabs'),
    content = document.querySelector('.content'),
    users = JSON.parse(fs.readFileSync('./renderer/users.json', 'utf-8')),
    wrapper_login = document.querySelector('.wrapper_login'),
    wrapper_content = document.querySelector('.wrapper_content');

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
    
document.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    shell.openExternal(e.target.href);
  });
});

// функция, которая запускает все части клиента
var startVK = (users, user) => {
  console.log(user);
  vkapi.method('audio.get', { // и это работает :)
    access_token: user.access_token
  }, data => console.log(data));
}

if(Object.keys(users).length >= 1) { // есть хоть 1 юзер, просто передаем данные дальше
  wrapper_login.style.display = 'none';
  wrapper_content.style.display = 'block';
  
  let keys = Object.keys(users), user_id;
  keys.forEach(key => { if(users[key].active) user_id = key });
  
  startVK(users, users[user_id]);
} else { // если нет, то вставляем форму авторизации
  let input_form = document.querySelector('.input_form'),
      password_input = document.querySelector('.password_input input'),
      show_password = document.querySelector('.show_password'),
      error_info = document.querySelector('.error_info'),
      login_button = document.querySelector('.login_button'),
      sms_code = document.querySelector('.sms_code_input'),
      captcha_modal = document.querySelector('.captcha_modal'),
      captcha_close = document.querySelector('.captcha_close'),
      captcha_btn = document.querySelector('.captcha_btn input'),
      captcha_input = document.querySelector('.captcha_key input'),
      captcha_sid, captcha_key, code;
      
  // кнопка закрытия капчи
  captcha_close.addEventListener('click', () => {
    if(captcha_modal.style.display != 'none') {
      captcha_modal.style.display = 'none';
      error_info.innerHTML = '';
    }
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
  
  wrapper_login.style.display = 'flex';

  input_form.children[0].oninput = input_form.children[1].oninput = () => {
    if(input_form.children[0].value.trim() != '' && // логин
       input_form.children[1].children[1].value.trim() != '' && // пароль
       login_button.hasAttribute('disabled')) {
      login_button.removeAttribute('disabled');
    }
    
    if(input_form.children[0].value.trim() == '' || // логин
       input_form.children[1].children[1].value.trim() == '') { // пароль
      login_button.setAttribute('disabled', '');
    }
  }

  captcha_btn.addEventListener('click', () => {
    captcha_key = captcha_input.value;
    auth();
  });

  let auth = () => {
    vkapi.auth({
      login: input_form.children[0].value,
      password: input_form.children[1].children[1].value,
      platform: [input_form.children[2].selectedIndex, input_form.children[2].value],
      captcha_sid: captcha_sid,
      captcha_key: captcha_key,
      code: sms_code.value,
      v: 5.73
    }, data => {
      captcha_close.click();
      
      if(data.error) {
        error_info.innerHTML = data.error_description || data.error || 'Неизвестная ошибка';
          
        if(data.error == 'need_captcha') {
          let captcha_img = document.querySelector('.captcha_img');
          
          captcha_img.children[0].src = data.captcha_img;
          captcha_modal.style.display = 'flex';
          captcha_sid = data.captcha_sid;
        }
        
        if(data.error == 'need_validation') {
          sms_code.style.display = 'block';
          error_info.innerHTML += `<br>Смс придет на номер ${data.phone_mask}`;
        }
        
        return;
      }
      
      captcha_modal.style.display = 'none';
      wrapper_login.style.display = 'none';
      wrapper_content.style.display = 'block';
      
      users = JSON.parse(fs.readFileSync('./renderer/users.json', 'utf-8'));
      let keys = Object.keys(users), user_id;
      keys.forEach(key => { if(users[key].active) user_id = key });
      
      startVK(users, users[user_id]);
    });
  };

  login_button.addEventListener('click', auth);
}