import React, { useState } from "react";
import { Container } from 'react-bootstrap';
import { Outlet } from "react-router-dom"; 
import SideBar from "./SideBar";
import { useAuthStore } from "../store/authStore";
import phoneLogo from '../assets/imgs/phoneLogo.png';

const MainLayout = () => {
  const { showMenuLabel } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={`app-shell ${showMenuLabel ? 'app-shell-expanded' : 'app-shell-collapsed'}`}>
      <SideBar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="site-body">
        <header className="mobile-appbar">
          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <i className="bi bi-list" />
          </button>
          <div className="mobile-appbar-brand">
            <img src={phoneLogo} alt="Symbolix" />
            <span>Symbolix</span>
          </div>
        </header>

        <Container fluid className="workspace-container">
          <Outlet />
        </Container>
      </div>
    </div>
  );
};

export default MainLayout;
