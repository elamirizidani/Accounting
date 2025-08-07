import React, { useEffect, useState } from 'react';
import { Modal, Button, Table, Row, Col, Card, Spinner } from 'react-bootstrap';
import { fetchData } from '../../../utility/api';
import siteLogo from '../../assets/imgs/logo.svg'
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ViewQuatation = ({ show, handleClose, quotation }) => {
  const componentRef = React.useRef();
const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateTotals = () => {
    const amount = quotation?.items?.reduce((sum, item) => sum + (item.total || 0), 0);
    const vat =  amount * 0.18;
    // const sgst = enableTax ? amount * 0.09 : 0;
    const total = amount + vat;
    
    return { amount, vat, total: total };
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
  



   const handleDownloadPDF = async () => {
    if (!quotation) {
      alert('No quotation data available');
      return;
    }

    setIsGeneratingPDF(true);

    try {
      const element = componentRef.current;
      
      // Configure html2canvas options for better quality
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate filename
      const filename = `Quotation_${quotation?.quotationId || 'Unknown'}_${quotation?.billedTo?.name || 'Customer'}.pdf`;
      
      // Save the PDF
      pdf.save(filename);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
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
      <Modal.Header closeButton>
        <Modal.Title>Quotation Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="quotation-modal">
        {!quotation ? (
          <div className="alert alert-info my-5">Quotation not found</div>
        ) : (
          <div ref={componentRef} className="print-section bg-white p-4">
            {/* Header Section */}
            <div className="d-flex justify-content-between mb-4">
              <div className="logo">
                <img src={siteLogo} alt=""/>
              </div>

              <div className="text-start">
                <h4 className="mb-1">{quotation?.billedBy?.name || 'Company Name'}</h4>
                <p className="text-muted mb-1"><strong>Address:</strong> {quotation?.billedBy?.address}</p>
                <p className="text-muted mb-1"><strong>Phone:</strong> {quotation?.billedBy?.phone}</p>
                <p className="text-muted mb-1"><strong>Email:</strong> {quotation?.billedBy?.email}</p>
                {/* <p className="mb-1"><strong>Status:</strong> <span className="text-capitalize">{quotation?.status}</span></p> */}
              </div>
            </div>


            <div className="d-flex justify-content-between mb-4">
              <div>
                <div className='bordered-left px-2'>
                  <h4 className="mb-1 colored-text">QUOTATION TO</h4>
                  <h3 className="fw-bold mb-1">{quotation?.billedTo?.name}</h3>
                </div>
              </div>
              
              <div className="text-start">
                <h2 className="colored-text">QUOTATION</h2>
                <p className="mb-1"><strong>Quotation:</strong> {quotation?.quotationId}</p>
                <p className="text-muted mb-1"><strong>Date:</strong> {formatDate(quotation?.quotationDate)}</p>
                {/* <p className="mb-1"><strong>Status:</strong> <span className="text-capitalize">{quotation?.status}</span></p> */}
              </div>
            </div>

            <p className="text-muted">
              Reference to your quotations request {quotation?.billedBy?.name} proposes the following:
            </p>
            {/* Items Table */}
            <div className="table-responsive">
              <Table bordered className="table">
                <thead className="thead-dark">
                  <tr>
                    <th width="5%">#</th>
                    <th width="25%">Service</th>
                    <th width="35%">Description</th>
                    <th width="10%" className="text-end">Qty</th>
                    <th width="10%" className="text-end">Unit Price</th>
                    <th width="15%" className="text-end">Total ({quotation?.currency})</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation?.items?.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item?.service?.service}</td>
                      <td>{item?.description}</td>
                      <td className="text-end">{item?.quantity}</td>
                      <td className="text-end">{item?.unitCost?.toFixed(2)}</td>
                      <td className="text-end">{item?.total?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <Row>
              <Col md={8} className='mt-4'>
                <div className='bordered-left px-2'>
                  <h6 className="mb-1 colored-text">TOTAL IN WORDS:</h6>
                  <h6 className="fw-bold mb-1">{numberToWords(total)}</h6>
                </div>
              </Col>
              <Col>
              <div className='bg-dark text-light align-items-center d-flex justify-content-between p-3'>
                <span>Total:</span>
              <span>{quotation?.currency} {total}</span>
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
            </div>

            {/* Terms and Conditions */}
            {quotation?.termsAndConditions && (
              <div className="mt-4">
                <h5 className="mb-2">Terms & Conditions</h5>
                <div className="text-muted" dangerouslySetInnerHTML={{ __html: quotation?.termsAndConditions }} />
              </div>
            )}

            <p className="text-muted text-center">
              <small>
                THIS IS A CUMPUTED QUOTATION BY {quotation?.billedBy?.name}. NO SIGNATURE REQUIRED
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
        <Button variant="outline-primary" onClick={handlePrintToPDF} className="me-2">
          Print
        </Button>
        <Button variant="primary" onClick={handleDownloadPDF}>
          Download PDF
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewQuatation;