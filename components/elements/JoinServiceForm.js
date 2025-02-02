import React, { useState, useEffect } from 'react';
import { client, urlFor } from '../../src/lib/sanity';
import {
  X, Search, Check, AlertTriangle, ChevronRight, Package, User,
  DollarSign, Loader, Home, Stethoscope, Trophy, Building, Map,
  Utensils, Truck, HardHat, Dumbbell, Scissors
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const JoinServiceForm = ({ currentProviderId, currentUserId, onClose }) => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeServiceType, setActiveServiceType] = useState('all');
  const [view, setView] = useState('grid');

  const serviceTypeIcons = {
    horse_stable: <Home className="w-5 h-5" />,
    veterinary: <Stethoscope className="w-5 h-5" />,
    competitions: <Trophy className="w-5 h-5" />,
    housing: <Building className="w-5 h-5" />,
    trip_coordinator: <Map className="w-5 h-5" />,
    horse_catering: <Utensils className="w-5 h-5" />,
    horse_transport: <Truck className="w-5 h-5" />,
    contractors: <HardHat className="w-5 h-5" />,
    suppliers: <Package className="w-5 h-5" />,
    horse_trainer: <Dumbbell className="w-5 h-5" />,
    hoof_trimmer: <Scissors className="w-5 h-5" />
  };

  const serviceTypeLabels = {
    all: 'All Services',
    horse_stable: 'Horse Stables',
    veterinary: 'Veterinary',
    competitions: 'Competitions',
    housing: 'Housing',
    trip_coordinator: 'Trip Coordinator',
    horse_catering: 'Horse Catering',
    horse_transport: 'Transport',
    contractors: 'Contractors',
    suppliers: 'Suppliers',
    horse_trainer: 'Horse Trainers',
    hoof_trimmer: 'Hoof Trimmer'
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const query = `*[_type == "services" && isMainService == true && statusAdminApproved == true]{
          _id,
          name_en,
          name_ar,
          price,
          image,
          serviceType,
          about_en,
          providerRef->{
            _id,
            name_en,
            name_ar,
            userRef->{
              _id,
              userName,
              image
            }
          }
        }`;

        const result = await client.fetch(query);

        // Filter out services belonging to providers owned by the current user
        const filteredServices = result.filter(service =>
          service.providerRef?.userRef?._id !== currentUserId
        );

        setServices(filteredServices);
      } catch (error) {
        console.error('Error fetching services:', error);
        setErrorMessage('Failed to load services');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [currentUserId]);

  const handleJoinRequest = async () => {
    if (!selectedService) return;

    setIsSubmitting(true);

    try {
      const serviceRequest = {
        _type: 'serviceRequest',
        requesterProviderRef: {
          _type: 'reference',
          _ref: currentProviderId,
        },
        receiverProviderRef: {
          _type: 'reference',
          _ref: selectedService.providerRef._id,
        },
        requestedServiceRef: {
          _type: 'reference',
          _ref: selectedService._id,
        },
        status: 'pending',
      };

      await client.create(serviceRequest);
      setSuccessMessage('Service request sent successfully!');
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error('Error sending service request:', error);
      setErrorMessage('Failed to send service request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredServices = services
    .filter(service =>
      activeServiceType === 'all' || service.serviceType === activeServiceType
    )
    .filter(service =>
      service.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.providerRef?.name_en.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="w-full max-h-4xl inset-0 flex items-center justify-center z-50">
      <Card className="w-full h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Ask Services To Join</h2>
              <p className="text-gray-500 mt-1">Find and join professional services in the equestrian world</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Search and View Toggle */}
          <div className="mt-6 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search services or providers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView('grid')}
                className={`p-3 rounded-lg ${view === 'grid' ? 'bg-black text-white' : 'text-gray-400'}`}
              >
                <Package className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-3 rounded-lg ${view === 'list' ? 'bg-black text-white' : 'text-gray-400'}`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Services Display */}
        <div className="flex-1 overflow-y-auto">
          <div className="h-full flex">
            {/* Service Type Filter Sidebar */}
            <div className="w-64 border-r p-4">
              <h3 className="font-semibold text-gray-700 mb-4">Service Types</h3>
              <div className="space-y-2">
                {Object.entries(serviceTypeLabels).map(([type, label]) => (
                  <button
                    key={type}
                    onClick={() => setActiveServiceType(type)}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${activeServiceType === type
                      ? 'bg-black text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {type === 'all' ? (
                      <Package className="w-5 h-5" />
                    ) : (
                      serviceTypeIcons[type]
                    )}
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Services Grid/List */}
            <div className="flex-1 p-6">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900">No Services Found</h3>
                  <p className="text-gray-500 mt-2">Try adjusting your filters or search terms</p>
                </div>
              ) : (
                <div className={view === 'grid' ? 'grid grid-cols-2 gap-6' : 'space-y-4'}>
                  {filteredServices.map((service) => (
                    <div
                      key={service._id}
                      onClick={() => setSelectedService(service)}
                      className={`group cursor-pointer transition-all ${view === 'grid'
                        ? 'bg-white rounded-xl border-2 overflow-hidden hover:shadow-lg ' +
                        (selectedService?._id === service._id
                          ? 'border-blue-500 ring-2 ring-blue-100'
                          : 'border-gray-100 hover:border-black')
                        : 'flex items-center p-4 rounded-xl border-2 ' +
                        (selectedService?._id === service._id
                          ? 'border-black'
                          : 'border-gray-100 hover:border-black')
                        }`}
                    >
                      {view === 'grid' ? (
                        <>
                          <div className="relative h-48">
                            <img
                              src={service.image ? urlFor(service.image).url() : '/placeholder.png'}
                              alt={service.name_en}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 right-4">
                              {serviceTypeIcons[service.serviceType]}
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {service.name_en}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                <span>{service.providerRef?.name_en}</span>
                              </div>
                              <div className="flex items-center gap-1 text-black font-medium">
                                <DollarSign className="w-4 h-4" />
                                <span>${service.price}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {service.about_en}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-6 flex-1">
                          <img
                            src={service.image ? urlFor(service.image).url() : '/placeholder.png'}
                            alt={service.name_en}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {service.name_en}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                <span>{service.providerRef?.name_en}</span>
                              </div>
                              <div className="flex items-center gap-1 text-blue-600 font-medium">
                                <DollarSign className="w-4 h-4" />
                                <span>${service.price}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {serviceTypeIcons[service.serviceType]}
                                <span>{serviceTypeLabels[service.serviceType]}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-6 py-2 border-2 border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleJoinRequest}
              disabled={!selectedService || isSubmitting}
              className={`px-8 py-2 rounded-lg text-white font-medium flex items-center gap-2 ${!selectedService || isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
                }`}
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Join Service
                </>
              )}
            </button>
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <Alert className="absolute bottom-4 right-4 w-96 bg-green-50 border-green-200">
            <div className="flex items-center gap-2">
              <Check className="w-6 h-6 text-green-600 mr-2 flex-shrink-0" />
              <AlertDescription className="text-green-800 font-semibold">
                {successMessage}
              </AlertDescription>
            </div>
          </Alert>
        )}


        {errorMessage && (
          <Alert className="absolute bottom-4 right-4 w-96 bg-red-50 border-red-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <AlertDescription className="text-red-700">
                {errorMessage}
              </AlertDescription>
            </div>
          </Alert>
        )}
      </Card>
    </div >
  );
};

export default JoinServiceForm;