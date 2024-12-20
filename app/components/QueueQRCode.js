'use client'

import { QRCodeSVG } from 'qrcode.react';
import { Card, CardBody } from "@nextui-org/react";

export default function QueueQRCode({ queueId }) {
  // Generate the quick join URL with the full domain
  const quickJoinUrl = `${window.location.origin}/quick-join/${queueId}`;
  
  return (
    <Card className="w-fit mx-auto">
      <CardBody className="flex flex-col items-center gap-4 p-6">
        <QRCodeSVG 
          value={quickJoinUrl}
          size={200}
          level="H"
          includeMargin={true}
          className="bg-white p-2 rounded-lg"
        />
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Scan to quickly join the queue
        </p>
      </CardBody>
    </Card>
  );
} 