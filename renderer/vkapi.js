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
const toURLString = require('querystring').stringify;
const fs = require('fs');

var method = (method, params, callback) => {
  if(typeof params == 'function') { // если перепутали callback и params или не написали params
    tmParams = params;
    params = typeof callback == 'object' ? callback : {};
    callback = tmParams;
  }
  
  params = params || {};
  params.v = params.v || 5.73; // последняя версия API
  
  https.get({
    host: 'api.vk.com',
    path: `/method/${method}?${toURLString(params)}`
  }, res => {
    let body = '';

    res.on('data', chunk => body += chunk);
    res.on('end', () => callback(JSON.parse(body)));
  });
}

var login = (login, password, callback) => {
  if(!login || !password || !callback) throw new Error('Логин, пароль или возвратная функция не была передана.');
  if(login[0] == '+') login = login.replace('+', '');
  
  let opts = fs.readFileSync('./renderer/opts.json', 'utf-8'), userLogged = false, userID = null;
  
  if(opts != '' && opts != '{}') {
    let parsed_opts = JSON.parse(opts), keys = Object.keys(parsed_opts);

    keys.forEach(key => {
      if(parsed_opts[key].email == login || parsed_opts[key].phone == login) {
        userLogged = true;
        userID = key;
        return;
      }
    });
  }
  
  if(userLogged) {
    let parsed_opts = JSON.parse(opts);
    
    callback({
      access_token: parsed_opts[userID].access_token,
      user_id: parsed_opts[userID].user_id,
      email: parsed_opts[userID].email
    });
    
    return;
  }
  
  let reqData = {
    client_id: '3140623',
    client_secret: 'VeWdmVclDCtn6ihuP1nt',
    grant_type: 'password',
    username: login,
    password: password,
    scope: 'notify,friends,photos,audio,video,stories,pages,status,notes,messages,wall,ads,offline,docs,groups,notifications,stats,email,market',
    v: 5.73
  }
  
  https.get({
    host: 'oauth.vk.com',
    path: `/token/?${toURLString(reqData)}`
  }, res => {
    let data = '';

    res.on('data', body => data += body);
    res.on('end', () => {
      data = JSON.parse(data);
      console.log(data)
      opts = JSON.parse(opts);
      
      opts[data.user_id] = {
        access_token: data.access_token,
        user_id: data.user_id,
        email: data.email,
        phone: isNaN(login) ? undefined : login
      }
      
      fs.writeFileSync('./renderer/opts.json', JSON.stringify(opts, null, 2));
      callback({
        access_token: data.access_token,
        user_id: data.user_id,
        email: data.email
      });
    });
  });
};

module.exports = {
  method,
  login
};