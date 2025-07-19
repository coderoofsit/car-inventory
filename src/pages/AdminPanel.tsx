import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const dummyCars = [
  { _id: '1', status: 'Available', brand: 'Toyota', model: 'Corolla', manufactureYear: '2022', sellingPrice: '15000', kmRun: '20000', location: 'New York' },
  { _id: '2', status: 'Sold', brand: 'Honda', model: 'Civic', manufactureYear: '2021', sellingPrice: '14000', kmRun: '25000', location: 'Los Angeles' },
  { _id: '3', status: 'Reserved', brand: 'Ford', model: 'Focus', manufactureYear: '2020', sellingPrice: '13000', kmRun: '30000', location: 'Chicago' },
  { _id: '4', status: 'Available', brand: 'Hyundai', model: 'Elantra', manufactureYear: '2023', sellingPrice: '16000', kmRun: '10000', location: 'Miami' },
];

const AdminPanel: React.FC = () => {
  const [cars, setCars] = useState(dummyCars);
  const [cardStats, setCardStats] = useState({
    Available: { count: 0, minPrice: 0, maxPrice: 0 },
    Sold: { count: 0, minPrice: 0, maxPrice: 0 },
    Pending: { count: 0, minPrice: 0, maxPrice: 0 },
    Reserved: { count: 0, minPrice: 0, maxPrice: 0 },
  });
  const navigate = useNavigate();

  // Calculate stats for each category
  useEffect(() => {
    const stats = {
      Available: { count: 0, minPrice: Infinity, maxPrice: 0 },
      Sold: { count: 0, minPrice: Infinity, maxPrice: 0 },
      Pending: { count: 0, minPrice: Infinity, maxPrice: 0 },
      Reserved: { count: 0, minPrice: Infinity, maxPrice: 0 },
    };

    cars.forEach(car => {
      const price = parseInt(car.sellingPrice);
      const status = car.status;
      if (stats[status]) {
        stats[status].count++;
        stats[status].minPrice = Math.min(stats[status].minPrice, price);
        stats[status].maxPrice = Math.max(stats[status].maxPrice, price);
      }
    });

    // Handle cases where no cars exist for a category
    Object.keys(stats).forEach(status => {
      if (stats[status].count === 0) {
        stats[status].minPrice = 0;
      }
    });

    setCardStats(stats);
  }, [cars]);

  // Fetch stats from API (fallback to calculating from dummy data)
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL|| "http://localhost:5000"}/api/admin/stats`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.stats) {
          setCardStats(data.stats);
        }
      })
      .catch(() => {
        // Calculate from dummy data as fallback
        console.log('Failed to fetch stats from API, using dummy data');
      });
  }, []);

  const cardConfigs = [
    {
      title: 'Available',
      gradient: 'from-emerald-400 to-emerald-600',
      textColor: 'text-white',
      shadowColor: 'shadow-emerald-200',
    },
    {
      title: 'Sold',
      gradient: 'from-rose-400 to-rose-600',
      textColor: 'text-white',
      shadowColor: 'shadow-rose-200',
    },
    {
      title: 'Pending',
      gradient: 'from-amber-400 to-amber-600',
      textColor: 'text-white',
      shadowColor: 'shadow-amber-200',
    },
    {
      title: 'Reserved',
      gradient: 'from-blue-400 to-blue-600',
      textColor: 'text-white',
      shadowColor: 'shadow-blue-200',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-slate-800 text-center">Admin Panel</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {cardConfigs.map((config) => {
            const stats = cardStats[config.title];
            return (
              <div
                key={config.title}
                className={`bg-gradient-to-br ${config.gradient} rounded-2xl p-6 shadow-xl ${config.shadowColor} transform hover:scale-105 transition-all duration-300 cursor-pointer`}
                onClick={() => navigate('/')}
                tabIndex={0}
                role="button"
                aria-label={`Go to home from ${config.title} card`}
              >
                <div className={`${config.textColor}`}>
                  <h2 className="text-xl font-semibold mb-4">{config.title}</h2>
                  
                  {/* Main Count - Biggest Number */}
                  <div className="text-6xl font-bold mb-4 leading-none">
                    {stats.count}
                  </div>
                  
                  {/* Details - Smaller and Below */}
                  <div className="space-y-2">
                    <div className="text-sm opacity-90">
                      <span className="font-medium">Cars in category</span>
                    </div>
                    
                    {stats.count > 0 ? (
                      <div className="text-sm opacity-90">
                        <div className="font-medium mb-1">Price Range:</div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs">Min: ${stats.minPrice.toLocaleString()}</span>
                          <span className="text-xs">Max: ${stats.maxPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm opacity-70">
                        No cars in this category
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;