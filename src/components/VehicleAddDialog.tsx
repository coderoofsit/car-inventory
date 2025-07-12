import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, X, Search } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { uploadImageToBackend } from "@/lib/imageAPI";

interface VehicleAddDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicleData: any) => void;
}

const VehicleAddDialog: React.FC<VehicleAddDialogProps> = ({ isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState("info");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [vehicleData, setVehicleData] = useState({
    // Vehicle Information
    vin: '',
    year: '',
    make: '',
    model: '',
    trim: '',
    bodyStyle: undefined,
    doors: '',
    manufactureMonth: '',
    manufactureYear: '',
    brand: '',
    noOfOwner: undefined,
    homeTestDrive: undefined,
    registrationMonth: '',
    registrationYear: '',
    insuranceValidityMonth: '',
    insuranceValidityYear: '',
    insuranceValid: undefined,
    insuranceType: '',
    rto: '',
    engineCapacity: '',
    // Vehicle Details (add missing fields)
    bodyStyleDetails: undefined,
    ownerDetails: undefined,
    homeTestDriveDetails: undefined,
    kmRun: '',
    fuelTypeDetails: undefined,
    transmissionTypeDetails: undefined,
    exteriorColorDetails: '',
    interiorColorDetails: '',
    condition: undefined,
    sellingPrice: '',
    status: undefined,
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
      [field]: value === '' ? undefined : value
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadSuccess(false);
      setUploadError(null);
      setUploading(true);
      for (const file of Array.from(files)) {
        setUploadProgress(0);
        try {
          const url = await uploadImageToBackend(file, (progress) => setUploadProgress(progress));
          setUploadedImages(prev => ([...prev, url] as string[]));
          setUploadSuccess(true);
        } catch (err) {
          setUploadSuccess(false);
          setUploadError('Image upload failed. Please try again.');
        }
        setUploadProgress(null);
      }
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave({ ...vehicleData, images: uploadedImages });
    onClose();
    // Do NOT reset any form values here
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="relative fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[700px] max-w-none p-0 overflow-hidden">
        <DialogTitle asChild>
          <span className="sr-only">Add Vehicle</span>
        </DialogTitle>
        <DialogDescription asChild>
          <span className="sr-only">Fill out the form to add a new vehicle to the inventory.</span>
        </DialogDescription>
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
                      <Label htmlFor="vin" className="w-1/3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap">VIN:</Label>
                      <div className="relative  w-2/3">
                        <Input
                          id="vin"
                          placeholder="Enter VIN"
                          value={vehicleData.vin}
                          onChange={(e) => handleInputChange('vin', e.target.value)}
                          className="w-full h-11 px-3 py-2 text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 bg-blue-100 rounded p-1" />
                      </div>
                    </div>
                    {/* Manufacture Year (Month, Year) */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="manufactureMonth" className="w-1/3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Manufacture Month/Year</Label>
                      <div className='flex flex-row w-2/3 '>
                      <Input
                        id="manufactureYear"
                        placeholder="Year"
                        value={vehicleData.manufactureYear || ''}
                        onChange={(e) => handleInputChange('manufactureYear', e.target.value)}
                        className="w-full mr-2 h-11 px-3 py-2 text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400"
                        maxLength={4}
                      />
                      <Input
                        id="manufactureMonth"
                        placeholder="Month"
                        value={vehicleData.manufactureMonth || ''}
                        onChange={(e) => handleInputChange('manufactureMonth', e.target.value)}
                        className="w-full h-11 px-3 py-2 text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400"
                        maxLength={2}
                      />
                      </div>
                     
                    </div>
                    {/* Brand */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="brand" className="w-1/3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Brand:</Label>
                      <Input
                        id="brand"
                        placeholder="Enter Brand"
                        value={vehicleData.brand || ''}
                        onChange={(e) => handleInputChange('brand', e.target.value)}
                        className="w-2/3 h-11 px-3 py-2 text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400"
                      />
                    </div>
                    {/* Body Style */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="bodyStyle" className="w-1/3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Body Style:</Label>
                      <Select value={vehicleData.bodyStyle || undefined} onValueChange={(value) => handleInputChange('bodyStyle', value)}>
                        <SelectTrigger className="w-2/3 h-11 px-3 py-2 text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700">
                          <SelectValue placeholder="Select Body Style" />
                        </SelectTrigger>
                        <SelectContent>
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
                      <Label htmlFor="noOfOwner" className="w-1/3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap">No. of Owner:</Label>
                      <Select value={vehicleData.noOfOwner || undefined} onValueChange={(value) => handleInputChange('noOfOwner', value)}>
                        <SelectTrigger className="w-2/3 h-11 px-3 py-2 text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700">
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
                      <Label htmlFor="homeTestDrive" className="w-1/3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Home Test Drive Available?</Label>
                      <Select value={vehicleData.homeTestDrive || undefined} onValueChange={(value) => handleInputChange('homeTestDrive', value)}>
                        <SelectTrigger className="w-full h-11 px-3 py-2 text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700">
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
                      <Label htmlFor="registrationMonth" className="w-1/3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Registration Month/Year </Label>
                      <div className='w-2/3 flex flex-row'><Input
                        id="registrationMonth"
                        placeholder="Month"
                        value={vehicleData.registrationMonth || ''}
                        onChange={(e) => handleInputChange('registrationMonth', e.target.value)}
                        className="w-full mr-2 h-11 px-3 py-2 text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400"
                        maxLength={2}
                      />
                      <Input
                        id="registrationYear"
                        placeholder="Year"
                        value={vehicleData.registrationYear || ''}
                        onChange={(e) => handleInputChange('registrationYear', e.target.value)}
                        className="w-full h-11 px-3 py-2 text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400"
                        maxLength={4}
                      /></div>
                    </div>
                    {/* Insurance Validity (Month, Year, Yes/No) */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="insuranceValidityMonth" className="w-1/3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Insurance Validity Month</Label>
                      <div className='flex flex-row w-2/3'>
                      <Input
                        id="insuranceValidityMonth"
                        placeholder="Month"
                        value={vehicleData.insuranceValidityMonth || ''}
                        onChange={(e) => handleInputChange('insuranceValidityMonth', e.target.value)}
                        className="w-full mr-2 h-11 px-3 py-2 text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400"
                        maxLength={2}
                      />
                      <Input
                        id="insuranceValidityYear"
                        placeholder="Year"
                        value={vehicleData.insuranceValidityYear || ''}
                        onChange={(e) => handleInputChange('insuranceValidityYear', e.target.value)}
                        className="w-full h-11 px-3 py-2 text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400"
                        maxLength={4}
                      />
                      </div>
                      
                    </div>
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                     
                      <Label htmlFor="insuranceValid" className="w-1/3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Insurance Valid?</Label>
                      <Select value={vehicleData.insuranceValid || undefined} onValueChange={(value) => handleInputChange('insuranceValid', value)}>
                        <SelectTrigger className="w-2/3 h-11 px-3 py-2 text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700">
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
                      <Label htmlFor="insuranceType" className="w-1/3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Insurance Type:</Label>
                      <Input
                        id="insuranceType"
                        placeholder="Enter Insurance Type"
                        value={vehicleData.insuranceType || ''}
                        onChange={(e) => handleInputChange('insuranceType', e.target.value)}
                        className="w-2/3 h-11 px-3 py-2 text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400"
                      />
                    </div>
                    {/* RTO */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="rto" className="text-right w-1/3 text-sm font-semibold text-gray-700 whitespace-nowrap">RTO:</Label>
                      <Input
                        id="rto"
                        placeholder="Enter RTO"
                        value={vehicleData.rto || ''}
                        onChange={(e) => handleInputChange('rto', e.target.value)}
                        className="w-2/3 h-11 px-3 py-2 text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400"
                      />
                    </div>
                    {/* Engine Capacity (cc) */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="engineCapacity" className="w-1/3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Engine Capacity (cc):</Label>
                      <Input
                        id="engineCapacity"
                        placeholder="Enter Engine Capacity"
                        type="number"
                        value={vehicleData.engineCapacity || ''}
                        onChange={(e) => handleInputChange('engineCapacity', e.target.value)}
                        className="w-2/3 h-11 px-3 py-2 text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="mt-0 space-y-4">
                  <div className="flex flex-col gap-4 items-center">
                    {/* Condition */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="condition" className="text-right w-1/3 text-sm font-semibold text-gray-700 whitespace-nowrap">Condition:</Label>
                      <Select value={vehicleData.condition || undefined} onValueChange={(value) => handleInputChange('condition', value)}>
                        <SelectTrigger className="w-2/3 h-11 px-3 py-2 text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700">
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
                      <Label htmlFor="sellingPrice" className="text-right w-1/3 text-sm font-semibold text-gray-700 whitespace-nowrap">Selling Price (INR):</Label>
                      <Input
                        id="sellingPrice"
                        placeholder="Enter Selling Price"
                        type="number"
                        value={vehicleData.sellingPrice}
                        onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                        className="w-2/3 h-11 px-3 py-2 text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400"
                      />
                    </div>
                    {/* Status */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="status" className="text-right w-1/3 text-sm font-semibold text-gray-700 whitespace-nowrap">Status:</Label>
                      <Select value={vehicleData.status || undefined} onValueChange={(value) => handleInputChange('status', value)}>
                        <SelectTrigger className="w-2/3 h-11 px-3 py-2 text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700">
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
                      <Label htmlFor="bodyStyleDetails" className="text-right w-1/3 text-sm font-semibold text-gray-700 whitespace-nowrap">Body Style:</Label>
                      <Select value={vehicleData.bodyStyleDetails || undefined} onValueChange={(value) => handleInputChange('bodyStyleDetails', value)}>
                        <SelectTrigger className="w-2/3 h-11 px-3 py-2 text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700">
                          <SelectValue placeholder="Select Body Style" />
                        </SelectTrigger>
                        <SelectContent>
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
                      <Label htmlFor="ownerDetails" className="text-right w-1/3  text-sm font-semibold text-gray-700 whitespace-nowrap">Owner:</Label>
                      <Select value={vehicleData.ownerDetails || undefined} onValueChange={(value) => handleInputChange('ownerDetails', value)}>
                        <SelectTrigger className="w-2/3 h-11 px-3 py-2 text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700">
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
                      <Label htmlFor="homeTestDriveDetails" className="w-1/3  text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Home Test Drive Available?</Label>
                      <Select value={vehicleData.homeTestDriveDetails || undefined} onValueChange={(value) => handleInputChange('homeTestDriveDetails', value)}>
                        <SelectTrigger className="w-2/3 h-11 px-3 py-2 text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700">
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
                      <Label htmlFor="kmRun" className="w-1/3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap">KM run:</Label>
                      <Input
                        id="kmRun"
                        placeholder="Enter KM run"
                        type="number"
                        value={vehicleData.kmRun || ''}
                        onChange={(e) => handleInputChange('kmRun', e.target.value)}
                        className="w-2/3 h-11 px-3 py-2 text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400"
                      />
                    </div>
                    {/* Fuel Type */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="fuelTypeDetails" className="text-right w-1/3 stext-sm font-semibold text-gray-700 whitespace-nowrap">Fuel Type:</Label>
                      <Select value={vehicleData.fuelTypeDetails || undefined} onValueChange={(value) => handleInputChange('fuelTypeDetails', value)}>
                        <SelectTrigger className="w-2/3 h-11 px-3 py-2 text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700">
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
                      <Label htmlFor="transmissionTypeDetails" className="w-1/3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Transmission Type:</Label>
                      <Select value={vehicleData.transmissionTypeDetails || undefined} onValueChange={(value) => handleInputChange('transmissionTypeDetails', value)}>
                        <SelectTrigger className="w-2/3 h-11 px-3 py-2 text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700">
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
                      <Label htmlFor="exteriorColorDetails" className="w-1/3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Exterior Colour:</Label>
                      <Input
                        id="exteriorColorDetails"
                        placeholder="Enter Exterior Colour"
                        value={vehicleData.exteriorColorDetails || ''}
                        onChange={(e) => handleInputChange('exteriorColorDetails', e.target.value)}
                        className="w-2/3 h-11 px-3 py-2 text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400"
                      />
                    </div>
                    {/* Interior Color */}
                    <div className="flex flex-row items-center justify-between w-[34rem] gap-2">
                      <Label htmlFor="interiorColorDetails" className="text-right w-1/3 text-sm font-semibold text-gray-700 whitespace-nowrap">Interior Color:</Label>
                      <Input
                        id="interiorColorDetails"
                        placeholder="Enter Interior Color"
                        value={vehicleData.interiorColorDetails || ''}
                        onChange={(e) => handleInputChange('interiorColorDetails', e.target.value)}
                        className="w-2/3 h-11 px-3 py-2 text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400"
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
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={uploading}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {uploading ? 'Uploading...' : 'Upload Images'}
                          </Button>
                          <Input
                            ref={fileInputRef}
                            id="image-upload"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          {uploadProgress !== null && (
                            <div className="mt-4">
                              <Progress
                                value={uploadProgress}
                                className="h-4 w-full bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 shadow-lg animate-pulse"
                              />
                              <div className="text-xs mt-1 font-semibold text-blue-700">{uploadProgress}%</div>
                            </div>
                          )}
                          {uploadSuccess && !uploading && (
                            <div className="mt-2 text-green-600 font-semibold">Upload complete!</div>
                          )}
                          {uploadError && (
                            <div className="mt-2 text-red-600 font-semibold">{uploadError}</div>
                          )}
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
                                className="w-full h-10 px-3 py-2 text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400"
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
                                        className="w-48 h-10 px-3 py-2 text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400"
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
                                    {vehicleData.additional.map((feature: string) => (
                                      <div key={feature} className="flex items-center gap-2 mb-1">
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
