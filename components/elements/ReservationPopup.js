import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import Image from 'next/image';
import Link from 'next/link';
import { client } from "@/lib/sanity";
import imageUrlBuilder from "@sanity/image-url";
import { X, Calendar, User, Star, ChevronRight, ChevronLeft, Plus, Minus, Loader2, CheckCircle, AlertTriangle, Award, Tag } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const builder = imageUrlBuilder(client);
function urlFor(source) {
  return builder.image(source);
}

const ReservationPopup = ({
  isOpen = false,
  onClose,
  serviceId,
  serviceName,
  providerRef,
  providerType = 'stable', // 'stable' or 'user'
  fullTimeServices = [],
  freelancerServices = [],
}) => {
  const { t } = useTranslation();
  const isRTL = t("direction") === "rtl";

  const [step, setStep] = useState(1); // 1: Boarding, 1.5: Additional, 2: Services, 3: Service Details, 3.5: Service Benefits, 4: Add Another Service, 5: Review
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [userHorses, setUserHorses] = useState([]);
  const [boardingDetails, setBoardingDetails] = useState({
    horses: [],
    startDate: null,
    endDate: null,
    additionalServices: [],
  });
  const [serviceReservations, setServiceReservations] = useState([]);
  const [currentService, setCurrentService] = useState(null);
  const [currentServiceDetails, setCurrentServiceDetails] = useState({
    horse: null,
    startDate: null,
    endDate: null,
    quantity: 1,
    additionalBenefits: [],
  });
  const [allServices, setAllServices] = useState([]);
  const [isFetchingHorses, setIsFetchingHorses] = useState(false);
  const [stableBoardingDetails, setStableBoardingDetails] = useState(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get tomorrow's date for minimum date constraints
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Fetch user horses, stable details, and combine services
  useEffect(() => {
    if (!isOpen || !providerRef) return;

    const fetchInitialData = async () => {
      setIsFetchingHorses(true);
      try {
        // Fetch horses if provider is a user
        if (providerType === 'user') {
          const horsesQuery = `*[_type == "horse" && owner._ref == $userId]{_id, fullName}`;
          const horsesData = await client.fetch(horsesQuery, { userId: providerRef });
          setUserHorses(horsesData || []);
        }

        // Fetch stable boarding details if provider is a stable
        if (providerType === 'stable') {
          const stableQuery = `*[_type == "stables" && _id == $stableId][0]{boardingDetails}`;
          const stableData = await client.fetch(stableQuery, { stableId: providerRef });
          setStableBoardingDetails(stableData?.boardingDetails || null);
        }
      } catch (err) {
        setError(t("reservationPopup:errors.fetchData"));
        console.error("Failed to fetch initial data:", err);
      } finally {
        setIsFetchingHorses(false);
      }
    };

    fetchInitialData();
    setAllServices([...fullTimeServices, ...freelancerServices]);
  }, [isOpen, providerRef, providerType, fullTimeServices, freelancerServices, t]);

  // Reset state when popup opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setBoardingDetails({
        horses: [],
        startDate: null,
        endDate: null,
        additionalServices: [],
      });
      setServiceReservations([]);
      setCurrentService(null);
      setCurrentServiceDetails({
        horse: null,
        startDate: null,
        endDate: null,
        quantity: 1,
        additionalBenefits: [],
      });
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  // Calculate total price
  const calculateTotalPrice = useCallback(() => {
    let total = 0;

    // Boarding price
    if (boardingDetails.horses.length > 0 && boardingDetails.startDate && boardingDetails.endDate) {
      const days = Math.ceil(
        (boardingDetails.endDate - boardingDetails.startDate) /
          (1000 * 60 * 60 * 24)
      );
      const boardingDays = Math.max(days, 1);
      
      if (stableBoardingDetails?.boardingPrice) {
        total += stableBoardingDetails.boardingPrice * boardingDays * boardingDetails.horses.length;
      }
    }

    // Additional services for boarding
    boardingDetails.additionalServices.forEach((service) => {
      if (service.price && service.price > 0) {
        total += service.price;
      }
    });

    // Service reservations
    serviceReservations.forEach((reservation) => {
      if (reservation.price && reservation.price > 0) {
        total += reservation.price * (reservation.quantity || 1);
      }
      reservation.additionalBenefits?.forEach((benefit) => {
        if (benefit.additional_price && benefit.additional_price > 0) {
          total += benefit.additional_price;
        }
      });
    });

    // Current service being configured (if on step 3)
    if (step === 3 && currentService && currentServiceDetails) {
      if (currentService.price && currentService.price > 0) {
        total += currentService.price * (currentServiceDetails.quantity || 1);
      }
      currentServiceDetails.additionalBenefits?.forEach((benefit) => {
        if (benefit.additional_price && benefit.additional_price > 0) {
          total += benefit.additional_price;
        }
      });
    }

    return Math.max(0, total).toFixed(2); // Ensure total is never negative
  }, [boardingDetails, serviceReservations, stableBoardingDetails, step, currentService, currentServiceDetails]);

  // Validate dates
  const validateDates = useCallback((startDate, endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate && startDate < today) {
      return t("reservationPopup:errors.startDatePast");
    }
    
    if (startDate && endDate && endDate <= startDate) {
      return t("reservationPopup:errors.endDateAfterStart");
    }
    
    return null;
  }, [t]);

  // Handle boarding form submission
  const handleBoardingSubmit = () => {
    // Clear any previous errors
    setError(null);

    // Validate required fields
    if (boardingDetails.horses.length === 0) {
      setError(t("reservationPopup:errors.boardingRequired"));
      return;
    }

    if (!boardingDetails.startDate) {
      setError(t("reservationPopup:errors.startDateRequired"));
      return;
    }

    if (!boardingDetails.endDate) {
      setError(t("reservationPopup:errors.endDateRequired"));
      return;
    }

    // Validate dates
    const dateError = validateDates(boardingDetails.startDate, boardingDetails.endDate);
    if (dateError) {
      setError(dateError);
      return;
    }

    // Validate that boarding price exists
    if (!stableBoardingDetails?.boardingPrice || stableBoardingDetails.boardingPrice <= 0) {
      setError(t("reservationPopup:errors.invalidBoardingPrice"));
      return;
    }

    setStep(1.5); // Move to additional services
  };

  const handleAdditionalServicesSubmit = () => {
    setStep(2); // Move to service selection
  };

  // Handle service selection
  const handleSelectService = (service) => {
    setCurrentService(service);
    const preselectedHorse = boardingDetails.horses.length > 0 ? boardingDetails.horses[0] : null;
    setCurrentServiceDetails({
      horse: preselectedHorse,
      startDate: null,
      endDate: null,
      quantity: 1,
      additionalBenefits: [],
    });
    setStep(3);
  };

  // Handle service form submission
  const handleServiceDetailsSubmit = () => {
    // Clear any previous errors
    setError(null);

    // Validation for horse selection (except for per_project services)
    if (currentService?.priceUnit !== "per_project" && !currentServiceDetails.horse) {
      setError(t("reservationPopup:errors.horseRequired"));
      return;
    }

    // Validation for dates (except for per_project services)
    if (currentService?.priceUnit !== "per_project") {
      if (!currentServiceDetails.startDate) {
        setError(t("reservationPopup:errors.serviceStartDateRequired"));
        return;
      }
      if (!currentServiceDetails.endDate) {
        setError(t("reservationPopup:errors.serviceEndDateRequired"));
        return;
      }
    }

    // Validate dates for services
    if (currentService?.priceUnit !== "per_project" && currentServiceDetails.startDate && currentServiceDetails.endDate) {
      const dateError = validateDates(currentServiceDetails.startDate, currentServiceDetails.endDate);
      if (dateError) {
        setError(dateError);
        return;
      }
    }

    // Validate quantity
    if (currentServiceDetails.quantity < 1) {
      setError(t("reservationPopup:errors.invalidQuantity"));
      return;
    }

    // Validate service price
    if (!currentService?.price || currentService.price <= 0) {
      setError(t("reservationPopup:errors.invalidServicePrice"));
      return;
    }

    // Add service and proceed directly (no separate step for additional benefits)
    addServiceAndProceed();
  };

  const addServiceAndProceed = () => {
    setServiceReservations([
      ...serviceReservations,
      {
        ...currentService,
        ...currentServiceDetails,
      },
    ]);
    setStep(4);
    setError(null);
  }

  // Handle final submission to Sanity
  const handleFinalSubmit = async () => {
    if (!userRef) {
      setError(t("reservationPopup:errors.loginRequired"));
      return;
    }

    if (!boardingDetails.horses.length && !serviceReservations.length) {
      setError(t("reservationPopup:errors.noReservations"));
      return;
    }

    // Final validation before submission
    const totalPrice = parseFloat(calculateTotalPrice());
    if (totalPrice < 0) {
      setError(t("reservationPopup:errors.negativePrice"));
      return;
    }

    // Validate boarding dates one more time
    if (boardingDetails.horses.length > 0) {
      const dateError = validateDates(boardingDetails.startDate, boardingDetails.endDate);
      if (dateError) {
        setError(dateError);
        return;
      }
    }

    // Validate service dates
    for (const reservation of serviceReservations) {
      if (reservation.startDate && reservation.endDate) {
        const dateError = validateDates(reservation.startDate, reservation.endDate);
        if (dateError) {
          setError(dateError);
          return;
        }
      }
    }

    setLoading(true);
    try {
      const reservationDoc = {
        _type: "reservation",
        user: { _type: "reference", _ref: userRef },
        stableRef: { _type: "reference", _ref: stableId },
        status: "pending",
        paymentStatus: "pending",
        totalPrice: totalPrice,
        createdAt: new Date().toISOString(),
      };

      // Add boarding details
      if (boardingDetails.horses.length > 0) {
        const days = Math.ceil((boardingDetails.endDate - boardingDetails.startDate) / (1000 * 60 * 60 * 24));
        reservationDoc.boarding = {
          horses: boardingDetails.horses.map((horse) => ({
            _type: "reference",
            _ref: horse._id,
            _key: uuidv4(),
          })),
          startDate: boardingDetails.startDate.toISOString(),
          endDate: boardingDetails.endDate.toISOString(),
          priceUnit: stableBoardingDetails?.boardingPriceUnit || 'per_day',
          quantity: days > 0 ? days : 1,
          additionalServices: boardingDetails.additionalServices.map((service) => ({
            _key: uuidv4(),
            name_ar: service.name_ar,
            name_en: service.name_en,
            price: service.price,
          })),
        };
      }

      // Add service reservations
      if (serviceReservations.length > 0) {
        reservationDoc.services = serviceReservations.map((reservation) => ({
          _key: uuidv4(),
          serviceRef: { _type: "reference", _ref: reservation._id },
          horse: reservation.horse
            ? { _type: "reference", _ref: reservation.horse._id }
            : null,
          startDate: reservation.startDate?.toISOString(),
          endDate: reservation.endDate?.toISOString(),
          priceUnit: reservation.priceUnit,
          quantity: reservation.quantity,
          additionalBenefits: reservation.additionalBenefits.map((benefit) => ({
            _key: uuidv4(),
            name_ar: benefit.name_ar,
            name_en: benefit.name_en,
            additional_price: benefit.additional_price,
          })),
        }));
      }

      await client.create(reservationDoc);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(t("reservationPopup:errors.submissionFailed"));
      console.error("Submission failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Progress indicator
  const renderProgressIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 1.5, 2, 3, 4, 5].map((stepNum, index) => (
        <React.Fragment key={stepNum}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
            step >= stepNum 
              ? 'bg-gold text-black shadow-lg' 
              : 'bg-gray-200 text-gray-500'
          }`}>
            {stepNum === 1.5 ? '+' : Math.floor(stepNum)}
          </div>
          {index < 5 && (
            <div className={`w-8 h-0.5 transition-all duration-300 ${
              step > stepNum ? 'bg-gold' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // Step 1: Boarding
  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text bg-gold mb-2">
          {t("reservationPopup:boardingDetails")}
        </h2>
        <p className="text-gray-600">{t("reservationPopup:selectHorsesAndDates")}</p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          <User className="inline w-4 h-4 mr-2" />
          {t("reservationPopup:selectHorses")}
        </label>
        <div className="relative">
          <select
            value={boardingDetails.horses[0]?._id || ""}
            onChange={(e) => {
              const selectedHorse = userHorses.find(horse => horse._id === e.target.value);
              setBoardingDetails({
                ...boardingDetails,
                horses: selectedHorse ? [selectedHorse] : [],
              });
            }}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all duration-200 bg-white appearance-none"
          >
            <option value="">{t("reservationPopup:selectAHorse")}</option>
            {userHorses.map((horse) => (
              <option key={horse._id} value={horse._id}>
                {horse.fullName || t("reservationPopup:unnamedHorse")}
              </option>
            ))}
          </select>
          <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            <Calendar className="inline w-4 h-4 mr-2" />
            {t("reservationPopup:startDate")}
          </label>
          <input
            type="date"
            value={boardingDetails.startDate ? boardingDetails.startDate.toISOString().split('T')[0] : ''}
            onChange={(e) => {
              const selectedDate = new Date(e.target.value);
              setBoardingDetails({ 
                ...boardingDetails, 
                startDate: selectedDate,
                // Reset end date if it's before the new start date
                endDate: boardingDetails.endDate && boardingDetails.endDate <= selectedDate ? null : boardingDetails.endDate
              });
            }}
            min={tomorrow.toISOString().split('T')[0]}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all duration-200"
          />
          {boardingDetails.startDate && boardingDetails.startDate < today && (
            <p className="text-red-500 text-sm mt-1">{t("reservationPopup:errors.startDatePast")}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            <Calendar className="inline w-4 h-4 mr-2" />
            {t("reservationPopup:endDate")}
          </label>
          <input
            type="date"
            value={boardingDetails.endDate ? boardingDetails.endDate.toISOString().split('T')[0] : ''}
            onChange={(e) => setBoardingDetails({ ...boardingDetails, endDate: new Date(e.target.value) })}
            min={boardingDetails.startDate ? boardingDetails.startDate.toISOString().split('T')[0] : tomorrow.toISOString().split('T')[0]}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all duration-200"
          />
          {boardingDetails.startDate && boardingDetails.endDate && boardingDetails.endDate <= boardingDetails.startDate && (
            <p className="text-red-500 text-sm mt-1">{t("reservationPopup:errors.endDateAfterStart")}</p>
          )}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleBoardingSubmit}
        className={`w-full bg-gold text-black py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        {isRTL ? <ChevronLeft className="mr-2" size={20} /> : null}
        {t("reservationPopup:next")}
        {!isRTL ? <ChevronRight className="ml-2" size={20} /> : null}
      </motion.button>
    </motion.div>
  );

  // Step 1.5: Additional Services
  const renderStep1Point5 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text bg-gold mb-2">
          {t("reservationPopup:additionalServices")}
        </h2>
        <p className="text-gray-600">{t("reservationPopup:enhanceBoarding")}</p>
      </div>

      <div className="space-y-4">
        {stableBoardingDetails?.additionalServices?.map((service, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            className="flex items-center p-4 bg-gray-50 rounded-xl border-2 border-transparent hover:border-yellow-200 transition-all duration-200"
          >
            <input
              type="checkbox"
              id={`additional-service-${index}`}
              className="w-5 h-5 rounded border-2 border-gray-300 text-yellow-500 focus:ring-yellow-400 focus:ring-2"
              checked={boardingDetails.additionalServices.some(s => s.name_en === service.name_en)}
              onChange={(e) => {
                if (e.target.checked) {
                  setBoardingDetails(prev => ({
                    ...prev,
                    additionalServices: [...prev.additionalServices, service]
                  }));
                } else {
                  setBoardingDetails(prev => ({
                    ...prev,
                    additionalServices: prev.additionalServices.filter(s => s.name_en !== service.name_en)
                  }));
                }
              }}
            />
            <div className="ml-4 flex-1">
              <label htmlFor={`additional-service-${index}`} className="block font-semibold text-gray-800 cursor-pointer">
                {isRTL ? service.name_ar : service.name_en}
              </label>
              <p className="text-sm text-gray-600">{service.price} {t("reservationPopup:currency")}</p>
            </div>
            <Star className="text-yellow-400" size={20} />
          </motion.div>
        ))}
      </div>

      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAdditionalServicesSubmit}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 rounded-xl font-semibold transition-all duration-200"
        >
          {t("reservationPopup:skip")}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAdditionalServicesSubmit}
          className="flex-1 bg-gold text-black py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        >
          {t("reservationPopup:next")}
          <ChevronRight className="ml-2" size={20} />
        </motion.button>
      </div>
    </motion.div>
  );

  // Step 2: Select Service
  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text bg-gold mb-2">
          {t("reservationPopup:selectService")}
        </h2>
        <p className="text-gray-600">{t("reservationPopup:chooseServices")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
        {allServices.map((service) => (
          <motion.div
            key={service._id}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-yellow-400 hover:shadow-lg transition-all duration-200 overflow-hidden"
            onClick={() => handleSelectService(service)}
          >
            <div className="flex items-center p-4">
              {service.images && service.images[0] && service.images[0].asset ? (
                <Image
                  src={urlFor(service.images[0]).width(64).height(64).url()}
                  alt={isRTL ? service.name_ar : service.name_en}
                  className="w-16 h-16 object-cover rounded-lg mr-4"
                  width={64}
                  height={64}
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center mr-4">
                  <Star className="text-yellow-600" size={24} />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 text-lg">
                  {isRTL ? service.name_ar : service.name_en}
                </h3>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                  {service.serviceAverageRating > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="font-semibold text-gray-700">{service.serviceAverageRating.toFixed(1)}</span>
                      <span className="text-gray-400">({service.serviceRatingCount || 0})</span>
                    </span>
                  )}
                  {service.years_of_experience > 0 && (
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-gray-400" />
                      <span>{service.years_of_experience} {t("reservationPopup:yearsExperience")}</span>
                    </span>
                  )}
                </div>
                <p className="text-yellow-600 font-semibold mt-2">
                  {service.price} {t("reservationPopup:currency")} / {t(`reservationPopup:priceUnits.${service.priceUnit}`)}
                </p>
              </div>
              <ChevronRight className="text-gray-400" size={20} />
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setStep(5)}
        className="w-full bg-gold text-black py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
      >
        {t("reservationPopup:reviewReservation")}
        <ChevronRight className="ml-2" size={20} />
      </motion.button>
    </motion.div>
  );

  // Step 3: Service Details
  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text bg-gold mb-2">
          {t("reservationPopup:serviceDetails", {
            service: isRTL ? currentService?.name_ar : currentService?.name_en,
          })}
        </h2>
        <p className="text-gray-600">{t("reservationPopup:provideServiceDetails")}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            <User className="inline w-4 h-4 mr-2" />
            {t("reservationPopup:selectHorse")}
          </label>
          <select
            value={currentServiceDetails.horse?._id || ""}
            onChange={(e) => {
              const selectedHorse = userHorses.find(horse => horse._id === e.target.value);
              setCurrentServiceDetails({
                ...currentServiceDetails,
                horse: selectedHorse,
              });
            }}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all duration-200"
            disabled={boardingDetails.horses.length > 0}
          >
            <option value="">{t("reservationPopup:selectAHorse")}</option>
            {userHorses.map((horse) => (
              <option key={horse._id} value={horse._id}>
                {horse.fullName || t("reservationPopup:unnamedHorse")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            {t("reservationPopup:quantity")}
          </label>
          <div className="flex items-center space-x-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentServiceDetails({
                ...currentServiceDetails,
                quantity: Math.max(1, currentServiceDetails.quantity - 1)
              })}
              className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <Minus size={16} />
            </motion.button>
            <span className="text-2xl font-semibold w-16 text-center">{currentServiceDetails.quantity}</span>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentServiceDetails({
                ...currentServiceDetails,
                quantity: currentServiceDetails.quantity + 1
              })}
              className="w-12 h-12 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <Plus size={16} />
            </motion.button>
          </div>
        </div>

        {currentService?.priceUnit !== "per_project" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                <Calendar className="inline w-4 h-4 mr-2" />
                {t("reservationPopup:startDate")}
              </label>
              <input
                type="date"
                value={currentServiceDetails.startDate ? currentServiceDetails.startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value);
                  setCurrentServiceDetails({ 
                    ...currentServiceDetails, 
                    startDate: selectedDate,
                    // Reset end date if it's before the new start date
                    endDate: currentServiceDetails.endDate && currentServiceDetails.endDate <= selectedDate ? null : currentServiceDetails.endDate
                  });
                }}
                min={tomorrow.toISOString().split('T')[0]}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all duration-200"
              />
              {currentServiceDetails.startDate && currentServiceDetails.startDate < today && (
                <p className="text-red-500 text-sm mt-1">{t("reservationPopup:errors.startDatePast")}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                <Calendar className="inline w-4 h-4 mr-2" />
                {t("reservationPopup:endDate")}
              </label>
              <input
                type="date"
                value={currentServiceDetails.endDate ? currentServiceDetails.endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setCurrentServiceDetails({ ...currentServiceDetails, endDate: new Date(e.target.value) })}
                min={currentServiceDetails.startDate ? currentServiceDetails.startDate.toISOString().split('T')[0] : tomorrow.toISOString().split('T')[0]}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all duration-200"
              />
              {currentServiceDetails.startDate && currentServiceDetails.endDate && currentServiceDetails.endDate <= currentServiceDetails.startDate && (
                <p className="text-red-500 text-sm mt-1">{t("reservationPopup:errors.endDateAfterStart")}</p>
              )}
            </div>
          </div>
        )}

        {/* Additional Benefits Section */}
        {currentService?.additionalBenefits?.length > 0 && (
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              <Star className="inline w-4 h-4 mr-2" />
              {t("reservationPopup:additionalBenefits")}
            </label>
            <div className="space-y-3">
              {currentService.additionalBenefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center p-4 bg-gray-50 rounded-xl border-2 border-transparent hover:border-yellow-200 transition-all duration-200"
                >
                  <input
                    type="checkbox"
                    id={`benefit-service-${index}`}
                    className="w-5 h-5 rounded border-2 border-gray-300 text-yellow-500 focus:ring-yellow-400 focus:ring-2"
                    checked={currentServiceDetails.additionalBenefits.some(b => b.name_en === benefit.name_en)}
                    onChange={(e) => {
                      const updatedBenefits = e.target.checked
                        ? [...currentServiceDetails.additionalBenefits, benefit]
                        : currentServiceDetails.additionalBenefits.filter(b => b.name_en !== benefit.name_en);
                      setCurrentServiceDetails(prev => ({ ...prev, additionalBenefits: updatedBenefits }));
                    }}
                  />
                  <div className="ml-4 flex-1">
                    <label htmlFor={`benefit-service-${index}`} className="block font-semibold text-gray-800 cursor-pointer">
                      {isRTL ? benefit.name_ar : benefit.name_en}
                    </label>
                    <p className="text-sm text-gray-600">{benefit.additional_price} {t("reservationPopup:currency")}</p>
                  </div>
                  <Star className="text-yellow-400" size={20} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Service Price Summary */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-xl border border-yellow-200">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">{t("reservationPopup:servicePrice")}:</span>
              <span className="text-lg font-bold text-yellow-600">
                {currentService?.price || 0} {t("reservationPopup:currency")} × {currentServiceDetails.quantity}
              </span>
            </div>
            {currentServiceDetails.additionalBenefits.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">{t("reservationPopup:additionalBenefits")}:</span>
                <span className="text-lg font-bold text-yellow-600">
                  {currentServiceDetails.additionalBenefits.reduce((sum, benefit) => sum + (benefit.additional_price || 0), 0)} {t("reservationPopup:currency")}
                </span>
              </div>
            )}
            <div className="border-t border-yellow-200 pt-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800">{t("reservationPopup:serviceTotal")}:</span>
                <span className="text-xl font-bold text-yellow-600">
                  {((currentService?.price || 0) * currentServiceDetails.quantity + 
                    currentServiceDetails.additionalBenefits.reduce((sum, benefit) => sum + (benefit.additional_price || 0), 0)).toFixed(2)} {t("reservationPopup:currency")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setStep(2)}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center"
        >
          {t("reservationPopup:back")}
          <ChevronLeft className="mr-2" size={20} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleServiceDetailsSubmit}
          className="flex-1 bg-gold text-black py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        >
          {t("reservationPopup:next")}
          <ChevronRight className="ml-2" size={20} />
        </motion.button>
      </div>
    </motion.div>
  );

  // Step 4: Add Another Service
  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text bg-gold mb-2">
          {t("reservationPopup:addAnotherService")}
        </h2>
        <p className="text-gray-600">{t("reservationPopup:addMoreServices")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 max-h-64 overflow-y-auto">
        {allServices
          .filter(service => !serviceReservations.some(res => res._id === service._id))
          .map((service) => (
            <motion.div
              key={service._id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-yellow-400 hover:shadow-lg transition-all duration-200 overflow-hidden"
              onClick={() => handleSelectService(service)}
            >
              <div className="flex items-center p-4">
                {service.images && service.images[0] && service.images[0].asset ? (
                  <Image
                    src={urlFor(service.images[0]).width(48).height(48).url()}
                    alt={isRTL ? service.name_ar : service.name_en}
                    className="w-12 h-12 object-cover rounded-lg mr-4"
                    width={48}
                    height={48}
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center mr-4">
                    <Star className="text-yellow-600" size={20} />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">
                    {isRTL ? service.name_ar : service.name_en}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    {service.serviceAverageRating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span className="font-semibold text-gray-700">{service.serviceAverageRating.toFixed(1)}</span>
                      </span>
                    )}
                    {service.years_of_experience > 0 && (
                      <span className="flex items-center gap-1">
                        <Award className="w-3 h-3 text-gray-400" />
                        <span>{service.years_of_experience} {t("reservationPopup:yearsAbbr")}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-yellow-600 font-semibold text-sm mt-1">
                    {service.price} {t("reservationPopup:currency")} / {t(`reservationPopup:priceUnits.${service.priceUnit}`)}
                  </p>
                </div>
                <ChevronRight className="text-gray-400" size={16} />
              </div>
            </motion.div>
          ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setStep(5)}
        className="w-full bg-gold text-black py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
      >
        {t("reservationPopup:reviewAndSubmit")}
        <ChevronRight className="ml-2" size={20} />
      </motion.button>
    </motion.div>
  );

  // Step 5: Review
  const renderStep5 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text bg-gold mb-2">
          {t("reservationPopup:reviewReservation")}
        </h2>
        <p className="text-gray-600">{t("reservationPopup:confirmBooking")}</p>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {boardingDetails.horses.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 border-2 border-transparent hover:border-yellow-200 transition-all duration-200">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
              <User className="mr-2" size={16} />
              {t("reservationPopup:boarding")}
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <strong>{t("reservationPopup:horses")}:</strong>{" "}
                {boardingDetails.horses
                  .map((horse) => horse.fullName || t("reservationPopup:unnamedHorse"))
                  .join(", ")}
              </p>
              <p>
                <strong>{t("reservationPopup:dates")}:</strong>{" "}
                {boardingDetails.startDate?.toLocaleDateString()} -{" "}
                {boardingDetails.endDate?.toLocaleDateString()}
              </p>
              {boardingDetails.additionalServices.length > 0 && (
                <div>
                  <strong>{t("reservationPopup:additionalServices")}:</strong>
                  <ul className="list-disc list-inside ml-2">
                    {boardingDetails.additionalServices.map((service, index) => (
                      <li key={index}>
                        {isRTL ? service.name_ar : service.name_en} ({service.price}{" "}
                        {t("reservationPopup:currency")})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {serviceReservations.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 border-2 border-transparent hover:border-yellow-200 transition-all duration-200">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
              <Star className="mr-2" size={16} />
              {t("reservationPopup:services")}
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              {serviceReservations.map((reservation, index) => (
                <div key={index}>
                  <p>
                    <strong>{isRTL ? reservation.name_ar : reservation.name_en}</strong>
                  </p>
                  <p>
                    {t("reservationPopup:horse")}:{" "}
                    {reservation.horse?.fullName || t("reservationPopup:unnamedHorse")}
                  </p>
                  <p>
                    {t("reservationPopup:quantity")}: {reservation.quantity}
                  </p>
                  {reservation.startDate && reservation.endDate && (
                    <p>
                      {t("reservationPopup:dates")}:{" "}
                      {reservation.startDate.toLocaleDateString()} -{" "}
                      {reservation.endDate.toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="text-lg font-bold text-gray-800 flex items-center justify-between">
        <span>{t("reservationPopup:totalPrice")}:</span>
        <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text bg-gold">
          {calculateTotalPrice()} {t("reservationPopup:currency")}
        </span>
      </div>

      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setStep(4)}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center"
          disabled={loading}
        >
          {t("reservationPopup:back")}
          <ChevronLeft className="mr-2" size={20} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleFinalSubmit}
          className="flex-1 bg-gold text-black py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="animate-spin mx-auto" size={20} />
          ) : (
            <>
              {t("reservationPopup:submit")}
              <ChevronRight className="ml-2" size={20} />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );

  // Render No Horses Notification
  const renderNoHorses = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text bg-gold mb-2">
          {t("reservationPopup:noHorsesTitle")}
        </h2>
        <p className="text-gray-600">{t("reservationPopup:noHorsesMessage")}</p>
      </div>
      <div className="p-4 bg-yellow-100 text-yellow-700 rounded-xl flex items-center">
        <AlertTriangle size={20} className="mr-2" />
        <p>
          {t("reservationPopup:noHorsesMessage")}{" "}
          <Link
            href="/profile?tab=horses"
            className="text-yellow-600 underline hover:text-yellow-700"
            onClick={onClose}
          >
            {t("reservationPopup:addHorseLink")}
          </Link>
        </p>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setStep(2)}
        className="w-full bg-gold text-black py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {t("reservationPopup:bookServicesOnly")}
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClose}
        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 rounded-xl font-semibold transition-all duration-200"
      >
        {t("reservationPopup:cancel")}
      </motion.button>
    </motion.div>
  );

  // Main render
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className={`bg-white rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl ${isRTL ? 'text-right' : 'text-left'}`}
      >
        <div className={`flex justify-between items-center mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text bg-gold">
            {t("reservationPopup:title", { stableName })}
          </h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            style={isRTL ? { marginLeft: 0, marginRight: 0 } : {}}
          >
            <X size={24} />
          </motion.button>
        </div>

        <AnimatePresence>
          {parseFloat(calculateTotalPrice()) > 0 && step < 5 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-xl shadow-inner-light border border-yellow-200/50">
                <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}> 
                  <div className={`p-2 bg-white/70 rounded-full shadow-sm ${isRTL ? 'ml-4' : 'mr-4'}`}> 
                    <Tag className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <span className="block font-semibold text-gray-700">{t("reservationPopup:runningTotal")}</span>
                    <span className="block text-2xl font-bold text-yellow-600">
                      {calculateTotalPrice()} {t("reservationPopup:currency")}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-100 text-red-700 rounded-xl flex items-center"
          >
            <AlertTriangle size={20} className="mr-2" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-green-100 text-green-700 rounded-xl flex items-center"
          >
            <CheckCircle size={20} className="mr-2" />
            {t("reservationPopup:successMessage")}
          </motion.div>
        )}

        {isFetchingHorses ? (
          <div className="flex justify-center">
            <Loader2 className="animate-spin text-yellow-500" size={24} />
          </div>
        ) : userHorses.length === 0 ? (
          renderNoHorses()
        ) : (
          <>
            {renderProgressIndicator()}
            <AnimatePresence mode="wait">
              {step === 1 && renderStep1()}
              {step === 1.5 && renderStep1Point5()}
              {step === 2 && renderStep2()}
              {step === 3 && currentService && renderStep3()}
              {step === 4 && renderStep4()}
              {step === 5 && renderStep5()}
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ReservationPopup;