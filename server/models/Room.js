const mongoose= require('mongoose');

const RoomSchema = new mongoose.Schema({
  room_name: { type: String, required: true, unique: true }, 
  capacity: { type: Number, required: true },
}, { timestamps: true });

const Room = mongoose.models.Room || mongoose.model('Room', RoomSchema);
module.exports = {Room};