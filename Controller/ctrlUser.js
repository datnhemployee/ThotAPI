const ctrlVersion = require('../Controller/VersionController');

class ctrlUser {
  constructor () {
    this.rooms = {
      id: 0,
      online: [{username:String}]
    }
    ctrlVersion.init();
    this.add = this.add.bind(this);
    this.delete = this.delete.bind(this);
  }

  add (username, room = 0) {
    if(this.rooms.online.indexOf({username})===-1)
      this.rooms.online.push({username});
  }

  delete (username, room = 0) {
    const startNumber = this.rooms.online.indexOf({username});
    if(startNumber==-1)
      throw new Error('User này không tồn tại. ');
    this.rooms.online.slice(startNumber,1);
  }
}

module.exports = ctrlUser;