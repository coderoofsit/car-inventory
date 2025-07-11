import React, { useState } from 'react';
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
const isEmbedded = window.self !== window.top;


interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  location: string;
  fuel: string;
  transmission: string;
  image: string;
  condition: string;
  description: string;
  vin: string;
  availability: 'Available' | 'Sold' | 'Reserved';
}

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

const Index = () => {
const [cars, setCars] = useState<Car[]>([]);
const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMake, setSelectedMake] = useState('all');
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
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
  
  // Filter states
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
    fuelType: 'all',
    transmission: 'all',
    condition: 'all',
    minMileage: '',
    maxMileage: ''
  });
  
  const [newCar, setNewCar] = useState({
    make: '', model: '', year: '', price: '', mileage: '', location: '',
    fuel: '', transmission: '', condition: '', description: '', image: '', vin: ''
  });
  React.useEffect(() => {
  axios.get('http://localhost:5000/api/cars')
    .then(res => {
      setCars(res.data);
      setFilteredCars(res.data);
    })
    .catch(err => {
      console.error('Failed to fetch cars:', err);
    });
}, []);



  // Filter cars based on all criteria
  React.useEffect(() => {
    const filtered = cars.filter(car => {
      const matchesSearch = car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           car.model.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMake = selectedMake === 'all' || car.make.toLowerCase() === selectedMake.toLowerCase();
      const matchesMinPrice = !filters.minPrice || car.price >= parseInt(filters.minPrice);
      const matchesMaxPrice = !filters.maxPrice || car.price <= parseInt(filters.maxPrice);
      const matchesMinYear = !filters.minYear || car.year >= parseInt(filters.minYear);
      const matchesMaxYear = !filters.maxYear || car.year <= parseInt(filters.maxYear);
      const matchesFuel = filters.fuelType === 'all' || car.fuel.toLowerCase() === filters.fuelType.toLowerCase();
      const matchesTransmission = filters.transmission === 'all' || car.transmission.toLowerCase() === filters.transmission.toLowerCase();
      const matchesCondition = filters.condition === 'all' || car.condition.toLowerCase() === filters.condition.toLowerCase();
      const matchesMinMileage = !filters.minMileage || car.mileage >= parseInt(filters.minMileage);
      const matchesMaxMileage = !filters.maxMileage || car.mileage <= parseInt(filters.maxMileage);
      
      return matchesSearch && matchesMake && matchesMinPrice && matchesMaxPrice && 
             matchesMinYear && matchesMaxYear && matchesFuel && matchesTransmission && 
             matchesCondition && matchesMinMileage && matchesMaxMileage;
    });
    setFilteredCars(filtered);
  }, [searchTerm, selectedMake, cars, filters]);

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
    setFilters({
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: '',
      fuelType: 'all',
      transmission: 'all',
      condition: 'all',
      minMileage: '',
      maxMileage: ''
    });
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const uniqueMakes = Array.from(new Set(cars.map(car => car.make)));

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
      onSave={(vehicleData) => {
        // Map vehicleData to Car type and add to cars
        const newVehicle = {
          id: Date.now(),
          make: vehicleData.make,
          model: vehicleData.model,
          year: parseInt(vehicleData.year) || 0,
          price: parseInt(vehicleData.sellingPrice) || 0,
          mileage: parseInt(vehicleData.mileage) || 0,
          location: "Location TBD",
          fuel: vehicleData.fuelType || "Gasoline",
          transmission: vehicleData.transmissionType || "Automatic",
          image: vehicleData.images && vehicleData.images[0] ? vehicleData.images[0] : "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          condition: vehicleData.condition || "Good",
          description: vehicleData.description || "No description provided.",
          vin: vehicleData.vin || `VIN${Date.now()}`,
          availability:
            vehicleData.status === "sold"
              ? "Sold"
              : vehicleData.status === "reserved"
              ? "Reserved"
              : "Available" as "Available" | "Sold" | "Reserved",
        };
        setCars(prev => [...prev, newVehicle]);
        setFilteredCars(prev => [...prev, newVehicle]);
        setIsAddCarOpen(false);
        toast({
          title: "Vehicle Added Successfully!",
          description: `${newVehicle.make} ${newVehicle.model} added to your database.`
        });
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
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search for a car"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 sm:w-96">
                  <SheetHeader>
                    <SheetTitle>Filter Cars</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    {/* Price Range */}
                    <div>
                      <Label className="text-base font-semibold">Price Range</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <Label htmlFor="minPrice" className="text-sm">Min Price</Label>
                          <Input
                            id="minPrice"
                            type="number"
                            placeholder="$0"
                            value={filters.minPrice}
                            onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="maxPrice" className="text-sm">Max Price</Label>
                          <Input
                            id="maxPrice"
                            type="number"
                            placeholder="$100,000"
                            value={filters.maxPrice}
                            onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Year Range */}
                    <div>
                      <Label className="text-base font-semibold">Year Range</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <Label htmlFor="minYear" className="text-sm">Min Year</Label>
                          <Input
                            id="minYear"
                            type="number"
                            placeholder="2000"
                            value={filters.minYear}
                            onChange={(e) => setFilters({...filters, minYear: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="maxYear" className="text-sm">Max Year</Label>
                          <Input
                            id="maxYear"
                            type="number"
                            placeholder="2024"
                            value={filters.maxYear}
                            onChange={(e) => setFilters({...filters, maxYear: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mileage Range */}
                    <div>
                      <Label className="text-base font-semibold">Mileage Range</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <Label htmlFor="minMileage" className="text-sm">Min Mileage</Label>
                          <Input
                            id="minMileage"
                            type="number"
                            placeholder="0"
                            value={filters.minMileage}
                            onChange={(e) => setFilters({...filters, minMileage: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="maxMileage" className="text-sm">Max Mileage</Label>
                          <Input
                            id="maxMileage"
                            type="number"
                            placeholder="200,000"
                            value={filters.maxMileage}
                            onChange={(e) => setFilters({...filters, maxMileage: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Fuel Type */}
                    <div>
                      <Label className="text-base font-semibold">Fuel Type</Label>
                      <Select value={filters.fuelType} onValueChange={(value) => setFilters({...filters, fuelType: value})}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="All Fuel Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Fuel Types</SelectItem>
                          <SelectItem value="gasoline">Gasoline</SelectItem>
                          <SelectItem value="diesel">Diesel</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                          <SelectItem value="electric">Electric</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Transmission */}
                    <div>
                      <Label className="text-base font-semibold">Transmission</Label>
                      <Select value={filters.transmission} onValueChange={(value) => setFilters({...filters, transmission: value})}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="All Transmissions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Transmissions</SelectItem>
                          <SelectItem value="automatic">Automatic</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="cvt">CVT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Condition */}
                    <div>
                      <Label className="text-base font-semibold">Condition</Label>
                      <Select value={filters.condition} onValueChange={(value) => setFilters({...filters, condition: value})}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="All Conditions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Conditions</SelectItem>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="very good">Very Good</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={resetFilters} variant="outline" className="flex-1">
                        Reset Filters
                      </Button>
                      <Button onClick={() => setIsFiltersOpen(false)} className="flex-1">
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              <Select value={selectedMake} onValueChange={setSelectedMake}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="No Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Makes</SelectItem>
                  {uniqueMakes.map(make => (
                    <SelectItem key={make} value={make}>{make}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Car Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCars.map((car) => (
            <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white">
              <div className="relative">
                <img 
                  src={car.image} 
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-48 object-cover"
                />
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Badge 
                  className={`absolute top-2 left-2 ${
                    car.availability === 'Available' ? 'bg-green-500' : 
                    car.availability === 'Sold' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}
                >
                  {car.availability}
                </Badge>
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {car.make} {car.model}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {car.vin}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {car.year}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-xl font-bold text-gray-900 mb-2">
                  {formatPrice(car.price)}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  {[<div key="mileage">{car.mileage.toLocaleString()} miles</div>, <div key="fuel">{car.fuel} • {car.transmission}</div>]}
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setSelectedCar(car)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredCars.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No vehicles found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Car Detail Modal */}
      {selectedCar && (
        <Dialog open={!!selectedCar} onOpenChange={() => setSelectedCar(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {selectedCar.make} {selectedCar.model} ({selectedCar.year})
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div>
                <img 
                  src={selectedCar.image} 
                  alt={`${selectedCar.make} ${selectedCar.model}`}
                  className="w-full h-80 object-cover rounded-lg"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-blue-600">{formatPrice(selectedCar.price)}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge>{selectedCar.condition}</Badge>
                    <Badge variant="outline">{selectedCar.fuel}</Badge>
                    <Badge className="bg-green-500">{selectedCar.availability}</Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Year:</strong> {selectedCar.year}</div>
                  <div><strong>Mileage:</strong> {selectedCar.mileage.toLocaleString()}</div>
                  <div><strong>Fuel:</strong> {selectedCar.fuel}</div>
                  <div><strong>Transmission:</strong> {selectedCar.transmission}</div>
                  <div className="col-span-2"><strong>VIN:</strong> {selectedCar.vin}</div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-gray-700">{selectedCar.description}</p>
                </div>
                
                {!showContactForm && !showTestDriveForm && (
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button 
                      className="flex-1 flex items-center justify-center gap-2" 
                      size="lg"
                      onClick={() => setShowContactForm(true)}
                    >
                      <Phone className="h-4 w-4" />
                      Contact Seller
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 flex items-center justify-center gap-2" 
                      size="lg"
                      onClick={() => setShowTestDriveForm(true)}
                    >
                      <Calendar className="h-4 w-4" />
                      Schedule Test Drive
                    </Button>
                  </div>
                )}
    


                {/* Contact Form */}
                {showContactForm && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Contact Seller</h4>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowContactForm(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contact-name">Name *</Label>
                        <Input
                          id="contact-name"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact-email">Email *</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                          placeholder="your@email.com"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="contact-phone">Phone *</Label>
                        <Input
                          id="contact-phone"
                          type="tel"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                          placeholder="Your phone number"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="contact-message">Message</Label>
                        <Textarea
                          id="contact-message"
                          value={contactForm.message}
                          onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                          placeholder="Additional questions or comments..."
                          className="h-20"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleContactSubmit} className="flex-1">
                        Send Message
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowContactForm(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Test Drive Form */}
                {showTestDriveForm && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Schedule Test Drive</h4>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowTestDriveForm(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="testdrive-name">Name *</Label>
                        <Input
                          id="testdrive-name"
                          value={testDriveForm.name}
                          onChange={(e) => setTestDriveForm({...testDriveForm, name: e.target.value})}
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="testdrive-email">Email *</Label>
                        <Input
                          id="testdrive-email"
                          type="email"
                          value={testDriveForm.email}
                          onChange={(e) => setTestDriveForm({...testDriveForm, email: e.target.value})}
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="testdrive-phone">Phone *</Label>
                        <Input
                          id="testdrive-phone"
                          type="tel"
                          value={testDriveForm.phone}
                          onChange={(e) => setTestDriveForm({...testDriveForm, phone: e.target.value})}
                          placeholder="Your phone number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="testdrive-date">Preferred Date *</Label>
                        <Input
                          id="testdrive-date"
                          type="date"
                          value={testDriveForm.preferredDate}
                          onChange={(e) => setTestDriveForm({...testDriveForm, preferredDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="testdrive-time">Preferred Time</Label>
                        <Select 
                          value={testDriveForm.preferredTime} 
                          onValueChange={(value) => setTestDriveForm({...testDriveForm, preferredTime: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'].map(time => (
                              <SelectItem key={time} value={time}>{
                                time === '12:00' ? '12:00 PM' :
                                time === '13:00' ? '1:00 PM' :
                                time === '14:00' ? '2:00 PM' :
                                time === '15:00' ? '3:00 PM' :
                                time === '16:00' ? '4:00 PM' :
                                time === '17:00' ? '5:00 PM' :
                                time + (parseInt(time) < 12 ? ' AM' : ' PM')
                              }</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="testdrive-message">Additional Notes</Label>
                        <Textarea
                          id="testdrive-message"
                          value={testDriveForm.message}
                          onChange={(e) => setTestDriveForm({...testDriveForm, message: e.target.value})}
                          placeholder="Any specific requirements or questions..."
                          className="h-20"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleTestDriveSubmit} className="flex-1">
                        Schedule Test Drive
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowTestDriveForm(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Index;
