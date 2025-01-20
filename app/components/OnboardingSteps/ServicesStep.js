import { useState } from 'react';
import { Button, Input, Card, CardBody, Chip, IconButton } from "@nextui-org/react";
import { Plus, X, Edit2, DollarSign, Clock } from "lucide-react";

export default function ServicesStep({ data, onUpdate }) {
  const [newService, setNewService] = useState({
    name: '',
    duration: '',
    price: '',
    description: ''
  });
  const [editingIndex, setEditingIndex] = useState(null);

  const handleAddService = () => {
    if (editingIndex !== null) {
      const updatedServices = [...data];
      updatedServices[editingIndex] = newService;
      onUpdate(updatedServices);
      setEditingIndex(null);
    } else {
      onUpdate([...data, newService]);
    }
    setNewService({ name: '', duration: '', price: '', description: '' });
  };

  const handleEditService = (index) => {
    setNewService(data[index]);
    setEditingIndex(index);
  };

  const handleDeleteService = (index) => {
    const updatedServices = data.filter((_, i) => i !== index);
    onUpdate(updatedServices);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Services Configuration</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Add the services you offer to your customers.
        </p>
      </div>

      <Card className="bg-gray-50 dark:bg-gray-800">
        <CardBody className="space-y-4">
          <Input
            label="Service Name"
            placeholder="Enter service name"
            value={newService.name}
            onChange={(e) => setNewService({ ...newService, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Duration (minutes)"
              placeholder="Service duration"
              startContent={<Clock className="w-4 h-4 text-gray-400" />}
              value={newService.duration}
              onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
            />
            <Input
              type="number"
              label="Price"
              placeholder="Service price"
              startContent={<DollarSign className="w-4 h-4 text-gray-400" />}
              value={newService.price}
              onChange={(e) => setNewService({ ...newService, price: e.target.value })}
            />
          </div>

          <Input
            label="Description"
            placeholder="Service description"
            value={newService.description}
            onChange={(e) => setNewService({ ...newService, description: e.target.value })}
          />

          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onClick={handleAddService}
          >
            {editingIndex !== null ? 'Update Service' : 'Add Service'}
          </Button>
        </CardBody>
      </Card>

      <div className="space-y-4">
        {data.map((service, index) => (
          <Card key={index} className="bg-white dark:bg-gray-800">
            <CardBody className="flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="font-semibold">{service.name}</h3>
                <div className="flex gap-2">
                  <Chip size="sm" color="primary">{service.duration} min</Chip>
                  <Chip size="sm" color="secondary">${service.price}</Chip>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {service.description}
                </p>
              </div>
              <div className="flex gap-2">
                <IconButton
                  size="sm"
                  variant="light"
                  onClick={() => handleEditService(index)}
                >
                  <Edit2 className="w-4 h-4" />
                </IconButton>
                <IconButton
                  size="sm"
                  variant="light"
                  color="danger"
                  onClick={() => handleDeleteService(index)}
                >
                  <X className="w-4 h-4" />
                </IconButton>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
} 