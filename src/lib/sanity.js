import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Initialize Sanity client
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-01-01',
  token: process.env.NEXT_PUBLIC_SANITY_API_TOKEN, // Optional if you need to authenticate
  useCdn: true, // Use CDN in production for faster queries
});

// Initialize the image URL builder
const builder = imageUrlBuilder(client);

// Function to generate image URLsw
export function urlFor(source) {
  return builder.image(source);
}
export async function fetchServices() {
  try {
    const services = await client.fetch(`*[_type == "services"] | order(_createdAt desc)`);
    return services;
  } catch (error) {
    console.error('Error fetching services:', error);
    // Return empty array for network errors to gracefully handle the situation
    return [];
  }
}

export async function fetchCountries() {
  try {
    const countries = await client.fetch(`*[_type == "country"]{ _id, name_en, name_ar }`);
    console.log('Fetched countries:', countries);
    return countries.length > 0 ? countries : getMockCountries();
  } catch (error) {
    console.error('Error fetching countries:', error);
    return getMockCountries();
  }
}

export async function fetchGovernorates(countryId) {
  try {
    console.log('Fetching governorates for country ID:', countryId);
    
    // Query governorates where the country reference matches the selected country ID
    const governorates = await client.fetch(
      `*[_type == "governorate" && country._ref == $countryId]{ _id, name_en, name_ar }`,
      { countryId }
    );
    
    console.log('Fetched governorates:', governorates);
    return governorates.length > 0 ? governorates : getMockGovernorates(countryId);
  } catch (error) {
    console.error('Error fetching governorates:', error);
    return getMockGovernorates(countryId);
  }
}

export async function fetchCities(governorateId) {
  try {
    console.log('Fetching cities for governorate ID:', governorateId);
    
    // Query cities where the governorate reference matches the selected governorate ID
    const cities = await client.fetch(
      `*[_type == "city" && governorate._ref == $governorateId]{ _id, name_en, name_ar }`,
      { governorateId }
    );
    
    console.log('Fetched cities:', cities);
    return cities.length > 0 ? cities : getMockCities(governorateId);
  } catch (error) {
    console.error('Error fetching cities:', error);
    return getMockCities(governorateId);
  }
}

export async function fetchService(id) {
  try {
    const service = await client.fetch(
      `*[_type == "services" && _id == $id][0]{
        ...,
        country->{name_ar, name_en},
        government->{name_ar, name_en},
        city->{name_ar, name_en}
      }`,
      { id }
    );
    return service;
  } catch (error) {
    console.error("Error fetching service:", error);
    throw error;
  }
}

