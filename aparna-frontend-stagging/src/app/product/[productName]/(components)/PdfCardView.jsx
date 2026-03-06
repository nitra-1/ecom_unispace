import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PdfCardView = ({ url, catalogecaptiontext, ...props }) => {
  return (
    <div className="pdf_link" {...props}>
      <span className="pdf_label">pdf</span>
      <div className="img_download_wraper">
        <div className="pdf_page_wrapper">
          <Document file={url}>
            <Page
              pageNumber={1}
              width={263}
              height={263}
              renderTextLayer={false}
              className="canvas_pdf"
            />
          </Document>
        </div>
        <span className="download_label">
          <i className="m-icon download-icon"></i>
          DOWNLOAD
        </span>
      </div>
      <span className="caption_pdftext">{catalogecaptiontext}</span>
    </div>
  );
};

export default PdfCardView;
