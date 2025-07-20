import React, { useEffect, useState } from 'react';
import { BarChart3, Car, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getGhlLocations } from '@/lib/ghlAPI';

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
  const [locations, setLocations] = useState<any[]>([]);
  const [expandedLocationId, setExpandedLocationId] = useState<string | null>(null);
  const navigate = useNavigate();

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
    Object.keys(stats).forEach(status => {
      if (stats[status].count === 0) {
        stats[status].minPrice = 0;
      }
    });
    setCardStats(stats);
  }, [cars]);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.stats) {
          setCardStats(data.stats);
        }
      })
      .catch(() => {
        console.log('Failed to fetch stats from API, using dummy data');
      });

    // Fetch locations from GHL API
    getGhlLocations().then(data => {
      setLocations(data.locations || []);
    }).catch(() => setLocations([]));
  }, []);

  const cardConfigs = [
    {
      title: 'Available',
      icon: Car,
      gradient: 'from-emerald-500 via-emerald-600 to-emerald-700',
      hoverGradient: 'hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-800',
      shadowColor: 'shadow-emerald-500/25',
      borderColor: 'border-emerald-200/20',
    },
    {
      title: 'Sold',
      icon: TrendingUp,
      gradient: 'from-blue-500 via-blue-600 to-blue-700',
      hoverGradient: 'hover:from-blue-600 hover:via-blue-700 hover:to-blue-800',
      shadowColor: 'shadow-blue-500/25',
      borderColor: 'border-blue-200/20',
    },
    {
      title: 'Pending',
      icon: BarChart3,
      gradient: 'from-amber-500 via-amber-600 to-amber-700',
      hoverGradient: 'hover:from-amber-600 hover:via-amber-700 hover:to-amber-800',
      shadowColor: 'shadow-amber-500/25',
      borderColor: 'border-amber-200/20',
    },
    {
      title: 'Reserved',
      icon: Users,
      gradient: 'from-purple-500 via-purple-600 to-purple-700',
      hoverGradient: 'hover:from-purple-600 hover:via-purple-700 hover:to-purple-800',
      shadowColor: 'shadow-purple-500/25',
      borderColor: 'border-purple-200/20',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Locations Table */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Locations</h2>
            <div className="overflow-x-auto rounded-xl shadow bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Contact</th>
                    <th className="px-4 py-3 text-left font-semibold">Email</th>
                    <th className="px-4 py-3 text-left font-semibold">Location</th>
                    <th className="px-4 py-3 text-left font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((loc, idx) => (
                    <React.Fragment key={loc.id || idx}>
                      <tr
                        className={"hover:bg-blue-50 transition cursor-pointer"}
                        onClick={() => setExpandedLocationId(expandedLocationId === (loc.id || idx) ? null : (loc.id || idx))}
                      >
                        <td className="px-4 py-3">{loc.name}</td>
                        <td className="px-4 py-3">{loc.contactName || '-'}</td>
                        <td className="px-4 py-3">{loc.email || '-'}</td>
                        <td className="px-4 py-3">{loc.address1 || '-'}</td>
                        <td className="px-4 py-3">
                          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded-lg font-semibold shadow transition">View Inventory</button>
                        </td>
                      </tr>
                      {expandedLocationId === (loc.id || idx) && (
                        <tr>
                          <td colSpan={5} className="p-0">
                            <div className="py-6 px-2 bg-gradient-to-br from-gray-50 to-white border-t border-gray-200">
                              {/* Status Cards Grid (reuse previous code) */}
                              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {cardConfigs.map((config) => {
                                  const stats = cardStats[config.title];
                                  const IconComponent = config.icon;
                                  return (
                                    <div
                                      key={config.title}
                                      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${config.gradient} ${config.hoverGradient} border ${config.borderColor} p-6 shadow-xl ${config.shadowColor} transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer`}
                                      tabIndex={0}
                                      role="button"
                                      aria-label={`Go to home from ${config.title} card`}
                                    >
                                      <div className="absolute inset-0 bg-white/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                                      <div className="absolute -right-4 -top-4 opacity-10 transition-all duration-500 group-hover:opacity-20 group-hover:scale-110">
                                        <IconComponent className="h-24 w-24" />
                                      </div>
                                      <div className="relative z-10">
                                        <div className="mb-4 flex items-center justify-between">
                                          <div className="flex items-center space-x-3">
                                            <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                                              <IconComponent className="h-6 w-6 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white">{config.title}</h3>
                                          </div>
                                        </div>
                                        <div className="mb-6">
                                          <div className="text-5xl font-extrabold text-white leading-none mb-2">
                                            {stats.count}
                                          </div>
                                          <div className="text-white/80 font-medium">
                                            Cars in category
                                          </div>
                                        </div>
                                        <div className="space-y-3">
                                          {stats.count > 0 ? (
                                            <>
                                              <div className="rounded-lg bg-white/10 backdrop-blur-sm p-3 border border-white/20">
                                                <div className="text-xs font-semibold text-white/90 uppercase tracking-wide mb-2">
                                                  Price Range:
                                                </div>
                                                <div className="flex items-center justify-between">
                                                  <div className="text-sm text-white/90">
                                                    <span className="font-medium">Min: ${stats.minPrice.toLocaleString()}</span>
                                                  </div>
                                                  <div className="text-sm text-white/90">
                                                    <span className="font-medium">Max: ${stats.maxPrice.toLocaleString()}</span>
                                                  </div>
                                                </div>
                                              </div>
                                            </>
                                          ) : (
                                            <div className="rounded-lg bg-white/10 backdrop-blur-sm p-3 border border-white/20">
                                              <div className="text-sm text-white/80 text-center font-medium">
                                                No cars in this category
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Header Section */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center space-x-3 rounded-2xl bg-white/80 backdrop-blur-md border border-gray-200/50 px-8 py-4 shadow-xl shadow-gray-900/5">
              <BarChart3 className="h-8 w-8 text-indigo-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
            </div>
            <p className="mt-4 text-lg text-gray-600 font-medium">
              Manage your car inventory with ease
            </p>
          </div>
          {/* Action Button */}
          <div className="mb-8 flex justify-end">
            <button
              onClick={() => navigate('/')}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3 text-white font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
              <Car className="mr-2 h-5 w-5" />
              Show Inventory
            </button>
          </div>
          {/* Stats Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {cardConfigs.map((config) => {
              const stats = cardStats[config.title];
              const IconComponent = config.icon;
              return (
                <div
                  key={config.title}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${config.gradient} ${config.hoverGradient} border ${config.borderColor} p-6 shadow-xl ${config.shadowColor} transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer`}
                  onClick={() => navigate('/')}
                  tabIndex={0}
                  role="button"
                  aria-label={`Go to home from ${config.title} card`}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-white/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                  {/* Floating Icon */}
                  <div className="absolute -right-4 -top-4 opacity-10 transition-all duration-500 group-hover:opacity-20 group-hover:scale-110">
                    <IconComponent className="h-24 w-24" />
                  </div>
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white">{config.title}</h3>
                      </div>
                    </div>
                    {/* Count */}
                    <div className="mb-6">
                      <div className="text-5xl font-extrabold text-white leading-none mb-2">
                        {stats.count}
                      </div>
                      <div className="text-white/80 font-medium">
                        Cars in category
                      </div>
                    </div>
                    {/* Price Information */}
                    <div className="space-y-3">
                      {stats.count > 0 ? (
                        <>
                          <div className="rounded-lg bg-white/10 backdrop-blur-sm p-3 border border-white/20">
                            <div className="text-xs font-semibold text-white/90 uppercase tracking-wide mb-2">
                              Price Range:
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-white/90">
                                <span className="font-medium">Min: ${stats.minPrice.toLocaleString()}</span>
                              </div>
                              <div className="text-sm text-white/90">
                                <span className="font-medium">Max: ${stats.maxPrice.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="rounded-lg bg-white/10 backdrop-blur-sm p-3 border border-white/20">
                          <div className="text-sm text-white/80 text-center font-medium">
                            No cars in this category
                          </div>
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
    </div>
  );
};

export default AdminPanel;