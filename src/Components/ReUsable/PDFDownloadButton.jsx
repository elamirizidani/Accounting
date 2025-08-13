import React from 'react';
import { Button, Spinner } from 'react-bootstrap';
import usePDFGenerator from '../../../hooks/usePDFGenerator';

const PDFDownloadButton = ({
  targetRef,
  filename,
  buttonText = 'Download PDF',
  variant = 'primary',
  size,
  className,
  disabled = false,
  onSuccess,
  onError,
  pdfOptions = {},
  children,
  ...buttonProps
}) => {
  const { generatePDF, isGeneratingPDF } = usePDFGenerator();

  const handleDownload = async () => {
    if (!targetRef?.current) {
      const error = new Error('Target element not found');
      if (onError) {
        onError(error);
      } else {
        alert('Target element not found for PDF generation');
      }
      return;
    }

    try {
      const result = await generatePDF(targetRef.current, {
        filename: filename || 'document.pdf',
        ...pdfOptions
      });
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        alert('Failed to generate PDF. Please try again.');
      }
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={disabled || isGeneratingPDF}
      onClick={handleDownload}
      {...buttonProps}
    >
      {isGeneratingPDF ? (
        <>
          <Spinner size="sm" className="me-2" />
          Generating PDF...
        </>
      ) : (
        children || buttonText
      )}
    </Button>
  );
};

export default PDFDownloadButton;