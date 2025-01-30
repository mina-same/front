import React, { useState, useEffect } from 'react';
import { client, urlFor } from '../../src/lib/sanity';
import {
  X, Search, Check, AlertTriangle, ChevronRight, Package, User,
  DollarSign, Loader, Home, Stethoscope, Trophy, Building, Map,
  Utensils, Truck, HardHat, Dumbbell, Scissors
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const JoinServiceForm = ({ currentUserId, providerId, onClose }) => {
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeServiceType, setActiveServiceType] = useState('all');
  const [view, setView] = useState('grid'); // 'grid' or 'list'

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
    const fetchProviders = async () => {
      try {
        const query = `*[_type == "provider" && userRef._ref != $currentUserId]{
          _id,
          name_en,
          name_ar,
          userRef->{
            userName,
            image
          },
          "services": servicesRef[]->{
            _id,
            name_en,
            name_ar,
            image,
            price,
            serviceType,
            statusAdminApproved,
            about_en
          }
        }`;

        const result = await client.fetch(query, { currentUserId });
        const filteredProviders = result.filter(provider =>
          provider.services && provider.services.some(service => service.statusAdminApproved)
        );
        setProviders(filteredProviders);
      } catch (error) {
        console.error('Error fetching providers:', error);
        setErrorMessage('Failed to load providers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, [currentUserId]);

  const handleJoinRequest = async () => {
    if (!selectedService) return;

    setIsSubmitting(true);
    
    try {
      const joinRequest = {
        _type: 'joinRequest',
        service: {
          _type: 'reference',
          _ref: selectedService._id,
        },
        requestingUser: {
          _type: 'reference',
          _ref: currentUserId,
        },
        status: 'pending',
        requestDate: new Date().toISOString(),
      };

      await client.create(joinRequest);
      setSuccessMessage('Join request sent successfully!');
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error('Error sending join request:', error);
      setErrorMessage('Failed to send join request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredServices = providers.flatMap(provider =>
    provider.services
      .filter(service => service.statusAdminApproved)
      .filter(service =>
        activeServiceType === 'all' || service.serviceType === activeServiceType
      )
      .filter(service =>
        service.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.name_en.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map(service => ({
        ...service,
        providerName: provider.name_en,
        providerImage: provider.userRef?.image
      }))
  );

  return (
    <div className="w-full max-h-4xl inset-0 flex items-center justify-center z-50">
      <Card className="w-full h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Discover Services</h2>
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
                className="w-full pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                style={{paddingLeft: "50px"}}
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

        {/* Scrollable Content */}
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
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                      activeServiceType === type
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
                      className={`group cursor-pointer transition-all ${
                        view === 'grid'
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
                                <span>{service.providerName}</span>
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
                                <span>{service.providerName}</span>
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
              className={`px-8 py-2 rounded-lg text-white font-medium flex items-center gap-2 ${
                !selectedService || isSubmitting
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
          <Alert className="mt-6 bg-green-50 border-green-200">
            <Check className="w-5 h-5 text-green-500" />
            <AlertDescription className="text-green-700">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}
        {errorMessage && (
          <Alert className="mt-6 bg-red-50 border-red-200">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <AlertDescription className="text-red-700">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}
      </Card>
    </div>
  );
};

export default JoinServiceForm;   