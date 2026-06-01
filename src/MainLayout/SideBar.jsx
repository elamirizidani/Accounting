import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import siteLogo from '../assets/imgs/agencyLogo.png'
import phoneLogo from '../assets/imgs/phoneLogo.png'
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';


const SideBar = ({ mobileOpen = false, onCloseMobile }) => {
  const { logout, changeShowMenuLabel, showMenuLabel } = useAuthStore()
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  const menuItems = [
    { path: '/', icon: 'bi-speedometer2', label: 'Dashboard',isLink:true },
    { path: '/Clients', icon: 'bi-people', label: 'Clients',isLink:true },
    { path: '/Services', icon: 'bi-briefcase', label: 'Services',isLink:true },
    { path: '/Proforma', icon: 'bi-file-earmark-text', label: 'Proforma',isLink:true },
    { path: '/Lpo', icon: 'bi-file-earmark-break', label: 'LPO',isLink:true },
    { path: '/Invoices', icon: 'bi-receipt', label: 'Invoices',isLink:true },
    { path: '/Transactions', icon: 'bi-shield-check', label: 'Operations',isLink:true },
    { path: '/logout', icon: 'bi-door-closed', label: 'Logout',isLink:false,fnToCall:logout },
    // { path: '/', icon: 'bi-bar-chart', label: 'Reports',
    //     subMenu:[
    //         {path:'/Sales',label:'Sales Report'},
    //         {path:'/Users',label:'User Report'},
    //         {path:'/Activity',label:'Activity Log'},
    //     ]
    //  },
  ];


  const toggleSubMenu = (path) => {
    setOpenMenus((prev) => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const handleNavigate = () => {
    if (onCloseMobile) onCloseMobile();
  };

  const handleLogout = () => {
    logout();
    handleNavigate();
  };

  return (
    <>
      <button
        type="button"
        className={`sidebar-backdrop ${mobileOpen ? 'show' : ''}`}
        onClick={onCloseMobile}
        aria-label="Close navigation menu"
      />
      <aside
        className={`sidebar ${showMenuLabel ? 'sidebar--expanded' : 'sidebar--collapsed'} ${mobileOpen ? 'sidebar--mobile-open' : ''}`}
        id="sidebar"
        aria-label="Primary navigation"
      >
        <div className="logo">
          {
            showMenuLabel ?
            <img src={siteLogo} alt="Symbolix" />
            :
            <img src={phoneLogo} alt="Symbolix" />
          }
        </div>
        <Nav className="sidebar-nav flex-column">
    
        {menuItems.map((item) => (
        <div key={item.path}>
          <Nav.Item>
            {
              item.isLink ?(
                <Nav.Link
                  as={Link}
                  to={item.path}
                  active={location.pathname === item.path}
                  aria-label={!showMenuLabel ? item.label : undefined}
                  title={!showMenuLabel ? item.label : undefined}
                  onClick={() => {
                    if (item.subMenu) toggleSubMenu(item.path);
                    handleNavigate();
                  }}
                  className="sidebar-link"
                >
                  <span className="sidebar-link-content">
                    <i className={`bi ${item.icon}`}></i>
                    <span className="sidebar-link-label">{item.label}</span>
                  </span>
                  {item.subMenu && (
                    <i className={`bi bi-chevron-${openMenus[item.path] ? 'up' : 'down'}`}></i>
                  )}
                </Nav.Link>
                ):(
                  <button
                    type="button"
                    onClick={() => {
                        if (item.fnToCall) handleLogout();
                        if (item.subMenu) toggleSubMenu(item.path);
                    }}
                    aria-label={!showMenuLabel ? item.label : undefined}
                    title={!showMenuLabel ? item.label : undefined}
                    className="nav-link sidebar-link sidebar-action"
                  >
                    <span className="sidebar-link-content">
                      <i className={`bi ${item.icon}`}></i>
                      <span className="sidebar-link-label">{item.label}</span>
                    </span>
                    {item.subMenu && (
                        <i className={`bi bi-chevron-${openMenus[item.path] ? 'up' : 'down'}`}></i>
                    )}
                </button>
              )
            }
            
          </Nav.Item>

          {item.subMenu && openMenus[item.path] && (
            <Nav className="flex-column ms-4">
              {item.subMenu.map((sub) => (
                <Nav.Link
                  as={Link}
                  to={sub.path}
                  key={sub.path}
                  onClick={handleNavigate}
                  className={`sidebar-sub-link ${location.pathname === sub.path ? 'active fw-bold' : ''}`}
                >
                  {sub.label}
                </Nav.Link>
              ))}
            </Nav>
          )}
        </div>
      ))}

    </Nav>
    <div className="navbar-vertical-footer">
      <button onClick={()=>changeShowMenuLabel()} className="navbar-vertical-toggle" type="button">
        {
          showMenuLabel ? <i className="bi bi-box-arrow-in-left"></i>:<i className="bi bi-box-arrow-in-right"></i>
        }
      {
        showMenuLabel && <span className="navbar-vertical-footer-text ms-2">Collapsed View</span>
      }
        
      </button>
    </div>
  </aside>
  </>
  );
};

export default SideBar;