export async function deleteService(id) {
  try {
    console.log('Attempting to delete service with ID:', id);
    
    // Check if this is a main service for any provider
    const providersWithMainService = await client.fetch(
      `*[_type == "provider" && mainServiceRef._ref == $serviceId]`,
      { serviceId: id }
    );
    
    // Check if this service is referenced as an additional service
    const providersWithAdditionalService = await client.fetch(
      `*[_type == "provider" && references($serviceId)]`,
      { serviceId: id }
    );
    
    // Check if this service references a provider (circular reference)
    const service = await client.fetch(
      `*[_type == "services" && _id == $id][0]`,
      { id }
    );
    
    console.log('Providers with this as main service:', providersWithMainService.length);
    console.log('Providers referencing this service:', providersWithAdditionalService.length);
    
    // Handle circular reference case
    if (service && service.providerRef && service.providerRef._ref) {
      const providerReferences = await client.fetch(
        `*[_type == "services" && providerRef._ref == $providerId && _id != $serviceId]`,
        { 
          providerId: service.providerRef._ref,
          serviceId: id
        }
      );
      
      console.log('Other services referencing the same provider:', providerReferences.length);
      
      // If no other services reference this provider, we can delete the provider
      if (providerReferences.length === 0) {
        try {
          // First remove reference to provider in the service to break circular reference
          await client
            .patch(id)
            .unset(['providerRef'])
            .commit();
            
          // Now we can delete the provider
          await client.delete(service.providerRef._ref);
          console.log('Deleted provider with ID:', service.providerRef._ref);
        } catch (error) {
          console.error('Error deleting provider:', error);
        }
      } else {
        // If other services reference this provider, we need to handle more carefully
        // First remove the mainServiceRef if it points to our service
        for (const provider of providersWithMainService) {
          await client
            .patch(provider._id)
            .unset(['mainServiceRef'])
            .commit();
        }
        
        // Remove any references to this service in servicesRef arrays
        for (const provider of providersWithAdditionalService) {
          await client
            .patch(provider._id)
            .unset([`servicesRef[_ref=="${id}"]`])
            .commit();
        }
        
        // And remove the providerRef in this service
        await client
          .patch(id)
          .unset(['providerRef'])
          .commit();
      }
    }
    
    // Now that we've handled all references, we can safely delete the service
    await client.delete(id);
    console.log('Successfully deleted service with ID:', id);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
}

export async function uploadImage(file) {
  if (!file) return null;
  
  try {
    console.log('Uploading image:', file.name);
    
    // Handle file conversion safely
    let blob;
    try {
      // Try using arrayBuffer first
      const fileBuffer = await file.arrayBuffer();
      blob = new Blob([fileBuffer], { type: file.type });
    } catch (bufferError) {
      console.log('ArrayBuffer conversion failed, trying alternative method:', bufferError);
      // Fallback to direct blob if available
      if (file instanceof Blob) {
        blob = file;
      } else {
        throw new Error('Could not convert file to buffer or blob');
      }
    }
    
    // Upload the image to Sanity with explicit content type
    const asset = await client.assets.upload('image', blob, {
      filename: file.name
    });
    
    console.log('Image uploaded successfully:', asset._id);
    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id
      }
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

export async function uploadMultipleImages(files) {
  if (!files || files.length === 0) return [];
  
  try {
    console.log(`Uploading ${files.length} images`);
    
    // Process each file with better error handling
    const uploadPromises = files.map(async (file, index) => {
      try {
        const result = await uploadImage(file);
        if (result) {
          // Add _key property to each image reference
          return {
            ...result,
            _key: `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
          };
        }
        return null;
      } catch (fileError) {
        // Log error but continue with other files
        console.error(`Error uploading image ${index + 1}:`, fileError);
        return null;
      }
    });
    
    const results = await Promise.all(uploadPromises);
    const validResults = results.filter(Boolean); // Filter out any nulls
    
    console.log(`Multiple images uploaded successfully: ${validResults.length} of ${files.length}`);
    return validResults;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw new Error(`Failed to upload images: ${error.message}`);
  }
}

export async function createProvider(service) {
  try {
    console.log('Creating provider with data:', { name_ar: service.name_ar, name_en: service.name_en });
    // Create a basic provider document
    const providerDoc = {
      _type: 'provider',
      name_ar: service.name_ar,
      name_en: service.name_en,
    };

    const result = await client.create(providerDoc);
    console.log('Provider created with ID:', result._id);
    return result._id;
  } catch (error) {
    console.error('Error creating provider:', error);
    throw new Error(`Failed to create provider: ${error.message}`);
  }
}

export async function addService(service) {
  try {
    console.log('Beginning service submission process');
    
    let additionalImages = [];
    
    // Handle multiple images upload if there are images
    if (service.images && service.images.length > 0) {
      try {
        console.log('Uploading images');
        additionalImages = await uploadMultipleImages(service.images);
      } catch (imagesError) {
        console.error('Images upload failed but continuing with service creation:', imagesError);
      }
    }
    
    // Create a provider first
    console.log('Creating provider');
    const providerId = await createProvider(service);
    
    // Process the links array to ensure it has the correct format for Sanity
    let formattedLinks = [];
    if (service.links && Array.isArray(service.links)) {
      formattedLinks = service.links
        .filter(link => link.url && link.url.trim() !== '')
        .map(link => ({
          ...link,
          _type: 'object',
          _key: `link-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        }));
    }
    
    // Remove the File objects as they can't be serialized
    const serviceCopy = { ...service };
    delete serviceCopy.profile_image;
    delete serviceCopy.images;
    delete serviceCopy.additional_images;
    
    // Ensure country, governorate and city are proper references - making sure _ref is a direct string
    const country = serviceCopy.country ? { _type: 'reference', _ref: typeof serviceCopy.country === 'string' ? serviceCopy.country : serviceCopy.country._ref || serviceCopy.country } : undefined;
    const government = serviceCopy.governorate ? { _type: 'reference', _ref: typeof serviceCopy.governorate === 'string' ? serviceCopy.governorate : serviceCopy.governorate._ref || serviceCopy.governorate } : undefined;
    const city = serviceCopy.city ? { _type: 'reference', _ref: typeof serviceCopy.city === 'string' ? serviceCopy.city : serviceCopy.city._ref || serviceCopy.city } : undefined;
    
    // Map service type to the corresponding field name in the schema
    const serviceTypeFieldMap = {
      horse_stable: "horseStabelDetails",
      veterinary: "VeterinaryDetails",
      competitions: "competitions",
      housing: "housingDetails",
      horse_trainer: "horseTrainerDetails",
      hoof_trimmer: "hoofTrimmerDetails",
      horse_grooming: "horseGroomingDetails",
      event_judging: "eventJudgingDetails",
      marketing_promotion: "marketingPromotionDetails",
      event_commentary: "eventCommentaryDetails",
      consulting_services: "consultingServicesDetails",
      photography_services: "photographyServicesDetails",
      horse_transport: "transportDetails",
      contractors: "contractorsDetails",
      horse_catering: "horseCateringDetails",
      trip_coordinator: "tripCoordinator",
      suppliers: "supplierDetails"
    };

    // Create service document structure
    let serviceDocument = {
      _type: 'services',
      name_ar: serviceCopy.name_ar,
      name_en: serviceCopy.name_en,
      years_of_experience: parseInt(serviceCopy.years_of_experience) || 0,
      about_ar: serviceCopy.about_ar || "",
      about_en: serviceCopy.about_en || "",
      past_experience_ar: serviceCopy.past_experience_ar || "",
      past_experience_en: serviceCopy.past_experience_en || "",
      servicePhone: serviceCopy.servicePhone || "",
      serviceEmail: serviceCopy.serviceEmail || "",
      country: country,
      government: government,
      city: city,
      address_details: serviceCopy.address_details || "",
      address_link: serviceCopy.address_link || "",
      links: formattedLinks,
      price: serviceCopy.price ? parseFloat(serviceCopy.price) : 0,
      priceUnit: serviceCopy.priceUnit || "per_hour", // Use one of the allowed values from the schema
      serviceType: serviceCopy.service_type,
      statusAdminApproved: false,
      isMainService: true,
      serviceAverageRating: 0,
      serviceRatingCount: 0,
      providerRef: {
        _type: 'reference',
        _ref: providerId
      }
    };

    // Add images if available
    if (additionalImages.length > 0) {
      serviceDocument.images = additionalImages;
    }

    // Add service-specific details if they exist
    const detailsFieldName = serviceTypeFieldMap[serviceCopy.service_type];
    
    if (detailsFieldName && serviceCopy.service_details) {
      // For direct access to service details of the specific type
      const serviceTypeDetails = serviceCopy.service_details[serviceCopy.service_type];
      
      if (serviceTypeDetails) {
        console.log(`Adding ${detailsFieldName} details:`, serviceTypeDetails);
        
        // Process any arrays to ensure they have _key properties
        const processedDetails = processServiceTypeDetails(serviceTypeDetails);
        
        // Add the processed details to the service document
        serviceDocument[detailsFieldName] = processedDetails;
      }
    }

    console.log('Preparing service document for submission');
    console.log('Document structure:', JSON.stringify(serviceDocument, null, 2));

    // Create the service
    const createdService = await client.create(serviceDocument);
    console.log('Service created successfully with ID:', createdService._id);
    
    // Update the provider with only the mainServiceRef
    console.log('Updating provider with main service reference');
    await client.patch(providerId)
      .set({ 
        mainServiceRef: {
          _type: 'reference',
          _ref: createdService._id
        }
      })
      .commit();
    
    console.log('Service submission process completed successfully');
    return { success: true, data: createdService };
  } catch (error) {
    console.error('Error adding service:', error);
    return { success: false, error: error.message || 'Failed to add service' };
  }
}

// Helper function to process service type details and ensure valid structure for Sanity
function processServiceTypeDetails(details) {
  if (!details || typeof details !== 'object') {
    return details;
  }
  
  // Clone to avoid modifying the original object
  const processed = { ...details };
  
  // Process each key in the object
  Object.keys(processed).forEach(key => {
    const value = processed[key];
    
    // Handle arrays - ensure each item has a _key
    if (Array.isArray(value)) {
      processed[key] = value.map((item, index) => {
        if (typeof item === 'object' && item !== null) {
          // Process nested objects
          const processedItem = processServiceTypeDetails(item);
          
          // Add _key if it doesn't exist
          if (!processedItem._key) {
            return {
              ...processedItem,
              _key: `item-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}`
            };
          }
          return processedItem;
        }
        // For primitive values in arrays, wrap them in objects with _key
        if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
          return {
            _key: `val-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}`,
            value: item
          };
        }
        return item;
      });
    } 
    // Process nested objects
    else if (typeof value === 'object' && value !== null) {
      processed[key] = processServiceTypeDetails(value);
    }
  });
  
  return processed;
}

function getMockCountries() {
  return [
    { _id: "country_id_1", name_en: "Saudi Arabia", name_ar: "المملكة العربية السعودية" },
    { _id: "country_id_2", name_en: "United Arab Emirates", name_ar: "الإمارات العربية المتحدة" },
    { _id: "country_id_3", name_en: "Kuwait", name_ar: "الكويت" },
    { _id: "country_id_4", name_en: "Bahrain", name_ar: "البحرين" },
    { _id: "country_id_5", name_en: "Oman", name_ar: "عُمان" },
    { _id: "country_id_6", name_en: "Qatar", name_ar: "قطر" },
    { _id: "country_id_7", name_en: "Egypt", name_ar: "مصر" }
  ];
}

function getMockGovernorates(countryId) {
  console.log('Getting mock governorates for country ID:', countryId);
  
  const allMockGovernorates = [
    // Saudi Arabia (country_id_1)
    { _id: 'governorate_id_1', name_en: 'Riyadh', name_ar: 'الرياض', country_id: 'country_id_1' },
    { _id: 'governorate_id_2', name_en: 'Makkah', name_ar: 'مكة المكرمة', country_id: 'country_id_1' },
    { _id: 'governorate_id_3', name_en: 'Medina', name_ar: 'المدينة المنورة', country_id: 'country_id_1' },
    { _id: 'governorate_id_4', name_en: 'Eastern Province', name_ar: 'الشرقية', country_id: 'country_id_1' },
    { _id: 'governorate_id_5', name_en: 'Tabuk', name_ar: 'تبوك', country_id: 'country_id_1' },
    { _id: 'governorate_id_6', name_en: 'Asir', name_ar: 'عسير', country_id: 'country_id_1' },
    { _id: 'governorate_id_7', name_en: 'Najran', name_ar: 'نجران', country_id: 'country_id_1' },
    { _id: 'governorate_id_8', name_en: 'Jazan', name_ar: 'جازان', country_id: 'country_id_1' },
    { _id: 'governorate_id_9', name_en: 'Al-Baha', name_ar: 'الباحة', country_id: 'country_id_1' },
    { _id: 'governorate_id_10', name_en: 'Hail', name_ar: 'حائل', country_id: 'country_id_1' },
    { _id: 'governorate_id_11', name_en: 'Northern Borders', name_ar: 'الحدود الشمالية', country_id: 'country_id_1' },
    { _id: 'governorate_id_12', name_en: 'Al-Jouf', name_ar: 'الجوف', country_id: 'country_id_1' },
    
    // UAE (country_id_2)
    { _id: 'governorate_id_13', name_en: 'Abu Dhabi', name_ar: 'أبو ظبي', country_id: 'country_id_2' },
    { _id: 'governorate_id_14', name_en: 'Dubai', name_ar: 'دبي', country_id: 'country_id_2' },
    { _id: 'governorate_id_15', name_en: 'Sharjah', name_ar: 'الشارقة', country_id: 'country_id_2' },
    { _id: 'governorate_id_16', name_en: 'Ajman', name_ar: 'عجمان', country_id: 'country_id_2' },
    { _id: 'governorate_id_17', name_en: 'Umm Al Quwain', name_ar: 'أم القيوين', country_id: 'country_id_2' },
    { _id: 'governorate_id_18', name_en: 'Ras Al Khaimah', name_ar: 'رأس الخيمة', country_id: 'country_id_2' },
    { _id: 'governorate_id_19', name_en: 'Fujairah', name_ar: 'الفجيرة', country_id: 'country_id_2' },
    
    // Kuwait (country_id_3)
    { _id: 'governorate_id_20', name_en: 'Al Ahmadi', name_ar: 'الأحمدي', country_id: 'country_id_3' },
    { _id: 'governorate_id_21', name_en: 'Al Farwaniyah', name_ar: 'الفروانية', country_id: 'country_id_3' },
    { _id: 'governorate_id_22', name_en: 'Al Jahra', name_ar: 'الجهراء', country_id: 'country_id_3' },
    { _id: 'governorate_id_23', name_en: 'Capital', name_ar: 'العاصمة', country_id: 'country_id_3' },
    { _id: 'governorate_id_24', name_en: 'Hawalli', name_ar: 'حولي', country_id: 'country_id_3' },
    { _id: 'governorate_id_25', name_en: 'Mubarak Al-Kabeer', name_ar: 'مبارك الكبير', country_id: 'country_id_3' },
    
    // Egypt (country_id_7)
    { _id: 'governorate_id_26', name_en: 'Cairo', name_ar: 'القاهرة', country_id: 'country_id_7' },
    { _id: 'governorate_id_27', name_en: 'Alexandria', name_ar: 'الإسكندرية', country_id: 'country_id_7' },
    { _id: 'governorate_id_28', name_en: 'Luxor', name_ar: 'الأقصر', country_id: 'country_id_7' }
  ];
}

function getMockCities(governorateId) {
  const allMockCities = [
    // Riyadh (governorate_id_1)
    { _id: 'city_id_1', name_en: 'Riyadh City', name_ar: 'مدينة الرياض', governorate_id: 'governorate_id_1' },
    { _id: 'city_id_2', name_en: 'Al Kharj', name_ar: 'الخرج', governorate_id: 'governorate_id_1' },
    { _id: 'city_id_3', name_en: 'Diriyah', name_ar: 'الدرعية', governorate_id: 'governorate_id_1' },
    
    // Makkah (governorate_id_2)
    { _id: 'city_id_4', name_en: 'Mecca', name_ar: 'مكة', governorate_id: 'governorate_id_2' },
    { _id: 'city_id_5', name_en: 'Jeddah', name_ar: 'جدة', governorate_id: 'governorate_id_2' },
    { _id: 'city_id_6', name_en: 'Taif', name_ar: 'الطائف', governorate_id: 'governorate_id_2' },
    
    // Dubai (governorate_id_14)
    { _id: 'city_id_7', name_en: 'Dubai Downtown', name_ar: 'وسط دبي', governorate_id: 'governorate_id_14' },
    { _id: 'city_id_8', name_en: 'Jumeirah', name_ar: 'جميرا', governorate_id: 'governorate_id_14' },
    { _id: 'city_id_9', name_en: 'Deira', name_ar: 'ديرة', governorate_id: 'governorate_id_14' },
    
    // Abu Dhabi (governorate_id_13)
    { _id: 'city_id_10', name_en: 'Abu Dhabi Island', name_ar: 'جزيرة أبو ظبي', governorate_id: 'governorate_id_13' },
    { _id: 'city_id_11', name_en: 'Al Ain', name_ar: 'العين', governorate_id: 'governorate_id_13' },
    
    // Cairo (governorate_id_26)
    { _id: 'city_id_12', name_en: 'Downtown', name_ar: 'وسط البلد', governorate_id: 'governorate_id_26' },
    { _id: 'city_id_13', name_en: 'Nasr City', name_ar: 'مدينة نصر', governorate_id: 'governorate_id_26' },
    { _id: 'city_id_14', name_en: 'Maadi', name_ar: 'المعادي', governorate_id: 'governorate_id_26' },
    
    // Alexandria (governorate_id_27)
    { _id: 'city_id_15', name_en: 'Montaza', name_ar: 'المنتزه', governorate_id: 'governorate_id_27' },
    { _id: 'city_id_16', name_en: 'Stanley', name_ar: 'ستانلي', governorate_id: 'governorate_id_27' }
  ];
  
  return allMockCities.filter(city => city.governorate_id === governorateId);
}

export default client;
