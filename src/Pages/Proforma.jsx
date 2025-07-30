import React,{useEffect, useState} from 'react'
import QuotationModal from '../Components/Proforma/QuotationModal'
import { fetchData } from '../../utility/api';

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
                          <td>{proforma?._id}</td>
                          <td>{proforma?.billedTo?.name}</td>
                          <td>{proforma?.quotationDate}</td>
                          <td>
                              <span className="status-badge" style={{backgroundColor: `${statusColor}20`, color: statusColor}}>
                                  <span className="status-dot" style={{backgroundColor: statusColor}}></span>
                                  {proforma?.status}
                              </span>
                          </td>
                          <td><button className="actions-btn">⋯</button></td>
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
