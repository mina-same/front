
import { format } from "date-fns";
import { Separator } from "../../../components/ui new/separator";

const ReservationReview = ({ service, formData, totalPrice }) => {
  // Helper function to get service type label
  const getServiceTypeLabel = (type) => {
    const serviceTypesMap = {
      "horse_stable": "Horse Stable",
      "veterinary": "Veterinary Services",
      "competitions": "Horse Competitions",
      "housing": "Horse Housing",
      "horse_trainer": "Horse Trainer",
      "hoof_trimmer": "Hoof Trimmer",
      "horse_grooming": "Horse Grooming",
      "event_judging": "Event Judging",
      "marketing_promotion": "Marketing & Promotion",
      "event_commentary": "Event Commentary",
      "consulting_services": "Consulting Services",
      "photography_services": "Photography Services",
      "horse_transport": "Horse Transport",
      "contractors": "Contractors",
      "horse_catering": "Horse Catering",
      "trip_coordinator": "Trip Coordinator"
    };
    
    return serviceTypesMap[type] || type;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    
    try {
      return format(new Date(dateString), "PPP 'at' h:mm a");
    } catch (error) {
      return "Invalid date";
    }
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Review Your Reservation</h2>
        <p className="text-muted-foreground">
          Please review your reservation details before submitting
        </p>
      </div>
      
      <Section title="Service Information">
        <InfoRow label="Service Name" value={service.name_en} />
        <InfoRow label="Service Type" value={getServiceTypeLabel(service.service_type)} />
        <InfoRow label="Service Provider" value={service.provider?.name_en || "Unknown Provider"} />
        <InfoRow label="Base Price" value={`${service.price} SAR per ${service.priceUnit.replace(/_/g, ' ')}`} />
      </Section>
      
      <Section title="Reservation Details">
        {formData.startDate && (
          <InfoRow label="Start Date & Time" value={formatDate(formData.startDate)} />
        )}
        {formData.endDate && (
          <InfoRow label="End Date & Time" value={formatDate(formData.endDate)} />
        )}
        {formData.eventDate && (
          <InfoRow label="Event Date & Time" value={formatDate(formData.eventDate)} />
        )}
        
        {service.service_type === 'competitions' && (
          <InfoRow 
            label="Competition Type" 
            value={formData.eventDetails.competitionType === 'show_jumping' ? 'Show Jumping' :
                  formData.eventDetails.competitionType === 'dressage' ? 'Dressage' :
                  formData.eventDetails.competitionType === 'endurance' ? 'Endurance' :
                  formData.eventDetails.competitionType || 'Not specified'} 
          />
        )}
        
        {service.service_type === 'horse_stable' && formData.horses.length > 0 && (
          <InfoRow 
            label="Selected Horses" 
            value={formData.horses.map((h) => h.name).join(', ')} 
          />
        )}
        
        {['veterinary', 'horse_catering', 'horse_transport', 'hoof_trimmer', 'horse_grooming', 'horse_trainer'].includes(service.service_type) && formData.horse && (
          <InfoRow 
            label="Selected Horse" 
            value={formData.horse.name} 
          />
        )}
        
        {service.service_type === 'housing' && (
          <>
            <InfoRow 
              label="Number of Guests" 
              value={formData.housingDetails.numberOfGuests} 
            />
            <InfoRow 
              label="Accommodation Type" 
              value={formData.housingDetails.accommodationType === 'moving_housing' ? 'Moving Housing' :
                    formData.housingDetails.accommodationType === 'caravan' ? 'Caravan' :
                    formData.housingDetails.accommodationType === 'apartment' ? 'Apartment' :
                    formData.housingDetails.accommodationType || 'Not specified'} 
            />
          </>
        )}
        
        {service.service_type === 'horse_transport' && (
          <>
            <InfoRow 
              label="Start Location" 
              value={formData.locations.startLocation || 'Not specified'} 
            />
            <InfoRow 
              label="End Location" 
              value={formData.locations.endLocation || 'Not specified'} 
            />
          </>
        )}
        
        {['photography_services', 'consulting_services', 'marketing_promotion', 'event_commentary', 'event_judging', 'contractors'].includes(service.service_type) && (
          <InfoRow 
            label="Project Description" 
            value={formData.projectDetails.description || 'Not provided'} 
          />
        )}
        
        {formData.providedAddress && (
          <InfoRow 
            label="Service Address" 
            value={formData.providedAddress} 
          />
        )}
        
        {formData.notes && (
          <InfoRow 
            label="Additional Notes" 
            value={formData.notes} 
          />
        )}
      </Section>
      
      {formData.additionalBenefits.length > 0 && (
        <Section title="Additional Services">
          {formData.additionalBenefits.map((benefit, index) => (
            <div key={index} className="flex justify-between py-2">
              <span>{benefit.name_en}</span>
              <span className="font-medium">{benefit.additional_price.toFixed(2)} SAR</span>
            </div>
          ))}
        </Section>
      )}
      
      <Section title="Price Summary">
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
          <span className="text-lg font-semibold">Total Price:</span>
          <span className="text-2xl font-bold">{totalPrice.toFixed(2)} SAR</span>
        </div>
      </Section>
      
      <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
        <p className="text-sm text-yellow-800">
          By submitting this reservation, you agree to the terms and conditions of the service provider. 
          Your reservation will be pending until confirmed by the service provider.
        </p>
      </div>
    </div>
  );
};

const Section = ({title, children}) => (
  <div>
    <h3 className="font-semibold text-lg mb-3">{title}</h3>
    <div className="bg-gray-50 rounded-md p-4 space-y-3">
      {children}
    </div>
  </div>
);

const InfoRow = ({label, value}) => (
  <div>
    <div className="text-sm font-medium text-gray-500">{label}</div>
    <div className="mt-1">{value || <span className="text-muted-foreground text-sm">Not provided</span>}</div>
    <Separator className="mt-2" />
  </div>
);

export default ReservationReview;
