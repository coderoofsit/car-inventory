import React, { useState, useRef } from 'react';
import axios from 'axios';
import { createContact, createOpportunity } from "@/lib/ghlAPI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, Plus, Filter, Heart, Eye, Code, Globe, Copy, CheckCircle, Upload, X, Phone, Calendar } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import VehicleAddDialog from "@/components/VehicleAddDialog";
import CarList from "@/components/CarList";
import { saveVehicleToBackend, fetchVehiclesFromBackend, fetchCarById, fetchFilterMetadataFromBackend } from "@/lib/vehicleAPI";
import CarDetailDialog from "@/components/CarDetailDialog";
import { findFirstImageUrl, Car } from "@/lib/utils";
import VehicleFilterComponent, { VehicleFilters } from '@/components/VehicleFilterComponent';
const isEmbedded = window.self !== window.top;

const sampleCars: Car[] = [
  {
    id: 1,
    make: "Toyota",
    model: "Camry XSE",
    year: 2020,
    price: 28500,
    mileage: 35000,
    location: "Los Angeles, CA",
    fuel: "Hybrid",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    condition: "Excellent",
    description: "Well-maintained Toyota Camry XSE with hybrid engine. Single owner, service records available.",
    vin: "1HGCM82633A004352",
    availability: 'Available'
  },
  {
    id: 2,
    make: "Volkswagen",
    model: "Vento Sedan",
    year: 2015,
    price: 15500,
    mileage: 65000,
    location: "New York, NY",
    fuel: "Gasoline",
    transmission: "Manual",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    condition: "Good",
    description: "Reliable Volkswagen Vento with excellent fuel efficiency. Regular maintenance records.",
    vin: "WVWM113C3CA000222",
    availability: 'Available'
  },
  {
    id: 3,
    make: "Maruti Suzuki",
    model: "Baleno Hatchback",
    year: 2014,
    price: 12000,
    mileage: 85000,
    location: "San Francisco, CA",
    fuel: "Gasoline",
    transmission: "Manual",
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    condition: "Good",
    description: "Compact and efficient Maruti Suzuki Baleno. Perfect for city driving.",
    vin: "WVWM113C3CA000532",
    availability: 'Available'
  },
  {
    id: 4,
    make: "Honda",
    model: "City AT",
    year: 2018,
    price: 18500,
    mileage: 45000,
    location: "Chicago, IL",
    fuel: "Gasoline",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    condition: "Very Good",
    description: "Honda City with automatic transmission. Comfortable and reliable sedan.",
    vin: "WVWM113C3CA000535",
    availability: 'Available'
  }
];

// Debounce utility
function useDebouncedEffect(effect: () => void, deps: React.DependencyList, delay: number) {
  const callback = useRef<() => void>(() => {});
  callback.current = effect;
  React.useEffect(() => {
    const handler = setTimeout(() => {
      callback.current();
    }, delay);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay]);
}

