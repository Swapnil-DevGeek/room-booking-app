import React, { useEffect, useState } from "react";
import { format as dateFnsFormat } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CheckIcon } from "@radix-ui/react-icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TimePicker, Modal } from "antd";
import dayjs from "dayjs";
import axios from "axios";
import LoadingComponent from "@/components/LoadingComponent";

const StudentBookClass = ({ user }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [date, setDate] = useState();
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:00");
  const timeFormat = "HH:mm";
  const [error, setError] = useState("");
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedRoomId,setSelectedRoomID] = useState("");
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [userId,setUserId] = useState('');
  const steps = ["Select Date and Time", "Select Class", "Add Details"];
  

  const validateStepOne = () => {
    if (!date || !startTime || !endTime) {
      setError("All fields must be filled.");
      return false;
    }
    if (dayjs(endTime, timeFormat).isBefore(dayjs(startTime, timeFormat))) {
      setError("End time must be greater than start time.");
      return false;
    }
    setError("");
    return true;
  };

  const fetchAvailableRooms = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://room-booking-app-backend.onrender.com/api/available-rooms/?date=${date}&start_time=${startTime}&end_time=${endTime}`
      );
      const data = response.data;
      if (data.success) {
        setRooms(data.data);
      } else {
        setError("Failed to fetch available rooms.");
      }
    } catch (error) {
      setError("Error fetching available rooms: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (activeStep === 0 && !validateStepOne()) {
      return;
    }
    if (activeStep === 0) {
      await fetchAvailableRooms();
    }

    if (activeStep === 1) {
      if (!selectedRoom) {
        setError("Please select a room!");
        return;
      } else {
        setError("");
      }
    }

    const nextStep = activeStep + 1;
    if (nextStep < steps.length) {
      setCompletedSteps((prevCompleted) => [...prevCompleted, activeStep]);
      setActiveStep(nextStep);
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
      setCompletedSteps((prevCompleted) =>
        prevCompleted.filter((step) => step !== activeStep - 1)
      );
    }
  };

  const handleReviewForm = async () => {
    if (!reason) {
      setError("Please specify a reason!");
      return;
    } else {
      setError("");
    }

    setIsReviewModalVisible(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const uidResponse = await axios.get(`https://room-booking-app-backend.onrender.com/api/user/${user.email}`);
      const uidData = uidResponse.data;
      if (uidData.success) {
        setUserId(uidData.data._id);
      } else {
        setError("Failed to fetch user ID.");
        setLoading(false);
        return;  
      }
  
      const roomResponse = await axios.get(`https://room-booking-app-backend.onrender.com/api/room-name/${selectedRoom}`);
      const roomData = roomResponse.data;
      if (roomData.success) {
        setSelectedRoomID(roomData.data._id);
      } else {
        setError("Failed to fetch room ID.");
        setLoading(false);
        return;  
      }
      
      const payload = {
        user_id: uidData.data._id,  
        room_id: roomData.data._id,  
        date,
        start_time: startTime,
        end_time: endTime,
        reason,
        user_email : user.email,
        user_name : user.name,
        room_name : roomData.data.room_name
      };
  
      console.log("Payload:", payload);
  
      const response = await axios.post("https://room-booking-app-backend.onrender.com/api/reserve-room", payload);
      if (response.data.success) {
        alert("Reservation Application Successfull. An email has been sent for confirmation.");
      } else {
        alert("Reservation failed. Please try again.");
      }
    } catch (error) {
      setError("Error submitting reservation: " + error.message);
    } finally {
      setLoading(false);
      setIsReviewModalVisible(false);
    }
  };

  const handleModalCancel = () => {
    setIsReviewModalVisible(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="flex">
        <div className="w-1/3 pr-6 mr-8">
          {steps.map((label, index) => (
            <div key={index} className="relative mb-8">
              <div className="flex items-center mb-2">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-bold ${
                    completedSteps.includes(index)
                      ? "bg-green-500"
                      : index === activeStep
                      ? "bg-blue-500"
                      : "bg-gray-300"
                  }`}
                >
                  {completedSteps.includes(index) ? (
                    <CheckIcon height={"100px"} width={"25px"} />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="ml-4">
                  <div className="flex flex-col">
                    <div className="text-xs font-semibold text-gray-600">STEP {index + 1}</div>
                    <div className="font-bold text-black">{label}</div>
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className="absolute left-5 top-10 w-0.5 h-12"
                  style={{
                    backgroundColor: index < activeStep ? "#10B981" : "#D1D5DB",
                    transition: "background-color 0.3s ease",
                  }}
                ></div>
              )}
            </div>
          ))}
        </div>
        <div className="w-2/3">
          <div>
            {activeStep === 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Select Date and Time</h3>
                {error && <div className="text-red-500 mb-4">{error}</div>}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? dateFnsFormat(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>

                <div className="mt-4 flex flex-col gap-4 justify-center">
                  <div>
                    Select Start Time:{" "}
                    <TimePicker
                      onChange={(e) => setStartTime(dayjs(e).format(timeFormat))}
                      value={dayjs(startTime, timeFormat)}
                      format={timeFormat}
                    />
                  </div>
                  <div>
                    Select End Time:{" "}
                    <TimePicker
                      onChange={(e) => setEndTime(dayjs(e).format(timeFormat))}
                      value={dayjs(endTime, timeFormat)}
                      format={timeFormat}
                    />
                  </div>
                </div>
              </div>
            )}
            {activeStep === 1 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Select Class</h3>
                {loading ? (
                  <div className='flex justify-center items-center'>
                  <LoadingComponent />
                </div>
                ) : (
                  <select
                    className="w-full p-2 border rounded-md"
                    value={selectedRoom}
                    onChange={(e) => {setSelectedRoom(e.target.value)}}>
                    <option value="">Select a room</option>
                    {rooms.map((room) => (
                      <option key={room._id} value={room.room_name}>
                        {room.room_name}
                      </option>
                    ))}
                  </select>
                )}
                {error && <div className="text-red-500 mb-4">{error}</div>}
              </div>
            )}
            {activeStep === 2 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Reason</h3>
                <textarea
                  className="w-full p-2 border rounded-md"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe the reason for booking the room"
                />
                {error && <div className="text-red-500 mb-4">{error}</div>}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between">
            <Button onClick={handlePrev} disabled={activeStep === 0}>
              Previous
            </Button>

            {activeStep < steps.length - 1 && (
              <Button onClick={handleNext}>
                Next
              </Button>
            )}
            {activeStep === steps.length - 1 && (
              <Button onClick={handleReviewForm}>
                Review
              </Button>
            )}
          </div>
        </div>
      </div>

      <Modal
        title="Review Reservation"
        open={isReviewModalVisible}
        onOk={handleSubmit}
        onCancel={handleModalCancel}
        okText="Submit"
        okButtonProps={{disabled:loading,loading}}
        cancelText="Edit"
      >
        <div>
          <h4>Name:</h4>
          <input value={user?.name} disabled className="w-full p-2 border rounded-md" />
          <h4>Email:</h4>
          <input value={user?.email} disabled className="w-full p-2 border rounded-md" />
          <h4>Room:</h4>
          <input value={selectedRoom} disabled className="w-full p-2 border rounded-md" />
          <h4>Date:</h4>
          <input value={date ? dateFnsFormat(date, "PPP") : "Invalid date"} disabled className="w-full p-2 border rounded-md" />
          <h4>Start Time:</h4>
          <input value={startTime || "Invalid start time"} disabled className="w-full p-2 border rounded-md" />
          <h4>End Time:</h4>
          <input value={endTime || "Invalid end time"} disabled className="w-full p-2 border rounded-md" />
          <h4>Reason:</h4>
          <input value={reason} disabled className="w-full p-2 border rounded-md" />
        </div>
      </Modal>
    </div>
  );
};

export default StudentBookClass;
