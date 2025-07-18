import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CarDetailContent from '../components/CarDetailContent';

const CarDetailPage: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  if (!carId) {
    navigate('/');
    return null;
  }

  return (
    <div className="w-screen h-screen bg-white overflow-hidden">
      <CarDetailContent
        carId={carId}
        onBack={() => navigate(-1)}
        onEditSuccess={() => setRefreshKey(k => k + 1)}
        key={refreshKey}
      />
    </div>
  );
};

export default CarDetailPage; 