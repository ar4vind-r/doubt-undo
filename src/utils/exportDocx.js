import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

/**
 * Exports session doubt feed to Microsoft Word (.docx) document
 */
export async function exportSessionToDOCX(sessionData) {
  const { code, createdAt, endedAt, participantCount, totalDoubts, doubts } = sessionData;

  const sortedDoubts = [...doubts].sort((a, b) => {
    if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
    return b.createdAt - a.createdAt;
  });

  const startDateStr = new Date(createdAt).toLocaleString();
  const endDateStr = endedAt ? new Date(endedAt).toLocaleString() : 'Active / Continuous';

  // Build Document Rows
  const tableRows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "#", bold: true, color: "FFFFFF" })] })], width: { size: 5, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Author", bold: true, color: "FFFFFF" })] })], width: { size: 18, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Upvotes", bold: true, color: "FFFFFF" })] })], width: { size: 12, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Status", bold: true, color: "FFFFFF" })] })], width: { size: 15, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Doubt & Resolution", bold: true, color: "FFFFFF" })] })], width: { size: 50, type: WidthType.PERCENTAGE } }),
      ],
      tableHeader: true,
    })
  ];

  sortedDoubts.forEach((doubt, index) => {
    const statusText = (doubt.status || 'pending').toUpperCase();
    const mediaBadge = doubt.mediaType ? ` [Media Attachment: ${doubt.mediaType}]` : '';

    const contentParagraphs = [
      new Paragraph({
        children: [new TextRun({ text: `${doubt.text || '(No text content)'}${mediaBadge}`, size: 22 })]
      })
    ];

    if (doubt.teacherReply) {
      contentParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Teacher Response: ', bold: true, color: '4F46E5', size: 20 }),
            new TextRun({ text: doubt.teacherReply, italic: true, size: 20 })
          ]
        })
      );
    }

    tableRows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: String(index + 1) })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: doubt.handle || 'Anonymous', bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(doubt.upvotes || 0), bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: statusText, color: doubt.status === 'answered' ? '10B981' : '6366F1' })] })] }),
          new TableCell({ children: contentParagraphs })
        ]
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "Doubt Undo? — Live Class Doubt Record",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Session Code: `, bold: true }),
              new TextRun({ text: code, color: "6366F1", bold: true }),
              new TextRun({ text: `  |  Date: ${startDateStr}` })
            ],
            spacing: { after: 120 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Participants: ${participantCount || 1}  |  Total Doubts: ${totalDoubts || doubts.length}  |  Status: ${endDateStr}` })
            ],
            spacing: { after: 300 }
          }),
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE }
          })
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `DoubtUndo_Session_${code}.docx`);
}
