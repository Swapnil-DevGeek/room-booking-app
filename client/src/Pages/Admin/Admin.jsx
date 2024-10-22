import DashboardLayout from '@/components/DashboardLayout';
import LoadingComponent from '@/components/LoadingComponent';
import React from 'react'

const Admin = ({userDetails}) => {
  if (!userDetails) {
      return <div className='flex justify-center items-center'>
      <LoadingComponent />
    </div>
  }
  const user = userDetails._json;
  
  return (
    <div>
        <DashboardLayout user={user} role={"admin"}/>
    </div> 
  )
}

export default Admin
