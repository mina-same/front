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
  // This mapping ensures all service detail keys match the Sanity schema
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
    suppliers: 'suppliers'
  };

  React.useEffect(() => {
    // Initialize service details for the service type if not already present
    // This ensures the service_details[serviceDetailKey] object is always created using the correct key
    if (serviceType && formData && formData.service_details) {
      const serviceDetailKey = serviceDetailKeyMap[serviceType] || serviceType;
      if (!formData.service_details[serviceDetailKey]) {
        handleNestedChange(serviceDetailKey, '', {});
      }
    }
  }, [serviceType, formData]);
  
  // Map service types to their corresponding field components
  const serviceFieldsMap = {
    competitions: (
      <CompetitionsFields
        formData={formData}
        handleChange={handleChange}
        handleNestedChange={handleNestedChange}
        handleNestedArrayChange={handleNestedArrayChange}
        addNestedArrayItem={addNestedArrayItem}
        removeNestedArrayItem={removeNestedArrayItem}
        errors={errors}
        isRTL={isRTL}
      />
    ),
    consulting_services: (
      <ConsultingServicesFields
        formData={formData}
        handleChange={handleChange}
        handleNestedChange={handleNestedChange}
        handleNestedArrayChange={handleNestedArrayChange}
        addNestedArrayItem={addNestedArrayItem}
        removeNestedArrayItem={removeNestedArrayItem}
        errors={errors}
        isRTL={isRTL}
      />
    ),
    contractors: (
      <ContractorsFields
        formData={formData}
        handleChange={handleChange}
        handleNestedChange={handleNestedChange}
        handleNestedArrayChange={handleNestedArrayChange}
        addNestedArrayItem={addNestedArrayItem}
        removeNestedArrayItem={removeNestedArrayItem}
        errors={errors}
        isRTL={isRTL}
      />
    ),
    event_commentary: (
      <EventCommentaryFields
        formData={formData}
        handleChange={handleChange}
        handleNestedChange={handleNestedChange}
        handleNestedArrayChange={handleNestedArrayChange}
        addNestedArrayItem={addNestedArrayItem}
        removeNestedArrayItem={removeNestedArrayItem}
        errors={errors}
        isRTL={isRTL}
      />
    ),
    event_judging: (
      <EventJudgingFields
        formData={formData}
        handleChange={handleChange}
        handleNestedChange={handleNestedChange}
        handleNestedArrayChange={handleNestedArrayChange}
        addNestedArrayItem={addNestedArrayItem}
        removeNestedArrayItem={removeNestedArrayItem}
        errors={errors}
        isRTL={isRTL}
      />
    ),
    hoof_trimmer: (
      <HoofTrimmerFields
        formData={formData}
        handleChange={handleChange}
        handleNestedChange={handleNestedChange}
        handleNestedArrayChange={handleNestedArrayChange}
        addNestedArrayItem={addNestedArrayItem}
        removeNestedArrayItem={removeNestedArrayItem}
        errors={errors}
        isRTL={isRTL}
      />
    ),
    horse_catering: (
      <HorseCateringFields
        formData={formData}
        handleChange={handleChange}
        handleNestedChange={handleNestedChange}
        handleNestedArrayChange={handleNestedArrayChange}
        addNestedArrayItem={addNestedArrayItem}
        removeNestedArrayItem={removeNestedArrayItem}
        errors={errors}
        isRTL={isRTL}
      />
    ),
    horse_grooming: (
      <HorseGroomingFields
        formData={formData}
        handleChange={handleChange}
        handleNestedChange={handleNestedChange}
        handleNestedArrayChange={handleNestedArrayChange}
        addNestedArrayItem={addNestedArrayItem}
        removeNestedArrayItem={removeNestedArrayItem}
        errors={errors}
        isRTL={isRTL}
      />
    ),
    horse_stable: (
      <HorseStableFields
        formData={formData}
        handleChange={handleChange}
        handleNestedChange={handleNestedChange}
        handleNestedArrayChange={handleNestedArrayChange}
        addNestedArrayItem={addNestedArrayItem}
        removeNestedArrayItem={removeNestedArrayItem}
        errors={errors}
        isRTL={isRTL}
      />
    ),
    horse_trainer: (
      <HorseTrainerFields
        formData={formData}
        handleChange={handleChange}
        handleNestedChange={handleNestedChange}
        handleNestedArrayChange={handleNestedArrayChange}
        addNestedArrayItem={addNestedArrayItem}
        removeNestedArrayItem={removeNestedArrayItem}
        errors={errors}
        isRTL={isRTL}
      />
    ),
    horse_transport: (
      <HorseTransportFields
        formData={formData}
        handleChange={handleChange}
        handleNestedChange={handleNestedChange}
        handleNestedArrayChange={handleNestedArrayChange}
        addNestedArrayItem={addNestedArrayItem}
        removeNestedArrayItem={removeNestedArrayItem}
        errors={errors}
        isRTL={isRTL}
      />
    ),
    housing: (
      <HousingFields
        formData={formData}
        handleChange={handleChange}
        handleNestedChange={handleNestedChange}
        handleNestedArrayChange={handleNestedArrayChange}
        addNestedArrayItem={addNestedArrayItem}
        removeNestedArrayItem={removeNestedArrayItem}
        errors={errors}
        isRTL={isRTL}
      />
    ),
    marketing_promotion: (
      <MarketingPromotionFields
        formData={formData}
        handleChange={handleChange}
        handleNestedChange={handleNestedChange}
        handleNestedArrayChange={handleNestedArrayChange}
        addNestedArrayItem={addNestedArrayItem}
        removeNestedArrayItem={removeNestedArrayItem}
        errors={errors}
        isRTL={isRTL}
      />
    ),
    photography_services: (
      <PhotographyServicesFields
        formData={formData}
        handleChange={handleChange}
        handleNestedChange={handleNestedChange}
        handleNestedArrayChange={handleNestedArrayChange}
        addNestedArrayItem={addNestedArrayItem}
        removeNestedArrayItem={removeNestedArrayItem}
        errors={errors}
        isRTL={isRTL}
      />
    ),
    trip_coordinator: (
      <TripCoordinatorFields
        formData={formData}
        handleChange={handleChange}
        handleNestedChange={handleNestedChange}
        handleNestedArrayChange={handleNestedArrayChange}
        addNestedArrayItem={addNestedArrayItem}
        removeNestedArrayItem={removeNestedArrayItem}
        errors={errors}
        isRTL={isRTL}
      />
    ),
    veterinary: (
      <VeterinaryFields
        formData={formData}
        handleChange={handleChange}
        handleNestedChange={handleNestedChange}
        handleNestedArrayChange={handleNestedArrayChange}
        addNestedArrayItem={addNestedArrayItem}
        removeNestedArrayItem={removeNestedArrayItem}
        errors={errors}
        isRTL={isRTL}
      />
    ),
    suppliers: (
      <SuppliersFields
        formData={formData}
        handleChange={handleChange}
        handleNestedChange={handleNestedChange}
        handleNestedArrayChange={handleNestedArrayChange}
        addNestedArrayItem={addNestedArrayItem}
        removeNestedArrayItem={removeNestedArrayItem}
        errors={errors}
        isRTL={isRTL}
      />
    ),
  };

  return serviceFieldsMap[serviceType] || null;
};

export default ServiceFieldsFactory;