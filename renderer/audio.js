module.exports = user => {
  vkapi.method('audio.get', {}, data => {
    data = data.response;
    
    console.log(data);
  });
}