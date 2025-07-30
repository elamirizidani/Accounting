import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Table,Spinner } from 'react-bootstrap';
import './create.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { fetchData, insertData } from '../../../utility/api';


const QuotationModal = ({ show, handleClose }) => {
  const [enableTax, setEnableTax] = useState(true);
  const [addDueDate, setAddDueDate] = useState(false);
  const [roundOffTotal, setRoundOffTotal] = useState(true);
  const [items, setItems] = useState([
  ]);


  const [customers,setCustomers] = useState([])
  const [companies,setCompanies] = useState([])
  const [selectedCustomer,setSelectedCustomer] = useState({})
  const [selectedCompany,setSelectedCompany] = useState({})


  const [showClientForm, setShowClientForm] = useState(false);
const [newClient, setNewClient] = useState({
  name: '',
  address: '',
  phone: '',
  email: ''
});
  
      const readCustomers = async ()=>{
        try {
          const res = await fetchData('customers')
          setCustomers(res || [])
        } catch (error) {
          console.log(error)
        }
      }
      const readCompanies = async ()=>{
        try {
          const res = await fetchData('companies')
          setCompanies(res || [])
        } catch (error) {
          console.log(error)
        }
      }
      useEffect(()=>{
        readCompanies()
        readCustomers()
      },[])

  const toggleSwitch = (stateSetter) => {
    stateSetter(prev => !prev);
  };

  const addNewItem = () => {
    setItems([...items, { service: '', description: '', quantity: 1, unitCost: 0, vat: 0, total: 0 }]);
  };

  const deleteItem = (index) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    // Calculate total if quantity or unitCost changes
    if (field === 'quantity' || field === 'unitCost') {
      const quantity = parseFloat(newItems[index].quantity) || 0;
      const unitCost = parseFloat(newItems[index].unitCost) || 0;
      newItems[index].total = quantity * unitCost;
    }
    
    setItems(newItems);
  };

  const calculateTotals = () => {
    const amount = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const cgst = enableTax ? amount * 0.09 : 0;
    const sgst = enableTax ? amount * 0.09 : 0;
    const total = amount + cgst + sgst;
    const roundedTotal = roundOffTotal ? Math.round(total) : total;
    
    return { amount, cgst, sgst, total: roundedTotal };
  };

  const { amount, cgst, sgst, total } = calculateTotals();

  const numberToWords = (num) => {
    // This is a simplified version - you might want to use a library for full functionality
    const words = [
      'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const tens = ['Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num < 20) return words[num];
    if (num < 100) return tens[Math.floor(num/10)-2] + (num%10 ? ' ' + words[num%10] : '');
    if (num < 1000) return words[Math.floor(num/100)] + ' Hundred' + (num%100 ? ' and ' + numberToWords(num%100) : '');
    return num; // Simplified - would need more logic for larger numbers
  };

  useEffect(()=>{
    console.log(selectedCompany)
  },[selectedCompany])


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

   const [formData, setFormData] = useState({
    billedBy: '',
    billedTo: '',
    enableTax: true,
    items: [{
      service: '',
      description: '',
      quantity: 1,
      unitCost: 0,
      vat: 18,
    }]
  });


  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);

    const payload = {
      billedBy: selectedCompany?._id,
      billedTo: selectedCustomer?._id,
      items: items,
      enableTax,
      roundOffTotal,
      total,
      quotationDate: new Date().toISOString(), // or get from date input
      currency: 'USD', // replace with selected value if dynamic
      reference: 'REF-123456', // you can also get this from an input
      notes: '', // can bind to form state if needed
    };

// console.log(JSON.stringify(payload))

    const response = await insertData('quotations',payload);
    alert('Quotation created successfully!');
    // console.log(response);

    // Optionally reset form or close modal
    handleClose();
  } catch (err) {
    console.log(err)
    setError(err.response?.data?.message || 'Failed to create quotation');
  } finally {
    setLoading(false);
  }
};

const handleAddClient = async (e) => {
  if (e) e.preventDefault();  // Prevent default if event exists
  
  // Basic validation
  if (!newClient.name || !newClient.email) {
    alert('Please fill in required fields');
    return;
  }

  try {
    setLoading(true);
    const response = await insertData('customers', newClient);
    
    // Update state
    setCustomers([...customers, response]);
    setSelectedCustomer(response);
    setFormData({...formData, billedTo: response._id});
    
    // Reset and close
    setNewClient({ name: '', address: '', phone: '', email: '' });
    setShowClientForm(false);
    
  } catch (error) {
    console.error('Error adding client:', error);
    alert('Failed to add client: ' + (error.message || 'Please try again'));
  } finally {
    setLoading(false);
  }
};


const handleKeyDown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
  }
};



