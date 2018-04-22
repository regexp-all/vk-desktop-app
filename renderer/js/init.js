const vkapi = require('./vkapi');
const audio = require('./audio');

var acc_status = qs('.menu_acc_status'),
    menu_account_bgc = qs('.menu_account_bgc'),
    full_name = qs('.menu_acc_name'),
    menu = qs('.menu');

var init = (users, user) => {
  // добавить user_ids, куда впихивать каждого юзера.
  // (для мультиакка TODO)
  vkapi.method('users.get', { fields: 'status,photo_100' }, data => {
    let u = 0;
    
    if(user.first_name != data.response[0].first_name) {
      user.first_name = data.response[0].first_name;
      u = 1;
    }
    
    if(user.last_name != data.response[0].last_name) {
      user.last_name = data.response[0].last_name;
      u = 1;
    }
    
    if(user.photo_100 != data.response[0].photo_100) {
      user.photo_100 = data.response[0].photo_100;
      u = 1;
    }
    
    if(u) {
      users[user.id] = user;
      fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
    }
    
    acc_status.innerHTML = data.response[0].status;
    account_icon.style.backgroundImage = menu_account_bgc.style.backgroundImage = `url('${user.photo_100}')`;
    full_name.innerHTML = `${user.first_name} ${user.last_name}`;
    
    danyadev.user = user;
    
    // далее идет инициализация всех разделов. Сначала нужно инициализировать выбранный активный раздел.
    
    menu.children[3].addEventListener('click', () => audio.load(user), { once: true });
    
    require('./settings');
    
    require('./user');
  });
}

module.exports = init;