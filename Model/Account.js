const mongoose = require("mongoose");
const mongo = require("../Constant/Mongo");
const Dish = require("./Dish");
const conn = mongo.MONGOOSE_CONN;

// const Schema = mongoose.Schema.bind(mongoose);
// const Model = mongoose.model.bind(mongoose);
const schm = mongoose.Schema;

const schmAccount = new schm({
    // @username
    username: {
      type: String,
      required: true,
      unique: true,
    },
    //
    password: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    },
    nickName: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: false,
      unique: true,
    },
    email: {
      type: String,
      required: false,
      unique: true,
    },
    address: {
      type: String,
      required: false,
    },
    token: {
      type: String,
      required: false,
    },

    // @picture = << url_of_user_picture >>
    picture: {
      type: {
        type: String,
      },
      required: false,
      default: ''
    },

    intro: {
      type:String,
      required: false,
    },

    note: {
      type: [{
        dishID: {
          type: schm.Types.ObjectId,
          ref: 'Dish',
          required: true,
        },
        context: {
          type: [String],
          required: true,
        },
        date: {
          type: Date,
          required: true,
        }
      }],
      required: false,
    },

    friends: {
      type:[{
        userID: {
          type: schm.Types.ObjectId,
          ref: 'Account',
        },
      }],
      required: false,
    },

  },
  {
    versionKey: 'v1',
  });

  exports.Schema = schmAccount;

  const account = conn.model('Account', schmAccount );

  exports.Model = account;

  exports.toString = () => 'Account'


