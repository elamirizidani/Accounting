import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Form, Table,Spinner, Row, Col, Card } from 'react-bootstrap';
import '../create.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { fetchData, insertData } from '../../../utility/api';
import ClientFormModal from '../ReUsable/ClientFormModal';
import AddService from '../ReUsable/AddService';
import AddServiceCode from '../ReUsable/AddServiceCode';

import { useAuthStore } from '../../store/authStore';
import { useServicesStore } from '../../store/servicesStore';


const QuotationModal = ({ show, handleClose,quotation = {} }) => {
  const {serviceCodes,getServiceCodes} = useServicesStore()
  const currencies = useMemo(() => [
    {
      name:'RWF',
      key:"USDRWF",
      symbol:'RWF',
      cName:'Rwandan Franc',
      selected:false
    },
    {
      name:'USD',
      key:"USD",
      symbol:'$',
      cName:'Dollars',
      selected:false
    },{
      name:'EUR',
      key:"USDEUR",
      symbol:'€',
      cName:'Euros',
      selected:false
    }
  ], [])

  const [enableTax, setEnableTax] = useState(true);
  const [addDueDate, setAddDueDate] = useState(false);
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
  const [showCodeForm, setShowCodeForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const {loadQuotation} = useAuthStore()
  const [selectedCode,setSelectedCode]=useState({
    id:'',
    code:''
  })
  const [newCode,setNewCode] = useState({
    code:"",
    subBrand:""
  })

  useEffect(() => {
  if (quotation) {
    setFormData({
      ...quotation,
      items: quotation?.items || [],
      enableTax: quotation?.enableTax ?? true,
      roundOffTotal: quotation?.roundOffTotal ?? true
    });
    setEnableTax(quotation?.enableTax)
    setItems(quotation?.items || []);
    setSelectedCustomer(quotation?.billedTo || {});
    setSelectedCompany(quotation?.billedBy || {});
    setSelectedCurrency(currencies.find(currency => currency?.name === quotation?.currency || 'RWF') || {});
  }
}, [quotation,currencies]);


  
  const [newClient, setNewClient] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });
  const [newService, setNewService] = useState({
    service: '',
    description: ''
  });



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
      
      setItems([...items, { code:selectedCode.id,codeName:selectedCode.code,service, name, description: description, quantity: 1, unitCost: 0, vat: 0, total: 0 }]);
    }
  };

  const deleteItem = (index) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };
  

  const handleItemChange = (index, field, value ,enableTax = true) => {
    const newItems = [...items];
    newItems[index][field] = value;
    if (field === 'quantity' || field === 'unitCost') {
      const quantity = parseFloat(newItems[index].quantity) || 0;
      const unitCost = parseFloat(newItems[index].unitCost) || 0;
      const vat = enableTax ? quantity * unitCost  * 0.18 : 0;
      newItems[index].vat = vat;
      newItems[index].total = quantity * unitCost;
    }
    console.log(newItems)
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

  function numberToWords(num) {
  if (num === 0) return "zero";

  const below20 = ["", "One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten",
    "Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens = ["", "", "Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  const thousands = ["", "Thousand", "Million", "Billion"];

  function helper(n) {
    if (n === 0) return "";
    else if (n < 20) return below20[n] + " ";
    else if (n < 100) return tens[Math.floor(n/10)] + " " + helper(n%10);
    else return below20[Math.floor(n/100)] + " hundred " + helper(n%100);
  }

  let res = "";
  let i = 0;
  while (num > 0) {
    if (num % 1000 !== 0) {
      res = helper(num % 1000) + thousands[i] + " " + res;
    }
    num = Math.floor(num / 1000);
    i++;
  }
  return res.trim();
}

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
      termsConditions:formData.termsConditions,
      referenceNumber:formData.referenceNumber,
      items: items,
      enableTax,
      roundOffTotal,
      totalAmount:total,
      quotationDate: formData.quotationDate,
      reference: 'REF-123456', // you can also get this from an input
      notes: '', // can bind to form state if needed
    };


    const response = await insertData('quotation',payload);
    alert('Quotation created successfully!');
    // console.log(response);

    // Optionally reset form or close modal
    loadQuotation()
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


  const handleAddService = async (e) => {
    if (e) e.preventDefault();  // Prevent default if event exists
    
    // Basic validation
    if (!newService.service) {
      alert('Please fill in required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await insertData('services', newService);
      // Update state
      setServices([...services, response]);
      addNewItem(response?._id,response?.service);
    
      // Reset and close
      setNewService({ service: '', description: '' });
      setShowServiceForm(false);
      
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Failed to add client: ' + (error.message || 'Please try again'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddCode = async (e) => {
    if (e) e.preventDefault();  // Prevent default if event exists
    
    // Basic validation
    if (!newCode.code) {
      alert('Please fill in required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await insertData('services/serviceCodes', newCode);
      // Update state
      getServiceCodes();
      setSelectedCode({
        id:response?._id,
        code:response?.code
      })
    
      // Reset and close
      setNewCode({ code: ''});
      setShowCodeForm(false);
      
    } catch (error) {
      console.error('Error adding Code:', error);
      alert('Failed to add Code: ' + (error.message || 'Please try again'));
    } finally {
      setLoading(false);
    }
  };

  // const generateQuotationId = (prefix = 'Q-', length = 2) => {
  //   const randomNumber = Math.floor(Math.random() * Math.pow(10, length));
  //   const currentYear = new Date().getFullYear();
  //   const lastTwoDigits = currentYear.toString().slice(-2);
  //   return prefix + String(randomNumber).padStart(length, '0') + `/${lastTwoDigits}`;
  // };

  return (
    <>
    <Modal show={show} onHide={showClientForm ? () => {} : handleClose}  size="xl" centered>
      <div className="quotation-modal">
        <Form onSubmit={handleSubmit}>
      <Modal.Header closeButton>
        <Modal.Title>PROFORMA</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="container">
          {/* Quotation Details */}
          <div className="mb-4">
            <h2 className="h5 mb-3 section-title">PROFORMA Details</h2>

            <Row className='justify-content-between'>
              <Col md={4}>
                {/* <div className="row g-3">
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label>PROFORMA ID</Form.Label>
                      <Form.Control type="text" value={generateQuotationId()} readOnly disabled/>
                    </Form.Group>
                  </div>
                </div> */}
                <div className="col-md-12 mt-3">
                  <Form.Group>
                    <Form.Label>PROFORMA Date</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control type="date" 
                      value={formData.quotationDate}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData({...formData, quotationDate: value});
                        }}
                      />
                    </div>
                  </Form.Group>
                </div>
                <div className="col-md-12 mt-3">
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
                  {
                    addDueDate && <div className="d-flex align-items-center">
                    <Form.Control type="date" 
                      value={formData.quotationDate}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData({...formData, quotationDate: value});
                        }}
                      />
                  </div>
                  }
                </div>
              </Col>

              <Col md={4}>
                <Row>
                  <Col md={6}>
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
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Currency</Form.Label>
                      <Form.Select 
                      value={formData.currency}
                      defaultValue='RWF'
                        onChange={ async(e) => {
                            const value = e.target.value;
                            const selectedOption = e.target.options[e.target.selectedIndex];
                            const fullCurrency = JSON.parse(selectedOption.dataset.currency);
                            setSelectedCurrency(fullCurrency);
                            setFormData({...formData, currency: value});
                          }}
                          >
                        {
                          currencies?.map(currency=>(
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
                  </Col>
                </Row>
                <div className="form-check form-switch me-3">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    checked={enableTax}
                    onChange={() => toggleSwitch(setEnableTax)}
                  />
                  <label className="form-check-label">Enable Tax</label>
                </div>
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
                <Form.Group className="mb-3">
                  <Form.Label>Billed By</Form.Label>
                
                  <Form.Select
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      if(selectedId && selectedId?.toLowerCase()!== "select")
                      {
                        const selected = companies.find(c => c._id === selectedId);
                        setSelectedCompany(selected);
                      }
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
              </Card>
                
              </Col>
              <Col md={6}>
              <Card className='p-3'>
                <h3 className="h5 mb-3">Bill To</h3>
                <Form.Group className="mb-3">
                  <Form.Label>Customer Name</Form.Label>
                  <div className="d-flex">
                    
                    <Form.Select 
                      className="me-2"
                      value={formData.billedTo}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                         if(selectedId && selectedId?.toLowerCase()!== "select")
                         {
                          const selected = customers.find(c => c._id === selectedId);
                          setSelectedCustomer(selected);
                          setFormData({...formData, billedTo: selectedId});
                         }
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
                    variant="outline-primary bg-dark text-light" 
                    size="sm"
                    onClick={() => setShowClientForm(true)}
                  >
                    ● Add New
                  </Button>
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
                </Card>
              </Col>
            </Row>
          </div>
          <hr/>
          {/* Items & Details */}
          <div className="mb-4">
            <h2 className="h5 mb-3">Items & Details</h2>

            <Form.Group className="mb-3">
              <Form.Label>Service Code</Form.Label>
              <Form.Select
                onChange={(e) => {
                  const { value, selectedOptions } = e.target;
                  if (value && value.toLowerCase() !== "select") {
                    const name = selectedOptions[0]?.dataset.name;
                    setSelectedCode({
                      id:value,
                      code:name
                    })
                  }
                }}
              >
                <option>Select</option>
                <optgroup label='The Agency'>
                  {serviceCodes?.map(service => (
                    <option key={service._id} value={service._id} data-name={service.code}>
                      {service.code}
                    </option>
                  ))}
                </optgroup>
              </Form.Select>
              {/* {
                showCodeForm && 
                <Form onSubmit={handleSubmit}>
                <Row className='align-items-center'>
                  <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Code Name</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="code"
                    onChange={(e) => {
                    const value = e.target.value;
                    setNewCode({...newCode, code: value});
                  }}
                  />
                </Form.Group>
                </Col>
                <Col>
                <Button 
                  variant="outline-primary bg-dark text-light" 
                  size="sm"
                  onClick={handleAddCode}
                  >
                  Save
                </Button>
                </Col>
                </Row>
              </Form>
              } */}
              

              <Button 
                variant="outline-primary bg-dark text-light" 
                size="sm"
                onClick={() => setShowCodeForm(prev => !prev)}
                >
                  {
                    !showCodeForm ? '● Add New':'Cancel'
                  }
              </Button>
            </Form.Group>
            



            <Form.Group className="mb-3">
              <Form.Label>Services Name</Form.Label>
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
            </Form.Group>

            <div className="table-responsive">
              <Table bordered>
                <thead>
                  <tr>
                    <th>Service Code</th>
                    <th>Service Name</th>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit Cost ({selectedCurrency?.symbol? selectedCurrency?.symbol: '$'})</th>
                    <th>VAT (18%)</th>
                    <th>Total Tax Incl.</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.codeName}</td>
                      <td>
    
                        {/* <Form.Control 
                          type="text" 
                          value={item.name} 
                          disabled
                        /> */}

                        <Form.Select
                          value={item.service}
                          onChange={(e) => {
                            const { value, selectedOptions } = e.target;
                            if (value && value.toLowerCase() !== "select") {
                              // const name = selectedOptions[0]?.dataset.name;
                              // const description = selectedOptions[0]?.dataset.description;
                              handleItemChange(index,'service',value,enableTax)
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
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value,enableTax)}
                        />
                      </td>
                      <td>
                        <Form.Control 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value,enableTax)}
                        />
                      </td>
                      <td>
                        <Form.Control 
                          type="number" 
                          value={item.unitCost} 
                          onChange={(e) => handleItemChange(index, 'unitCost', e.target.value,enableTax)}
                        />
                      </td>
                      <td>{item.vat}</td>
                      {/* <td>{selectedCurrency?.symbol? selectedCurrency?.symbol: '$'} {item.total.toFixed(2)}</td> */}
                      <td className="text-end">{(Number(item?.quantity * item?.unitCost) + Number(item?.quantity * item?.unitCost * 0.18)).toLocaleString()}</td>

                      <td>
                        <Button variant="link" onClick={() => deleteItem(index)}>
                          <i className="bi bi-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
                <Button 
                    variant="outline-primary bg-dark text-light" 
                    size="sm"
                    onClick={() => addNewItem()}
                  >
                    ● Add New
                </Button>
            </div>
          </div>

          {/* Calculation Section */}
          <div className="row mb-4">
            <div className="col-md-6">
              <h3 className="h5 mb-3">Extra Information</h3>
              <div className="d-flex mb-3">
                {/* <Button variant="primary" className="me-2">📝 Add Notes</Button> */}
                <Button variant="primary" className="me-2">📄 Add Terms & Conditions</Button>
                {/* <Button variant="outline-secondary">🏦 Bank Details</Button> */}
              </div>
              <Form.Group>
                <Form.Label>Terms & Conditions</Form.Label>
                <Form.Control as="textarea" rows={3} placeholder="Enter Terms & Conditions..."
                  value={formData.termsConditions}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({...formData, termsConditions: value});
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
                  <span>{numberToWords(total)} {selectedCurrency?.cName ? selectedCurrency?.cName: 'Dollars'}</span>
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
      <AddService
        show={showServiceForm}
        onHide={() => setShowServiceForm(false)}
        newClient={newService}
        setNewClient={setNewService}
        handleAddClient={handleAddService}
        loading={loading}/>
        <AddServiceCode
          show={showCodeForm}
          onHide={() => showCodeForm(false)}
          newClient={newCode}
          setNewClient={setNewCode}
          handleAddCode={handleAddCode}
          loading={loading}
        />

      </>
  );
  
};


export default QuotationModal;



