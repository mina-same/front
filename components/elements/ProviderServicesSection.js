import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Clock, MapPin, Phone, Check, X, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const ProviderServicesSection = () => {
  const renderServiceCircles = (services) => {
    const additionalServices = services.slice(1);
    if (additionalServices.length === 0) return null;

    return (
      <div className="flex items-center gap-2 mt-4">
        {additionalServices.map((service, index) => (
          <div key={service._id} className="relative group">
            <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white">
              <img
                src={service.image ? urlFor(service.image).url() : '/placeholder-service.png'}
                alt={service.name_en}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              {service.name_en}
            </div>
          </div>
        ))}
        <div className="text-sm text-gray-500 ml-2">
          +{additionalServices.length} services
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {providers.map(provider => (
        <motion.div
          key={provider._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{provider.name_en}</h2>
                <p className="text-gray-500">Service Provider</p>
              </div>
              <button
                onClick={() => {
                  setSelectedProvider(provider._id);
                  setShowAddService(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
              >
                <Plus size={18} /> Add Service
              </button>
            </div>

            {provider.servicesRef?.length > 0 && (
              <div className="mb-8">
                {/* Main Service Display */}
                <div className="relative rounded-xl overflow-hidden">
                  <div className="aspect-video">
                    <img
                      src={provider.servicesRef[0].image ? urlFor(provider.servicesRef[0].image).url() : '/placeholder-service.png'}
                      alt={provider.servicesRef[0].name_en}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{provider.servicesRef[0].name_en}</h3>
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                        ${provider.servicesRef[0].price}
                      </span>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                        {provider.servicesRef[0].serviceType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Services */}
                {renderServiceCircles(provider.servicesRef)}
              </div>
            )}

            {/* Reservations Section */}
            {pendingReservations.filter(res => res.provider._ref === provider._id).length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Pending Reservations</h3>
                <div className="grid gap-4">
                  {pendingReservations
                    .filter(res => res.provider._ref === provider._id)
                    .map(reservation => (
                      <Card key={reservation._id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex items-center p-4">
                            <div className="flex-1 flex items-center gap-4">
                              <img
                                src={reservation.user?.image ? urlFor(reservation.user.image).url() : '/placeholder-user.png'}
                                alt={reservation.user?.userName}
                                className="w-12 h-12 rounded-full ring-2 ring-white"
                              />
                              <div>
                                <h4 className="font-semibold">{reservation.user?.userName}</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(reservation.datetime).toLocaleDateString()}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {new Date(reservation.datetime).toLocaleTimeString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleReservationResponse(reservation._id, 'approved')}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleReservationResponse(reservation._id, 'rejected')}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ProviderServicesSection;