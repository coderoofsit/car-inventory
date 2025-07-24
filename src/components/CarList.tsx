import React from 'react';
import CarCard from './CarCard';
import { Car } from '@/lib/utils';

interface CarListProps {
  cars: Car[];
  emptyState?: React.ReactNode;
}

const CarList: React.FC<CarListProps> = ({ cars, emptyState }) => {
  if (!cars.length) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-gray-500 py-12 px-4">
        <div className="text-lg font-medium mb-2">
          {emptyState || "No cars found"}
        </div>
        <div className="text-sm text-gray-400 max-w-md">
          Try adjusting your search criteria or browse all available vehicles.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Container with max width and proper spacing */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Responsive grid */}
        <div className="grid 
          grid-cols-1 
          xs:grid-cols-1 
          sm:grid-cols-2 
          md:grid-cols-2 
          lg:grid-cols-3 
          xl:grid-cols-4 
          2xl:grid-cols-5
          gap-3 
          sm:gap-4 
          md:gap-5 
          lg:gap-6
          auto-rows-fr
        ">
          {cars.map((car, index) => (
            <div key={car._id || car.id || index} className="w-full">
              <CarCard car={car} />
            </div>
          ))}
        </div>
      </div>

      
    </div>
  );
};

export default CarList;