import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import debounce from 'lodash/debounce';
import {
  X, Search, AlertTriangle, Package, User,
  DollarSign, Loader, Home, Stethoscope, Trophy, Building, Map,
  Utensils, Truck, HardHat, Dumbbell, Scissors, ChevronDown, Sparkles,
  SlidersHorizontal, ChevronUp
} from 'lucide-react';
import { Card } from '../../src/components/ui/card';
import { Alert, AlertDescription } from '../../src/components/ui/alert';
import { Slider } from "../../src/components/ui/slider";
import { Switch } from "../../src/components/ui/switch";
import Image from 'next/image';
import { client, urlFor } from '../../src/lib/sanity'; // Make sure this path matches your project structure

const ServiceSearchPopup = ({ onClose }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Changed to false initially
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    rating: 0,
    hasVerifiedProvider: false,
    sortBy: 'relevance'
  });

  // Service type definitions
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
    horse_stable: t('profile:horseStables'),
    veterinary: t('profile:veterinary'),
    competitions: t('profile:competitions'),
    housing: t('profile:housing'),
    trip_coordinator: t('profile:tripCoordinator'),
    horse_catering: t('profile:horseCatering'),
    horse_transport: t('profile:transport'),
    contractors: t('profile:contractors'),
    suppliers: t('profile:suppliers'),
    horse_trainer: t('profile:horseTrainers'),
    hoof_trimmer: t('profile:hoofTrimmer')
  };

  // Modified fetch function with better error handling
  const fetchServices = useCallback(async (searchQuery = '') => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      // Base query without search term
      let query = `*[_type == "services" && isMainService == true && statusAdminApproved == true`;

      // Add search conditions if searchQuery exists
      if (searchQuery) {
        query += ` && (
          name_en match "*${searchQuery}*" ||
          name_ar match "*${searchQuery}*" ||
          about_en match "*${searchQuery}*" ||
          providerRef->name_en match "*${searchQuery}*"
        )`;
      }

      // Close the query and add selections
      query += `]{
        _id,
        name_en,
        name_ar,
        price,
        image,
        serviceType,
        about_en,
        rating,
        totalReviews,
        location,
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

      // Apply filters
      let filteredResults = result.filter(service => {
        if (selectedTypes.length > 0 && !selectedTypes.includes(service.serviceType)) {
          return false;
        }
        if (filters.rating > 0 && (!service.rating || service.rating < filters.rating)) {
          return false;
        }
        if (service.price < filters.priceRange[0] || service.price > filters.priceRange[1]) {
          return false;
        }
        return true;
      });

      // Apply sorting
      switch (filters.sortBy) {
        case 'price_low':
          filteredResults.sort((a, b) => (a.price || 0) - (b.price || 0));
          break;
        case 'price_high':
          filteredResults.sort((a, b) => (b.price || 0) - (a.price || 0));
          break;
        case 'rating':
          filteredResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'newest':
          // Assuming _createdAt exists in your schema
          filteredResults.sort((a, b) => new Date(b._createdAt) - new Date(a._createdAt));
          break;
      }

      setServices(filteredResults);
    } catch (error) {
      console.error('Error fetching services:', error);
      setErrorMessage(t('profile:failedToLoadServices'));
      setServices([]); // Clear services on error
    } finally {
      setIsLoading(false);
    }
  }, [selectedTypes, filters, t]);

  // Debounced search handler
  const debouncedFetch = useCallback(
    debounce((searchQuery) => fetchServices(searchQuery), 300),
    [fetchServices]
  );

  // Effect for search term changes
  useEffect(() => {
    debouncedFetch(searchTerm);
  }, [searchTerm, debouncedFetch]);

  // Effect for filter changes
  useEffect(() => {
    fetchServices(searchTerm);
  }, [filters, selectedTypes, fetchServices, searchTerm]);

  // Initial load
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 px-4 z-50">
      <Card className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Header */}
        <div className="p-6 border-b relative">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="font-medium">Filters</span>
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('profile:searchServicesOrProviders')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              autoFocus
            />
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Price Range</h3>
                  <Slider
                    defaultValue={[filters.priceRange[0], filters.priceRange[1]]}
                    max={1000}
                    step={10}
                    className="w-full"
                    onValueChange={(value) => setFilters({ ...filters, priceRange: value })}
                  />
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>${filters.priceRange[0]}</span>
                    <span>${filters.priceRange[1]}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Rating</h3>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setFilters({ ...filters, rating })}
                        className={`p-2 rounded ${filters.rating === rating ? 'bg-blue-500 text-white' : 'bg-white border'
                          }`}
                      >
                        {rating}★
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <span className="text-sm font-medium">Verified Providers Only</span>
                  <Switch
                    checked={filters.hasVerifiedProvider}
                    onCheckedChange={(checked) =>
                      setFilters({ ...filters, hasVerifiedProvider: checked })
                    }
                  />
                </div>

                <div>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    className="w-full p-3 border rounded-lg bg-white"
                  >
                    <option value="relevance">Sort by: Relevance</option>
                    <option value="price_low">Sort by: Price (Low to High)</option>
                    <option value="price_high">Sort by: Price (High to Low)</option>
                    <option value="rating">Sort by: Highest Rated</option>
                    <option value="newest">Sort by: Newest First</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Service Type Pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {Object.entries(serviceTypeLabels).map(([type, label]) => (
              <button
                key={type}
                onClick={() => setSelectedTypes(prev =>
                  prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                )}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${selectedTypes.includes(type)
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {serviceTypeIcons[type]}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-[50vh] p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">
                {t('profile:noServicesFound')}
              </h3>
              <p className="text-gray-500 mt-2">{t('profile:tryAdjustingFilters')}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {services.map((service) => (
                <div
                  key={service._id}
                  className="group cursor-pointer bg-white rounded-xl border hover:border-blue-500 hover:shadow-lg transition-all p-4 flex gap-4"
                  onClick={() => router.push(`/services/${service._id}`)}
                >
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={service.image ? urlFor(service.image).url() : '/placeholder.png'}
                      alt={service.name_en}
                      className="rounded-lg object-cover"
                      fill
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-500">
                        {service.name_en}
                      </h3>
                      {service.rating && (
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                          <Sparkles className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium text-yellow-700">
                            {service.rating} ({service.totalReviews})
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{service.providerRef?.name_en}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {serviceTypeIcons[service.serviceType]}
                        <span>{serviceTypeLabels[service.serviceType]}</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-500 font-medium">
                        <DollarSign className="w-4 h-4" />
                        <span>${service.price}</span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {service.about_en}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {errorMessage && (
          <Alert className="absolute bottom-4 right-4 w-96 bg-red-50 border-red-200">
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

export default ServiceSearchPopup;
