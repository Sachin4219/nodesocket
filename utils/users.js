const users = [];

// add user, remove user, get user, get users in room

function userJoin(username, room) {
  const index = users.findIndex((user) => user.username === username);
  const user = { username, room };

  if (index !== -1) {
    return user;
  }

  users.push(user);
  return user;
}

//Get current user
function getCurrentUser(id) {
  console.log("checking id with user", id);
  return users.find((user) => user.username === id);
}

//user leaves chat
function userLeavesChat(id) {
  const index = users.findIndex((user) => user.username === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

function getRoomUsers(room) {
  return users.filter((user) => user.room === room);
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeavesChat,
  getRoomUsers,
};
