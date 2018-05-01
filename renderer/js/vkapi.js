/* 
  Copyright © 2018 danyadev

  Контактные данные:
   vk: https://vk.com/danyadev
   telegram: https://t.me/danyadev
   альтернативная ссылка: https://t.elegram.ru/danyadev
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

/*
  function post(message) {
    vkapi.method('wall.post', {
      from_group: 1,
      signed: 1,
      message: message,
      owner_id: 88262293,
      publish_date: parseInt(new Date().getTime()/1000) + 60
    });
  }
*/

const https = require('https');
const fs = require('fs');
const querystring = require('querystring');
const { getCurrentWindow } = require('electron').remote;
const utils = require('./utils');
const USERS_PATH = utils.USERS_PATH;
const request = utils.request;
const API_VERSION = 5.74;
const captcha = require('./captcha');

var toURL = obj => querystring.stringify(obj),
    online_methods = [
      'account.setOnline', 'account.setOffline',
      'messages.getDialogs', 'messages.send',
      'messages.sendSticker', 'wall.post',
      'newsfeed.get'
    ]; // wall.post (без publish_date)

var method = (method, params, callback, target) => {
  params   = params   || {};
  callback = callback || (() => {});
  params.v = params.v || API_VERSION;
  
  let id, users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
  
  Object.keys(users).forEach(user_id => {
    if(users[user_id].active) id = user_id;
  });
  
  params.access_token = params.access_token || users[id].access_token;
  
  console.log(method, params);
  
  request({
    host: 'api.vk.com',
    path: `/method/${method}?${toURL(params)}`,
    method: 'GET',
    headers: { 'User-Agent': 'VKAndroidApp/4.13.1-1206' }
  }, res => {
    let body = Buffer.alloc(0);

    res.on('data', ch => body = Buffer.concat([body, ch]));
    res.on('end', () => {
      body = JSON.parse(body);
      console.log(body);
      
      if(body.error) {
        if(body.error.error_msg == 'User authorization failed: invalid session.') {
          // можно будет выводить окошечко с формой входа, где будет логин и пароль уже введен
          delete users[id];
          
          if(Object.keys(users).length > 0) users[Object.keys(users)[0]].active = true;
          fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
          getCurrentWindow().reload();
        }
        
        // captcha(body.captcha_img, body.captcha_sid, (key, sid) => {});
      }
      
      callback(body);
    });
  }, target);
}

var auth = (authInfo, callback, target) => {
  let users = fs.readFileSync(USERS_PATH, 'utf-8');
  
  authInfo.login = authInfo.login.replace('+', '');
  
  let reqData = {
    grant_type: 'password',
    client_id: 2274003, // Android ключики
    client_secret: 'hHbZxrka2uZ6jB1inYsH',
    username: authInfo.login,
    password: authInfo.password,
    scope: 'all',
    '2fa_supported': true,
    force_sms: true,
    v: API_VERSION
  }
  
  if(authInfo.captcha_sid && authInfo.captcha_key) {
    reqData.captcha_sid = authInfo.captcha_sid;
    reqData.captcha_key = authInfo.captcha_key;
  }
  
  if(authInfo.code) reqData.code = authInfo.code;
  
  console.log(reqData);
  
  request({
    host: 'oauth.vk.com',
    path: `/token/?${toURL(reqData)}`
  }, res => {
    let body = Buffer.alloc(0);

    res.on('data', ch => body = Buffer.concat([body, ch]));
    res.on('end', () => {
      body = JSON.parse(body);
      users = JSON.parse(users);
      
      console.log(authInfo);
      console.log(body);
      
      if(body.error) {
        if(body.error == 'need_captcha') {
          qs('.login_button').disabled = false;
          
          captcha(body.captcha_img, body.captcha_sid, (key, sid) => {
            auth(Object.assign(authInfo, { captcha_key: key, captcha_sid: sid }),
                 callback,
                 target);
          });
        } else callback(body);
        
        return;
      }
      
      method('users.get', {
        access_token: body.access_token,
        user_id: body.user_id,
        fields: 'status,photo_100'
      }, user_info => {
        refreshToken({
          access_token: body.access_token
        }, ref_token => {
          users[body.user_id] = {
            active: true,
            id: body.user_id,
            platform: authInfo.platform,
            login: authInfo.login,
            password: authInfo.password,
            downloadPath: process.env.USERPROFILE + '\\Downloads\\',
            first_name: user_info.response[0].first_name,
            last_name: user_info.response[0].last_name,
            photo_100: user_info.response[0].photo_100,
            status: user_info.response[0].status,
            online_token: body.access_token,
            access_token: ref_token
          };
          
          console.log(users[body.user_id]);
          
          fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2), () => callback(users));
        });
      });
    });
  }, target);
};

var refreshToken = (data, callback) => {
  method('auth.refreshToken', {
    access_token: data.access_token,
    receipt: 'JSv5FBbXbY:APA91bF2K9B0eh61f2WaTZvm62GOHon3-vElmVq54ZOL5PHpFkIc85WQUxUH_wae8YEUKkEzLCcUC5V4bTWNNPbjTxgZRvQ-PLONDMZWo_6hwiqhlMM7gIZHM2K2KhvX-9oCcyD1ERw4'
  }, ref => callback(ref.response.token));
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
    scope: 'all',
    '2fa_supported': true,
    force_sms: true,
    v: API_VERSION
  }
  
  if(authInfo.captcha_sid && authInfo.captcha_key) {
    reqData.captcha_sid = authInfo.captcha_sid;
    reqData.captcha_key = authInfo.captcha_key;
  }
  
  if(authInfo.code) reqData.code = authInfo.code;
  
  request({
    host: 'oauth.vk.com',
    path: `/token/?${toURLogin(reqData)}`
  }, res => {
    let body = Buffer.alloc(0);

    res.on('data', ch => body = Buffer.concat([body, ch]));
    res.on('end', () => {
      body = JSON.parse(body);
      users = JSON.parse(users);
      
      console.log(authInfo);
      console.log(body);
      
      if(body.error) {
        callback(body);
        return;
      }
        
      let online = {
        access_token: body.access_token
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
  
  request(`https://${params.server}?${toURL(options)}`, data => {
    console.log(data);
  });
};

module.exports = {
  method,
  auth,
  resetOnline
};