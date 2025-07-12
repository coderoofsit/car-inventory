import React from 'react';
import { Heart, Calendar } from 'lucide-react';
import { getCarCardMediaUrl } from '@/lib/utils';

interface CarCardProps {
  car: any; // Use backend object directly
  onClick?: () => void;
}

const CarCard: React.FC<CarCardProps> = ({ car, onClick }) => {
  const placeholder = 'https://via.placeholder.com/400x300?text=No+Image';
  const media = getCarCardMediaUrl(car);
  const isAvailable = (car.availability || car.status || '').toLowerCase() === 'available';
  const isSold = (car.availability || car.status || '').toLowerCase() === 'sold';
  const statusColor = isAvailable ? 'text-green-600' : isSold ? 'text-gray-400' : 'text-yellow-500';
  const statusText = isAvailable ? 'Available' : isSold ? 'Sold' : (car.availability || car.status || 'Unknown');
  const year = car.manufactureYear || car.year || '-';
  const brand = car.brand || car.make || '';
  const model = car.model || '';
  const trim = car.trim || '';
  const vin = car.vin || '';
  const mileage = car.kmRun || car.mileage || '';
  const price = car.sellingPrice || car.price || '';
  // Format price and mileage
  const formatNumber = (n: string | number) => n ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '-';

  return (
    <div
      className="bg-white rounded-xl shadow-md p-0 overflow-hidden cursor-pointer hover:shadow-lg transition w-80"
      onClick={onClick}
    >
      <div className="relative w-full h-52 bg-gray-100">
        {media.type === 'image' && media.url ? (
          <img
            src={media.url}
            alt={`${brand} ${model}`}
            className="w-full h-52 object-cover rounded-t-xl"
          />
        ) : media.type === 'video' && media.url ? (
          <video
            src={media.url}
            className="w-full h-52 object-cover rounded-t-xl"
            muted
            playsInline
            preload="metadata"
            style={{ background: '#000' }}
          />
        ) : (
          <img
            src={placeholder}
            alt="No Image"
            className="w-full h-52 object-cover rounded-t-xl"
          />
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
          <span className={`font-medium ${statusColor}`}>{statusText}</span>
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