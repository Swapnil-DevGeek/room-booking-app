const express = require('express');
const app = express();
const cors = require('cors');
require("dotenv").config();
const passport = require("passport");
const session = require("express-session");
const nodemailer = require("nodemailer");
const passportSetup = require("./passport");
const authRoute = require("./routes/auth");

const { dbConnect } = require('./utils/dbConnect');
const { User } = require("./models/User");
const { Room } = require("./models/Room");
const { Reservation } = require("./models/Reservation");
const { RejectedRequest } = require("./models/RejectedRequest");

// Email configuration
const emailConfig = {
    service: 'Gmail',
    auth: {
        user: 'swapnilsoni1704@gmail.com',
        pass: 'rxlz brej blee ylti'
    }
};

const transporter = nodemailer.createTransport(emailConfig);

const port = process.env.PORT || 8000;

app.use(
    session({
        secret: "thunder",
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000,
            secure: true, // Set to true if using HTTPS
            sameSite: 'none' // Important for cross-site cookies
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(cors({
    origin: "https://room-booking-app-frontend.onrender.com",
    methods: "GET,PUT,POST,DELETE",
    credentials: true // This is important for sending cookies
}));
app.use("/auth", authRoute);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/approve-request', async (req, res) => {
    const { reservation_id } = await req.body;
    try {
        // Update reservation status
        await Reservation.findByIdAndUpdate(reservation_id, {
            status: 'approved'
        });
        
        // Get the complete reservation details
        const reservation = await Reservation.findOne({ _id: reservation_id });
        
        // Delete from rejected requests if exists
        const rej_res = await RejectedRequest.findOne({ reservation_id });
        if (rej_res) {
            await RejectedRequest.findOneAndDelete({ reservation_id });
        }

        // Send approval email
        const mailOptions = {
            from: 'swapnilsoni1704@gmail.com',
            to: reservation.user_email,
            subject: 'Room Booking Request Approved',
            html: `
                <p>Dear ${reservation.user_name},</p>
                <p>Your room reservation request has been <strong style="color: green;">APPROVED</strong>. Here are the booking details:</p>
                <h3>Booking Information:</h3>
                <ul>
                    <li><strong>Room Name:</strong> ${reservation.room_name}</li>
                    <li><strong>Date:</strong> ${new Date(reservation.date).toLocaleDateString()}</li>
                    <li><strong>Start Time:</strong> ${reservation.start_time}</li>
                    <li><strong>End Time:</strong> ${reservation.end_time}</li>
                    <li><strong>Reason:</strong> ${reservation.reason}</li>
                </ul>
                <p>Please make sure to:</p>
                <ul>
                    <li>Arrive on time</li>
                    <li>Keep the room clean and tidy</li>
                    <li>Report any issues to the administration</li>
                </ul>
                <p>Thank you for using our room booking system!</p>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(201).json({ success: true, data: reservation });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Error approving reservation: " + error });
    }
});

app.post('/api/rejected-request', async (req, res) => {
    const { reservation_id, reject_reason } = req.body;

    try {
        const rejectedRequest = new RejectedRequest({
            reservation_id,
            reject_reason
        });

        await rejectedRequest.save();

        const reservation = await Reservation.findByIdAndUpdate(
            reservation_id, 
            { status: 'rejected' },
            { new: true }
        );

        // Send rejection email
        const mailOptions = {
            from: 'swapnilsoni1704@gmail.com',
            to: reservation.user_email,
            subject: 'Room Booking Request Rejected',
            html: `
                <p>Dear ${reservation.user_name},</p>
                <p>We regret to inform you that your room reservation request has been <strong style="color: red;">REJECTED</strong>.</p>
                <h3>Booking Details:</h3>
                <ul>
                    <li><strong>Room Name:</strong> ${reservation.room_name}</li>
                    <li><strong>Date:</strong> ${new Date(reservation.date).toLocaleDateString()}</li>
                    <li><strong>Start Time:</strong> ${reservation.start_time}</li>
                    <li><strong>End Time:</strong> ${reservation.end_time}</li>
                    <li><strong>Reason for Booking:</strong> ${reservation.reason}</li>
                </ul>
                <h3>Reason for Rejection:</h3>
                <p>${reject_reason}</p>
                <p>If you have any questions about this decision or would like to submit a new request, please contact the administration.</p>
                <p>Thank you for your understanding.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(201).json({ success: true, data: rejectedRequest });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Error rejecting request: " + error.message });
    }
});

app.get('/api/rejected/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const rejected_res = await RejectedRequest.find({ reservation_id: id });
        if (!rejected_res) {
            return res.status(400).json({ success: false, error: "Reservation for this id not found!" });
        }
        return res.status(201).json({ success: true, data: rejected_res });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Error fetching reservation : " + error });
    }
});

