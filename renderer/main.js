'use strict';

const https = require('https');

var param = a => {
  let s = [],
      add = (k, v) => s[s.length] = `${encodeURIComponent(k)}=${encodeURIComponent(v)}`,
  buildParams = (p, o) => {
    let k;
    if(p) add(p, o);
    else for(k in o) { buildParams(k, o[k]) }
    return s;
  };
  
  return buildParams('', a).join('&');
}

var getPath = (method, params) => {
  params = params || {};
  params.v = params.v || 5.73;
  
  return `/method/${method}?${param(params)}`;
}

var sendRequest = (method, params, callback) => {
  https.get({
    host: 'api.vk.com',
    path: getPath(method, params)
  }, res => {
    let body = '';

    res.on('data', chunk => body += chunk);
    res.on('end', () => callback(JSON.parse(body)));
  });
}

// Пример:
// sendRequest('users.get', {fields: 'photo_100, photo_200'}, (data) => {
// Ваши действия с полученными данными.
// });