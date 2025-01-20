import { Button, Card, CardBody } from "@nextui-org/react";
import { CheckCircle2, ArrowRight, Download, Share2 } from "lucide-react";
import QueueQRCode from "../QueueQRCode";

export default function SuccessStep({ queueId }) {
  return (
    <div className="space-y-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold">Setup Complete!</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          Your queue has been successfully configured. You're now ready to start managing your queues efficiently.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-gray-50 dark:bg-gray-800">
          <CardBody className="p-6 text-center space-y-4">
            <h3 className="font-semibold">Quick Access QR Code</h3>
            <div className="flex justify-center">
              <QueueQRCode queueId={queueId} queueName="Your Queue" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Display this QR code at your location for easy queue access
            </p>
            <Button
              variant="flat"
              color="primary"
              startContent={<Download className="w-4 h-4" />}
              className="w-full"
              onClick={() => {/* Add download functionality */}}
            >
              Download QR Code
            </Button>
          </CardBody>
        </Card>

        <Card className="bg-gray-50 dark:bg-gray-800">
          <CardBody className="p-6 space-y-4">
            <h3 className="font-semibold text-center">Next Steps</h3>
            <div className="space-y-3">
              <Button
                variant="flat"
                color="primary"
                className="w-full"
                href="/dashboard/manage"
                as="a"
                startContent={<ArrowRight className="w-4 h-4" />}
              >
                Go to Queue Dashboard
              </Button>
              
              <Button
                variant="flat"
                color="secondary"
                className="w-full"
                onClick={() => {
                  navigator.share({
                    title: "My Queue",
                    text: "Join my queue using this link!",
                    url: `/queue/${queueId}`
                  });
                }}
                startContent={<Share2 className="w-4 h-4" />}
              >
                Share Queue Link
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Pro Tips:</h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 text-left space-y-2">
          <li>• Print and display the QR code at your location</li>
          <li>• Brief your staff about the queue management system</li>
          <li>• Consider setting up email notifications</li>
          <li>• Customize your queue settings anytime from the dashboard</li>
        </ul>
      </div>
    </div>
  );
} 