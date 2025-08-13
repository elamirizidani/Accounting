import React,{useState} from 'react';
import { Button, Nav } from 'react-bootstrap';
import siteLogo from '../assets/imgs/logo.svg'
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';


const SideBar = () => {
    const {logout,changeShowMenuLabel,showMenuLabel} = useAuthStore()
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  const menuItems = [
    { path: '/', icon: 'bi-speedometer2', label: 'Dashboard',isLink:true },
    { path: '/Proforma', icon: 'bi-file-earmark-text', label: 'Proforma',isLink:true },
    { path: '/Invoices', icon: 'bi-receipt', label: 'Invoices',isLink:true },
    { path: '/Transactions', icon: 'bi-arrow-left-right', label: 'Transactions',isLink:true },
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


  return (
      <div className={`sidebar ${showMenuLabel? 'p-3':'p-1'} `} id="sidebar" style={{ width: showMenuLabel ? '250px':'70px' }}>
        <div className="logo">
            <img src={siteLogo} alt=""/>
        </div>
        <Nav className="flex-column text-white" >
    
        {menuItems.map((item) => (
        <div key={item.path}>
          <Nav.Item>
            {
              item.isLink ?(
                <Nav.Link
                  {...(!showMenuLabel && location.pathname === item.path) && { style: { margin: 0 }}}
                  as={Link}
                  to={item.path}
                  active={location.pathname === item.path}
                  onClick={() => item.subMenu && toggleSubMenu(item.path)}
                  className="mb-2 d-flex justify-content-between align-items-center"
                >
                  <div>
                    <i className={`bi ${item.icon} me-2`}></i>
                    {showMenuLabel && item.label}
                  </div>
                  {item.subMenu && (
                    <i className={`bi bi-chevron-${openMenus[item.path] ? 'up' : 'down'}`}></i>
                  )}
                </Nav.Link>
                ):(
                  <div
                    onClick={() => {
                        if (item.fnToCall) item.fnToCall();
                        if (item.subMenu) toggleSubMenu(item.path);
                    }}
                    className="nav-link mb-2 d-flex justify-content-between align-items-center"
                    style={{ cursor: 'pointer' }}
                  >
                    <div>
                        <i className={`bi ${item.icon} me-2`}></i>
                        {showMenuLabel && item.label}
                    </div>
                    {item.subMenu && (
                        <i className={`bi bi-chevron-${openMenus[item.path] ? 'up' : 'down'}`}></i>
                    )}
                </div>
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
    <div className="navbar-vertical-footer position-fixed">
      <button onClick={()=>changeShowMenuLabel()} className="btn navbar-vertical-toggle border-0 fw-semibold w-100 white-space-nowrap d-flex align-items-center">
        {
          showMenuLabel ? <i class="bi bi-box-arrow-in-left"></i>:<i class="bi bi-box-arrow-in-right"></i>
        }
      {
        showMenuLabel && <span className="navbar-vertical-footer-text ms-2">Collapsed View</span>
      }
        
      </button>
    </div>
  </div>
  );
};

export default SideBar;







