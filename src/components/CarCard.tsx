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
  const handlePrev = (e: React.MouseEvent) => { e.stopPropagation(); setMediaIndex((prev) => (prev === 0 ? mediaArr.length - 1 : prev - 1)); };
  const handleNext = (e: React.MouseEvent) => { e.stopPropagation(); setMediaIndex((prev) => (prev === mediaArr.length - 1 ? 0 : prev + 1)); };
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
      className="bg-white rounded-xl shadow-md p-0 overflow-hidden cursor-pointer hover:shadow-lg transition w-full sm:w-80"
      onClick={handleCardClick}
    >
      <div className="relative w-full h-40 sm:h-52 bg-gray-100">
        {currentMedia ? (
          isVideo(currentMedia) ? (
            <video
              src={currentMedia}
              className="w-full h-40 sm:h-52 object-cover rounded-t-xl"
              muted
              playsInline
              preload="metadata"
              style={{ background: '#000' }}
            />
          ) : (
            <img
              src={currentMedia}
              alt={`${brand} ${model}`}
              className="w-full h-40 sm:h-52 object-cover rounded-t-xl"
            />
          )
        ) : (
          <img
            src={placeholder}
            alt="No Image"
            className="w-full h-40 sm:h-52 object-cover rounded-t-xl"
          />
        )}
        {mediaArr.length > 1 && (
          <>
            <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow-md z-10">
              <ChevronLeft className="h-4 w-4 text-black" />
            </button>
            <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow-md z-10">
              <ChevronRight className="h-4 w-4 text-black" />
            </button>
          </>
        )}
        <div className="absolute top-3 right-3 bg-white/80 rounded-full p-1 shadow">
          <Heart className="h-6 w-6 text-gray-400 hover:text-red-500 transition" />
        </div>
      </div>
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="font-semibold text-lg text-gray-900 truncate">
            {brand} {model} {trim}
          </div>
          <div className="flex items-center text-gray-500 text-sm ml-2">
            <Calendar className="h-4 w-4 mr-1" /> {year}
          </div>
        </div>
        <div className="text-xs text-gray-500 mb-1 truncate">{vin}</div>
        <div className="flex items-center text-sm mb-1">
          <span className={`font-medium ${statusColor}`}>{status}</span>
        </div>
        <div className="text-gray-700 text-sm mb-1">
          {mileage ? `${formatNumber(mileage)} KM` : ''}
        </div>
        <div className="text-xl font-bold text-gray-900 mt-2">
          {price ? `₹${formatNumber(price)}` : ''}
        </div>
      </div>
    </div>
  );
};

export default CarCard; 