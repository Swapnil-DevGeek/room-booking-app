import React, { useEffect, useState } from 'react';
import { Modal, Input } from 'antd';
import Table from '@/components/Table';
import { Button } from '@/components/ui/button';
import { EditIcon, TrashIcon } from 'lucide-react';
import LoadingComponent from '@/components/LoadingComponent';

const AdminManageClassrooms = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredClassrooms, setFilteredClassrooms] = useState([]);
  const [searchRoomName, setSearchRoomName] = useState('');
  const [searchCapacity, setSearchCapacity] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomCapacity, setNewRoomCapacity] = useState('');
  const [capacity, setCapacity] = useState('');

  useEffect(() => {
    // Fetch classrooms from the API
    const fetchClassrooms = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/get-classrooms');
        const data = await response.json();
        if (data.success) {
          // Ensure each classroom has the required properties
          const formattedClassrooms = data.data.map(classroom => ({
            _id: classroom._id,
            room_name: classroom.room_name || '',
            capacity: classroom.capacity || 0
          }));
          setClassrooms(formattedClassrooms);
          setFilteredClassrooms(formattedClassrooms);
        }
      } catch (error) {
        console.error('Error fetching classrooms: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, []);

  // Filter classrooms based on search inputs
  useEffect(() => {
    const filtered = classrooms.filter(
      (classroom) =>
        (classroom.room_name || '').toLowerCase().includes(searchRoomName.toLowerCase()) &&
        (searchCapacity === '' || (classroom.capacity || '').toString() === searchCapacity)
    );
    setFilteredClassrooms(filtered);
  }, [searchRoomName, searchCapacity, classrooms]);

  const handleEditClick = (classroom) => {
    setSelectedClassroom(classroom);
    setRoomName(classroom.room_name || '');
    setCapacity(classroom.capacity || '');
    setIsEditModalVisible(true);
  };

  const handleDeleteClick = (classroom) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this classroom?',
      content: `Room Name: ${classroom.room_name || 'Unnamed Room'}`,
      onOk: async () => {
        try {
          const response = await fetch('http://localhost:8000/api/delete-classroom', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ classroom_id: classroom._id }),
          });

          if (!response.ok) throw new Error('Failed to delete classroom');

          setClassrooms(classrooms.filter((cls) => cls._id !== classroom._id));
        } catch (error) {
          console.error('Error deleting classroom: ', error);
          Modal.error({
            title: 'Error',
            content: 'Failed to delete classroom'
          });
        }
      },
    });
  };

  const handleEditSubmit = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/edit-classroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classroom_id: selectedClassroom._id,
          room_name: roomName,
          capacity: parseInt(capacity),
        }),
      });

      if (!response.ok) throw new Error('Failed to edit classroom');

      const updatedData = await response.json();
      
      setClassrooms(
        classrooms.map((cls) =>
          cls._id === selectedClassroom._id
            ? { 
                ...cls, 
                room_name: roomName, 
                capacity: parseInt(capacity) 
              }
            : cls
        )
      );
      setIsEditModalVisible(false);
    } catch (error) {
      console.error('Error editing classroom: ', error);
      Modal.error({
        title: 'Error',
        content: 'Failed to edit classroom'
      });
    }
  };

  const handleAddClassroom = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/add-classroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          room_name: newRoomName, 
          capacity: parseInt(newRoomCapacity) 
        }),
      });

      if (!response.ok) throw new Error('Failed to add classroom');

      const result = await response.json();
      
      // Ensure the new classroom has the required structure
      const newClassroom = {
        _id: result.data._id,
        room_name: result.data.room_name || newRoomName,
        capacity: result.data.capacity || parseInt(newRoomCapacity)
      };

      setClassrooms([...classrooms, newClassroom]);
      setIsAddModalVisible(false);
      setNewRoomName('');
      setNewRoomCapacity('');
    } catch (error) {
      console.error('Error adding classroom: ', error);
      Modal.error({
        title: 'Error',
        content: 'Failed to add classroom'
      });
    }
  };

  const columns = [
    {
      name: 'Room Name',
      selector: (row) => row.room_name || 'Unnamed Room',
      sortable: true,
    },
    {
      name: 'Capacity',
      selector: (row) => row.capacity || 0,
      sortable: true,
    },
    {
      name: 'Actions',
      selector: (row) => (
        <>
          <Button
            variant="primary"
            onClick={() => handleEditClick(row)}
            className="mr-8 bg-blue-500 text-white"
          >
            <EditIcon/> Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDeleteClick(row)}
          >
            <TrashIcon/> Delete
          </Button>
        </>
      ),
    },
  ];

  if (loading) {
    return <div className='flex justify-center items-center'>
    <LoadingComponent />
  </div>
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-semibold mb-4">Manage Classrooms</h2>

      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4">
          <Input
            placeholder="Search by Room Name"
            value={searchRoomName}
            onChange={(e) => setSearchRoomName(e.target.value)}
          />
          <Input
            placeholder="Search by Capacity"
            value={searchCapacity}
            onChange={(e) => setSearchCapacity(e.target.value)}
          />
        </div>
        <Button type="primary" onClick={() => setIsAddModalVisible(true)}>
          Add Classroom
        </Button>
      </div>

      <Table
        columns={columns}
        data={filteredClassrooms}
        itemsPerPage={10} 
      />

      {/* Edit Classroom Modal */}
      <Modal
        title="Edit Classroom"
        open={isEditModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Save"
        okButtonProps={{disabled:loading,loading}}
      >
        <Input
          placeholder="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Input
          placeholder="Capacity"
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />
      </Modal>

      {/* Add Classroom Modal */}
      <Modal
        title="Add Classroom"
        open={isAddModalVisible}
        onOk={handleAddClassroom}
        onCancel={() => setIsAddModalVisible(false)}
        okText="Add"
        okButtonProps={{disabled:loading,loading}}
      >
        <Input
          placeholder="Room Name"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Input
          placeholder="Capacity"
          type="number"
          value={newRoomCapacity}
          onChange={(e) => setNewRoomCapacity(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default AdminManageClassrooms;