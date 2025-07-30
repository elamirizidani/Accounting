import React from 'react';
import { Navbar, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
// import { useAuthStore } from '../store/authStore';

const TopBar = () => {
  // const { logout } = useContext(AuthContext);
//   const { adminLogout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    // adminLogout();
    navigate('/admin/login');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="md" className="mb-4 shadow">
      <div className="container-fluid">
        <Navbar.Brand href="/admin">Admin Dashboard</Navbar.Brand>
        <div className="d-flex">
          <Button variant="outline-light" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </Navbar>
  );
};

export default TopBar;