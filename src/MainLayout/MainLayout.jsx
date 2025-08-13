import React from "react";
import { Container } from 'react-bootstrap';
import { Outlet } from "react-router-dom"; 
import SideBar from "./SideBar";
import { useAuthStore } from "../store/authStore";

const MainLayout = () => {
  const {showMenuLabel} = useAuthStore()
    return (
<div className="d-flex justify-content-end">
      <SideBar />
      <div className="site-body" style={{ width: showMenuLabel ? 'calc(100% - 250px)' : 'calc(100% - 70px)' }}>
        <Container fluid className="py-4">
          <Outlet/>
        </Container>
      </div>
    </div>
    );
};

export default MainLayout;