app.get('/api/future-reservations', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const futureReservations = await Reservation.find({
            date: { $gte: today }
        });

        return res.status(200).json({ success: true, data: futureReservations });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Error fetching future reservations: " + error.message });
    }
});

app.get('/api/past-reservations', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const pastReservations = await Reservation.find({
            date: { $lt: today }
        });

        return res.status(200).json({ success: true, data: pastReservations });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Error fetching past reservations: " + error.message });
    }
});

app.post('/api/reserve-room', async (req, res) => {
    const { date, start_time, end_time, room_id, user_id, reason, user_name, user_email, room_name } = req.body;

    try {
        if (!date || !start_time || !end_time || !room_id || !user_id || !reason || !user_email || !user_name || !room_name) {
            return res.status(400).json({ success: false, error: "All fields are required" });
        }

        const newReservation = new Reservation({
            date,
            start_time,
            end_time,
            room_id,
            user_id,
            reason,
            user_email,
            user_name,
            room_name,
            status: 'pending'
        });

        await newReservation.save();

        const mailOptions = {
            from: 'swapnilsoni1704@gmail.com',
            to: user_email,
            subject: 'Room Booking Application',
            html: `
                <p>Dear Student,</p>
                <p>Your room reservation application has been successfully made. Below are the details:</p>
                <h3>Booking Information:</h3>
                <ul>
                    <li><strong>Room Name:</strong> ${room_name}</li>
                    <li><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</li>
                    <li><strong>Start Time:</strong> ${start_time}</li>
                    <li><strong>End Time:</strong> ${end_time}</li>
                    <li><strong>Reason:</strong> ${reason}</li>
                </ul>
                <p>If you have any questions or need to modify your booking, please contact us. The application will be reviewed by the admin and the permission will be updated accordingly and will be notified.</p>
                <p>Thank you!</p>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(201).json({ success: true, data: newReservation });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Error creating reservation: " + error.message });
    }
});

app.get('/api/available-rooms', async (req, res) => {
    const { date, start_time, end_time } = req.query;

    try {
        const queryDate = new Date(date);
        queryDate.setDate(queryDate.getDate() - 1);
        const startOfDay = new Date(queryDate.setUTCHours(0, 0, 0, 0)).getTime();
        const endOfDay = new Date(queryDate.setUTCHours(23, 59, 59, 999)).getTime();

        const allRooms = await Room.find();

        const unavailableRooms = await Reservation.distinct('room_id', {
            date: { $gte: startOfDay, $lte: endOfDay },
            $or: [
                { start_time: { $lt: end_time }, end_time: { $gt: start_time } },
                { start_time: { $gte: start_time, $lt: end_time } },
                { end_time: { $gt: start_time, $lte: end_time } }
            ],
            status: { $in: ['pending', 'approved'] }
        });

        const availableRooms = allRooms.filter(room =>
            !unavailableRooms.some(unavailableRoomId =>
                unavailableRoomId.equals(room._id)
            )
        );

        return res.status(200).json({
            success: true,
            data: availableRooms,
            debug: {
                queryDateRange: {
                    start: new Date(startOfDay).toISOString(),
                    end: new Date(endOfDay).toISOString()
                },
                totalRooms: allRooms.length,
                unavailableRoomIds: unavailableRooms.map(id => id.toString()),
                availableRoomsCount: availableRooms.length
            }
        });
    } catch (error) {
        console.error("Error fetching available rooms: ", error);
        return res.status(500).json({ success: false, error: "Error fetching available rooms: " + error.message });
    }
});

app.get("/api/room-name/:roomname", async (req, res) => {
    try {
        const { roomname } = req.params;
        const room = await Room.findOne({ room_name: roomname });
        if (!room) {
            return res.status(404).json({ success: false, error: "Room not found" });
        }
        return res.status(200).json({ success: true, data: room });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Error fetching room " + error.message });
    }
});

app.get("/api/room/:roomid", async (req, res) => {
    try {
        const { roomid } = req.params;
        const room = await Room.findOne({ _id: roomid });
        if (!room) {
            return res.status(404).json({ success: false, error: "Room not found" });
        }
        return res.status(200).json({ success: true, data: room });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Error fetching room " + error.message });
    }
});

app.get("/api/user/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ success: false, error: "User not found" });
        }
        return res.status(201).json({ success: true, data: user });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Error fetching user " + error.message });
    }
});

app.get("/api/reservations/student/:studentid", async (req, res) => {
    try {
        const { studentid } = req.params;
        const studentReservations = await Reservation.find({ user_id: studentid });
        res.status(201).json({ success: true, data: studentReservations });
    } catch (error) {
        res.status(500).json({ success: false, error: "Error fetching reservations " + error });
    }
});

app.post('/api/add-user', async (req, res) => {
    const { email, role } = req.body;

    try {
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: "User already exists" });
        }

        const newUser = new User({ email, role });
        await newUser.save();

        return res.status(201).json({ success: true, data: newUser });
    } catch (e) {
        return res.status(500).json({ success: false, error: 'Error creating User ' + e.message });
    }
});

app.post('/api/add-classroom', async (req, res) => {
    const { room_name, capacity } = req.body;

    try {
        const rm = await Room.findOne({ room_name });
        if (rm) {
            return res.status(400).json({ success: false, error: "Room with this name already exists" });
        }

        const newRoom = new Room({ room_name, capacity });
        await newRoom.save();

        return res.status(201).json({ success: true, data: newRoom });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Error adding room " + error.message });
    }
});

app.get('/api/get-classrooms', async (req,res)=>{
    try {
        const rooms= await Room.find({});
        if(!rooms){
            return res.status(400).json({success:false,error: "Rooms not found "});
        }
        return res.status(201).json({success:true,data:rooms});

    } catch (error) {
        return res.status(500).json({success:false,error : "Error fetching rooms : ",error});
    }
})

app.post('/api/delete-classroom',async (req,res)=>{
    try {
        const { classroom_id } = await req.body;
        const room = await Room.findOneAndDelete({_id: classroom_id});
        if(!room){
            return res.status(400).json({success:false,error: "Rooms not found "});
        }
        return res.status(201).json({success:true,data : room});
    } catch (error) {
        return res.status(500).json({success:false,error : "Error deleting room : ",error});
    }
});

app.post('/api/edit-classroom',async (req,res)=>{
    try {
        const { classroom_id,room_name,capacity } = await req.body;
        const room = await Room.findByIdAndUpdate(
            classroom_id,
            { room_name,capacity},
            {new : true}
        );
        if(!room){
            return res.status(400).json({success:false,error: "Rooms not found "});
        }
        return res.status(201).json({success:true,data : room});
    } catch (error) {
        return res.status(500).json({success:false,error : "Error updating room : ",error});
    }
});

// Connect to the database
dbConnect();

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
