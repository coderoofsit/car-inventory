import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CarDetailContent from '../components/CarDetailContent';

const CarDetailPage: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();

  if (!carId) {
    navigate('/');
    return null;
  }

  return (
    <div className="w-screen h-screen bg-white overflow-hidden">
      <CarDetailContent
        carId={carId}
        onBack={() => navigate(-1)}
      />
    </div>
  );
};

export default CarDetailPage; 