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
   email: nemov.danil@mail.ru
   github: https://github.com/danyadev/vk-desktop-app
*/

'use strict';

const { BrowserWindow } = require('electron').remote;
const fs = require('fs');
const https = require('https');
const SETTINGS_PATH = require('./utils').SETTINGS_PATH;

danyadev.audio = {};

var audio = document.querySelector('.audio'),
    audiolist_load = document.querySelector('.audiolist_load'),
    audiolist_utils = document.querySelector('.audiolist_utils'),
    audiolist = document.querySelector('.audiolist'),
    audioplayer = document.querySelector('.audioplayer'),
    content = document.querySelector('.content'),
    player_cover = document.querySelector('.player_cover'),
    player_btn = document.querySelector('.player_btn'),
    player_back = document.querySelectorAll('.player_button')[0],
    player_next = document.querySelectorAll('.player_button')[1],
    player_name = document.querySelector('.player_name'),
    player_real_time = document.querySelector('.player_real_time'),
    player_played_time = document.querySelector('.player_played_time'),
    player_progress_loaded = document.querySelector('.player_progress_loaded'),
    player_progress_played = document.querySelector('.player_progress_played'),
    player_progress_wrap = document.querySelector('.player_progress_wrap'),
    player_volume_wrap = document.querySelector('.player_volume_wrap'),
    player_volume_this = document.querySelector('.player_volume_this'),
    shuffle = document.querySelector('.shuffle'),
    settings_json = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
    
player_volume_this.style.width = settings_json.audio.volume * 100 + '%';
audio.volume = settings_json.audio.volume;

danyadev.audio.renderedItems = 0, danyadev.audio.track_id = 0;

var load = () => {
  vkapi.method('audio.get', null, data => {
    danyadev.audio.count = data.response.count;
    danyadev.audio.list = data.response.items;
    
    if(!danyadev.audio.list.length) {
      let audiolist_load = document.querySelector('.audiolist_load');
      audiolist_load.innerHTML = 'Список аудиозаписей пуст';
    } else render();
  });
}

var render = () => {
  let block = { innerHTML: '' }, id = danyadev.audio.renderedItems, endID = danyadev.audio.renderedItems + 15;
  
  let renderItem = () => {
    let item = danyadev.audio.list[id],
        minutes = Math.floor(item.duration / 60), cover,
        hours = minutes >= 60 ? Math.floor(minutes / 60) + ':' : '',
        secondsZero = (item.duration % 60) < 10 ? '0' : '',
        seconds = ':' + secondsZero + item.duration % 60;
  
    if(hours != '') {
      let minutesZero = (minutes - parseInt(hours) * 60) < 10 ? '0' : '';
      minutes = minutesZero + (minutes - parseInt(hours) * 60);
    }
  
    let time = hours + minutes + seconds;
    
    if(item.album && item.album.thumb) cover = item.album.thumb.photo_68;
    else cover = 'https://vk.com/images/audio_row_placeholder.png';
    
    // innerHTML тут для подсветки HTML в Atom'е
    block.innerHTML += `
      <div class='audio_item' src='${item.url}' onclick='audio.toggleAudio(this, event)'>
        <div class='audio_covers'>
          <div class='audio_cover' style='background-image: url("${cover}")'></div>
          <div class='audio_cover_play'></div>
        </div>
        <div class='audio_names'>
          <div class='audio_name'>${item.title}</div>
          <div class='audio_author'>${item.artist}</div>
        </div>
        <div class='audio_right_btns'>
          <div></div> <!-- тут будут все кнопки вместо 1 скачки, при наведении -->
          <div class='audio_real_time audio_active_time'>${time}</div>
          <div class='audio_played_time'>0:00</div>
        </div>
      </div>
    `.trim();
    
    id++;
    danyadev.audio.renderedItems++;
    if(id < endID && danyadev.audio.list[id]) setTimeout(renderItem, 0);
    else {
      if(id == 15) { // когда загрузился первый блок
        audiolist_load.style.display = 'none';
        audiolist_utils.style.display = 'block';
      }
      
      audiolist.innerHTML += block.innerHTML;
      
      if((danyadev.audio.count <= 15 && danyadev.audio.renderedItems == danyadev.audio.count)
      || danyadev.audio.renderedItems <= 15) initPlayer();
      
      if(danyadev.audio.renderedItems < danyadev.audio.count) loadSoundBlock();
    }
  }
  
  renderItem();
}

