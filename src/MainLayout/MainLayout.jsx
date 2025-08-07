import React from "react";
import { Container } from 'react-bootstrap';
import { Outlet } from "react-router-dom"; 
import SideBar from "./SideBar";

const MainLayout = () => {
    return (
<div className="d-flex">
      <SideBar />
      <div className="flex-grow-1">
        <Container fluid className="py-4">
          <Outlet/>
        </Container>
      </div>
    </div>
    );
};

export default MainLayout;
