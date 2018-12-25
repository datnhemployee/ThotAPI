const mongoose = require('mongoose');
const sha256 = require('sha256');
const mongo = require('../Constant/Mongo');
const SALT_LENGTH = 10;
const Account = require('../Model/Account');
const ctrlAccount = require('./AccountController');
const Dish = require('../Model/Dish');
const StringHelper = require('../Helper/StringHelper');
const ctrlVersion = require('./VersionController');

module.exports = class DishController {
  
  constructor () {}
  // ================= Check Account =================

  static isRelevant_info(val) {
    try {
    if(typeof val ==='string' &&
      val.length != 0) 
      return true;
    } catch (err) {
      console.log('Can not check value: '+ value +
      '\n Because '+ err );
    }
    return false;
  }
  static async isRelevant_Dish (dish) {
    const {
      author,
      name,
      ingredients,
    } = dish;

    const isRelevant_Author = await DishController.isRelevant_info(author);
    const isRelevant_Name = await DishController.isRelevant_info(name);
    const isRelevant_Ingredients = await DishController.isRelevant_info(ingredients);
    return isRelevant_Author ||
      isRelevant_Name ||
      isRelevant_Ingredients 
  }
  // ================= API Dish =================

  static async updateBasicDoc (DishID,doc,val) {
    await Account.Model.updateOne(
      {_id:DishID},{
        [doc]:val,
      },
    ).exec((err,res)=>{
      if(err){
        console.log(
          '\nCan not update by DishID: '+ DishID +
          `\n${doc} `+ val + 
          '\nBecause '+ err
          );
      } 
    });
  }

  static async insertArrayDoc (DishID,doc,val) {
    await Dish.Model.updateOne(
      {'_id':DishID},
      {'$push':{[doc]:val,},}
    ).exec((err,res)=>{
      if(err){
        console.log(
          '\nCan not insert an element by DishID: '+ DishID +
          `\n${doc} `+ val + 
          '\nBecause '+ err
          );
      } 
    });
  }

  static async deleteArrayDoc (DishID,doc,val) {
    await  Dish.Model.updateOne(
      {'_id':DishID},
      { $pull: { [doc]: { ...val } } },
      async (err,res) => {
        console.log('deleteArrayDoc', JSON.stringify(res));
        if(err){
        console.log(
          '\nCan not delete an element by DishID: '+ DishID +
          `\n${doc} `+ val + 
          '\nBecause '+ err
          );
        return null;
      }
    });
  }

  // ================= Querry Dish =================

  static async addDish (req,res) {
    try{
      let data = req.body;
      if(await this.isRelevant_Dish(data)){

        data = {
          ...data,
          ...{
            page: await ctrlVersion.getPage(),
            date: new Date(),
          }
        }

        const temp = new Dish.Model(data);

        await temp.save(async (err,data)=>{
          if(err){
            console.log(
              '\nCan not addDish: '+ JSON.stringify(data) +
              '\nBecause '+ err
              );
            res.send({error:'Không thể thêm công thức mới'});
            return false;
          }
          await ctrlAccount.insertArrayDoc(
            data.author,
            'savedDish',
            data._id
          );
          await ctrlVersion.updateID();
          res.send({success:'Thêm công thức thành công.'});
          return true;
        });
      } 
    } catch(err) {
      res.send({error:'Không thể thêm công thức mới'});
      console.log(err);
      return false;
    }
  }

  static async getDishes(req,res) {
    try{
      let data = req.body;
      const {
        page,
        _id,
      } = data;
      if(page===undefined || _id===undefined) {
        res.send({error:'Dữ liệu truyền bị sai'});
        return false;
      }
      let result = await Dish.Model.find(
        {page:{$lte:page}}
      )
      .populate('author')
      .select('date likes comments nickName name')
      .lean();
      if(result.length==0) {
        res.send({error:'Chưa có bài viết nào'});
        return false;
      }
      // let save = await Account.Model.findOne(
      //   {_id:_id}
      // ).select('savedDish')
      // .lean();
      // console.log('save',JSON.stringify(save));

      result = result.map((val) =>{
        return {
          _id: val._id,
          likes: val.likes.length,
          comments: val.comments.length,
          author: val.author.nickName,
          name: val.name,
          isLike: val.likes.includes(_id),
          isSave: val.author.savedDish.includes(val._id),
        }
      })
      res.send(result);
      return true;
    } catch(err) {
      res.send({error:'Máy chủ hoặc cơ sở dữ liệu chưa khả dụng'});
      console.log(err);
      return false;
    }
  }

  static async like(req,res) {
    try{
      let data = req.body;
      const {
        postID,
        _id,
      } = data;
      if(postID===undefined || _id===undefined) {
        res.send({error:'Dữ liệu truyền bị sai'});
        return false;
      }
      await this.insertArrayDoc(postID,'likes',{userID:_id});
        res.send({success:''});
        return true;
    } catch (err) {
      res.send({error:'Máy chủ hoặc cơ sở dữ liệu chưa khả dụng'});
      console.log(err);
      return false;
    }
  }

  static async dislike(req,res) {
    try{
      let data = req.body;
      const {
        postID,
        _id,
      } = data;
      if(postID===undefined || _id===undefined) {
        res.send({error:'Dữ liệu truyền bị sai'});
        return false;
      }
      await this.deleteArrayDoc(postID,'likes',{userID:_id});
        res.send({success:''});
        return true;
    } catch (err) {
      res.send({error:'Máy chủ hoặc cơ sở dữ liệu chưa khả dụng'});
      console.log(err);
      return false;
    }
  }

  static async comment(req,res) {
    try{
      let data = req.body;
      const {
        postID,
        content,
        userID,
      } = data;
      if(postID===undefined || 
        content===undefined ||
        userID===undefined
        ) {
        res.send({error:'Dữ liệu truyền bị sai'});
        return false;
      }
      await this.insertArrayDoc(postID,'comments',{userID,content});
        res.send({success:''});
        return true;
    } catch (err) {
      res.send({error:'Máy chủ hoặc cơ sở dữ liệu chưa khả dụng'});
      console.log(err);
      return false;
    }
  }

  static async getComments(req,res) {
    try{
      let data = req.body;
      const {
        postID,
      } = data;
      console.log('getComment data',JSON.stringify(data));
      if(postID===undefined) {
        res.send({error:'Dữ liệu truyền bị sai'});
        return false;
      }
      let result = await Dish.Model.findOne(
        {_id:postID}
      )
      .select('comments')
      .lean();

      console.log('getComment result',JSON.stringify(result.comments));

      let returnValue = await Promise.all(result.comments.map(async (val) =>{
        console.log('getComment val',typeof val);
        let author = await Account.Model.findOne({
            _id:val.userID
          }).select('nickName')
          .lean();
          console.log('getComment map',JSON.stringify({
            content: val.content,
            author: author.nickName,
          }));
          return {
            content: val.content,
            author: author.nickName,
          };
      }))
      console.log('getComment result',JSON.stringify(returnValue));
      res.send( returnValue);
      return true;
    } catch(err) {
      res.send({error:'Máy chủ hoặc cơ sở dữ liệu chưa khả dụng'});
      console.log(err);
      return false;
    }
  }

  static async getDish_ID(req,res) {
    try{
      let data = req.body;
      const {
        _id,
      } = data;
      console.log('getDish_ID data',JSON.stringify(data));
      if(_id===undefined) {
        res.send({error:'Dữ liệu truyền bị sai'});
        return false;
      }
      let result = await Dish.Model.findOne(
        {_id}
      )
      .select('name steps intro ingredients')
      .lean();

      console.log('getDish_ID result',JSON.stringify(result));
      res.send(result);
      return true;
    } catch(err) {
      res.send({error:'Máy chủ hoặc cơ sở dữ liệu chưa khả dụng'});
      console.log(err);
      return false;
    }
  }
}

