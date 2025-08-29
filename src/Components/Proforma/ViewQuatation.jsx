import React from 'react';
import { Modal, Button, Table, Row, Col, Card, Spinner } from 'react-bootstrap';
import siteLogo from '../../assets/imgs/agencyLogo.png'
import barndMark from '../../assets/imgs/brandmark.png'
import PDFDownloadButton from '../ReUsable/PDFDownloadButton';

const ViewQuatation = ({ show, handleClose, quotation }) => {
  const componentRef = React.useRef();
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // const calculateTotals = () => {
  //   const amount = quotation?.items?.reduce((sum, item) => sum + (item.total || 0), 0);
  //   const vat =  amount * 0.18;
  //   // const sgst = enableTax ? amount * 0.09 : 0;
  //   const total = amount + vat;
    
  //   return { amount, vat, total: total };
  // };

  // const { amount, vat, total } = calculateTotals();

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
  

const handlePDFSuccess = (result) => {
    console.log('PDF generated successfully:', result.filename);
  };

  const handlePDFError = (error) => {
    console.error('PDF generation failed:', error);
    alert('Failed to generate PDF. Please try again.');
  };

  // Print only the modal body content
  const handlePrintToPDF = () => {
    if (!quotation) {
      alert('No quotation data available');
      return;
    }

    // Create a new window and print only the quotation content
    const printWindow = window.open('', '_blank');
    const printContent = componentRef.current.innerHTML;
    
    // Get current page styles
    const styleSheets = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          // Handle cross-origin stylesheets
          return '';
        }
      })
      .join('\n');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Quotation ${quotation?.quotationId || ''}</title>
          <style>
            ${styleSheets}
            @media print {
              body { margin: 0; padding: 20px; }
              .no-print { display: none !important; }
              .modal-header, .modal-footer { display: none !important; }
              body::before{
              content: "";
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-image: url(${barndMark});
              background-repeat: repeat;
              background-position: center;
              background-size: contain;
              opacity: 0.1;
              pointer-events: none;
            }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };
  };



  return (
    <Modal show={show} onHide={handleClose} size="xl" centered className="quotation-view-modal">
      {/* <Modal.Header closeButton>
        <Modal.Title>Quotation Details</Modal.Title>
      </Modal.Header> */}
      <Modal.Body>
        <div className="quotation-modal">
        {!quotation ? (
          <div className="alert alert-info my-5">PROFORMA not found</div>
        ) : (
          <div ref={componentRef} className="print-section p-4" style={{backgroundColor:'transparent'}}>
            {/* Header Section */}
            <div className="d-flex justify-content-between ">
              <div className="col-md-3">
                <img src={siteLogo} className='img-fluid' alt=""/>
              </div>

              <div className="text-start">
                <h4 className="mb-1">{quotation?.billedBy?.name || 'Company Name'}</h4>
                {/* <p className="text-muted mb-1"><strong>Address:</strong> {quotation?.billedBy?.address}</p> */}
                <p className="fw-bold mb-1"><strong>TIN:</strong> {quotation?.billedBy?.tinNumber}</p>
                <p className="fw-bold mb-1"><strong>Email:</strong> {quotation?.billedBy?.email}</p>
                {/* <p className="mb-1"><strong>Status:</strong> <span className="text-capitalize">{quotation?.status}</span></p> */}
              </div>
            </div>

<hr/>
            <div className="d-flex justify-content-between mb-4">
              <div className=' mt-3'>
                <div className='bordered-left px-2'>
                  <h4 className="mb-1 colored-text">PROFORMA TO</h4>
                  <h3 className="fw-bold mb-1">{quotation?.billedTo?.name}</h3>
                </div>
              </div>
              
              <div className="text-start  mt-3">
                <h2 className="colored-text"><strong>N<sup>o</sup>: </strong> {quotation?.quotationId}</h2>
                {/* <p className="fw-bold mb-1"><strong>N<sup>o</sup>: </strong> {quotation?.quotationId}</p> */}
                <p className="fw-bold mb-1"><strong>Date:</strong> {formatDate(quotation?.quotationDate)}</p>
                {/* <p className="mb-1"><strong>Status:</strong> <span className="text-capitalize">{quotation?.status}</span></p> */}
              </div>
            </div>

            <p className="text-muted">
              Reference to your proforma request, {quotation?.billedBy?.name} proposes the following:
            </p>
            {/* Items Table */}
            <div className="table-responsive">
              <Table bordered className="table">
                <thead className="thead-dark">
                  <tr>
                    <th width="5%">#</th>
                    <th width="15%">Service Code</th>
                    <th width="20%">Service</th>
                    {/* <th width="30%">Description</th> */}
                    <th width="5%" className="text-end">Qty</th>
                    <th width="15%" className="text-end">Unit Price</th>
                    {
                    quotation?.enableTax &&
                    <>
                      <th width="5%" className="text-end">VAT</th>
                      <th width="5%" className="text-end">Tax %</th>
                    </>
                    }
                    <th width="10%" className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation?.items?.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item?.service?.code}</td>
                      <td>{item?.service?.service}</td>
                      {/* <td>{item?.description}</td> */}
                      <td className="text-end">{item?.quantity}</td>
                      <td className="text-end">{item?.unitCost?.toLocaleString()}</td>
                      {
                        quotation?.enableTax ?
                        <>
                          <td className="text-end">{(Number(item?.total*18)/100).toLocaleString()}</td>
                          <td className="text-end">18%</td>
                          <td className="text-end">{(Number(item?.total?.toFixed(2)) + Number((item?.total*18)/100)).toLocaleString()}</td>
                        </>
                      :
                      <td className="text-end">{item?.total.toLocaleString()}</td>
                      }
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <Row>
              <Col md={8} className='mt-4'>
                <div className='bordered-left px-2'>
                  <h6 className="mb-1 colored-text">TOTAL IN WORDS:</h6>
                  <h6 className="fw-bold mb-1">{numberToWords(quotation?.totalAmount)}</h6>
                </div>
              </Col>
              <Col>
{/* 
              {
                quotation?.enableTax &&
                <>
                  <div className='bg-dark text-light align-items-center d-flex justify-content-between p-3'>
                    <span>VAT:</span>
                    <span>{quotation?.currency} {(quotation?.totalAmount*18)/100}</span>
                  </div>
                  <div className='bg-dark text-light align-items-center d-flex justify-content-between px-3 py-2'>
                    <span>Total:</span>
                    <span>{quotation?.currency} {quotation?.totalAmount - (quotation?.totalAmount*18)/100}</span>
                  </div>
                </>
              } */}
              <div className='bg-dark text-light align-items-center d-flex justify-content-between p-3'>
                <span>Total:</span>
                <span>{quotation?.currency} {Number(quotation?.totalAmount).toLocaleString()}</span>
              </div>
              
              </Col>
            </Row>

            {/* Totals Section */}
            
            {/* <Row>
              <Col md={{ span: 6, offset: 6 }}>
                <Table bordered>
                  <tbody>
                    <tr>
                      <td><strong>Subtotal</strong></td>
                      <td className="text-end">{amount?.toFixed(2) || '0.00'}</td>
                    </tr>
                    {quotation?.enableTax && (
                      <tr>
                        <td><strong>VAT (18%)</strong></td>
                        <td className="text-end">{vat?.toFixed(2) || '0.00'}</td>
                      </tr>
                    )}
                    <tr className="table-active">
                      <td><strong>Total Amount</strong></td>
                      <td className="text-end"><strong>{total?.toFixed(2) || '0.00'}</strong></td>
                    </tr>
                    {quotation?.roundOffTotal && quotation?.roundOffDifference && (
                      <tr>
                        <td><strong>Round Off</strong></td>
                        <td className="text-end">{quotation?.roundOffDifference.toFixed(2)}</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Col>
            </Row> */}

            {/* Amount in Words */}
            <div className="card p-3 my-4 col-md-4 rounded-4">
              <h6 className="mb-1 colored-text">BANK DETAILS</h6>
              <Table>
                <tr>
                  <td className='p-1'><strong>Bank Name:</strong></td>
                  <td className='p-1'><strong>Bank of Kigali</strong></td>
                </tr>
                <tr>
                  <td className='p-1'><strong>Account Name:</strong></td>
                  <td className='p-1'><strong>SYMBOLIX Ltd</strong></td>
                </tr>
                <tr>
                  <td className='p-1'><strong>Account No:</strong></td>
                  <td className='p-1'><strong>100089237666</strong></td>
                </tr>
                <tr>
                  <td className='p-1'><strong>Swift Code</strong></td>
                  <td className='p-1'><strong>BKIGRWRW</strong></td>
                </tr>
              </Table>
            </div>

            {/* Terms and Conditions */}
            {quotation?.termsAndConditions && (
              <div className="mt-4">
                <h5 className="mb-2">Terms & Conditions</h5>
                <div className="text-muted" dangerouslySetInnerHTML={{ __html: quotation?.termsAndConditions }} />
              </div>
            )}

            <p className="text-muted text-center">
              <small style={{color:'rgba(0, 0, 0, 0.15)'}}>
                THIS IS A CUMPUTED PROFORMA BY {quotation?.billedBy?.name}. NO SIGNATURE/STAMP REQUIRED
              </small>
            </p>

            {/* Signature Section */}
            {/* <div className="mt-5 pt-4">
              <Row>
                <Col md={6}>
                  <div className="border-top pt-3">
                    <p className="mb-1"><strong>Customer's Signature</strong></p>
                    <p className="text-muted">Date: ________________</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="border-top pt-3 text-end">
                    <p className="mb-1"><strong>For {quotation?.billedBy?.name || 'Company Name'}</strong></p>
                    <p className="text-muted">Authorized Signature</p>
                  </div>
                </Col>
              </Row>
            </div> */}
          </div>
        )}
        </div>
      </Modal.Body>
      <Modal.Footer className="no-print">
        <Button variant="outline-secondary" onClick={handleClose}>
          Close
        </Button>
        {/* <Button variant="outline-primary" onClick={handlePrintToPDF} className="me-2">
          Print
        </Button> */}
        {/* <Button variant="primary" onClick={handleDownloadPDF}>
          Download PDF
        </Button> */}
        <PDFDownloadButton
          targetRef={componentRef}
          filename={`Quotation_${quotation?.quotationId || 'Unknown'}_${quotation?.billedTo?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Customer'}.pdf`}
          buttonText="Download PDF"
          variant="primary"
          onSuccess={handlePDFSuccess}
          onError={handlePDFError}
          pdfOptions={{
            scale: 2,
            margins: { top: 15, right: 15, bottom: 15, left: 15 },
            pageSize: 'a4',
            orientation: 'portrait'
          }}
        />

      </Modal.Footer>
    </Modal>
  );
};

export default ViewQuatation;