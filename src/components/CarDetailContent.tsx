import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { ArrowLeft, Heart, Home, Edit } from 'lucide-react';
import { vehicleInspectionSchema } from './vehicleInspectionSchema';
import { fetchCarById, fetchInspectionReportByCarId } from '../lib/vehicleAPI';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import VehicleAddDialog from './VehicleAddDialog';

interface CarDetailContentProps {
  carId: string;
  onEdit?: () => void;
  onBack?: () => void;
}

const isVideo = (url: string) => /\.(mp4|mov|avi|webm)$/i.test(url) || url.includes('video');
const toTitleCase = (str: string) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

const CarDetailContent: React.FC<CarDetailContentProps> = ({ carId, onBack }) => {
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState('overview');
  const [mediaIndex, setMediaIndex] = useState(0);
  const [inspectionReport, setInspectionReport] = useState<any>(null);
  const [inspectionLoading, setInspectionLoading] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showTestDriveForm, setShowTestDriveForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    make: '',
    model: '',
    year: '',
    price: ''
  });
  const [testDriveForm, setTestDriveForm] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    message: ''
  });
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    if (carId) {
      setLoading(true);
      setError(null);
      fetchCarById(carId)
        .then((car) => {
          setCar(car);
        })
        .catch(() => {
          setCar(null);
          setError('Car not found.');
        })
        .finally(() => setLoading(false));
    }
  }, [carId]);

  useEffect(() => {
    if (car && car._id) {
      setInspectionLoading(true);
      fetchInspectionReportByCarId(car._id)
        .then(setInspectionReport)
        .catch(() => setInspectionReport(null))
        .finally(() => setInspectionLoading(false));
    }
  }, [car]);

  useEffect(() => {
    setTab('overview');
    setMediaIndex(0);
    setInspectionReport(null);
    setInspectionLoading(false);
  }, [carId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] w-full h-full">
        <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <span className="text-lg text-gray-700 ml-4">Loading vehicle details...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full py-16">
        <span className="text-lg text-gray-500">{error}</span>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={onBack}>Back to Home</button>
      </div>
    );
  }
  if (!car) return null;
  const formatPrice = (price: string | number) => `₹${Number(price).toLocaleString()}`;
  const media: string[] = Array.isArray(car.media) && car.media.length > 0 ? car.media : [];
  const overviewFields = [
    { label: 'DOORS', value: car.doors || 'Not Specified' },
    { label: 'MILEAGE', value: car.kmRun ? `${car.kmRun} KM` : 'Not Specified' },
    { label: 'EXTERIOR COLOR', value: car.exteriorColorDetails || 'Not Specified' },
    { label: 'INTERIOR COLOR', value: car.interiorColorDetails || 'Not Specified' },
    { label: 'BODY STYLE', value: car.bodyStyleDetails || 'Not Specified' },
    { label: 'FUEL TYPE', value: car.fuelTypeDetails || 'Not Specified' },
    { label: 'TRANSMISSION', value: car.transmissionTypeDetails || 'Not Specified' },
    { label: 'YEAR OF MANUFACTURE', value: car.manufactureYear || 'Not Specified' },
    { label: 'HOME TEST DRIVE', value: car.homeTestDriveDetails || 'Not Specified' },
    { label: 'VIN', value: car.vin || 'Not Specified' },
    { label: 'REGISTRATION MONTH', value: car.registrationMonth || 'Not Specified' },
    { label: 'REGISTRATION YEAR', value: car.registrationYear || 'Not Specified' },
    { label: 'INSURANCE VALIDITY', value: (car.insuranceValidityMonth && car.insuranceValidityYear) ? `${car.insuranceValidityMonth}/${car.insuranceValidityYear}` : 'Not Specified' },
    { label: 'ENGINE CAPACITY', value: car.engineCapacity || 'Not Specified' },
    { label: 'TRIM', value: car.trim || 'Not Specified' },
    { label: 'STATUS', value: car.status || 'Not Specified' },
    { label: 'OWNER', value: car.ownerDetails || 'Not Specified' },
    { label: 'CONDITION', value: car.condition || 'Not Specified' },
    { label: 'SELLING PRICE', value: car.sellingPrice ? `₹${Number(car.sellingPrice).toLocaleString()}` : 'Not Specified' },
  ];
  const handlePrevMedia = () => setMediaIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  const handleNextMedia = () => setMediaIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  const handleSelectMedia = (idx: number) => setMediaIndex(idx);

  // Contact Us and Test Drive submit handlers (dummy, replace with real logic as needed)
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement contact form submission logic
    setShowContactForm(false);
  };
  const handleTestDriveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement test drive form submission logic
    setShowTestDriveForm(false);
  };

  // Add a handler to update car after edit
  const handleEditSave = async (vehicleData: any) => {
    setShowEditDialog(false);
    // Optionally, update the car details in-place after editing
    setLoading(true);
    try {
      const updatedCar = await fetchCarById(carId);
      setCar(updatedCar);
    } catch {
      // fallback: do nothing
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-white">
      {/* Left: Media Section */}
      <div className="w-full md:w-1/2 bg-gray-50 flex flex-col items-center justify-center p-4 h-full">
        {/* Main media preview */}
        <div className="w-full flex items-center justify-center mb-2">
          {media.length > 0 && (
            <div className="w-full aspect-[4/3] max-h-[60vh] bg-black rounded-lg overflow-hidden flex items-center justify-center">
              {isVideo(media[mediaIndex]) ? (
                <video
                  src={media[mediaIndex]}
                  controls
                  className="w-full h-full object-contain bg-black rounded-lg"
                />
              ) : (
                <img
                  src={media[mediaIndex]}
                  alt={`Car media ${mediaIndex + 1}`}
                  className="w-full h-full object-contain bg-black rounded-lg"
                />
              )}
            </div>
          )}
        </div>
        {/* Thumbnail strip */}
        {media.length > 1 && (
          <div className="h-20 w-full flex items-center gap-2 overflow-x-auto">
            {media.map((url, idx) => (
              <div
                key={url + idx}
                className={`w-16 h-16 flex-shrink-0 rounded border-2 ${idx === mediaIndex ? 'border-blue-500' : 'border-gray-200'} overflow-hidden cursor-pointer`}
                onClick={() => handleSelectMedia(idx)}
              >
                {isVideo(url) ? (
                  <video src={url} className="w-full h-full object-cover" />
                ) : (
                  <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Right: Details Section */}
      <div className="w-full md:w-1/2 flex flex-col min-h-0 h-full p-2">
        {/* Header */}
        <div className="p-6 border-b flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" className="p-0 h-auto" onClick={onBack}>
              <ArrowLeft className="mr-2 h-5 w-5 text-black" /> Back
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="p-2" onClick={() => setShowEditDialog(true)}>
                <Edit />
                Edit
              </Button>
            </div>
          </div>
          <div className='flex flex-row justify-between items-start'>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {car.manufactureYear} {toTitleCase(car.brand || '')} {toTitleCase(car.model || '')}
            </h1>
            <Button variant="ghost" className="p-2">
              <Heart className="h-10 w-10 text-black" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-lg text-gray-700 font-normal mb-2">
            <span>{car.kmRun ? `${(car.kmRun/1000).toFixed(car.kmRun%1000===0?0:1)}K km` : 'Not Specified'}</span>
            <span>·</span>
            <span>{car.fuelTypeDetails ? toTitleCase(car.fuelTypeDetails) : 'Not Specified'}</span>
            <span>·</span>
            <span>{car.transmissionTypeDetails ? toTitleCase(car.transmissionTypeDetails) : 'Not Specified'}</span>
          </div>
          {car.homeTestDriveDetails && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <Home className="h-5 w-5 text-black" />
              <span>Home Test Drive: {["yes", "y"].includes((car.homeTestDriveDetails || "").toString().trim().toLowerCase()) ? "Available" : "Unavailable"}</span>
            </div>
          )}
          {typeof car.shortlisted === 'number' && (
            <div className="text-right">
              <span className="text-sm text-gray-500">{car.shortlisted} people</span>
              <br />
              <span className="text-sm text-gray-500">shortlisted</span>
            </div>
          )}
        </div>
        {/* Tabs - This takes remaining space and is constrained */}
        <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
          <Tabs value={tab} onValueChange={setTab} className="w-full h-full flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0 flex-shrink-0">
              <TabsTrigger 
                value="overview" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-2 py-2 font-medium"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="description" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-2 py-2 font-medium"
              >
                Description
              </TabsTrigger>
              <TabsTrigger 
                value="features" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-2 py-2 font-medium"
              >
                Features
              </TabsTrigger>
              <TabsTrigger 
                value="inspection" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-2 py-2 font-medium"
              >
                Inspection Report
              </TabsTrigger>
            </TabsList>
            {/* Tab content area always fills and scrolls */}
            <div className="flex-1 min-h-0 h-full overflow-y-auto">
              <TabsContent 
                value="overview" 
                className="p-2 flex-1 flex flex-col data-[state=inactive]:hidden min-h-0 h-full overflow-y-auto"
              >
                <div className="grid grid-cols-3 gap-6 mb-6 flex-1 overflow-y-auto">
                  {overviewFields.map((field) => (
                    <div key={field.label} className="flex flex-col">
                      <span className="text-xs text-gray-400 font-medium uppercase mb-1">{field.label}</span>
                      <span className="text-sm text-gray-900 font-semibold">{field.value}</span>
                    </div>
                  ))}
                </div>
                {/* Buttons at bottom */}
                <div className="flex flex-col sm:flex-row gap-4 justify-end mt-auto flex-shrink-0">
                  <Button
                    variant="outline"
                    className="flex-1 transition-colors duration-150 border-blue-600 hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100 active:text-blue-900 focus:ring-2 focus:ring-blue-300"
                    onClick={() => {
                      setContactForm(form => ({
                        ...form,
                        make: car.brand || '',
                        model: car.model || '',
                        year: car.manufactureYear?.toString() || '',
                        price: car.sellingPrice?.toString() || ''
                      }));
                      setShowContactForm(true);
                    }}
                  >
                    Contact Us
                  </Button>
                  <Button
                    className="flex-1 bg-blue-600 text-white transition-colors duration-150 hover:bg-blue-700 hover:text-white active:bg-blue-800 active:text-white focus:ring-2 focus:ring-blue-300"
                    onClick={() => {
                      setTestDriveForm(form => ({
                        ...form,
                        // Optionally pre-fill name/email/phone if you have user info
                        message: '',
                      }));
                      setShowTestDriveForm(true);
                    }}
                  >
                    Book a Test Drive
                  </Button>
                </div>
              </TabsContent>
              <TabsContent 
                value="description" 
                className="p-2 flex-1 overflow-y-auto data-[state=inactive]:hidden min-h-0 h-full"
              >
                <div>
                  <h4 className="font-semibold mb-2">Vehicle Description</h4>
                  <p className="text-gray-700 text-base">{car.description || 'No description provided.'}</p>
                </div>
              </TabsContent>
              <TabsContent 
                value="features" 
                className="p-2 flex-1 overflow-y-auto data-[state=inactive]:hidden min-h-0 h-full"
              >
                <div>
                  {['interior', 'convenience', 'safety', 'exterior', 'performance', 'documentsAvailable', 'additional'].map((category) => (
                    Array.isArray(car[category]) && car[category].length > 0 ? (
                      <div key={category} className="mb-4">
                        <div className="font-semibold mb-2 capitalize">{category.replace(/([A-Z])/g, ' $1')}</div>
                        <ul className="list-disc list-inside text-gray-700 text-sm">
                          {car[category].map((feature: string, idx: number) => (
                            <li key={feature + idx}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null
                  ))}
                  {['interior', 'convenience', 'safety', 'exterior', 'performance', 'documentsAvailable', 'additional'].every((cat) => !Array.isArray(car[cat]) || car[cat].length === 0) && (
                    <p className="text-gray-700 text-base">No features listed.</p>
                  )}
                </div>
              </TabsContent>
              <TabsContent 
                value="inspection" 
                className="p-6 flex-1 overflow-y-auto data-[state=inactive]:hidden min-h-0 h-full"
              >
                {inspectionLoading ? (
                  <div className="text-center text-gray-500 py-8">Loading inspection report...</div>
                ) : !inspectionReport ? (
                  <div className="text-center text-gray-500 py-8">No inspection report available for this vehicle.</div>
                ) : (
                  <div className="flex flex-col gap-6 items-center w-full">
                    <Accordion type="multiple" className="w-full max-w-2xl">
                      {Object.entries(vehicleInspectionSchema).map(([section, fields]) => (
                        <AccordionItem value={section} key={section}>
                          <AccordionTrigger className="text-base font-semibold text-gray-800 bg-blue-50 px-4 py-3 rounded-t-lg">
                            {section.charAt(0).toUpperCase() + section.slice(1).replace(/_/g, ' ')}
                          </AccordionTrigger>
                          <AccordionContent className="bg-white px-4 pb-4 rounded-b-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {Object.entries(fields).map(([field]) => {
                                const value = inspectionReport[section]?.[field];
                                if (
                                  value === '' ||
                                  value === undefined ||
                                  value === null ||
                                  value === 'NA' ||
                                  value === 'Not Applicable' ||
                                  (typeof value === 'string' && value.trim() === '') ||
                                  (typeof value === 'number' && value === 0)
                                ) {
                                  return null;
                                }
                                return (
                                  <div key={field} className="flex flex-col gap-1">
                                    <label className="text-sm font-medium capitalize mb-1">{field.replace(/_/g, ' ')}</label>
                                    <div className="bg-blue-50 rounded px-2 py-1 min-h-[2rem] text-gray-800 border border-gray-200">
                                      {value}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Contact Us Dialog */}
      <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
        <DialogContent>
          <DialogTitle>Contact Us</DialogTitle>
          <form
            onSubmit={handleContactSubmit}
            className="space-y-4"
          >
            <Input
              placeholder="Name"
              value={contactForm.name}
              onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
              required
            />
            <Input
              placeholder="Email"
              value={contactForm.email}
              onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
              required
            />
            <Input
              placeholder="Phone"
              value={contactForm.phone}
              onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
              required
            />
            <Input
              placeholder="Make"
              value={contactForm.make}
              onChange={e => setContactForm({ ...contactForm, make: e.target.value })}
            />
            <Input
              placeholder="Model"
              value={contactForm.model}
              onChange={e => setContactForm({ ...contactForm, model: e.target.value })}
            />
            <Input
              placeholder="Year"
              value={contactForm.year}
              onChange={e => setContactForm({ ...contactForm, year: e.target.value })}
            />
            <Input
              placeholder="Price"
              value={contactForm.price}
              onChange={e => setContactForm({ ...contactForm, price: e.target.value })}
            />
            <Textarea
              placeholder="Message"
              value={contactForm.message}
              onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
            />
            <Button type="submit" className="w-full">Send</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Book a Test Drive Dialog */}
      <Dialog open={showTestDriveForm} onOpenChange={setShowTestDriveForm}>
        <DialogContent>
          <DialogTitle>Book a Test Drive</DialogTitle>
          <form
            onSubmit={handleTestDriveSubmit}
            className="space-y-4"
          >
            <Input
              placeholder="Name"
              value={testDriveForm.name}
              onChange={e => setTestDriveForm({ ...testDriveForm, name: e.target.value })}
              required
            />
            <Input
              placeholder="Email"
              value={testDriveForm.email}
              onChange={e => setTestDriveForm({ ...testDriveForm, email: e.target.value })}
              required
            />
            <Input
              placeholder="Phone"
              value={testDriveForm.phone}
              onChange={e => setTestDriveForm({ ...testDriveForm, phone: e.target.value })}
              required
            />
            <Input
              placeholder="Preferred Date"
              type="date"
              value={testDriveForm.preferredDate}
              onChange={e => setTestDriveForm({ ...testDriveForm, preferredDate: e.target.value })}
              required
            />
            <Input
              placeholder="Preferred Time"
              type="time"
              value={testDriveForm.preferredTime}
              onChange={e => setTestDriveForm({ ...testDriveForm, preferredTime: e.target.value })}
            />
            <Textarea
              placeholder="Message"
              value={testDriveForm.message}
              onChange={e => setTestDriveForm({ ...testDriveForm, message: e.target.value })}
            />
            <Button type="submit" className="w-full">Book Test Drive</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <VehicleAddDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSave={handleEditSave}
        editCar={car}
        mode="edit"
      />
    </div>
  );
};

export default CarDetailContent; 