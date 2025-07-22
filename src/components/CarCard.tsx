import React from 'react';
import { Heart, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCarCardMediaUrl } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface CarCardProps {
  car: any; // Use backend object directly
  onClick?: () => void;
}

const statusColors: Record<string, string> = {
  Available: 'text-green-600',
  Sold: 'text-gray-400',
  Reserved: 'text-yellow-500',
  Pending: 'text-blue-500',
  sold: 'text-gray-400', // handle lowercase for backend
  available: 'text-green-600',
  reserved: 'text-yellow-500',
  pending: 'text-blue-500',
};

const CarCard: React.FC<CarCardProps> = ({ car }) => {
  const placeholder = 'https://via.placeholder.com/400x300?text=No+Image';
  const [mediaIndex, setMediaIndex] = React.useState(0);
  const mediaArr: string[] = Array.isArray(car.media) && car.media.length > 0 ? car.media : [];
  const isVideo = (url: string) => /\.(mp4|mov|avi|webm)$/i.test(url) || url.includes('video');
  const currentMedia = mediaArr[mediaIndex] || '';
  
  const handlePrev = (e: React.MouseEvent) => { 
    e.stopPropagation(); 
    setMediaIndex((prev) => (prev === 0 ? mediaArr.length - 1 : prev - 1)); 
  };
  
  const handleNext = (e: React.MouseEvent) => { 
    e.stopPropagation(); 
    setMediaIndex((prev) => (prev === mediaArr.length - 1 ? 0 : prev + 1)); 
  };
  
  const year = car.manufactureYear || car.year || '-';
  const brand = car.brand || car.make || '';
  const model = car.model || '';
  const trim = car.trim || '';
  const vin = car.vin || '';
  const mileage = car.kmRun || car.mileage || '';
  const price = car.sellingPrice || car.price || '';
  
  // Format price and mileage
  const formatNumber = (n: string | number) => n ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '-';

  const navigate = useNavigate();
  const handleCardClick = () => {
    if (car._id) {
      console.log('Navigating to car with _id:', car._id);
      navigate(`/car/${car._id}`);
    }
  };

  // Use only car.status for status
  const statusRaw = car.status || 'Unknown';
  const status = statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1).toLowerCase();
  const statusColor = statusColors[status] || statusColors[status.toLowerCase()] || 'text-gray-500';

  return (
    <div
      className="
        bg-white rounded-xl shadow-md overflow-hidden cursor-pointer 
        hover:shadow-lg hover:shadow-gray-200 
        transition-all duration-200 
        w-full h-full
        flex flex-col
        group
      "
      onClick={handleCardClick}
    >
      {/* Media Section */}
      <div className="relative w-full flex-shrink-0">
        {/* Responsive aspect ratio container */}
        <div className="aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/3] bg-gray-100 relative overflow-hidden">
          {currentMedia ? (
            isVideo(currentMedia) ? (
              <video
                src={currentMedia}
                className="w-full h-full object-cover"
                muted
                playsInline
                preload="metadata"
                style={{ background: '#000' }}
              />
            ) : (
              <img
                src={currentMedia}
                alt={`${brand} ${model}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            )
          ) : (
            <img
              src={placeholder}
              alt="No Image"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
          
          {/* Navigation arrows - only show if multiple media */}
          {mediaArr.length > 1 && (
            <>
              <button 
                onClick={handlePrev} 
                className="
                  absolute left-2 top-1/2 -translate-y-1/2 
                  bg-white/90 hover:bg-white 
                  rounded-full p-1.5 sm:p-2 
                  shadow-md opacity-0 group-hover:opacity-100 
                  transition-all duration-200 z-10
                  backdrop-blur-sm
                "
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700" />
              </button>
              <button 
                onClick={handleNext} 
                className="
                  absolute right-2 top-1/2 -translate-y-1/2 
                  bg-white/90 hover:bg-white 
                  rounded-full p-1.5 sm:p-2 
                  shadow-md opacity-0 group-hover:opacity-100 
                  transition-all duration-200 z-10
                  backdrop-blur-sm
                "
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700" />
              </button>
              
              {/* Media indicator dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                {mediaArr.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                      index === mediaIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          
          {/* Favorite button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              // Add favorite functionality here
            }}
            className="
              absolute top-2 sm:top-3 right-2 sm:right-3 
              bg-white/90 hover:bg-white 
              rounded-full p-1.5 sm:p-2 
              shadow-md transition-all duration-200
              backdrop-blur-sm
            "
          >
            <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 hover:text-red-500 transition-colors" />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        {/* Header with title and year */}
        <div className="flex items-start justify-between mb-1 gap-2">
          <h3 className="font-semibold text-base sm:text-lg text-gray-900 leading-tight line-clamp-1 flex-1">
            {brand} {model} {trim}
          </h3>
          <div className="flex items-center text-gray-500 text-xs sm:text-sm flex-shrink-0">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> 
            <span>{year}</span>
          </div>
        </div>

        {/* VIN */}
        {vin && (
          <div className="text-xs text-gray-500 mb-2 font-mono truncate">
            VIN: {vin}
          </div>
        )}

        {/* Status */}
        <div className="flex items-center mb-2">
          <span className={`
            text-xs sm:text-sm font-medium px-2 py-1 rounded-full
            ${status === 'Available' ? 'bg-green-100 text-green-700' : ''}
            ${status === 'Sold' ? 'bg-gray-100 text-gray-600' : ''}
            ${status === 'Reserved' ? 'bg-yellow-100 text-yellow-700' : ''}
            ${status === 'Pending' ? 'bg-blue-100 text-blue-700' : ''}
          `}>
            {status}
          </span>
        </div>

        {/* Mileage */}
        {mileage && (
          <div className="text-gray-600 text-sm mb-2">
            {formatNumber(mileage)} KM
          </div>
        )}

        {/* Price - pushed to bottom */}
        <div className="mt-auto pt-2">
          {price && (
            <div className="text-lg sm:text-xl font-bold text-gray-900">
              ₹{formatNumber(price)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarCard;