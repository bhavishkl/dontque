import { Card, CardBody, Button, Divider } from "@nextui-org/react";
import { Check, AlertCircle } from "lucide-react";

export default function ReviewStep({ formData }) {
  const renderSection = (title, data, validator) => {
    const isComplete = validator(data);
    
    return (
      <Card className="bg-white dark:bg-gray-800">
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            {isComplete ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
          </div>
          
          {renderSectionContent(title, data)}
          
          {!isComplete && (
            <p className="text-sm text-yellow-500 mt-2">
              Some required information is missing
            </p>
          )}
        </CardBody>
      </Card>
    );
  };

  const renderSectionContent = (title, data) => {
    switch (title) {
      case "Business Details":
        return (
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {data.name || 'Not set'}</p>
            <p><span className="font-medium">Category:</span> {data.category || 'Not set'}</p>
            <p><span className="font-medium">Location:</span> {data.city || 'Not set'}</p>
            <p><span className="font-medium">Contact:</span> {data.phone || 'Not set'}</p>
          </div>
        );
      
      case "Queue Configuration":
        return (
          <div className="space-y-2">
            <p><span className="font-medium">Type:</span> {data.queueType || 'Not set'}</p>
            <p><span className="font-medium">Capacity:</span> {data.maxCapacity || 'Not set'}</p>
            <p><span className="font-medium">Service Time:</span> {data.serviceTime || 'Not set'} minutes</p>
            <p><span className="font-medium">Hours:</span> {data.openingTime && data.closingTime ? 
              `${data.openingTime} - ${data.closingTime}` : 'Not set'}</p>
          </div>
        );
      
      case "Services":
        return (
          <div className="space-y-2">
            <p><span className="font-medium">Total Services:</span> {data.length}</p>
            {data.map((service, index) => (
              <div key={index} className="text-sm">
                • {service.name} ({service.duration}min, ${service.price})
              </div>
            ))}
          </div>
        );
      
      case "Staff":
        return (
          <div className="space-y-2">
            <p><span className="font-medium">Total Staff:</span> {data.length}</p>
            {data.map((staff, index) => (
              <div key={index} className="text-sm">
                • {staff.name} ({staff.role})
              </div>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Review Your Setup</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Please review your queue configuration before finalizing.
        </p>
      </div>

      <div className="space-y-4">
        {renderSection("Business Details", formData.business, 
          (data) => data.name && data.category && data.city)}
        
        {renderSection("Queue Configuration", formData.queue,
          (data) => data.queueType && data.maxCapacity && data.serviceTime)}
        
        {renderSection("Services", formData.services,
          (data) => data.length > 0)}
        
        {renderSection("Staff", formData.staff,
          (data) => data.length > 0)}
      </div>
    </div>
  );
} 