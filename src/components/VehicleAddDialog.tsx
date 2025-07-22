import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, X, Search, AlertTriangle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { uploadMediaToBackend } from "@/lib/mediaAPI";
import { vehicleInspectionSchema } from './vehicleInspectionSchema';
import { toast } from "@/hooks/use-toast";

interface VehicleAddDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicleData: any) => void;
  editCar?: any;
  mode?: 'add' | 'edit';
}

// Validation helper functions
const validateVIN = (vin: string): string | null => {
  if (!vin.trim()) return null;
  if (vin.length !== 17) return 'VIN must be exactly 17 characters';
  if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) return 'VIN contains invalid characters';
  return null;
};

const validateKmRun = (km: string): string | null => {
  if (!km.trim()) return null;
  const kmValue = parseInt(km);
  if (isNaN(kmValue)) return 'KM run must be a valid number';
  if (kmValue < 0) return 'KM run cannot be negative';
  if (kmValue > 2000000) return 'KM run seems unreasonably high (max: 2,000,000)';
  return null;
};

const validateSellingPrice = (price: string): string | null => {
  if (!price.trim()) return null;
  const priceValue = parseFloat(price);
  if (isNaN(priceValue)) return 'Price must be a valid number';
  if (priceValue < 0) return 'Price cannot be negative';
  if (priceValue < 1000) return 'Price seems too low (minimum: ₹1,000)';
  if (priceValue > 100000000) return 'Price seems unreasonably high (max: ₹10 crores)';
  return null;
};

const validateEngineCapacity = (capacity: string): string | null => {
  if (!capacity.trim()) return null;
  const capacityValue = parseInt(capacity);
  if (isNaN(capacityValue)) return 'Engine capacity must be a valid number';
  if (capacityValue < 0) return 'Engine capacity cannot be negative';
  if (capacityValue < 50) return 'Engine capacity seems too small (minimum: 50cc)';
  if (capacityValue > 10000) return 'Engine capacity seems unreasonably large (max: 10,000cc)';
  return null;
};

const validateYear = (year: string, field: string): string | null => {
  if (!year.trim()) return null;
  const yearValue = parseInt(year);
  const currentYear = new Date().getFullYear();
  if (isNaN(yearValue)) return `${field} must be a valid year`;
  if (yearValue < 1900) return `${field} cannot be before 1900`;
  if (field === 'Manufacture Year' && yearValue > currentYear) {
    return 'Manufacture year cannot be in the future';
  }
  if (field === 'Registration Year' && yearValue > currentYear) {
    return 'Registration year cannot be in the future';
  }
  if (field === 'Insurance Year' && yearValue > currentYear + 5) {
    return 'Insurance validity year seems too far in the future';
  }
  return null;
};

const validateDateLogic = (
  manufactureYear: string, 
  manufactureMonth: string,
  registrationYear: string, 
  registrationMonth: string,
  insuranceYear: string,
  insuranceMonth: string
): string | null => {
  // Check if registration is after manufacture
  if (manufactureYear && manufactureMonth && registrationYear && registrationMonth) {
    const manufactureDate = new Date(parseInt(manufactureYear), parseInt(manufactureMonth) - 1);
    const registrationDate = new Date(parseInt(registrationYear), parseInt(registrationMonth) - 1);
    if (registrationDate < manufactureDate) {
      return 'Registration date cannot be before manufacture date';
    }
  }

  // Check if insurance validity is reasonable
  if (registrationYear && registrationMonth && insuranceYear && insuranceMonth) {
    const registrationDate = new Date(parseInt(registrationYear), parseInt(registrationMonth) - 1);
    const insuranceDate = new Date(parseInt(insuranceYear), parseInt(insuranceMonth) - 1);
    if (insuranceDate < registrationDate) {
      return 'Insurance validity cannot be before registration date';
    }
  }

  return null;
};

