import React, { useEffect, useState } from 'react'
import QuotationModal from '../Components/Proforma/QuotationModal'
import { Nav } from 'react-bootstrap';
import ViewQuatation from '../Components/Proforma/ViewQuatation';
import ToInvoice from '../Components/Proforma/ToInvoice';
import { useClientsStore } from '../store/clientsStore';


function Clients() {
    const [showModal, setShowModal] = useState(false);
    const [showChangeToInvoice, setShowChangeToInvoice] = useState(false);
    // Fixed: Combined duplicate state variables
    const [selectedQuotation, setSelectedQuotation] = useState({});
    const [showViewModal, setShowViewModal] = useState(false);
    const {clients} = useClientsStore()
   
    const handleView = (proforma) => {
        setSelectedQuotation(proforma);
        setShowViewModal(true);
    };

    return (
        <>
            {/* Filter Offcanvas */}
            <div className="offcanvas offcanvas-end" tabIndex="-1" id="filterOffcanvas" aria-labelledby="filterOffcanvasLabel">
                <div className="offcanvas-header">
                    <h5 className="fw-bold mb-0" id="filterOffcanvasLabel">Filter</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div className="offcanvas-body">
                    <form id="proformaFilterForm">
                        <div className="mb-4">
                            <label className="form-label">Customers</label>
                            <select className="form-select" id="filterCustomer">
                                <option value="">Select</option>
                                <option value="Bank Of Kigali">Bank Of Kigali</option>
                                <option value="KCB Bank">KCB Bank</option>
                                <option value="Equity Bank">Equity Bank</option>
                                <option value="Cogebanque">Cogebanque</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="form-label">Date Range</label>
                            <div className="input-group">
                                <input type="text" className="form-control" id="filterDateRange" placeholder="06/12/2025 - 06/18/2025" />
                                <span className="input-group-text"><i className="bi bi-calendar"></i></span>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="form-label">Quotation Id</label>
                            <select className="form-select" id="filterQuotation">
                                <option value="">Select</option>
                                <option value="QU0014">QU0014</option>
                                <option value="QU0015">QU0015</option>
                                <option value="QU0016">QU0016</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="form-label">Status</label>
                            <select className="form-select" id="filterStatus">
                                <option value="">Select</option>
                                <option value="Accepted">Accepted</option>
                                <option value="Pending">Pending</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                        <div className="d-flex gap-3 pt-3">
                            <button type="button" id="resetFilter" className="btn btn-outline-secondary w-50">Reset</button>
                            <button type="submit" className="btn btn-primary w-50">Submit</button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Main Content */}
            <div className="content-area">
                <div className="containa">
                    <div className="header main-header">
                        <h2>Companies</h2>
                        <div className="header-actions">
                            
                            <button className="btn btn-primary">
                                <i className="bi bi-plus-circle"></i>
                                New Company
                            </button>
                        </div>
                    </div>

                    <div className="controls">
                        <div className="search-container">
                            <div className="search-icon"><i className="bi bi-search"></i></div>
                            <input type="text" className="search-input" id="searchInput" placeholder="Search"/>
                        </div>
                        <div className="filter-controls">
                            <div className="dropdown" id="dateDropdown">
                                <button className="btn calenda-bt" id="toggleDropdown">
                                    <i className="bi bi-calendar4-week"></i> 
                                    <span>16 Jun 25 - 16 Jun 25</span>
                                </button>
                                <div className="dropdown-content">
                                    <i className="bi bi-caret-up-fill"></i>
                                    <a href="#">Today</a>
                                    <a href="#">Yesterday</a>
                                    <a href="#">Last 7 Days</a>
                                    <a href="#">Last 30 Days</a>
                                    <a href="#">This Month</a>
                                    <a href="#">Last Month</a>
                                    <a href="#">Custom Range</a>
                                </div>
                            </div>
                            <button className="filter-btn" data-bs-toggle="offcanvas" data-bs-target="#filterOffcanvas">
                                <i className="bi bi-funnel"></i>
                                Filter
                            </button>
                        </div>
                    </div>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th><input className="form-check-input" type="checkbox" id="select-all"/></th>
                                    <th>Client ID</th>
                                    <th>Client</th>
                                    <th>Client</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Total Revenue</th>
                                    <th>Outstanding Invoice</th>
                                    <th>Service Taken</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody id="tableBody">
                                {clients?.map((client, i) => {
                                    return (
                                        <tr key={clients._id || i}>
                                            <td><input className="form-check-input row-checkbox" type="checkbox"/></td>
                                            <td>{client?.customerCode}</td>
                                            <td>{client?.name}</td>
                                            <td>{client?.name}</td>
                                            <td>{client?.phone}</td>
                                            <td>{client?.email}</td>
                                            <td>{Number(client?.summary?.totalIncome || 0).toLocaleString()}</td>
                                            <td>{client?.summary?.totalInvoices}</td>
                                            
                                            <td>
                                                <button 
                                                    popoverTarget={`export-${i}`} 
                                                    id={`exportBtn${client?._id}`}
                                                    type='button' 
                                                    className="btn btn-sm btn-link text-muted actions-btn information">
                                                      <i className="bi bi-three-dots"></i></button>
                                                <div 
                                                    className='popoverInfo'
                                                    id={`export-${i}`} 
                                                    popover='auto' 
                                                    anchor={`exportBtn${client?._id}`}>
                                                    <Nav className="flex-column">
                                                        <Nav.Item
                                                        className='d-flex gap-2'
                                                         onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleView(client);
                                                        }}>
                                                            <i class="bi bi-eye"></i>
                                                            <span>View</span>
                                                        </Nav.Item>
                                                    </Nav>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="pagination">
                        <div className="pagination-info">
                            <span>Row Per Page</span>
                            <select className="pagination-select" id="rowsPerPage">
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                            </select>
                            <span>Entries</span>
                        </div>
                        <div className="pagination-nav">
                            <button className="pagination-btn" id="prevPage" disabled>‹</button>
                            <span id="pageNumbers"></span>
                            <button className="pagination-btn" id="nextPage">›</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <QuotationModal 
                show={showModal} 
                handleClose={() => setShowModal(false)} 
                quotation={selectedQuotation}
            />
            <ToInvoice
                show={showChangeToInvoice} 
                handleClose={() => setShowChangeToInvoice(false)} 
                quotation={selectedQuotation}
                />

            <ViewQuatation
                show={showViewModal}
                handleClose={() => setShowViewModal(false)}
                quotation={selectedQuotation}
            />
        </>
    );
}

export default Clients;