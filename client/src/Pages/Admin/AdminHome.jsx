import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios';
import Table from '@/components/Table';
import { Input } from 'antd';
import LoadingComponent from '@/components/LoadingComponent';

const AdminHome = () => {

  const [pastReservations,setPastReservations] = useState([]);
  const [loading,setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(()=>{
    const fetchPastReservations = async ()=>{ 
        setLoading(true);
        try {
          const response = await axios.get('http://localhost:8000/api/past-reservations')
          if (response.data.success) {
            setPastReservations(response.data.data);
          }
        } catch (error) {
          console.error("Error : ",error);
        }
        finally{
          setLoading(false);
        }
    }
    fetchPastReservations();
  },[]);

  const columns = [
    // { name: 'Booking ID', selector: row => row._id || 'N/A', sortable: true },
    { name: 'Email', selector: row => row.user_email || 'N/A', sortable: true },
    { name: 'Name', selector: row => row.user_name || 'N/A', sortable: true },
    { name: 'Room Name', selector: row => row.room_name || 'N/A', sortable: true },
    { name: 'Date', selector: row => new Date(row.date).toLocaleDateString() || 'N/A', sortable: true },
    { name: 'Start Time', selector: row => row.start_time || 'N/A' },
    { name: 'End Time', selector: row => row.end_time || 'N/A' },
    { name: 'Reason', selector: row => row.reason || 'N/A' },
    { name: 'Status', selector: row => row.status || 'N/A' },
  ];

  const filteredReservations = useMemo(() => {
    return pastReservations
      .filter(reservation =>
        reservation.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.room_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => b._id.localeCompare(a._id)); // Sort by booking ID in descending order
  }, [pastReservations, searchTerm]);

  if (loading) {
    return <div className='flex justify-center items-center'>
            <LoadingComponent />
          </div>
  }

  return (
    <div className='container mx-auto px-4'>
      <h2 className='text-center text-3xl font-semibold mb-6 text-zinc-900'>
        Recent Bookings
      </h2>

      <Input
        placeholder="Search by email, name, or room name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 w-96 px-3 py-2"
      />

      {filteredReservations.length > 0 ? (
        <Table columns={columns} data={filteredReservations} itemsPerPage={10} />
      ) : (
        <p className="text-center text-lg text-gray-600">No past reservations found.</p>
      )}
    </div>
  )
}

export default AdminHome
