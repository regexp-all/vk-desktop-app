const vkapi = require('./../vkapi');

var renderUser = id => {
  // id <- danyadev.user.id
  vkapi.method('execute.getFullProfileNewNew', {
    user_id: id
  }, data => {
    console.log(data);
  });
}

var load = () => {
  console.log('user loaded');
}

module.exports = {
  renderUser,
  load
}