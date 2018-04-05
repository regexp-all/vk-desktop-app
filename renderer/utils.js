const { Menu, getCurrentWindow } = require('electron').remote;

var showContextMenu = template => {
  Menu.buildFromTemplate(template).popup(getCurrentWindow());
}

module.exports = {
  showContextMenu,
  USERS_PATH: __dirname + '\/users.json',
  MENU_WIDTH: '-260px',
  keys: [
    [2274003, 'hHbZxrka2uZ6jB1inYsH'], // 0  Android
    [3140623, 'VeWdmVclDCtn6ihuP1nt'], // 1  iPhone
    [3682744, 'mY6CDUswIVdJLCD3j15n'], // 2  iPad
    [3697615, 'AlVXZFMUqyrnABp8ncuU'], // 3  Windows
    [2685278, 'lxhD8OD7dMsqtXIm5IUY'], // 4  Kate Mobile
    [5027722, 'Skg1Tn1r2qEbbZIAJMx3'], // 5  VK Messenger
    [4580399, 'wYavpq94flrP3ERHO4qQ'], // 6  Snapster (Android)
    [2037484, 'gpfDXet2gdGTsvOs7MbL'], // 7  Symbian (Nokia)
    [3265802, 't106ZcWMk9BLdrxobdh5'], // 8  API.console (из /dev)
    [3502557, 'PEObAuQi6KloPM4T30DV'], // 9  Windows Phone
    [3469984, 'kc8eckM3jrRj8mHWl9zQ'], // 10 Lynt
    [3032107, 'NOmHf1JNKONiIG5zPJUu']  // 11 Vika (Blackberry)
  ]
}