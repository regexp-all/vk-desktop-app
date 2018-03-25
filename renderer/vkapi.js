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

// Методы для получения серверов для загрузки и самой загрузки файлов
/*                      [upload_field_name, step_one_method_name, step_two_method_name]

UFT_AUDIO:              ['file', 'audio.getUploadServer', 'audio.save'],
UFT_COVER:              ['photo', 'photos.getOwnerCoverPhotoUploadServer', 'photos.saveOwnerCoverPhoto'],
UFT_DOCUMENT:           ['file', 'docs.getUploadServer', 'docs.save'],
UFT_DOCUMENT_PM:        ['file', 'docs.getMessagesUploadServer', 'docs.save'],
UFT_DOCUMENT_WALL:      ['file', 'docs.getWallUploadServer', 'docs.save'],
UFT_PHOTO_ALBUM:        ['file', 'photos.getUploadServer', 'photos.save'],
UFT_PHOTO_MAIN:         ['photo', 'photos.getOwnerPhotoUploadServer', 'photos.saveOwnerPhoto'],
UFT_PHOTO_MARKET:       ['file', 'photos.getMarketUploadServer', 'photos.saveMarketPhoto'],
UFT_PHOTO_MARKET_ALBUM: ['file', 'photos.getMarketAlbumUploadServer', 'photos.saveMarketAlbumPhoto'],
UFT_PHOTO_PM:           ['photo', 'photos.getMessagesUploadServer', 'photos.saveMessagesPhoto'],
UFT_PHOTO_WALL:         ['photo', 'photos.getWallUploadServer', 'photos.saveWallPhoto'],
UFT_VIDEO:              ['video_file', 'video.save']
*/

const https = require('https');
const fs = require('fs');
const toURLString = require('querystring').stringify;

var method = (method, params, callback) => {
  params = params || {};
  params.v = params.v || 5.73;
  
  let req = https.request({
    host: 'api.vk.com',
    path: `/method/${method}?${toURLString(params)}`,
    method: 'GET',
    headers: { 'User-Agent': 'KateMobileAndroid' }
  }, res => {
    let body = '';

    res.on('data', chunk => body += chunk);
    res.on('end', () => callback(JSON.parse(body)));
  });
  
  req.end();
}

var keys = {
  android:       [2274003, 'hHbZxrka2uZ6jB1inYsH'], // 0
  iphone:        [3140623, 'VeWdmVclDCtn6ihuP1nt'], // 1
  ipad:          [3682744, 'mY6CDUswIVdJLCD3j15n'], // 2
  windows:       [3697615, 'AlVXZFMUqyrnABp8ncuU'], // 3
  kate_mobile:   [2685278, 'lxhD8OD7dMsqtXIm5IUY']  // 4
};

var auth = (authInfo, callback) => {
  let login = authInfo.login, password = authInfo.password, platform = authInfo.platform,
      users = fs.readFileSync('./renderer/users.json', 'utf-8');
  
  if(login[0] == '+') login = login.replace('+', '');
  
  let reqData = {
    grant_type: 'password',
    client_id: keys[Object.keys(keys)[platform]][0],
    client_secret: keys[Object.keys(keys)[platform]][1],
    username: login,
    password: password,
    //'2fa_supported': 1, // TODO: поддержка двухфакторки
    scope: 'notify,friends,photos,audio,video,docs,status,notes,pages,wall,groups,'
          +'messages,offline,notifications,stories,stats,ads,email,market',
    v: authInfo.v || 5.71
  }
  
  //if(authInfo.code) reqData.code = authInfo.code;
  
  let req = https.request({
    host: 'oauth.vk.com',
    path: `/token/?${toURLString(reqData)}`,
    method: 'GET',
    headers: {
      'User-Agent': 'KateMobileAndroid'
    }
  }, res => {
    let data = '';

    res.on('data', body => data += body);
    res.on('end', () => {
      
      data = JSON.parse(data);
      users = JSON.parse(users);
      
      console.log(data);
      
      // if(data.validation_type == '2fa_sms') {
      //   callback(data); // или ошибка аутентификации ^^^
      //   // TODO: сделать двухфакторку
      //   return;
      // }
      
      vkapi.method('users.get', {
        access_token: data.access_token,
        user_id: data.user_id,
        fields: 'photo_50'
      }, user_info => {
        Object.keys(users).forEach(user => users[user].active ? users[user].active = false : void 0);
        
        let userInfo = {
          access_token: data.access_token,
          id: data.user_id,
          login: login,
          first_name: user_info.response[0].first_name,
          last_name: user_info.response[0].last_name,
          photo_50: user_info.response[0].photo_50,
          active: true
        };
        
        callback(userInfo);
        users[data.user_id] = userInfo;
        fs.writeFileSync('./renderer/users.json', JSON.stringify(users, null, 2));
      });
    });
  });
  
  req.end();
};

module.exports = {
  method,
  auth,
  keys
};