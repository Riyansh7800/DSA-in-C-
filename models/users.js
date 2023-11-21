const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportlocalSchema= require("passport-local-mongoose");

const UserSchema = new Schema({
     email:{
        type: String,
        requiered:true,

     },
});

UserSchema.plugin(passportlocalSchema);

module.exports= mongoose.model("User", UserSchema);