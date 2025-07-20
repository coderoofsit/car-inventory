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
import { saveVehicleToBackend, fetchVehiclesFromBackend, fetchCarById, fetchFilterMetadataFromBackend, updateVehicleToBackend } from "@/lib/vehicleAPI";
import { findFirstMediaUrl, Car } from "@/lib/utils";
import VehicleFilterComponent, { VehicleFilters } from '@/components/VehicleFilterComponent';
import { Link } from 'react-router-dom';
import { handleContactSubmit, handleTestDriveSubmit } from "@/lib/formHandlers";
import ContactUsDialog from "@/components/ContactUsDialog";
import TestDriveDialog from "@/components/TestDriveDialog";
const isEmbedded = window.self !== window.top;

const sampleCars: Car[] = [
 
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
const [showFilters, setShowFilters] = useState(false);
const [newCar, setNewCar] = useState({
  make: '', model: '', year: '', price: '', mileage: '', location: '',
  fuel: '', transmission: '', condition: '', description: '', media: [] as string[], vin: ''
});
const [filterMeta, setFilterMeta] = useState<any>(null);
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
const [filters, setFilters] = useState<VehicleFilters>(getDefaultFilterState({}));
const [pendingFilters, setPendingFilters] = useState<VehicleFilters>(getDefaultFilterState({}));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMake, setSelectedMake] = useState<string>('all');
  const [isAddCarOpen, setIsAddCarOpen] = useState(false);
  const [isIntegrateOpen, setIsIntegrateOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<string[]>([]);
  const [iframeCode, setIframeCode] = useState(`<iframe 
src="${window.location.origin}" 
title="Car Inventory - Embed" 
style="width: 100%; height: 600px; border: 1px solid #e5e7eb; border-radius: 8px;"
frameborder="0">
</iframe>`);
  const [copied, setCopied] = useState(false);
  // Remove all state and JSX related to:
  // - showContactForm, setShowContactForm
  // - contactForm, setContactForm
  // - showTestDriveForm, setShowTestDriveForm
  // - testDriveForm, setTestDriveForm
  // - ContactUsDialog
  // - TestDriveDialog
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

  // Add useEffect to apply filters automatically when pendingFilters changes
  React.useEffect(() => {
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

    fetchVehiclesFromBackend(params)
      .then(carsData => {
        setCars(carsData);
        setFilteredCars(carsData);
      })
      .catch(err => {
        toast({
          title: "Error Applying Filters",
          description: "Failed to fetch filtered vehicles from database.",
          variant: "destructive"
        });
      });
  }, [pendingFilters, searchTerm]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setUploadedMedia(prev => [...prev, result]);
          if (uploadedMedia.length === 0) {
            setNewCar(prev => ({ ...prev, media: [result] }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setUploadedMedia(prev => {
      const newMedia = prev.filter((_, i) => i !== index);
      if (index === 0 && newMedia.length > 0) {
        setNewCar(prevCar => ({ ...prevCar, media: [newMedia[0]] }));
      } else if (newMedia.length === 0) {
        setNewCar(prevCar => ({ ...prevCar, media: [] }));
      }
      return newMedia;
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
    media: newCar.media && newCar.media.length > 0 ? newCar.media : ["https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    vin: newCar.vin || `VIN${Date.now()}`,
    status: 'Available',
    location_id: import.meta.env.VITE_LOCATION_ID,
  };

  try {
    const response = await axios.post('http://localhost:5000/api/cars', carToAdd); // 🚀 Send to backend

    setCars(prev => [...prev, response.data as Car]);
    setFilteredCars(prev => [...prev, response.data as Car]);
    setIsAddCarOpen(false);
    setUploadedMedia([]);
    setNewCar({
      make: '', model: '', year: '', price: '', mileage: '', location: '',
      fuel: '', transmission: '', condition: '', description: '', media: [] as string[], vin: ''
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

  const [showRequirementDialog, setShowRequirementDialog] = useState(false);
  const [requirementContact, setRequirementContact] = useState({ name: '', email: '', phone: '' });
  const [requirementSubmitted, setRequirementSubmitted] = useState(false);

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
    <Link to="/admin">
      <Button className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-semibold">
        Admin
      </Button>
    </Link>
    <VehicleAddDialog
      isOpen={isAddCarOpen}
      onClose={() => setIsAddCarOpen(false)}
      onSave={async (vehicleData) => {
        try {
          toast({
            title: "Saving Vehicle...",
            description: "Please wait while we save the vehicle to the database.",
          });
          // Save to backend (now includes inspectionReport if present)
          const savedVehicle = await saveVehicleToBackend(vehicleData);
          // Use the response directly for dialog
          setCars(prev => [...prev, savedVehicle as Car]);
          setFilteredCars(prev => [...prev, savedVehicle as Car]);
          setIsAddCarOpen(false);
          setUploadedMedia([]);
          setNewCar({
            make: '', model: '', year: '', price: '', mileage: '', location: '',
            fuel: '', transmission: '', condition: '', description: '', media: [] as string[], vin: ''
          });
          toast({
            title: "Vehicle Added Successfully!",
            description: `${savedVehicle.brand || savedVehicle.make} ${savedVehicle.model} added to your database.`
          });
        } catch (error) {
          console.error("❌ Error adding car:", error);
          toast({
            title: "Database Error",
            description: "Could not save vehicle to backend.",
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
          emptyState={
            <>
              <div>No cars found for your filters.</div>
              <Button className="mt-4" onClick={() => setShowRequirementDialog(true)}>
                Request a Car
              </Button>
            </>
          }
        />
      </div>

      {/* Requirement Dialog */}
      <Dialog open={showRequirementDialog} onOpenChange={setShowRequirementDialog}>
        <DialogContent>
          <DialogTitle>Request a Car</DialogTitle>
          {requirementSubmitted ? (
            <div className="text-center py-8">Thank you! We have registered your requirement and will reach out when we find a match.</div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={async e => {
                e.preventDefault();
                // Send filter + contact data to backend
                const payload = {
                  filters: pendingFilters,
                  contact: requirementContact
                };
                try {
                  await fetch('http://localhost:5000/api/requirements', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                  });
                  setRequirementSubmitted(true);
                  setTimeout(() => {
                    setShowRequirementDialog(false);
                    setRequirementSubmitted(false);
                    setRequirementContact({ name: '', email: '', phone: '' });
                  }, 3000);
                } catch (err) {
                  toast({ title: 'Error', description: 'Failed to register requirement', variant: 'destructive' });
                }
              }}
            >
              <Input
                placeholder="Name"
                value={requirementContact.name}
                onChange={e => setRequirementContact({ ...requirementContact, name: e.target.value })}
                required
              />
              <Input
                placeholder="Email"
                value={requirementContact.email}
                onChange={e => setRequirementContact({ ...requirementContact, email: e.target.value })}
                required
              />
              <Input
                placeholder="Phone"
                value={requirementContact.phone}
                onChange={e => setRequirementContact({ ...requirementContact, phone: e.target.value })}
                required
              />
              <Button type="submit" className="w-full">Submit Requirement</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;

