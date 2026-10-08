import { ResumePage } from "@features/resume/pages/ResumePage";

export default function Page() {
  const pdfUrl = process.env.RESUME_PDF_URL;
  if (!pdfUrl) {
    throw new Error("RESUME_PDF_URL is not set");
  }

  return <ResumePage pdfUrl={pdfUrl} />;
}
