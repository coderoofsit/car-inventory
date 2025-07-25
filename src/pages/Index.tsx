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
import { Search, Plus, Filter, Heart, Eye, Code, Globe, Copy, CheckCircle, Upload, X, Phone, Calendar, Menu, Loader2 } from 'lucide-react';
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

const urlParams = new URLSearchParams(window.location.search);
const isEmbedded = urlParams.get("source") === "notOnGHL";

const sampleCars: Car[] = [];

// Loading Skeleton Components
const CarCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-300"></div>
    <div className="p-4 space-y-3">
      <div className="h-6 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      <div className="flex justify-between">
        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
      </div>
      <div className="h-8 bg-gray-300 rounded w-full"></div>
    </div>
  </div>
);

const LoadingSpinner = ({ size = 4 }: { size?: number }) => (
  <Loader2 className={`h-${size} w-${size} animate-spin`} />
);

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
  //console.log('Index render');
  React.useEffect(() => {
    const onBlur = (e) => {
      //console.log('Blur event:', e.target);
    };
    window.addEventListener('blur', onBlur, true);
    return () => window.removeEventListener('blur', onBlur, true);
  }, []);
const [cars, setCars] = useState<Car[]>([]);
const [filteredCars, setFilteredCars] = useState<Car[]>([]);
const [showFilters, setShowFilters] = useState(false);
const [newCar, setNewCar] = useState({
  make: '', model: '', year: '', price: '', mileage: '', location: '',
  fuel: '', transmission: '', condition: '', description: '', media: [] as string[], vin: ''
});
const [filterMeta, setFilterMeta] = useState<any>(null);

// Loading States
const [isInitialLoad, setIsInitialLoad] = useState(true);
const [isFilterLoading, setIsFilterLoading] = useState(false);
const [isSearchLoading, setIsSearchLoading] = useState(false);
const [isClearingFilters, setIsClearingFilters] = useState(false);
const [isAddingCar, setIsAddingCar] = useState(false);
const [isSubmittingRequirement, setIsSubmittingRequirement] = useState(false);

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
const inputRef = useRef<HTMLInputElement>(null);
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
const [iframeCodeNotOnGHL, setIframeCodeNotOnGHL] = useState(`<iframe 
  src="${window.location.origin}/?source=notOnGHL" 
  title="Car Inventory - Embed" 
  style="width: 100%; height: 600px; border: 1px solid #e5e7eb; border-radius: 8px;"
  frameborder="0">
  </iframe>`);
const [copied, setCopied] = useState(false);
const [copiedNotOnGHL, setCopiedNotOnGHL] = useState(false);

const [isEditCarOpen, setIsEditCarOpen] = useState(false);
const [editCar, setEditCar] = useState(null);
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setSearchTerm(e.target.value);

  // 🔁 Focus after state update with setTimeout
  setTimeout(() => {
    if (inputRef.current) {
      inputRef.current.focus(); // Re-focus input
      //console.log('Input focused again:', inputRef.current.value);
    }
  }, 0);
};
// Helper function to check if filters have actual values (not default empty state)
const hasActiveFilters = (filterState: VehicleFilters, meta: any) => {
  const defaultState = getDefaultFilterState(meta);
  return (
    (filterState.brands && filterState.brands.length > 0) ||
    (filterState.models && filterState.models.length > 0) ||
    (filterState.bodyStyles && filterState.bodyStyles.length > 0) ||
    (filterState.fuelTypes && filterState.fuelTypes.length > 0) ||
    (filterState.transmission && filterState.transmission !== '') ||
    (filterState.ownership && filterState.ownership !== '') ||
    (filterState.yearRange && (filterState.yearRange.min !== defaultState.yearRange.min || filterState.yearRange.max !== defaultState.yearRange.max)) ||
    (filterState.priceRange && (filterState.priceRange.min !== defaultState.priceRange.min || filterState.priceRange.max !== defaultState.priceRange.max)) ||
    (filterState.kmRunRange && (filterState.kmRunRange.min !== defaultState.kmRunRange.min || filterState.kmRunRange.max !== defaultState.kmRunRange.max))
  );
};

