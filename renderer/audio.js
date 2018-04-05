const { BrowserWindow, dialog } = require('electron').remote;
const fs = require('fs');
const https = require('https');

var audiolist = document.querySelector('.audiolist'),
    audioplayer = document.querySelector('.audioplayer'),
    content = document.querySelector('.content'),
    player_cover = document.querySelector('.player_cover'),
    player_cover_img = document.querySelector('.player_cover_img'),
    player_btn = document.querySelector('.player_btn'),
    player_back = document.querySelectorAll('.player_button')[0],
    player_next = document.querySelectorAll('.player_button')[1],
    player_author = document.querySelector('.player_author'),
    player_name = document.querySelector('.player_name'),
    audio = document.querySelector('.audio');

window.pageLoaded = 0, window.this_track_id = null;

var load = (user, offset) => {
  window.danyadev.user = user;
  
  vkapi.method('audio.get', {
    offset: offset || 0,
    count: 15
  }, data => {
    data = data.response;
  
    data.items.forEach(item => {
      let cover, time = Math.floor(item.duration/60) + ':', downloadClass;
      
      if(item.album && item.album.thumb) cover = item.album.thumb.photo_68;
      else cover = 'https://vk.com/images/audio_row_placeholder.png';
      
      if((item.duration%60)<10) time += '0' + item.duration%60;
      else time += item.duration%60;
      
      if(fs.existsSync(window.danyadev.user.downloadPath + '\\' + item.artist + ' – ' + item.title + '.mp3'))
        downloadClass = 'audio_downloaded'
      else downloadClass = 'audio_download'
      
      audiolist.innerHTML += `
        <div class='audio_item' src='${item.url}' onclick='audio.toggleAudio(this, event)'>
          <div class='audio_cover' style='background-image: url("${cover}")'></div>
          <div class='audio_cover_play'></div>
          <div class='audio_names'>
            <div class='audio_name'>${item.title}</div>
            <div class='audio_author'>${item.artist}</div>
          </div>
          <div class='audio_real_time' onclick='audio.toggleTime(this, event, "real")'>${time}</div>
          <div class='audio_played_time' onclick='audio.toggleTime(this, event, "played")'></div>
          <div class='${downloadClass}' artist="${item.artist}" name="${item.title}" url="${item.url}" title='Скачать аудиозапись' 
          onclick='audio.downloadAudio(this.attributes.artist.value, this.attributes.name.value, this.attributes.url.value, this)'
          ></div>
        </div>
      `.trim();
    });
    
    getMoreSound(user, offset, data);
  });
}

var downloadAudio = (author, name, url, block) => {
  if(block.classList.contains('audio_downloaded')) return;
  setTimeout(() => {
        file_name = author + ' – ' + name + '.mp3',
        file = fs.createWriteStream(window.danyadev.user.downloadPath + '\\' + file_name);

    https.get(url, res => {
      res.on('data', data => file.write(data));
      res.on('end', () => {
        file.end();
        block.classList.add('audio_downloaded');
        block.classList.remove('audio_download');
      });
    });
  }, 0);
}

var getMoreSound = (user, offset, data) => {
  let forListen = () => {
    if(audiolist.clientHeight && audiolist.clientHeight - window.outerHeight < content.scrollTop) {
      content.removeEventListener('scroll', forListen);
      if(offset) {
        if(offset < data.count) {
          offset += 15;
          load(user, offset);
        }
      } else load(user, 15);
    }
  }
  
  content.addEventListener('scroll', forListen);
  
  if(!audio.audio_item) {
    audio.audio_item = audiolist.children[0]; // первая песня в плейлисте
    if(audio.audio_item.children[0].style.backgroundImage != 'url("https://vk.com/images/audio_row_placeholder.png")')
      player_cover_img.style.backgroundImage = audio.audio_item.children[0].style.backgroundImage;
    else player_cover_img.style.backgroundImage = '';
    
    player_name.innerHTML = '<span class=\'player_author\'>'
                          + audio.audio_item.children[2].children[1].innerHTML
                          + '</span> – '
                          + audio.audio_item.children[2].children[0].innerHTML;
  }
  
  if(!window.pageLoaded && audiolist.clientHeight - window.outerHeight < window.scrollY) {
    forListen();
    if(audiolist.clientHeight - window.outerHeight > window.scrollY) window.pageLoaded = 1;
  } else if(!window.pageLoaded) window.pageLoaded = 1;
}

var matchPlayedTime = () => {
  if(audio.paused) return;
  
  let time = audio.currentTime,
      zero = time%60 < 10 ? '0' : '',
      audio_real_time = audio.audio_item.children[3],
      audio_played_time = audio.audio_item.children[4];
      
  if(!audio_real_time.showreal) audio_real_time.style.display = 'none';
  if(!audio_real_time.classList.hidden) audio_real_time.classList.add('hidden_time');
  if(!audio_played_time.classList.showed) audio_played_time.classList.add('showed_time');
  audio_played_time.innerHTML = Math.floor(time/60) + ':' + zero + Math.floor(time%60);
  
  setTimeout(matchPlayedTime, 250);
}