shuffle.addEventListener('click', () => {
  danyadev.audio.track_id = 0;
  danyadev.audio.renderedItems = 0;
  
  if(!audio.paused) {
    toggleAudio();
    
    document.querySelector('.player_pause').classList.add('player_play');
    document.querySelector('.player_pause').classList.remove('player_pause');
  }
  audio.audio_item = undefined;
  audio.src = '';
  
  audiolist.innerHTML = '';
  
  player_progress_loaded.style.width = '';
  player_progress_played.style.width = '';
  
  content.removeEventListener('scroll', renderNewItems);
  arrayShuffle(danyadev.audio.list);
  render();
});

var initPlayer = () => {
  audio.audio_item = audiolist.children[0];
  audio.audio_item.children[0].children[1].classList.add('audio_cover_has_play');
  audio.audio_item.classList.add('audio_item_active');
  
  audio.src = audio.audio_item.attributes.src.value;
  toggleTime('played');
  
  player_real_time.innerHTML = audio.audio_item.children[2].children[1].innerHTML;
  
  if(audio.audio_item.children[0].children[0].style.backgroundImage != 'url("https://vk.com/images/audio_row_placeholder.png")') {
    player_cover.style.backgroundImage = audio.audio_item.children[0].children[0].style.backgroundImage;
  } else player_cover.style.backgroundImage = 'url("images/empty_cover.svg")';
  
  player_name.innerHTML = '<span class=\'player_author\'>'
                        + audio.audio_item.children[1].children[1].innerHTML
                        + '</span> – '
                        + audio.audio_item.children[1].children[0].innerHTML;
}

var renderNewItems = () => {
  if(audiolist.clientHeight && audiolist.clientHeight - window.outerHeight - 50 < content.scrollTop) {
    content.removeEventListener('scroll', renderNewItems);
    render();
  }
}

var loadSoundBlock = () => {
  content.addEventListener('scroll', renderNewItems);
  
  if(audiolist.clientHeight - window.outerHeight < window.scrollY) renderNewItems();
}

var toggleAudio = (track, event) => {
  if(!track || (event && event.target != track.children[0].children[1])) return;
  if(audio.src != track.attributes.src.value) toggleTime('real');
  
  audio.audio_item = track;
  player_real_time.innerHTML = track.children[2].children[1].innerHTML;
  danyadev.audio.track_id = [].slice.call(audiolist.children).indexOf(track);
  
  let audio_item_active = document.querySelector('.audio_item_active'),
      audio_cover_stop = document.querySelector('.audio_cover_stop');
  
  if(audio_cover_stop) {
    audio_cover_stop.classList.add('audio_cover_play');
    audio_cover_stop.classList.remove('audio_cover_stop');
  }
    
  let audio_item = track, cover_util = track.children[0].children[1];
    
  if(audio.src != track.attributes.src.value) { // если другой трек
    player_progress_loaded.style.width = '';
    player_progress_played.style.width = '';
    
    audio.src = track.attributes.src.value;
    toggleTime('played');
    
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
    
    if(track.children[0].children[0].style.backgroundImage != 'url("https://vk.com/images/audio_row_placeholder.png")')
      player_cover.style.backgroundImage = track.children[0].children[0].style.backgroundImage;
    else player_cover.style.backgroundImage = 'url("images/empty_cover.svg")';
    
    player_name.innerHTML = '<span class=\'player_author\'>'
                          + audio.audio_item.children[1].children[1].innerHTML
                          + '</span> – '
                          + audio.audio_item.children[1].children[0].innerHTML;
  }
  
  if(audio.paused) {
    cover_util.classList.add('audio_cover_stop');
    cover_util.classList.remove('audio_cover_play');
    audio_item.classList.add('audio_item_active');
    
    if(document.querySelector('.player_play')) {
      player_btn.title = 'Приостановить';
      document.querySelector('.player_play').classList.add('player_pause');
      document.querySelector('.player_play').classList.remove('player_play');
    }
    
    audio.play();
  } else {
    cover_util.classList.add('audio_cover_play');
    cover_util.classList.remove('audio_cover_stop');
    player_btn.title = 'Воспроизвести';
    document.querySelector('.player_pause').classList.add('player_play');
    document.querySelector('.player_pause').classList.remove('player_pause');
    
    audio.pause();
  }
}

