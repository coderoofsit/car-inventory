import React from 'react';
import CarCard from './CarCard';
import { Car } from '@/lib/utils';

interface CarListProps {
  cars: Car[];
  onCarClick?: (car: Car) => void;
  emptyState?: React.ReactNode;
}

const CarList: React.FC<CarListProps> = ({ cars, onCarClick, emptyState }) => {
  if (!cars.length) {
    return (
      <div className="text-center text-gray-500 py-8">
        {emptyState || "No cars found."}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {cars.map(car => (
        <CarCard key={car._id || car.id} car={car} onClick={() => onCarClick(car)} />
      ))}
    </div>
  );
};

export default CarList; 