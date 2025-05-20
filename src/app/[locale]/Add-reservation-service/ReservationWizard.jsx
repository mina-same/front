
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { toast } from "../../../components/ui new/sonner";
import ReservationStepContent from "./ReservationStepContent";
import ReservationStepIndicator from "./ReservationStepIndicator";
import ReservationNavigation from "./ReservationNavigation";
import ReservationReview from "./ReservationReview";
import { calculatePrice, submitReservation, fetchUserHorses, fetchJourneys } from "../../../utils/reservationUtils";

// Mock user ID - In a real app, this would come from authentication
const MOCK_USER_ID = "user123";

const RESERVATION_STEPS = [
  "Service Details",
  "Date & Time",
  "Additional Options",
  "Review & Submit"
];

const ReservationWizard = ({ service }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [animateDirection, setAnimateDirection] = useState("next");
  const [submitting, setSubmitting] = useState(false);
  const [userHorses, setUserHorses] = useState([]);
  const [journeys, setJourneys] = useState([]);
  
  const [formData, setFormData] = useState({
    startDate: null,
    endDate: null,
    eventDate: null,
    providedAddress: "",
    horse: null,
    horses: [],
    additionalBenefits: [],
    housingDetails: {
      numberOfGuests: 1,
      accommodationType: "apartment"
    },
    locations: {
      startLocation: null,
      endLocation: null
    },
    eventDetails: {
      competitionType: "",
      participantInfo: ""
    },
    tripDetails: {
      journeyRef: "",
      numberOfParticipants: 1
    },
    projectDetails: {
      description: ""
    },
    locationLink: "",
    notes: ""
  });
  
  const [errors, setErrors] = useState({});
  const [totalPrice, setTotalPrice] = useState(service?.price ?? 0);

  // Fetch user's horses and journeys data
  useEffect(() => {
    const loadData = async () => {
      if (!service) return;
      
      // Only fetch horses for relevant service types
      if ([
        'horse_stable', 'veterinary', 'horse_catering', 'horse_transport',
        'hoof_trimmer', 'horse_grooming', 'horse_trainer'
      ].includes(service?.service_type)) {
        const horses = await fetchUserHorses(MOCK_USER_ID);
        setUserHorses(horses);
      }
      
      // Only fetch journeys for trip coordinator
      if (service?.service_type === 'trip_coordinator') {
        const journeyData = await fetchJourneys();
        setJourneys(journeyData);
      }
    };
    
    loadData();
  }, [service, service?.service_type]);

  // Update price calculation when relevant form fields change
  useEffect(() => {
    if (service) {
      const newPrice = calculatePrice(
        service.price || 0,
        service.priceUnit,
        formData.startDate,
        formData.endDate,
        formData.additionalBenefits
      );
      setTotalPrice(newPrice);
    }
  }, [service, formData.startDate, formData.endDate, formData.additionalBenefits]);

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        // Validate service details based on the service type
        if (service.service_type === 'horse_stable' && (!formData.horses || formData.horses.length === 0)) {
          newErrors.horses = "At least one horse is required";
        }
        
        if (['veterinary', 'horse_catering', 'horse_transport', 'hoof_trimmer', 'horse_grooming', 'horse_trainer'].includes(service.service_type) && !formData.horse) {
          newErrors.horse = "You must select a horse";
        }
        
        if (service.service_type === 'competitions') {
          if (!formData.eventDetails.competitionType) {
            newErrors.competitionType = "Competition type is required";
          }
        }
        
        if (service.service_type === 'trip_coordinator') {
          if (!formData.tripDetails.journeyRef) {
            newErrors.journeyRef = "You must select a journey";
          }
          if (!formData.tripDetails.numberOfParticipants || formData.tripDetails.numberOfParticipants < 1) {
            newErrors.numberOfParticipants = "Number of participants must be at least 1";
          }
        }
        
        if (['photography_services', 'consulting_services', 'marketing_promotion', 'event_commentary', 'event_judging', 'contractors'].includes(service.service_type)) {
          if (!formData.projectDetails.description) {
            newErrors.projectDescription = "Project description is required";
          }
        }
        
        if (service.service_type === 'photography_services' && !formData.locationLink) {
          newErrors.locationLink = "Location link is required";
        }
        
        if (service.service_type === 'housing') {
          if (!formData.housingDetails.numberOfGuests || formData.housingDetails.numberOfGuests < 1) {
            newErrors.numberOfGuests = "Number of guests must be at least 1";
          }
          if (!formData.housingDetails.accommodationType) {
            newErrors.accommodationType = "Accommodation type is required";
          }
        }
        
        if (service.service_type === 'horse_transport') {
          if (!formData.locations.startLocation) {
            newErrors.startLocation = "Start location is required";
          }
          if (!formData.locations.endLocation) {
            newErrors.endLocation = "End location is required";
          }
        }
        break;
        
      case 2:
        // Validate date and time fields
        if (['per_day', 'per_hour', 'per_half_hour'].includes(service.priceUnit) && !formData.startDate) {
          newErrors.startDate = "Start date is required";
        }
        
        if (['per_day', 'per_hour', 'per_half_hour'].includes(service.priceUnit) && !formData.endDate) {
          newErrors.endDate = "End date is required";
        }
        
        if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
          newErrors.endDate = "End date must be after start date";
        }
        
        if (['photography_services', 'consulting_services', 'marketing_promotion', 'event_commentary', 'event_judging', 'competitions', 'contractors'].includes(service.service_type) 
            && !formData.eventDate && service.priceUnit === 'per_project' && !formData.startDate) {
          newErrors.eventDate = "Event date is required";
        }
        break;
        
      case 3:
        // Validate additional options
        // Check if go-to-horse-home option is selected but no address provided
        const hasGoToHomeOption = formData.additionalBenefits.some((benefit) => 
          benefit.name_en?.toLowerCase().includes('go to') || 
          benefit.name_ar?.includes('الذهاب')
        );
        
        if (hasGoToHomeOption && !formData.providedAddress && 
            ['veterinary', 'hoof_trimmer', 'horse_grooming'].includes(service.service_type)) {
          newErrors.providedAddress = "Address is required when 'go to horse home' is selected";
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setAnimateDirection("next");
      setCurrentStep(prev => Math.min(prev + 1, RESERVATION_STEPS.length));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error("Please correct the errors before proceeding");
    }
  };

  const prevStep = () => {
    setAnimateDirection("prev");
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prepareSubmitData = () => {
    return {
      user: { _type: "reference", _ref: MOCK_USER_ID },
      provider: { _type: "reference", _ref: service.provider._id },
      services: [
        {
          serviceRef: { _type: "reference", _ref: service._id },
          priceUnit: service.priceUnit,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
          eventDate: formData.eventDate ? new Date(formData.eventDate).toISOString() : undefined,
          additionalBenefits: formData.additionalBenefits,
          horse: formData.horse ? { _type: "reference", _ref: formData.horse._id } : undefined,
          horses: formData.horses.map((horse) => ({ _type: "reference", _ref: horse._id })),
          providedAddress: formData.providedAddress,
          locations: formData.locations,
          housingDetails: formData.housingDetails,
          eventDetails: formData.eventDetails,
          tripDetails: formData.tripDetails.journeyRef ? {
            ...formData.tripDetails,
            journeyRef: { _type: "reference", _ref: formData.tripDetails.journeyRef }
          } : undefined,
          projectDetails: formData.projectDetails,
          locationLink: formData.locationLink
        }
      ],
      totalPrice,
      notes: formData.notes
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      toast.error("Please correct the errors before submitting");
      return;
    }
    
    setSubmitting(true);
    
    try {
      const reservationData = prepareSubmitData();
      
      toast.info("Submitting reservation...", {
        description: "Please wait while we process your request."
      });
      
      const result = await submitReservation(reservationData);
      
      if (result.success) {
        toast.success("Reservation submitted successfully", {
          description: "Your reservation has been submitted and is pending approval."
        });
        router.push("/"); // Changed from navigate to router.push
      } else {
        toast.error("Failed to submit reservation", {
          description: "There was a problem submitting your reservation. Please try again."
        });
      }
    } catch (error) {
      console.error("Error submitting reservation:", error);
      toast.error("An error occurred", {
        description: "Something went wrong while submitting your reservation."
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        newData[parent] = { ...newData[parent], [child]: value };
      } else {
        newData[field] = value;
      }
      
      return newData;
    });
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="container max-w-4xl py-8 px-4 sm:px-6">
        <div className="mb-12">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            Book {service?.name_en}
          </h1>
          <p className="text-muted-foreground text-lg">
            Complete all steps to make your reservation
          </p>
        </div>
        
        
        {/* Make sure ReservationStepIndicator is rendered */}
        <ReservationStepIndicator currentStep={currentStep} steps={RESERVATION_STEPS} />
        
        <div className="mt-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white rounded-xl border-input p-6 shadow-sm">
              <AnimatePresence mode="wait" initial={false}>
                {currentStep < 4 ? (
                  <ReservationStepContent
                    step={currentStep}
                    animateDirection={animateDirection}
                    service={service}
                    formData={formData}
                    errors={errors}
                    handleChange={handleChange}
                    userHorses={userHorses}
                    journeys={journeys}
                    totalPrice={totalPrice}
                  />
                ) : (
                  <ReservationReview
                    service={service}
                    formData={formData}
                    totalPrice={totalPrice}
                  />
                )}
              </AnimatePresence>
            </div>
            
            <ReservationNavigation
              currentStep={currentStep}
              totalSteps={RESERVATION_STEPS.length}
              nextStep={nextStep}
              prevStep={prevStep}
              isLastStep={currentStep === RESERVATION_STEPS.length}
              isSubmitting={submitting}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReservationWizard;