var matchPlayedTime = () => {
  if(!audiolist.children[danyadev.audio.track_id]) return;
  
  let minutes = Math.floor(audio.currentTime / 60),
      hours = minutes >= 60 ? Math.floor(minutes / 60) + ':' : '',
      secondsZero = (audio.currentTime % 60) < 10 ? '0' : '',
      seconds = ':' + secondsZero + Math.floor(audio.currentTime) % 60,
      audio_played_time = audiolist.children[danyadev.audio.track_id].children[2].children[2];

  if(hours != '') {
    let minutesZero = (minutes - parseInt(hours) * 60) < 10 ? '0' : '';
    minutes = minutesZero + (minutes - parseInt(hours) * 60);
  }
  
  audio_played_time.innerHTML = player_played_time.innerHTML = hours + minutes + seconds;
}

var toggleTime = type => {
  let audio_real_time = audiolist.children[danyadev.audio.track_id].children[2].children[1],
      audio_played_time = audiolist.children[danyadev.audio.track_id].children[2].children[2];
  
  if(type == 'played') { // переключаем на played
    player_real_time.classList.remove('player_active_time');
    audio_real_time.classList.remove('audio_active_time');
    
    player_played_time.classList.add('player_active_time');
    audio_played_time.classList.add('audio_active_time');
  } else { // переключаем на real
    player_real_time.classList.add('player_active_time');
    audio_real_time.classList.add('audio_active_time');
    
    player_played_time.classList.remove('player_active_time');
    audio_played_time.classList.remove('audio_active_time');
  }
}

player_real_time.addEventListener('click', () => toggleTime('played'));
player_played_time.addEventListener('click', () => toggleTime('real'));

player_back.addEventListener('click', () => {
  let audioItem = audiolist.children[danyadev.audio.track_id - 1];
  
  if(!audioItem && !audio.paused) toggleAudio(audiolist.children[0]);
  else if(!audioItem) return;
  else toggleAudio(audioItem);
});

player_next.addEventListener('click', () => {
  let audioTrack = audiolist.children[danyadev.audio.track_id + 1];
  
  if(!audioTrack) audioTrack = audiolist.children[0];
  
  toggleAudio(audioTrack);
});

player_btn.addEventListener('click', () => {
  let audioItem = audiolist.children[danyadev.audio.track_id];
  
  if(!audioItem) audioItem = audiolist.children[0];
  
  toggleAudio(audioItem);
});

