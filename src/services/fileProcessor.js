import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
// In a production environment, you might want to bundle the worker or host it locally
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const processFile = async (file) => {
  return new Promise((resolve, reject) => {
    const fileType = file.type;

    if (fileType === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const typedarray = new Uint8Array(e.target.result);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          let fullText = '';
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += `--- Page ${i} ---\n${pageText}\n`;
          }
          
          resolve({
            id: crypto.randomUUID(),
            name: file.name,
            type: fileType,
            content: fullText,
            originalFile: file
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);

    } else if (fileType.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          id: crypto.randomUUID(),
          name: file.name,
          type: fileType,
          base64: e.target.result,
          originalFile: file
        });
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);

    } else if (fileType === 'text/plain' || fileType === 'application/json' || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          id: crypto.randomUUID(),
          name: file.name,
          type: fileType,
          content: e.target.result,
          originalFile: file
        });
      };
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);

    } else {
      // For unsupported types, we can try to read as text or just reject
      // Let's reject for now to be safe
      reject(new Error(`Unsupported file type: ${fileType}`));
    }
  });
};
