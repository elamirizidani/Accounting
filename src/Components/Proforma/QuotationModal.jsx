import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Table,Spinner } from 'react-bootstrap';
import './create.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { fetchData, insertData } from '../../../utility/api';
import ClientFormModal from './ClientFormModal';
import axios from 'axios';


const QuotationModal = ({ show, handleClose,quotation ={} }) => {
  const [enableTax, setEnableTax] = useState(true);
  const [addDueDate, setAddDueDate] = useState(false);
  const [roundOffTotal, setRoundOffTotal] = useState(true);
  const [items, setItems] = useState(quotation?.items ||[]);
const currencies = [
    {
      name:'USD',
      key:"USD",
      symbol:'$',
      cName:'Dollars'
    },{
      name:'EUR',
      key:"USDEUR",
      symbol:'€',
      cName:'Euros'
    },{
      name:'RWF',
      key:"USDRWF",
      symbol:'RWF',
      cName:'Rwandan Franc'
    }
  ]

  const [customers,setCustomers] = useState([])
  const [companies,setCompanies] = useState([])
  const [selectedCustomer,setSelectedCustomer] = useState(quotation?.billedTo||{})
  const [selectedCompany,setSelectedCompany] = useState(quotation?.billedBy||{})
  const [selectedCurrency,setSelectedCurrency] = useState(currencies?.find(currency=>currency?.name === quotation?.currency)||{})
  const [previousCurrency, setPreviousCurrency] = useState(null);

  const [showClientForm, setShowClientForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newClient, setNewClient] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });

  const [formData, setFormData] = useState(quotation ||{
    billedBy: '',
    billedTo: '',
    quotationDate:'',
    currency:'',
    status:'',
    additionalNotes:'',
    referenceNumber:'',
    enableTax: true,
    items: [{
      service: '',
      description: '',
      quantity: 1,
      unitCost: 0,
      vat: 18,
    }]
  });
  // console.log(quotation)

  


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
    if (field === 'quantity' || field === 'unitCost') {
      const quantity = parseFloat(newItems[index].quantity) || 0;
      const unitCost = parseFloat(newItems[index].unitCost) || 0;
      newItems[index].total = quantity * unitCost;
    }
    setItems(newItems);
  };



  const calculateTotals = () => {
    const amount = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const vat = enableTax ? amount * 0.18 : 0;
    // const sgst = enableTax ? amount * 0.09 : 0;
    const total = amount + vat;
    const roundedTotal = roundOffTotal ? Math.round(total) : total;
    
    return { amount, vat, total: roundedTotal };
  };

  const { amount, vat, total } = calculateTotals();

  const numberToWords = (num) => {
    
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

  // useEffect(()=>{
  //   console.log(selectedCompany)
  // },[selectedCompany])




  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);

    const payload = {
      billedBy: selectedCompany?._id,
      billedTo: selectedCustomer?._id,
      currency:formData.currency,
      status:formData.status,
      additionalNotes:formData.additionalNotes,
      referenceNumber:formData.referenceNumber,
      items: items,
      enableTax,
      roundOffTotal,
      total,
      quotationDate: formData.quotationDate,
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



  return (
    <>
    <Modal show={show} onHide={showClientForm ? () => {} : handleClose}  size="xl" centered>
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
                  <Form.Control type="text" value="Q34069" readOnly disabled/>
                </Form.Group>
              </div>
              <div className="col-md-3">
                <Form.Group>
                  <Form.Label>Reference Number</Form.Label>
                  <Form.Control type="text" 
                    value={formData.referenceNumber}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({...formData, referenceNumber: value});
                    }}
                  />
                </Form.Group>
              </div>
              <div className="col-md-3">
                <Form.Group>
                  <Form.Label>Select Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => {
                        const value = e.target.value;
                        setFormData({...formData, status: value});
                      }}
                  >
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
                  <Form.Select 
                  value={formData.currency}
                    onChange={ async(e) => {
                        const value = e.target.value;
                        const selectedOption = e.target.options[e.target.selectedIndex];
                        const fullCurrency = JSON.parse(selectedOption.dataset.currency);


                        // if (!converted?.[fullCurrency?.key]) {
                        //   // Call conversion API from previousCurrency to newCurrency
                        //   await convertCurrency();
                        // }
                        setPreviousCurrency(selectedCurrency);

                        setSelectedCurrency(fullCurrency);
                        setFormData({...formData, currency: value});
                      }}
                      >
                    <option>Select Currency</option>
                    {
                      currencies?.map(currency=>(
                        // <option value={currency?.name} data={currency}>{currency?.name}</option>
                        <option 
                          key={currency.key}
                          value={currency.name}
                          data-currency={JSON.stringify(currency)}
                          >
                          {currency.name}
                        </option>
                      ))
                    }
                  </Form.Select>
                </Form.Group>
              </div>
            </div>
            <div className="row g-3 mt-2">
              <div className="col-md-3">
                <Form.Group>
                  <Form.Label>Quotation Date</Form.Label>
                  <div className="d-flex align-items-center">
                    <Form.Control type="date" 
                    // new Date().toISOString()
                    value={formData.quotationDate}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({...formData, quotationDate: value});
                      }}
                    />
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
                    <option>Select</option>
                    {companies?.map((company) => (
                      <option key={company._id} value={company._id}>
                        {company.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                {
                 Object.keys(selectedCompany)?.length>0  && 
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
                      <option>Select</option>
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
                  {/* <SideModel/> */}

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
            {/* <h2 className="h5 mb-3">Items & Details</h2>
            <Form.Group className="mb-3">
              <Form.Label>Services</Form.Label>
              <Form.Select>
                <option>Select</option>
                <option value="service1">Service 1</option>
                <option value="service2">Service 2</option>
              </Form.Select>
            </Form.Group> */}
            <div className="table-responsive">
              <Table bordered>
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Unit Cost ({selectedCurrency?.symbol? selectedCurrency?.symbol: '$'})</th>
                    {/* <th>Total VAT</th> */}
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
                      {/* <td>{item.vat}</td> */}
                      <td>{selectedCurrency?.symbol? selectedCurrency?.symbol: '$'} {item.total.toFixed(2)}</td>
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
                <Form.Control as="textarea" rows={3} placeholder="Enter additional notes..."
                  value={formData.additionalNotes}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({...formData, additionalNotes: value});
                  }}
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <div className="p-3 bg-light rounded">
                <div className="d-flex justify-content-between mb-2">
                  <span>Amount</span>
                  <span>{selectedCurrency?.symbol? selectedCurrency?.symbol: '$'} {Number(amount.toFixed(2)).toLocaleString()}</span>
                </div>
                {enableTax && (
                  <>
                    <div className="d-flex justify-content-between mb-2">
                      <span>VAT (18%)</span>
                      <span>{selectedCurrency?.symbol? selectedCurrency?.symbol: '$'} {Number(vat.toFixed(2)).toLocaleString()}</span>
                    </div>
                    {/* <div className="d-flex justify-content-between mb-2">
                      <span>SGST (9%)</span>
                      <span>{selectedCurrency?.symbol? selectedCurrency?.symbol: '$'} {Number(sgst.toFixed(2)).toLocaleString()}</span>
                    </div> */}
                  </>
                )}
                {/* <Button variant="outline-primary" className="w-100 mb-3">● Add Additional Charges</Button> */}
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
                  <span>{selectedCurrency?.symbol? selectedCurrency?.symbol: '$'} {Number(total.toFixed(2)).toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between mb-2 fw-bold">
                  <span>Total (USD)</span>
                  <span>{selectedCurrency?.symbol? selectedCurrency?.symbol: '$'} {Number(total.toFixed(2)).toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Total In Words</span>
                  <span>{numberToWords(total.toLocaleString())} {selectedCurrency?.cName ? selectedCurrency?.cName: 'Dollars'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="mb-4">
            <div className="row justify-content-center">
              {/* <div className="col-md-6">
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
              </div> */}
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
    {/* <ClientFormModal key={Date.now()}/> */}
    <ClientFormModal
        show={showClientForm}
        onHide={() => setShowClientForm(false)}
        newClient={newClient}
        setNewClient={setNewClient}
        handleAddClient={handleAddClient}
        loading={loading}
      />
      </>
  );
  
};


export default QuotationModal;



