const vkapi = require('./vkapi');
const USERS_PATH = __dirname + '\/users.json';
const keys = [
  [2274003, 'hHbZxrka2uZ6jB1inYsH'], // 0 Android
  [3140623, 'VeWdmVclDCtn6ihuP1nt'], // 1 iPhone
  [3682744, 'mY6CDUswIVdJLCD3j15n'], // 2 iPad
  [3697615, 'AlVXZFMUqyrnABp8ncuU'], // 3 Windows
  [2685278, 'lxhD8OD7dMsqtXIm5IUY'], // 4 Kate Mobile
  [5027722, 'Skg1Tn1r2qEbbZIAJMx3']  // 5 VK Messenger
];

var editOnline = data => {
  let users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8')), user;
      
  Object.keys(users).forEach(user_id => {
    if(users[user_id].active) user = users[user_id];
  });
  
  vkapi.resetOnline({
    grant_type: 'password',
    login: user.login,
    password: user.password,
    client_id: null,// айди выбранного приложения  keys[authInfo.platform[0]][0],
    client_secret: null, // секрет выбранного приложения keys[authInfo.platform[0]][1],
    '2fa_supported': true,
    scope: 'nohttps,all',
    force_sms: true,
    v: 5.73
  }, data => {
    // туто применение/включение капчи/ввода кода из смс
  })
}

module.expots = {
  editOnline
}