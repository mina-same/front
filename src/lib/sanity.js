import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Initialize Sanity client
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-01-01',
  token: process.env.NEXT_PUBLIC_SANITY_API_TOKEN,
  useCdn: true,
});

// Initialize the image URL builder
const builder = imageUrlBuilder(client);

// Function to generate image URLs
export function urlFor(source) {
  return builder.image(source);
}

export async function fetchServices() {
  try {
    const services = await client.fetch(`*[_type == "services"] | order(_createdAt desc)`);
    return services;
  } catch (error) {
    console.error('Error fetching services:', error);
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
    const providersWithMainService = await client.fetch(
      `*[_type == "provider" && mainServiceRef._ref == $serviceId]`,
      { serviceId: id }
    );
    const providersWithAdditionalService = await client.fetch(
      `*[_type == "provider" && references($serviceId)]`,
      { serviceId: id }
    );
    const service = await client.fetch(
      `*[_type == "services" && _id == $id][0]`,
      { id }
    );

    console.log('Providers with this as main service:', providersWithMainService.length);
    console.log('Providers referencing this service:', providersWithAdditionalService.length);

    if (service && service.providerRef && service.providerRef._ref) {
      const providerReferences = await client.fetch(
        `*[_type == "services" && providerRef._ref == $providerId && _id != $serviceId]`,
        {
          providerId: service.providerRef._ref,
          serviceId: id
        }
      );

      console.log('Other services referencing the same provider:', providerReferences.length);

      if (providerReferences.length === 0) {
        try {
          await client
            .patch(id)
            .unset(['providerRef'])
            .commit();
          await client.delete(service.providerRef._ref);
          console.log('Deleted provider with ID:', service.providerRef._ref);
        } catch (error) {
          console.error('Error deleting provider:', error);
        }
      } else {
        for (const provider of providersWithMainService) {
          await client
            .patch(provider._id)
            .unset(['mainServiceRef'])
            .commit();
        }

        for (const provider of providersWithAdditionalService) {
          await client
            .patch(provider._id)
            .unset([`servicesRef[_ref=="${id}"]`])
            .commit();
        }

        await client
          .patch(id)
          .unset(['providerRef'])
          .commit();
      }
    }

    await client.delete(id);
    console.log('Successfully deleted service with ID:', id);

    return { success: true };
  } catch (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
}

async function createProvider(service, userId) {
  try {
    console.log('Creating provider');
    const provider = {
      _type: 'provider',
      name_ar: service.name_ar || 'Unnamed Provider',
      name_en: service.name_en || 'Unnamed Provider',
      userRef: userId ? { _type: 'reference', _ref: userId } : undefined, // Add userRef
    };

    if (!userId) {
      throw new Error('User ID is required to create a provider');
    }

    const createdProvider = await client.create(provider);
    console.log('Provider created with ID:', createdProvider._id);
    return createdProvider._id;
  } catch (error) {
    console.error('Error creating provider:', error);
    throw error;
  }
}

async function uploadMultipleImages(files) {
  try {
    console.log('Uploading multiple images:', files.length);
    const uploadedImages = await Promise.all(
      files.map(async (file, index) => {
        if (!file) return null;
        try {
          const fileBuffer = await file.arrayBuffer();
          const blob = new Blob([fileBuffer], { type: file.type });
          const uploadedAsset = await client.assets.upload('image', blob, {
            filename: file.name,
          });
          return {
            _type: 'image',
            _key: `image-${Date.now()}-${index}`,
            asset: {
              _type: 'reference',
              _ref: uploadedAsset._id,
            },
          };
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          return null;
        }
      })
    );
    return uploadedImages.filter((img) => img !== null);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    return [];
  }
}

async function uploadMultipleFiles(files) {
  try {
    console.log('Uploading multiple files:', files.length);
    const uploadedFiles = await Promise.all(
      files.map(async (file, index) => {
        if (!file) return null;
        try {
          const fileBuffer = await file.arrayBuffer();
          const blob = new Blob([fileBuffer], { type: file.type });
          const uploadedAsset = await client.assets.upload('file', blob, {
            filename: file.name,
          });
          return {
            _type: 'file',
            _key: `file-${Date.now()}-${index}`,
            asset: {
              _type: 'reference',
              _ref: uploadedAsset._id,
            },
          };
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          return null;
        }
      })
    );
    return uploadedFiles.filter((file) => file !== null);
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    return [];
  }
}

export function processServiceTypeDetails(details) {
  const processedDetails = { ...details };
  Object.keys(processedDetails).forEach((key) => {
    if (Array.isArray(processedDetails[key])) {
      processedDetails[key] = processedDetails[key].map((item, index) => {
        const processedItem = { ...item, _key: item._key || `item-${Date.now()}-${index}` };
        // Convert price to number for additionalServices
        if (key === 'additionalServices') {
          if (processedItem.price) processedItem.price = parseFloat(processedItem.price);
          if (processedItem.additional_price) processedItem.additional_price = parseFloat(processedItem.additional_price);
        }
        return processedItem;
      });
    }
  });
  return processedDetails;
}

function getMockCountries() {
  console.log('Returning mock countries');
  return [
    { _id: 'mock-country-1', name_en: 'Mock Country 1', name_ar: 'دولة وهمية 1' },
    { _id: 'mock-country-2', name_en: 'Mock Country 2', name_ar: 'دولة وهمية 2' },
  ];
}

function getMockGovernorates(countryId) {
  console.log('Returning mock governorates for country:', countryId);
  return [
    { _id: 'mock-gov-1', name_en: 'Mock Governorate 1', name_ar: 'محافظة وهمية 1' },
    { _id: 'mock-gov-2', name_en: 'Mock Governorate 2', name_ar: 'محافظة وهمية 2' },
  ];
}

function getMockCities(governorateId) {
  console.log('Returning mock cities for governorate:', governorateId);
  return [
    { _id: 'mock-city-1', name_en: 'Mock City 1', name_ar: 'مدينة وهمية 1' },
    { _id: 'mock-city-2', name_en: 'Mock City 2', name_ar: 'مدينة وهمية 2' },
  ];
}

export async function addService(service) {
  try {
    console.log('Beginning service submission process');

    // Validate serviceType
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

    if (!service.serviceType || !serviceTypeFieldMap[service.serviceType]) {
      console.error(`Invalid or missing serviceType: ${service.serviceType}`);
      return { success: false, error: 'Invalid service type' };
    }

    // Validate userId
    if (!service.userId) {
      console.error('Missing userId');
      return { success: false, error: 'User ID is required' };
    }

    // Verify user exists
    const userExists = await client.fetch(
      `*[_type == "user" && _id == $userId][0]`,
      { userId: service.userId }
    );
    if (!userExists) {
      console.error('User not found for userId:', service.userId);
      return { success: false, error: 'Invalid user ID' };
    }

    let additionalImages = [];
    let uploadedFiles = [];

    // Handle multiple images upload
    if (service.images && service.images.length > 0) {
      console.log('Uploading images');
      additionalImages = await uploadMultipleImages(service.images);
    }

    // Handle file uploads for certifications
    const serviceDetailKey = serviceTypeFieldMap[service.serviceType];
    if (serviceDetailKey && service.service_details[serviceDetailKey]) {
      const details = service.service_details[serviceDetailKey];
      if (details.certifications && Array.isArray(details.certifications)) {
        console.log('Uploading certification files');
        uploadedFiles = await uploadMultipleFiles(details.certifications);
      } else if (details.licensesAndCertificates && Array.isArray(details.licensesAndCertificates)) {
        console.log('Uploading license files');
        uploadedFiles = await uploadMultipleFiles(details.licensesAndCertificates);
      }
    }

    // Create a provider
    console.log('Creating provider');
    const providerId = await createProvider(service, service.userId);

    // Process the links array
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

    // Remove File objects and ensure numeric fields
    const serviceCopy = { ...service };
    delete serviceCopy.profile_image;
    delete serviceCopy.images;
    delete serviceCopy.additional_images;
    delete serviceCopy.userId;

    // Convert numeric fields in service_details
    if (serviceDetailKey && serviceCopy.service_details[serviceDetailKey]) {
      const details = serviceCopy.service_details[serviceDetailKey];
      if (details.maxLoad) details.maxLoad = parseInt(details.maxLoad);
      if (details.experienceYears) details.experienceYears = parseInt(details.experienceYears);
    }

    // Ensure references are properly formatted
    const country = serviceCopy.country ? { _type: 'reference', _ref: typeof serviceCopy.country === 'string' ? serviceCopy.country : serviceCopy.country._ref || serviceCopy.country } : undefined;
    const government = serviceCopy.governorate ? { _type: 'reference', _ref: typeof serviceCopy.governorate === 'string' ? serviceCopy.governorate : serviceCopy.governorate._ref || serviceCopy.governorate } : undefined;
    const city = serviceCopy.city ? { _type: 'reference', _ref: typeof serviceCopy.city === 'string' ? serviceCopy.city : serviceCopy.city._ref || serviceCopy.city } : undefined;

    // Create service document
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
      priceUnit: serviceCopy.priceUnit || "per_hour",
      serviceType: serviceCopy.serviceType,
      statusAdminApproved: false,
      serviceAverageRating: 0,
      serviceRatingCount: 0
    };

    // Add service management fields if present (already formatted as references if needed)
    if (service.serviceManagementType) {
      serviceDocument.serviceManagementType = service.serviceManagementType;
    }
    if (service.stableRef) {
      serviceDocument.stableRef = service.stableRef;
    }
    if (service.userRef) {
      serviceDocument.userRef = service.userRef;
    }
    if (service.associatedStables) {
      serviceDocument.associatedStables = service.associatedStables;
    }

    // Add images if available
    if (additionalImages.length > 0) {
      serviceDocument.images = additionalImages;
    }

    // Add service-specific details
    if (serviceDetailKey && serviceCopy.service_details[serviceDetailKey]) {
      console.log(`Adding ${serviceDetailKey} details:`, serviceCopy.service_details[serviceDetailKey]);
      const processedDetails = processServiceTypeDetails(serviceCopy.service_details[serviceDetailKey]);
      if (uploadedFiles.length > 0) {
        processedDetails.certifications = uploadedFiles;
      }
      serviceDocument[serviceDetailKey] = processedDetails;
    }

    console.log('Preparing service document for submission');
    console.log('Document structure:', JSON.stringify(serviceDocument, null, 2));

    // Create the service
    const createdService = await client.create(serviceDocument);
    console.log('Service created successfully with ID:', createdService._id);

    // Update the provider
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


export async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user, book, orderDate, status, price, paymentStatus } = req.body;

  if (!user || !book || !orderDate || !status || !price || !paymentStatus) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const order = {
      _type: "orderBook",
      user: { _type: "reference", _ref: user._ref },
      book: { _type: "reference", _ref: book._ref },
      orderDate,
      status,
      price,
      paymentStatus,
    };

    const result = await client.create(order);
    return res.status(200).json({ orderId: result._id });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ error: "Failed to create order" });
  }
}

export default client;  