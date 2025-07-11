import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, X, Search } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface VehicleAddDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicleData: any) => void;
}

const VehicleAddDialog: React.FC<VehicleAddDialogProps> = ({ isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState("info");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [vehicleData, setVehicleData] = useState({
    // Vehicle Information
    vin: '',
    year: '',
    make: '',
    model: '',
    trim: '',
    bodyStyle: '',
    doors: '',
    manufactureMonth: '',
    manufactureYear: '',
    brand: '',
    noOfOwner: '',
    homeTestDrive: '',
    registrationMonth: '',
    registrationYear: '',
    insuranceValidityMonth: '',
    insuranceValidityYear: '',
    insuranceValid: '',
    insuranceType: '',
    rto: '',
    engineCapacity: '',
    // Vehicle Details (add missing fields)
    bodyStyleDetails: '',
    ownerDetails: '',
    homeTestDriveDetails: '',
    kmRun: '',
    fuelTypeDetails: '',
    transmissionTypeDetails: '',
    exteriorColorDetails: '',
    interiorColorDetails: '',
    condition: '',
    sellingPrice: '',
    status: '',
    mileage: '',
    mileageUnit: '',
    fuelType: '',
    driveType: '',
    transmissionType: '',
    engineType: '',
    exteriorColor: '',
    interiorColor: '',
    description: '',
    // Vehicle Features
    interior: [],
    convenience: [],
    safety: [],
    exterior: [],
    performance: [],
    documentsAvailable: [],
    additional: []
  });

  // Add state for new additional feature input
  const [newAdditionalFeature, setNewAdditionalFeature] = useState<string>('');

  const handleInputChange = (field: string, value: string) => {
    setVehicleData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setUploadedImages(prev => [...prev, result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave({ ...vehicleData, images: uploadedImages });
    onClose();
  };

  // 1. Update featureCategories to match the provided lists
  const featureCategories = {
    interior: [
      'Cloth Seats', 'Leather Seats', 'Heated Seats', 'Power Adjustments', 'Memory Settings', 'Manual Air Conditioning', 'Automatic Climate Control', 'Multi-Zone Climate Control', 'Touchscreen Size', 'Navigation', 'Apple CarPlay', 'Android Auto', 'Bose Audio System', 'Harman Audio System', 'Bluetooth', 'USB Ports', 'Wi-Fi Hotspot', 'Analog Instrumentation', 'Digital Instrumentation', 'Head-Up Display Instrumentation', 'Cargo Volume Storage', 'Reading Lights', 'Ambient Lighting', 'Center Console', 'Seatback Pockets'
    ],
    convenience: [
      'Side Window Sunshades', 'Rear Window Sunshades', 'Third-Row Seating', 'Split-Folding Rear Seats', 'Hands-Free Tailgate', 'Power Liftgate', 'Adaptive Cruise Control', 'Standard Cruise Control', 'Mounted Controls Steering Wheel', 'Heated Steering Wheel', 'Tilt and Telescopic Steering Wheel', 'One-Touch Up/Down Windows', 'Power Windows', 'Push-Button Start', 'Proximity Key'
    ],
    safety: [
      'Immobilizer', 'Alarm System', 'Child Door Locks', 'LATCH System', 'NHTSA', 'IIHS', 'Adaptive Headlights', 'Automatic High Beams', 'Traction Control System', 'Electronic Stability Control', 'Automated Parking', 'Parking Sensors', 'Rearview Camera', 'Blind Spot Monitoring', 'Lane Departure Warning', 'Adaptive Cruise Control', 'Curtain Airbags', 'Side Airbags', 'Front Airbags'
    ],
    exterior: [
      'LED Headlights', 'Halogen Headlights', 'Daytime Running Lights', 'Fog Headlights', 'Panoramic Sunroof', 'Standard Sunroof', 'Panoramic Moonroof', 'Standard Moonroof', 'Heated Mirrors', 'Power-Folding Mirrors', 'Auto-Dimming Mirrors', 'Roof Rails', 'Standard Paint', 'Metallic Paint', 'Custom Paint'
    ],
    performance: [
      'Anti-Lock Braking System (ABS)', 'Drum Brakes', 'Disc Brakes', 'Adaptive Suspension', 'Sport-Tuned Suspension', 'Standard Suspension', 'Combined MPG', 'Highway MPG', 'City MPG', 'All-Wheel Drive', 'Rear-Wheel Drive', 'Front-Wheel Drive', 'CVT Transmission', 'Automatic Transmission', 'Manual Transmission', 'Torque Engine', 'Horsepower Engine', 'Displacement Engine', 'Electric Engine', 'V6 Engine', 'Inline-4 Engine'
    ],
    documentsAvailable: ['No', 'Yes'],
    additional: []
  };

  const toggleFeature = (category: string, feature: string) => {
    setVehicleData(prev => ({
      ...prev,
      [category]: prev[category as keyof typeof prev].includes(feature)
        ? (prev[category as keyof typeof prev] as string[]).filter(f => f !== feature)
        : [...(prev[category as keyof typeof prev] as string[]), feature]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="relative fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[700px] max-w-none p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 relative">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid  grid-cols-4 mx-6 mt-4 mb-0 max-w-3xl justify-self-center">
                {[{ value: "info", label: "Vehicle Information" }, { value: "details", label: "Vehicle Details" }, { value: "photos", label: "Vehicle Photos" }, { value: "features", label: "Vehicle Features" }].map(tab => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={`text-sm transition-colors duration-150
                      ${activeTab === tab.value
                        ? "shadow-none hover:bg-blue-900"
                        : "bg-transparent text-gray-800 hover:bg-gray-100"}
                      rounded-t-md font-medium outline-none border-none focus:ring-0`}
                    style={activeTab === tab.value ? { backgroundColor: '#1e3a8a', color: '#fff' } : {}}
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Make the tab content area absolutely positioned and scrollable */}
              <div className="absolute left-0 right-0 top-[72px] bottom-0 overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(100% - 72px)' }}>
                <TabsContent value="info" className="mt-0 space-y-1">
                  <div className="flex flex-col gap-4 items-center">
                    {/* VIN */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="vin" className="text-sm font-semibold text-gray-700 whitespace-nowrap">VIN:</Label>
                      <div className="relative flex-1">
                        <Input
                          id="vin"
                          placeholder="Enter VIN"
                          value={vehicleData.vin}
                          onChange={(e) => handleInputChange('vin', e.target.value)}
                          className="border border-gray-300 bg-blue-50 text-gray-700 placeholder:text-gray-400 rounded-lg px-3 py-2 h-11 pr-10"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 bg-blue-100 rounded p-1" />
                      </div>
                    </div>
                    {/* Manufacture Year (Month, Year) */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="manufactureMonth" className="text-sm font-semibold text-gray-700 whitespace-nowrap">Manufacture Month:</Label>
                      <Input
                        id="manufactureMonth"
                        placeholder="MM"
                        value={vehicleData.manufactureMonth || ''}
                        onChange={(e) => handleInputChange('manufactureMonth', e.target.value)}
                        className="border border-gray-300 bg-blue-50 text-gray-700 placeholder:text-gray-400 rounded-lg px-3 py-2 h-11"
                        maxLength={2}
                      />
                      <Label htmlFor="manufactureYear" className="text-sm font-semibold text-gray-700 whitespace-nowrap">Year:</Label>
                      <Input
                        id="manufactureYear"
                        placeholder="YYYY"
                        value={vehicleData.manufactureYear || ''}
                        onChange={(e) => handleInputChange('manufactureYear', e.target.value)}
                        className="border border-gray-300 bg-blue-50 text-gray-700 placeholder:text-gray-400 rounded-lg px-3 py-2 h-11"
                        maxLength={4}
                      />
                    </div>
                    {/* Brand */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="brand" className="text-sm font-semibold text-gray-700 whitespace-nowrap">Brand:</Label>
                      <Input
                        id="brand"
                        placeholder="Enter Brand"
                        value={vehicleData.brand || ''}
                        onChange={(e) => handleInputChange('brand', e.target.value)}
                        className="border border-gray-300 bg-blue-50 text-gray-700 placeholder:text-gray-400 rounded-lg px-3 py-2 h-11"
                      />
                    </div>
                    {/* Body Style */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="bodyStyle" className="text-sm font-semibold text-gray-700 whitespace-nowrap">Body Style:</Label>
                      <Select value={vehicleData.bodyStyle} onValueChange={(value) => handleInputChange('bodyStyle', value)}>
                        <SelectTrigger className="border border-gray-300 bg-blue-50 text-gray-700 rounded-lg px-3 py-2 h-11">
                          <SelectValue placeholder="Select Body Style" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* TODO: Add actual options */}
                          <SelectItem value="sedan">Sedan</SelectItem>
                          <SelectItem value="suv">SUV</SelectItem>
                          <SelectItem value="hatchback">Hatchback</SelectItem>
                          <SelectItem value="coupe">Coupe</SelectItem>
                          <SelectItem value="convertible">Convertible</SelectItem>
                          <SelectItem value="wagon">Wagon</SelectItem>
                          <SelectItem value="truck">Truck</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* No. of Owner */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="noOfOwner" className="text-sm font-semibold text-gray-700 whitespace-nowrap">No. of Owner:</Label>
                      <Select value={vehicleData.noOfOwner || ''} onValueChange={(value) => handleInputChange('noOfOwner', value)}>
                        <SelectTrigger className="border border-gray-300 bg-blue-50 text-gray-700 rounded-lg px-3 py-2 h-11">
                          <SelectValue placeholder="Select Owner Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not-registered">Not Registered</SelectItem>
                          <SelectItem value="1st-owner">1st Owner</SelectItem>
                          <SelectItem value="2nd-owner">2nd Owner</SelectItem>
                          <SelectItem value="3rd-owner">3rd Owner</SelectItem>
                          <SelectItem value="4th-owner">4th Owner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Home Test Drive Available? */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="homeTestDrive" className="text-sm font-semibold text-gray-700 whitespace-nowrap">Home Test Drive Available?</Label>
                      <Select value={vehicleData.homeTestDrive || ''} onValueChange={(value) => handleInputChange('homeTestDrive', value)}>
                        <SelectTrigger className="border border-gray-300 bg-blue-50 text-gray-700 rounded-lg px-3 py-2 h-11">
                          <SelectValue placeholder="Select Option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Registration Year (Month, Year) */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="registrationMonth" className="text-sm font-semibold text-gray-700 whitespace-nowrap">Registration Month:</Label>
                      <Input
                        id="registrationMonth"
                        placeholder="MM"
                        value={vehicleData.registrationMonth || ''}
                        onChange={(e) => handleInputChange('registrationMonth', e.target.value)}
                        className="border border-gray-300 bg-blue-50 text-gray-700 placeholder:text-gray-400 rounded-lg px-3 py-2 h-11"
                        maxLength={2}
                      />
                      <Label htmlFor="registrationYear" className="text-sm font-semibold text-gray-700 whitespace-nowrap">Year:</Label>
                      <Input
                        id="registrationYear"
                        placeholder="YYYY"
                        value={vehicleData.registrationYear || ''}
                        onChange={(e) => handleInputChange('registrationYear', e.target.value)}
                        className="border border-gray-300 bg-blue-50 text-gray-700 placeholder:text-gray-400 rounded-lg px-3 py-2 h-11"
                        maxLength={4}
                      />
                    </div>
                    {/* Insurance Validity (Month, Year, Yes/No) */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="insuranceValidityMonth" className="text-sm font-semibold text-gray-700 whitespace-nowrap">Insurance Validity Month:</Label>
                      <Input
                        id="insuranceValidityMonth"
                        placeholder="MM"
                        value={vehicleData.insuranceValidityMonth || ''}
                        onChange={(e) => handleInputChange('insuranceValidityMonth', e.target.value)}
                        className="border border-gray-300 bg-blue-50 text-gray-700 placeholder:text-gray-400 rounded-lg px-3 py-2 h-11"
                        maxLength={2}
                      />
                      <Label htmlFor="insuranceValidityYear" className="text-sm font-semibold text-gray-700 whitespace-nowrap">Year:</Label>
                      <Input
                        id="insuranceValidityYear"
                        placeholder="YYYY"
                        value={vehicleData.insuranceValidityYear || ''}
                        onChange={(e) => handleInputChange('insuranceValidityYear', e.target.value)}
                        className="border border-gray-300 bg-blue-50 text-gray-700 placeholder:text-gray-400 rounded-lg px-3 py-2 h-11"
                        maxLength={4}
                      />
                      <Label htmlFor="insuranceValid" className="text-sm font-semibold text-gray-700 whitespace-nowrap">Valid?</Label>
                      <Select value={vehicleData.insuranceValid || ''} onValueChange={(value) => handleInputChange('insuranceValid', value)}>
                        <SelectTrigger className="border border-gray-300 bg-blue-50 text-gray-700 rounded-lg px-3 py-2 h-11">
                          <SelectValue placeholder="Yes/No" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Insurance Type */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="insuranceType" className="text-sm font-semibold text-gray-700 whitespace-nowrap">Insurance Type:</Label>
                      <Input
                        id="insuranceType"
                        placeholder="Enter Insurance Type"
                        value={vehicleData.insuranceType || ''}
                        onChange={(e) => handleInputChange('insuranceType', e.target.value)}
                        className="border border-gray-300 bg-blue-50 text-gray-700 placeholder:text-gray-400 rounded-lg px-3 py-2 h-11"
                      />
                    </div>
                    {/* RTO */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="rto" className="text-sm font-semibold text-gray-700 whitespace-nowrap">RTO:</Label>
                      <Input
                        id="rto"
                        placeholder="Enter RTO"
                        value={vehicleData.rto || ''}
                        onChange={(e) => handleInputChange('rto', e.target.value)}
                        className="border border-gray-300 bg-blue-50 text-gray-700 placeholder:text-gray-400 rounded-lg px-3 py-2 h-11"
                      />
                    </div>
                    {/* Engine Capacity (cc) */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="engineCapacity" className="text-sm font-semibold text-gray-700 whitespace-nowrap">Engine Capacity (cc):</Label>
                      <Input
                        id="engineCapacity"
                        placeholder="Enter Engine Capacity"
                        type="number"
                        value={vehicleData.engineCapacity || ''}
                        onChange={(e) => handleInputChange('engineCapacity', e.target.value)}
                        className="border border-gray-300 bg-blue-50 text-gray-700 placeholder:text-gray-400 rounded-lg px-3 py-2 h-11"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="mt-0 space-y-4">
                  <div className="flex flex-col gap-4 items-center">
                    {/* Condition */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="condition" className="text-sm font-semibold text-gray-700 whitespace-nowrap">Condition:</Label>
                      <Select value={vehicleData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                        <SelectTrigger className="border border-gray-300 bg-blue-50 text-gray-700 rounded-lg px-3 py-2 h-11">
                          <SelectValue placeholder="Select Condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="used">Used</SelectItem>
                          <SelectItem value="certified-pre-owned">Certified Pre-Owned</SelectItem>
                          <SelectItem value="demo-car">Demo Car</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Selling Price */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="sellingPrice" className="text-sm font-semibold text-gray-700 whitespace-nowrap">Selling Price (INR):</Label>
                      <Input
                        id="sellingPrice"
                        placeholder="Enter Selling Price"
                        type="number"
                        value={vehicleData.sellingPrice}
                        onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                        className="border border-gray-300 bg-blue-50 text-gray-700 placeholder:text-gray-400 rounded-lg px-3 py-2 h-11"
                      />
                    </div>
                    {/* Status */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="status" className="text-sm font-semibold text-gray-700 whitespace-nowrap">Status:</Label>
                      <Select value={vehicleData.status} onValueChange={(value) => handleInputChange('status', value)}>
                        <SelectTrigger className="border border-gray-300 bg-blue-50 text-gray-700 rounded-lg px-3 py-2 h-11">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="sold">Sold</SelectItem>
                          <SelectItem value="reserved">Reserved</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Body Style */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="bodyStyleDetails" className="text-sm font-semibold text-gray-700 whitespace-nowrap">Body Style:</Label>
                      <Select value={vehicleData.bodyStyleDetails || ''} onValueChange={(value) => handleInputChange('bodyStyleDetails', value)}>
                        <SelectTrigger className="border border-gray-300 bg-blue-50 text-gray-700 rounded-lg px-3 py-2 h-11">
                          <SelectValue placeholder="Select Body Style" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* TODO: Add actual options */}
                          <SelectItem value="sedan">Sedan</SelectItem>
                          <SelectItem value="suv">SUV</SelectItem>
                          <SelectItem value="hatchback">Hatchback</SelectItem>
                          <SelectItem value="coupe">Coupe</SelectItem>
                          <SelectItem value="convertible">Convertible</SelectItem>
                          <SelectItem value="wagon">Wagon</SelectItem>
                          <SelectItem value="truck">Truck</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Owner */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="ownerDetails" className="text-sm font-semibold text-gray-700 whitespace-nowrap">Owner:</Label>
                      <Select value={vehicleData.ownerDetails || ''} onValueChange={(value) => handleInputChange('ownerDetails', value)}>
                        <SelectTrigger className="border border-gray-300 bg-blue-50 text-gray-700 rounded-lg px-3 py-2 h-11">
                          <SelectValue placeholder="Select Owner Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not-registered">Not Registered</SelectItem>
                          <SelectItem value="1st-owner">1st Owner</SelectItem>
                          <SelectItem value="2nd-owner">2nd Owner</SelectItem>
                          <SelectItem value="3rd-owner">3rd Owner</SelectItem>
                          <SelectItem value="4th-owner">4th Owner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Home Test Drive Available? */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="homeTestDriveDetails" className="text-sm font-semibold text-gray-700 whitespace-nowrap">Home Test Drive Available?</Label>
                      <Select value={vehicleData.homeTestDriveDetails || ''} onValueChange={(value) => handleInputChange('homeTestDriveDetails', value)}>
                        <SelectTrigger className="border border-gray-300 bg-blue-50 text-gray-700 rounded-lg px-3 py-2 h-11">
                          <SelectValue placeholder="Select Option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* KM run */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="kmRun" className="text-sm font-semibold text-gray-700 whitespace-nowrap">KM run:</Label>
                      <Input
                        id="kmRun"
                        placeholder="Enter KM run"
                        type="number"
                        value={vehicleData.kmRun || ''}
                        onChange={(e) => handleInputChange('kmRun', e.target.value)}
                        className="border border-gray-300 bg-blue-50 text-gray-700 placeholder:text-gray-400 rounded-lg px-3 py-2 h-11"
                      />
                    </div>
                    {/* Fuel Type */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="fuelTypeDetails" className="text-sm font-semibold text-gray-700 whitespace-nowrap">Fuel Type:</Label>
                      <Select value={vehicleData.fuelTypeDetails || ''} onValueChange={(value) => handleInputChange('fuelTypeDetails', value)}>
                        <SelectTrigger className="border border-gray-300 bg-blue-50 text-gray-700 rounded-lg px-3 py-2 h-11">
                          <SelectValue placeholder="Select Fuel Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="petrol">Petrol</SelectItem>
                          <SelectItem value="diesel">Diesel</SelectItem>
                          <SelectItem value="electric">Electric (EV)</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                          <SelectItem value="cng">CNG</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Transmission Type */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="transmissionTypeDetails" className="text-sm font-semibold text-gray-700 whitespace-nowrap">Transmission Type:</Label>
                      <Select value={vehicleData.transmissionTypeDetails || ''} onValueChange={(value) => handleInputChange('transmissionTypeDetails', value)}>
                        <SelectTrigger className="border border-gray-300 bg-blue-50 text-gray-700 rounded-lg px-3 py-2 h-11">
                          <SelectValue placeholder="Select Transmission" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="automatic">Automatic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Exterior Colour */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="exteriorColorDetails" className="text-sm font-semibold text-gray-700 whitespace-nowrap">Exterior Colour:</Label>
                      <Input
                        id="exteriorColorDetails"
                        placeholder="Enter Exterior Colour"
                        value={vehicleData.exteriorColorDetails || ''}
                        onChange={(e) => handleInputChange('exteriorColorDetails', e.target.value)}
                        className="border border-gray-300 bg-blue-50 text-gray-700 placeholder:text-gray-400 rounded-lg px-3 py-2 h-11"
                      />
                    </div>
                    {/* Interior Color */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="interiorColorDetails" className="text-sm font-semibold text-gray-700 whitespace-nowrap">Interior Color:</Label>
                      <Input
                        id="interiorColorDetails"
                        placeholder="Enter Interior Color"
                        value={vehicleData.interiorColorDetails || ''}
                        onChange={(e) => handleInputChange('interiorColorDetails', e.target.value)}
                        className="border border-gray-300 bg-blue-50 text-gray-700 placeholder:text-gray-400 rounded-lg px-3 py-2 h-11"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="photos" className="mt-0">
                  <div className="flex flex-col gap-4 items-center">
                    <div className="w-80 mx-auto">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <div className="text-sm font-medium text-gray-900 mb-2">
                            Click to upload images of the vehicle or drop images here to upload.
                          </div>
                          <div className="text-sm text-gray-500 mb-4">
                            Max upload size is 10MB per image. Multiple image upload allowed.
                          </div>
                          <Label htmlFor="image-upload" className="cursor-pointer">
                            <Button type="button" variant="outline" size="sm">
                              Upload Images
                            </Button>
                            <Input
                              id="image-upload"
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </Label>
                        </div>
                      </div>
                    </div>
                    {/* Display uploaded images */}
                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-4">
                        {uploadedImages.map((image, index) => (
                          <div key={index} className="relative w-32 h-32 mx-auto">
                            <img
                              src={image}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg border"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* 3. Replace the Vehicle Features tab content with the new accordion structure */}
                <TabsContent value="features" className="mt-0">
                  <div className="flex flex-col gap-6 items-center w-full">
                    <Accordion type="multiple" className="w-full max-w-2xl">
                      {Object.entries(featureCategories).map(([category, features]) => (
                        <AccordionItem value={category} key={category}>
                          <AccordionTrigger className="text-base font-semibold text-gray-800 bg-blue-50 px-4 py-3 rounded-t-lg">
                            {category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}
                          </AccordionTrigger>
                          <AccordionContent className="bg-white px-4 pb-4 rounded-b-lg">
                            {/* Search bar for this category */}
                            <div className="mb-3">
                              <Input
                                placeholder={`Search ${category.charAt(0).toUpperCase() + category.slice(1)} Features`}
                                className="border border-gray-300 bg-blue-50 text-gray-700 placeholder:text-gray-400 rounded-lg px-3 py-2 h-10"
                                // TODO: Implement search/filter logic if needed
                              />
                            </div>
                            {/* Feature checkboxes */}
                            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                              {features.map((feature) => (
                                <label key={feature} className="flex items-center space-x-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={vehicleData[category as keyof typeof vehicleData].includes(feature)}
                                    onChange={() => toggleFeature(category, feature)}
                                    className="rounded border-gray-300 bg-blue-50"
                                  />
                                  <span>{feature}</span>
                                </label>
                              ))}
                            </div>
                            {/* Additional section: Add feature button */}
                            {category === 'additional' && (
                              <div className="mt-4 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="w-fit border border-gray-400 text-gray-700 bg-blue-50 px-4 py-2 rounded-lg"
                                    onClick={() => setNewAdditionalFeature('')}
                                    disabled={!!newAdditionalFeature}
                                  >
                                    Add feature
                                  </Button>
                                  {newAdditionalFeature !== '' && (
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="text"
                                        autoFocus
                                        value={newAdditionalFeature}
                                        onChange={e => setNewAdditionalFeature(e.target.value)}
                                        onBlur={() => {
                                          if (newAdditionalFeature.trim()) {
                                            setVehicleData(prev => ({
                                              ...prev,
                                              additional: [...prev.additional, newAdditionalFeature.trim()]
                                            }));
                                            setNewAdditionalFeature('');
                                          } else {
                                            setNewAdditionalFeature('');
                                          }
                                        }}
                                        onKeyDown={e => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            if (newAdditionalFeature.trim()) {
                                              setVehicleData(prev => ({
                                                ...prev,
                                                additional: [...prev.additional, newAdditionalFeature.trim()]
                                              }));
                                              setNewAdditionalFeature('');
                                            }
                                          } else if (e.key === 'Escape') {
                                            setNewAdditionalFeature('');
                                          }
                                        }}
                                        className="border border-gray-300 bg-blue-50 text-gray-700 placeholder:text-gray-400 rounded-lg px-3 py-2 h-10 w-48"
                                        placeholder="Enter feature"
                                      />
                                      <button
                                        type="button"
                                        className="text-red-500 hover:text-red-700 text-lg px-1"
                                        onClick={() => setNewAdditionalFeature('')}
                                        tabIndex={-1}
                                      >
                                        ×
                                      </button>
                                    </div>
                                  )}
                                </div>
                                {/* List custom features */}
                                {vehicleData.additional.length > 0 && (
                                  <div className="mt-2">
                                    {vehicleData.additional.map((feature: string, idx: number) => (
                                      <div key={idx} className="flex items-center gap-2 mb-1">
                                        <input
                                          type="checkbox"
                                          checked={vehicleData.additional.includes(feature)}
                                          onChange={() => toggleFeature('additional', feature)}
                                          className="rounded border-gray-300 bg-blue-50"
                                        />
                                        <span>{feature}</span>
                                        <button
                                          type="button"
                                          className="ml-2 text-red-500 hover:text-red-700 text-xs"
                                          onClick={() => setVehicleData(prev => ({
                                            ...prev,
                                            additional: prev.additional.filter((f: string) => f !== feature)
                                          }))}
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Sticky Footer with navigation buttons - at the bottom of the flex column, not absolutely positioned */}
          <div className="border-t px-6 py-4 bg-white z-10">
            <div className="flex justify-between items-center w-full gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  const tabs = ["info", "details", "photos", "features"];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1]);
                  }
                }}
                disabled={activeTab === "info"}
                className="w-40 rounded-full border border-gray-600 text-gray-700 bg-white px-8 py-2 font-semibold shadow-none hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-700"
              >
                Previous
              </Button>

              {activeTab !== "features" && (
                <Button
                  onClick={() => {
                    const tabs = ["info", "details", "photos", "features"];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex < tabs.length - 1) {
                      setActiveTab(tabs[currentIndex + 1]);
                    }
                  }}
                  className="w-40 bg-blue-800 hover:bg-blue-900 text-white rounded-full px-8 py-2 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Next
                </Button>
              )}

              <Button
                onClick={handleSave}
                disabled={activeTab !== "features"}
                className="w-40 bg-green-700 hover:bg-green-800 text-white rounded-full px-8 py-2 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Save Vehicle Info
              </Button>
            </div>
            <div className="flex justify-center mt-3">
              {["info", "details", "photos", "features"].map((tab, index) => (
                <div
                  key={tab}
                  className={`w-2 h-2 rounded-full mx-1 ${
                    activeTab === tab ? "bg-blue-800" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


export default VehicleAddDialog;
