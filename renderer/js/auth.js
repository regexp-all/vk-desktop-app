/* 
  Copyright © 2018 danyadev

  Контактные данные:
   vk: https://vk.com/danyadev
   telegram: https://t.me/danyadev
   альтернативная ссылка: https://t.elegram.ru/danyadev
   github: https://github.com/danyadev/vk-desktop-app
*/

'use strict';

const vkapi = require('./vkapi');
const captcha = require('./captcha');

var login_input = qs('.login_input'),
    password_input = qs('.password_input input'),
    show_password = qs('.show_password'),
    twofa_info = qs('.twofa_info'),
    error_info = qs('.error_info'),
    login_button = qs('.login_button'),
    sms_code = qs('.sms_code_input'),
    open_devTools = qs('.open_devTools'),
    wrapper_login = qs('.wrapper_login');
    
wrapper_login.style.display = 'flex';

open_devTools.addEventListener('click', () => {
  if(getCurrentWindow().isDevToolsOpened()) getCurrentWindow().closeDevTools();
  else getCurrentWindow().openDevTools();
});

show_password.addEventListener('click', () => {
  if(show_password.classList.contains('active')) {
    show_password.classList.remove('active');
    password_input.type = 'password';
  } else {
    show_password.classList.add('active');
    password_input.type = 'text';
  }
});

wrapper_login.onkeydown = e => {
  if(e.keyCode == 13) login_button.click();
}

login_input.oninput = password_input.oninput = () => {
  if(login_input.value.trim()   != '' &&
    password_input.value.trim() != '' && login_button.disabled) {
    login_button.disabled = false;
  }
  
  if(login_input.value.trim() == '' || password_input.value.trim() == '') {
    login_button.disabled = true;
  }
}

login_button.addEventListener('click', () => {
  login_button.disabled = true;
  auth();
});

var auth = params => {
  vkapi.auth({
    login: login_input.value,
    password: password_input.value,
    platform: [0, 'Android'],
    captcha_sid: params && params.sid,
    captcha_key: params && params.key,
    code: sms_code.value
  }, data => {
    login_button.disabled = false;
    
    if(data.error) {
      if(data.error_description == 'Username or password is incorrect') {
        error_info.innerHTML = 'Неверный логин или пароль';
      }
      
      if(data.error == 'need_validation') {
        sms_code.style.display = 'block';
        sms_code.focus();
        
        error_info.innerHTML = '';
        twofa_info.innerHTML = `Смс придет на номер ${data.phone_mask}`;
      }
      
      if(data.error_description == 'code is invalid') {
        error_info.innerHTML = 'Неверный код';
      }
      
      return;
    }
    
    error_info.innerHTML = '';
    twofa_info.innerHTML = '';
    
    wrapper_login.style.display = '';
    wrapper_content.style.display = 'block';
    
    users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
    
    Object.keys(users).forEach(key => {
      if(users[key].active) {
        init(users, users[key]);
        return;
      }
    });
  }, 'error_info');
}