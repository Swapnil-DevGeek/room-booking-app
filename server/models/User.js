const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    email : {type: String , unique: true,required : true},
    role: { type: String, enum: ['admin', 'student'], required: true },
},{
    timestamps : true
});

const User = mongoose.models.User || mongoose.model('User',UserSchema);
module.exports = {User}