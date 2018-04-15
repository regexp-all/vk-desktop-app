const https = require('https');

var getFiles = (user, repo, removeList, callback) => {
  let fileList = [];
  
  let sendReq = path => {
    https.get({
      host: 'api.github.com',
      path: `/repos/${user}/${repo}/contents/${path}?client_id=2cca2222a6f211d96eb5&client_secret=7ca0d642c52d3c5c4d793782993da8691152a8f3`,
      headers: { 'User-Agent': 'vk.com/danyadev' }
    }, res => {
      let body = '';
      
      res.on('data', ch => body += ch);
      res.on('end', () => {
        let data = JSON.parse(body), dir = 0;
        
        for(let i = 0; i<Object.keys(data).length; i++) {
          let key = Object.keys(data)[i];
          
          if(data[key].type == 'dir') {
            sendReq(path + '/' + data[key].name);
            dir = 1;
          } else {
            if(!path) fileList.push(data[key].name);
            else fileList.push(path + '/' + data[key].name);
            
            if(!dir && Object.keys(data).length-1 == i) {
              removeList.forEach((file, i) => {
                let index = fileList.indexOf(file);
                if(index != -1) fileList.splice(index, 1);
                if(i == removeList.length-1) callback(fileList);
              });
            }
          }
        }
      });
    });
  }
  
  sendReq('');
}

var update = () => {
  https.get('https://raw.githubusercontent.com/danyadev/vk-desktop-app/master/package.json', res => {
    let body = '';
    
    res.on('data', ch => body += ch);
    res.on('end', () => {
    let v0 = JSON.parse(body).version.split('.'),
        v1 = JSON.parse(fs.readFileSync('./package.json')).version.split('.');
        
    if(v0[0] > v1[0] || v0[1] > v1[1] || v0[2] > v1[2]) {
      getFiles('danyadev', 'vk-desktop-app', ['/renderer/settings.json', '/renderer/users.json'], files => {
        files.forEach(file => {
          https.get({
            host: 'raw.githubusercontent.com',
            path: `/danyadev/vk-desktop-app/master/${file}`
          }, res => {
            let body = Buffer.alloc(0);
        
            res.on('data', ch => body = Buffer.concat([body, ch]));
            res.on('end', () => {
              let data = body.toString();
              
              fs.writeFileSync(file, data);
            });
          });
        });
      });
    } else return;
    });
  });
}

module.exports = update;