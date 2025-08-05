import React, { useEffect, useState } from 'react';
import { Modal, Button, Table, Row, Col, Card, Spinner } from 'react-bootstrap';
import { fetchData } from '../../../utility/api';
// import { useReactToPrint } from 'react-to-print';
// import './QuotationModalView.css';

const ViewQuatation = ({ show, handleClose, quotation }) => {
  const componentRef = React.useRef();
console.log(quotation)

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


  return (
    <Modal show={show} onHide={handleClose} size="xl" centered className="quotation-view-modal">
      <Modal.Header closeButton>
        <Modal.Title>Quotation Details - {quotation?.referenceNumber || 'Loading...'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!quotation ? (
          <div className="alert alert-info my-5">Quotation not found</div>
        ) : (
          <div ref={componentRef} className="print-section bg-white p-4">
            {/* Header Section */}
            <div className="d-flex justify-content-between mb-4">
              <div>
                <h1 className="h3 mb-1">{quotation?.billedBy?.name || 'Company Name'}</h1>
                <p className="text-muted mb-1">{quotation?.billedBy?.address}</p>
                <p className="text-muted mb-1">
                  Phone: {quotation?.billedBy?.phone} | Email: {quotation?.billedBy?.email}
                </p>
              </div>
              <div className="text-end">
                <h2 className="h4 text-primary">QUOTATION</h2>
                <p className="mb-1"><strong>Date:</strong> {formatDate(quotation?.quotationDate)}</p>
                <p className="mb-1"><strong>Reference:</strong> {quotation?.referenceNumber}</p>
                {/* <p className="mb-1"><strong>Status:</strong> <span className="text-capitalize">{quotation?.status}</span></p> */}
              </div>
            </div>

            {/* Bill To Section */}
            <Row className="mb-4">
              <Col md={6}>
                <Card className="border-0 bg-light">
                  <Card.Body>
                    <h5 className="card-title">Bill To</h5>
                    <p className="mb-1"><strong>{quotation?.billedTo?.name}</strong></p>
                    <p className="mb-1 text-muted">{quotation?.billedTo?.address}</p>
                    <p className="mb-1 text-muted">Phone: {quotation?.billedTo?.phone}</p>
                    <p className="mb-0 text-muted">Email: {quotation?.billedTo?.email}</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="border-0 bg-light">
                  <Card.Body>
                    <h5 className="card-title">Quotation Details</h5>
                    <p className="mb-1"><strong>Currency:</strong> {quotation?.currency}</p>
                    {/* <p className="mb-1"><strong>Valid Until:</strong> {formatDate(quotation?.validUntil)}</p> */}
                    {quotation?.additionalNotes && (
                      <p className="mb-0"><strong>Notes:</strong> {quotation?.additionalNotes}</p>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Items Table */}
            <div className="mb-4">
              <Table bordered className="mb-0">
                <thead className="bg-light">
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

            {/* Totals Section */}
            <Row>
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
            </Row>

            {/* Amount in Words */}
            <div className="mt-3">
              <p className="mb-1"><strong>Amount in Words:</strong></p>
              <p className="text-muted">
                {numberToWords(total)} {quotation?.currency} Only
              </p>
            </div>

            {/* Terms and Conditions */}
            {quotation?.termsAndConditions && (
              <div className="mt-4">
                <h5 className="mb-2">Terms & Conditions</h5>
                <div className="text-muted" dangerouslySetInnerHTML={{ __html: quotation?.termsAndConditions }} />
              </div>
            )}

            {/* Signature Section */}
            <div className="mt-5 pt-4">
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
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="no-print">
        <Button variant="outline-secondary" onClick={handleClose}>
          Close
        </Button>
        {/* <Button variant="outline-primary" onClick={handlePrint} className="me-2">
          Print
        </Button> */}
        <Button variant="primary">
          Download PDF
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewQuatation;