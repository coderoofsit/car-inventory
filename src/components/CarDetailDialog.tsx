import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, Heart, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface CarDetailDialogProps {
  car: any; // Use backend object directly
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  onEdit?: () => void;
}

const isVideo = (url: string) => /\.(mp4|mov|avi|webm)$/i.test(url) || url.includes('video');

// Utility function to capitalize first letter of each word
const toTitleCase = (str: string) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

const CarDetailDialog: React.FC<CarDetailDialogProps> = ({ car, open, onOpenChange, loading, onEdit = () => {} }) => {
  const [tab, setTab] = useState('overview');
  console.log('CarDetailDialog open:', open, 'car:', car);
  const [mediaIndex, setMediaIndex] = useState(0);
  const isEmbedded = typeof window !== 'undefined' && window.self !== window.top;
  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex items-center justify-center min-h-[300px]">
          <VisuallyHidden>
            <DialogTitle>Loading Vehicle Details</DialogTitle>
            <DialogDescription>Loading vehicle details, please wait.</DialogDescription>
          </VisuallyHidden>
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <span className="text-lg text-gray-700">Loading vehicle details...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  if (!car) return null;
  const formatPrice = (price: string | number) => `₹${Number(price).toLocaleString()}`;

  // Use car.media array, fallback to empty
  const media: string[] = Array.isArray(car.media) && car.media.length > 0 ? car.media : [];

  // Overview fields using backend field names directly
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
  ];

  // Handlers for media navigation
  const handlePrevMedia = () => setMediaIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  const handleNextMedia = () => setMediaIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  const handleSelectMedia = (idx: number) => setMediaIndex(idx);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl p-0 overflow-hidden h-[70vh]">
        <DialogTitle className='sr-only'>Vehicle Details</DialogTitle>
        <DialogDescription className='sr-only'>
          View detailed information about this vehicle, including specifications, features, and media.
        </DialogDescription>
        <div className="flex flex-col md:flex-row h-full">
          {/* Left: Media Section */}
          <div className="w-full md:w-3/5 bg-gray-50 flex flex-col relative">
            {/* Main media preview */}
            <div className="flex-1 relative flex items-center justify-center">
              {media.length > 0 && (
                <div className="w-full h-0 pb-[56.25%] relative bg-black rounded-lg overflow-hidden">
                  {isVideo(media[mediaIndex]) ? (
                    <video
                      src={media[mediaIndex]}
                      controls
                      className="absolute top-0 left-0 w-full h-full object-contain bg-black rounded-lg"
                    />
                  ) : (
                    <img
                      src={media[mediaIndex]}
                      alt={`Car media ${mediaIndex + 1}`}
                      className="absolute top-0 left-0 w-full h-full object-contain bg-black rounded-lg"
                    />
                  )}
                </div>
              )}
              {media.length > 1 && (
                <>
                  <button onClick={handlePrevMedia} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md">
                    <ChevronLeft className="h-6 w-6 text-black" />
                  </button>
                  <button onClick={handleNextMedia} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md">
                    <ChevronRight className="h-6 w-6 text-black" />
                  </button>
                </>
              )}
            </div>
            {/* Thumbnail strip */}
            {media.length > 1 && (
              <div className="h-24 bg-gray-100 flex items-center px-4 border-t gap-2 overflow-x-auto">
                {media.map((url, idx) => (
                  <div
                    key={url + idx}
                    className={`w-20 h-16 rounded border-2 ${idx === mediaIndex ? 'border-blue-500' : 'border-gray-200'} overflow-hidden cursor-pointer`}
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
          <div className="w-full md:w-2/5 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" className="p-0 h-auto" onClick={() => onOpenChange(false)}>
                  <ArrowLeft className="mr-2 h-5 w-5 text-black" /> Back
                </Button>
                <div className="flex items-center gap-2">
                  {!isEmbedded && (
                    <Button variant="ghost" className="p-2" onClick={onEdit}>
                      Edit
                    </Button>
                  )}
                  <Button variant="ghost" className="p-2">
                    <Heart className="h-6 w-6 text-black" />
                  </Button>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {car.manufactureYear} {toTitleCase(car.brand || '')} {toTitleCase(car.model || '')}
              </h1>
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
              {/* Example: show how many people shortlisted if available */}
              {typeof car.shortlisted === 'number' && (
                <div className="text-right">
                  <span className="text-sm text-gray-500">{car.shortlisted} people</span>
                  <br />
                  <span className="text-sm text-gray-500">shortlisted</span>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex-1 overflow-y-auto">
              <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
                  <TabsTrigger 
                    value="overview" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-6 py-4 font-medium"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="description" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-6 py-4 font-medium"
                  >
                    Description
                  </TabsTrigger>
                  <TabsTrigger 
                    value="features" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-6 py-4 font-medium"
                  >
                    Features
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="p-6">
                  <div className="grid grid-cols-3 gap-6 mb-8">
                    {overviewFields.map((field) => (
                      <div key={field.label} className="flex flex-col">
                        <span className="text-xs text-gray-400 font-medium uppercase mb-1">{field.label}</span>
                        <span className="text-sm text-gray-900 font-semibold">{field.value}</span>
                      </div>
                    ))}
                  </div>
                  {/* Vehicle Description Section */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg">📄</span>
                      <h3 className="text-lg font-semibold">Vehicle Description</h3>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-purple-600 mb-2">
                        {car.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="description" className="p-6">
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">Vehicle Description</h4>
                    <p className="text-gray-700 text-base">{car.description || 'No description provided.'}</p>
                  </div>
                </TabsContent>
                <TabsContent value="features" className="p-6">
                  <div className="mb-6">
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
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CarDetailDialog;