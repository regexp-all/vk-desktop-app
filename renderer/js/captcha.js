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
  `.trim();
  
  let btn = qs('.captcha_btn input'),
      input = qs('.captcha_key input'),
      img = qs('.captcha_img img');
  
  img.addEventListener('click', () => img.src += ~img.src.indexOf("rnd=") ? "1" : "&rnd=1");
  btn.addEventListener('click', () => {
    qs('.captcha_modal').remove();
    callback(input.value, sid);
  });
  
  input.addEventListener('keydown', e => e.keyCode == 13 ? btn.click() : '');
}