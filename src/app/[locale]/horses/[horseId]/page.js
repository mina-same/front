"use client";

import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Share2, FileText, Award, Heart, MessageSquare, Calendar, MapPin, Clock, Info, Shield, Dna, Clipboard, Download } from 'lucide-react';
import Layout from 'components/layout/Layout';
import { client, urlFor } from '../../../../lib/sanity';
import { useParams } from 'next/navigation';
import jsPDF from "jspdf";
import "jspdf-autotable";
import html2pdf from 'html2pdf.js';

const HorseProfilePage = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isFavorite, setIsFavorite] = useState(false);
    const [horseData, setHorseData] = useState(null);
    const [ownerData, setOwnerData] = useState(null);
    const [similarHorses, setSimilarHorses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [showContact, setShowContact] = useState(false);
    const [showReservationPopup, setShowReservationPopup] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null); // State for current user's ID
    const { horseId } = useParams();

    const horseQuery = `*[_type == "horse" && _id == $horseId][0] {
        fullName,
        breed,
        birthDate,
        gender,
        images,
        mainColor,
        additionalColors,
        distinctiveMark,
        electronicChipNumber,
        fatherRegistrationNumber,
        motherRegistrationNumber,
        lineageDetailsArabic,
        lineageDetailsEnglish,
        achievements,
        horseActivities[] { activity, level },
        listingPurpose,
        marketValue,
        passportNumber,
        passportImage,
        nationalID,
        insurancePolicyNumber,
        insuranceEndDate,
        healthCertificates,
        vaccinationCertificates,
        geneticAnalysis,
        ownershipCertificate,
        internationalTransportPermit,
        "owner": owner->{
            _id,
            fullName,
            userName,
            email,
            phoneNumber,
            image
        }
    }`;

    const similarHorsesQuery = `*[_type == "horse" && breed == $breed && _id != $horseId] {
        _id,
        fullName,
        breed,
        images
    }`;

    // Fetch horse data and current user ID on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch horse data
                const horse = await client.fetch(horseQuery, { horseId });
                console.log('Horse data:', horse);
                setHorseData(horse);
                console.log("owner", horse?.owner)
                if (horse?.owner) setOwnerData(horse.owner);
                if (horse?.breed) {
                    const similar = await client.fetch(similarHorsesQuery, { breed: horse.breed, horseId });
                    setSimilarHorses(similar);
                }

                // Fetch current user ID from /api/auth/verify
                const response = await fetch('/api/auth/verify', {
                    method: 'GET',
                    credentials: 'include', // Ensures cookies are sent
                    headers: {
                        'Content-Type': 'application/json', // Optional, but good practice
                    },
                });

                if (!response.ok) {
                    throw new Error(`Verify API failed with status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Verify API response:', data); // Debug the full response

                if (data.authenticated) {
                    const userId = data.userId || data.user?.id || data.user?.userId;
                    if (userId) {
                        console.log('Extracted userId:', userId); // Debug the userId
                        setCurrentUserId(userId);
                    } else {
                        console.warn('Authenticated, but no userId found in response:', data);
                    }
                } else {
                    console.warn('User not authenticated:', data.message || data.error);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error.message);
                setLoading(false);
            }
        };

        if (horseId) fetchData();
    }, [horseId]);

    const images = horseData?.images ? horseData.images.map(image => urlFor(image).url()) : [];

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const getBreedName = (breedValue) => {
        const breedMap = {
            "purebredArabian": "Purebred Arabian",
            "tibetanPony": "Tibetan Pony",
            "mongolianHorse": "Mongolian Horse",
            "andalusian": "Andalusian",
            "friesian": "Friesian",
            "hungarianHorse": "Hungarian Horse",
            "bulgarianHorse": "Bulgarian Horse",
            "uzbekHorse": "Uzbek Horse",
            "afghanHorse": "Afghan Horse",
            "turkishHorse": "Turkish Horse",
            "persianHorse": "Persian Horse",
            "kurdishHorse": "Kurdish Horse",
            "armenianHorse": "Armenian Horse",
            "georgianHorse": "Georgian Horse",
            "abkhazianHorse": "Abkhazian Horse",
            "altaiHorse": "Altai Horse",
            "bashkirHorse": "Bashkir Horse",
            "tatarHorse": "Tatar Horse",
            "kyrgyzHorse": "Kyrgyz Horse",
            "tajikHorse": "Tajik Horse",
            "turkmenHorse": "Turkmen Horse",
            "karakalpakUzbekHorse": "Karakalpak Uzbek Horse",
            "kazakhHorse": "Kazakh Horse",
            "donHorse": "Don Horse",
            "kubanHorse": "Kuban Horse",
            "belarusianHorse": "Belarusian Horse",
            "ukrainianHorse": "Ukrainian Horse",
            "polishHorse": "Polish Horse",
            "czechHorse": "Czech Horse",
            "slovakHorse": "Slovak Horse",
            "hungarianHorse2": "Hungarian Horse",
            "romanianHorse": "Romanian Horse",
            "shaggyBulgarianHorse": "Shaggy Bulgarian Horse",
            "greekHorse": "Greek Horse",
            "anatolianHorse": "Anatolian Horse",
            "persianBlueHorse": "Persian Blue Horse",
            "hazaragiHorse": "Hazaragi Horse",
            "pashtunHorse": "Pashtun Horse",
            "marwari": "Marwari",
            "nepalesePony": "Nepalese Pony",
            "bhutanesePony": "Bhutanese Pony",
            "thaiPony": "Thai Pony",
            "cambodianPony": "Cambodian Pony",
            "vietnamesePony": "Vietnamese Pony",
            "laotianPony": "Laotian Pony",
            "burmesePony": "Burmese Pony",
            "manchuHorse": "Manchu Horse",
            "kisoHorse": "Kiso Horse",
            "koreanHorse": "Korean Horse",
            "bayankhongorMongolianHorse": "Bayankhongor Mongolian Horse",
            "khentiiMongolianHorse": "Khentii Mongolian Horse",
            "tibetanPony2": "Tibetan Pony",
            "nepalesePony2": "Nepalese Pony",
            "bhutanesePony2": "Bhutanese Pony",
            "thaiPony2": "Thai Pony",
            "cambodianPony2": "Cambodian Pony",
            "vietnamesePony2": "Vietnamese Pony",
            "laotianPony2": "Laotian Pony",
            "burmesePony2": "Burmese Pony",
            "manchuHorse2": "Manchu Horse",
            "kisoHorse2": "Kiso Horse",
            "koreanHorse2": "Korean Horse",
            "bayankhongorMongolianHorse2": "Bayankhongor Mongolian Horse",
            "khentiiMongolianHorse2": "Khentii Mongolian Horse",
            "tibetanPony3": "Tibetan Pony",
            "nepalesePony3": "Nepalese Pony",
            "bhutanesePony3": "Bhutanese Pony",
            "thaiPony3": "Thai Pony",
            "cambodianPony3": "Cambodian Pony",
            "vietnamesePony3": "Vietnamese Pony",
            "laotianPony3": "Laotian Pony",
            "burmesePony3": "Burmese Pony",
            "manchuHorse3": "Manchu Horse",
            "kisoHorse3": "Kiso Horse",
            "koreanHorse3": "Korean Horse",
            "arabian": "Arabian",
            "spanishAndalusian": "Spanish Andalusian",
            "thoroughbred": "Thoroughbred",
            "frenchHorse": "French Horse",
            "germanHorse": "German Horse",
            "italianHorse": "Italian Horse",
            "belgianDraft": "Belgian Draft",
            "dutchHorse": "Dutch Horse",
            "danishHorse": "Danish Horse",
            "norwegianFjord": "Norwegian Fjord",
            "swedishHorse": "Swedish Horse",
            "finnhorse": "Finnhorse",
            "estonianHorse": "Estonian Horse",
            "latvianHorse": "Latvian Horse",
            "lithuanianHorse": "Lithuanian Horse",
            "konik": "Konik",
            "donHorse2": "Don Horse",
            "kubanHorse2": "Kuban Horse",
            "ukrainianHorse2": "Ukrainian Horse",
            "belarusianHorse2": "Belarusian Horse"
        };
        return breedMap[breedValue] || breedValue;
    };

    const getColorName = (colorValue) => {
        const colorMap = {
            "grey": "Grey / White",
            "black": "Black",
            "bay": "Bay",
            "chestnut": "Chestnut",
            "dappleGrey": "Dapple Grey",
            "silverDapple": "Silver Dapple",
        };
        return colorMap[colorValue] || colorValue;
    };

    const getActivityName = (activityValue) => {
        const activityMap = {
            "shortRace": "Short Race",
            "enduranceRace": "Endurance Race",
            "jumping": "Jumping",
            "training": "Training",
            "beautyAndShow": "Beauty and Show Competition",
        };
        return activityMap[activityValue] || activityValue;
    };

    const getLevelName = (levelValue) => {
        const levelMap = {
            "beginner": "Beginner",
            "intermediate": "Intermediate",
            "advanced": "Advanced",
        };
        return levelMap[levelValue] || levelValue;
    };

    const getPurposeName = (purposeValue) => {
        const purposeMap = {
            "sale": "For Sale",
            "rent": "For Rent",
            "training": "For Training",
            "personalUse": "Personal Use",
        };
        return purposeMap[purposeValue] || purposeValue;
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `Horse Profile: ${horseData.fullName}`,
                text: `Check out this ${getBreedName(horseData.breed)} horse: ${horseData.fullName}`,
                url: window.location.href,
            }).catch((error) => console.log('Error sharing', error));
        } else {
            navigator.clipboard.writeText(window.location.href)
                .then(() => alert('Link copied to clipboard!'))
                .catch(err => console.error('Could not copy text: ', err));
        }
    };

    const handleImageClick = (index) => {
        setSelectedImageIndex(index);
    };

    const handleNextImage = () => {
        if (selectedImageIndex !== null && selectedImageIndex < images.length - 1) {
            setSelectedImageIndex(selectedImageIndex + 1);
        }
    };

    const handlePrevImage = () => {
        if (selectedImageIndex !== null && selectedImageIndex > 0) {
            setSelectedImageIndex(selectedImageIndex - 1);
        }
    };

    const handleReservationSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        if (!currentUserId) {
            alert('You must be logged in to make a reservation.');
            return;
        }

        const reservationData = {
            _type: 'horseReservation',
            reservingUser: { _type: 'reference', _ref: currentUserId }, // Current user from /api/auth/verify
            ownerUser: { _type: 'reference', _ref: ownerData?._id },    // Owner's ID from horse data
            horse: { _type: 'reference', _ref: horseId },
            datetime: formData.get('datetime'),
            status: 'pending'
        };

        try {
            const result = await client.create(reservationData);
            console.log('Reservation created:', result);
            setShowReservationPopup(false);
            alert('Reservation successfully created!');
        } catch (error) {
            console.error('Error creating reservation:', error);
            alert('Failed to create reservation. Please try again.');
        }
    };

    const getSvgAsDataUrl = (svgString) => {
        // Properly encode the SVG string for a data URL
        const encoded = encodeURIComponent(svgString)
            .replace(/'/g, "%27") // Encode single quotes
            .replace(/"/g, "%22"); // Encode double quotes
        return `data:image/svg+xml;charset=utf-8,${encoded}`;
    };

    const icons = {
        trophy: getSvgAsDataUrl('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>'),
        bookmark: getSvgAsDataUrl('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>'),
        calendar: getSvgAsDataUrl('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>'),
        ribbon: getSvgAsDataUrl('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7c-1.4 0-2.6-.8-3.2-2A3.4 3.4 0 0 1 8 2h8c0 1-1.4 2.8-3.3 3.9A3.7 3.7 0 0 1 12 7Z"/><path d="M8 2h8"/><path d="M8 22V2"/><path d="M16 22V2"/><path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h8"/><path d="M8 19h8"/></svg>'),
        mapPin: getSvgAsDataUrl('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>'),
        badgeCheck: getSvgAsDataUrl('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>'),
        dna: getSvgAsDataUrl('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 20c1-1 2-1 3-1"/><path d="M12 8c-1 0-2 1-3 2"/><path d="M13 17c1-2 0-4-1-6"/><path d="M11 13c0 5 0 5 2 8"/><path d="M15 6c-1-1-2-3-3-3"/><path d="M2 9c6 6 13.333 0 20 6"/></svg>'),
        fileText: getSvgAsDataUrl('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>'),
        award: getSvgAsDataUrl('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>'),
        medal: getSvgAsDataUrl('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><path d="M11 12 5.12 2.2"/><path d="m13 12 5.88-9.8"/><path d="M8 7h8"/><circle cx="12" cy="17" r="5"/><path d="M12 18v-2h-.5"/></svg>'),
        star: getSvgAsDataUrl('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(212, 175, 55, 0.3)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'),
        download: getSvgAsDataUrl('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>')
    };

    const generatePDF = async () => {
        setDownloadingPdf(true);
        try {
            const htmlContent = `
                <div style="
                    width: 210mm; /* A4 width */
                    background: #FFFFFF;
                    padding: 10px 16px;
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    color: #333333;
                    box-sizing: border-box;
                ">
                    <div style="max-width: 800px; margin: 0 auto;">
                        <!-- Main Card -->
                        <div style="
                            background: white;
                            border: 1px solid rgba(212, 175, 55, 0.4);
                            border-radius: 12px;
                            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
                            overflow: hidden;
                        ">
                            <!-- Image Banner -->
                            <div style="
                                height: 224px;
                                background: url('${images[0] || '/api/placeholder/800/500'}') center/cover no-repeat;
                                position: relative;
                            ">
                                <div style="
                                    position: absolute;
                                    inset: 0;
                                    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent 70%);
                                    display: flex;
                                    align-items: flex-end;
                                ">
                                    <div style="padding: 24px 32px;">
                                        <h2 style="
                                            color: #fff;
                                            font-size: 36px;
                                            font-weight: bold;
                                            margin: 0 0 8px 0;
                                            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
                                        ">${horseData.fullName}</h2>
                                        <div style="
                                            display: flex;
                                            align-items: center;
                                            color: #D4AF37;
                                            gap: 8px;
                                        ">
                                            <img src="${icons.trophy}" style="width: 16px; height: 16px;" alt="Trophy" />
                                            <p style="font-size: 14px; font-weight: 500; margin: 0;">${getBreedName(horseData.breed)} • ${horseData.gender}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
    
                            <!-- Content Grid -->
                            <div style="display: grid; grid-template-columns: 1fr 2fr;">
                                <!-- Left Column -->
                                <div style="
                                    background: #F9F9F9;
                                    padding: 28px 32px;
                                    border-right: 1px solid rgba(212, 175, 55, 0.2);
                                ">
                                    <!-- Basic Details -->
                                    <div>
                                        <h3 style="
                                            color: #D4AF37;
                                            font-size: 18px;
                                            font-weight: 600;
                                            margin: 0 0 16px 0;
                                            display: flex;
                                            align-items: center;
                                            gap: 10px;
                                        ">
                                            <img src="${icons.bookmark}" style="width: 20px; height: 20px;" alt="Bookmark" />
                                            Basic Details
                                        </h3>
                                        <ul style="
                                            list-style: none;
                                            padding: 0;
                                            margin: 0;
                                            color: #444444;
                                            display: flex;
                                            flex-direction: column;
                                            gap: 14px;
                                        ">
                                            <li style="display: flex; align-items: center;">
                                                <div style="width: 30px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                                                    <img src="${icons.calendar}" style="width: 16px; height: 16px;" alt="Calendar" />
                                                </div>
                                                <div>
                                                    <span style="display: block; color: #777777; font-size: 12px; margin-bottom: 2px;">Born</span>
                                                    <span>${formatDate(horseData.birthDate)}</span>
                                                </div>
                                            </li>
                                            <li style="display: flex; align-items: center;">
                                                <div style="width: 30px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                                                    <img src="${icons.ribbon}" style="width: 16px; height: 16px;" alt="Ribbon" />
                                                </div>
                                                <div>
                                                    <span style="display: block; color: #777777; font-size: 12px; margin-bottom: 2px;">Color</span>
                                                    <span>${getColorName(horseData.mainColor)}</span>
                                                </div>
                                            </li>
                                            <li style="display: flex; align-items: center;">
                                                <div style="width: 30px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                                                    <img src="${icons.mapPin}" style="width: 16px; height: 16px;" alt="Map Pin" />
                                                </div>
                                                <div>
                                                    <span style="display: block; color: #777777; font-size: 12px; margin-bottom: 2px;">Purpose</span>
                                                    <span>${getPurposeName(horseData.listingPurpose)}</span>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
    
                                    <!-- Identifications -->
                                    <div style="margin-top: 28px;">
                                        <h3 style="
                                            color: #D4AF37;
                                            font-size: 18px;
                                            font-weight: 600;
                                            margin: 0 0 16px 0;
                                            display: flex;
                                            align-items: center;
                                            gap: 10px;
                                        ">
                                            <img src="${icons.badgeCheck}" style="width: 20px; height: 20px;" alt="Badge" />
                                            Identifications
                                        </h3>
                                        <ul style="
                                            list-style: none;
                                            padding: 0;
                                            margin: 0;
                                            color: #444444;
                                            display: flex;
                                            flex-direction: column;
                                            gap: 14px;
                                        ">
                                            <li style="display: flex; align-items: center;">
                                                <div style="width: 30px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                                                    <img src="${icons.dna}" style="width: 16px; height: 16px;" alt="DNA" />
                                                </div>
                                                <div>
                                                    <span style="display: block; color: #777777; font-size: 12px; margin-bottom: 2px;">Chip</span>
                                                    <span style="font-family: monospace; font-size: 14px;">${horseData.electronicChipNumber || 'N/A'}</span>
                                                </div>
                                            </li>
                                            <li style="display: flex; align-items: center;">
                                                <div style="width: 30px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                                                    <img src="${icons.fileText}" style="width: 16px; height: 16px;" alt="File" />
                                                </div>
                                                <div>
                                                    <span style="display: block; color: #777777; font-size: 12px; margin-bottom: 2px;">Passport</span>
                                                    <span style="font-family: monospace; font-size: 14px;">${horseData.passportNumber || 'N/A'}</span>
                                                </div>
                                            </li>
                                            <li style="display: flex; align-items: center;">
                                                <div style="width: 30px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                                                    <img src="${icons.badgeCheck}" style="width: 16px; height: 16px;" alt="Badge" />
                                                </div>
                                                <div>
                                                    <span style="display: block; color: #777777; font-size: 12px; margin-bottom: 2px;">National ID</span>
                                                    <span style="font-family: monospace; font-size: 14px;">${horseData.nationalID || 'N/A'}</span>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
    
                                    <!-- Certifications -->
                                    <div style="margin-top: 28px;">
                                        <h3 style="
                                            color: #D4AF37;
                                            font-size: 18px;
                                            font-weight: 600;
                                            margin: 0 0 16px 0;
                                            display: flex;
                                            align-items: center;
                                            gap: 10px;
                                        ">
                                            <img src="${icons.award}" style="width: 20px; height: 20px;" alt="Award" />
                                            Certifications
                                        </h3>
                                        <ul style="
                                            list-style: none;
                                            padding: 0;
                                            margin: 0;
                                            color: #444444;
                                            display: flex;
                                            flex-direction: column;
                                            gap: 10px;
                                        ">
                                            <li style="display: flex; align-items: center;">
                                                <div style="
                                                    width: 12px;
                                                    height: 12px;
                                                    border-radius: 50%;
                                                    background: ${horseData.ownershipCertificate ? '#D4AF37' : '#CCCCCC'};
                                                    margin-right: 10px;
                                                "></div>
                                                <span>Ownership Certificate</span>
                                            </li>
                                            <li style="display: flex; align-items: center;">
                                                <div style="
                                                    width: 12px;
                                                    height: 12px;
                                                    border-radius: 50%;
                                                    background: ${horseData.geneticAnalysis ? '#D4AF37' : '#CCCCCC'};
                                                    margin-right: 10px;
                                                "></div>
                                                <span>Genetic Analysis</span>
                                            </li>
                                            <li style="display: flex; align-items: center;">
                                                <div style="
                                                    width: 12px;
                                                    height: 12px;
                                                    border-radius: 50%;
                                                    background: ${horseData.passportImage ? '#D4AF37' : '#CCCCCC'};
                                                    margin-right: 10px;
                                                "></div>
                                                <span>Passport Image</span>
                                            </li>
                                            <li style="display: flex; align-items: center;">
                                                <div style="
                                                    width: 12px;
                                                    height: 12px;
                                                    border-radius: 50%;
                                                    background: ${horseData.internationalTransportPermit ? '#D4AF37' : '#CCCCCC'};
                                                    margin-right: 10px;
                                                "></div>
                                                <span>Transport Permit</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
    
                                <!-- Main Content -->
                                <div style="background: #FFFFFF; padding: 28px 32px;">
                                    <!-- Lineage -->
                                    <div style="margin-bottom: 32px;">
                                        <h3 style="
                                            color: #D4AF37;
                                            font-size: 18px;
                                            font-weight: 600;
                                            margin: 0 0 16px 0;
                                            display: flex;
                                            align-items: center;
                                            gap: 10px;
                                        ">
                                            <img src="${icons.dna}" style="width: 20px; height: 20px;" alt="DNA" />
                                            Lineage
                                        </h3>
                                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                            <div style="
                                                background: #F9F9F9;
                                                padding: 16px;
                                                border-radius: 8px;
                                                border: 1px solid rgba(212, 175, 55, 0.2);
                                                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
                                            ">
                                                <p style="color: #777777; font-size: 12px; margin: 0 0 4px 0;">Father Registration</p>
                                                <p style="color: #333333; font-weight: 500; margin: 0;">${horseData.fatherRegistrationNumber || 'N/A'}</p>
                                            </div>
                                            <div style="
                                                background: #F9F9F9;
                                                padding: 16px;
                                                border-radius: 8px;
                                                border: 1px solid rgba(212, 175, 55, 0.2);
                                                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
                                            ">
                                                <p style="color: #777777; font-size: 12px; margin: 0 0 4px 0;">Mother Registration</p>
                                                <p style="color: #333333; font-weight: 500; margin: 0;">${horseData.motherRegistrationNumber || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
    
                                    <!-- Activities -->
                                    <div style="margin-bottom: 32px;">
                                        <h3 style="
                                            color: #D4AF37;
                                            font-size: 18px;
                                            font-weight: 600;
                                            margin: 0 0 16px 0;
                                            display: flex;
                                            align-items: center;
                                            gap: 10px;
                                        ">
                                            <img src="${icons.medal}" style="width: 20px; height: 20px;" alt="Medal" />
                                            Activities & Expertise
                                        </h3>
                                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                                            ${horseData.horseActivities?.map(activity => `
                                                <div style="
                                                    background: #F9F9F9;
                                                    padding: 16px;
                                                    border-radius: 8px;
                                                    border: 1px solid rgba(212, 175, 55, 0.2);
                                                    display: flex;
                                                    flex-direction: column;
                                                    align-items: center;
                                                    text-align: center;
                                                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
                                                ">
                                                    <span style="color: #333333; font-weight: 500; margin-bottom: 6px;">${getActivityName(activity.activity)}</span>
                                                    <span style="color: #D4AF37; font-size: 14px;">${getLevelName(activity.level)}</span>
                                                </div>
                                            `).join('') || '<p style="color: #555555;">No activities recorded</p>'}
                                        </div>
                                    </div>
    
                                    <!-- Achievements -->
                                    <div style="margin-bottom: 32px;">
                                        <h3 style="
                                            color: #D4AF37;
                                            font-size: 18px;
                                            font-weight: 600;
                                            margin: 0 0 16px 0;
                                            display: flex;
                                            align-items: center;
                                            gap: 10px;
                                        ">
                                            <img src="${icons.trophy}" style="width: 20px; height: 20px;" alt="Trophy" />
                                            Achievements
                                        </h3>
                                        <div style="
                                            background: #F9F9F9;
                                            padding: 20px;
                                            border-radius: 8px;
                                            border: 1px solid rgba(212, 175, 55, 0.2);
                                            position: relative;
                                            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
                                        ">
                                            <img src="${icons.star}" style="
                                                position: absolute;
                                                top: 12px;
                                                right: 12px;
                                                width: 24px;
                                                height: 24px;
                                            " alt="Star" />
                                            <p style="color: #555555; font-style: italic; margin: 0; line-height: 1.5;">${horseData.achievements || 'No achievements recorded'}</p>
                                        </div>
                                    </div>
    
                                    <!-- Health Records -->
                                    <div>
                                        <h3 style="
                                            color: #D4AF37;
                                            font-size: 18px;
                                            font-weight: 600;
                                            margin: 0 0 16px 0;
                                            display: flex;
                                            align-items: center;
                                            gap: 10px;
                                        ">
                                            <img src="${icons.award}" style="width: 20px; height: 20px;" alt="Award" />
                                            Health Records
                                        </h3>
                                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                            <div>
                                                <h4 style="color: #777777; font-size: 14px; margin: 0 0 10px 0;">Health Certificates</h4>
                                                <ul style="list-style: none; padding: 0; margin: 0;">
                                                    ${horseData.healthCertificates?.map(cert => `
                                                        <li style="
                                                            color: #444444;
                                                            display: flex;
                                                            align-items: center;
                                                            margin-bottom: 6px;
                                                        ">
                                                            <div style="
                                                                width: 8px;
                                                                height: 8px;
                                                                border-radius: 50%;
                                                                background: #D4AF37;
                                                                margin-right: 10px;
                                                            "></div>
                                                            <span>${String(cert)}</span>
                                                        </li>
                                                    `).join('') || '<li style="color: #555555;">None available</li>'}
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 style="color: #777777; font-size: 14px; margin: 0 0 10px 0;">Vaccination Records</h4>
                                                <ul style="list-style: none; padding: 0; margin: 0;">
                                                    ${horseData.vaccinationCertificates?.map(vacc => `
                                                        <li style="
                                                            color: #444444;
                                                            display: flex;
                                                            align-items: center;
                                                            margin-bottom: 6px;
                                                        ">
                                                            <div style="
                                                                width: 8px;
                                                                height: 8px;
                                                                border-radius: 50%;
                                                                background: #D4AF37;
                                                                margin-right: 10px;
                                                            "></div>
                                                            <span>${String(vacc)}</span>
                                                        </li>
                                                    `).join('') || '<li style="color: #555555;">None available</li>'}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
    
                            <!-- Footer -->
                            <div style="
                                background: #F9F9F9;
                                padding: 16px 32px;
                                border-top: 1px solid rgba(212, 175, 55, 0.2);
                            ">
                                <div style="
                                    display: flex;
                                    flex-direction: row;
                                    gap: 16px;
                                    flex-wrap: wrap;
                                    justify-content: space-between;
                                    align-items: center;
                                ">
                                    <div style="
                                        display: flex;
                                        align-items: center;
                                        color: #D4AF37;
                                    ">
                                        <div style="
                                            height: 32px;
                                            width: 32px;
                                            border-radius: 9999px;
                                            background: rgba(212, 175, 55, 0.1);
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            margin-right: 12px;
                                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                                        ">
                                            <img src="${icons.fileText}" style="width: 16px; height: 16px;" alt="File" />
                                        </div>
                                        <div>
                                            <p style="color: #777777; font-size: 12px; margin: 0 0 2px 0;">Profile URL</p>
                                            <a href="${horseData.url || window.location.href}" style="color: #D4AF37; text-decoration: none; font-size: 14px;">${horseData.url || window.location.href}</a>
                                        </div>
                                    </div>
                                    <div style="color: #444444;">
                                        <p style="color: #777777; font-size: 12px; margin: 0 0 2px 0;">Contact Information</p>
                                        <p style="font-size: 14px; margin: 0;">${ownerData?.fullName || 'Horse Owner'} • ${ownerData?.email || 'N/A'}</p>
                                        <p style="font-size: 14px; margin: 0;">${ownerData?.phoneNumber || 'No phone'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const options = {
                margin: [5, 5, 5, 5], // Small margins for better page breaks
                filename: `${horseData.fullName}_Profile.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2, // Higher scale for clarity
                    useCORS: true,
                    letterRendering: true,
                    logging: true, // Enable for debugging
                    backgroundColor: null,
                    width: 794 // 210mm at 96dpi
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait',
                    compress: true,
                    precision: 16,
                    putOnlyUsedFonts: true
                },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } // Better page break handling
            };

            const element = document.createElement('div');
            element.innerHTML = htmlContent;
            document.body.appendChild(element);

            await html2pdf()
                .set(options)
                .from(element)
                .save();

            document.body.removeChild(element);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setDownloadingPdf(false);
        }
    };

    if (loading) return <Layout><div className="min-h-screen flex items-center justify-center"><p>Loading horse profile...</p></div></Layout>;
    if (!horseData) return <Layout><div className="min-h-screen flex items-center justify-center"><p>Horse not found</p></div></Layout>;

    return (
        <Layout>
            <div className="bg-gray-50 min-h-screen">
                <div className="relative h-96 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50"></div>
                    <img src={images[0] || '/api/placeholder/800/500'} alt={horseData.fullName} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold mb-2">{horseData.fullName}</h1>
                                <p className="text-lg opacity-90">{getBreedName(horseData.breed)}</p>
                            </div>
                            <div className="flex space-x-3">
                                <button onClick={() => setIsFavorite(!isFavorite)} className="bg-blue-50 bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full">
                                    <Heart size={24} className={isFavorite ? "text-red-500 fill-red-500" : "text-white"} />
                                </button>
                                <button onClick={handleShare} className="bg-blue-50 bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full">
                                    <Share2 size={24} className="text-white" />
                                </button>
                                <button onClick={generatePDF} disabled={downloadingPdf} className="bg-blue-50 bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full">
                                    <Download size={24} className="text-white" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 flex justify-center gap-4 shadow-md">
                    {images.map((image, index) => (
                        <div key={index} className="w-20 h-20 rounded-md overflow-hidden cursor-pointer" onClick={() => handleImageClick(index)}>
                            <img src={image} alt={`${horseData.full职称Name} - ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>

                {selectedImageIndex !== null && (
                    <div
                        className="fixed inset-0 bg-[#0000008a] bg-opacity-75 flex items-center justify-center z-50"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="gallery-title"
                    >
                        <div className="relative max-w-4xl w-full">
                            {/* Loading state */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
                            </div>

                            {/* Image */}
                            <img
                                src={images[selectedImageIndex]}
                                alt={`${horseData.fullName} - Image ${selectedImageIndex + 1} of ${images.length}`}
                                className="w-full h-auto max-h-[80vh] object-contain"
                                onLoad={(e) => e.target.previousSibling.classList.add('hidden')}
                            />

                            {/* Counter */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                                {selectedImageIndex + 1} / {images.length}
                            </div>

                            {/* Controls */}
                            <button
                                onClick={() => setSelectedImageIndex(null)}
                                className="absolute top-4 right-4 text-white bg-gray-800 hover:bg-gray-700 p-2 rounded-full transition-colors"
                                aria-label="Close gallery"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>

                            <button
                                onClick={handlePrevImage}
                                disabled={selectedImageIndex === 0}
                                className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full transition-colors ${selectedImageIndex === 0 ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-gray-800 hover:bg-gray-700'}`}
                                aria-label="Previous image"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                            </button>

                            <button
                                onClick={handleNextImage}
                                disabled={selectedImageIndex === images.length - 1}
                                className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full transition-colors ${selectedImageIndex === images.length - 1 ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-gray-800 hover:bg-gray-700'}`}
                                aria-label="Next image"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                <div className="max-w-7xl mx-auto p-4 md:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                                        <Calendar size={24} className="text-blue-500 mb-1" />
                                        <p className="text-xs text-gray-500">Birth Date</p>
                                        <p className="font-medium text-sm">{formatDate(horseData.birthDate)}</p>
                                    </div>
                                    <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                                        <Shield size={24} className="text-blue-600 mb-1" />
                                        <p className="text-xs text-gray-500">Gender</p>
                                        <p className="font-medium text-sm capitalize">{horseData.gender}</p>
                                    </div>
                                    <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                                        <MapPin size={24} className="text-blue-600 mb-1" />
                                        <p className="text-xs text-gray-500">Purpose</p>
                                        <p className="font-medium text-sm">{getPurposeName(horseData.listingPurpose)}</p>
                                    </div>
                                    <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                                        <Award size={24} className="text-blue-600 mb-1" />
                                        <p className="text-xs text-gray-500">Achievements</p>
                                        <p className="font-medium text-sm">{horseData.achievements ? '✓' : 'None'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                                <div className="border-b border-gray-200">
                                    <div className="flex">
                                        <button onClick={() => setActiveTab('overview')} className={`px-4 py-3 font-medium text-sm ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Overview</button>
                                        <button onClick={() => setActiveTab('details')} className={`px-4 py-3 font-medium text-sm ${activeTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Details</button>
                                        <button onClick={() => setActiveTab('lineage')} className={`px-4 py-3 font-medium text-sm ${activeTab === 'lineage' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Lineage</button>
                                        <button onClick={() => setActiveTab('activities')} className={`px-4 py-3 font-medium text-sm ${activeTab === 'activities' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Activities</button>
                                        <button onClick={() => setActiveTab('documents')} className={`px-4 py-3 font-medium text-sm ${activeTab === 'documents' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Documents</button>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {activeTab === 'overview' && (
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h2 className="text-xl font-bold">About {horseData.fullName}</h2>
                                                <button onClick={generatePDF} disabled={downloadingPdf} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                                                    <Download size={16} />
                                                    {downloadingPdf ? 'Generating...' : 'Download Profile PDF'}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h3 className="font-semibold mb-2 text-gray-700">Basic Information</h3>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between py-1 border-b border-gray-100">
                                                            <span className="text-gray-500">Breed</span>
                                                            <span className="font-medium">{getBreedName(horseData.breed)}</span>
                                                        </div>
                                                        <div className="flex justify-between py-1 border-b border-gray-100">
                                                            <span className="text-gray-500">Main Color</span>
                                                            <span className="font-medium">{getColorName(horseData.mainColor)}</span>
                                                        </div>
                                                        {horseData.additionalColors?.length > 0 && (
                                                            <div className="flex justify-between py-1 border-b border-gray-100">
                                                                <span className="text-gray-500">Additional Colors</span>
                                                                <span className="font-medium">{horseData.additionalColors.map(color => getColorName(color)).join(', ')}</span>
                                                            </div>
                                                        )}
                                                        {horseData.distinctiveMark && (
                                                            <div className="flex justify-between py-1 border-b border-gray-100">
                                                                <span className="text-gray-500">Distinctive Mark</span>
                                                                <span className="font-medium">{horseData.distinctiveMark}</span>
                                                            </div>
                                                        )}
                                                        {horseData.electronicChipNumber && (
                                                            <div className="flex justify-between py-1 border-b border-gray-100">
                                                                <span className="text-gray-500">Electronic Chip</span>
                                                                <span className="font-medium">{horseData.electronicChipNumber}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold mb-2 text-gray-700">Registration Information</h3>
                                                    <div className="space-y-2">
                                                        {horseData.passportNumber && (
                                                            <div className="flex justify-between py-1 border-b border-gray-100">
                                                                <span className="text-gray-500">Passport Number</span>
                                                                <span className="font-medium">{horseData.passportNumber}</span>
                                                            </div>
                                                        )}
                                                        {horseData.nationalID && (
                                                            <div className="flex justify-between py-1 border-b border-gray-100">
                                                                <span className="text-gray-500">National ID</span>
                                                                <span className="font-medium">{horseData.nationalID}</span>
                                                            </div>
                                                        )}
                                                        {horseData.insurancePolicyNumber && (
                                                            <div className="flex justify-between py-1 border-b border-gray-100">
                                                                <span className="text-gray-500">Insurance Policy</span>
                                                                <span className="font-medium">{horseData.insurancePolicyNumber}</span>
                                                            </div>
                                                        )}
                                                        {horseData.insuranceEndDate && (
                                                            <div className="flex justify-between py-1 border-b border-gray-100">
                                                                <span className="text-gray-500">Insurance End Date</span>
                                                                <span className="font-medium">{formatDate(horseData.insuranceEndDate)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {horseData.achievements && (
                                                <div className="mt-6">
                                                    <h3 className="font-semibold mb-2 text-gray-700">Achievements</h3>
                                                    <p className="text-gray-700">{horseData.achievements}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'details' && (
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h2 className="text-xl font-bold">Horse Details</h2>
                                                <button onClick={generatePDF} disabled={downloadingPdf} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                                                    <Download size={16} />
                                                    {downloadingPdf ? 'Generating...' : 'Download Profile PDF'}
                                                </button>
                                            </div>
                                            <div className="space-y-6">
                                                {horseData.listingPurpose === 'sale' && horseData.marketValue && (
                                                    <div className="bg-blue-50 p-4 rounded-lg">
                                                        <h3 className="font-semibold text-blue-800">Market Value</h3>
                                                        <p className="text-2xl font-bold text-blue-900">${horseData.marketValue.toLocaleString()}</p>
                                                    </div>
                                                )}
                                                {horseData.listingPurpose === 'rent' && (
                                                    <div className="bg-green-50 p-4 rounded-lg">
                                                        <h3 className="font-semibold text-green-800">Available for Rent</h3>
                                                        <p className="text-green-900">Contact for pricing and availability</p>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <h3 className="font-semibold mb-2 text-gray-700">Physical Characteristics</h3>
                                                        <div className="bg-gray-50 p-4 rounded-lg">
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between py-1 border-b border-gray-200">
                                                                    <span className="text-gray-500">Main Color</span>
                                                                    <span className="font-medium">{getColorName(horseData.mainColor)}</span>
                                                                </div>
                                                                {horseData.additionalColors?.length > 0 && (
                                                                    <div className="flex justify-between py-1 border-b border-gray-200">
                                                                        <span className="text-gray-500">Additional Colors</span>
                                                                        <span className="font-medium">{horseData.additionalColors.map(color => getColorName(color)).join(', ')}</span>
                                                                    </div>
                                                                )}
                                                                {horseData.distinctiveMark && (
                                                                    <div className="flex justify-between py-1 border-b border-gray-200">
                                                                        <span className="text-gray-500">Distinctive Mark</span>
                                                                        <span className="font-medium">{horseData.distinctiveMark}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex justify-between py-1 border-b border-gray-200">
                                                                    <span className="text-gray-500">Gender</span>
                                                                    <span className="font-medium capitalize">{horseData.gender}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold mb-2 text-gray-700">Identification</h3>
                                                        <div className="bg-gray-50 p-4 rounded-lg">
                                                            <div className="space-y-2">
                                                                {horseData.electronicChipNumber && (
                                                                    <div className="flex justify-between py-1 border-b border-gray-200">
                                                                        <span className="text-gray-500">Electronic Chip</span>
                                                                        <span className="font-medium">{horseData.electronicChipNumber}</span>
                                                                    </div>
                                                                )}
                                                                {horseData.passportNumber && (
                                                                    <div className="flex justify-between py-1 border-b border-gray-200">
                                                                        <span className="text-gray-500">Passport Number</span>
                                                                        <span className="font-medium">{horseData.passportNumber}</span>
                                                                    </div>
                                                                )}
                                                                {horseData.nationalID && (
                                                                    <div className="flex justify-between py-1 border-b border-gray-200">
                                                                        <span className="text-gray-500">National ID</span>
                                                                        <span className="font-medium">{horseData.nationalID}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'lineage' && (
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h2 className="text-xl font-bold">Lineage Information</h2>
                                                <button onClick={generatePDF} disabled={downloadingPdf} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                                                    <Download size={16} />
                                                    {downloadingPdf ? 'Generating...' : 'Download Profile PDF'}
                                                </button>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <h3 className="font-semibold mb-2 text-gray-700">Parent Registration</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {horseData.fatherRegistrationNumber && (
                                                            <div className="p-3 bg-white rounded-lg shadow-sm">
                                                                <p className="text-xs text-gray-500">Father Registration Number</p>
                                                                <p className="font-medium">{horseData.fatherRegistrationNumber}</p>
                                                            </div>
                                                        )}
                                                        {horseData.motherRegistrationNumber && (
                                                            <div className="p-3 bg-white rounded-lg shadow-sm">
                                                                <p className="text-xs text-gray-500">Mother Registration Number</p>
                                                                <p className="font-medium">{horseData.motherRegistrationNumber}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {horseData.lineageDetailsArabic && (
                                                    <div>
                                                        <h3 className="font-semibold mb-2 text-gray-700">Lineage Details (Arabic)</h3>
                                                        <p className="text-gray-700 rounded-lg bg-gray-50 p-4">{horseData.lineageDetailsArabic}</p>
                                                    </div>
                                                )}
                                                {horseData.lineageDetailsEnglish && (
                                                    <div>
                                                        <h3 className="font-semibold mb-2 text-gray-700">Lineage Details (English)</h3>
                                                        <p className="text-gray-700 rounded-lg bg-gray-50 p-4">{horseData.lineageDetailsEnglish}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'activities' && (
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h2 className="text-xl font-bold">Horse Activities</h2>
                                                <button onClick={generatePDF} disabled={downloadingPdf} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                                                    <Download size={16} />
                                                    {downloadingPdf ? 'Generating...' : 'Download Profile PDF'}
                                                </button>
                                            </div>
                                            {horseData.horseActivities?.length > 0 ? (
                                                <div className="space-y-4">
                                                    {horseData.horseActivities.map((activity, index) => (
                                                        <div key={index} className="bg-gray-50 p-4 rounded-lg flex items-center">
                                                            <div className="bg-blue-100 p-3 rounded-full mr-4">
                                                                <Award size={24} className="text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-medium">{getActivityName(activity.activity)}</h3>
                                                                <p className="text-sm text-gray-500">Level: {getLevelName(activity.level)}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {horseData.achievements && (
                                                        <div className="mt-6">
                                                            <h3 className="font-semibold mb-2 text-gray-700">Achievements</h3>
                                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                                <p className="text-gray-700">{horseData.achievements}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500">No activities recorded for this horse.</p>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'documents' && (
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h2 className="text-xl font-bold">Documents & Certificates</h2>
                                                <button onClick={generatePDF} disabled={downloadingPdf} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                                                    <Download size={16} />
                                                    {downloadingPdf ? 'Generating...' : 'Download Profile PDF'}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                                                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                                                        <FileText size={24} className="text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium">Ownership Certificate</h3>
                                                        <p className="text-sm text-gray-500">{horseData.ownershipCertificate ? 'Available' : 'Not available'}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                                                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                                                        <Dna size={24} className="text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium">Genetic Analysis</h3>
                                                        <p className="text-sm text-gray-500">{horseData.geneticAnalysis ? 'Available' : 'Not available'}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                                                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                                                        <Shield size={24} className="text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium">Health Certificates</h3>
                                                        <p className="text-sm text-gray-500">{horseData.healthCertificates?.length > 0 ? `${horseData.healthCertificates.length} Available` : 'Not available'}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                                                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                                                        <Clipboard size={24} className="text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium">Vaccination Records</h3>
                                                        <p className="text-sm text-gray-500">{horseData.vaccinationCertificates?.length > 0 ? `${horseData.vaccinationCertificates.length} Available` : 'Not available'}</p>
                                                    </div>
                                                </div>
                                                {horseData.passportImage && (
                                                    <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                                                        <div className="bg-blue-100 p-3 rounded-full mr-4">
                                                            <Info size={24} className="text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium">Passport Image</h3>
                                                            <p className="text-sm text-gray-500">Available</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {horseData.internationalTransportPermit && (
                                                    <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                                                        <div className="bg-blue-100 p-3 rounded-full mr-4">
                                                            <MapPin size={24} className="text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium">International Transport Permit</h3>
                                                            <p className="text-sm text-gray-500">Available</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-100">
                                <div className="p-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700 font-medium">Price:</span>
                                        <div className="flex flex-col items-end">
                                            <span className="text-2xl font-bold text-blue-600">${horseData.marketValue?.toLocaleString() || 'Contact for price'}</span>
                                            {!horseData.marketValue && (
                                                <span className="text-sm text-blue-500 mt-1">Contact seller for details</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                                        <p className="text-gray-600 text-sm flex flex-col gap-1">
                                            <span className="font-medium text-amber-700">Note:</span>
                                            <span>This market value is set by the owner and does not reflect the true value.</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            {horseData.listingPurpose === 'sale' && (
                                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                                    <h3 className="text-xl font-bold mb-2">Interested in this horse?</h3>
                                    <p className="text-gray-600 mb-4">This horse is available for sale.</p>
                                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-700">Price:</span>
                                            <span className="text-xl font-bold text-blue-600">${horseData.marketValue?.toLocaleString() || 'Contact for price'}</span>
                                        </div>
                                    </div>
                                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg">Contact Seller</button>
                                </div>
                            )}
                            {horseData.listingPurpose === 'rent' && (
                                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                                    <h3 className="text-xl font-bold mb-2">Interested in this horse?</h3>
                                    <p className="text-gray-600 mb-4">This horse is available for rent.</p>
                                    <button onClick={() => setShowReservationPopup(true)} className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg">Check Availability</button>
                                </div>
                            )}
                            {horseData.listingPurpose === 'training' && (
                                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                                    <h3 className="text-xl font-bold mb-2">Training Available</h3>
                                    <p className="text-gray-600 mb-4">This horse is available for training sessions.</p>
                                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg">Book Training</button>
                                </div>
                            )}

                            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                                <h3 className="font-bold mb-4">Quick Facts</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <Calendar size={18} className="text-blue-600 mr-2" />
                                        <span className="text-gray-700 text-sm">Age: {horseData.birthDate ? `${new Date().getFullYear() - new Date(horseData.birthDate).getFullYear()} years` : 'Unknown'}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Shield size={18} className="text-blue-600 mr-2" />
                                        <span className="text-gray-700 text-sm">Breed: {getBreedName(horseData.breed)}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <MapPin size={18} className="text-blue-600 mr-2" />
                                        <span className="text-gray-700 text-sm">Purpose: {getPurposeName(horseData.listingPurpose)}</span>
                                    </div>
                                    {horseData.electronicChipNumber && (
                                        <div className="flex items-center">
                                            <Info size={18} className="text-blue-600 mr-2" />
                                            <span className="text-gray-700 text-sm">Chip: {horseData.electronicChipNumber}</span>
                                        </div>
                                    )}
                                    {horseData.passportNumber && (
                                        <div className="flex items-center">
                                            <FileText size={18} className="text-blue-600 mr-2" />
                                            <span className="text-gray-700 text-sm">Passport: {horseData.passportNumber}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                                <h3 className="font-bold mb-4">Contact Owner</h3>
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 mr-3 overflow-hidden">
                                        <img src={ownerData?.image ? urlFor(ownerData.image).url() : "/api/placeholder/100/100"} alt="Owner" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{ownerData?.userName || 'Horse Owner'}</p>
                                        <p className="text-sm text-gray-500">Owner since {horseData.birthDate ? new Date(horseData.birthDate).getFullYear() : 'N/A'}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowContact(!showContact)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg flex items-center justify-center">
                                    <MessageSquare size={18} className="mr-2" />
                                    See Contact
                                </button>
                                {showContact && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                                        {ownerData?.fullName && (
                                            <p className="flex items-center text-sm text-gray-700 mb-2">
                                                <User className="w-4 h-4 mr-2 text-gray-500" />
                                                <span className="font-medium">Full Name:</span>
                                                <span className="ml-1">{ownerData.fullName}</span>
                                            </p>
                                        )}
                                        {ownerData?.phoneNumber && (
                                            <p className="flex items-center text-sm text-gray-700 mb-2">
                                                <Phone className="w-4 h-4 mr-2 text-gray-500" />
                                                <span className="font-medium">Phone:</span>
                                                <a
                                                    href={`tel:${ownerData.phoneNumber}`}
                                                    className="ml-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                                >
                                                    {ownerData.phoneNumber}
                                                </a>
                                            </p>
                                        )}
                                        {ownerData?.email && (
                                            <p className="flex items-center text-sm text-gray-700">
                                                <Mail className="w-4 h-4 mr-2 text-gray-500" />
                                                <span className="font-medium">Email:</span>
                                                <a
                                                    href={`mailto:${ownerData.email}`}
                                                    className="ml-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                                >
                                                    {ownerData.email}
                                                </a>
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="font-bold mb-4">Similar Horses</h3>
                                <div className="space-y-4">
                                    {similarHorses.length > 0 ? (
                                        similarHorses.slice(0, 3).map((horse) => (
                                            <div key={horse._id} className="flex items-center">
                                                <div className="w-16 h-16 rounded-md bg-gray-200 mr-3 overflow-hidden">
                                                    <img src={horse.images?.[0] ? urlFor(horse.images[0]).url() : "/api/placeholder/100/100"} alt={horse.fullName} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{horse.fullName}</p>
                                                    <p className="text-sm text-gray-500">{getBreedName(horse.breed)}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm">No similar horses found.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {showReservationPopup && (
                    <div className="fixed inset-0 bg-[#0000008a] bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">Make a Reservation</h2>
                            <form onSubmit={handleReservationSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">Date and Time</label>
                                    <input type="datetime-local" name="datetime" className="w-full p-2 border rounded" required />
                                </div>
                                <div className="flex justify-end gap-4">
                                    <button type="button" onClick={() => setShowReservationPopup(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Reserve</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default HorseProfilePage;