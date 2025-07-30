import React from 'react'

function Home() {
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
                           <img src="./assets/image/2.svg" alt=""/>
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
                           <img src="./assets/image/3.svg" alt=""/>
                        </div>
                    </div>
                        <div className="stat-change d-flex justify-content-center py-2"><span style={{color: "#1B8CCA"}}>
                            <img src="./assets/image/5.svg" alt=""/>
                            7.45%</span> from last month</div>
                    
                </div>
               
            </div>

            <div className="tables-row">
                
                <div className="table-section">
                    <div className="table-header">
                        <h5 className="table-title">Recent Invoices</h5>
                        <a href="#" className="view-all">View All</a>
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
                            <tr>
                                <td>Bank Of Kigali</td>
                                <td className="amount">1700000</td>
                                <td>04 Mar 2025</td>
                                <td><span className="status-badge status-paid">Paid</span></td>
                            </tr>
                            <tr>
                                <td>Equity Bank PLC</td>
                                <td className="amount">2,225,750</td>
                                <td>07 Feb 2025</td>
                                <td><span className="status-badge status-pending">Pending</span></td>
                            </tr>
                            <tr>
                                <td>Shelima</td>
                                <td className="amount">130500</td>
                                <td>02 Nov 2024</td>
                                <td><span className="status-badge status-overdue">Overdue</span></td>
                            </tr>
                            <tr>
                                <td>Skol Brewery</td>
                                <td className="amount">750,300</td>
                                <td>26 Oct 2024</td>
                                <td><span className="status-badge status-sent">Sent</span></td>
                            </tr>
                            <tr>
                                <td>Kirscel Cassava</td>
                                <td className="amount">639,899</td>
                                <td>18 Oct 2024</td>
                                <td><span className="status-badge status-sent">Sent</span></td>
                            </tr>
                            <tr>
                                <td>RSLA</td>
                                <td className="amount">2,639,660</td>
                                <td>22 Sep 2024</td>
                                <td><span className="status-badge status-sent">Sent</span></td>
                            </tr>
                            <tr>
                                <td>Namiho</td>
                                <td className="amount">2,309,620</td>
                                <td>05 Sep 2024</td>
                                <td><span className="status-badge status-sent">Sent</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="table-section">
                    <div className="table-header">
                        <h5 className="table-title">Recent Proforma</h5>
                        <a href="#" className="view-all">View All</a>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Client</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Bank Of Kigali</td>
                                <td className="amount">1800000</td>
                            </tr>
                            <tr>
                                <td>Equity Bank PLC</td>
                                <td className="amount">2,225,750</td>
                            </tr>
                            <tr>
                                <td>Shelima</td>
                                <td className="amount">130500</td>
                            </tr>
                            <tr>
                                <td>Skol Brewery</td>
                                <td className="amount">750,300</td>
                            </tr>
                            <tr>
                                <td>Kirscel Cassava</td>
                                <td className="amount">635,099</td>
                            </tr>
                            <tr>
                                <td>RSLA</td>
                                <td className="amount">2,639,660</td>
                            </tr>
                            <tr>
                                <td>Namiho</td>
                                <td className="amount">2,309,620</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        </>
  )
}

export default Home