const Index = () => {
const [cars, setCars] = useState<Car[]>([]);
const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMake, setSelectedMake] = useState<string>('all');
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [selectedCarDetails, setSelectedCarDetails] = useState<any>(null);
  const [loadingCarDetails, setLoadingCarDetails] = useState(false);
  const [isAddCarOpen, setIsAddCarOpen] = useState(false);
  const [isIntegrateOpen, setIsIntegrateOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [iframeCode, setIframeCode] = useState(`<iframe 
src="${window.location.origin}" 
title="Car Inventory - Embed" 
style="width: 100%; height: 600px; border: 1px solid #e5e7eb; border-radius: 8px;"
frameborder="0">
</iframe>`);
  const [copied, setCopied] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [testDriveForm, setTestDriveForm] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    message: ''
  });
  const [showContactForm, setShowContactForm] = useState(false);
  const [showTestDriveForm, setShowTestDriveForm] = useState(false);

  // Filter metadata state
  const [filterMeta, setFilterMeta] = useState<any>(null);

  // Default filter state using dynamic min/max
  const getDefaultFilterState = (meta: any) => ({
    brands: [],
    models: [],
    bodyStyles: [],
    fuelTypes: [],
    transmission: '',
    ownership: '',
    yearRange: { min: meta?.minYear ?? 2000, max: meta?.maxYear ?? 2024 },
    priceRange: { min: meta?.minPrice ?? 0, max: meta?.maxPrice ?? 1000000 },
    kmRunRange: { min: meta?.minKmRun ?? 0, max: meta?.maxKmRun ?? 200000 }
  });
  
  // Filter states
  const [filters, setFilters] = useState<VehicleFilters>(getDefaultFilterState({}));
  const [pendingFilters, setPendingFilters] = useState<VehicleFilters>(getDefaultFilterState({}));
  
  const [newCar, setNewCar] = useState({
    make: '', model: '', year: '', price: '', mileage: '', location: '',
    fuel: '', transmission: '', condition: '', description: '', image: '', vin: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  // Add state for edit mode and car to edit
  const [isEditCarOpen, setIsEditCarOpen] = useState(false);
  const [editCar, setEditCar] = useState(null);
  // Fetch filter metadata and all cars on mount
  React.useEffect(() => {
    const loadMetaAndCars = async () => {
      try {
        const meta = await fetchFilterMetadataFromBackend();
        setFilterMeta(meta);
        setFilters(getDefaultFilterState(meta));
        setPendingFilters(getDefaultFilterState(meta));
        const carsData = await fetchVehiclesFromBackend();
        setCars(carsData);
        setFilteredCars(carsData);
      } catch (err) {
        console.error('Failed to fetch filter metadata or cars:', err);
        toast({
          title: "Error Loading Data",
          description: "Failed to load filter metadata or vehicles from database. Please refresh the page.",
          variant: "destructive"
    });
      }
    };
    loadMetaAndCars();
}, []);

  // When cars change (after fetch), reset filters to new min/max if meta is available
  React.useEffect(() => {
    if (!filterMeta) return;
    const newDefault = getDefaultFilterState(filterMeta);
    setFilters(newDefault);
    setPendingFilters(newDefault);
  }, [filterMeta]);

  // Remove local filtering logic (use backend only)
  // Remove useEffect that filters cars based on filters

  // Handler for Apply Filters
  const handleApplyFilters = async () => {
    // Map pendingFilters to backend query params
    const params: Record<string, any> = {};
    if (pendingFilters.brands && pendingFilters.brands.length > 0) params.brand = pendingFilters.brands;
    if (pendingFilters.models && pendingFilters.models.length > 0) params.model = pendingFilters.models;
    if (pendingFilters.bodyStyles && pendingFilters.bodyStyles.length > 0) params.bodyStyle = pendingFilters.bodyStyles;
    if (pendingFilters.fuelTypes && pendingFilters.fuelTypes.length > 0) params.fuel = pendingFilters.fuelTypes;
    if (pendingFilters.transmission) params.transmission = pendingFilters.transmission;
    if (pendingFilters.ownership) params.ownership = pendingFilters.ownership;
    if (pendingFilters.yearRange) {
      params.minYear = pendingFilters.yearRange.min;
      params.maxYear = pendingFilters.yearRange.max;
    }
    if (pendingFilters.priceRange) {
      params.minPrice = pendingFilters.priceRange.min;
      params.maxPrice = pendingFilters.priceRange.max;
    }
    if (pendingFilters.kmRunRange) {
      params.minKmRun = pendingFilters.kmRunRange.min;
      params.maxKmRun = pendingFilters.kmRunRange.max;
    }
    // Always include the current searchTerm if present
    if (searchTerm.trim()) params.search = searchTerm.trim();
    try {
      const carsData = await fetchVehiclesFromBackend(params);
      setCars(carsData);
      setFilteredCars(carsData);
      setShowFilters(false);
    } catch (err) {
      toast({
        title: "Error Applying Filters",
        description: "Failed to fetch filtered vehicles from database.",
        variant: "destructive"
      });
    }
  };

  // Handler for Clear Filters
  const handleClearFilters = async () => {
    const newDefault = getDefaultFilterState(filterMeta);
    setPendingFilters(newDefault);
    setFilters(newDefault);
    try {
      const carsData = await fetchVehiclesFromBackend();
      setCars(carsData);
      setFilteredCars(carsData);
      setShowFilters(false);
    } catch (err) {
      toast({
        title: "Error Clearing Filters",
        description: "Failed to fetch all vehicles from database.",
        variant: "destructive"
      });
    }
  };

  // When filters change, update pendingFilters as well (if filters are reset externally)
  React.useEffect(() => {
    setPendingFilters(filters);
  }, [filters]);

  // When cars change (after fetch), reset filters to new min/max
  React.useEffect(() => {
    const newDefault = {
      brands: [],
      models: [],
      bodyStyles: [],
      fuelTypes: [],
      transmission: '',
      ownership: '',
      yearRange: { min: filterMeta?.minYear ?? 2000, max: filterMeta?.maxYear ?? 2024 },
      priceRange: { min: filterMeta?.minPrice ?? 0, max: filterMeta?.maxPrice ?? 1000000 },
      kmRunRange: { min: filterMeta?.minKmRun ?? 0, max: filterMeta?.maxKmRun ?? 200000 }
    };
    setFilters(newDefault);
    setPendingFilters(newDefault);
  }, [filterMeta]);

  // Debounced search effect: only depends on searchTerm
  useDebouncedEffect(() => {
    const params: Record<string, any> = {};
    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }
    // Always use the current filters state
    if (filters.brands && filters.brands.length > 0) params.brand = filters.brands;
    if (filters.models && filters.models.length > 0) params.model = filters.models;
    if (filters.bodyStyles && filters.bodyStyles.length > 0) params.bodyStyle = filters.bodyStyles;
    if (filters.fuelTypes && filters.fuelTypes.length > 0) params.fuel = filters.fuelTypes;
    if (filters.transmission) params.transmission = filters.transmission;
    if (filters.ownership) params.ownership = filters.ownership;
    if (filters.yearRange) {
      params.minYear = filters.yearRange.min;
      params.maxYear = filters.yearRange.max;
    }
    if (filters.priceRange) {
      params.minPrice = filters.priceRange.min;
      params.maxPrice = filters.priceRange.max;
    }
    if (filters.kmRunRange) {
      params.minKmRun = filters.kmRunRange.min;
      params.maxKmRun = filters.kmRunRange.max;
    }
    console.log('Debounced search params:', params);
    fetchVehiclesFromBackend(params)
      .then(carsData => {
        setCars(carsData);
        setFilteredCars(carsData);
      })
      .catch(err => {
        console.error('Error fetching cars for search:', err);
      });
  }, [searchTerm], 400);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setUploadedImages(prev => [...prev, result]);
          if (uploadedImages.length === 0) {
            setNewCar(prev => ({ ...prev, image: result }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      if (index === 0 && newImages.length > 0) {
        setNewCar(prevCar => ({ ...prevCar, image: newImages[0] }));
      } else if (newImages.length === 0) {
        setNewCar(prevCar => ({ ...prevCar, image: '' }));
      }
      return newImages;
    });
  };

  const resetFilters = () => {
    setFilters(getDefaultFilterState(filterMeta));
    // setSelectedMake('all'); // Remove if not needed
  };

const handleAddCar = async () => {
  if (!newCar.make || !newCar.model || !newCar.year || !newCar.price) {
    toast({
      title: "Missing Information",
      description: "Please fill in all required fields.",
      variant: "destructive"
    });
    return;
  }

  const carToAdd = {
    make: newCar.make,
    model: newCar.model,
    year: parseInt(newCar.year),
    price: parseInt(newCar.price),
    mileage: parseInt(newCar.mileage) || 0,
    location: newCar.location || "Location TBD",
    fuel: newCar.fuel || "Gasoline",
    transmission: newCar.transmission || "Automatic",
    condition: newCar.condition || "Good",
    description: newCar.description || "No description provided.",
    image: newCar.image || "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    vin: newCar.vin || `VIN${Date.now()}`,
    availability: 'Available'
  };

  try {
    const response = await axios.post('http://localhost:5000/api/cars', carToAdd); // 🚀 Send to backend

    setCars(prev => [...prev, response.data]);
    setFilteredCars(prev => [...prev, response.data]);
    setIsAddCarOpen(false);
    setUploadedImages([]);
    setNewCar({
      make: '', model: '', year: '', price: '', mileage: '', location: '',
      fuel: '', transmission: '', condition: '', description: '', image: '', vin: ''
    });

    toast({
      title: "Vehicle Added Successfully!",
      description: `${response.data.make} ${response.data.model} added to your database.`
    });
  } catch (error) {
    console.error("❌ Error adding car:", error);
    toast({
      title: "Database Error",
      description: "Could not save vehicle to backend.",
      variant: "destructive"
    });
  }
};

  // ✅ REPLACED handleContactSubmit and handleTestDriveSubmit below

const handleContactSubmit = async () => {
  if (!contactForm.name || !contactForm.email || !contactForm.phone) {
    toast({
      title: "Missing Information",
      description: "Please fill in all required fields.",
      variant: "destructive"
    });
    return;
  }

  try {
    const contactPayload = {
      locationId: "dvLotMiifOU7u2891LNr",
      firstName: contactForm.name,
      email: contactForm.email,
      phone: contactForm.phone,
      customField: {
        message: contactForm.message
      },
      tags: ["Website Contact"]
    };

    await createContact(contactPayload);

    toast({
      title: "Message Sent!",
      description: "We'll contact you soon about this vehicle."
    });
  } catch (error) {
    console.error("GHL Contact Error:", error);
    toast({
      title: "Submission Failed",
      description: "Failed to send contact to CRM.",
      variant: "destructive"
    });
  }

  setContactForm({ name: '', email: '', phone: '', message: '' });
  setShowContactForm(false);
};
const handleTestDriveSubmit = async () => {
  if (!testDriveForm.name || !testDriveForm.email || !testDriveForm.phone || !testDriveForm.preferredDate) {
    toast({
      title: "Missing Information",
      description: "Please fill in all required fields.",
      variant: "destructive"
    });
    return;
  }

  try {
    // 1️⃣ Create the contact first
    await createContact({
      locationId: "dvLotMiifOU7u2891LNr",
      firstName: testDriveForm.name,
      email: testDriveForm.email,
      phone: testDriveForm.phone,
      customField: {
        preferredDate: testDriveForm.preferredDate,
        preferredTime: testDriveForm.preferredTime,
        message: testDriveForm.message,
      },
      tags: ["Test Drive Request"],
    });

    // 2️⃣ Then create the opportunity
    await createOpportunity({
      title: "Test Drive Opportunity",
      status: "open",
      stageId: "dd4156de-4708-4fdc-b63d-856a8ee7d4ed", // ✅ Your stage ID
      email: testDriveForm.email,
      phone: testDriveForm.phone,
      monetaryValue: 0,
      source: "website",
      name: testDriveForm.name,
      companyName: "Interested in Test Drive"
    });

    toast({
      title: "Test Drive Scheduled!",
      description: "Opportunity created in CRM."
    });
  } catch (error) {
    console.error("GHL Opportunity Error:", error);
    toast({
      title: "Submission Failed",
      description: "Failed to create opportunity in CRM.",
      variant: "destructive"
    });
  }

  setTestDriveForm({ name: '', email: '', phone: '', preferredDate: '', preferredTime: '', message: '' });
  setShowTestDriveForm(false);
};



  const copyIframeCode = () => {
    navigator.clipboard.writeText(iframeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Code Copied!",
      description: "iFrame code has been copied to your clipboard."
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Car Inventory</h1>
            </div>
            {!isEmbedded && (
  <div className="flex items-center space-x-3">
    <Dialog open={isIntegrateOpen} onOpenChange={setIsIntegrateOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2">
          <Code className="h-4 w-4" />
          Integrate App
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Embed Our Car Inventory</DialogTitle>
        </DialogHeader>
        <div className="mt-6 space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-blue-800">Integration Instructions</h3>
            <p className="text-sm text-blue-700">
              Copy the HTML code below and paste it into your website to embed our car inventory. 
              This will display our complete car catalog on your site.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-blue-600 text-white p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">HTML Embed Code</h3>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <code className="text-sm text-gray-800 block whitespace-pre-wrap font-mono">
                {iframeCode}
              </code>
              <Button 
                onClick={copyIframeCode}
                className="mt-3 flex items-center gap-2"
                variant="outline"
              >
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy Embed Code"}
              </Button>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">How to Use:</h4>
              <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
                <li>Copy the HTML code above</li>
                <li>Paste it into your website's HTML where you want the car inventory to appear</li>
                <li>The iframe will automatically display our complete car catalog</li>
                <li>The inventory updates in real-time as we add new cars</li>
              </ol>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">Features Included:</h4>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                <li>Complete car inventory with search and filtering</li>
                <li>Responsive design that works on all devices</li>
                <li>Real-time updates when new cars are added</li>
                <li>Professional car detail pages</li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    
    {/* REPLACED Add Vehicle Dialog with VehicleAddDialog */}
    <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsAddCarOpen(true)}>
      <Plus className="h-4 w-4" />
      Add vehicle(s)
    </Button>
    <VehicleAddDialog
      isOpen={isAddCarOpen}
      onClose={() => setIsAddCarOpen(false)}
      onSave={async (vehicleData) => {
        try {
          // Show loading toast
          toast({
            title: "Saving Vehicle...",
            description: "Please wait while we save the vehicle to the database.",
          });

          // Save to backend
          const savedVehicle = await saveVehicleToBackend(vehicleData);

          // Map the saved vehicle data to the local Car type
        const newVehicle = {
            id: savedVehicle._id || Date.now(),
            make: savedVehicle.brand || vehicleData.brand || "Unknown",
            model: savedVehicle.model || vehicleData.model || "Unknown",
            year: parseInt(savedVehicle.manufactureYear || vehicleData.manufactureYear) || 0,
            price: parseInt(savedVehicle.sellingPrice || vehicleData.sellingPrice) || 0,
            mileage: parseInt(savedVehicle.kmRun || vehicleData.kmRun) || 0,
            location: savedVehicle.location || "Location TBD",
            fuel: savedVehicle.fuelTypeDetails || vehicleData.fuelTypeDetails || "Gasoline",
            transmission: savedVehicle.transmissionTypeDetails || vehicleData.transmissionTypeDetails || "Automatic",
            image: findFirstImageUrl(vehicleData.images) || findFirstImageUrl(savedVehicle.images) || "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            condition: savedVehicle.condition || vehicleData.condition || "Good",
            description: savedVehicle.description || vehicleData.description || "No description provided.",
            vin: savedVehicle.vin || vehicleData.vin || `VIN${Date.now()}`,
          availability:
              savedVehicle.status === "sold" || vehicleData.status === "sold"
              ? "Sold"
                : savedVehicle.status === "reserved" || vehicleData.status === "reserved"
              ? "Reserved"
              : "Available" as "Available" | "Sold" | "Reserved",
        };

          // Add to local state
        setCars(prev => [...prev, newVehicle]);
        setFilteredCars(prev => [...prev, newVehicle]);
        setIsAddCarOpen(false);

          // Show success toast
        toast({
          title: "Vehicle Added Successfully!",
            description: `${newVehicle.make} ${newVehicle.model} has been saved to the database.`
          });
        } catch (error) {
          console.error('Error saving vehicle:', error);
          
          // Show error toast
          toast({
            title: "Error Saving Vehicle",
            description: error instanceof Error ? error.message : "Failed to save vehicle to database. Please try again.",
            variant: "destructive"
          });
        }
      }}
    />
  </div>
            )}
          </div>
        </div>
      </header>

      {/* Search and Filter Bar */}

      <div className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing {filteredCars.length} - {Math.min(6, filteredCars.length)} of {filteredCars.length} results
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-center relative">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search for a car"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowFilters(v => !v)}>
                    <Filter className="h-4 w-4" />
                Filter
                      </Button>
            </div>
          </div>
        </div>
      </div>

      {showFilters && filterMeta && (
        <div className="max-w-7xl mx-auto w-full mt-2 rounded-b-xl border-t-0 shadow-lg">
          <VehicleFilterComponent 
            filters={pendingFilters} 
            setFilters={setPendingFilters}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
            brandOptions={filterMeta.brands.map((b: string) => ({ value: b, label: b }))}
            modelOptions={filterMeta.models.map((m: string) => ({ value: m, label: m }))}
            fuelTypeOptions={filterMeta.fuelTypes.map((f: string) => ({ value: f, label: f }))}
            transmissionOptions={filterMeta.transmissions.map((t: string) => ({ value: t, label: t }))}
          />
        </div>
      )}

      {/* Car Grid */}
      <div className="container mx-auto px-4 py-8">
        <CarList 
          cars={filteredCars} 
          onCarClick={(car) => {
            console.log('Car clicked:', car);
            setSelectedCarId((car._id || car.id)?.toString());
            setSelectedCarDetails(car); // Ensure dialog gets car data
          }}
        />
      </div>

      {/* Car Detail Modal */}
      <CarDetailDialog
        car={selectedCarDetails}
        open={!!selectedCarId}
        onOpenChange={open => {
          if (!open) {
            setSelectedCarId(null);
            setSelectedCarDetails(null);
          }
        }}
        loading={loadingCarDetails}
        onEdit={() => {
          setEditCar(selectedCarDetails);
          setIsEditCarOpen(true);
        }}
      />
      <VehicleAddDialog
        isOpen={isEditCarOpen}
        onClose={() => setIsEditCarOpen(false)}
        onSave={async (vehicleData) => {
          // If editCar is set, update the car
          if (editCar && editCar._id) {
            try {
              const response = await fetch(`http://localhost:5000/api/cars/${editCar._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vehicleData),
              });
              if (!response.ok) throw new Error('Failed to update car');
              const updatedCar = await response.json();
              setCars(prev => prev.map(car => (car._id === updatedCar._id ? updatedCar : car)));
              setFilteredCars(prev => prev.map(car => (car._id === updatedCar._id ? updatedCar : car)));
              setIsEditCarOpen(false);
              setEditCar(null);
              setSelectedCarDetails(updatedCar);
              toast({ title: 'Car updated', description: 'Vehicle details updated successfully.' });
            } catch (err) {
              toast({ title: 'Error', description: 'Failed to update car.', variant: 'destructive' });
            }
          }
        }}
        editCar={editCar}
        mode={editCar ? 'edit' : 'add'}
      />
    </div>
  );
};

export default Index;

