const mongoose = require("mongoose")
const ReservationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user_email: { type: String, required: true },  
  user_name: { type: String, required: true },   
  room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  room_name : {type : String, required: true},
  date: { type: Date, required: true },
  start_time: { type: String, required: true },  
  end_time: { type: String, required: true },    
  reason: { type: String, required: true },      
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

const Reservation = mongoose.models.Reservation || mongoose.model('Reservation', ReservationSchema);
module.exports = {Reservation};