const VehicleAddDialog: React.FC<VehicleAddDialogProps> = ({ isOpen, onClose, onSave, editCar, mode = 'add' }) => {
  // Month and Year arrays for dropdowns
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const years = Array.from({ length: 100 }, (_, i) => {
    const currentYear = new Date().getFullYear();
    const year = currentYear - i;
    return { value: year.toString(), label: year.toString() };
  });

  const [activeTab, setActiveTab] = useState("info");
  const [uploadedMedia, setUploadedMedia] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Add validation error state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [vehicleData, setVehicleData] = useState({
    // Vehicle Information
    vin: '',
    year: '',
    make: '',
    model: '',
    trim: '',
    bodyStyle: undefined,
    doors: '',
    manufactureMonth: undefined,
    manufactureYear: undefined,
    brand: '',
    noOfOwner: undefined,
    homeTestDrive: undefined,
    registrationMonth: undefined,
    registrationYear: undefined,
    insuranceValidityMonth: undefined,
    insuranceValidityYear: undefined,
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
  const [inspectionReport, setInspectionReport] = useState({});

  // Enhanced validation function
  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case 'vin':
        return validateVIN(value);
      case 'kmRun':
        return validateKmRun(value);
      case 'sellingPrice':
        return validateSellingPrice(value);
      case 'engineCapacity':
        return validateEngineCapacity(value);
      case 'manufactureYear':
        return validateYear(value, 'Manufacture Year');
      case 'registrationYear':
        return validateYear(value, 'Registration Year');
      case 'insuranceValidityYear':
        return validateYear(value, 'Insurance Year');
      default:
        return null;
    }
  };

  // Validate date relationships
  const validateDateRelationships = (): string | null => {
    return validateDateLogic(
      vehicleData.manufactureYear || '',
      vehicleData.manufactureMonth || '',
      vehicleData.registrationYear || '',
      vehicleData.registrationMonth || '',
      vehicleData.insuranceValidityYear || '',
      vehicleData.insuranceValidityMonth || ''
    );
  };

  // 1. Add a function to reset all form state
  const resetForm = () => {
    setVehicleData({
      vin: '',
      year: '',
      make: '',
      model: '',
      trim: '',
      bodyStyle: undefined,
      doors: '',
      manufactureMonth: undefined,
      manufactureYear: undefined,
      brand: '',
      noOfOwner: undefined,
      homeTestDrive: undefined,
      registrationMonth: undefined,
      registrationYear: undefined,
      insuranceValidityMonth: undefined,
      insuranceValidityYear: undefined,
      insuranceValid: undefined,
      insuranceType: '',
      rto: '',
      engineCapacity: '',
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
      interior: [],
      convenience: [],
      safety: [],
      exterior: [],
      performance: [],
      documentsAvailable: [],
      additional: []
    });
    setUploadedMedia([]);
    setNewAdditionalFeature('');
    setActiveTab('info');
    setValidationErrors({});
  };

  // 3. Optionally, also reset form when dialog is closed
  const handleDialogClose = () => {
    resetForm();
    onClose();
  };

  // Add state for new additional feature input
  const [newAdditionalFeature, setNewAdditionalFeature] = useState<string>('');
  // Add state for search text in each feature category
  const [featureSearch, setFeatureSearch] = useState<Record<string, string>>({});

  // Enhanced input change handler with validation
  const handleInputChange = (field: string, value: string) => {
    // Update the value
    setVehicleData(prev => ({
      ...prev,
      [field]: value === '' || value === undefined || value === null ? undefined : value
    }));

    // Validate the field
    const error = validateField(field, value);
    if (error) {
      toast({
        title: "Validation Error",
        description: error,
        variant: "destructive"
      });
      setValidationErrors(prev => ({
        ...prev,
        [field]: error
      }));
    } else {
      // Clear the error if validation passes
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Validate date relationships when any date field changes
    if (['manufactureYear', 'manufactureMonth', 'registrationYear', 'registrationMonth', 'insuranceValidityYear', 'insuranceValidityMonth'].includes(field)) {
      const dateError = validateDateLogic(
        field === 'manufactureYear' ? value : vehicleData.manufactureYear || '',
        field === 'manufactureMonth' ? value : vehicleData.manufactureMonth || '',
        field === 'registrationYear' ? value : vehicleData.registrationYear || '',
        field === 'registrationMonth' ? value : vehicleData.registrationMonth || '',
        field === 'insuranceValidityYear' ? value : vehicleData.insuranceValidityYear || '',
        field === 'insuranceValidityMonth' ? value : vehicleData.insuranceValidityMonth || ''
      );
      
      if (dateError) {
        toast({
          title: "Date Logic Error",
          description: dateError,
          variant: "destructive"
        });
        setValidationErrors(prev => ({
          ...prev,
          dateLogic: dateError
        }));
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.dateLogic;
          return newErrors;
        });
      }
    }
  };
  
  // Also add this helper function to safely get Select values
  const getSelectValue = (value: string | undefined) => {
    return value === '' || value === undefined || value === null ? undefined : value;
  };

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploading(true);
      for (const file of Array.from(files)) {
        setUploadProgress(0);
        try {
          const url = await uploadMediaToBackend(file, (progress) => setUploadProgress(progress));
          setUploadedMedia(prev => ([...prev, url] as string[]));
          toast({
            title: "Upload Successful",
            description: "Media file uploaded successfully.",
            variant: "default"
          });
        } catch (err) {
          toast({
            title: "Upload Failed",
            description: "Media upload failed. Please try again.",
            variant: "destructive"
          });
        }
        setUploadProgress(null);
      }
      setUploading(false);
    }
  };

  const removeMedia = (index: number) => {
    setUploadedMedia(prev => prev.filter((_, i) => i !== index));
  };
  
  const cleanVehicleData = (data: any) => {
    const cleaned = { ...data };
    
    // Convert empty strings to undefined for all fields
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === '' || cleaned[key] === null) {
        cleaned[key] = undefined;
      }
    });
    
    return cleaned;
  };
  
  // Enhanced save function with comprehensive validation
  const handleSave = async () => {
    // Clear previous validation errors
    setValidationErrors({});

    // Validate all fields
    const errors: Record<string, string> = {};
    
    // Validate individual fields
    Object.entries(vehicleData).forEach(([field, value]) => {
      if (typeof value === 'string') {
        const error = validateField(field, value);
        if (error) {
          errors[field] = error;
        }
      }
    });

    // Validate date relationships
    const dateError = validateDateRelationships();
    if (dateError) {
      errors.dateLogic = dateError;
    }

    // Check for validation errors
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      const errorMessages = Object.values(errors);
      toast({
        title: "Validation Errors",
        description: `Please fix the following errors: ${errorMessages.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    // Validate required fields
    const requiredFields = [
      { field: 'brand', label: 'Brand' },
      { field: 'model', label: 'Model' },
      { field: 'fuelTypeDetails', label: 'Fuel Type' },
      { field: 'vin', label: 'VIN' },
      { field: 'transmissionTypeDetails', label: 'Transmission' },
      { field: 'kmRun', label: 'Mileage (KM)' },
      { field: 'manufactureYear', label: 'Manufacture Year' },
      { field: 'manufactureMonth', label: 'Manufacture Month' },
      { field: 'status', label: 'Status' },
      { field: 'condition', label: 'Condition' },
      { field: 'sellingPrice', label: 'Selling Price' }
    ];

    const missingFields = requiredFields.filter(({ field }) => {
      const value = vehicleData[field as keyof typeof vehicleData];
      return !value || value === '' || value === undefined;
    });

    if (missingFields.length > 0) {
      const missingFieldNames = missingFields.map(f => f.label).join(', ');
      toast({
        title: "Missing Required Fields",
        description: `Please fill in all required fields: ${missingFieldNames}`,
        variant: "destructive"
      });
      return;
    }

    const cleanedData = cleanVehicleData(vehicleData);
    const payload = {
      ...cleanedData,
      additional: Array.isArray(vehicleData.additional)
        ? vehicleData.additional.map(item => typeof item === 'string' ? item : item.value)
        : [],
      inspectionReport,
      media: uploadedMedia,
      location_id: import.meta.env.VITE_LOCATION_ID,
    };

    try {
      await onSave(payload);
      toast({
        title: "Success",
        description: "Vehicle information saved successfully.",
        variant: "default"
      });
      resetForm(); // <-- Reset form state
      onClose();
    } catch (error) {
      toast({
        title: "Error Saving Vehicle",
        description: error?.message || "Could not save vehicle to backend.",
        variant: "destructive"
      });
      // Do not close or reset form
    }
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

  // When dialog opens in edit mode, pre-fill form with editCar data
  React.useEffect(() => {
    if (isOpen && mode === 'edit' && editCar) {
      setVehicleData({
        ...vehicleData,
        ...editCar,
        // Ensure additional features are in the correct format (array of objects with id/value)
        additional: Array.isArray(editCar.additional)
          ? editCar.additional.map((f: any) => typeof f === 'object' && f.id ? f : { id: `${Date.now()}-${Math.random()}`, value: typeof f === 'string' ? f : f.value })
          : [],
      });
      setUploadedMedia(editCar.media || []);
      setInspectionReport(editCar.inspectionReport || {}); // <-- Pre-fill inspection report
    } else if (!isOpen) {
      resetForm();
    }
  }, [isOpen, mode, editCar]);

  React.useEffect(() => {
    if (!isOpen) {
      setActiveTab('info');
      setUploadedMedia([]);
      setUploadProgress(null);
      setUploading(false);
      setVehicleData({
        vin: '', year: '', make: '', model: '', trim: '', bodyStyle: undefined, doors: '', manufactureMonth: undefined, manufactureYear: undefined, brand: '', noOfOwner: undefined, homeTestDrive: undefined, registrationMonth: undefined, registrationYear: undefined, insuranceValidityMonth: undefined, insuranceValidityYear: undefined, insuranceValid: undefined, insuranceType: '', rto: '', engineCapacity: '', bodyStyleDetails: undefined, ownerDetails: undefined, homeTestDriveDetails: undefined, kmRun: '', fuelTypeDetails: undefined, transmissionTypeDetails: undefined, exteriorColorDetails: '', interiorColorDetails: '', condition: undefined, sellingPrice: '', status: undefined, mileage: '', mileageUnit: '', fuelType: '', driveType: '', transmissionType: '', engineType: '', exteriorColor: '', interiorColor: '', description: '', interior: [], convenience: [], safety: [], exterior: [], performance: [], documentsAvailable: [], additional: []
      });
      setInspectionReport({});
      setNewAdditionalFeature('');
      setFeatureSearch({});
      setValidationErrors({});
    }
  }, [isOpen]);

  // Helper component for displaying validation errors
  const ValidationError: React.FC<{ error?: string }> = ({ error }) => {
    if (!error) return null;
    return (
      <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
        <AlertTriangle className="h-3 w-3" />
        <span>{error}</span>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="relative fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg sm:max-w-2xl md:w-[900px] md:h-[700px] max-w-none p-0 overflow-hidden">
        <DialogTitle asChild>
          <span className="sr-only">{mode === 'edit' ? 'Edit Vehicle' : 'Add Vehicle'}</span>
        </DialogTitle>
        <DialogDescription asChild>
          <span className="sr-only">Fill out the form to add a new vehicle to the inventory.</span>
        </DialogDescription>
        <div className="flex flex-col h-full">
          <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 py-4 relative">
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col w-full">
              <TabsList className="grid grid-cols-5 mx-0 sm:mx-7 mt-4 mb-0 max-w-4xl justify-self-center">
                {[{ value: "info", label: "Information" }, { value: "details", label: "Details" }, { value: "photos", label: "Photos" }, { value: "features", label: "Vehicle Features" }, { value: "inspection", label: "Inspection" }].map(tab => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={`text-xs sm:text-sm transition-colors duration-150
                      ${activeTab === tab.value
                        ? "shadow-none hover:bg-blue-900"
                        : "bg-transparent text-gray-800 hover:bg-gray-100"}
                      rounded-t-md font-medium outline-none border-none focus:ring-0`}
                    style={activeTab === tab.value ? { backgroundColor: '#1e3a8a', color: '#fff' } : {}}
                  >
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">
                      {tab.value === "info" ? "Info" : 
                       tab.value === "details" ? "Details" : 
                       tab.value === "photos" ? "Photos" : 
                       tab.value === "features" ? "Features" : "Inspection"}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Make the tab content area absolutely positioned and scrollable */}
              <div className="absolute left-0 right-0 top-[72px] bottom-0 overflow-y-auto px-3 sm:px-6 py-4" style={{ maxHeight: 'calc(100% - 72px)' }}>
                <TabsContent value="info" className="mt-0 space-y-1">
                  <div className="flex flex-col gap-4 items-center">
                    {/* VIN */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full sm:w-[34rem] gap-2">
                      <Label htmlFor="vin" className="w-full sm:w-1/3 text-left sm:text-right text-sm font-semibold text-gray-700 whitespace-nowrap">VIN: <span className="text-red-500">*</span></Label>
                      <div className="relative w-full sm:w-2/3">
                        <Input
                          id="vin"
                          placeholder="Enter VIN (17 characters)"
                          value={vehicleData.vin}
                          onChange={(e) => handleInputChange('vin', e.target.value.toUpperCase())}
                          className={`w-full h-10 sm:h-11 px-3 py-2 text-sm sm:text-base border rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400 ${validationErrors.vin ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                          maxLength={17}
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 bg-blue-100 rounded p-1" />
                        <ValidationError error={validationErrors.vin} />
                      </div>
                    </div>

                    {/* Manufacture Year (Month, Year) */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full sm:w-[34rem] gap-2">
                      <Label htmlFor="manufactureMonth" className="w-full sm:w-1/3 text-left sm:text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Manufacture Month/Year <span className="text-red-500">*</span></Label>
                      <div className='flex flex-col sm:flex-row w-full sm:w-2/3 gap-2'>
                        <Select
                          value={vehicleData.manufactureMonth}
                          onValueChange={(value) => handleInputChange('manufactureMonth', value)}
                        >
                          <SelectTrigger className="w-full h-10 sm:h-11 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700">
                            <SelectValue placeholder="Select Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map(month => (
                              <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex flex-col flex-1">
                          <Select
                            value={vehicleData.manufactureYear}
                            onValueChange={(value) => handleInputChange('manufactureYear', value)}
                          >
                            <SelectTrigger className={`w-full h-10 sm:h-11 px-3 py-2 text-sm sm:text-base border rounded-lg bg-blue-50 text-gray-700 ${validationErrors.manufactureYear ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}>
                              <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                            <SelectContent>
                              {years.map(year => (
                                <SelectItem key={year.value} value={year.value}>{year.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <ValidationError error={validationErrors.manufactureYear} />
                        </div>
                      </div>
                    </div>

                    {/* Brand */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full sm:w-[34rem] gap-2">
                      <Label htmlFor="brand" className="w-full sm:w-1/3 text-left sm:text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Brand: <span className="text-red-500">*</span></Label>
                      <Input
                        id="brand"
                        placeholder="Enter Brand"
                        value={vehicleData.brand || ''}
                        onChange={(e) => handleInputChange('brand', e.target.value)}
                        className="w-full sm:w-2/3 h-10 sm:h-11 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400"
                      />
                    </div>

                    {/* Model */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full sm:w-[34rem] gap-2">
                      <Label htmlFor="model" className="w-full sm:w-1/3 text-left sm:text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Model: <span className="text-red-500">*</span></Label>
                      <Input
                        id="model"
                        placeholder="Enter Model"
                        value={vehicleData.model || ''}
                        onChange={(e) => handleInputChange('model', e.target.value)}
                        className="w-full sm:w-2/3 h-10 sm:h-11 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400"
                      />
                    </div>

                    {/* Registration Year (Month, Year) */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full sm:w-[34rem] gap-2">
                      <Label htmlFor="registrationMonth" className="w-full sm:w-1/3 text-left sm:text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Registration Month/Year </Label>
                      <div className='flex flex-col sm:flex-row w-full sm:w-2/3 gap-2'>
                        <Select
                          value={vehicleData.registrationMonth}
                          onValueChange={(value) => handleInputChange('registrationMonth', value)}
                        >
                          <SelectTrigger className="w-full h-10 sm:h-11 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700">
                            <SelectValue placeholder="Select Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map(month => (
                              <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex flex-col flex-1">
                          <Select
                            value={vehicleData.registrationYear}
                            onValueChange={(value) => handleInputChange('registrationYear', value)}
                          >
                            <SelectTrigger className={`w-full h-10 sm:h-11 px-3 py-2 text-sm sm:text-base border rounded-lg bg-blue-50 text-gray-700 ${validationErrors.registrationYear ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}>
                              <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                            <SelectContent>
                              {years.map(year => (
                                <SelectItem key={year.value} value={year.value}>{year.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <ValidationError error={validationErrors.registrationYear} />
                        </div>
                      </div>
                    </div>

                    {/* Insurance Validity (Month, Year, Yes/No) */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full sm:w-[34rem] gap-2">
                      <Label htmlFor="insuranceValidityMonth" className="w-full sm:w-1/3 text-left sm:text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Insurance Validity Month</Label>
                      <div className='flex flex-col sm:flex-row w-full sm:w-2/3 gap-2'>
                        <Select
                          value={vehicleData.insuranceValidityMonth}
                          onValueChange={(value) => handleInputChange('insuranceValidityMonth', value)}
                        >
                          <SelectTrigger className="w-full h-10 sm:h-11 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700">
                            <SelectValue placeholder="Select Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map(month => (
                              <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex flex-col flex-1">
                          <Select
                            value={vehicleData.insuranceValidityYear}
                            onValueChange={(value) => handleInputChange('insuranceValidityYear', value)}
                          >
                            <SelectTrigger className={`w-full h-10 sm:h-11 px-3 py-2 text-sm sm:text-base border rounded-lg bg-blue-50 text-gray-700 ${validationErrors.insuranceValidityYear ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}>
                              <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                            <SelectContent>
                              {years.map(year => (
                                <SelectItem key={year.value} value={year.value}>{year.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <ValidationError error={validationErrors.insuranceValidityYear} />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full sm:w-[34rem] gap-2">
                      <Label htmlFor="insuranceValid" className="w-full sm:w-1/3 text-left sm:text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Insurance Valid?</Label>
                      <Select 
                        value={vehicleData.insuranceValid && vehicleData.insuranceValid.trim() !== '' ? vehicleData.insuranceValid : undefined} 
                        onValueChange={(value) => handleInputChange('insuranceValid', value)}
                      >
                        <SelectTrigger className="w-full sm:w-2/3 h-10 sm:h-11 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700">
                          <SelectValue placeholder="Yes/No" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Insurance Type */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full sm:w-[34rem] gap-2">
                      <Label htmlFor="insuranceType" className="w-full sm:w-1/3 text-left sm:text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Insurance Type:</Label>
                      <Input
                        id="insuranceType"
                        placeholder="Enter Insurance Type"
                        value={vehicleData.insuranceType || ''}
                        onChange={(e) => handleInputChange('insuranceType', e.target.value)}
                        className="w-full sm:w-2/3 h-10 sm:h-11 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400"
                      />
                    </div>

                    {/* RTO */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full sm:w-[34rem] gap-2">
                      <Label htmlFor="rto" className="w-full sm:w-1/3 text-left sm:text-right text-sm font-semibold text-gray-700 whitespace-nowrap">RTO:</Label>
                      <Input
                        id="rto"
                        placeholder="Enter RTO"
                        value={vehicleData.rto || ''}
                        onChange={(e) => handleInputChange('rto', e.target.value)}
                        className="w-full sm:w-2/3 h-10 sm:h-11 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400"
                      />
                    </div>

                    {/* Engine Capacity (cc) */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full sm:w-[34rem] gap-2">
                      <Label htmlFor="engineCapacity" className="w-full sm:w-1/3 text-left sm:text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Engine Capacity (cc):</Label>
                      <div className="w-full sm:w-2/3">
                        <Input
                          id="engineCapacity"
                          placeholder="Enter Engine Capacity (50-10000cc)"
                          type="number"
                          value={vehicleData.engineCapacity || ''}
                          onChange={(e) => handleInputChange('engineCapacity', e.target.value)}
                          className={`w-full h-10 sm:h-11 px-3 py-2 text-sm sm:text-base border rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400 ${validationErrors.engineCapacity ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                          min="50"
                          max="10000"
                        />
                        <ValidationError error={validationErrors.engineCapacity} />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full sm:w-[34rem] gap-2">
                      <Label htmlFor="description" className="w-full sm:w-1/3 text-left sm:text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Description:</Label>
                      <Textarea
                        id="description"
                        placeholder="Enter vehicle description"
                        value={vehicleData.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="w-full sm:w-2/3 h-20 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400 resize-none"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="mt-0 space-y-4">
                  <div className="flex flex-col gap-4 items-center">
                    {/* Condition */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full sm:w-[34rem] gap-2">
                      <Label htmlFor="condition" className="w-full sm:w-1/3 text-left sm:text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Condition: <span className="text-red-500">*</span></Label>
                      <Select 
                        value={vehicleData.condition && vehicleData.condition.trim() !== '' ? vehicleData.condition : undefined} 
                        onValueChange={(value) => handleInputChange('condition', value)}
                      >
                        <SelectTrigger className="w-full sm:w-2/3 h-10 sm:h-11 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700">
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
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full sm:w-[34rem] gap-2">
                      <Label htmlFor="sellingPrice" className="w-full sm:w-1/3 text-left sm:text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Selling Price (INR): <span className="text-red-500">*</span></Label>
                      <div className="w-full sm:w-2/3">
                        <Input
                          id="sellingPrice"
                          placeholder="Enter Selling Price (₹1,000 - ₹10,00,00,000)"
                          type="number"
                          value={vehicleData.sellingPrice}
                          onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                          className={`w-full h-10 sm:h-11 px-3 py-2 text-sm sm:text-base border rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400 ${validationErrors.sellingPrice ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                          min="1000"
                          max="100000000"
                        />
                        <ValidationError error={validationErrors.sellingPrice} />
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full sm:w-[34rem] gap-2">
                      <Label htmlFor="status" className="w-full sm:w-1/3 text-left sm:text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Status: <span className="text-red-500">*</span></Label>
                      <Select 
                        value={vehicleData.status && vehicleData.status.trim() !== '' ? vehicleData.status : undefined} 
                        onValueChange={(value) => handleInputChange('status', value)}
                      >
                        <SelectTrigger className="w-full sm:w-2/3 h-10 sm:h-11 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700">
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
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full sm:w-[34rem] gap-2">
                      <Label htmlFor="bodyStyleDetails" className="w-full sm:w-1/3 text-left sm:text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Body Style:</Label>
                      <Select 
                        value={vehicleData.bodyStyleDetails && vehicleData.bodyStyleDetails.trim() !== '' ? vehicleData.bodyStyleDetails : undefined} 
                        onValueChange={(value) => handleInputChange('bodyStyleDetails', value)}
                      >
                        <SelectTrigger className="w-full sm:w-2/3 h-10 sm:h-11 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700">
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
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full sm:w-[34rem] gap-2">
                      <Label htmlFor="ownerDetails" className="w-full sm:w-1/3 text-left sm:text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Owner:</Label>
                      <Select 
                        value={vehicleData.ownerDetails && vehicleData.ownerDetails.trim() !== '' ? vehicleData.ownerDetails : undefined} 
                        onValueChange={(value) => handleInputChange('ownerDetails', value)}
                      >
                        <SelectTrigger className="w-full sm:w-2/3 h-10 sm:h-11 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700">
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
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full sm:w-[34rem] gap-2">
                      <Label htmlFor="homeTestDriveDetails" className="w-full sm:w-1/3 text-left sm:text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Home Test Drive Available?</Label>
                      <Select 
                        value={vehicleData.homeTestDriveDetails && vehicleData.homeTestDriveDetails.trim() !== '' ? vehicleData.homeTestDriveDetails : undefined} 
                        onValueChange={(value) => handleInputChange('homeTestDriveDetails', value)}
                      >
                        <SelectTrigger className="w-full sm:w-2/3 h-10 sm:h-11 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700">
                          <SelectValue placeholder="Select Option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* KM run */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full sm:w-[34rem] gap-2">
                      <Label htmlFor="kmRun" className="w-full sm:w-1/3 text-left sm:text-right text-sm font-semibold text-gray-700 whitespace-nowrap">KM run: <span className="text-red-500">*</span></Label>
                      <div className="w-full sm:w-2/3">
                        <Input
                          id="kmRun"
                          placeholder="Enter KM run (0 - 2,000,000)"
                          type="number"
                          value={vehicleData.kmRun || ''}
                          onChange={(e) => handleInputChange('kmRun', e.target.value)}
                          className={`w-full h-10 sm:h-11 px-3 py-2 text-sm sm:text-base border rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400 ${validationErrors.kmRun ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                          min="0"
                          max="2000000"
                        />
                        <ValidationError error={validationErrors.kmRun} />
                      </div>
                    </div>

                    {/* Fuel Type */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full sm:w-[34rem] gap-2">
                      <Label htmlFor="fuelTypeDetails" className="w-full sm:w-1/3 text-left sm:text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Fuel Type: <span className="text-red-500">*</span></Label>
                      <Select 
                        value={vehicleData.fuelTypeDetails && vehicleData.fuelTypeDetails.trim() !== '' ? vehicleData.fuelTypeDetails : undefined} 
                        onValueChange={(value) => handleInputChange('fuelTypeDetails', value)}
                      >
                        <SelectTrigger className="w-full sm:w-2/3 h-10 sm:h-11 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700">
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
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full sm:w-[34rem] gap-2">
                      <Label htmlFor="transmissionTypeDetails" className="w-full sm:w-1/3 text-left sm:text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Transmission Type: <span className="text-red-500">*</span></Label>
                      <Select 
                        value={vehicleData.transmissionTypeDetails && vehicleData.transmissionTypeDetails.trim() !== '' ? vehicleData.transmissionTypeDetails : undefined} 
                        onValueChange={(value) => handleInputChange('transmissionTypeDetails', value)}
                      >
                        <SelectTrigger className="w-full sm:w-2/3 h-10 sm:h-11 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700">
                          <SelectValue placeholder="Select Transmission" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="automatic">Automatic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Exterior Colour */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full sm:w-[34rem] gap-2">
                      <Label htmlFor="exteriorColorDetails" className="w-full sm:w-1/3 text-left sm:text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Exterior Colour:</Label>
                      <Input
                        id="exteriorColorDetails"
                        placeholder="Enter Exterior Colour"
                        value={vehicleData.exteriorColorDetails || ''}
                        onChange={(e) => handleInputChange('exteriorColorDetails', e.target.value)}
                        className="w-full sm:w-2/3 h-10 sm:h-11 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400"
                      />
                    </div>

                    {/* Interior Color */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full sm:w-[34rem] gap-2">
                      <Label htmlFor="interiorColorDetails" className="w-full sm:w-1/3 text-left sm:text-right text-sm font-semibold text-gray-700 whitespace-nowrap">Interior Color:</Label>
                      <Input
                        id="interiorColorDetails"
                        placeholder="Enter Interior Color"
                        value={vehicleData.interiorColorDetails || ''}
                        onChange={(e) => handleInputChange('interiorColorDetails', e.target.value)}
                        className="w-full sm:w-2/3 h-10 sm:h-11 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="photos" className="mt-0">
                  <div className="flex flex-col gap-4 items-center">
                    <div className="w-full max-w-sm sm:w-80 mx-auto">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-8">
                        <div className="text-center">
                          <Upload className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-2 sm:mb-4" />
                          <div className="text-xs sm:text-sm font-medium text-gray-900 mb-2">
                            Click to upload images and videos of the vehicle or drop media files here to upload.
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                            Supported formats: JPG, PNG, GIF, MP4, MOV, AVI, WebM. Max upload size is 50MB per file. Multiple files allowed.
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={uploading}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {uploading ? 'Uploading...' : 'Upload Media'}
                          </Button>
                          <Input
                            ref={fileInputRef}
                            id="media-upload"
                            type="file"
                            multiple
                            accept="image/*,video/*,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.webm"
                            onChange={handleMediaUpload}
                            className="hidden"
                          />
                          {uploadProgress !== null && (
                            <div className="mt-4">
                              <Progress
                                value={uploadProgress}
                                className="h-3 sm:h-4 w-full bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 shadow-lg animate-pulse"
                              />
                              <div className="text-xs mt-1 font-semibold text-blue-700">{uploadProgress}%</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Display uploaded media */}
                    {uploadedMedia.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                        {uploadedMedia.map((mediaUrl, index) => {
                          const isVideo = mediaUrl.match(/\.(mp4|mov|avi|webm)$/i) || mediaUrl.includes('video');
                          return (
                            <div key={index} className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto">
                              {isVideo ? (
                                <video
                                  src={mediaUrl}
                                  className="w-full h-full object-cover rounded-lg border"
                                  controls
                                  muted
                                >
                                  Your browser does not support the video tag.
                                </video>
                              ) : (
                                <img
                                  src={mediaUrl}
                                  alt={`Upload ${index + 1}`}
                                  className="w-full h-full object-cover rounded-lg border"
                                />
                              )}
                              <button
                                onClick={() => removeMedia(index)}
                                className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-red-600"
                              >
                                <X className="h-2 w-2 sm:h-3 sm:w-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* 3. Replace the Vehicle Features tab content with the new accordion structure */}
                <TabsContent value="features" className="mt-0">
                  <div className="flex flex-col gap-4 sm:gap-6 items-center w-full">
                    <Accordion type="multiple" className="w-full max-w-2xl">
                      {Object.entries(featureCategories).map(([category, features]) => (
                        <AccordionItem value={category} key={category}>
                          <AccordionTrigger className="text-sm sm:text-base font-semibold text-gray-800 bg-blue-50 px-3 sm:px-4 py-2 sm:py-3 rounded-t-lg">
                            {category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}
                          </AccordionTrigger>
                          <AccordionContent className="bg-white px-3 sm:px-4 pb-3 sm:pb-4 rounded-b-lg">
                            {/* Search bar for this category, except 'additional' */}
                            {category !== 'additional' && (
                              <div className="mb-3">
                                <Input
                                  placeholder={`Search ${category.charAt(0).toUpperCase() + category.slice(1)} Features`}
                                  className="w-full h-9 sm:h-10 px-3 py-2 mt-2 sm:mt-4 text-sm sm:text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400"
                                  value={featureSearch[category] || ''}
                                  onChange={e => setFeatureSearch(prev => ({ ...prev, [category]: e.target.value }))}
                                />
                              </div>
                            )}
                            {/* Feature checkboxes */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-40 sm:max-h-48 overflow-y-auto">
                              {features.filter(feature =>
                                !featureSearch[category] || feature.toLowerCase().includes(featureSearch[category].toLowerCase())
                              ).map((feature) => (
                                <label key={feature} className="flex items-center space-x-2 text-xs sm:text-sm">
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
                            {/* Additional section: Add feature button and input */}
                            {category === 'additional' && (
                              <div className="mt-4 flex flex-col gap-2">
                                {/* Add feature input row appears immediately when Add Feature is clicked */}
                                {newAdditionalFeature === '' && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="w-fit border border-gray-400 text-gray-700 bg-blue-50 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm"
                                    onClick={() => setNewAdditionalFeature(' ')}
                                    disabled={!!newAdditionalFeature}
                                  >
                                    Add feature
                                  </Button>
                                )}
                                {newAdditionalFeature !== '' && (
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      autoFocus
                                      value={newAdditionalFeature}
                                      onChange={e => setNewAdditionalFeature(e.target.value)}
                                      onBlur={() => {
                                        const trimmed = newAdditionalFeature.trim();
                                        if (trimmed && !vehicleData.additional.some((f: any) => f.value === trimmed)) {
                                          const newFeature = { id: `${Date.now()}-${Math.random()}`, value: trimmed };
                                          setVehicleData(prev => ({
                                            ...prev,
                                            additional: [...prev.additional, newFeature]
                                          }));
                                        }
                                        setNewAdditionalFeature('');
                                      }}
                                      onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          const trimmed = newAdditionalFeature.trim();
                                          if (trimmed && !vehicleData.additional.some((f: any) => f.value === trimmed)) {
                                            const newFeature = { id: `${Date.now()}-${Math.random()}`, value: trimmed };
                                            setVehicleData(prev => ({
                                              ...prev,
                                              additional: [...prev.additional, newFeature]
                                            }));
                                          }
                                          setNewAdditionalFeature('');
                                        } else if (e.key === 'Escape') {
                                          setNewAdditionalFeature('');
                                        }
                                      }}
                                      className="flex-1 sm:w-48 h-9 sm:h-10 px-3 py-2 text-xs sm:text-base border border-gray-300 rounded-lg bg-blue-50 text-gray-700 placeholder:text-gray-400"
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
                                {/* List custom features */}
                                {vehicleData.additional.length > 0 && (
                                  <div className="mt-2 flex flex-col gap-2">
                                    {vehicleData.additional.map((feature: any) => (
                                      <div key={feature.id || `${feature.value}-${Math.random()}`} className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          checked={vehicleData.additional.some((f: any) => f.id === feature.id)}
                                          onChange={() => toggleFeature('additional', feature.value)}
                                          className="rounded border-gray-300 bg-blue-50"
                                        />
                                        <span className="text-xs sm:text-sm">{feature.value}</span>
                                        <button
                                          type="button"
                                          className="ml-2 text-red-500 hover:text-red-700 text-xs"
                                          onClick={() => setVehicleData(prev => ({
                                            ...prev,
                                            additional: prev.additional.filter((f: any) => f.id !== feature.id)
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

                {/* Inspection Report Tab Content */}
                <TabsContent value="inspection" className="p-3 sm:p-6">
                  {Object.entries(vehicleInspectionSchema).map(([section, fields]) => (
                    <Accordion type="single" collapsible key={section} className="mb-4">
                      <AccordionItem value={section}>
                        <AccordionTrigger className="text-sm sm:text-lg font-semibold capitalize">{section.replace(/_/g, ' ')}</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            {Object.entries(fields).map(([field, options]) => (
                              <div key={field} className="flex flex-col gap-1">
                                <label className="text-xs sm:text-sm font-medium capitalize mb-1">{field.replace(/_/g, ' ')}</label>
                                {Array.isArray(options) ? (
                                  <Select
                                    value={inspectionReport[section]?.[field] || ''}
                                    onValueChange={val => setInspectionReport(r => ({
                                      ...r,
                                      [section]: { ...r[section], [field]: val }
                                    }))}
                                  >
                                    <SelectTrigger className="w-full h-9 sm:h-10 text-xs sm:text-sm">
                                      <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {options.map(opt => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : options === 'number' ? (
                                  <input
                                    type="number"
                                    className="w-full h-9 sm:h-10 px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-blue-50"
                                    value={inspectionReport[section]?.[field] || ''}
                                    onChange={e => setInspectionReport(r => ({
                                      ...r,
                                      [section]: { ...r[section], [field]: e.target.value }
                                    }))}
                                  />
                                ) : (
                                  <input
                                    type="text"
                                    className="w-full h-9 sm:h-10 px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-blue-50"
                                    value={inspectionReport[section]?.[field] || ''}
                                    onChange={e => setInspectionReport(r => ({
                                      ...r,
                                      [section]: { ...r[section], [field]: e.target.value }
                                    }))}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Sticky Footer with navigation buttons - at the bottom of the flex column, not absolutely positioned */}
          <div className="border-t px-3 sm:px-6 py-3 sm:py-4 bg-white z-10">
            <div className="flex justify-between items-center w-full gap-2 sm:gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  const tabs = ["info", "details", "photos", "features", "inspection"];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1]);
                  }
                }}
                disabled={activeTab === "info"}
                className="w-24 sm:w-40 rounded-full border border-gray-600 text-gray-700 bg-white px-4 sm:px-8 py-2 font-semibold shadow-none hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-700 text-xs sm:text-sm"
              >
                Previous
              </Button>

              {activeTab !== "inspection" && (
                <Button
                  onClick={() => {
                    const tabs = ["info", "details", "photos", "features", "inspection"];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex < tabs.length - 1) {
                      setActiveTab(tabs[currentIndex + 1]);
                    }
                  }}
                  className="w-24 sm:w-40 bg-blue-800 hover:bg-blue-900 text-white rounded-full px-4 sm:px-8 py-2 font-semibold disabled:opacity-60 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  Next
                </Button>
              )}

              <Button
                onClick={handleSave}
                disabled={activeTab !== "inspection" || Object.keys(validationErrors).length > 0}
                className="w-32 sm:w-40 bg-green-700 hover:bg-green-800 text-white rounded-full px-4 sm:px-8 py-2 font-semibold disabled:opacity-60 disabled:cursor-not-allowed text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Save Vehicle Info</span>
                <span className="sm:hidden">Save</span>
              </Button>
            </div>
            <div className="flex justify-center mt-2 sm:mt-3">
              {["info", "details", "photos", "features", "inspection"].map((tab, index) => (
                <div
                  key={tab}
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mx-0.5 sm:mx-1 ${
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