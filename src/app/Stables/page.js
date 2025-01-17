"use client";

import Layout from 'components/layout/Layout';
import React, { useState, useEffect } from 'react';
import { createClient } from '@sanity/client';


const client = createClient({
    projectId: '5dt0594k', // Replace with your project ID
    dataset: 'production', // Replace with your dataset name
    apiVersion: '2023-01-01', // Use the latest API version
    useCdn: false, // Set to true if you want to use the CDN
    token: process.env.SANITY_API_TOKEN, // Add your API token if required
});

const page = () => {
    const [countries, setCountries] = useState([]);
    const [governorates, setGovernorates] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedGovernorate, setSelectedGovernorate] = useState('');
    const [showPopup, setShowPopup] = useState(false);

    // Fetch countries
    useEffect(() => {
        client.fetch('*[_type == "country"]{_id, name_en}')
            .then(data => setCountries(data))
            .catch(error => console.error(error));
    }, []);

    // Fetch governorates based on selected country
    useEffect(() => {
        if (selectedCountry) {
            client.fetch(`*[_type == "governorate" && country._ref == $countryId]{_id, name_en}`, { countryId: selectedCountry })
                .then(data => setGovernorates(data))
                .catch(error => console.error(error));
        } else {
            setGovernorates([]);
        }
    }, [selectedCountry]);

    // Fetch cities based on selected governorate
    useEffect(() => {
        if (selectedGovernorate) {
            client.fetch(`*[_type == "city" && governorate._ref == $governorateId]{_id, name_en}`, { governorateId: selectedGovernorate })
                .then(data => setCities(data))
                .catch(error => console.error(error));
        } else {
            setCities([]);
        }
    }, [selectedGovernorate]);

    return (
        <>

            <div>
                <button
                    onClick={() => setShowPopup(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
                    Add Stable
                </button>
                {/* Popup Modal */}
                <div className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center ${showPopup ? 'block' : 'hidden'}`}>
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h2 className="text-xl font-semibold mb-4">Add Stable</h2>
                        <form>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Country</label>
                                <select
                                    value={selectedCountry}
                                    onChange={e => setSelectedCountry(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md">
                                    <option value="">Select Country</option>
                                    {countries.map(country => (
                                        <option key={country._id} value={country._id}>{country.name_en}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Governorate</label>
                                <select
                                    value={selectedGovernorate}
                                    onChange={e => setSelectedGovernorate(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    disabled={!selectedCountry}>
                                    <option value="">Select Governorate</option>
                                    {governorates.map(governorate => (
                                        <option key={governorate._id} value={governorate._id}>{governorate.name_en}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">City</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    disabled={!selectedGovernorate}>
                                    <option value="">Select City</option>
                                    {cities.map(city => (
                                        <option key={city._id} value={city._id}>{city.name_en}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
                                Submit
                            </button>
                        </form>
                        <button
                            onClick={() => setShowPopup(false)}
                            className="mt-4 text-red-500 hover:text-red-700">
                            Close
                        </button>
                    </div>
                </div>
            </div>

        </>
    )
}

export default page;
