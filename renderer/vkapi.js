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

// Методы для получения серверов для загрузки и самой загрузки файлов (TODO)
// истории: https://vk.com/blog/stories-api
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
const { getCurrentWindow } = require('electron').remote;
const md5 = require('./md5');

var keys = {
  android:       [2274003, 'hHbZxrka2uZ6jB1inYsH'], // 0
  iphone:        [3140623, 'VeWdmVclDCtn6ihuP1nt'], // 1
  ipad:          [3682744, 'mY6CDUswIVdJLCD3j15n'], // 2
  windows:       [3697615, 'AlVXZFMUqyrnABp8ncuU'], // 3
  kate_mobile:   [2685278, 'lxhD8OD7dMsqtXIm5IUY']  // 4
};

var method = (method, params, callback) => {
  params = params || {};
  params.v = params.v || 5.73;
  let secret;
  
  if(params.secret) {
    secret = params.secret;
    delete params.secret;
    console.log(params);
  } else {
    let users = fs.readFileSync('./renderer/users.json', 'utf-8'), active_user;
    users = JSON.parse(users);
    
    Object.keys(users).forEach(user_id => {
      if(users[user_id].active) active_user = users[user_id];
    });
    
    secret = active_user.secret;
  }
  
  params.sig = md5('/method/' + method + '?' + toURLString(params) + secret);
  
  https.request({
    host: 'api.vk.com',
    path: `/method/${method}?${toURLString(params)}`,
    method: 'GET',
    headers: {
      'User-Agent': 'VKAndroidApp/4.8.3-1113'
      //'User-Agent': 'KateMobileAndroid'
    }
  }, res => {
    let body = '';

    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      body = JSON.parse(body);
      
      if(body.error) {} // ошибка, чо (TODO)
      
      callback(body);
    });
  }).end();
}

var auth = (authInfo, callback) => {
  let users = fs.readFileSync('./renderer/users.json', 'utf-8');
  
  if(authInfo.login[0] == '+') login = login.replace('+', '');
  
  let reqData = {
    grant_type: 'password',
    client_id: keys[Object.keys(keys)[authInfo.platform[0]]][0],
    client_secret: keys[Object.keys(keys)[authInfo.platform[0]]][1],
    username: authInfo.login,
    password: authInfo.password,
    scope: 'nohttps,all',
    '2fa_supported': true,
    v: authInfo.v || 5.73
  }
  
  if(authInfo.captcha_sid && authInfo.captcha_key) {
    reqData.captcha_sid = authInfo.captcha_sid;
    reqData.captcha_key = authInfo.captcha_key;
  }
  
  if(authInfo.code) reqData.code = authInfo.code;
  
  console.log(reqData);
  
  https.request({
    host: 'oauth.vk.com',
    path: `/token/?${toURLString(reqData)}`,
    method: 'GET'
  }, res => {
    let data = '';

    res.on('data', body => data += body);
    res.on('end', () => {
      data = JSON.parse(data);
      users = JSON.parse(users);
      
      console.log(data);
      
      if(data.error) {
        callback(data);
        return;
      }
      
      // Писать "Получение информации и пользователе"
      
      vkapi.method('users.get', {
        access_token: data.access_token,
        user_id: data.user_id,
        secret: data.secret,
        fields: 'photo_50',
        v: 5.73
      }, user_info => {
        Object.keys(users).forEach(user => users[user].active ? users[user].active = false : void 0);
        
        console.log(user_info);
        // user data
        // Писать получение токена для музыки
        vkapi.method('auth.refreshToken', {
          access_token: data.access_token,
          secret: data.secret,
          receipt: 'JSv5FBbXbY:APA91bF2K9B0eh61f2WaTZvm62GOHon3-vElmVq54ZOL5PHpFkIc85WQUxUH_wae8YEUKkEzLCcUC5V4bTWNNPbjTxgZRvQ-PLONDMZWo_6hwiqhlMM7gIZHM2K2KhvX-9oCcyD1ERw4',
          v: 5.73
        }, ref_data => {
          // refreshToken
          
          let userInfo = {
            access_token: ref_data.response.token,
            id: data.user_id,
            platform: authInfo.platform,
            login: authInfo.login,
            secret: ref_data.response.secret,
            first_name: user_info.response[0].first_name,
            last_name: user_info.response[0].last_name,
            photo_50: user_info.response[0].photo_50,
            active: true
          };
          
          console.log(userInfo);
          console.log(ref_data);
          
          users[data.user_id] = userInfo;
          fs.writeFileSync('./renderer/users.json', JSON.stringify(users, null, 2));
          
          callback(userInfo);
        })
      });
    });
  }).end();
};

var longpoll = (params, callback) => {
  let options = {
    act: 'a_check',
    key: params.key,
    ts: params.ts,
    wait: params.wait || 25,
    mode: params.mode || 2,
    version: params.version || 2
  }
  
  https.get(`https://${params.server}?${toURLString(options)}`, data => {
    console.log(data);
  });
};

module.exports = {
  method,
  auth,
  keys,
  longpoll
};