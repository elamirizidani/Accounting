import React,{useState} from 'react';
import { Nav } from 'react-bootstrap';
import siteLogo from '../assets/imgs/logo.svg'
import { Link, useLocation } from 'react-router-dom';


const SideBar = () => {
    
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  const menuItems = [
    { path: '/', icon: 'bi-speedometer2', label: 'Dashboard' },
    { path: '/Proforma', icon: 'bi-file-earmark-text', label: 'Proforma' },
    { path: '/Invoices', icon: 'bi-receipt', label: 'Invoices' },
    { path: '/Transactions', icon: 'bi-arrow-left-right', label: 'Transactions' },
    { path: '/', icon: 'bi-bar-chart', label: 'Reports',
        subMenu:[
            {path:'/Sales',label:'Sales Report'},
            {path:'/Users',label:'User Report'},
            {path:'/Activity',label:'Activity Log'},
        ]
     },
  ];


  const toggleSubMenu = (path) => {
    setOpenMenus((prev) => ({
      ...prev,
      [path]: !prev[path]
    }));
  };


  return (
  <div className="sidebar" id="sidebar">
        <div className="logo">
            <img src={siteLogo} alt=""/>
        </div>
        <Nav className="flex-column text-white p-3" style={{ width: '250px',height:'100vh' }}>
    
        {menuItems.map((item) => (
        <div key={item.path}>
          <Nav.Item>
            <Nav.Link
              as={Link}
              to={item.path}
              active={location.pathname === item.path}
              onClick={() => item.subMenu && toggleSubMenu(item.path)}
              className="mb-2 d-flex justify-content-between align-items-center"
            >
              <div>
                <i className={`bi ${item.icon} me-2`}></i>
                {item.label}
              </div>
              {item.subMenu && (
                <i className={`bi bi-chevron-${openMenus[item.path] ? 'up' : 'down'}`}></i>
              )}
            </Nav.Link>
          </Nav.Item>

          {item.subMenu && openMenus[item.path] && (
            <Nav className="flex-column ms-4">
              {item.subMenu.map((sub) => (
                <Nav.Link
                  as={Link}
                  to={sub.path}
                  key={sub.path}
                  className={`mb-1 ${location.pathname === sub.path ? 'active fw-bold' : ''}`}
                >
                  {sub.label}
                </Nav.Link>
              ))}
            </Nav>
          )}
        </div>
      ))}

    </Nav>
    </div>
  );
};

export default SideBar;







