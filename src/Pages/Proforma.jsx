import React, { useEffect, useState } from 'react'
import QuotationModal from '../Components/Proforma/QuotationModal'
import { deleteData, fetchData } from '../../utility/api';
import { Nav } from 'react-bootstrap';
import moment from 'moment';
import ViewQuatation from '../Components/Proforma/ViewQuatation';

function Proforma() {
    const [showModal, setShowModal] = useState(false);
    const [proformas, setProformas] = useState([]);
    // Fixed: Combined duplicate state variables
    const [selectedQuotation, setSelectedQuotation] = useState({});
    const [showViewModal, setShowViewModal] = useState(false);

    const readProforma = async () => {
        try {
            const res = await fetchData('quotation');
            setProformas(res || []);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        readProforma();
    }, []);

    const deleteQuotation = async (id) => {
        try {
            const res = await deleteData('quotation', id);
            if (res.status === 200) {
                alert(res.data.message);
                readProforma();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const exportQuotation = (quotation) => {
        if (!quotation || !quotation?.items) {
            alert('Quotation data is incomplete');
            return;
        }

        const printWindow = window.open('', '_blank');
        const subtotal = quotation?.items.reduce((sum, item) => sum + (item.total || 0), 0);
        const taxAmount = quotation?.enableTax ? subtotal * 0.18 : 0;
        const total = subtotal + taxAmount;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Quotation ${quotation?._id || 'N/A'}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .details { margin-bottom: 30px; overflow: hidden; }
                        .bill-section { width: 45%; display: inline-block; vertical-align: top; }
                        .bill-section.right { float: right; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f5f5f5; }
                        .total-section { text-align: right; font-weight: bold; }
                        .signature { margin-top: 50px; }
                        @media print { body { margin: 0; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>QUOTATION</h1>
                        <p>Quotation #: ${quotation?.quotationId || 'N/A'}</p>
                        <p>Date: ${quotation?.quotationDate ? new Date(quotation?.quotationDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    
                    <div class="details">
                        <div class="bill-section">
                            <h3>From:</h3>
                            <p><strong>${quotation?.billedBy?.name || 'N/A'}</strong></p>
                            <p>${quotation?.billedBy?.address || ''}</p>
                            <p>Phone: ${quotation?.billedBy?.phone || ''}</p>
                            <p>Email: ${quotation?.billedBy?.email || ''}</p>
                        </div>
                        <div class="bill-section right">
                            <h3>To:</h3>
                            <p><strong>${quotation?.billedTo?.name || 'N/A'}</strong></p>
                            <p>${quotation?.billedTo?.address || ''}</p>
                            <p>Phone: ${quotation?.billedTo?.phone || ''}</p>
                            <p>Email: ${quotation?.billedTo?.email || ''}</p>
                        </div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Service</th>
                                <th>Description</th>
                                <th>Qty</th>
                                <th>Unit Price</th>
                                <th>VAT</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${quotation?.items?.map(item => `
                                <tr>
                                    <td>${item?.service?.service || ''}</td>
                                    <td>${item.description || ''}</td>
                                    <td>${item.quantity || 0}</td>
                                    <td>${(item.unitCost || 0).toFixed(2)} ${quotation?.currency || 'USD'}</td>
                                    <td>${item.vat || 0}%</td>
                                    <td>${(item.total || 0).toFixed(2)} ${quotation?.currency || 'USD'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="total-section">
                        <p>Subtotal: ${subtotal.toFixed(2)} ${quotation?.currency || 'USD'}</p>
                        ${quotation?.enableTax ? `
                            <p>Tax (18%): ${taxAmount.toFixed(2)} ${quotation?.currency || 'USD'}</p>
                        ` : ''}
                        <p><strong>Total: ${total.toFixed(2)} ${quotation?.currency || 'USD'}</strong></p>
                    </div>
                    
                    ${quotation?.notes ? `
                        <div class="notes">
                            <h3>Notes:</h3>
                            <p>${quotation?.notes}</p>
                        </div>
                    ` : ''}
                    
                    <div class="signature">
                        <p>Authorized Signature</p>
                        <p>___________________________</p>
                    </div>
                    
                    <script>
                        setTimeout(() => {
                            window.print();
                            window.close();
                        }, 500);
                    </script>
                </body>
            </html>
        `);
    };

    const handleView = (proforma) => {
        setSelectedQuotation(proforma);
        setShowViewModal(true);
    };

    const handleEdit = (proforma={}) => {
        setSelectedQuotation(proforma);
        setShowModal(true);
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
                        <h2>Proforma</h2>
                        <div className="header-actions">
                            <button className="btn btn-secondary">
                                <i className="bi bi-upload"></i>
                                Export
                            </button>
                            <button onClick={() => handleEdit()} className="btn btn-primary">
                                <i className="bi bi-plus-circle"></i>
                                New Proforma
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
                                    <th>Proforma ID</th>
                                    {/* <th>Company</th> */}
                                    <th>Client</th>
                                    <th>Created On</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody id="tableBody">
                                {proformas?.map((proforma, i) => {
                                    const statusColor = proforma.status === 'Accepted' ? '#28a745' : 
                                                       proforma?.status === 'Pending' ? '#ffc107' : '#dc3545';
                                    return (
                                        <tr key={proforma._id || i}>
                                            <td><input className="form-check-input row-checkbox" type="checkbox"/></td>
                                            <td>{proforma?.quotationId}</td>
                                            {/* <td>{proforma?.billedBy?.name}</td> */}
                                            <td>{proforma?.billedTo?.name}</td>
                                            <td>{moment(proforma?.quotationDate).format('MMM D, YYYY')}</td>
                                            <td>
                                                <span className="status-badge" style={{backgroundColor: `${statusColor}20`, color: statusColor}}>
                                                    <span className="status-dot" style={{backgroundColor: statusColor}}></span>
                                                    {proforma?.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button 
                                                    popoverTarget={`export-${i}`} 
                                                    id={`exportBtn${proforma?._id}`}
                                                    type='button' 
                                                    className="actions-btn information">⋯</button>
                                                <div 
                                                    className='popoverInfo'
                                                    id={`export-${i}`} 
                                                    popover='auto' 
                                                    anchor={`exportBtn${proforma?._id}`}>
                                                    <Nav className="flex-column">
                                                        <Nav.Item onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleView(proforma);
                                                        }}>
                                                            <span>View</span>
                                                        </Nav.Item>
                                                        <Nav.Item onClick={(e) => {
                                                            e.stopPropagation();
                                                            exportQuotation(proforma);
                                                        }}>
                                                            <span>Print</span>
                                                        </Nav.Item>
                                                        <Nav.Item onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(proforma);
                                                        }}>
                                                            <span>Edit</span>
                                                        </Nav.Item>
                                                        <Nav.Item onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteQuotation(proforma?._id);
                                                        }}>
                                                            <span>Delete</span>
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

            <ViewQuatation
                show={showViewModal}
                handleClose={() => setShowViewModal(false)}
                quotation={selectedQuotation}
            />
        </>
    );
}

export default Proforma;