var toggleAudio = (track, event) => {
  console.log(track);
  if(!track) return;
  if(event && event.target != track.children[1]) return;
  console.log(event);
  
  audio.audio_item = track;
  window.this_track_id = [].slice.call(audiolist.children).indexOf(track);
  
  let audio_item_active = document.querySelector('.audio_item_active'),
      audio_cover_stop = document.querySelector('.audio_cover_stop');
  
  if(audio_cover_stop) {
    audio_cover_stop.classList.add('audio_cover_play');
    audio_cover_stop.classList.remove('audio_cover_stop');
  }
    
  let audio_item = track, cover_util = track.children[1];
    
  if(audio.src != track.attributes.src.value) { // если другой трек
    audio.src = track.attributes.src.value;
    if(document.querySelector('.audio_cover_has_play'))
      document.querySelector('.audio_cover_has_play').classList.remove('audio_cover_has_play');
      
    cover_util.classList.add('audio_cover_has_play');
    
    if(audio_item_active) audio_item_active.classList.remove('audio_item_active');
    
    if(document.querySelector('.hidden_time')) {
      document.querySelector('.hidden_time').style.display = '';
      document.querySelector('.hidden_time').classList.remove('hidden_time');
      
      document.querySelector('.showed_time').innerHTML = '';
      document.querySelector('.showed_time').classList.remove('showed_time');
    }
    
    if(track.children[0].style.backgroundImage != 'url("https://vk.com/images/audio_row_placeholder.png")')
      player_cover_img.style.backgroundImage = track.children[0].style.backgroundImage;
    else player_cover_img.style.backgroundImage = '';
    
    player_name.innerHTML = '<span class=\'player_author\'>'
                          + audio.audio_item.children[2].children[1].innerHTML
                          + '</span> – '
                          + audio.audio_item.children[2].children[0].innerHTML;
  }
  
  if(audio.paused) {
    cover_util.classList.add('audio_cover_stop');
    cover_util.classList.remove('audio_cover_play');
    audio_item.classList.add('audio_item_active');
    if(document.querySelector('.player_play')) {
      document.querySelector('.player_play').classList.add('player_pause');
      document.querySelector('.player_play').classList.remove('player_play');
    }
    
    audio.play();
    matchPlayedTime();
  } else {
    cover_util.classList.add('audio_cover_play');
    cover_util.classList.remove('audio_cover_stop');
    document.querySelector('.player_pause').classList.add('player_play');
    document.querySelector('.player_pause').classList.remove('player_pause');
    
    audio.pause();
  }
}

player_back.addEventListener('click', () => {
  let children = [].slice.call(audiolist.children),
      audioId = children.indexOf(audio.audio_item) - 1;
  
  if(!audiolist.children[audioId]) audioId = children.length - 1;
  
  toggleAudio(audiolist.children[audioId]);
});

player_next.addEventListener('click', () => {
  let audioId = [].slice.call(audiolist.children).indexOf(audio.audio_item) + 1;
  
  if([].slice.call(audiolist.children).length == audioId) audioId = 0;
  
  toggleAudio(audiolist.children[audioId]);
});

player_btn.addEventListener('click', () => {
  let audioId = [].slice.call(audiolist.children).indexOf(audio.audio_item);
  
  if(audioId == -1) audioId = 0;
  
  toggleAudio(audiolist.children[audioId]);
});

var toggleTime = (elem, event, type) => {
  let item = event.path[1],
      real = item.children[3],
      played = item.children[4];
      
  if(type == 'real' && played.innerHTML != '') {
    real.style.display = 'none';
    real.showreal = 0;
    played.style.display = 'block';
  } else {
    real.showreal = 1;
    real.style.display = 'block';
    played.style.display = 'none';
  }
}

audio.addEventListener('ended', () => { // переключение на следующее аудио
  audio.audio_item.children[1].classList.add('audio_cover_play');
  audio.audio_item.children[1].classList.remove('audio_cover_stop');
  audio.audio_item.classList.remove('audio_item_active');
  
  let track = audiolist.children[window.this_track_id+1];
  if(!track) track = audiolist.children[0];
  
  setTimeout(() => toggleAudio(track), 400);
});

content.addEventListener('scroll', () => {
  if(content.scrollTop >= 56) { // 100 - 44, где 44 - высота шапки
    audioplayer.style.position = 'fixed';
    audioplayer.style.marginTop = '44px';
    document.querySelector('.pl50').style.display = 'block';
  } else {
    audioplayer.style.position = '';
    audioplayer.style.marginTop = '';
    document.querySelector('.pl50').style.display = 'none';
  }
});

// audio.addEventListener("progress", () => {
//     var buffered = Math.floor(audio.buffered.end(0)) / Math.floor(audio.duration);
//     что увеличиваем.style.width =  Math.floor(buffered * полная ширина) + "px";
// });

module.exports = {
  load,
  toggleAudio,
  toggleTime,
  downloadAudio
}