// Initial load: Fetch filter metadata and all cars
React.useEffect(() => {
  const loadMetaAndCars = async () => {
    setIsInitialLoad(true);
    try {
      const [meta, carsData] = await Promise.all([
        fetchFilterMetadataFromBackend(),
        fetchVehiclesFromBackend() // Fetch ALL cars initially
      ]);
      
      setFilterMeta(meta);
      const defaultState = getDefaultFilterState(meta);
      setFilters(defaultState);
      setPendingFilters(defaultState);
      setCars(carsData);
      setFilteredCars(carsData);
    } catch (err) {
      console.error('Failed to fetch filter metadata or cars:', err);
      toast({
        title: "Error Loading Data",
        description: "Failed to load filter metadata or vehicles from database. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setIsInitialLoad(false);
    }
  };
  loadMetaAndCars();
}, []);

// Apply filters effect - only runs when filters are actually applied (not on initial load)
React.useEffect(() => {
  // Skip if this is the initial load or if no filter metadata is available yet
  if (isInitialLoad || !filterMeta) return;

  const applyFilters = async () => {
    setIsFilterLoading(true);
    const params: Record<string, any> = {};
    
    // Add search term if present
    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }
    
    // Only add filter params if they have actual values
    if (hasActiveFilters(pendingFilters, filterMeta)) {
      if (pendingFilters.brands && pendingFilters.brands.length > 0) params.brand = pendingFilters.brands;
      if (pendingFilters.models && pendingFilters.models.length > 0) params.model = pendingFilters.models;
      if (pendingFilters.bodyStyles && pendingFilters.bodyStyles.length > 0) params.bodyStyle = pendingFilters.bodyStyles;
      if (pendingFilters.fuelTypes && pendingFilters.fuelTypes.length > 0) params.fuel = pendingFilters.fuelTypes;
      if (pendingFilters.transmission) params.transmission = pendingFilters.transmission;
      if (pendingFilters.ownership) params.ownership = pendingFilters.ownership;
      
      const defaultState = getDefaultFilterState(filterMeta);
      if (pendingFilters.yearRange && (pendingFilters.yearRange.min !== defaultState.yearRange.min || pendingFilters.yearRange.max !== defaultState.yearRange.max)) {
        params.minYear = pendingFilters.yearRange.min;
        params.maxYear = pendingFilters.yearRange.max;
      }
      if (pendingFilters.priceRange && (pendingFilters.priceRange.min !== defaultState.priceRange.min || pendingFilters.priceRange.max !== defaultState.priceRange.max)) {
        params.minPrice = pendingFilters.priceRange.min;
        params.maxPrice = pendingFilters.priceRange.max;
      }
      if (pendingFilters.kmRunRange && (pendingFilters.kmRunRange.min !== defaultState.kmRunRange.min || pendingFilters.kmRunRange.max !== defaultState.kmRunRange.max)) {
        params.minKmRun = pendingFilters.kmRunRange.min;
        params.maxKmRun = pendingFilters.kmRunRange.max;
      }
    }

    try {
      const carsData = await fetchVehiclesFromBackend(Object.keys(params).length > 0 ? params : undefined);
      setCars(carsData);
      setFilteredCars(carsData);
    } catch (err) {
      console.error('Error applying filters:', err);
      toast({
        title: "Error Applying Filters",
        description: "Failed to fetch filtered vehicles from database.",
        variant: "destructive"
      });
    } finally {
      setIsFilterLoading(false);
    }
  };

  applyFilters();
}, [pendingFilters, filterMeta, isInitialLoad]);

// Debounced search effect for search term only
useDebouncedEffect(() => {
  if (isInitialLoad || !filterMeta) return;

  const performSearch = async () => {
    setIsSearchLoading(true);
    const params: Record<string, any> = {};
    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }
    // DO NOT add filters here!
    try {
      const carsData = await fetchVehiclesFromBackend(Object.keys(params).length > 0 ? params : undefined);
      setCars(carsData);
      setFilteredCars(carsData);
    } catch (err) {
      console.error('Error fetching cars for search:', err);
    } finally {
      setIsSearchLoading(false);
    }
  };

  performSearch();
}, [searchTerm], 400);
// Handler for Apply Filters
const handleApplyFilters = async () => {
  setFilters(pendingFilters); // This will trigger the filter effect
  setShowFilters(false);
  setIsFilterLoading(true);
  const params: Record<string, any> = {};
    
    // Add search term if present
    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }
    
    // Only add filter params if they have actual values
    if (hasActiveFilters(pendingFilters, filterMeta)) {
      if (pendingFilters.brands && pendingFilters.brands.length > 0) params.brand = pendingFilters.brands;
      if (pendingFilters.models && pendingFilters.models.length > 0) params.model = pendingFilters.models;
      if (pendingFilters.bodyStyles && pendingFilters.bodyStyles.length > 0) params.bodyStyle = pendingFilters.bodyStyles;
      if (pendingFilters.fuelTypes && pendingFilters.fuelTypes.length > 0) params.fuel = pendingFilters.fuelTypes;
      if (pendingFilters.transmission) params.transmission = pendingFilters.transmission;
      if (pendingFilters.ownership) params.ownership = pendingFilters.ownership;
      
      const defaultState = getDefaultFilterState(filterMeta);
      if (pendingFilters.yearRange && (pendingFilters.yearRange.min !== defaultState.yearRange.min || pendingFilters.yearRange.max !== defaultState.yearRange.max)) {
        params.minYear = pendingFilters.yearRange.min;
        params.maxYear = pendingFilters.yearRange.max;
      }
      if (pendingFilters.priceRange && (pendingFilters.priceRange.min !== defaultState.priceRange.min || pendingFilters.priceRange.max !== defaultState.priceRange.max)) {
        params.minPrice = pendingFilters.priceRange.min;
        params.maxPrice = pendingFilters.priceRange.max;
      }
      if (pendingFilters.kmRunRange && (pendingFilters.kmRunRange.min !== defaultState.kmRunRange.min || pendingFilters.kmRunRange.max !== defaultState.kmRunRange.max)) {
        params.minKmRun = pendingFilters.kmRunRange.min;
        params.maxKmRun = pendingFilters.kmRunRange.max;
      }
    }

  try {
    const carsData = await fetchVehiclesFromBackend(Object.keys(params).length > 0 ? params : undefined);
    setCars(carsData);
    setFilteredCars(carsData);
  } catch (err) {
    toast({
      title: "Error Applying Filters",
      description: "Failed to fetch filtered vehicles from database.",
      variant: "destructive"
    });
  } finally {
    setIsFilterLoading(false);
  }
};

