const mongoose = require("mongoose");
const mongo = require("../Constant/Mongo");
const Account = require("./Account");
const conn = mongo.MONGOOSE_CONN;

const schm = mongoose.Schema;

const schmDish = new schm({
    likes: [{
      userID: {
        type: schm.Types.ObjectId,
        ref: 'Account',
      },
    }],

    comments: [{
      userID: {
        type: schm.Types.ObjectId,
        ref: 'Account',
        require: true,
      },
      content: {
        type: String,
        require: true,
      }
    }],

    author: {
      type: schm.Types.ObjectId,
      ref: 'Account',
      require: true,
    },

    page: {
      type:Number,
      require: true,
    },
    
    name: {
      type: String,
      required: true,
    },

    picture: {
      type: String,
      required: false,
    },

    intro: {
      type: String,
      required: false,
    },

    steps: {
      type: [String],
      required: false,
    },

    date: {
      type: Date,
      required: true,
    },

    ingredients: {
      type: String,
      required: true,
    },

    result: {
      type: [{
        userID: {
          type: schm.Types.ObjectId,
          ref: 'Account',
          require: true,
        },

        context: {
          type: String,
          required: false,
        },

        picture: {
          type: String,
          required: false,
        },
      }]
    },

  },
  {
    versionKey: 'v1',
  });

exports.Schema = schmDish;

const dish = conn.model('Dish', schmDish );


exports.Model = dish;

exports.toString = () => 'Dish'


