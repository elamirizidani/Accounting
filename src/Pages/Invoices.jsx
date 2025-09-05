import React, { useState } from 'react';
import { Nav, Spinner } from 'react-bootstrap';
import moment from 'moment';
import AddInvoice from '../Components/Invoice/AddInvoice';
import { useInvoiceStore } from '../store/invoiceStore';
import ViewInvoice from '../Components/Invoice/ViewInvoice';

const Invoices = () => {
  const [showModal, setShowModal] = useState(false);
  const {loadingInvoice,totalInvoice,
    invoices,
    paidInvoice,
    overdueInvoice,
    partiallyPaidInvoice,
    unpaidInvoice,
    sentInvoice,
    draftInvoice,
    allInvoiceData,
    totalAmountExceptDraft,
    totalPaidAmount
  } = useInvoiceStore()

  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState({});
  const [showViewModal, setShowViewModal] = useState(false);


const filteredInvoices = invoices?.filter(invoice => {
  if (!invoice) return false;
  
  const status = (invoice.status || '').toLowerCase();
  const customer = (invoice.customer || '').toLowerCase();
  const id = (invoice.id || '').toLowerCase();
  const currentSearch = searchTerm.toLowerCase();
  
  const matchesTab = activeTab === 'All' || 
                    status === activeTab.toLowerCase() ||
                    (activeTab === 'Partially Paid' && status === 'partially paid');
  
  const matchesSearch = searchTerm === '' || 
                       customer.includes(currentSearch) ||
                       id.includes(currentSearch);
  
  return matchesTab && matchesSearch;
});

const totalPages = Math.ceil(filteredInvoices?.length / entriesPerPage);
const startIndex = (currentPage - 1) * entriesPerPage;
const paginatedInvoices = filteredInvoices?.slice(startIndex, startIndex + entriesPerPage);


const handleView = (invoice) => {
  setSelectedInvoice(invoice);
  setShowViewModal(true);
};


const getStatusBadge = (status) => {
  const statusClasses = {
    'Paid': 'badge bg-success',
    'Overdue': 'badge bg-danger',
    'Partially Paid': 'badge bg-info',
    'Unpaid': 'badge bg-warning text-dark',
    'sent': 'badge bg-warning text-dark',
    'Draft': 'badge bg-secondary'
  };
  return statusClasses[status] || 'badge bg-secondary';
};

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 fw-bold">Invoices</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
            <i className="bi bi-download"></i>
            Export
          </button>
          <button onClick={() => setShowModal(true)} className="btn btn-primary d-flex align-items-center gap-2">
            <i className="bi bi-plus-circle"></i>
            New Invoice
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">

        <div className="col-md-3 mb-3">
          <div className="card h-100 stats-card border-1">
            <div className="card-body pb-2">
              <div className=' d-flex justify-content-between align-items-center'>
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Total Invoices</h6>
                  <h3 className="card-title mb-1 fw-bold">{totalInvoice}</h3>
                </div>
                <div className="bg-primary rounded-circle card-icon-container">
                  <i className="bi bi-file-text text-white fs-5"></i>
                </div>
              </div>
              <hr className="vertical-line"/>
              <small className="text-success">
                  <i className="bi bi-arrow-up"></i> 5.62% from last month
              </small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card h-100 stats-card border-1">
            <div className="card-body pb-2">
              <div className=' d-flex justify-content-between align-items-center'>
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Total Amount</h6>
                  <h3 className="card-title mb-1 fw-bold">{totalAmountExceptDraft.toLocaleString() || 0}</h3>
                </div>
                <div className="bg-success rounded-circle card-icon-container">
                  <i className="bi bi-check-circle text-white fs-5"></i>
                </div>
              </div>
              <hr className="vertical-line"/>
              <small className="text-success">
                  <i className="bi bi-arrow-up"></i>
                  {
                    Number(allInvoiceData?.monthlyStatusChanges?.paid || 0)/100
                  } from last month
              </small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card h-100 stats-card border-1">
            <div className="card-body pb-2">
              <div className=' d-flex justify-content-between align-items-center'>
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Paid Amount</h6>
                  <h3 className="card-title mb-1 fw-bold">{totalPaidAmount.toLocaleString() || 0}</h3>
                </div>
                <div className="bg-warning rounded-circle card-icon-container">
                  <i className="bi bi-clock text-white fs-5"></i>
                </div>
              </div>
              <hr className="vertical-line"/>
              <small className="text-success">
                  <i className="bi bi-arrow-up"></i> 
                  {
                    Number(allInvoiceData?.monthlyStatusChanges?.npaid || 0)/100
                  } from last month
              </small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card h-100 stats-card border-1">
            <div className="card-body pb-2">
              <div className=' d-flex justify-content-between align-items-center'>
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Overdue Amount/Invoices</h6>
                  <h3 className="card-title mb-1 fw-bold">{overdueInvoice || 0}</h3>
                </div>
                <div className="bg-danger rounded-circle card-icon-container">
                  <i className="bi bi-exclamation-circle text-white fs-5"></i>
                </div>
              </div>
              <hr className="vertical-line"/>
              <small className="text-success">
                  <i className="bi bi-arrow-up"></i> 5.62% from last month
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {/* Tabs */}
          <ul className="nav nav-tabs border-0 mb-4">
            {['All', 'Paid', 'Overdue', 'Upcoming', 'Partially Paid', 'Unpaid', 'Draft'].map(tab => (
              <li className="nav-item" key={tab}>
                <button
                  className={`nav-link ${activeTab === tab ? 'active border-bottom border-primary border-2 text-primary' : 'text-muted'} border-0`}
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentPage(1);
                  }}
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>

          {/* Search and Filter Bar */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex gap-2 justify-content-end">
                <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
                  <i className="bi bi-calendar3"></i>
                  18 Jun 25 - 18 Jun 25
                </button>
                <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
                  <i className="bi bi-funnel"></i>
                  Filter
                </button>
              </div>
            </div>
          </div>
{
                 loadingInvoice?
                  <Spinner/>
                  :
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>
                    <input type="checkbox" className="form-check-input" />
                  </th>
                  <th>NO</th>
                  <th>Customer</th>
                  <th>Created On</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  {/* <th>Paid</th> */}
                  <th>Status</th>
                  <th>Payment Mode</th>
                  <th></th>
                </tr>
              </thead>
              
              <tbody>
                {
                paginatedInvoices?.map((invoice, index) => (
                  <tr key={index}>
                    <td>
                      <input type="checkbox" className="form-check-input" />
                    </td>
                    <td className="fw-medium">{invoice.invoiceNumber}</td>
                    <td>{invoice?.quotation?.billedTo?.name}</td>
                    <td className="text-muted">{moment(invoice.invoiceDate).format('DD MMM YYYY')}</td>
                    <td className="fw-medium">{Number(invoice.totalAmount).toLocaleString()}  {invoice?.quotation?.currency}</td>
                    <td className="text-muted">{moment(invoice.dueDate).format('DD MMM YYYY')}</td>
                    {/* <td className="text-muted">{invoice.paid}</td> */}
                    <td>
                      <span className={getStatusBadge(invoice.status)} style={{textTransform:'capitalize'}}>
                        {invoice.status}
                        {invoice.status === 'Paid' && <i className="bi bi-check-circle ms-1"></i>}
                        {invoice.status === 'Overdue' && <i className="bi bi-exclamation-triangle ms-1"></i>}
                        {invoice.status === 'Partially Paid' && <i className="bi bi-hourglass-split ms-1"></i>}
                        {invoice.status === 'Unpaid' && <i className="bi bi-clock ms-1"></i>}
                        {invoice.status === 'Draft' && <i className="bi bi-file-text ms-1"></i>}
                      </span>
                    </td>
                    <td style={{textTransform:'capitalize'}}>{invoice.paymentMethod}</td>
                    <td>
                      <button 
                        popoverTarget={`export-${index}`} 
                        id={`exportBtn${invoice?._id}`}
                        type='button' 
                        className="btn btn-sm btn-link text-muted actions-btn information">
                          <i className="bi bi-three-dots"></i>
                        </button>
                      <div 
                        className='popoverInfo'
                        id={`export-${index}`} 
                        popover='auto' 
                        anchor={`exportBtn${invoice?._id}`}>
                        <Nav className="flex-column">
                            <Nav.Item
                            className='d-flex gap-2'
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(invoice);
                            }}>
                                <i class="bi bi-eye"></i>
                                <span>View</span>
                            </Nav.Item>
                            <Nav.Item className='d-flex gap-2' onClick={(e) => {
                                e.stopPropagation();
                                // exportQuotation(invoice);
                            }}>
                                <i class="bi bi-printer"></i>
                                <span>Print</span>
                            </Nav.Item>
                            <Nav.Item className='d-flex gap-2' onClick={(e) => {
                                e.stopPropagation();
                                // handleEdit(invoice);
                            }}>
                                <i class="bi bi-pencil-square"></i>
                                <span>Edit</span>
                            </Nav.Item>
                            <Nav.Item className='d-flex gap-2' onClick={(e) => {
                                e.stopPropagation();
                                // deleteQuotation(invoice?._id);
                            }}>
                                <i class="bi bi-trash3"></i>
                                <span>Delete</span>
                            </Nav.Item>
                            {/* <Nav.Item className='d-flex gap-2' onClick={(e) => {
                                e.stopPropagation();
                                // handleChangeToInvoice(invoice);
                            }}>
                                <i class="bi bi-receipt"></i>
                                <span>Convert to Invoice</span>
                            </Nav.Item> */}
                        </Nav>
                      </div>
                    </td>
                  </tr>
                ))
                }
              </tbody>
            </table>
          </div>
}

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-4">
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted">Row Per Page</span>
              <select 
                className="form-select form-select-sm" 
                style={{ width: 'auto' }}
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(parseInt(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-muted">Entries</span>
            </div>
            
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                </li>
                
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
      <AddInvoice
        show={showModal} 
        handleClose={() => setShowModal(false)} 
        invoice={{}}
        />
      <ViewInvoice
        show={showViewModal}
        handleClose={() => setShowViewModal(false)}
        invoice={selectedInvoice}
      />
    </div>
  );
};

export default Invoices;