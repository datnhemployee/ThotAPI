
const Version = require('../Model/Version')

class VersionController {
  constructor () {}

  static async init () {
    try {
      let check = await Version.Model.find({}).lean().exec();
      console.log('check',JSON.stringify(check))
      if(check.length==0) {
        check = new Version.Model({
          version: 1,
          maxID: 0,
          maxOfPage: 5,
        });
        check.save();
      }
      return check;
    } catch (err) {
      console.log('init '+ err)
    }
  }

  static async getVersion () {
    try {
      let result = await Version.Model.find().lean(true).exec();
      console.log('getVersion result '+ JSON.stringify(result[0]))
      return result[0];
    } catch (err) {
      console.log('getVersion '+ err)
    }
  }

  static async getPage () {
    try {
      let temp = await this.getVersion();
      let {maxID,maxOfPage} = temp;
      return Math.floor(maxID/maxOfPage);
    } catch (err) {
      console.log('getPage '+ err)
    }
  }

  static async updateMaxOfPage (value) {
    try{
        const temp = await this.getVersion();
        await Version.Model.update(
        {_id:temp._id},{ 
          version: 0.1 ,
          maxOfPage: value,
        });
      return true;
    } catch (err) {
      return false;
    }
  }

  static async updateID () {
    try{
        const temp = await this.getVersion();
        await Version.Model.update(
          {_id:temp._id},{ 
          version: 0.1 ,
          maxID: temp.maxID +1,
        });
      return true;
    } catch (err) {
      return false;
    }
  }

  static async update (maxID,maxOfPage) {
    try{
      let temp = Version.Model;
      await temp.update(
        {},
        { 
          version: 1 ,
          maxID,
          maxOfPage,
        }, 
        (err,a)=>{
        if(err) return console.error(err);
        console.log('we did it! ');
      });
      return true;
    } catch (err) {
      return false;
    }
  }
}  

module.exports = VersionController;

