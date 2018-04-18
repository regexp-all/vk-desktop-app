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
   email: nemov.danil@mail.ru
   github: https://github.com/danyadev/vk-desktop-app
*/

'use strict';

module.exports = (src, sid, callback) => {
  let modal = document.createElement('div');
  modal.classList.add('captcha_modal');
  document.body.appendChild(modal);
  modal.style.display = 'flex';
  
  modal.innerHTML = `
    <div class="captcha">
      <div class="captcha_img"><img src='${src}'></div>
      <div class="captcha_info">Не видно? Нажмите на картинку</div>
      <div class="captcha_key"><input type="text" placeholder="Введите капчу"></div>
      <div class="captcha_btn"><input type="button" value='Продолжить'></div>
    </div>
  `;
  
  let btn = document.querySelector('.captcha_btn input'),
      input = document.querySelector('.captcha_key input'),
      img = document.querySelector('.captcha_img img');
  
  img.addEventListener('click', () => img.src += ~img.src.indexOf("rnd=") ? "1" : "&rnd=1");
  btn.addEventListener('click', () => {
    document.body.removeChild(modal);
    callback(input.value, sid);
  });
  
  input.addEventListener('keydown', e => e.keyCode == 13 ? btn.click() : '');
}