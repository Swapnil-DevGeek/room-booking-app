import StudentBookClass from "@/Pages/Student/StudentBookClass";
import StudentHome from "@/Pages/Student/StudentHome";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import React, { useState } from "react";
import AdminHome from "@/Pages/Admin/AdminHome";
import AdminReservations from "@/Pages/Admin/AdminReservations";
import AdminApplications from "@/Pages/Admin/AdminApplications";
import AdminRejected from "@/Pages/Admin/AdminRejected";
import AdminManageClassrooms from "@/Pages/Admin/AdminManageClassrooms";

// Main dashboard layout component
function DashboardLayout({user,role}) {
  const [activePage, setActivePage] = useState("Home");
  
  const sidebarOptions= role==="student"  
          ? ['Home','Book Class'] 
          : ['Home','Reservations','Applications','Rejected','Manage Classrooms'] ;

    const renderContent = () => {
    switch (activePage) {
      case "Home":
        return role==="student" ? <StudentHome user={user}/> : <AdminHome/>
      case "Book Class":
        return <StudentBookClass user={user}/>;
      case "Reservations":
        return <AdminReservations />
      case "Applications" : 
        return <AdminApplications />
      case "Rejected" : 
        return <AdminRejected />
      case "Manage Classrooms" : 
        return <AdminManageClassrooms />
      default:
        return role==="student" ? <StudentHome user={user}/> : <AdminHome/>
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Navbar user={user}/>
      <div className="flex flex-1">
        <Sidebar 
          sidebarOptions={sidebarOptions} 
          activePage={activePage} 
          onSelect={setActivePage} 
          className="w-64"
        />
        <main className="flex-1 bg-white p-8">
            {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
