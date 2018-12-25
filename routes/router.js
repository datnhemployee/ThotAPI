const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
const ctrlAccount = require('../Controller/AccountController');
const ctrlUser = require('../Controller/ctrlUser');
const ctrlDish = require('../Controller/DishController');
const multer = require('multer');

const UserManager = new ctrlUser();


const rout = {
  logIn: '/LogIn',
  upload: '/Upload',
  getDishes: '/GetDishes',
  addDish: '/AddDish',
  like: '/Like',
  dislike: '/Dislike',
  comment: '/Comment',
  getComments: '/GetComments',
  getInfo_ID: '/GetUserByID',
  getInfo_NickName: '/GetUserByNickName',
  getDish_ID: '/GetDishByID',
};

const Storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, './public');
  },
  filename(req, file, callback) {
    callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: Storage });

const reqName = {
  
  // Request
  LogInWithAuth: 'log-in-with-auth' ,
  LogInWithToken: 'log-in-with-token',
  GetInfoFromDatabase: 'get-info-from-database',
  Register: 'register',
  AddDish: 'add-dish',
  GetDishes: 'get-dishes',
  Comment: 'comment',
  Comment: 'get-comments',
}

router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json())

const print = function(obj) {
  if(obj){
    for( var k in obj){
      // if(obj[k] instanceof Object) print(obj[k]);
      // else
        console.log(k+": "+obj[k])
    }
  }
}

router.get(`/`, (req,res) => {
  console.log('user send request: '+ req);
  // print(req);
  res.send({ response: "I am up" }).status(200);
});

router.post(rout.logIn, async (req,res) => {
  let request = req.headers.request;

  if(request === reqName.LogInWithAuth){
      ctrlAccount.logInWithAuth(req,res);  
  }
  else if(request === reqName.Register){
    await ctrlAccount.register(req,res);
  }
  else if (request === reqName.LogInWithToken){
    await ctrlAccount.logInWithToken(req,res);
  }
    
  });

router.post(rout.upload, upload.array('photo', 3), (req, res) => {
  console.log('file', JSON.stringify(req.files[0].filename));
  console.log('body', JSON.stringify(req.body));
  res.status(200).json({
    message: 'success!',
  })
})

router.post(rout.addDish, async (req,res) => {
      await ctrlDish.addDish(req,res);
});

router.post(rout.getDishes, async (req,res) => {
  await ctrlDish.getDishes(req,res);
});

router.post(rout.like, async (req,res) => {
  await ctrlDish.like(req,res);
});

router.post(rout.dislike, async (req,res) => {
  await ctrlDish.dislike(req,res);
});

router.post(rout.comment, async (req,res) => {
  await ctrlDish.comment(req,res);
});

router.post(rout.getComments, async (req,res) => {
  await ctrlDish.getComments(req,res);
});

router.post(rout.getInfo_NickName, async (req,res) => {
  console.log('comment',JSON.stringify(req.body));
  await ctrlAccount.getInfoByField(req,res);
});

router.post(rout.getInfo_ID, async (req,res) => {
  // console.log('comment',JSON.stringify(req.body));
  await ctrlAccount.getInfoByField(req,res);
});

router.post(rout.getDish_ID, async (req,res) => {
  // console.log('comment',JSON.stringify(req.body));
  await ctrlDish.getDish_ID(req,res);
});

module.exports = router;