// Handler for Clear Filters
const handleClearFilters = async () => {
  if (!filterMeta) return;
  
  setIsClearingFilters(true);
  const newDefault = getDefaultFilterState(filterMeta);
  setPendingFilters(newDefault);
  setFilters(newDefault);
  
  try {
    const carsData = await fetchVehiclesFromBackend(); // Fetch all cars
    setCars(carsData);
    setFilteredCars(carsData);
    setShowFilters(false);
  } catch (err) {
    toast({
      title: "Error Clearing Filters",
      description: "Failed to fetch all vehicles from database.",
      variant: "destructive"
    });
  } finally {
    setIsClearingFilters(false);
  }
};

// When filters change, update pendingFilters as well (if filters are reset externally)
React.useEffect(() => {
  if (isInitialLoad) return;
  setPendingFilters(filters);
}, [filters, isInitialLoad]);

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
  if (!filterMeta) return;
  setFilters(getDefaultFilterState(filterMeta));
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

  setIsAddingCar(true);
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
    const response = await axios.post('http://localhost:5000/api/cars', carToAdd);

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
  } finally {
    setIsAddingCar(false);
  }
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
const copyIframeWithNoControlsCode = () => {
  navigator.clipboard.writeText(iframeCodeNotOnGHL);
  setCopiedNotOnGHL(true);
  setTimeout(() => setCopiedNotOnGHL(false), 2000);
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
    {!isEmbedded && (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Car Inventory</h1>
          </div>
          
         
            <>
              {/* Desktop Actions */}
              <div className="hidden md:flex items-center space-x-3">
                <Dialog open={isIntegrateOpen} onOpenChange={setIsIntegrateOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 lg:px-6 py-2 rounded-lg flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      <span className="hidden lg:inline">Integrate App</span>
                      <span className="lg:hidden">Integrate</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto mx-2">
                    <DialogHeader>
                      <DialogTitle className="text-xl sm:text-2xl font-bold text-center">Embed Our Car Inventory</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
                      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                        <h3 className="text-base sm:text-lg font-semibold mb-2 text-blue-800">Integration Instructions</h3>
                        <p className="text-xs sm:text-sm text-blue-700">
                          Copy the HTML code below and paste it into your website to embed our car inventory. 
                          This will display our complete car catalog on your site.
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-blue-600 text-white p-3 sm:p-4 rounded-lg">
                          <h3 className="text-base sm:text-lg font-semibold mb-2">HTML Embed Code</h3>
                        </div>
                        <div className="bg-gray-100 p-3 sm:p-4 rounded-lg">
                          <code className="text-xs sm:text-sm text-gray-800 block whitespace-pre-wrap font-mono break-all">
                            {iframeCode}
                          </code>
                          <Button 
                            onClick={copyIframeCode}
                            className="mt-3 flex items-center gap-2 text-sm"
                            variant="outline"
                            size="sm"
                          >
                            {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {copied ? "Copied!" : "Copy Embed Code with controls "}
                          </Button>
                        </div>
                        {/*for NotOnGHL*/}
                        <div className="bg-gray-100 p-3 sm:p-4 rounded-lg">
                          <code className="text-xs sm:text-sm text-gray-800 block whitespace-pre-wrap font-mono break-all">
                            {iframeCodeNotOnGHL}
                          </code>
                          <Button 
                            onClick={copyIframeWithNoControlsCode}
                            className="mt-3 flex items-center gap-2 text-sm"
                            variant="outline"
                            size="sm"
                          >
                            {copiedNotOnGHL ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {copiedNotOnGHL ? "Copied!" : "Copy Embed Code Without controls "}
                          </Button>
                        </div>
                        <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
                          <h4 className="font-semibold text-green-800 mb-2 text-sm sm:text-base">How to Use:</h4>
                          <ol className="text-xs sm:text-sm text-green-700 space-y-1 list-decimal list-inside">
                            <li>Copy the HTML code above</li>
                            <li>Paste it into your website's HTML where you want the car inventory to appear</li>
                            <li>The iframe will automatically display our complete car catalog</li>
                            <li>The inventory updates in real-time as we add new cars</li>
                          </ol>
                        </div>
                        
                        <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg border border-yellow-200">
                          <h4 className="font-semibold text-yellow-800 mb-2 text-sm sm:text-base">Features Included:</h4>
                          <ul className="text-xs sm:text-sm text-yellow-700 space-y-1 list-disc list-inside">
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
                
                <Button variant="outline" className="flex items-center gap-2 text-sm" onClick={() => setIsAddCarOpen(true)}>
                  <Plus className="h-4 w-4" />
                  <span className="hidden lg:inline">Add vehicle(s)</span>
                  <span className="lg:hidden">Add</span>
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                    <SheetHeader>
                      <SheetTitle>Menu</SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col space-y-4 mt-6">
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-white justify-start" 
                        onClick={() => {
                          setIsIntegrateOpen(true);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <Code className="h-4 w-4 mr-2" />
                        Integrate App
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start" 
                        onClick={() => {
                          setIsAddCarOpen(true);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Vehicle
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <VehicleAddDialog
                isOpen={isAddCarOpen}
                onClose={() => setIsAddCarOpen(false)}
                onSave={async (vehicleData) => {
                  setIsAddingCar(true);
                  try {
                    toast({
                      title: "Saving Vehicle...",
                      description: "Please wait while we save the vehicle to the database.",
                    });
                    const savedVehicle = await saveVehicleToBackend(vehicleData);
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
                  } finally {
                    setIsAddingCar(false);
                  }
                }}
              />
            </>
          
        </div>
      </div>
    </header>
  )}
    {/* Search and Filter Bar */}
    <div className="bg-white border-b border-gray-200 py-3 sm:py-4">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex flex-col space-y-3 sm:space-y-4">
          
          
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center order-2">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              
              <input
                type="text"
                placeholder="Search for a car"
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-10 text-sm sm:text-base w-full"
                disabled={false}
                ref={inputRef} 
              />
            </div>
            
            {/* Filter Button */}
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2 text-sm sm:text-base px-4 py-2 whitespace-nowrap" 
              onClick={() => setShowFilters(v => !v)}
              disabled={isFilterLoading}
            >
              Filter
            </Button>
          </div>
        </div>
      </div>
    </div>

    {/* Filter Component - Mobile Responsive */}
    {showFilters && filterMeta && (
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4">
        <div className="container mx-auto">
          <VehicleFilterComponent 
            filters={pendingFilters} 
            setFilters={setPendingFilters}
            onClear={handleClearFilters}
            brandOptions={filterMeta.brands.map((b: string) => ({ value: b, label: b }))}
            modelOptions={filterMeta.models.map((m: string) => ({ value: m, label: m }))}
            fuelTypeOptions={filterMeta.fuelTypes.map((f: string) => ({ value: f, label: f }))}
            transmissionOptions={filterMeta.transmissions.map((t: string) => ({ value: t, label: t }))}
          />
          {/* Apply Filters Button */}
          <div className="flex justify-end gap-3 py-4">
            <Button 
              variant="outline" 
              onClick={handleClearFilters}
              disabled={isClearingFilters || isFilterLoading}
            >
              {isClearingFilters ? (
                <>
                  <LoadingSpinner size={4} />
                  <span className="ml-2">Clearing...</span>
                </>
              ) : (
                'Clear Filters'
              )}
            </Button>
            <Button 
              onClick={handleApplyFilters}
              disabled={isFilterLoading || isClearingFilters}
            >
              {isFilterLoading ? (
                <>
                  <LoadingSpinner size={4} />
                  <span className="ml-2">Applying...</span>
                </>
              ) : (
                'Apply Filters'
              )}
            </Button>
          </div>
        </div>
      </div>
    )}

    {/* Car Grid */}
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
      {isInitialLoad ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <CarCardSkeleton key={index} />
          ))}
        </div>
      ) : isFilterLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner size={8} />
            <p className="text-gray-600 text-sm">Loading filtered results...</p>
          </div>
        </div>
      ) : (
        <CarList 
          cars={filteredCars} 
          emptyState={
            <div className="text-center py-8 sm:py-12">
              <div className="text-sm sm:text-base mb-4">No cars found for your filters.</div>
              <Button 
                className="text-sm sm:text-base px-4 sm:px-6" 
                onClick={() => setShowRequirementDialog(true)}
              >
                Request a Car
              </Button>
            </div>
          }
        />
      )}
    </div>

    {/* Requirement Dialog - Mobile Responsive */}
    <Dialog open={showRequirementDialog} onOpenChange={setShowRequirementDialog}>
      <DialogContent className="max-w-[95vw] sm:max-w-md mx-2">
        <DialogTitle className="text-lg sm:text-xl">Request a Car</DialogTitle>
        {requirementSubmitted ? (
          <div className="text-center py-6 sm:py-8 text-sm sm:text-base">
            Thank you! We have registered your requirement and will reach out when we find a match.
          </div>
        ) : (
          <form
            className="space-y-3 sm:space-y-4"
            onSubmit={async e => {
              e.preventDefault();
              setIsSubmittingRequirement(true);
              const payload = {
                filters: pendingFilters,
                contact: requirementContact
              };
              try {
                await fetch(`${import.meta.env.BASE_URL}/api/requirements`, {
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
              } finally {
                setIsSubmittingRequirement(false);
              }
            }}
          >
            <Input
              placeholder="Name"
              value={requirementContact.name}
              onChange={e => setRequirementContact({ ...requirementContact, name: e.target.value })}
              required
              className="text-sm sm:text-base"
              disabled={isSubmittingRequirement}
            />
            <Input
              placeholder="Email"
              value={requirementContact.email}
              onChange={e => setRequirementContact({ ...requirementContact, email: e.target.value })}
              required
              className="text-sm sm:text-base"
              disabled={isSubmittingRequirement}
            />
            <Input
              placeholder="Phone"
              value={requirementContact.phone}
              onChange={e => setRequirementContact({ ...requirementContact, phone: e.target.value })}
              required
              className="text-sm sm:text-base"
              disabled={isSubmittingRequirement}
            />
            <Button 
              type="submit" 
              className="w-full text-sm sm:text-base"
              disabled={isSubmittingRequirement}
            >
              {isSubmittingRequirement ? (
                <>
                  <LoadingSpinner size={4} />
                  <span className="ml-2">Submitting...</span>
                </>
              ) : (
                'Submit Requirement'
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  </div>
);
};

export default Index;