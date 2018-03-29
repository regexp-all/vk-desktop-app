var load = user => {
  var audiolist = document.querySelector('.audiolist');
  
  vkapi.method('audio.get', {}, data => {
    data = data.response;
    data.items.forEach(item => {
      let cover, time = Math.floor(item.duration/60) + ':';
      
      if(item.album && item.album.thumb) cover = item.album.thumb.photo_68;
      else cover = 'https://vk.com/images/audio_row_placeholder.png';
      
      if((item.duration%60)<10) time += '0' + item.duration%60;
      else time += item.duration%60;
      
      let maxLen = 60;
      let title, artist;
      if((item.title.length - maxLen) > 0)
        title = item.title.slice(0, -(item.title.length - maxLen));
      else title = item.title;
      if((item.artist.length - maxLen) > 0)
        artist = item.artist.slice(0, -(item.artist.length - maxLen));
      else artist = item.artist;
      
      audiolist.innerHTML += `
        <div class='audio_item' src='${item.url}' onclick='audio.toggleAudio(this)'>
          <div class='audio_cover' style='background-image: url("${cover}")'></div>
          <div class='audio_cover_play'></div>
          <div class='audio_names'>
            <div class='audio_name'>${title}</div>
            <div class='audio_author'>${artist}</div>
          </div>
          <div class='audio_real_time'>${time}</div>
          <div class='audio_played_time'></div>
        </div>
      `.trim();
    });
  });
}

var audio = document.querySelector('.audio');

var matchPlayedTime = stop => {
  if(audio.paused) return;
  
  let time = audio.currentTime,
      zero = time%60 < 10 ? '0' : '',
      audio_real_time = track.children[3],
      audio_played_time = track.children[4];
      
  audio_real_time.style.display = 'none';
  if(!audio_real_time.classList.hidden) audio_real_time.classList.add('hidden_time');
  if(!audio_played_time.classList.showed) audio_played_time.classList.add('showed_time');
  audio_played_time.innerHTML = Math.floor(time/60) + ':' + zero + Math.floor(time%60);
  
  setTimeout(matchPlayedTime, 250);
}

var toggleAudio = track => {
  window.track = track;
  
  if(document.querySelector('.audio_item_active')) 
    document.querySelector('.audio_item_active').classList.remove('audio_item_active');
  if(document.querySelector('.audio_cover_stop')) {
    document.querySelector('.audio_cover_stop').classList.add('audio_cover_play');
    document.querySelector('.audio_cover_stop').classList.remove('audio_cover_stop');
  }
    
  let audio_item = track, cover_util = track.children[1];
    
  if(audio.src != track.attributes.src.value) {
    audio.src = track.attributes.src.value;
    if(document.querySelector('.hidden_time')) {
      document.querySelector('.hidden_time').style.display = '';
      document.querySelector('.hidden_time').classList.remove('hidden_time');
      
      document.querySelector('.showed_time').innerHTML = '';
      document.querySelector('.showed_time').classList.remove('showed_time');
    }
  }
  
  if(audio.paused) {
    cover_util.classList.add('audio_cover_stop');
    cover_util.classList.remove('audio_cover_play');
    audio_item.classList.add('audio_item_active');
    
    audio.play();
    matchPlayedTime(0);
  } else {
    cover_util.classList.add('audio_cover_play');
    cover_util.classList.remove('audio_cover_stop');
    audio_item.classList.remove('audio_item_active');
    
    audio.pause();
  }
}

module.exports = {
  load,
  toggleAudio
}