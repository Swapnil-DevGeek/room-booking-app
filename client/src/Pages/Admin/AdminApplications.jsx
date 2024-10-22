import React, { useEffect, useState } from 'react';
import { Modal, Button, Input, Select,ConfigProvider,Spin } from 'antd';
import Table from '@/components/Table';
import LoadingComponent from '@/components/LoadingComponent';

const { Option } = Select;

const AdminApplications = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingEditStatus,setLoadingEditStatus] = useState(false);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/future-reservations');
        const data = await response.json();
        if (data.success) {
          const rejectedReservations = data.data.filter(res => res.status === 'pending');
          setReservations(rejectedReservations);
          
        }
      } catch (error) {
        console.error("Error fetching reservations: ", error);
        Modal.error({
          title: 'Error',
          content: 'Failed to fetch reservations.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const handleStatusClick = (reservation) => {
    setSelectedReservation(reservation);
    setNewStatus(''); // Reset the status for each reservation
    setRejectReason('');
    setIsStatusModalVisible(true);
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      Modal.warning({
        title: 'Warning',
        content: 'Please select a status.',
      });
      return;
    }

    if (newStatus === 'rejected' && !rejectReason.trim()) {
      Modal.warning({
        title: 'Warning',
        content: 'Please provide a reason for rejection.',
      });
      return;
    }

    setLoadingEditStatus(true);

    try {
      if (newStatus === 'approved') {
        const response = await fetch('http://localhost:8000/api/approve-request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reservation_id: selectedReservation._id,
          }),
        });

        if (!response.ok) throw new Error('Failed to approve reservation');

      } else if (newStatus === 'rejected') {
        const response = await fetch('http://localhost:8000/api/rejected-request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reservation_id: selectedReservation._id,
            reject_reason: rejectReason,
          }),
        });

        if (!response.ok) throw new Error('Failed to reject reservation');
      }

      // Remove the updated reservation from the list
      setReservations(prev => prev.filter(res => res._id !== selectedReservation._id));
      setIsStatusModalVisible(false);
      setRejectReason('');
    } catch (error) {
      console.error("Error updating status: ", error);
      Modal.error({
        title: 'Error',
        content: `Failed to ${newStatus} the reservation.`,
      });
    }
    finally{
      setLoadingEditStatus(false);
    }
  };

  const columns = [
    // {
    //   name: 'Booking ID',
    //   selector: row => row._id,
    //   sortable: true
    // },
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
      name: 'Actions',
      selector: row => (
        <Button 
          type="primary" 
          variant='outline'
          onClick={() => handleStatusClick(row)}
          className="px-4 py-1 text-sm"
        >
          Edit Status
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
  </div>
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-center text-3xl font-semibold mb-6">
        Pending Reservations
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
          No pending reservations found.
        </p>
      )}

      <Modal
        title="Edit Reservation Status"
        open={isStatusModalVisible}
        onOk={handleStatusUpdate}
        onCancel={() => {
          setIsStatusModalVisible(false);
          setRejectReason('');
        }}
        okText={loadingEditStatus ? (
          <ConfigProvider theme={{
            components : {
              Spin : {
                colorPrimary : "#ffffff"
              }
            }
          }}>
            <Spin size='small'/> 
          </ConfigProvider>
        ) : "Update Status"}
        okButtonProps={{disabled:loadingEditStatus}}
        cancelButtonProps={{ disabled: loadingEditStatus }}
      >
        <Select
          value={newStatus || undefined}
          placeholder='Select Status'
          onChange={(value) => setNewStatus(value)}
          style={{ width: '100%' }}
        >
          <Option value="approved">Approve</Option>
          <Option value="rejected">Reject</Option>
        </Select>

        {newStatus === 'rejected' && (
          <Input.TextArea
            rows={4}
            placeholder="Reason for rejection"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="mt-4"
          />
        )}
      </Modal>
    </div>
  );
};

export default AdminApplications;
