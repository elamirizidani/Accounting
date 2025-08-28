import React from 'react'
import { useInvoiceStore } from '../store/invoiceStore';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

function Home() {
    const {invoices} = useInvoiceStore()
    const {quotation} = useAuthStore()

  return (
    <>
    <div className="main-header">
            <h2>Dashboard</h2>
            <div className="header-actions">
                <button className="btn btn-create">Create New <i className="bi bi-chevron-down"></i></button>
                <button className="btn btn-export"><i className="bi bi-upload"></i> Export</button>

                 <div className="dropdown" id="dateDropdown">
                    <button className="btn calenda-bt" id="toggleDropdown">
                    <i className="bi bi-calendar4-week"></i> 
                    <span>16 Jun 25 - 16 Jun 25</span>
                    </button>
                     
                    <div className="dropdown-content">
                    <i className="bi bi-caret-up-fill "></i>
                    <a href="#">Today</a>
                    <a href="#">Yesterday</a>
                    <a href="#">Last 7 Days</a>
                    <a href="#">Last 30 Days</a>
                    <a href="#">This Month</a>
                    <a href="#">Last Month</a>
                    <a href="#">Custom Range</a>
                    </div>
                </div>
                
            </div>
        </div>
        
    <div className="content-area">
        
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-content d-flex justify-content-between">
                        <div className="price-sec">
                        <p className="stat-label">Amount Due</p>
                        <h3 className="stat-value">25,225,000</h3>
                        </div>
                        <div className="stat-icon purple">
                           <img src="./assets/image/1.svg" alt=""/> 
                        </div>
                    </div>
                        <div className="stat-change d-flex justify-content-center py-2"><span>
                            <img src="./assets/image/4.svg" alt=""/>
                             5.65%</span> from last month</div>
                    
                </div>
                <div className="stat-card">
                    <div className="stat-content d-flex justify-content-between">
                        <div className="price-sec">
                        <p className="stat-label">Customers</p>
                        <h3 className="stat-value">25,225,000</h3>
                        </div>
                        <div className="stat-icon green">
                           <i className="bi bi-clock"></i>
                        </div>
                    </div>
                        <div className="stat-change d-flex justify-content-center py-2"><span>
                            <img src="./assets/image/4.svg" alt=""/>
                             5.65%</span> from last month</div>
                    
                </div>
                <div className="stat-card">
                    <div className="stat-content d-flex justify-content-between">
                        <div className="price-sec">
                        <p className="stat-label">Invoices</p>
                        <h3 className="stat-value">25,225,000</h3>
                        </div>
                        <div className="stat-icon orange">
                           <img src="./assets/image/4.svg" alt=""/>
                        </div>
                    </div>
                        <div className="stat-change d-flex justify-content-center py-2"><span>
                            <img src="./assets/image/4.svg" alt=""/>
                             5.65%</span> from last month</div>
                    
                </div>
                <div className="stat-card">
                    <div className="stat-content d-flex justify-content-between">
                        <div className="price-sec">
                        <p className="stat-label">Revenue</p>
                        <h3 className="stat-value">200</h3>
                        </div>
                        <div className="stat-icon blue">
                           <img src="./assets/image/4.svg" alt=""/>
                        </div>
                    </div>
                    <div className="stat-change d-flex justify-content-center py-2">
                        <span style={{color: "#1B8CCA"}}><img src="./assets/image/4.svg" alt=""/>7.45%</span> from last month
                    </div>
                </div>
            </div>

            <div className="tables-row">
                <div className="table-section">
                    <div className="table-header">
                        <h5 className="table-title">Recent Invoices</h5>
                        <Link to="/Invoices" className="view-all">View All</Link>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Client</th>
                                <th>Amount</th>
                                <th>Due Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                invoices?.map((invoice,i)=>(
                                    <tr key={i}>
                                        <td>{invoice?.quotation?.billedTo?.name}</td>
                                        <td className="amount">{invoice.totalAmount} {invoice?.quotation?.currency}</td>
                                        <td>{moment(invoice.dueDate).format('DD MMM YYYY')}</td>
                                        <td>
                                            <span className="status-badge">
                                                {invoice.status}
                                                {invoice.status === 'Paid' && <i className="bi bi-check-circle ms-1"></i>}
                                                {invoice.status === 'Overdue' && <i className="bi bi-exclamation-triangle ms-1"></i>}
                                                {invoice.status === 'Partially Paid' && <i className="bi bi-hourglass-split ms-1"></i>}
                                                {invoice.status === 'Unpaid' && <i className="bi bi-clock ms-1"></i>}
                                                {invoice.status === 'Draft' && <i className="bi bi-file-text ms-1"></i>}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>

                <div className="table-section">
                    <div className="table-header">
                        <h5 className="table-title">Recent Proforma</h5>
                        <Link to="/Proforma" className="view-all">View All</Link>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Client</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                quotation?.map((q,i)=>(
                                    <tr key={i}>
                                        <td>{q?.billedTo?.name}</td>
                                        <td className="amount">{q?.totalAmount} {q?.currency}</td>
                                    </tr>
                                ))
                            }
                            
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        </>
  )
}

export default Home
