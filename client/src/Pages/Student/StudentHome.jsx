import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Table from '@/components/Table';
import LoadingComponent from '@/components/LoadingComponent';

const StudentHome = ({ user }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const userResponse = await axios.get(`https://room-booking-app-backend.onrender.com/api/user/${user.email}`);
        const userData = userResponse.data;
        if (userData.success) {
          const userId = userData.data;
          const reservationsResponse = await axios.get(`https://room-booking-app-backend.onrender.com/api/reservations/student/${userId._id}`);
          const reservationData = reservationsResponse.data;
    
          if (reservationData.success) {
            const reservationsWithRoomNames = await Promise.all(
              reservationData.data.map(async (reservation) => {
                const roomResponse = await axios.get(`https://room-booking-app-backend.onrender.com/api/room/${reservation.room_id}`);
                const roomData = roomResponse.data;
                return {
                  bookingId: reservation._id,
                  date: new Date(reservation.date).toLocaleDateString(),
                  timestamp: new Date(reservation.date), 
                  startTime: reservation.start_time,
                  endTime: reservation.end_time || 'N/A',
                  room_name: roomData.success ? roomData.data.room_name : 'Unknown',
                  reason: reservation.reason || 'N/A',
                  status: reservation.status || 'N/A',
                };
              })
            );
            setReservations(reservationsWithRoomNames);
          }
        }
      } catch (error) {
        console.error("Error fetching reservations: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, [user.email]);

  const columns = [
    { 
      name: 'Booking ID', 
      selector: row => row.bookingId || 'N/A', 
      sortable: true,
      sortFunction: (a, b) => b.bookingId.localeCompare(a.bookingId)
    },
    { name: 'Date', selector: row => row.date || 'N/A', sortable: true },
    { name: 'Start Time', selector: row => row.startTime || 'N/A' },
    { name: 'End Time', selector: row => row.endTime || 'N/A' },
    { name: 'Room', selector: row => row.room_name || 'N/A' },
    { name: 'Reason', selector: row => row.reason || 'N/A' },
    { name: 'Status', selector: row => row.status || 'N/A' },
  ];

  const filteredReservations = useMemo(() => {
    return reservations
      .filter(reservation => {
        const matchesSearch = reservation.room_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter ? reservation.status === statusFilter : true;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => b.bookingId.localeCompare(a.bookingId)); // Sort by booking ID in descending order
  }, [reservations, searchQuery, statusFilter]);

  if (loading) {
    return <div className='flex justify-center items-center'>
    <LoadingComponent />
  </div>
  }

  return (
    <div className="container mx-auto px-4">
      <h2 className='text-center text-3xl font-semibold mb-6 text-zinc-900'>Your Booking Status</h2>
      
      <div className="mb-4 flex justify-between items-center">
        <div className="w-1/2">
          <input
            type="text"
            placeholder="Search by Room Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 w-full"
          />
        </div>
        <div className="w-1/3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 w-full"
          >
            <option value="">Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      
      {filteredReservations.length > 0 ? (
        <Table columns={columns} data={filteredReservations} itemsPerPage={10} />
      ) : (
        <p className="text-center text-lg text-gray-600">No reservations found.</p>
      )}
    </div>
  );
};

export default StudentHome;