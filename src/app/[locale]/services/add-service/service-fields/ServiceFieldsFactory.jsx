import React from 'react';
import CompetitionsFields from './CompetitionsFields';
import ConsultingServicesFields from './ConsultingServicesFields';
import ContractorsFields from './ContractorsFields';
import EventCommentaryFields from './EventCommentaryFields';
import EventJudgingFields from './EventJudgingFields';
import HoofTrimmerFields from './HoofTrimmerFields';
import HorseCateringFields from './HorseCateringFields';
import HorseGroomingFields from './HorseGroomingFields';
import HorseStableFields from './HorseStableFields';
import HorseTrainerFields from './HorseTrainerFields';
import HorseTransportFields from './HorseTransportFields';
import HousingFields from './HousingFields';
import MarketingPromotionFields from './MarketingPromotionFields';
import PhotographyServicesFields from './PhotographyServicesFields';
import TripCoordinatorFields from './TripCoordinatorFields';
import VeterinaryFields from './VeterinaryFields';
import SuppliersFields from './SuppliersFields';

const ServiceFieldsFactory = ({
  serviceType,
  formData,
  handleChange,
  handleNestedChange,
  handleNestedArrayChange,
  addNestedArrayItem,
  removeNestedArrayItem,
  errors,
  isRTL
}) => {
  const serviceDetailKeyMap = {
    horse_stable: 'horseStabelDetails',
    veterinary: 'VeterinaryDetails',
    competitions: 'competitions',
    housing: 'housingDetails',
    trip_coordinator: 'tripCoordinator',
    horse_catering: 'horseCateringDetails',
    horse_transport: 'transportDetails',
    contractors: 'contractorsDetails',
    horse_trainer: 'horseTrainerDetails',
    hoof_trimmer: 'hoofTrimmerDetails',
    horse_grooming: 'horseGroomingDetails',
    event_judging: 'eventJudgingDetails',
    marketing_promotion: 'marketingPromotionDetails',
    event_commentary: 'eventCommentaryDetails',
    consulting_services: 'consultingServicesDetails',
    photography_services: 'photographyServicesDetails',
    suppliers: 'supplierDetails'
  };

  // Initialize service_details for the selected service type
  React.useEffect(() => {
    if (serviceType && formData && formData.service_details) {
      const serviceDetailKey = serviceDetailKeyMap[serviceType] || serviceType;
      if (!formData.service_details[serviceDetailKey]) {
        handleNestedChange(serviceDetailKey, '', {});
      }
    }
  }, [serviceType, formData, handleNestedChange, serviceDetailKeyMap]);

  // Define props for child components
  const componentProps = {
    formData,
    handleChange,
    handleNestedChange,
    handleNestedArrayChange,
    addNestedArrayItem,
    removeNestedArrayItem,
    errors,
    isRTL,
    serviceDetailKey: serviceDetailKeyMap[serviceType] || serviceType
  };

  // Map service types to their respective components
  const serviceFieldsMap = {
    competitions: CompetitionsFields,
    consulting_services: ConsultingServicesFields,
    contractors: ContractorsFields,
    event_commentary: EventCommentaryFields,
    event_judging: EventJudgingFields,
    hoof_trimmer: HoofTrimmerFields,
    horse_catering: HorseCateringFields,
    horse_grooming: HorseGroomingFields,
    horse_stable: HorseStableFields,
    horse_trainer: HorseTrainerFields,
    horse_transport: HorseTransportFields,
    housing: HousingFields,
    marketing_promotion: MarketingPromotionFields,
    photography_services: PhotographyServicesFields,
    trip_coordinator: TripCoordinatorFields,
    veterinary: VeterinaryFields,
    suppliers: SuppliersFields,
  };

  // Get the component for the selected service type
  const SelectedComponent = serviceFieldsMap[serviceType];

  // Render the selected component or null if serviceType is invalid
  return SelectedComponent ? <SelectedComponent {...componentProps} /> : null;
};

export default ServiceFieldsFactory;