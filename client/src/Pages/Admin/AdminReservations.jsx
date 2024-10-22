import React, { useEffect, useState } from 'react';
import { Modal, Button, Input, ConfigProvider,Spin } from 'antd';
import Table from '@/components/Table';
import LoadingComponent from '@/components/LoadingComponent';

const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingRejection,setLoadingRejection]= useState(false);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch('https://room-booking-app-backend.onrender.com/api/future-reservations');
        const data = await response.json();
        if (data.success) {
          setReservations(data.data.filter(res => res.status === 'approved'));
        }
      } catch (error) {
        console.error("Error fetching reservations: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  const handleStatusClick = (reservation) => {
    setSelectedReservation(reservation);
    setIsStatusModalVisible(true);
  };

  const handleStatusUpdate = async () => {
    if (!rejectReason.trim()) {
      Modal.warning({
        title: 'Warning',
        content: 'Please provide a reason for rejection.',
      });
      return;
    }
    setLoadingRejection(true);
    try {
      const response = await fetch('https://room-booking-app-backend.onrender.com/api/rejected-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservation_id: selectedReservation._id,
          reject_reason: rejectReason
        }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      // Remove the rejected reservation from the table and reset state
      setReservations(prev => prev.filter(res => res._id !== selectedReservation._id));
      setIsStatusModalVisible(false);
      setRejectReason('');
      Modal.success({
        title: 'Success',
        content: 'Reservation has been rejected successfully.',
      });
    } catch (error) {
      console.error("Error updating status: ", error);
      Modal.error({
        title: 'Error',
        content: 'Failed to reject the reservation.',
      });
    }
    finally{
      setLoadingRejection(false);
    }
  };

  const columns = [
    {
      name: 'Email',
      selector: row => row.user_email,
      sortable: true
    },
    {
      name: 'Name',
      selector: row => row.user_name,
      sortable: true
    },
    {
      name: 'Room Name',
      selector: row => row.room_name,
      sortable: true
    },
    {
      name: 'Date',
      selector: row => new Date(row.date).toLocaleDateString(),
      sortable: true
    },
    {
      name: 'Start Time',
      selector: row => row.start_time
    },
    {
      name: 'End Time',
      selector: row => row.end_time
    },
    {
      name: 'Reason',
      selector: row => row.reason
    },
    {
      name: 'Status',
      selector: row => row.status
    },
    {
      name: 'Actions',
      selector: row => (
        <Button 
          type="primary" 
          danger 
          onClick={() => handleStatusClick(row)}
          className="px-4 py-1 text-sm"
        >
          Reject
        </Button>
      )
    }
  ];

  const filteredReservations = reservations.filter(reservation =>
    reservation.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.room_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className='flex justify-center items-center'>
      <LoadingComponent />
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-center text-3xl font-semibold mb-6">
        Approved Reservations
      </h2>
      
      <Input
        placeholder="Search by email, name, or room name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 w-96 px-3 py-2"
      />

      {filteredReservations.length > 0 ? (
        <Table
          columns={columns}
          data={filteredReservations}
          itemsPerPage={10}
        />
      ) : (
        <p className="text-center text-lg text-gray-600">
          No approved reservations found.
        </p>
      )}

      <Modal
        title="Reject Reservation"
        open={isStatusModalVisible}
        onOk={handleStatusUpdate }
        onCancel={() => {
          setIsStatusModalVisible(false);
          setRejectReason('');
        }}
        okText={loadingRejection ? (
          <ConfigProvider theme={{
            components : {
              Spin : {
                colorPrimary : "#ffffff"
              }
            }
          }}>
            <Spin size='small'/> 
          </ConfigProvider>
        ) : "Reject"}
        okButtonProps={{ danger: true, disabled: loadingRejection , style:{backgroundColor:'red'}}}
        cancelButtonProps={{ disabled: loadingRejection }}

      >
        <Input.TextArea
          rows={4}
          placeholder="Reason for rejection"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default AdminReservations;
