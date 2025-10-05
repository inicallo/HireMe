import pdf from 'pdfkit';
import { Writable } from 'stream';

export const generatePdf = async (content: any): Promise<Buffer> => {
  const doc = new pdf({ margin: 40 });
  const buffers: Buffer[] = [];

  const writable = new Writable({
    write(chunk, encoding, callback) {
      buffers.push(chunk);
      callback();
    },
  });

  doc.pipe(writable);

  // Header
  doc
    .fontSize(24)
    .font('Helvetica-Bold')
    .text(content.fullName || 'Unnamed', { align: 'center' })
    .moveDown(0.5);

  // Sub-header
  doc
    .fontSize(12)
    .font('Helvetica')
    .text(`Email: ${content.email || ''}`, { align: 'center' })
    .text(`Phone: ${content.phone || ''}`, { align: 'center' })
    .moveDown(1);

  // Summary Section
  if (content.summary) {
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Professional Summary', { underline: true })
      .moveDown(0.5);
    doc.fontSize(12).font('Helvetica').text(content.summary).moveDown(1);
  }

  // Work Experience Section
  if (content.experiences && content.experiences.length > 0) {
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Work Experience', { underline: true })
      .moveDown(0.5);

    content.experiences.forEach((exp: any) => {
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(`${exp.position} at ${exp.company} (${exp.years} years)`)
        .moveDown(0.2);
      doc
        .fontSize(12)
        .font('Helvetica')
        .text(`Responsibilities: ${exp.responsibilities || 'N/A'}`)
        .moveDown(0.5);
    });
  }

  // Skills Section
  if (content.skills && content.skills.length > 0) {
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Skills', { underline: true })
      .moveDown(0.5);
    content.skills.forEach((skill: string) => {
      doc.fontSize(12).font('Helvetica').text(`- ${skill}`).moveDown(0.2);
    });
    doc.moveDown(1);
  }

  // Education Section
  if (content.education && content.education.length > 0) {
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Education', { underline: true })
      .moveDown(0.5);

    content.education.forEach((edu: any) => {
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(`${edu.degree} - ${edu.institution} (${edu.year})`)
        .moveDown(0.5);
    });
  }

  doc.end();

  return new Promise((resolve, reject) => {
    writable.on('finish', () => resolve(Buffer.concat(buffers as Uint8Array[])));
    writable.on('error', reject);
  });
};