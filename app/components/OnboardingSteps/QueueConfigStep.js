import { Input, Select, SelectItem, Switch, Tabs, Tab } from "@nextui-org/react";
import { Clock, Users, Timer } from "lucide-react";

export default function QueueConfigStep({ data, onUpdate }) {
  const handleChange = (field, value) => {
    onUpdate({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Queue Configuration</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Set up how your queue will operate and manage customer flow.
        </p>
      </div>

      <Tabs aria-label="Queue Configuration Options">
        <Tab 
          key="basic" 
          title={
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Basic Settings</span>
            </div>
          }
        >
          <div className="mt-4 space-y-4">
            <Select
              label="Queue Type"
              placeholder="Select queue type"
              value={data.queueType || ''}
              onChange={(e) => handleChange('queueType', e.target.value)}
            >
              <SelectItem key="default">Standard Queue</SelectItem>
              <SelectItem key="advanced">Advanced (Multiple Services)</SelectItem>
              <SelectItem key="priority">Priority Based</SelectItem>
            </Select>

            <Input
              type="number"
              label="Maximum Capacity"
              placeholder="Enter maximum queue capacity"
              startContent={<Users className="w-4 h-4 text-gray-400" />}
              value={data.maxCapacity || ''}
              onChange={(e) => handleChange('maxCapacity', e.target.value)}
            />

            <Input
              type="number"
              label="Average Service Time (minutes)"
              placeholder="Enter average time per customer"
              startContent={<Timer className="w-4 h-4 text-gray-400" />}
              value={data.serviceTime || ''}
              onChange={(e) => handleChange('serviceTime', e.target.value)}
            />
          </div>
        </Tab>

        <Tab 
          key="hours" 
          title={
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Operating Hours</span>
            </div>
          }
        >
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="time"
                label="Opening Time"
                value={data.openingTime || ''}
                onChange={(e) => handleChange('openingTime', e.target.value)}
              />
              <Input
                type="time"
                label="Closing Time"
                value={data.closingTime || ''}
                onChange={(e) => handleChange('closingTime', e.target.value)}
              />
            </div>

            <Input
              type="time"
              label="Service Start Time"
              value={data.serviceStartTime || ''}
              onChange={(e) => handleChange('serviceStartTime', e.target.value)}
            />

            <div className="space-y-4">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                <div key={day} className="flex items-center justify-between">
                  <span className="capitalize">{day}</span>
                  <Switch
                    checked={data.operatingDays?.[day] || false}
                    onChange={(e) => {
                      handleChange('operatingDays', {
                        ...data.operatingDays,
                        [day]: e.target.checked
                      });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
} 