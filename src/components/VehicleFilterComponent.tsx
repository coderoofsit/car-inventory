import React, { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import * as RadixSlider from '@radix-ui/react-slider';
import { Button } from '@/components/ui/button';

export interface FilterOption {
  value: string;
  label: string;
}

export interface RangeFilter {
  min: number;
  max: number;
}

export interface VehicleFilters {
  brands: string[];
  models: string[];
  bodyStyles: string[];
  fuelTypes: string[];
  transmission: string;
  ownership: string;
  yearRange: RangeFilter;
  priceRange: RangeFilter;
  kmRunRange: RangeFilter;
}

interface VehicleFilterComponentProps {
  filters: VehicleFilters;
  setFilters: React.Dispatch<React.SetStateAction<VehicleFilters>>;
  onApply?: () => void;
  onClear?: () => void;
  brandOptions: FilterOption[];
  modelOptions: FilterOption[];
  fuelTypeOptions: FilterOption[];
  transmissionOptions: FilterOption[];
}

const VehicleFilterComponent: React.FC<VehicleFilterComponentProps> = ({ filters, setFilters, onApply, onClear, brandOptions, modelOptions, fuelTypeOptions, transmissionOptions }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const bodyStyleOptions: FilterOption[] = [
    { value: 'sedan', label: 'Sedan' },
    { value: 'suv', label: 'SUV' },
    { value: 'hatchback', label: 'Hatchback' },
    { value: 'coupe', label: 'Coupe' },
    { value: 'convertible', label: 'Convertible' }
  ];

  const ownershipOptions: FilterOption[] = [
    { value: 'first', label: 'First Owner' },
    { value: 'second', label: 'Second Owner' },
    { value: 'third', label: 'Third Owner' },
    { value: 'fourth', label: 'Fourth Owner' },
    { value: 'other', label: 'Other' },
  ];

  const handleDropdownToggle = (dropdownName: string) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const handleMultiSelect = (filterKey: keyof VehicleFilters, value: string) => {
    const currentValues = filters[filterKey] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    setFilters(prev => ({
      ...prev,
      [filterKey]: newValues
    }));
  };

  const handleSingleSelect = (filterKey: keyof VehicleFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setOpenDropdown(null);
  };

  const handleRangeChange = (filterKey: keyof VehicleFilters, minMax: 'min' | 'max', value: number) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: {
        ...(prev[filterKey] as RangeFilter),
        [minMax]: value
      }
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return `${mileage.toLocaleString()} KM`;
  };

  const getDisplayText = (filterKey: keyof VehicleFilters, placeholder: string) => {
    const values = filters[filterKey];
    if (!Array.isArray(values)) return placeholder;
    if (values.length === 0) return placeholder;
    if (values.length === 1) return values[0];
    return `${values.length} selected`;
  };

  const CustomDropdown: React.FC<{
    label: string;
    placeholder: string;
    options: FilterOption[];
    values: string[];
    onSelect: (value: string) => void;
    filterKey: keyof VehicleFilters;
    isMulti?: boolean;
  }> = ({ label, placeholder, options, values, onSelect, filterKey, isMulti = true }) => {
    const isOpen = openDropdown === filterKey;

    return (
      <div className="relative">
        <button
          onClick={() => handleDropdownToggle(filterKey)}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-left text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm">
              {isMulti ? getDisplayText(filterKey, placeholder) : (values[0] || placeholder)}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => isMulti ? handleMultiSelect(filterKey, option.value) : handleSingleSelect(filterKey, option.value)}
                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${
                  values.includes(option.value) ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  {isMulti && (
                    <input
                      type="checkbox"
                      checked={values.includes(option.value)}
                      readOnly
                      className="mr-2 text-blue-600"
                    />
                  )}
                  {option.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const RangeSlider: React.FC<{
    label: string;
    min: number;
    max: number;
    value: RangeFilter;
    onChange: (min: number, max: number) => void;
    formatter?: (value: number) => string;
  }> = ({ label, min, max, value, onChange, formatter = (v) => v.toString() }) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="px-3 py-2 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">{formatter(value.min)}</span>
            <span className="text-sm text-gray-600">{formatter(value.max)}</span>
          </div>
          <RadixSlider.Root
            className="relative flex items-center w-full h-10"
            min={min}
            max={max}
            step={1}
            value={[value.min, value.max]}
            onValueChange={([minVal, maxVal]) => onChange(minVal, maxVal)}
          >
            <RadixSlider.Track className="bg-gray-200 relative grow rounded-full h-2">
              <RadixSlider.Range className="absolute bg-green-500 rounded-full h-2" />
            </RadixSlider.Track>
            <RadixSlider.Thumb asChild>
              <img
                src="/icons/car.svg"
                alt="Car Min"
                className="w-9 h-6 -mt-2"
                draggable={false}
                style={{ pointerEvents: 'none' }}
              />
            </RadixSlider.Thumb>
            <RadixSlider.Thumb asChild>
              <img
                src="/icons/car.svg"
                alt="Car Max"
                className="w-9 h-6 -mt-2"
                draggable={false}
                style={{ transform: 'scaleX(-1)', pointerEvents: 'none' }}
              />
            </RadixSlider.Thumb>
          </RadixSlider.Root>
        </div>
      </div>
    );
  };

  // Default filter values for clearing
  const defaultFilters: VehicleFilters = {
    brands: [],
    models: [],
    bodyStyles: [],
    fuelTypes: [],
    transmission: '',
    ownership: '',
    yearRange: { min: 2012, max: 2020 },
    priceRange: { min: 0, max: 1000000 },
    kmRunRange: { min: 25000, max: 78000 }
  };

  const handleClear = () => {
    setFilters(defaultFilters);
    if (onClear) onClear();
  };

  return (
    <div className="w-full p-6 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
          <CustomDropdown
            label="Brand"
            placeholder="Select Brand(s)"
            options={brandOptions}
            values={filters.brands}
            onSelect={() => {}}
            filterKey="brands"
            isMulti={true}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
          <CustomDropdown
            label="Model"
            placeholder="Select Model(s)"
            options={modelOptions}
            values={filters.models}
            onSelect={() => {}}
            filterKey="models"
            isMulti={true}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Body Style</label>
          <CustomDropdown
            label="Body Style"
            placeholder="Select Body Style(s)"
            options={bodyStyleOptions}
            values={filters.bodyStyles}
            onSelect={() => {}}
            filterKey="bodyStyles"
            isMulti={true}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
          <CustomDropdown
            label="Fuel Type"
            placeholder="Select Fuel Type(s)"
            options={fuelTypeOptions}
            values={filters.fuelTypes}
            onSelect={() => {}}
            filterKey="fuelTypes"
            isMulti={true}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
          <CustomDropdown
            label="Transmission"
            placeholder="Select Transmission"
            options={transmissionOptions}
            values={[filters.transmission]}
            onSelect={(value) => handleSingleSelect('transmission', value)}
            filterKey="transmission"
            isMulti={false}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ownership</label>
          <CustomDropdown
            label="Ownership"
            placeholder="Select Ownership"
            options={ownershipOptions}
            values={[filters.ownership]}
            onSelect={(value) => handleSingleSelect('ownership', value)}
            filterKey="ownership"
            isMulti={false}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RangeSlider
          label="Year"
          min={2000}
          max={2024}
          value={filters.yearRange}
          onChange={(min, max) => { handleRangeChange('yearRange', 'min', min); handleRangeChange('yearRange', 'max', max); }}
        />

        <RangeSlider
          label="Price"
          min={0}
          max={1000000}
          value={filters.priceRange}
          onChange={(min, max) => { handleRangeChange('priceRange', 'min', min); handleRangeChange('priceRange', 'max', max); }}
          formatter={formatPrice}
        />

        <RangeSlider
          label="KM Run"
          min={0}
          max={200000}
          value={filters.kmRunRange}
          onChange={(min, max) => { handleRangeChange('kmRunRange', 'min', min); handleRangeChange('kmRunRange', 'max', max); }}
          formatter={formatMileage}
        />
      </div>

      <div className="flex justify-end mt-8 gap-4">
        <Button type="button" variant="outline" onClick={handleClear} className="px-8 py-3 text-base font-semibold">
          Clear Filters
        </Button>
        <Button type="button" onClick={onApply} className="px-8 py-3 text-base font-semibold">
          Apply Filters
        </Button>
      </div>

      <style>
        {`
          .slider-thumb::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            background: #10b981;
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          .slider-thumb::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: #10b981;
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
        `}
      </style>
    </div>
  );
};

export default VehicleFilterComponent; 