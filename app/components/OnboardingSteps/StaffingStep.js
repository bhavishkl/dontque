import { useState } from 'react';
import { Button, Input, Card, CardBody, Select, SelectItem, IconButton, Chip } from "@nextui-org/react";
import { Plus, X, Edit2, UserPlus, Users } from "lucide-react";

export default function StaffingStep({ data, onUpdate }) {
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    role: '',
    assignedCounter: ''
  });
  const [editingIndex, setEditingIndex] = useState(null);

  const roles = [
    { value: 'manager', label: 'Queue Manager' },
    { value: 'operator', label: 'Counter Operator' },
    { value: 'assistant', label: 'Queue Assistant' }
  ];

  const handleAddStaff = () => {
    if (editingIndex !== null) {
      const updatedStaff = [...data];
      updatedStaff[editingIndex] = newStaff;
      onUpdate(updatedStaff);
      setEditingIndex(null);
    } else {
      onUpdate([...data, newStaff]);
    }
    setNewStaff({ name: '', email: '', role: '', assignedCounter: '' });
  };

  const handleEditStaff = (index) => {
    setNewStaff(data[index]);
    setEditingIndex(index);
  };

  const handleDeleteStaff = (index) => {
    const updatedStaff = data.filter((_, i) => i !== index);
    onUpdate(updatedStaff);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Staff Management</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Add staff members who will manage your queue operations.
        </p>
      </div>

      <Card className="bg-gray-50 dark:bg-gray-800">
        <CardBody className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Staff Name"
              placeholder="Enter staff name"
              value={newStaff.name}
              onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
            />
            <Input
              label="Email"
              placeholder="Enter staff email"
              value={newStaff.email}
              onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Role"
              placeholder="Select role"
              value={newStaff.role}
              onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
            >
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </Select>
            <Input
              label="Counter Number"
              placeholder="Assign counter (optional)"
              value={newStaff.assignedCounter}
              onChange={(e) => setNewStaff({ ...newStaff, assignedCounter: e.target.value })}
            />
          </div>

          <Button
            color="primary"
            startContent={<UserPlus className="w-4 h-4" />}
            onClick={handleAddStaff}
          >
            {editingIndex !== null ? 'Update Staff' : 'Add Staff Member'}
          </Button>
        </CardBody>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Staff List</h3>
          <Chip startContent={<Users className="w-4 h-4" />}>
            {data.length} Members
          </Chip>
        </div>

        {data.map((staff, index) => (
          <Card key={index} className="bg-white dark:bg-gray-800">
            <CardBody className="flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="font-semibold">{staff.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {staff.email}
                </p>
                <div className="flex gap-2">
                  <Chip size="sm" color="primary">{roles.find(r => r.value === staff.role)?.label}</Chip>
                  {staff.assignedCounter && (
                    <Chip size="sm">Counter #{staff.assignedCounter}</Chip>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <IconButton
                  size="sm"
                  variant="light"
                  onClick={() => handleEditStaff(index)}
                >
                  <Edit2 className="w-4 h-4" />
                </IconButton>
                <IconButton
                  size="sm"
                  variant="light"
                  color="danger"
                  onClick={() => handleDeleteStaff(index)}
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