
import { createClient } from "@sanity/client";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-01-01',
  token: process.env.NEXT_PUBLIC_SANITY_API_TOKEN, // Optional if you need to authenticate
  useCdn: true, // Use CDN in production for faster queries
});

// Fetch all services
export const fetchServices = async () => {
  try {
    const services = await client.fetch(
      `*[_type == "services"]{
        _id,
        name_en,
        name_ar,
        service_type,
        price,
        priceUnit,
        service_details,
        "provider": provider->{_id, name_en, name_ar}
      }`
    );
    return services;
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
};

// Fetch user's horses (assuming the user is authenticated)
export const fetchUserHorses = async (userId) => {
  try {
    const horses = await client.fetch(
      `*[_type == "horse" && owner._ref == $userId]{
        _id,
        name,
        age,
        breed,
        color
      }`,
      { userId }
    );
    return horses;
  } catch (error) {
    console.error("Error fetching user horses:", error);
    return [];
  }
};

// Fetch journeys for trip coordinator service
export const fetchJourneys = async () => {
  try {
    const journeys = await client.fetch(
      `*[_type == "journey"]{
        _id,
        name,
        description,
        startLocation,
        endLocation,
        duration
      }`
    );
    return journeys;
  } catch (error) {
    console.error("Error fetching journeys:", error);
    return [];
  }
};

// Utility function to format date objects for Sanity
export const formatDateForSanity = (date) => {
  return date.toISOString();
};

// Calculate price based on service, time duration, and additional benefits
export const calculatePrice = (
  basePrice,
  priceUnit,
  startDate,
  endDate,
  additionalBenefits = []
) => {
  let totalPrice = basePrice;
  
  // Add up all additional benefits prices
  const additionalPrice = additionalBenefits.reduce(
    (sum, benefit) => sum + (benefit.additional_price || 0),
    0
  );
  
  totalPrice += additionalPrice;
  
  // Calculate duration-based pricing
  if (startDate && endDate && ['per_hour', 'per_half_hour', 'per_day'].includes(priceUnit)) {
    const durationMs = endDate.getTime() - startDate.getTime();
    
    if (priceUnit === 'per_hour') {
      // Duration in hours
      const hours = Math.ceil(durationMs / (1000 * 60 * 60));
      totalPrice *= hours;
    } else if (priceUnit === 'per_half_hour') {
      // Duration in half hours
      const halfHours = Math.ceil(durationMs / (1000 * 60 * 30));
      totalPrice *= halfHours;
    } else if (priceUnit === 'per_day') {
      // Duration in days (rounded up)
      const days = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
      totalPrice *= days;
    }
  }
  
  return totalPrice;
};

// Submit reservation to Sanity
export const submitReservation = async (reservationData) => {
  try {
    const result = await client.create({
      _type: "reservation",
      ...reservationData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "pending",
      paymentStatus: "pending"
    });
    
    return { success: true, data: result };
  } catch (error) {
    console.error("Error submitting reservation:", error);
    return { success: false, error };
  }
};
