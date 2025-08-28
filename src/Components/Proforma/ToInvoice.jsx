import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Form, Table,Spinner, Row, Col, Card } from 'react-bootstrap';
import '../create.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { fetchData, insertData } from '../../../utility/api';
import { useInvoiceStore } from '../../store/invoiceStore';


const ToInvoice = ({ show, handleClose,quotation = {} }) => {
  const currencies = useMemo(() => [
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
  ], [])
const {getInvoices} = useInvoiceStore()
  const [enableTax, setEnableTax] = useState(true);
  const [roundOffTotal, setRoundOffTotal] = useState(true);
  const [items, setItems] = useState(quotation?.items ||[]);
  const [customers,setCustomers] = useState([])
  const [companies,setCompanies] = useState([])
  const [services,setServices] = useState([])
  const [selectedCustomer,setSelectedCustomer] = useState(quotation?.billedTo||{})
  const [selectedCompany,setSelectedCompany] = useState(quotation?.billedBy||{})
  const [selectedCurrency,setSelectedCurrency] = useState(currencies?.find(currency=>currency?.name === quotation?.currency)||{})

  const [showClientForm, setShowClientForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
const [invoiceData,setInvoiceData] =useState({
    invoiceDate:'',
    dueDate:'',
    paymentTerms:'',
    paymentMethod:'',
    notes:'',
    status:'',
    extraEmail:''
  })

  useEffect(() => {
  if (quotation) {
    setFormData({
      ...quotation,
      items: quotation.items || [],
      enableTax: quotation.enableTax ?? true,
      roundOffTotal: quotation.roundOffTotal ?? true
    });
    
    setEnableTax(quotation?.enableTax)
    setItems(quotation.items || []);
    setSelectedCustomer(quotation.billedTo || {});
    setSelectedCompany(quotation.billedBy || {});
    setSelectedCurrency(currencies.find(currency => currency?.name === quotation?.currency) || {});
  }
}, [quotation,currencies]);


  const [formData, setFormData] = useState({
    ...quotation,
    items: quotation?.items || [],
    enableTax: quotation?.enableTax ?? true,
    roundOffTotal: quotation?.roundOffTotal ?? true
  })


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
      const readServices = async ()=>{
        try {
          const res = await fetchData('services')
          setServices(res || [])
        } catch (error) {
          console.log(error)
        }
      }
      useEffect(()=>{
        readCompanies()
        readCustomers()
        readServices()
      },[])

  const toggleSwitch = (stateSetter) => {
    stateSetter(prev => !prev);
  };

  // const addNewItem = (service,name) => {
  //   setItems([...items, { service: service,name:name, description: '', quantity: 1, unitCost: 0, vat: 0, total: 0 }]);
  // };

// const generateId = () => Date.now() + Math.random().toString(16).slice(2);

  const addNewItem = (service ='', name ='',description='') => {
    if (!items.some(item => item.service === service)) {
      setItems([...items, { service, name, description: description, quantity: 1, unitCost: 0, vat: 0, total: 0 }]);
    }
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
      quotation:quotation?._id,
      totalAmount:quotation?.totalAmount,
      ...invoiceData,
    };

    console.log(JSON.stringify(payload))

    const response = await insertData('invoice',payload);
    getInvoices()
    alert('Invoice created successfully!');
    console.log(response);

    // Optionally reset form or close modal
    handleClose();
  } catch (err) {
    console.log(err)
    setError(err.response?.data?.message || 'Failed to create quotation');
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
        <Modal.Title>INVOICE</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="container">
          {/* Quotation Details */}
          <div className="mb-4">
            <h2 className="h5 mb-3 section-title">INVOICE Details</h2>

            <Row className='justify-content-between'>
              <Col md={4}>
                {/* <div className="row g-3">
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label>INVOICE N<sup>o</sup></Form.Label>
                      <Form.Control type="text" value={generateQuotationId()} readOnly disabled/>
                    </Form.Group>
                  </div>
                </div> */}
                <div className="col-md-12 mt-3">
                  <Form.Group>
                    <Form.Label>INVOICE Date</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control type="date" 
                      required
                      value={invoiceData.invoiceDate}
                        onChange={(e) => {
                          const value = e.target.value;
                          setInvoiceData({...invoiceData, invoiceDate: value});
                        }}
                      />
                    </div>
                  </Form.Group>
                </div>
                <div className="col-md-12 mt-3">
                  <Form.Group>
                    <Form.Label>Due Date</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control type="date" 
                      required
                      value={invoiceData.dueDate}
                        onChange={(e) => {
                          const value = e.target.value;
                          setInvoiceData({...invoiceData, dueDate: value});
                        }}
                      />
                    </div>
                  </Form.Group>                  
                </div>
              </Col>

              <Col md={4}>
                <Row>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Select Status</Form.Label>
                      <Form.Select
                        value={invoiceData.status}
                        onChange={(e) => {
                            const value = e.target.value;
                            setInvoiceData({...invoiceData, status: value});
                          }}
                      >
                        <option>Select Status</option>
                        <option value="draft">Draft</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                        <option value="cancelled">Cancelled</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Payment Mode</Form.Label>
                      <Form.Select
                        value={invoiceData.paymentMethod}
                        onChange={(e) => {
                            const value = e.target.value;
                            setInvoiceData({...invoiceData, paymentMethod: value});
                          }}
                      >
                        <option>Select</option>
                        <option value="cash">Cash</option>
                        <option value="check">Check</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  
                </Row>
                {/* <div className="form-check form-switch me-3">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    checked={enableTax}
                    onChange={() => toggleSwitch(setEnableTax)}
                  />
                  <label className="form-check-label">Enable Tax</label>
                </div> */}
              </Col>
            </Row>
          </div>
          <hr/>

          {/* Bill From & Bill To */}
          <div className="mb-4">
            <Row>
              <Col md={6}>
              <Card className='p-3'>
                <h3 className="h5 mb-3">Bill From</h3>
                {/* <Form.Group className="mb-3">
                  <Form.Label>Billed By</Form.Label>
                
                  <Form.Select
                    disabled
                  >
                    <option>Select</option>
                    {companies?.map((company) => (
                      <option key={company._id} value={company._id}>
                        {company.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group> */}
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
              </Card>
                
              </Col>
              <Col md={6}>
              <Card className='p-3'>
                <h3 className="h5 mb-3">Bill To</h3>
                
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

                <Form.Group className="mb-3">
                                    <Form.Label>Someone else to notify</Form.Label>
                                    <Form.Control 
                                      type="email" 
                                      value={invoiceData.extraEmail}
                                      name='email'
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setInvoiceData({...invoiceData, extraEmail: value});
                                      }}
                                    />
                                  </Form.Group>

                </Card>
              </Col>
            </Row>
          </div>
          <hr/>
          {/* Items & Details */}
          <div className="mb-4">
            <h2 className="h5 mb-3">Items & Details</h2>
            {/* <Form.Group className="mb-3">
              <Form.Label>Services</Form.Label>
              <Form.Select
                onChange={(e) => {
                  const { value, selectedOptions } = e.target;
                  if (value && value.toLowerCase() !== "select") {
                    const name = selectedOptions[0]?.dataset.name;
                    addNewItem(value, name);
                  }
                }}
              >
                <option>Select</option>
                {services?.map(service => (
                  <option key={service._id} value={service._id} data-name={service.service}>
                    {service.service}
                  </option>
                ))}
              </Form.Select>
              <Button 
                variant="outline-primary bg-dark text-light" 
                size="sm"
                onClick={() => setShowServiceForm(true)}
                >
                ● Add New
              </Button>
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
    
                        {/* <Form.Control 
                          type="text" 
                          value={item.name} 
                          disabled
                        /> */}

                        <Form.Select
                        disabled
                          value={item.service}
                          onChange={(e) => {
                            const { value, selectedOptions } = e.target;
                            if (value && value.toLowerCase() !== "select") {
                              // const name = selectedOptions[0]?.dataset.name;
                              // const description = selectedOptions[0]?.dataset.description;
                              handleItemChange(index,'service',value)
                            }
                          }}
                        >
                          <option>Select</option>
                          {services?.map(service => (
                            <option key={service._id} value={service._id} data-name={service.service}>
                              {service.service}
                            </option>
                          ))}
                        </Form.Select>
                        </td>
                      <td>
                        <Form.Control 
                          type="text" 
                          disabled
                          value={item.description}
                        />
                      </td>
                      <td>
                        <Form.Control 
                          type="number" 
                          value={item.quantity} 
                          disabled
                        />
                      </td>
                      <td>
                        <Form.Control 
                          type="number" 
                          value={item.unitCost} 
                          disabled
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
                {/* <Button 
                    variant="outline-primary bg-dark text-light" 
                    size="sm"
                    onClick={() => addNewItem()}
                  >
                    ● Add New
                </Button> */}
              </Table>
            </div>
          </div>

          {/* Calculation Section */}
          <div className="row mb-4">
            <div className="col-md-6">
              <h3 className="h5 mb-3">Extra Information</h3>
              <div className="d-flex mb-3">
                <Button variant="primary" className="me-2">📝 Add Notes</Button>
                {/* <Button variant="primary" className="me-2">📄 Add Terms & Conditions</Button> */}
                {/* <Button variant="outline-secondary">🏦 Bank Details</Button> */}
              </div>
              <Form.Group>
                <Form.Label>Additional notes</Form.Label>
                <Form.Control as="textarea" rows={3} placeholder="Enter Additional notes..."
                  value={invoiceData.notes}
                  onChange={(e) => {
                    const value = e.target.value;
                    setInvoiceData({...invoiceData, notes: value});
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
                {/* <div className="d-flex justify-content-between mb-2">
                  <span>Discount</span>
                  <span>0%</span>
                </div> */}
                {/* <div className="d-flex justify-content-between mb-2 align-items-center">
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
                </div> */}
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
                'Save Invoice'
              )}
            </Button>

      </Modal.Footer>
      </Form>
      </div>
    </Modal>
    {/* <ClientFormModal key={Date.now()}/> */}
    {/* <ClientFormModal
        show={showClientForm}
        onHide={() => setShowClientForm(false)}
        newClient={newClient}
        setNewClient={setNewClient}
        handleAddClient={handleAddClient}
        loading={loading}
      /> */}
      {/* <AddService
        show={showServiceForm}
        onHide={() => setShowServiceForm(false)}
        newClient={newService}
        setNewClient={setNewService}
        handleAddClient={handleAddService}
        loading={loading}/> */}

      </>
  );
  
};


export default ToInvoice;