const ClientFormModal = () => (
  <Modal show={showClientForm} onHide={() => setShowClientForm(false)}>
    <Modal.Header closeButton>
      <Modal.Title>Add New Client</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form onSubmit={handleAddClient}>
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control 
            type="text" 
            value={newClient.name}
            onChange={(e) => setNewClient({...newClient, name: e.target.value})}
            onKeyDown={handleKeyDown}
            required
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Address</Form.Label>
          <Form.Control 
            type="text" 
            value={newClient.address}
            onChange={(e) => setNewClient({...newClient, address: e.target.value})}
            onKeyDown={handleKeyDown}
            required
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Phone</Form.Label>
          <Form.Control 
            type="text" 
            value={newClient.phone}
            onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
            onKeyDown={handleKeyDown}
            required
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control 
            type="email" 
            value={newClient.email}
            onChange={(e) => setNewClient({...newClient, email: e.target.value})}
            onKeyDown={handleKeyDown}
            required
          />
        </Form.Group>
      </Form>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={() => setShowClientForm(false)}>
        Cancel
      </Button>

      <Button 
      variant="primary" 
      onClick={handleAddClient} 
      disabled={loading}
      type="submit"  // Make it a submit button
    >
      {loading ? (
        <>
          <Spinner animation="border" size="sm" className="me-2" />
          Creating...
        </>
      ) : (
        'Save Customer'
      )}
    </Button>

    </Modal.Footer>
  </Modal>
);




  return (
    <>
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <div className="quotation-modal">
        <Form onSubmit={handleSubmit}>
      <Modal.Header closeButton>
        <Modal.Title>Quotation Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="container">
          {/* Quotation Details */}
          <div className="mb-4">
            <h2 className="h5 mb-3 section-title">Quotation Details</h2>
            <div className="row g-3">
              <div className="col-md-3">
                <Form.Group>
                  <Form.Label>Quotation ID</Form.Label>
                  <Form.Control type="text" value="Q34069" readOnly />
                </Form.Group>
              </div>
              <div className="col-md-3">
                <Form.Group>
                  <Form.Label>Reference Number</Form.Label>
                  <Form.Control type="text" defaultValue="1254569" />
                </Form.Group>
              </div>
              <div className="col-md-3">
                <Form.Group>
                  <Form.Label>Select Status</Form.Label>
                  <Form.Select>
                    <option>Select Status</option>
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-3">
                <Form.Group>
                  <Form.Label>Currency</Form.Label>
                  <Form.Select>
                    <option>Select Currency</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">RWF</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>
            <div className="row g-3 mt-2">
              <div className="col-md-3">
                <Form.Group>
                  <Form.Label>Quotation Date</Form.Label>
                  <div className="d-flex align-items-center">
                    <Form.Control type="date" />
                    <i className="bi bi-calendar ms-2"></i>
                  </div>
                </Form.Group>
              </div>
              <div className="col-md-6 d-flex align-items-center">
                <div className="form-check form-switch me-3">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    checked={enableTax}
                    onChange={() => toggleSwitch(setEnableTax)}
                  />
                  <label className="form-check-label">Enable Tax</label>
                </div>
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="add-due-date"
                    checked={addDueDate}
                    onChange={() => toggleSwitch(setAddDueDate)}
                  />
                  <label className="form-check-label" htmlFor="add-due-date">Add Due Date</label>
                </div>
              </div>
              <div className="col-md-3">
                <i className="bi bi-info-circle text-primary fs-5"></i>
              </div>
            </div>
          </div>

          {/* Bill From & Bill To */}
          <div className="mb-4">
            <div className="row">
              <div className="col-md-6">
                <h3 className="h5 mb-3">Bill From</h3>
                <Form.Group className="mb-3">
                  <Form.Label>Billed By</Form.Label>
                  {/* <Form.Select onChange={setSelectedCustomer}>
                    <option>Select</option>
                    {
                      companies && companies?.map((company,i)=>(
                        <option key={company?._id} value={company?.name}>{company?.name}</option>
                      ))
                    }
                  </Form.Select> */}

                  <Form.Select
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const selected = companies.find(c => c._id === selectedId);
                      setSelectedCompany(selected);
                    }}
                  >
                    <option value="">Select</option>
                    {companies?.map((company) => (
                      <option key={company._id} value={company._id}>
                        {company.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                {
                 Object.keys(selectedCompany).length>0  && 
                  <div className="p-3 bg-light rounded">
                  <div className="fw-bold">{selectedCompany?.name}</div>
                  <div className="text-muted small">
                    {selectedCompany?.address}<br />
                    Phone: {selectedCompany?.phone}<br />
                    Email: {selectedCompany?.email}
                  </div>
                </div>
                }
                
              </div>
              <div className="col-md-6">
                <h3 className="h5 mb-3">Bill To</h3>
                <Form.Group className="mb-3">
                  <Form.Label>Customer Name</Form.Label>
                  <div className="d-flex">
                    

                    <Form.Select 
                      className="me-2"
                      value={formData.billedTo}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const selected = customers.find(c => c._id === selectedId);
                        setSelectedCustomer(selected);
                        setFormData({...formData, billedTo: selectedId});
                      }}
                    >
                      <option value="">Select</option>
                      {customers?.map((customer) => (
                        <option key={customer._id} value={customer._id}>
                          {customer.name}
                        </option>
                      ))}
                    </Form.Select>
                    
                  </div>

                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => setShowClientForm(true)}
                  >
                    ● Add New
                  </Button>

                  {/* <Button variant="outline-primary" size="sm">● Add New</Button> */}

                </Form.Group>
                {
                  Object.keys(selectedCustomer).length>0
                   &&
                  <div className="p-3 bg-light rounded">
                  <div className="fw-bold">{selectedCustomer?.name}</div>
                  <div className="text-muted small">
                    {selectedCustomer?.address}<br />
                    Phone: {selectedCustomer?.phone}<br />
                    Email: {selectedCustomer?.email}
                  </div>
                </div>
                }
                
              </div>
            </div>
          </div>

          {/* Items & Details */}
          <div className="mb-4">
            <h2 className="h5 mb-3">Items & Details</h2>
            <Form.Group className="mb-3">
              <Form.Label>Services</Form.Label>
              <Form.Select>
                <option>Select</option>
                <option value="service1">Service 1</option>
                <option value="service2">Service 2</option>
              </Form.Select>
            </Form.Group>
            <div className="table-responsive">
              <Table bordered>
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Unit Cost</th>
                    <th>Total VAT</th>
                    <th>Total Tax Incl.</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td>
    
                        <Form.Control 
                          type="text" 
                          value={item.service} 
                          onChange={(e) => handleItemChange(index, 'service', e.target.value)}
                        />
                        </td>
                      <td>
                        <Form.Control 
                          type="text" 
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        />
                      </td>
                      <td>
                        <Form.Control 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        />
                      </td>
                      <td>
                        <Form.Control 
                          type="number" 
                          value={item.unitCost} 
                          onChange={(e) => handleItemChange(index, 'unitCost', e.target.value)}
                        />
                      </td>
                      <td>{item.vat}</td>
                      <td>${item.total.toFixed(2)}</td>
                      <td>
                        <Button variant="link" onClick={() => deleteItem(index)}>
                          <i className="bi bi-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <Button variant="outline-primary" onClick={addNewItem}>● Add New</Button>
          </div>

          {/* Calculation Section */}
          <div className="row mb-4">
            <div className="col-md-6">
              <h3 className="h5 mb-3">Extra Information</h3>
              <div className="d-flex mb-3">
                <Button variant="primary" className="me-2">📝 Add Notes</Button>
                <Button variant="outline-secondary" className="me-2">📄 Add Terms & Conditions</Button>
                <Button variant="outline-secondary">🏦 Bank Details</Button>
              </div>
              <Form.Group>
                <Form.Label>Additional Notes</Form.Label>
                <Form.Control as="textarea" rows={3} placeholder="Enter additional notes..." />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <div className="p-3 bg-light rounded">
                <div className="d-flex justify-content-between mb-2">
                  <span>Amount</span>
                  <span>${amount.toFixed(2)}</span>
                </div>
                {enableTax && (
                  <>
                    <div className="d-flex justify-content-between mb-2">
                      <span>CGST (9%)</span>
                      <span>${cgst.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>SGST (9%)</span>
                      <span>${sgst.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <Button variant="outline-primary" className="w-100 mb-3">● Add Additional Charges</Button>
                <div className="d-flex justify-content-between mb-2">
                  <span>Discount</span>
                  <span>0%</span>
                </div>
                <div className="d-flex justify-content-between mb-2 align-items-center">
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      checked={roundOffTotal}
                      onChange={() => toggleSwitch(setRoundOffTotal)}
                    />
                    <label className="form-check-label">Round Off Total</label>
                  </div>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2 fw-bold">
                  <span>Total (USD)</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Total In Words</span>
                  <span>{numberToWords(total)} Dollars</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="mb-4">
            <div className="row justify-content-center">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Select Signature</Form.Label>
                  <Form.Select>
                    <option>Select Signature</option>
                    <option value="signature1">Signature 1</option>
                    <option value="signature2">Signature 2</option>
                  </Form.Select>
                </Form.Group>
                <div className="text-center my-3 text-muted">OR</div>
                <Form.Group className="mb-3">
                  <Form.Label>Signature Name</Form.Label>
                  <Form.Control type="text" defaultValue="Peter" />
                </Form.Group>
                <Button variant="outline-secondary" className="w-100">
                  <i className="bi bi-upload me-2"></i>Upload Signature
                </Button>
              </div>
            </div>
          </div>
        </div>
        
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        {/* <Button variant="primary" onClick={handleClose}>Save</Button> */}

        <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Creating...
                </>
              ) : (
                'Save Quotation'
              )}
            </Button>

      </Modal.Footer>
      </Form>
      </div>
    </Modal>
    <ClientFormModal /></>
  );



  
};

// Example usage in your App component
// const App = () => {
//   const [showModal, setShowModal] = useState(false);

//   return (
//     <div className="container mt-5">
//       <Button variant="primary" onClick={() => setShowModal(true)}>
//         Open Quotation Modal
//       </Button>
      
//       <QuotationModal 
//         show={showModal} 
//         handleClose={() => setShowModal(false)} 
//       />
//     </div>
//   );
// };

export default QuotationModal;



