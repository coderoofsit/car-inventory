import React from 'react';
import CarCard from './CarCard';
import { Car } from '@/lib/utils';

interface CarListProps {
  cars: Car[];
  onCarClick?: (car: Car) => void;
}

const CarList: React.FC<CarListProps> = ({ cars, onCarClick }) => {
  if (!cars.length) {
    return <div className="text-center text-gray-500 py-8">No cars found.</div>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {cars.map(car => (
        <CarCard key={car.id} car={car} onClick={onCarClick ? () => onCarClick(car) : undefined} />
      ))}
    </div>
  );
};

export default CarList; 