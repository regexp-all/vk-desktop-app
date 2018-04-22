const vkapi = require('./vkapi');

var renderUser = id => {
  // id <- danyadev.user.id
  vkapi.method('execute.getFullProfileNewNew', {
    user_id: id
  }, data => {
    console.log(data);
  });
}

module.exports = renderUser;