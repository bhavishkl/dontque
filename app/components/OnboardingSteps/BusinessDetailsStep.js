import { Input, Select, SelectItem, Textarea } from "@nextui-org/react";
import { cityCoordinates } from '../../utils/cities';

export default function BusinessDetailsStep({ data, onUpdate }) {
  const handleChange = (field, value) => {
    onUpdate({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Business Details</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Let's get started by collecting some basic information about your business.
        </p>
      </div>

      <Input
        label="Business Name"
        placeholder="Enter your business name"
        value={data.name || ''}
        onChange={(e) => handleChange('name', e.target.value)}
      />

      <Select
        label="Business Category"
        placeholder="Select your business category"
        value={data.category || ''}
        onChange={(e) => handleChange('category', e.target.value)}
      >
        {[
          'Restaurants',
          'Healthcare',
          'Retail',
          'Banking',
          'Government Services',
          'Education',
          'Professional Services',
          'Entertainment'
        ].map((category) => (
          <SelectItem key={category} value={category}>
            {category}
          </SelectItem>
        ))}
      </Select>

      <Select
        label="City"
        placeholder="Select your city"
        value={data.city || ''}
        onChange={(e) => handleChange('city', e.target.value)}
      >
        {Object.keys(cityCoordinates).map((city) => (
          <SelectItem key={city} value={city}>
            {city}
          </SelectItem>
        ))}
      </Select>

      <Input
        label="Business Address"
        placeholder="Enter your complete address"
        value={data.address || ''}
        onChange={(e) => handleChange('address', e.target.value)}
      />

      <Input
        label="Contact Number"
        placeholder="Enter business contact number"
        value={data.phone || ''}
        onChange={(e) => handleChange('phone', e.target.value)}
      />

      <Textarea
        label="Business Description"
        placeholder="Tell us about your business"
        value={data.description || ''}
        onChange={(e) => handleChange('description', e.target.value)}
      />
    </div>
  );
} 