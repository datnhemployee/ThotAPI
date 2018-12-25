const mongoose = require('mongoose');
const sha256 = require('sha256');
const mongo = require('../Constant/Mongo');
const Account = require('../Model/Account');
const StringHelper = require('../Helper/StringHelper');
const ctrlVersion = require('./VersionController');

module.exports = class AccountController {
  static toString () {return 'AccountController'}

  static createToken_ByUserID(userID) {
    const cnstRandom = StringHelper.getRandomString();
    return userID + '@' + cnstRandom;    
  }

  static createSalt () {
    const cnstRandom = StringHelper.getRandomString();
    return cnstRandom;
  } 

  static encript ( password, salt ) {
    try{
      if( password ){
          return sha256.x2( password + salt);
        }
    } catch(error){
      console.log(
        '\nCan not encript password: '+ password +
        '\nBecause '+ error
        );
    }
  }

  // ================= Check Account =================
  
  static async isValid (doc,val) {
    const object = {
      [doc] : val,
    };
    try{
      const result = await Account.Model.findOne(object)
      .select(`${doc}`)
      .lean();
      console.log('compare: '+ JSON.stringify(result));
      return result !== null;
    } catch(err) {
      console.log(
        '\nCan not check valid: '+ `${doc} ` +val +
        '\nBecause: '+ err
        );
      return true;
    }
  }
  
  static async isValid_Account (acc) {
    const {
      username,
      email,
      nickName,
      phone,
    } = acc;

    const isValid_Username = await AccountController.isValid('username',username);
    const isValid_Email = await AccountController.isValid('email',email);
    const isValid_NickName = await AccountController.isValid('nickName',nickName);
    const isValid_Phone = await AccountController.isValid('phone',phone);
    return isValid_Username ||
      isValid_Email ||
      isValid_NickName ||
      isValid_Phone;
  }

  // ================= Override Querry Mongoose =================


  static async updateBasicDoc (UserID,doc,val) {
    await Account.Model.updateOne(
      {_id:UserID},{
        [doc]:val,
      },
    ).exec((err,res)=>{
      if(err){
        console.log(
          '\nCan not update by UserID: '+ UserID +
          `\n${doc} `+ val + 
          '\nBecause '+ err
          );
      } 
    });
  }

  static async insertArrayDoc (UserID,doc,val) {
    await Account.Model.update(
      {'_id':UserID},
      {'$push':{[doc]:val,},}
    ).exec((err,res)=>{
      if(err){
        console.log(
          '\nCan not insert an element by UserID: '+ UserID +
          `\n${doc} `+ val + 
          '\nBecause '+ err
          );
      } 
    });
  }

  static async deleteArrayDoc (UserID,doc,val) {
    await  Dish.Model.updateOne(
      {'_id':UserID},
      { $pull: { [doc]: { ...val } } },
      async (err,res) => {
        console.log('deleteArrayDoc', JSON.stringify(res));
        if(err){
        console.log(
          '\nCan not delete an element by UserID: '+ UserID +
          `\n${doc} `+ val + 
          '\nBecause '+ err
          );
        return null;
      }
    });
  }

  // ================= Specific querry =================
  static async register (request,response) {
    let userInfo = request.body;

    if(await this.isValid_Account(userInfo))
     {
      response.send({
        error: 'Tài khoản, tên tài khoản,'+
        ' email hoặc số điện thoại'+
        ' đã được đăng kí.'});
      return false;
     }
    const salt = this.createSalt();
    const password = userInfo.password;
      // const password = this.encript(
      // userInfo.password,
      // salt
      // );
      console.log('password ', password,'salt ',salt);
    userInfo = {
      ...userInfo,
      ...{
        password: password,
        salt,
      }
    }

    const user = new Account.Model(userInfo);
    await user.save(async (err,res)=>{
      if(err){
        console.log(
          '\nCan not save userInfo : '+ JSON.stringify(userInfo) +
          '\nBecause '+ err
        );
        response.send({error: 'Cơ sở dữ liệu không khả dụng.'});
        return false;
      }
      const token = this.createToken_ByUserID(res._id);
      await AccountController.updateBasicDoc(
        res._id,
        'token',
        token,
      )
      response.send({_id:res.id,token});
      return true;
    });
  }

  static async logInWithAuth(request,response) {
    const {
      auth:{
        username,
        password,
      }
    } = request.body;
    console.log(
      '\n logInWithAuth body : '+ JSON.stringify(request.body)
    );
    console.log(
      '\n logInWithAuth type of username : '+  typeof username
    );
    console.log(
      '\n logInWithAuth type of password : '+ typeof password
    );
    if(await this.isValid_Account({username})){
      try{
        // Cẩn thận với hàm find vì nó sẽ trả về một chuỗi []
        // Nhớ lấy giá trị đầu tiên [0]
        let result = await Account.Model.findOne(
        {
          username: username,
        })
        .select('salt password')
        .lean();

        console.log(
          '\n logInWithAuth result : '+ JSON.stringify(result) 
        );
        console.log(
          '\n logInWithAuth type of salt : '+  typeof result.salt
        );
        console.log(
          '\n logInWithAuth type of password : '+ typeof result.password
        );
        if(result===undefined){
          response.send({error:'Tài khoản hoặc mật khẩu chưa đúng.'})
          return false;
        }
        const {
          salt,
        } = result;
        console.log(
          '\n logInWithAuth result : '+ JSON.stringify(result) 
        );
        const pass = result.password;
        // const pass = this.encript(password,salt);
        if(pass===password){
          console.log(
            '\n logInWithAuth password : '+ JSON.stringify(pass) 
          );
          result = await Account.Model.findOne(
            {
              $and: [
              {username: 'a'},
              {password: 'a'},]
            })
            .lean();

          const {
            _id,
          } = result;
          
          const token = this.createToken_ByUserID(_id);
          await AccountController.updateBasicDoc(
            _id,
            'token',
            token,
          )
          console.log(
            '\n logInWithAuth result : '+ JSON.stringify({_id:_id,token:token}) 
          );
          response.send({_id:_id,token:token});
          return true;
        }
        response.send({error:'Tài khoản hoặc mật khẩu chưa đúng.'})
        return false;
      } catch (err) {
        console.log(
          '\nCan not logInWithAuth : '+ username + 
          '\nPassword: '+ password +
          '\nBecause '+ err
        );
        response.send({error:'Cơ sở dữ liệu hiện không khả dụng.'})
      }
    }
    return false;
  }

  static async logInWithToken(request,response) {
    try{
    const result = await Account.Model.findOne(
      {token: request.body.token},
      '-username -password -token -note -savedDish -friends')
      .lean();
      if(result._id) {
        response.send({_id:result._id});
        return true;
      }
      response.send({error:'Token hiện không còn khả dụng.'});
      return false;
    } catch (err) {
      response.send({error:'Token hiện không còn khả dụng.'});
      return false;
    }
  }

  static async getInfoByField (request,response) {
    try{
      console.log('trong này' + JSON.stringify(request.body));
      console.log('trong này');
      const result = await Account.Model.findOne(
        {...request.body},
        '-username -password -token -note -savedDish -friends')
        .lean();
      console.log('trong này' + JSON.stringify(result));
      if(result._id) {
          response.send(result);
          return true;
        }
      response.send({error:'Không thể lấy dữ liệu.'});
        return false;
      } catch (err) {
        response.send({error:'Không thể lấy dữ liệu.'});
        return false;
      }
  }

}