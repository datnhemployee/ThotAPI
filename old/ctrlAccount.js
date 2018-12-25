const mongoose = require('mongoose');
const sha256 = require('sha256');
const mongo = require('../../Constant/Mongo');
const SALT_LENGTH = 10;
const Account = require('../../Model/Account');
const StringHelper = require('../../Helper/StringHelper');
const ctrlVersion = require('../VersionController');

class ctrlAccount {
  constructor () {
  }



  static async getMaxOfPage () {
    let res = await ctrlVersion.getVersion();
    return  res.maxOfPage;
  }

  static async getMaxID () {
    let res = await ctrlVersion.getVersion();
    console.log('getMaxID: '+ JSON.stringify(res));
    return  res.maxID;
  }

  static async getToken (id) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 10; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
    
    return  id +'\@'+ text;
  }

  static get Salt () {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < SALT_LENGTH; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

  static sha256 (val,salt) {
    try{
      if( val ){
          return sha256.x2( val + salt);
        }
    } catch(error){
      throw new Error('Can not hash the value '+ error);
    }
  }

  static isAvailable_Username (username){
    try{
      if( Account.Model.findOne({
        username : username,
      })){
          throw new Error('Username is existed.');
        }
      return true;
    } catch(error){
      throw new Error('Error: '+ error);
    }
  }

  static isAvailable(acc) {
    try{
      if( ctrlAccount.isAvailable_Username(acc.username) ){
        if( Account.Model.findOne({
          email : acc.email,
        })){
          throw new Error('email is existed.');
        }
      }
      return true;
    } catch(error){
      throw new Error('Error: '+ error);
    }
  }

  static Normalize_RequiredVal (val) {
    if (StringHelper.isRegularExpression(val))
      return val;
    throw '';
  }

  static Normalize_UnrequiredVal (val) {
    if( !StringHelper.isString(val))
      return '';
    return val;
  }

  static Normalize_Account (acc,salt) {
    
      console.log('Normalize_Account: acc:'+ JSON.stringify(acc));
      return {
      username: ctrlAccount.Normalize_RequiredVal(acc.username),
      password: ctrlAccount.sha256(
        ctrlAccount.Normalize_RequiredVal(acc.username),
        salt),
      salt: salt,
      nickName: ctrlAccount.Normalize_UnrequiredVal(acc.nickName),
      phone: ctrlAccount.Normalize_UnrequiredVal(acc.phone),
      email: ctrlAccount.Normalize_UnrequiredVal(acc.email),
      address: ctrlAccount.Normalize_UnrequiredVal(acc.address),
      intro: ctrlAccount.Normalize_UnrequiredVal(acc.intro),
    }
  }

  static isRelevantAccount(acc,salt) {
    let normalized = ctrlAccount.Normalize_Account(acc,salt);
    if(!StringHelper.isEmpty(normalized.username) &&
    !StringHelper.isEmpty(normalized.password))
      return true;
    return false;
  }
  


  updateToken (username,token) {
    try{
      Account.Model.update(
        {username:username},
        {token:token});
    } catch(error){
      throw new Error('Unable to update the token.' + 
      '\nSystem Message: '+error);
    }
  }

  static async getSaltFromDB (acc) {
    try{
      let normalized = ctrlAccount.Normalize_Account(acc,'');
      return await Account.Model.find(
        {username: normalized.username},
        'salt'
      ).lean().exec();
    } catch(error){
      throw new Error('Unable to get salt from DB.' + 
      '\nSystem Message: '+error);
    }
  }

  static async login (auth) {
    try{
      console.log('auth: ' + JSON.stringify(auth));
      let salt = await ctrlAccount.getSaltFromDB(auth);
      let normalized = ctrlAccount.Normalize_Account({...auth},salt);
      console.log('normalized: ' + JSON.stringify(normalized));
      
      const result = await Account.Model.find(
        {
          username: normalized.username,
          password: normalized.password,
        },
        'username'
      ).lean().exec();

      if(result.username) {
        await ctrlVersion.update(
          this.getMaxID()+1,
          this.getMaxOfPage());
        return ctrlAccount.getToken();
      }
      return '';
    } catch(error){
      throw new Error('Unable to login.' + 
      '\nSystem Message: '+error);
    }
  }

  static async register (acc) {
    try{
      let salt = await ctrlAccount.Salt;
      let normalized = ctrlAccount.Normalize_Account(acc,salt);
      let result = new Account.Model(normalized);
      normalized = {
        ...normalized,
        ...{
          token: await ctrlAccount.getToken(result._id),
        }
      };
      console.log('register: normalized:'+ JSON.stringify(normalized));
      console.log('register: result:'+ JSON.stringify(result));
      result = new Account.Model(normalized);
      await result.save();

      return normalized;
    } catch(err) {
      throw new Error('Unable to register.' + 
      '\nSystem Message: '+err);
    }
  }

  static async loginWithToken (token) {
    try{
      let account = await Account.Model.findOne({
        token: token,
      }).lean().exec();
      if(!account.username){
        return '';
      }
      return account.username;
    } catch(err) {
      throw new Error('Unable to loginWithToken.' + 
      '\nSystem Message: '+err);
    }
  } 
}

module.exports = ctrlAccount;