audio.addEventListener('ended', () => { // переключение на следующее аудио
  audio.audio_item.children[0].children[1].classList.add('audio_cover_play');
  audio.audio_item.children[0].children[1].classList.remove('audio_cover_stop');
  audio.audio_item.classList.remove('audio_item_active');
  
  let audioItem = audiolist.children[danyadev.audio.track_id + 1];
  if(!audioItem) audioItem = audiolist.children[0];
  
  setTimeout(() => toggleAudio(audioItem), 400);
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

audio.addEventListener('progress', () => { // сколько прогружено
  if(audio.buffered.length > 0) {
    player_progress_loaded.style.width = audio.buffered.end(0) / audio.duration * 100 + '%';
  }
});

audio.addEventListener('timeupdate', () => { // сколько проиграно
  matchPlayedTime();
  
  if(!danyadev.audio.seekstate)
    player_progress_played.style.width = (audio.currentTime / audio.duration) * 100 + '%';
});

// прокрутка трека
player_progress_wrap.addEventListener('mousedown', () => {
  if(!audio.duration) return; // нет времени -> нет трека -> выходим отсюда
  danyadev.audio.seekstate = 1;
  player_progress_wrap.classList.add('player_progress_active');
  
  let mousemove = e => {
    let fixedOffset = (audioplayer.style.position == 'fixed') ? audioplayer.offsetLeft : 0,
        offsetx = e.pageX - player_progress_wrap.offsetLeft - fixedOffset,
        curTime = offsetx / player_progress_wrap.offsetWidth, selWidth = curTime * 100;
        
    if(selWidth > 100) selWidth = 100;
    if(selWidth < 0) selWidth = 0;
    player_progress_played.style.width = selWidth + '%';
  }
  
  let mouseup = e => {
    danyadev.audio.seekstate = 0;
    player_progress_wrap.classList.remove('player_progress_active');
    
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
    
    let fixedOffset = (audioplayer.style.position == 'fixed') ? audioplayer.offsetLeft : 0,
        offsetx = e.pageX - player_progress_wrap.offsetLeft - fixedOffset;
    
    audio.currentTime = (offsetx * audio.duration) / player_progress_wrap.offsetWidth;
  }
  
  document.addEventListener('mousemove', mousemove);
  document.addEventListener('mouseup', mouseup);
});

// громкость
player_volume_wrap.addEventListener('mousedown', ev => {
  player_volume_wrap.classList.add('player_volume_active');
  
  let fixedOffset = (audioplayer.style.position == 'fixed') ? audioplayer.offsetLeft : 0,
      offsetx = ev.pageX - player_volume_wrap.offsetLeft - fixedOffset,
      volume = offsetx / player_volume_wrap.offsetWidth;
  
  volume < 0 ? volume = 0 : '';
  volume > 1 ? volume = 1 : '';
  
  let selWidth = volume * 100;
  
  audio.volume = volume;
  player_volume_this.style.width = selWidth + '%';
  
  let mousemove = e => {
    fixedOffset = (audioplayer.style.position == 'fixed') ? audioplayer.offsetLeft : 0;
    offsetx = e.pageX - player_volume_wrap.offsetLeft - fixedOffset;
    volume = offsetx / player_volume_wrap.offsetWidth;
    
    volume < 0 ? volume = 0 : '';
    volume > 1 ? volume = 1 : '';
    
    selWidth = volume * 100;
    
    audio.volume = volume;
    player_volume_this.style.width = selWidth + '%';
  }
  
  let mouseup = e => {
    player_volume_wrap.classList.remove('player_volume_active');
    
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
  }
  
  document.addEventListener('mousemove', mousemove);
  document.addEventListener('mouseup', mouseup);
});

var arrayShuffle = playlist => { // --i - уменьшение i, и пока он больше нуля,
	for( // т.е. если не прошел по всему плейлисту, он продолжает идти
    let j, x, i = playlist.length; i;
    j = Math.floor(Math.random() * i), 
    x = playlist[--i], 
    playlist[i] = playlist[j], 
    playlist[j] = x
  );
};

var downloadAudio = (block) => {
  let data = JSON.parse(block.attributes.data.value),
      author = data[0], name = data[1], url = data[2];
  
  if(block.classList.contains('audio_downloaded')) return;
  
  setTimeout(() => {
    let file_name = author + ' – ' + name + '.mp3',
        file = fs.createWriteStream(danyadev.user.downloadPath + file_name);
  
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

module.exports = {
  load,
  toggleAudio,
  toggleTime,
  downloadAudio
}