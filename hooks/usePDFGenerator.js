import { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import barndMark from '../src/assets/imgs/brandmark.png'

const usePDFGenerator = () => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const generatePDF = async (element, options = {}) => {
    if (!element) {
      throw new Error('No element provided for PDF generation');
    }

    setIsGeneratingPDF(true);



    async function tintImage(base64Img, color = "#808080") {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = base64Img;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Apply grey filter
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = color; // grey tint
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";

      resolve(canvas.toDataURL("image/png"));
    };
  });
}


    const toBase64 = (url) =>
    fetch(url)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
          })
      );


    try {
      // Default options
      const defaultOptions = {
        filename: 'document.pdf',
        scale: 2,
        quality: 1.0,
        margins: { top: 10, right: 10, bottom: 10, left: 10 }, // in mm
        pageSize: 'a4', // 'a4', 'letter', etc.
        orientation: 'portrait', // 'portrait' or 'landscape'
        backgroundColor: 'transparent',
        removeBoxShadow: false,
        removeBorder: false,
        watermark: barndMark
      };

      const config = { ...defaultOptions, ...options };

      // Store original styles
      const originalOverflow = document.body.style.overflow;
      const originalPosition = element.style.position;
      const originalZIndex = element.style.zIndex;

      // Optimize element for PDF capture
      element.style.position = 'relative';
      element.style.zIndex = '9999';
      // element.style.backgroundColor = config.backgroundColor;

      // Configure html2canvas
      const canvas = await html2canvas(element, {
        scale: config.scale,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: 'transparent',
        width: element.offsetWidth,
        height: element.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          if (config.removeBoxShadow || config.removeBorder) {
            const clonedElements = clonedDoc.querySelectorAll('*');
            clonedElements.forEach(el => {
              if (config.removeBoxShadow) {
                el.style.boxShadow = 'none';
              }
              if (config.removeBorder) {
                el.style.border = 'none';
              }
            });
          }
        }
      });

      // Restore original styles
      element.style.position = originalPosition;
      element.style.zIndex = originalZIndex;
      document.body.style.overflow = originalOverflow;

      const imgData = canvas.toDataURL('image/png', config.quality);

      // PDF dimensions based on page size
      const pageSizes = {
        a4: { width: 210, height: 297 },
        letter: { width: 216, height: 279 },
        legal: { width: 216, height: 356 }
      };

      const pageSize = pageSizes[config.pageSize] || pageSizes.a4;
      const pdfWidth = config.orientation === 'landscape' ? pageSize.height : pageSize.width;
      const pdfHeight = config.orientation === 'landscape' ? pageSize.width : pageSize.height;

      const margin = config.margins;
      const contentWidth = pdfWidth - (margin.left + margin.right);
      const contentHeight = pdfHeight - (margin.top + margin.bottom);

      // Calculate scaling to fit content properly
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(
        contentWidth / (imgWidth * 0.264583),
        contentHeight / (imgHeight * 0.264583)
      );

      const scaledWidth = imgWidth * 0.264583 * ratio;
      const scaledHeight = imgHeight * 0.264583 * ratio;

      // Create PDF
      const pdf = new jsPDF(
        config.orientation === 'landscape' ? 'l' : 'p',
        'mm',
        config.pageSize
      );

      // Center the content on the page
      const xOffset = (pdfWidth - scaledWidth) / 2;
      const yOffset = margin.top;


      let watermarkBase64 = null;
      if (config.watermark) {
        let originalBase64 = await toBase64(config.watermark);
        watermarkBase64 = await tintImage(originalBase64, "#808080");

        const img = new Image();
        img.src = watermarkBase64;

        await new Promise(resolve => {
          img.onload = resolve;
        });

        const wmWidth = img.naturalWidth;
        const wmHeight = img.naturalHeight;

        // Center it at bottom of page
        const wmX = (pdfWidth - wmWidth) / 2;
        const wmY = pdfHeight - wmHeight - 10;

        if (pdf.setGState) pdf.setGState(new pdf.GState({ opacity: 0.07 }));
        pdf.addImage(watermarkBase64, 'PNG', wmX, wmY, wmWidth, wmHeight, undefined, 'FAST');

        // Reset opacity back to normal
        if (pdf.setGState) pdf.setGState(new pdf.GState({ opacity: 1 }));
      }
      

      // Check if content fits on one page
      if (scaledHeight <= contentHeight) {
        // Single page
        pdf.addImage(imgData, 'PNG', xOffset, yOffset, scaledWidth, scaledHeight);
      } else {
        // Multiple pages
        let remainingHeight = scaledHeight;
        let currentY = 0;

        while (remainingHeight > 0) {
          const pageContentHeight = Math.min(remainingHeight, contentHeight);

          if (currentY > 0) {
            pdf.addPage();
          }

          // Calculate the source rectangle for this page
          const sourceY = (currentY / scaledHeight) * imgHeight;
          const sourceHeight = (pageContentHeight / scaledHeight) * imgHeight;

          // Create a temporary canvas for this page slice
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = imgWidth;
          tempCanvas.height = sourceHeight;
          const tempCtx = tempCanvas.getContext('2d');

          // Draw the slice
          tempCtx.drawImage(canvas, 0, sourceY, imgWidth, sourceHeight, 0, 0, imgWidth, sourceHeight);
          const tempImgData = tempCanvas.toDataURL('image/png', config.quality);

          pdf.addImage(tempImgData, 'PNG', xOffset, yOffset, scaledWidth, pageContentHeight);

          remainingHeight -= pageContentHeight;
          currentY += pageContentHeight;
        }
      }

      // Save the PDF
      pdf.save(config.filename);

      return { success: true, filename: config.filename };

    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return {
    generatePDF,
    isGeneratingPDF
  };
};

export default usePDFGenerator;