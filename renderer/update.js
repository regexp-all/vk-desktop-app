const https = require('https');
const { dialog, app } = require('electron').remote;

var getGithubFiles = (user, repo, removeList, callback) => {
  let fileList = [], allFiles = [];
  
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
              allFiles = allFiles.concat(fileList);
              
              removeList.forEach((file, i) => {
                let index = fileList.indexOf(file);
                if(index != -1) fileList.splice(index, 1);
                if(i == removeList.length-1) callback(fileList, allFiles);
              });
            }
          }
        }
      });
    });
  }
  
  sendReq('');
}

var getLocalFiles = (path, callback) => {
  let allFilesList = [], filesList = [];
  
  let readDir = folderPath => {
    let dir = 0, slash = folderPath ? '' : './';
    
    fs.readdir(slash + folderPath, (e, files) => {
      for(let i = 0; i < files.length; i++) {
        if(files[i] == '.git' || files[i] == 'core') continue;
        
        let file = folderPath ? folderPath + '/' + files[i] : files[i];
        
        if(fs.statSync(slash + file).isDirectory()) {
          readDir(slash + file);
          dir = 1;
        } else {
          if(file.match(/^\.\//)) file = file.replace(/^\./, '');
          
          allFilesList.push(file);
        
          if(!dir && files.length-1 == i) {
            callback(allFilesList);
          }
        }
      }
    });
  }
  
  readDir(path);
}

var update = () => {
  https.get('https://raw.githubusercontent.com/danyadev/vk-desktop-app/master/package.json', res => {
    let body = '';

    res.on('data', ch => body += ch);
    res.on('end', () => {
      let v0 = JSON.parse(body).version.split('.'),
          v1 = JSON.parse(fs.readFileSync('./package.json')).version.split('.');

      if(v0[0] > v1[0] || v0[1] > v1[1] || v0[2] > v1[2]) {
        let noUpdate = ['/renderer/settings.json', '/renderer/users.json'];
        
        getGithubFiles('danyadev', 'vk-desktop-app', noUpdate, (files, allFiles) => {
          files.forEach((file, i) => {
            https.get({
              host: 'raw.githubusercontent.com',
              path: `/danyadev/vk-desktop-app/master/${file}`
            }, res => {
              let body = Buffer.alloc(0);
          
              res.on('data', ch => body = Buffer.concat([body, ch]));
              res.on('end', () => {
                fs.writeFileSync(file, body.toString());
                
                if(i == files.length - 1) {
                  dialog.showMessageBox({
                    type: 'info',
                    buttons: ['ОК', 'Отмена'],
                    title: 'Доступно обновление',
                    message: 'Доступно новое обновление.',
                    detail: 'Для обновления необходимо перезагрузить приложение.\nПродолжить?',
                    noLink: true
                  }, btn => {
                    if(!btn) {
                      app.relaunch();
                      app.exit();
                    }
                  });
                }
              });
            });
          });

          getLocalFiles('', localFiles => {
            let deleteFiles = localFiles.filter(file => !allFiles.includes(file));

            deleteFiles.forEach(file => fs.unlink('.' + file, ()=>{}));
          });
        });
      }
    });
  });
}

module.exports = update;