'use client'

import { QRCodeSVG } from 'qrcode.react';
import { Card, CardBody, Button } from "@nextui-org/react";
import { Printer } from 'lucide-react';

export default function QueueQRCode({ queueId, queueName }) {
  // Generate the quick join URL with the full domain
  const quickJoinUrl = `${window.location.origin}/quick-join/${queueId}`;
  
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Queue QR Code - ${queueName || 'Quick Join'}</title>
          <style>
            body { 
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .qr-container {
              text-align: center;
              padding: 20px;
            }
            .queue-name {
              font-size: 32px;
              margin-bottom: 20px;
            }
            .instructions {
              font-size: 18px;
              color: #666;
              margin-top: 20px;
            }
            /* Make QR code larger for printing */
            svg {
              width: 400px !important;
              height: 400px !important;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            ${queueName ? `<div class="queue-name">${queueName}</div>` : ''}
            ${document.querySelector('#qr-code-svg').outerHTML}
            <p class="instructions">Scan to join the queue</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };
  
  return (
    <Card className="w-fit mx-auto">
      <CardBody className="flex flex-col items-center gap-4 p-6">
        <QRCodeSVG 
          id="qr-code-svg"
          value={quickJoinUrl}
          size={200}
          level="H"
          includeMargin={true}
          className="bg-white p-2 rounded-lg"
        />
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Scan to quickly join the queue
        </p>
        <Button
          color="primary"
          variant="flat"
          startContent={<Printer size={18} />}
          onClick={handlePrint}
        >
          Print QR Code
        </Button>
      </CardBody>
    </Card>
  );
} 