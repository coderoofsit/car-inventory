import React from 'react';

const dummyDealerships = [
  { id: 1, name: 'Sunshine Motors', location: 'New York, NY', contact: '123-456-7890' },
  { id: 2, name: 'Auto Galaxy', location: 'Los Angeles, CA', contact: '987-654-3210' },
  { id: 3, name: 'Prime Cars', location: 'Chicago, IL', contact: '555-123-4567' },
];

const AdminPanel: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Dealerships</h2>
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Location</th>
              <th className="border px-4 py-2">Contact</th>
            </tr>
          </thead>
          <tbody>
            {dummyDealerships.map((dealer) => (
              <tr key={dealer.id}>
                <td className="border px-4 py-2">{dealer.id}</td>
                <td className="border px-4 py-2">{dealer.name}</td>
                <td className="border px-4 py-2">{dealer.location}</td>
                <td className="border px-4 py-2">{dealer.contact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel; 