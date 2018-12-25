const mongoose = require("mongoose");
const mongo = require("../Constant/Mongo");
const conn = mongo.MONGOOSE_CONN;
// const Schema = mongoose.Schema.bind(mongoose);
// const Model = mongoose.model.bind(mongoose);

const schmDBVersion = new mongoose.Schema({
  version: {
    type: Number,
    required: true,
    unique: true,
  },
  maxID: {
    type: Number,
    required: true,
    unique: true,
  },
  maxOfPage: {
    type: Number,
    required: true,
    unique: true,
  },
});
// console.log("Version" + dbVersion_Schema);

exports.Schema = schmDBVersion;

const dbVersion = conn.model('DBVersion',schmDBVersion );

exports.Model = dbVersion;

exports.toString = () => 'DBVersion'