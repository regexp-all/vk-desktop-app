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
const querystring = require('querystring');
const { getCurrentWindow } = require('electron').remote;
const utils = require('./utils');
const USERS_PATH = utils.USERS_PATH;

var toURL = obj => querystring.unescape(querystring.stringify(obj)),
    toURLEncode = obj => querystring.stringify(obj),
    md5 = data => require('crypto').createHash('md5').update(data).digest("hex"),
    online_methods = [
      'account.setOnline', 'account.setOffline',
      'messages.getDialogs', 'messages.send',
      'messages.sendSticker', 'wall.post'
    ];

// newsfeed.get (без feed_type=top)
// wall.post (без publish_date)

var method = (method, params, callback) => {
  params = params || {};
  callback = callback || (data => console.log(data));
  params.v = params.v || 5.73;
  
  let secret, id, users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
  
  Object.keys(users).forEach(user_id => {
    if(users[user_id].active) id = user_id;
  });
  
  if(!id && !params.secret) {
    getCurrentWindow().reload();
    return;
  }
  
  if(params.secret) {
    secret = params.secret;
    delete params.secret;
  } else if(online_methods.indexOf(method) != -1) {
    secret = users[id].online.secret;
    if(!params.access_token) params.access_token = users[id].online.access_token;
  } else secret = users[id].secret;
  
  if(!params.access_token) params.access_token = users[id].access_token;
  
  params.sig = md5('/method/' + method + '?' + toURL(params) + secret);
  
  console.log(method, params);
  
  https.request({
    host: 'api.vk.com',
    path: `/method/${method}?${toURL(params)}`,
    method: 'GET',
    headers: { 'User-Agent': 'VKAndroidApp/4.13.1-1206' }
  }, res => {
    let body = '';

    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      body = JSON.parse(body);
      
      if(body.error) {
        if(body.error.error_msg == 'User authorization failed: invalid session.') {
          delete users[id];
          if(Object.keys(users).length > 0) users[Object.keys(users)[0]].active = true;
          fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
          getCurrentWindow().reload();
        }
      }
      
      callback(body);
    });
  }).end();
}

var auth = (authInfo, callback) => {
  let users = fs.readFileSync(USERS_PATH, 'utf-8');
  
  if(authInfo.login[0] == '+') authInfo.login = authInfo.login.replace('+', '');
  
  let reqData = {
    grant_type: 'password',
    client_id: 2274003, // Android ключики
    client_secret: 'hHbZxrka2uZ6jB1inYsH',
    username: authInfo.login,
    password: authInfo.password,
    scope: 'nohttps,all',
    '2fa_supported': true,
    force_sms: true,
    v: authInfo.v || 5.73
  }
  
  if(authInfo.captcha_sid && authInfo.captcha_key) {
    reqData.captcha_sid = authInfo.captcha_sid;
    reqData.captcha_key = authInfo.captcha_key;
  }
  
  if(authInfo.code) reqData.code = authInfo.code;
  
  console.log(reqData);
  
  https.get({
    host: 'oauth.vk.com',
    path: `/token/?${toURLEncode(reqData)}`
  }, res => {
    let data = '';

    res.on('data', body => data += body);
    res.on('end', () => {
      data = JSON.parse(data);
      users = JSON.parse(users);
      
      console.log(authInfo);
      console.log(data);
      
      if(data.error) {
        callback(data);
        return;
      }
      
      vkapi.method('users.get', {
        access_token: data.access_token,
        user_id: data.user_id,
        secret: data.secret,
        fields: 'photo_100',
        v: 5.73
      }, user_info => {
        refreshToken({
          access_token: data.access_token,
          secret: data.secret
        }, ref_data => {
          let userInfo = {
            active: true,
            id: data.user_id,
            platform: authInfo.platform,
            login: authInfo.login,
            password: authInfo.password,
            downloadPath: process.env.USERPROFILE + '\\Downloads',
            first_name: user_info.response[0].first_name,
            last_name: user_info.response[0].last_name,
            photo_100: user_info.response[0].photo_100,
            online: {
              access_token: data.access_token,
              secret:  data.secret
            },
            access_token: ref_data.access_token,
            secret: ref_data.secret
          };
          
          console.log(ref_data);
          console.log(userInfo);
          
          users[data.user_id] = userInfo;
          
          fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
          callback(users);
        });
      });
    });
  });
};

var refreshToken = (data, callback) => {
  vkapi.method('auth.refreshToken', {
    access_token: data.access_token,
    secret: data.secret,
    receipt: 'JSv5FBbXbY:APA91bF2K9B0eh61f2WaTZvm62GOHon3-vElmVq54ZOL5PHpFkIc85WQUxUH_wae8YEUKkEzLCcUC5V4bTWNNPbjTxgZRvQ-PLONDMZWo_6hwiqhlMM7gIZHM2K2KhvX-9oCcyD1ERw4',
    v: 5.73
  }, ref => callback({ access_token: ref.response.token, secret: ref.response.secret }))
};

var resetOnline = (authInfo, callback) => {
  let users = fs.readFileSync(USERS_PATH, 'utf-8');
  
  if(authInfo.login[0] == '+') authInfo.login = authInfo.login.replace('+', '');
  
  let reqData = {
    grant_type: 'password',
    client_id: keys[authInfo.platform[0]][0],
    client_secret: keys[authInfo.platform[0]][1],
    username: authInfo.login,
    password: authInfo.password,
    scope: 'nohttps,all',
    '2fa_supported': true,
    force_sms: true,
    v: authInfo.v || 5.73
  }
  
  if(authInfo.captcha_sid && authInfo.captcha_key) {
    reqData.captcha_sid = authInfo.captcha_sid;
    reqData.captcha_key = authInfo.captcha_key;
  }
  
  if(authInfo.code) reqData.code = authInfo.code;
  
  https.get({
    host: 'oauth.vk.com',
    path: `/token/?${toURLogin(reqData)}`
  }, res => {
    let data = '';

    res.on('data', body => data += body);
    res.on('end', () => {
      data = JSON.parse(data);
      users = JSON.parse(users);
      
      console.log(authInfo);
      console.log(data);
      
      if(data.error) {
        callback(data);
        return;
      }
        
      let online = {
        access_token: data.access_token,
        secret:  data.secret
      };
      
      // вставляем онлайн в текущий онлайн
    });
  });
}

var longpoll = (params, callback) => {
  let options = {
    act: 'a_check',
    key: params.key,
    ts: params.ts,
    wait: params.wait || 25,
    mode: params.mode || 2,
    version: params.version || 2
  }
  
  https.get(`https://${params.server}?${toURL(options)}`, data => {
    console.log(data);
  });
};

module.exports = {
  method,
  auth,
  resetOnline
};