import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { ArrowLeft, Heart, Home, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { vehicleInspectionSchema } from './vehicleInspectionSchema';
import { fetchCarById, fetchInspectionReportByCarId, updateVehicleToBackend } from '../lib/vehicleAPI';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import VehicleAddDialog from './VehicleAddDialog';
import ContactUsDialog from "@/components/ContactUsDialog";
import TestDriveDialog from "@/components/TestDriveDialog";
import { handleContactSubmit, handleTestDriveSubmit } from "@/lib/formHandlers";

interface CarDetailContentProps {
  carId: string;
  onEdit?: () => void;
  onBack?: () => void;
  onEditSuccess?: () => void;
  onContactSubmit?: (formData: any, car: any) => Promise<boolean | void>;
  onTestDriveSubmit?: (formData: any, car: any) => Promise<boolean | void>;
}

const isVideo = (url: string) => /\.(mp4|mov|avi|webm)$/i.test(url) || url.includes('video');
const toTitleCase = (str: string) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

const CarDetailContent: React.FC<CarDetailContentProps> = ({ carId, onBack, onEditSuccess }) => {
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
    customField: {
      carExchange: false,
      make: '',
      model: '',
      year: '',
      carid:''
    }
  });
  const [testDriveForm, setTestDriveForm] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    message: '',
    customField: {
      carExchange: false,
      make: '',
      model: '',
      year: '',
      carid:''
    }
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
        <svg className="animate-spin h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <span className="text-sm sm:text-lg text-gray-700 ml-4">Loading vehicle details...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full py-8 sm:py-16 px-4">
        <span className="text-base sm:text-lg text-gray-500 text-center">{error}</span>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded text-sm sm:text-base" onClick={onBack}>
          Back to Home
        </button>
      </div>
    );
  }
  
  if (!car) return null;

  const formatPrice = (price: string | number) => `₹${Number(price).toLocaleString()}`;
  const media: string[] = Array.isArray(car.media) && car.media.length > 0 ? car.media : [];
  
  const overviewFields = [
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

  // Add a handler to update car after edit
  const handleEditSave = async (vehicleData: any) => {
    setShowEditDialog(false);
    setLoading(true);
    try {
      await updateVehicleToBackend(carId, vehicleData);
      const updatedCar = await fetchCarById(carId);
      setCar(updatedCar);
      if (typeof onEditSuccess === 'function') onEditSuccess();
    } catch {
      // fallback: do nothing
    } finally {
      setLoading(false);
    }
  };

  const urlParams = new URLSearchParams(window.location.search);
  const isEmbedded = urlParams.get("source") === "notOnGHL";
  
  return (
          <div className="w-full min-h-screen lg:h-full flex flex-col lg:flex-row bg-white">
              {/* Media Section */}
              <div className="w-full lg:w-1/2 bg-gray-50 flex flex-col items-center justify-center p-2 sm:p-4 min-h-[40vh] lg:h-full">
                {/* Main media preview */}
                <div className="w-full flex items-center justify-center mb-2 relative">
                  {media.length > 0 && (
                    <>
                      <div className="w-full aspect-[4/3] max-h-[50vh] lg:max-h-[60vh] bg-black rounded-lg overflow-hidden flex items-center justify-center relative">
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
                        
                        {/* Navigation arrows for mobile */}
                        {media.length > 1 && (
                          <>
                            <button
                              onClick={handlePrevMedia}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                            >
                              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            <button
                              onClick={handleNextMedia}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                            >
                              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Thumbnail strip */}
                {media.length > 1 && (
                  <div className="h-16 sm:h-20 w-full flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
                    {media.map((url, idx) => (
                      <div
                        key={url + idx}
                        className={`w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded border-2 ${
                          idx === mediaIndex ? 'border-blue-500' : 'border-gray-200'
                        } overflow-hidden cursor-pointer hover:border-blue-400 transition-colors`}
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

              {/* Details Section */}
              <div className="w-full lg:w-1/2 flex flex-col lg:min-h-0 lg:h-full">
                {/* Header */}
                <div className="p-3 sm:p-6 border-b flex-shrink-0">
                  <div className="flex items-center justify-between mb-4">
                    <Button variant="ghost" className="p-0 h-auto text-sm sm:text-lg px-3 sm:px-6 py-2 sm:py-3" onClick={onBack}>
                      <ArrowLeft className="mr-2 h-4 w-4 sm:h-7 sm:w-7 text-black" /> 
                      <span className="hidden sm:inline">Back</span>
                    </Button>
                    <div className="flex items-center gap-2">
                      {!isEmbedded && (
                        <Button variant="ghost" className="p-2 text-sm sm:text-lg px-3 sm:px-6 py-2 sm:py-3" onClick={() => setShowEditDialog(true)}>
                          <Edit className="h-4 w-4 sm:h-7 sm:w-7" />
                          <span className="hidden sm:inline ml-2">Edit</span>
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className='flex flex-row justify-between items-start'>
                    <div className="flex-1 pr-2">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 leading-tight">
                        {car.manufactureYear} {toTitleCase(car.brand || '')} {toTitleCase(car.model || '')}
                      </h1>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm sm:text-lg text-gray-700 font-normal mb-2">
                        <span>{car.kmRun ? `${(car.kmRun/1000).toFixed(car.kmRun%1000===0?0:1)}K km` : 'Not Specified'}</span>
                        <span className="hidden sm:inline">·</span>
                        <span>{car.fuelTypeDetails ? toTitleCase(car.fuelTypeDetails) : 'Not Specified'}</span>
                        <span className="hidden sm:inline">·</span>
                        <span>{car.transmissionTypeDetails ? toTitleCase(car.transmissionTypeDetails) : 'Not Specified'}</span>
                      </div>
                    </div>
                    <Button variant="ghost" className="p-1 sm:p-2 flex-shrink-0">
                      <Heart className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-black" />
                    </Button>
                  </div>
                  
                  {car.homeTestDriveDetails && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-4">
                      <Home className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
                      <span>Home Test Drive: {["yes", "y"].includes((car.homeTestDriveDetails || "").toString().trim().toLowerCase()) ? "Available" : "Unavailable"}</span>
                    </div>
                  )}
                  
                  {typeof car.shortlisted === 'number' && (
                    <div className="text-right">
                      <span className="text-xs sm:text-sm text-gray-500">{car.shortlisted} people</span>
                      <br />
                      <span className="text-xs sm:text-sm text-gray-500">shortlisted</span>
                    </div>
                  )}
                </div>

                {/* Tabs - This takes remaining space and is properly scrollable on mobile */}
                <div className="flex-1 flex flex-col lg:min-h-0 lg:overflow-hidden">
                  <Tabs value={tab} onValueChange={setTab} className="w-full h-full flex flex-col">
                    <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0 flex-shrink-0 overflow-x-auto">
                      <TabsTrigger 
                        value="overview" 
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-2 sm:px-4 py-2 font-medium text-xs sm:text-sm whitespace-nowrap"
                      >
                        Overview
                      </TabsTrigger>
                      <TabsTrigger 
                        value="description" 
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-2 sm:px-4 py-2 font-medium text-xs sm:text-sm whitespace-nowrap"
                      >
                        Description
                      </TabsTrigger>
                      <TabsTrigger 
                        value="features" 
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-2 sm:px-4 py-2 font-medium text-xs sm:text-sm whitespace-nowrap"
                      >
                        Features
                      </TabsTrigger>
                      <TabsTrigger 
                        value="inspection" 
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-2 sm:px-4 py-2 font-medium text-xs sm:text-sm whitespace-nowrap"
                      >
                        Inspection
                      </TabsTrigger>
                    </TabsList>

                    {/* Tab content area - SCROLLABLE on mobile, constrained on desktop */}
                    <div className="flex-1 lg:min-h-0 lg:overflow-y-auto">
                      <TabsContent 
                        value="overview" 
                        className="p-3 sm:p-6 flex flex-col data-[state=inactive]:hidden lg:h-full"
                      >
                        {/* Scrollable overview grid */}
                        <div className="flex-1 lg:min-h-0 lg:overflow-y-auto mb-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                            {overviewFields.map((field) => (
                              <div key={field.label} className="flex flex-col p-3 bg-gray-50 rounded-lg">
                                <span className="text-xs text-gray-400 font-medium uppercase mb-1">{field.label}</span>
                                <span className="text-sm text-gray-900 font-semibold break-words">{field.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Fixed buttons at bottom */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-shrink-0 pt-4 border-t">
                          <Button
                            variant="outline"
                            className="flex-1 transition-colors duration-150 border-blue-600 hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100 active:text-blue-900 focus:ring-2 focus:ring-blue-300 text-sm sm:text-base py-2 sm:py-3"
                            onClick={() => {
                              setContactForm(form => ({
                                ...form,
                                customField: {
                                  ...form.customField,
                                  make: car.brand || '',
                                  model: car.model || '',
                                  year: car.manufactureYear?.toString() || '',
                                  carid: carId
                                }
                              }));
                              setShowContactForm(true);
                            }}
                          >
                            Contact Us
                          </Button>
                          <Button
                            className="flex-1 bg-blue-600 text-white transition-colors duration-150 hover:bg-blue-700 hover:text-white active:bg-blue-800 active:text-white focus:ring-2 focus:ring-blue-300 text-sm sm:text-base py-2 sm:py-3"
                            onClick={() => {
                              setTestDriveForm(form => ({
                                ...form,
                                customField: {
                                  ...form.customField,
                                  make: car.brand || '',
                                  model: car.model || '',
                                  year: car.manufactureYear?.toString() || '',
                                  carid: carId
                                }
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
                        className="p-3 sm:p-6 data-[state=inactive]:hidden lg:h-full lg:overflow-y-auto"
                      >
                        <div className="lg:h-full">
                          <h4 className="font-semibold mb-3 text-sm sm:text-base">Vehicle Description</h4>
                          <div className="text-gray-700 text-sm sm:text-base leading-relaxed">
                            {car.description || 'No description provided.'}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent 
                        value="features" 
                        className="p-3 sm:p-6 data-[state=inactive]:hidden lg:h-full lg:overflow-y-auto"
                      >
                        <div className="space-y-4 sm:space-y-6">
                          {['interior', 'convenience', 'safety', 'exterior', 'performance', 'documentsAvailable', 'additional'].map((category) => (
                            Array.isArray(car[category]) && car[category].length > 0 ? (
                              <div key={category} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                <div className="font-semibold mb-3 capitalize text-sm sm:text-base text-gray-800">
                                  {category.replace(/([A-Z])/g, ' $1')}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {car[category].map((feature: string, idx: number) => (
                                    <div key={feature + idx} className="flex items-center text-gray-700 text-xs sm:text-sm">
                                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-2 flex-shrink-0"></div>
                                      <span>{feature}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null
                          ))}
                          {['interior', 'convenience', 'safety', 'exterior', 'performance', 'documentsAvailable', 'additional'].every((cat) => !Array.isArray(car[cat]) || car[cat].length === 0) && (
                            <div className="text-center py-8 text-gray-500">
                              <p className="text-sm sm:text-base">No features listed for this vehicle.</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent 
                        value="inspection" 
                        className="p-3 sm:p-6 data-[state=inactive]:hidden lg:h-full lg:overflow-y-auto"
                      >
                        {inspectionLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <svg className="animate-spin h-6 w-6 text-blue-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                            </svg>
                            <span className="text-gray-500 text-sm sm:text-base">Loading inspection report...</span>
                          </div>
                        ) : !inspectionReport ? (
                          <div className="text-center text-gray-500 py-8">
                            <p className="text-sm sm:text-base">No inspection report available for this vehicle.</p>
                          </div>
                        ) : (
                          <div className="w-full">
                            <Accordion type="multiple" className="w-full space-y-3">
                              {Object.entries(vehicleInspectionSchema).map(([section, fields]) => (
                                <AccordionItem value={section} key={section} className="border rounded-lg">
                                  <AccordionTrigger className="text-sm sm:text-base font-semibold text-gray-800 bg-blue-50 px-3 sm:px-4 py-2 sm:py-3 rounded-t-lg hover:bg-blue-100 transition-colors">
                                    {section.charAt(0).toUpperCase() + section.slice(1).replace(/_/g, ' ')}
                                  </AccordionTrigger>
                                  <AccordionContent className="bg-white px-3 sm:px-4 pb-3 sm:pb-4">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mt-3">
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
                                          <div key={field} className="bg-gray-50 rounded-lg p-3">
                                            <label className="text-xs sm:text-sm font-medium capitalize mb-2 block text-gray-600">
                                              {field.replace(/_/g, ' ')}
                                            </label>
                                            <div className="text-sm sm:text-base text-gray-800 font-medium">
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

              {/* Rest of your dialogs remain the same */}
              {/* Contact Us Dialog */}
              <ContactUsDialog
                open={showContactForm}
                onOpenChange={setShowContactForm}
                onSubmit={async (form) => {
                  //console.log('ContactUsDialog submit form:', form);
                  //console.log('ContactUsDialog car:', car);
                  const success = await handleContactSubmit(form, car);
                  if (success) {
                    setContactForm({ name: '', email: '', phone: '', message: '', customField: { carExchange: false, make: '', model: '', year: '',carid:carId } });
                    setShowContactForm(false);
                  }
                }}
                formState={contactForm}
                setFormState={setContactForm}
              />

              {/* Book a Test Drive Dialog */}
              <TestDriveDialog
                open={showTestDriveForm}
                onOpenChange={setShowTestDriveForm}
                onSubmit={async (form) => {
                  //console.log('TestDriveDialog submit form:', form);
                  //console.log('TestDriveDialog car:', car);
                  const success = await handleTestDriveSubmit(form, car);
                  if (success) {
                    setTestDriveForm({ name: '', email: '', phone: '', preferredDate: '', preferredTime: '', message: '', customField: { carExchange: false, make: '', model: '', year: '',carid:"" } });
                    setShowTestDriveForm(false);
                  }
                }}
                formState={testDriveForm}
                setFormState={setTestDriveForm}
              />

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