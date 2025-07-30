import React from "react";
// import { AuthProvider } from './AuthContext';
import { Container } from 'react-bootstrap';
import { Outlet } from "react-router-dom"; 
import SideBar from "./SideBar";
import TopBar from "./TopBar";


const MainLayout = () => {
    return (
<div className="d-flex">
      <SideBar />
      <div className="flex-grow-1">
        {/* <TopBar /> */}
        <Container fluid className="py-4">
          <Outlet/>
        </Container>
      </div>
    </div>

    );
};

export default MainLayout;
