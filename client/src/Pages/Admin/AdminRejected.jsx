import React, { useEffect, useState } from 'react';
import { Modal, Input, Spin, ConfigProvider } from 'antd';
import Table from '@/components/Table';
import { Button } from '@/components/ui/button';
import LoadingComponent from '@/components/LoadingComponent';

const AdminRejected = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);
  const [isLoadingApproval, setIsLoadingApproval] = useState(false);
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/future-reservations');
        const data = await response.json();
        if (data.success) {
          const rejectedReservations = data.data.filter(res => res.status === 'rejected');
          setReservations(rejectedReservations);
          
          const reasonPromises = rejectedReservations.map(async (reservation) => {
            try {
              const reasonResponse = await fetch(`http://localhost:8000/api/rejected/${reservation._id}`);
              const reasonData = await reasonResponse.json();
              if (reasonData.success && reasonData.data.length > 0) {
                setRejectionReasons(prev => ({
                  ...prev,
                  [reservation._id]: reasonData.data[0].reject_reason
                }));
              }
            } catch (error) {
              console.error(`Error fetching rejection reason for ${reservation._id}:`, error);
            }
          });

          await Promise.all(reasonPromises);
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

  const handleApproveClick = (reservation) => {
    setSelectedReservation(reservation);
    setIsApproveModalVisible(true);
  };

  const handleApproveConfirm = async () => {
    setIsLoadingApproval(true);
    try {
      const response = await fetch('http://localhost:8000/api/approve-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservation_id: selectedReservation._id
        }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      setReservations(prev => prev.filter(res => res._id !== selectedReservation._id));
      setRejectionReasons(prev => {
        const newReasons = { ...prev };
        delete newReasons[selectedReservation._id];
        return newReasons;
      });
      setIsApproveModalVisible(false);

      Modal.success({
        title: 'Success',
        content: 'Reservation has been approved successfully.',
      });
    } catch (error) {
      console.error("Error updating status: ", error);
      Modal.error({
        title: 'Error',
        content: 'Failed to approve reservation.',
      });
    } finally {
      setIsLoadingApproval(false);
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
      name: 'Reject Reason',
      selector: row => rejectionReasons[row._id] || 'Loading...',
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
          className="px-4 py-1 text-sm bg-green-500 hover:bg-green-600"
          onClick={() => handleApproveClick(row)}
        >
          Approve
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
        Rejected Reservations
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
          className="w-full"
        />
      ) : (
        <p className="text-center text-lg text-gray-600">
          No rejected reservations found.
        </p>
      )}

      <Modal
        title="Approve Reservation"
        open={isApproveModalVisible}
        onOk={handleApproveConfirm}
        onCancel={() => setIsApproveModalVisible(false)}
        okText={isLoadingApproval ? (
          <ConfigProvider theme={{
            components : {
              Spin : {
                colorPrimary : "#ffffff"
              }
            }
          }}>
            <Spin size='small'/> 
          </ConfigProvider>
        ) : "Approve"}
        okButtonProps={{
          style: { backgroundColor: '#10B981', borderColor: '#10B981' },
          disabled: isLoadingApproval,
        }}
        cancelButtonProps={{ disabled: isLoadingApproval }}
      >
        <p>Are you sure you want to approve this reservation?</p>
        {selectedReservation && (
          <div className="mt-4 bg-gray-50 p-4 rounded">
            <p><strong>Room:</strong> {selectedReservation.room_name}</p>
            <p><strong>Date:</strong> {new Date(selectedReservation.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {selectedReservation.start_time} - {selectedReservation.end_time}</p>
            <p><strong>Previously rejected for:</strong> {rejectionReasons[selectedReservation._id] || <LoadingComponent />}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminRejected;
