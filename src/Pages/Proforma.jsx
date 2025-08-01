import React,{useEffect, useState} from 'react'
import QuotationModal from '../Components/Proforma/QuotationModal'
import { deleteData, fetchData } from '../../utility/api';
import { Nav } from 'react-bootstrap';
import moment from 'moment';

function Proforma() {
    const [showModal, setShowModal] = useState(false);
    const [proformas,setProformas] = useState([])

    const readProforma = async ()=>{
      try {
        const res = await fetchData('quotations')
        setProformas(res || [])
      } catch (error) {
        console.log(error)
      }
    }
    useEffect(()=>{
      readProforma()
    },[])

    const deleteQuotation = async (id)=>{
      try {
        const res = await deleteData('quotations',id)
        if(res.status === 200)
        {
          alert(res.data.message)
          readProforma()
        }
        
      } catch (error) {
        console.log(error)
      }
    }


const exportQuotation = (quotation) => {
        // Check if quotation data exists
        if (!quotation || !quotation.items) {
            alert('Quotation data is incomplete');
            return;
        }
        // Create a printable version of the quotation
        const printWindow = window.open('', '_blank');

        // Calculate totals safely
        const subtotal = quotation.items.reduce((sum, item) => sum + (item.total || 0), 0);
        const taxAmount = quotation.enableTax ? subtotal * 0.18 : 0;
        const total = subtotal + taxAmount;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Quotation ${quotation._id || 'N/A'}</title>
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
                        @media print {
                            body { margin: 0; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>QUOTATION</h1>
                        <p>Quotation #: ${quotation.quotationId || 'N/A'}</p>
                        <p>Date: ${quotation.quotationDate ? new Date(quotation.quotationDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    
                    <div class="details">
                        <div class="bill-section">
                            <h3>From:</h3>
                            <p><strong>${quotation.billedBy?.name || 'N/A'}</strong></p>
                            <p>${quotation.billedBy?.address || ''}</p>
                            <p>Phone: ${quotation.billedBy?.phone || ''}</p>
                            <p>Email: ${quotation.billedBy?.email || ''}</p>
                        </div>
                        <div class="bill-section right">
                            <h3>To:</h3>
                            <p><strong>${quotation.billedTo?.name || 'N/A'}</strong></p>
                            <p>${quotation.billedTo?.address || ''}</p>
                            <p>Phone: ${quotation.billedTo?.phone || ''}</p>
                            <p>Email: ${quotation.billedTo?.email || ''}</p>
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
                            ${quotation.items.map(item => `
                                <tr>
                                    <td>${item.service || ''}</td>
                                    <td>${item.description || ''}</td>
                                    <td>${item.quantity || 0}</td>
                                    <td>${(item.unitCost || 0).toFixed(2)} ${quotation.currency || 'USD'}</td>
                                    <td>${item.vat || 0}%</td>
                                    <td>${(item.total || 0).toFixed(2)} ${quotation.currency || 'USD'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="total-section">
                        <p>Subtotal: ${subtotal.toFixed(2)} ${quotation.currency || 'USD'}</p>
                        ${quotation.enableTax ? `
                            <p>Tax (18%): ${taxAmount.toFixed(2)} ${quotation.currency || 'USD'}</p>
                        ` : ''}
                        <p><strong>Total: ${total.toFixed(2)} ${quotation.currency || 'USD'}</strong></p>
                    </div>
                    
                    ${quotation.notes ? `
                        <div class="notes">
                            <h3>Notes:</h3>
                            <p>${quotation.notes}</p>
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

  return (
    <>
      <div class="offcanvas offcanvas-end" tabindex="-1" id="filterOffcanvas"
     aria-labelledby="filterOffcanvasLabel">
  <div class="offcanvas-header">
    <h5 class="fw-bold mb-0" id="filterOffcanvasLabel">Filter</h5>
    <button type="button" class="btn-close" data-bs-dismiss="offcanvas"
            aria-label="Close"></button>
  </div>

  <div class="offcanvas-body">
    <form id="proformaFilterForm">
      <div class="mb-4">
        <label class="form-label">Customers</label>
        <select class="form-select" id="filterCustomer">
          <option value="">Select</option>
          <option value="Bank Of Kigali">Bank Of Kigali</option>
          <option value="KCB Bank">KCB Bank</option>
          <option value="Equity Bank">Equity Bank</option>
          <option value="Cogebanque">Cogebanque</option>
        </select>
      </div>

      <div class="mb-4">
        <label class="form-label">Date Range</label>
        <div class="input-group">
          <input type="text" class="form-control" id="filterDateRange"
                 placeholder="06/12/2025 - 06/18/2025" />
          <span class="input-group-text"><i class="bi bi-calendar"></i></span>
        </div>
      </div>

      <div class="mb-4">
        <label class="form-label">Quotation Id</label>
        <select class="form-select" id="filterQuotation">
          <option value="">Select</option>
          <option value="QU0014">QU0014</option>
          <option value="QU0015">QU0015</option>
          <option value="QU0016">QU0016</option>
        </select>
      </div>

      <div class="mb-4">
        <label class="form-label">Status</label>
        <select class="form-select" id="filterStatus">
          <option value="">Select</option>
          <option value="Accepted">Accepted</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div class="d-flex gap-3 pt-3">
        <button type="button" id="resetFilter" class="btn btn-outline-secondary w-50">Reset</button>
        <button type="submit" class="btn btn-primary w-50">Submit</button>
      </div>
    </form>
  </div>
</div>

<div class="content-area">
    <div class="containa">
        <div class="header main-header">
            <h2>Proforma</h2>
            <div class="header-actions">
                <button class="btn btn-secondary">
                    <i class="bi bi-upload"></i>
                    Export
                </button>
                <button onClick={() => setShowModal(true)} class="btn btn-primary" data-page="./create-Proforma.html">
                    <i class="bi bi-plus-circle"></i>
                    New Proforma
                </button>
                <QuotationModal/>
            </div>
        </div>

        <div class="controls">
            <div class="search-container">
                <div class="search-icon"><i class="bi bi-search"></i></div>
                <input type="text" class="search-input" id="searchInput" placeholder="Search"/>
            </div>
            <div class="filter-controls">
                <div class="dropdown" id="dateDropdown">
                    <button class="btn calenda-bt" id="toggleDropdown">
                    <i class="bi bi-calendar4-week"></i> 
                    <span>16 Jun 25 - 16 Jun 25</span>
                    </button>
                     
                    <div class="dropdown-content">
                    <i class="bi bi-caret-up-fill "></i>
                    <a href="#">Today</a>
                    <a href="#">Yesterday</a>
                    <a href="#">Last 7 Days</a>
                    <a href="#">Last 30 Days</a>
                    <a href="#">This Month</a>
                    <a href="#">Last Month</a>
                    <a href="#">Custom Range</a>
                    </div>
                </div>
                <button class="filter-btn" data-bs-toggle="offcanvas" data-bs-target="#filterOffcanvas">
                    <i class="bi bi-funnel"></i>
                    Filter
                </button>
            </div>
        </div>

        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th><input class="form-check-input" type="checkbox" id="select-all"/></th>
                        <th>Proforma ID</th>
                        <th>Company</th>
                        <th>Client</th>
                        <th>Created On</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody id="tableBody">
                  {
                    proformas && proformas?.map((proforma,i)=>{
                      const statusColor = proforma.status === 'Accepted' ? '#28a745' : proforma?.status === 'Pending' ? '#ffc107' : '#dc3545';
                      return(
                        <tr key={i}>
                          <td><input className="form-check-input row-checkbox" type="checkbox"/></td>
                          <td>{proforma?.quotationId}</td>
                          <td>{proforma?.billedBy?.name}</td>
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
                                    e.stopPropagation(); // This prevents the event from bubbling up
                                    exportQuotation(proforma);
                                  }}>
                                    <span>Print</span>
                                  </Nav.Item>
                                  <Nav.Item>
                                    <span>Edit</span>
                                  </Nav.Item>
                                  <Nav.Item
                                    onClick={(e) => {
                                      e.stopPropagation(); // This prevents the event from bubbling up
                                      deleteQuotation(proforma?._id);
                                    }}
                                    >
                                    <span>Delete</span>
                                  </Nav.Item>
                                  
                                </Nav>
                                
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  }

                  
                </tbody>
            </table>
        </div>
        
        <div class="pagination">
            <div class="pagination-info">
                <span>Row Per Page</span>
                <select class="pagination-select" id="rowsPerPage">
                    <option value="5">5</option>
                    <option value="10" selected>10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                </select>
                <span>Entries</span>
            </div>
            <div class="pagination-nav">
                <button class="pagination-btn" id="prevPage" disabled>‹</button>
                <span id="pageNumbers"></span>
                <button class="pagination-btn" id="nextPage">›</button>
            </div>
        </div>
    </div>
</div>


<QuotationModal 
        show={showModal} 
        handleClose={() => setShowModal(false)} 
      />
    </>
  )
}

export default Proforma
