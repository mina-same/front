"use client";

import React, { useState, useEffect } from 'react';
import { MessageSquareOff, Users, Star, User, Phone, Mail, Share2, FileText, Award, Heart, MessageSquare, Calendar, MapPin, Clock, Info, Shield, Dna, Clipboard, Download, Trophy, Medal } from 'lucide-react';
import Layout from 'components/layout/Layout';
import { client, urlFor } from '../../../../lib/sanity';
import { useParams } from 'next/navigation';
import jsPDF from "jspdf";
import "jspdf-autotable";
// Dynamic import for html2pdf will be used instead of static import
// import html2pdf from 'html2pdf.js';
import { useTranslation } from 'react-i18next'; // Import useTranslation hook
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const Alert = ({ message, isVisible, onClose, type }) => (
    <AnimatePresence>
        {isVisible && (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-100000 max-w-md w-full mx-auto"
            >
                <div
                    className={`bg-white shadow-lg rounded-lg p-4 flex items-start ${type === "success" ? "border-l-4 border-green-500" : "border-l-4 border-red-500"}`}
                >
                    {type === "success" ? (
                        <CheckCircle className="text-green-500 mr-3" size={24} />
                    ) : (
                        <AlertTriangle className="text-red-500 mr-3" size={24} />
                    )}
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{message}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                        ×
                    </button>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

const HorseProfilePage = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [horseData, setHorseData] = useState(null);
    const [ownerData, setOwnerData] = useState(null);
    const [similarHorses, setSimilarHorses] = useState([]);
    const [ratings, setRatings] = useState([]);
    const [userRating, setUserRating] = useState(0);
    const [userComment, setUserComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [showContact, setShowContact] = useState(false);
    const [showReservationPopup, setShowReservationPopup] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const { horseId } = useParams();
    const [alert, setAlert] = useState({ isVisible: false, message: '', type: 'error' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    const horseQuery = `*[_type == "horse" && _id == $horseId][0] {
        fullName, breed, birthDate, gender, images, mainColor, additionalColors,
        distinctiveMarkArabic, distinctiveMarkEnglish, electronicChipNumber,
        fatherRegistrationNumber, motherRegistrationNumber, lineageDetailsArabic,
        lineageDetailsEnglish, achievements, horseActivities[] { activity, level },
        listingPurpose, marketValue, passportNumber, passportImage, nationalID,
        insurancePolicyNumber, insuranceDetailsArabic, insuranceDetailsEnglish,
        insuranceEndDate, healthCertificates, vaccinationCertificates, geneticAnalysis,
        ownershipCertificate, internationalTransportPermit, loveCounter, profileLevel,
        averageRating, ratingCount,
        "owner": owner->{
            _id, fullName, userName, email, phoneNumber, image
        }
    }`;

    const similarHorsesQuery = `*[_type == "horse" && breed == $breed && _id != $horseId] {
        _id, fullName, breed, images
    }`;

    const ratingsQuery = `*[_type == "horseRating" && horse._ref == $horseId] {
        rating, comment, date, "user": user->{_id, userName, image}
    }`;

    const getProfileTier = (level) => {
        switch (level) {
            case 'gold':
                return {
                    name: t("user:horseRegistration.profileTier.gold"),
                    level: "gold",
                    color: "text-amber-500",
                    message: t("user:horseRegistration.profileTier.goldMessage"),
                    icon: <Trophy className="text-amber-500" size={20} />,
                };
            case 'silver':
                return {
                    name: t("user:horseRegistration.profileTier.silver"),
                    level: "silver",
                    color: "text-gray-400",
                    message: t("user:horseRegistration.profileTier.silverMessage"),
                    icon: <Award className="text-gray-400" size={20} />,
                };
            case 'bronze':
                return {
                    name: t("user:horseRegistration.profileTier.bronze"),
                    level: "bronze",
                    color: "text-orange-400",
                    message: t("user:horseRegistration.profileTier.bronzeMessage"),
                    icon: <Medal className="text-orange-400" size={20} />,
                };
            default:
                return {
                    name: t("user:horseRegistration.profileTier.basic"),
                    level: "basic",
                    color: "text-gray-600",
                    message: t("user:horseRegistration.profileTier.basicMessage"),
                    icon: <Shield className="text-gray-600" size={20} />,
                };
        }
    };

    const showAlert = (message, type = 'error') => {
        console.log('showAlert called with:', { message, type });
        setAlert({ isVisible: true, message, type });
        setTimeout(() => setAlert({ isVisible: false, message: '', type: 'error' }), 3000);
    };

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const response = await fetch('/api/auth/verify', {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                });
                if (!response.ok) throw new Error(`Verify API failed with status: ${response.status}`);
                const data = await response.json();
                console.log('Auth data:', data);
                if (data.authenticated) {
                    const userId = data.userId || data.user?.id || data.user?.userId;
                    setCurrentUserId(userId);
                    console.log('User ID set:', userId);
                } else {
                    console.log('User not authenticated');
                }
            } catch (error) {
                console.error('Auth verification failed:', error.message);
            }
        };

        verifyAuth();
    }, []); // Run once on mount

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [horseData, ratingsData] = await Promise.all([
                    horseQuery,
                    ratingsQuery
                ]);
                setHorseData(horseData);
                setRatings(ratingsData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error.message);
                setLoading(false);
            }
        };

        if (horseId) fetchData();
    }, [horseId, horseQuery, ratingsQuery]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const horse = await client.fetch(horseQuery, { horseId });
                console.log('Fetched horse data:', horse);
                setHorseData(horse);
                if (horse?.owner) setOwnerData(horse.owner);
                if (horse?.breed) {
                    const similar = await client.fetch(similarHorsesQuery, { breed: horse.breed, horseId });
                    setSimilarHorses(similar);
                }
                const ratingsData = await client.fetch(ratingsQuery, { horseId });
                console.log('Fetched ratings data:', ratingsData);
                setRatings(ratingsData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error.message);
                setLoading(false);
                showAlert(t('horseDetails:fetchDataFailed'));
            }
        };

        if (horseId) fetchData();
    }, [horseId, t, horseQuery, similarHorsesQuery, ratingsQuery]);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const response = await fetch('/api/auth/verify', {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                });
                if (!response.ok) throw new Error(`Verify API failed with status: ${response.status}`);
                const data = await response.json();
                if (data.authenticated) {
                    const userId = data.userId || data.user?.id || data.user?.userId;
                    setCurrentUserId(userId);
                    // Fetch user's wishlist
                    const userQuery = `*[_type == "user" && _id == $userId][0]{wishlistHorses[]->{_id}}`;
                    const userData = await client.fetch(userQuery, { userId });
                    const isHorseInWishlist = userData?.wishlistHorses?.some(horse => horse._id === horseId) || false;
                    setIsInWishlist(isHorseInWishlist);
                }
            } catch (error) {
                console.error('Auth verification failed:', error.message);
            }
        };
        verifyAuth();
    }, [horseId]);

    const toggleWishlist = async () => {
        if (!currentUserId) {
            showAlert(t('horseDetails:loginToWishlist'));
            return;
        }
        try {
            setWishlistLoading(true); // Start loading
            const userQuery = `*[_type == "user" && _id == $userId][0]{wishlistHorses[]->{_id}}`;
            const userData = await client.fetch(userQuery, { userId: currentUserId });
            const isHorseInWishlist = userData?.wishlistHorses?.some(horse => horse._id === horseId);

            if (isHorseInWishlist) {
                // Remove horse from wishlist
                await client
                    .patch(currentUserId)
                    .unset([`wishlistHorses[_ref == "${horseId}"]`])
                    .commit();
                setIsInWishlist(false);
                showAlert(t('horseDetails:removedFromWishlist'), 'success');
            } else {
                // Add horse to wishlist with a unique _key
                const newWishlistEntry = {
                    _type: 'reference',
                    _ref: horseId,
                    _key: `horse-${horseId}-${Date.now()}` // Unique key to avoid errors
                };
                await client
                    .patch(currentUserId)
                    .setIfMissing({ wishlistHorses: [] })
                    .append('wishlistHorses', [newWishlistEntry])
                    .commit();
                setIsInWishlist(true);
                showAlert(t('horseDetails:addedToWishlist'), 'success');
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            showAlert(t('horseDetails:wishlistUpdateFailed'));
        } finally {
            setWishlistLoading(false); // Stop loading
        }
    };

    const images = horseData?.images ? horseData.images.map(image => urlFor(image).url()) : [];

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const getBreedName = (breedValue, language = 'en') => {
        const breedMap = {
            "purebredArabian": {
                "en": "Purebred Arabian",
                "ar": "حصان عربي أصيل"
            },
            "tibetanPony": {
                "en": "Tibetan Pony",
                "ar": "حصان تبتي"
            },
            "mongolianHorse": {
                "en": "Mongolian Horse",
                "ar": "حصان منغولي"
            },
            "andalusian": {
                "en": "Andalusian",
                "ar": "أندلسي"
            },
            "friesian": {
                "en": "Friesian",
                "ar": "فريزي"
            },
            "hungarianHorse": {
                "en": "Hungarian Horse",
                "ar": "حصان مجري"
            },
            "bulgarianHorse": {
                "en": "Bulgarian Horse",
                "ar": "حصان بلغاري"
            },
            "uzbekHorse": {
                "en": "Uzbek Horse",
                "ar": "حصان أوزبكي"
            },
            "afghanHorse": {
                "en": "Afghan Horse",
                "ar": "حصان أفغاني"
            },
            "turkishHorse": {
                "en": "Turkish Horse",
                "ar": "حصان تركي"
            },
            "persianHorse": {
                "en": "Persian Horse",
                "ar": "حصان فارسي"
            },
            "kurdishHorse": {
                "en": "Kurdish Horse",
                "ar": "حصان كردي"
            },
            "armenianHorse": {
                "en": "Armenian Horse",
                "ar": "حصان أرمني"
            },
            "georgianHorse": {
                "en": "Georgian Horse",
                "ar": "حصان جورجي"
            },
            "abkhazianHorse": {
                "en": "Abkhazian Horse",
                "ar": "حصان أبخازي"
            },
            "altaiHorse": {
                "en": "Altai Horse",
                "ar": "حصان ألتاي"
            },
            "bashkirHorse": {
                "en": "Bashkir Horse",
                "ar": "حصان باشكيري"
            },
            "tatarHorse": {
                "en": "Tatar Horse",
                "ar": "حصان تتاري"
            },
            "kirghizHorse": {
                "en": "Kirghiz Horse",
                "ar": "حصان قيرغيزي"
            },
            "tajikHorse": {
                "en": "Tajik Horse",
                "ar": "حصان طاجيكي"
            },
            "turkmenHorse": {
                "en": "Turkmen Horse",
                "ar": "حصان تركماني"
            },
            "karakalpakUzbekHorse": {
                "en": "Karakalpak Uzbek Horse",
                "ar": "حصان قره قلباق أوزبكي"
            },
            "kazakhHorse": {
                "en": "Kazakh Horse",
                "ar": "حصان كازاخي"
            },
            "donHorse": {
                "en": "Don Horse",
                "ar": "حصان دون"
            },
            "kubanHorse": {
                "en": "Kuban Horse",
                "ar": "حصان كوبان"
            },
            "belarusianHorse": {
                "en": "Belarusian Horse",
                "ar": "حصان بيلاروسي"
            },
            "ukrainianHorse": {
                "en": "Ukrainian Horse",
                "ar": "حصان أوكراني"
            },
            "polishHorse": {
                "en": "Polish Horse",
                "ar": "حصان بولندي"
            },
            "czechHorse": {
                "en": "Czech Horse",
                "ar": "حصان تشيكي"
            },
            "slovakHorse": {
                "en": "Slovak Horse",
                "ar": "حصان سلوفاكي"
            },
            "hungarianHorse2": {
                "en": "Hungarian Horse",
                "ar": "حصان مجري"
            },
            "romanianHorse": {
                "en": "Romanian Horse",
                "ar": "حصان روماني"
            },
            "shaggyBulgarianHorse": {
                "en": "Shaggy Bulgarian Horse",
                "ar": "حصان بلغاري مجعد"
            },
            "greekHorse": {
                "en": "Greek Horse",
                "ar": "حصان يوناني"
            },
            "anatolianHorse": {
                "en": "Anatolian Horse",
                "ar": "حصان أناضولي"
            },
            "persianBlueHorse": {
                "en": "Persian Blue Horse",
                "ar": "حصان فارسي أزرق"
            },
            "hazaragiHorse": {
                "en": "Hazaragi Horse",
                "ar": "حصان هزارة"
            },
            "pashtunHorse": {
                "en": "Pashtun Horse",
                "ar": "حصان بشتوني"
            },
            "marwari": {
                "en": "Marwari",
                "ar": "مارواري"
            },
            "nepalesePony": {
                "en": "Nepalese Pony",
                "ar": "حصان نيبالي"
            },
            "bhutanesePony": {
                "en": "Bhutanese Pony",
                "ar": "حصان بوتاني"
            },
            "thaiPony": {
                "en": "Thai Pony",
                "ar": "حصان تايلاندي"
            },
            "cambodianPony": {
                "en": "Cambodian Pony",
                "ar": "حصان كمبودي"
            },
            "vietnamesePony": {
                "en": "Vietnamese Pony",
                "ar": "حصان فيتنامي"
            },
            "laotianPony": {
                "en": "Laotian Pony",
                "ar": "حصان لاوسي"
            },
            "burmesePony": {
                "en": "Burmese Pony",
                "ar": "حصان ميانماري"
            },
            "manchuHorse": {
                "en": "Manchu Horse",
                "ar": "حصان منشوري"
            },
            "kisoHorse": {
                "en": "Kiso Horse",
                "ar": "حصان كيسو"
            },
            "koreanHorse": {
                "en": "Korean Horse",
                "ar": "حصان كوري"
            },
            "bayankhongorMongolianHorse": {
                "en": "Bayankhongor Mongolian Horse",
                "ar": "حصان منغولي بايانخونغور"
            },
            "khentiiMongolianHorse": {
                "en": "Khentii Mongolian Horse",
                "ar": "حصان منغولي خينتي"
            },
            "tibetanPony2": {
                "en": "Tibetan Pony",
                "ar": "حصان تبتي"
            },
            "nepalesePony2": {
                "en": "Nepalese Pony",
                "ar": "حصان نيبالي"
            },
            "bhutanesePony2": {
                "en": "Bhutanese Pony",
                "ar": "حصان بوتاني"
            },
            "thaiPony2": {
                "en": "Thai Pony",
                "ar": "حصان تايلاندي"
            },
            "cambodianPony2": {
                "en": "Cambodian Pony",
                "ar": "حصان كمبودي"
            },
            "vietnamesePony2": {
                "en": "Vietnamese Pony",
                "ar": "حصان فيتنامي"
            },
            "laotianPony2": {
                "en": "Laotian Pony",
                "ar": "حصان لاوسي"
            },
            "burmesePony2": {
                "en": "Burmese Pony",
                "ar": "حصان ميانماري"
            },
            "manchuHorse2": {
                "en": "Manchu Horse",
                "ar": "حصان منشوري"
            },
            "kisoHorse2": {
                "en": "Kiso Horse",
                "ar": "حصان كيسو"
            },
            "koreanHorse2": {
                "en": "Korean Horse",
                "ar": "حصان كوري"
            },
            "bayankhongorMongolianHorse2": {
                "en": "Bayankhongor Mongolian Horse",
                "ar": "حصان منغولي بايانخونغور"
            },
            "khentiiMongolianHorse2": {
                "en": "Khentii Mongolian Horse",
                "ar": "حصان منغولي خينتي"
            },
            "tibetanPony3": {
                "en": "Tibetan Pony",
                "ar": "حصان تبتي"
            },
            "nepalesePony3": {
                "en": "Nepalese Pony",
                "ar": "حصان نيبالي"
            },
            "bhutanesePony3": {
                "en": "Bhutanese Pony",
                "ar": "حصان بوتاني"
            },
            "thaiPony3": {
                "en": "Thai Pony",
                "ar": "حصان تايلاندي"
            },
            "cambodianPony3": {
                "en": "Cambodian Pony",
                "ar": "حصان كمبودي"
            },
            "vietnamesePony3": {
                "en": "Vietnamese Pony",
                "ar": "حصان فيتنامي"
            },
            "laotianPony3": {
                "en": "Laotian Pony",
                "ar": "حصان لاوسي"
            },
            "burmesePony3": {
                "en": "Burmese Pony",
                "ar": "حصان ميانماري"
            },
            "manchuHorse3": {
                "en": "Manchu Horse",
                "ar": "حصان منشوري"
            },
            "kisoHorse3": {
                "en": "Kiso Horse",
                "ar": "حصان كيسو"
            },
            "koreanHorse3": {
                "en": "Korean Horse",
                "ar": "حصان كوري"
            },
            "arabian": {
                "en": "Arabian",
                "ar": "عربي"
            },
            "spanishAndalusian": {
                "en": "Spanish Andalusian",
                "ar": "أندلسي إسباني"
            },
            "thoroughbred": {
                "en": "Thoroughbred",
                "ar": "صميم النسل"
            },
            "frenchHorse": {
                "en": "French Horse",
                "ar": "حصان فرنسي"
            },
            "germanHorse": {
                "en": "German Horse",
                "ar": "حصان ألماني"
            },
            "italianHorse": {
                "en": "Italian Horse",
                "ar": "حصان إيطالي"
            },
            "belgianDraft": {
                "en": "Belgian Draft",
                "ar": "حصان بلجيكي ضخم"
            },
            "dutchHorse": {
                "en": "Dutch Horse",
                "ar": "حصان هولندي"
            },
            "danishHorse": {
                "en": "Danish Horse",
                "ar": "حصان دنماركي"
            },
            "norwegianFjord": {
                "en": "Norwegian Fjord",
                "ar": "حصان نرويجي فيورد"
            },
            "swedishHorse": {
                "en": "Swedish Horse",
                "ar": "حصان سويدي"
            },
            "finnhorse": {
                "en": "Finnhorse",
                "ar": "حصان فنلندي"
            },
            "estonianHorse": {
                "en": "Estonian Horse",
                "ar": "حصان إستوني"
            },
            "latvianHorse": {
                "en": "Latvian Horse",
                "ar": "حصان لاتفي"
            },
            "lithuanianHorse": {
                "en": "Lithuanian Horse",
                "ar": "حصان ليتواني"
            },
            "konik": {
                "en": "Konik",
                "ar": "كونيك"
            },
            "donHorse2": {
                "en": "Don Horse",
                "ar": "حصان دون"
            },
            "kubanHorse2": {
                "en": "Kuban Horse",
                "ar": "حصان كوبان"
            },
            "ukrainianHorse2": {
                "en": "Ukrainian Horse",
                "ar": "حصان أوكراني"
            },
            "belarusianHorse2": {
                "en": "Belarusian Horse",
                "ar": "حصان بيلاروسي"
            }
        };

        if (!isRTL) {
            return `${breedMap[breedValue]?.en || breedValue}`;
        } else {
            return `${breedMap[breedValue]?.ar || breedValue}`;
        }
    };

    const getColorName = (colorValue, language = 'en') => {
        const colorMap = {
            "grey": {
                "en": "Grey / White",
                "ar": "رمادي / أبيض"
            },
            "black": {
                "en": "Black",
                "ar": "أسود"
            },
            "bay": {
                "en": "Bay",
                "ar": "حناء"
            },
            "chestnut": {
                "en": "Chestnut",
                "ar": "كستنائي"
            },
            "dappleGrey": {
                "en": "Dapple Grey",
                "ar": "رمادي مرقط"
            },
            "silverDapple": {
                "en": "Silver Dapple",
                "ar": "فضي مرقط"
            }
        };

        if (!isRTL) {
            return `${colorMap[colorValue]?.en || colorValue}`;
        } else {
            return `${colorMap[colorValue]?.ar || colorValue}`;
        }
    };

    const getActivityName = (activityValue, language = 'en') => {
        const activityMap = {
            "shortRace": {
                "en": "Short Race",
                "ar": "سباق قصير"
            },
            "enduranceRace": {
                "en": "Endurance Race",
                "ar": "سباق تحمل"
            },
            "jumping": {
                "en": "Jumping",
                "ar": "قفز"
            },
            "training": {
                "en": "Training",
                "ar": "تدريب"
            },
            "beautyAndShow": {
                "en": "Beauty and Show Competition",
                "ar": "مسابقة جمال وعرض"
            }
        };

        if (!isRTL) {
            return `${activityMap[activityValue]?.en || activityValue}`;
        } else {
            return `${activityMap[activityValue]?.ar || activityValue}`;
        }
    };

    const getLevelName = (levelValue, language = 'en') => {
        const levelMap = {
            "beginner": {
                "en": "Beginner",
                "ar": "مبتدئ"
            },
            "intermediate": {
                "en": "Intermediate",
                "ar": "متوسط"
            },
            "advanced": {
                "en": "Advanced",
                "ar": "متقدم"
            }
        };

        if (!isRTL) {
            return `${levelMap[levelValue]?.en || levelValue}`;
        } else {
            return `${levelMap[levelValue]?.ar || levelValue}`;
        }
    };

    const getPurposeName = (purposeValue, language = 'en') => {
        const purposeMap = {
            "sale": {
                "en": "For Sale",
                "ar": "للبيع"
            },
            "rent": {
                "en": "For Rent",
                "ar": "للإيجار"
            },
            "training": {
                "en": "For Training",
                "ar": "للتدريب"
            },
            "personalUse": {
                "en": "Personal Use",
                "ar": "الاستخدام الشخصي"
            }
        };

        if (!isRTL) {
            return `${purposeMap[purposeValue]?.en || purposeValue}`;
        } else {
            return `${purposeMap[purposeValue]?.ar || purposeValue}`;
        }
    };

    const handleRatingSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) {
            console.log('Submission already in progress, ignoring click.');
            return;
        }

        console.log('Submitting rating:', { userRating, userComment, currentUserId });
        setIsSubmitting(true);

        if (!currentUserId) {
            showAlert(t('horseDetails:loginToRate'));
            setIsSubmitting(false);
            return;
        }
        if (userRating < 1 || userRating > 5) {
            showAlert(t('horseDetails:invalidRating'));
            setIsSubmitting(false);
            return;
        }

        console.log('Current User ID:', currentUserId);
        console.log('Ratings:', ratings);
        const existingRating = ratings.some((r) => r.user?._id === currentUserId);
        console.log('Existing Rating Check:', existingRating);
        if (existingRating) {
            console.log('Calling showAlert for existing rating');
            showAlert(t('horseDetails:alreadyRated'));
            setIsSubmitting(false);
            return;
        }

        const ratingData = {
            _type: 'horseRating',
            horse: { _type: 'reference', _ref: horseId },
            user: { _type: 'reference', _ref: currentUserId },
            rating: userRating,
            comment: userComment || undefined,
            date: new Date().toISOString(),
        };

        try {
            const result = await client.create(ratingData);
            console.log('Rating created successfully:', result);

            const updatedRatings = await client.fetch(ratingsQuery, { horseId });
            console.log('Updated ratings:', updatedRatings);

            const totalRatings = updatedRatings.length;
            const sumRatings = updatedRatings.reduce((sum, r) => sum + r.rating, 0);
            const newAverageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;
            console.log(`Calculated: totalRatings=${totalRatings}, sumRatings=${sumRatings}, newAverageRating=${newAverageRating}`);

            const patchResult = await client
                .patch(horseId)
                .set({
                    averageRating: newAverageRating,
                    ratingCount: totalRatings,
                })
                .commit();
            console.log('Horse document updated:', patchResult);

            setRatings(updatedRatings);
            setHorseData({
                ...horseData,
                averageRating: newAverageRating,
                ratingCount: totalRatings,
            });
            setUserRating(0);
            setUserComment('');
            showAlert(t('horseDetails:ratingSubmitted'), 'success');
        } catch (error) {
            console.error('Error submitting rating:', error);
            showAlert(`${t('horseDetails:ratingFailed')} - ${error.message}`);
        } finally {
            setIsSubmitting(false);
            console.log('Submission complete, button re-enabled.');
        }
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
                .then(() => showAlert('Link copied to clipboard!', 'success'))
                .catch(err => {
                    console.error('Could not copy text: ', err);
                    showAlert('Failed to copy link.');
                });
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
            showAlert('You must be logged in to make a reservation.');
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
            showAlert('Reservation successfully created!', 'success');
        } catch (error) {
            console.error('Error creating reservation:', error);
            showAlert('Failed to create reservation. Please try again.');
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
                                        <img src="${icons.trophy}" style="margin-top:15px; width: 16px; height: 16px;" alt="Trophy" />
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
                                        <img src="${icons.bookmark}" style="margin-top:15px; width: 20px; height: 20px;" alt="Bookmark" />
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
                                                <img src="${icons.calendar}" style="margin-top:15px; width: 16px; height: 16px;" alt="Calendar" />
                                            </div>
                                            <div>
                                                <span style="display: block; color: #777777; font-size: 12px; margin-bottom: 2px;">Born</span>
                                                <span>${formatDate(horseData.birthDate)}</span>
                                            </div>
                                        </li>
                                        <li style="display: flex; align-items: center;">
                                            <div style="width: 30px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                                                <img src="${icons.ribbon}" style="margin-top:15px; width: 16px; height: 16px;" alt="Ribbon" />
                                            </div>
                                            <div>
                                                <span style="display: block; color: #777777; font-size: 12px; margin-bottom: 2px;">Color</span>
                                                <span>${getColorName(horseData.mainColor)}</span>
                                            </div>
                                        </li>
                                        <li style="display: flex; align-items: center;">
                                            <div style="width: 30px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                                                <img src="${icons.mapPin}" style="margin-top:15px; width: 16px; height: 16px;" alt="Map Pin" />
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
                                        <img src="${icons.badgeCheck}" style="margin-top:15px; width: 20px; height: 20px;" alt="Badge" />
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
                                                <img src="${icons.dna}" style="margin-top:15px; width: 16px; height: 16px;" alt="DNA" />
                                            </div>
                                            <div>
                                                <span style="display: block; color: #777777; font-size: 12px; margin-bottom: 2px;">Chip</span>
                                                <span style="font-family: monospace; font-size: 14px;">${horseData.electronicChipNumber || 'N/A'}</span>
                                            </div>
                                        </li>
                                        <li style="display: flex; align-items: center;">
                                            <div style="width: 30px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                                                <img src="${icons.fileText}" style="margin-top:15px; width: 16px; height: 16px;" alt="File" />
                                            </div>
                                            <div>
                                                <span style="display: block; color: #777777; font-size: 12px; margin-bottom: 2px;">Passport</span>
                                                <span style="font-family: monospace; font-size: 14px;">${horseData.passportNumber || 'N/A'}</span>
                                            </div>
                                        </li>
                                        <li style="display: flex; align-items: center;">
                                            <div style="width: 30px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                                                <img src="${icons.badgeCheck}" style="margin-top:15px; width: 16px; height: 16px;" alt="Badge" />
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
                                        <img src="${icons.award}" style="margin-top:15px; width: 20px; height: 20px;" alt="Award" />
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
                            <div style="background: #FFFFFF; padding: 28px 32px; display: flex; flex-direction: column; height: 100%;">
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
                                        <img src="${icons.dna}" style="margin-top:15px; width: 20px; height: 20px;" alt="DNA" />
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
                                        <img src="${icons.medal}" style="margin-top:15px; width: 20px; height: 20px;" alt="Medal" />
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
                                        <img src="${icons.trophy}" style="margin-top:15px; width: 20px; height: 20px;" alt="Trophy" />
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
                                        <img src="${icons.award}" style="margin-top:15px; width: 20px; height: 20px;" alt="Award" />
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
                            padding: 0px 32px 10px;
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
                                        <img src="${icons.fileText}" style="    width: 16px; height: 16px;" alt="File" />
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

            // Dynamically import html2pdf.js only on client side
            const html2pdf = (await import('html2pdf.js')).default;

            await html2pdf()
                .set(options)
                .from(element)
                .save();

            document.body.removeChild(element);
        } catch (error) {
            console.error("Error generating PDF:", error);
            showAlert("Failed to generate PDF. Please try again.");
        } finally {
            setDownloadingPdf(false);
        }
    };

    const generateArabicPDF = async () => {
        setDownloadingPdf(true);
        try {
            const htmlContent = `
                <div style="
                    width: 210mm; /* A4 width */
                    background: #FFFFFF;
                    padding: 10px 16px;
                    font-family: 'Noto Kufi Arabic', 'Noto Sans Arabic', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    color: #333333;
                    box-sizing: border-box;
                    direction: rtl;
                    text-align: right;
                    line-height: 1.5;
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
                                            font-family: 'Noto Kufi Arabic', sans-serif;
                                        ">${horseData.fullName}</h2>
                                        <div style="
                                            display: flex;
                                            align-items: center;
                                            color: #D4AF37;
                                            gap: 8px;
                                        ">
                                            <img src="${icons.trophy}" style="margin-top:15px; width: 16px; height: 16px;" alt="كأس" />
                                            <p style="font-size: 14px; font-weight: 500; margin: 0;">${getBreedName(horseData.breed, 'ar')} • ${horseData.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
    
                            <!-- Content Grid -->
                            <div style="display: grid; grid-template-columns: 1fr 2fr; flex: 1;">
                                <!-- Right Column (formerly Left Column) -->
                                <div style="
                                    background: #F9F9F9;
                                    padding: 28px 32px;
                                    border-left: 1px solid rgba(212, 175, 55, 0.2);
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
                                            justify-content: flex-start;
                                            font-family: 'Noto Kufi Arabic', sans-serif;
                                        ">
                                            <img src="${icons.bookmark}" style="margin-top:15px; width: 20px; height: 20px;" alt="علامة" />
                                            <span>التفاصيل الأساسية</span>
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
                                                <div style="width: 30px; display: flex; align-items: center; justify-content: center; margin-left: 12px;">
                                                    <img src="${icons.calendar}" style="margin-top:15px; width: 16px; height: 16px;" alt="تقويم" />
                                                </div>
                                                <div>
                                                    <span style="display: block; color: #777777; font-size: 12px; margin-bottom: 2px;">تاريخ الميلاد</span>
                                                    <span style="font-family: 'Noto Kufi Arabic', sans-serif;">${formatDate(horseData.birthDate)}</span>
                                                </div>
                                            </li>
                                            <li style="display: flex; align-items: center;">
                                                <div style="width: 30px; display: flex; align-items: center; justify-content: center; margin-left: 12px;">
                                                    <img src="${icons.ribbon}" style="margin-top:15px; width: 16px; height: 16px;" alt="شريط" />
                                                </div>
                                                <div>
                                                    <span style="display: block; color: #777777; font-size: 12px; margin-bottom: 2px;">اللون</span>
                                                    <span style="font-family: 'Noto Kufi Arabic', sans-serif;">${getColorName(horseData.mainColor, 'ar')}</span>
                                                </div>
                                            </li>
                                            <li style="display: flex; align-items: center;">
                                                <div style="width: 30px; display: flex; align-items: center; justify-content: center; margin-left: 12px;">
                                                    <img src="${icons.mapPin}" style="margin-top:15px; width: 16px; height: 16px;" alt="دبوس الموقع" />
                                                </div>
                                                <div>
                                                    <span style="display: block; color: #777777; font-size: 12px; margin-bottom: 2px;">الغرض</span>
                                                    <span style="font-family: 'Noto Kufi Arabic', sans-serif;">${getPurposeName(horseData.listingPurpose, 'ar')}</span>
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
                                            justify-content: flex-start;
                                            font-family: 'Noto Kufi Arabic', sans-serif;
                                        ">
                                            <img src="${icons.badgeCheck}" style="margin-top:15px; width: 20px; height: 20px;" alt="شارة" />
                                            <span>الهوية</span>
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
                                                <div style="width: 30px; display: flex; align-items: center; justify-content: center; margin-left: 12px;">
                                                    <img src="${icons.dna}" style="margin-top:15px; width: 16px; height: 16px;" alt="الحمض النووي" />
                                                </div>
                                                <div>
                                                    <span style="display: block; color: #777777; font-size: 12px; margin-bottom: 2px;">رقم الشريحة</span>
                                                    <span style="font-family: monospace; font-size: 14px; direction: ltr; display: inline-block;">${horseData.electronicChipNumber || 'غير متوفر'}</span>
                                                </div>
                                            </li>
                                            <li style="display: flex; align-items: center;">
                                                <div style="width: 30px; display: flex; align-items: center; justify-content: center; margin-left: 12px;">
                                                    <img src="${icons.fileText}" style="margin-top:15px; width: 16px; height: 16px;" alt="ملف" />
                                                </div>
                                                <div>
                                                    <span style="display: block; color: #777777; font-size: 12px; margin-bottom: 2px;">رقم جواز السفر</span>
                                                    <span style="font-family: monospace; font-size: 14px; direction: ltr; display: inline-block;">${horseData.passportNumber || 'غير متوفر'}</span>
                                                </div>
                                            </li>
                                            <li style="display: flex; align-items: center;">
                                                <div style="width: 30px; display: flex; align-items: center; justify-content: center; margin-left: 12px;">
                                                    <img src="${icons.badgeCheck}" style="margin-top:15px; width: 16px; height: 16px;" alt="شارة" />
                                                </div>
                                                <div>
                                                    <span style="display: block; color: #777777; font-size: 12px; margin-bottom: 2px;">الهوية الوطنية</span>
                                                    <span style="font-family: monospace; font-size: 14px; direction: ltr; display: inline-block;">${horseData.nationalID || 'غير متوفر'}</span>
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
                                            justify-content: flex-start;
                                            font-family: 'Noto Kufi Arabic', sans-serif;
                                        ">
                                            <img src="${icons.award}" style="margin-top:15px; width: 20px; height: 20px;" alt="جائزة" />
                                            <span>الشهادات</span>
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
                                                    margin-left: 10px;
                                                "></div>
                                                <span>شهادة الملكية</span>
                                            </li>
                                            <li style="display: flex; align-items: center;">
                                                <div style="
                                                    width: 12px;
                                                    height: 12px;
                                                    border-radius: 50%;
                                                    background: ${horseData.geneticAnalysis ? '#D4AF37' : '#CCCCCC'};
                                                    margin-left: 10px;
                                                "></div>
                                                <span>التحليل الجيني</span>
                                            </li>
                                            <li style="display: flex; align-items: center;">
                                                <div style="
                                                    width: 12px;
                                                    height: 12px;
                                                    border-radius: 50%;
                                                    background: ${horseData.passportImage ? '#D4AF37' : '#CCCCCC'};
                                                    margin-left: 10px;
                                                "></div>
                                                <span>صورة جواز السفر</span>
                                            </li>
                                            <li style="display: flex; align-items: center;">
                                                <div style="
                                                    width: 12px;
                                                    height: 12px;
                                                    border-radius: 50%;
                                                    background: ${horseData.internationalTransportPermit ? '#D4AF37' : '#CCCCCC'};
                                                    margin-left: 10px;
                                                "></div>
                                                <span>تصريح النقل الدولي</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                
                                <!-- Main Content -->
                                <div style="background: #FFFFFF; padding: 28px 32px;">
                                    <!-- Lineage -->
                                    <div style="margin-bottom: 0;">
                                        <h3 style="
                                            color: #D4AF37;
                                            font-size: 18px;
                                            font-weight: 600;
                                            margin: 0 0 16px 0;
                                            display: flex;
                                            align-items: center;
                                            gap: 10px;
                                            justify-content: flex-start;
                                            font-family: 'Noto Kufi Arabic', sans-serif;
                                        ">
                                            <img src="${icons.dna}" style="margin-top:15px; width: 20px; height: 20px;" alt="الحمض النووي" />
                                            <span>النسب</span>
                                        </h3>
                                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                            <div style="
                                                background: #F9F9F9;
                                                padding: 16px;
                                                border-radius: 8px;
                                                border: 1px solid rgba(212, 175, 55, 0.2);
                                                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
                                            ">
                                                <p style="color: #777777; font-size: 12px; margin: 0 0 4px 0;">رقم تسجيل الأب</p>
                                                <p style="color: #333333; font-weight: 500; margin: 0; font-family: 'Noto Kufi Arabic', sans-serif;">${horseData.fatherRegistrationNumber || 'غير متوفر'}</p>
                                            </div>
                                            <div style="
                                                background: #F9F9F9;
                                                padding: 16px;
                                                border-radius: 8px;
                                                border: 1px solid rgba(212, 175, 55, 0.2);
                                                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
                                            ">
                                                <p style="color: #777777; font-size: 12px; margin: 0 0 4px 0;">رقم تسجيل الأم</p>
                                                <p style="color: #333333; font-weight: 500; margin: 0; font-family: 'Noto Kufi Arabic', sans-serif;">${horseData.motherRegistrationNumber || 'غير متوفر'}</p>
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
                                            justify-content: flex-start;
                                            font-family: 'Noto Kufi Arabic', sans-serif;
                                        ">
                                            <img src="${icons.medal}" style="margin-top:15px; width: 20px; height: 20px;" alt="ميدالية" />
                                            <span>الأنشطة والخبرات</span>
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
                                                    <span style="color: #333333; font-weight: 500; margin-bottom: 6px; font-family: 'Noto Kufi Arabic', sans-serif;">${getActivityName(activity.activity, 'ar')}</span>
                                                    <span style="color: #D4AF37; font-size: 14px;">${getLevelName(activity.level, 'ar')}</span>
                                                </div>
                                            `).join('') || '<p style="color: #555555; text-align: center; width: 100%;">لا توجد أنشطة مسجلة</p>'}
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
                                            justify-content: flex-start;
                                            font-family: 'Noto Kufi Arabic', sans-serif;
                                        ">
                                            <img src="${icons.trophy}" style="margin-top:15px; width: 20px; height: 20px;" alt="كأس" />
                                            <span>الإنجازات</span>
                                        </h3>
                                        <div style="
                                            background: #F9F9F9;
                                            padding: 20px;
                                            border-radius: 8px;
                                            border: 1px solid rgba(212, 175, 55, 0.2);
                                            position: relative;
                                            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
                                        ">
                                            <p style="color: #555555; margin: 0; line-height: 1.6; font-family: 'Noto Sans Arabic', sans-serif;">${horseData.achievements ? horseData.achievements : 'لا توجد إنجازات مسجلة'}</p>
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
                                            justify-content: flex-start;
                                            font-family: 'Noto Kufi Arabic', sans-serif;
                                        ">
                                            <img src="${icons.award}" style="margin-top:15px; width: 20px; height: 20px;" alt="جائزة" />
                                            <span>السجلات الصحية</span>
                                        </h3>
                                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                            <div>
                                                <h4 style="color: #777777; font-size: 14px; margin: 0 0 10px 0; font-family: 'Noto Kufi Arabic', sans-serif;">شهادات الصحة</h4>
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
                                                                margin-left: 10px;
                                                            "></div>
                                                            <span>${String(cert)}</span>
                                                        </li>
                                                    `).join('') || '<li style="color: #555555;">غير متوفرة</li>'}
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 style="color: #777777; font-size: 14px; margin: 0 0 10px 0; font-family: 'Noto Kufi Arabic', sans-serif;">سجلات التطعيم</h4>
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
                                                                margin-left: 10px;
                                                            "></div>
                                                            <span>${String(vacc)}</span>
                                                        </li>
                                                    `).join('') || '<li style="color: #555555;">غير متوفرة</li>'}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
    
                            <!-- Footer -->
                            <div style="
                                background: #F9F9F9;
                                padding: 0px 32px 10px;
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
                                            margin-left: 12px;
                                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                                        ">
                                            <img src="${icons.fileText}" style="width: 16px; height: 16px;" alt="ملف" />
                                        </div>
                                        <div>
                                            <p style="color: #777777; font-size: 12px; margin: 0 0 2px 0;">رابط الملف الشخصي</p>
                                            <a href="${horseData.url || window.location.href}" style="color: #D4AF37; text-decoration: none; font-size: 14px; direction: ltr; display: inline-block;">${horseData.url || window.location.href}</a>
                                        </div>
                                    </div>
                                    <div style="color: #444444;">
                                        <p style="color: #777777; font-size: 12px; margin: 0 0 2px 0;">معلومات الاتصال</p>
                                        <p style="font-size: 14px; margin: 0; font-family: 'Noto Kufi Arabic', sans-serif;">${ownerData?.fullName || 'مالك الحصان'} • ${ownerData?.email || 'غير متوفر'}</p>
                                        <p style="font-size: 14px; margin: 0; direction: ltr; display: inline-block;">${ownerData?.phoneNumber || 'لا يوجد هاتف'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const options = {
                margin: [5, 5, 5, 5],
                filename: `${horseData.fullName}_الملف_الشخصي.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    logging: false,
                    backgroundColor: null,
                    width: 794
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait',
                    compress: true,
                    precision: 16,
                    putOnlyUsedFonts: true
                },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            const element = document.createElement('div');
            element.innerHTML = htmlContent;
            document.body.appendChild(element);

            // Load Arabic fonts dynamically if not already included
            const fontUrls = [
                'https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap',
                'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap'
            ];

            const fontPromises = fontUrls.map(url => {
                if (!document.querySelector(`link[href="${url}"]`)) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = url;
                    document.head.appendChild(link);
                    return new Promise(resolve => link.onload = resolve);
                }
                return Promise.resolve();
            });

            await Promise.all(fontPromises);

            // Wait a small amount of time to ensure fonts are loaded
            await new Promise(resolve => setTimeout(resolve, 300));

            // Dynamically import html2pdf.js only on client side
            const html2pdf = (await import('html2pdf.js')).default;

            await html2pdf()
                .set(options)
                .from(element)
                .save();

            document.body.removeChild(element);
        } catch (error) {
            console.error("Error generating Arabic PDF:", error);
            showAlert("فشل في إنشاء ملف PDF. يرجى المحاولة مرة أخرى.");
        } finally {
            setDownloadingPdf(false);
        }
    };

    const renderStars = (rating, interactive = false) => {
        const fullStars = Math.floor(rating); // Number of fully filled stars
        const decimalPart = rating - fullStars; // Decimal part for partial star
        const stars = [];

        // Add full stars
        for (let i = 1; i <= fullStars; i++) {
            stars.push(
                <Star
                    key={i}
                    size={20}
                    className={`cursor-${interactive ? 'pointer' : 'default'} text-yellow-400 fill-yellow-400`}
                    onClick={interactive ? () => setUserRating(i) : null}
                />
            );
        }

        // Add partial star if applicable
        if (decimalPart > 0 && fullStars < 5) {
            stars.push(
                <div key="partial" className="relative inline-block">
                    <Star
                        size={20}
                        className={`cursor-${interactive ? 'pointer' : 'default'} text-gray-300`}
                    />
                    <div
                        className="absolute top-0 left-0 overflow-hidden"
                        style={{ width: `${decimalPart * 100}%` }}
                    >
                        <Star
                            size={20}
                            className={`cursor-${interactive ? 'pointer' : 'default'} text-yellow-400 fill-yellow-400`}
                        />
                    </div>
                </div>
            );
        }

        // Add empty stars to complete 5
        for (let i = fullStars + (decimalPart > 0 ? 1 : 0) + 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={20}
                    className={`cursor-${interactive ? 'pointer' : 'default'} text-gray-300`}
                    onClick={interactive ? () => setUserRating(i) : null}
                />
            );
        }

        return <div className="flex">{stars}</div>;
    };

    if (loading) return <Layout><div className="min-h-screen flex items-center justify-center"><p>{t('horseDetails:loadingProfile')}</p></div></Layout>;
    if (!horseData) return <Layout><div className="min-h-screen flex items-center justify-center"><p>{t('horseDetails:horseNotFound')}</p></div></Layout>;

    return (
        <Layout>
            <div className="bg-gray-50 min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
                <Alert
                    message={alert.message}
                    isVisible={alert.isVisible}
                    onClose={() => setAlert({ isVisible: false, message: '', type: 'error' })}
                    type={alert.type}
                />

                <div className="z-1 relative h-[500px] overflow-hidden"> {/* Changed height from h-96 to h-[500px] */}
                    <Image
                        width={800}
                        height={500}
                        src={images[0] || '/api/placeholder/800/500'}
                        alt={horseData.fullName || "horse image"}
                        className="w-full h-full object-cover object-center" /* Added object-center */
                    />
                    <div className="z-2 absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50"></div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div className="flex justify-between items-end">
                            <div>
                                <div className='flex Justify-center items-center'>
                                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{horseData.fullName}</h1>
                                    <div className={`flex items-center gap-1 ${isRTL ? "mr-2" : "ml-2"}`}>
                                        <span className="ml-1 text-yellow-400 font-medium">{horseData.averageRating ? horseData.averageRating.toFixed(1) : '0.0'}</span>
                                        <Star size={20} className="text-yellow-400 fill-yellow-400" />
                                    </div>
                                </div>
                                <div className='flex gap-5'>
                                    <p className="text-lg opacity-90 flex justify-center items-center">{getBreedName(horseData.breed)}</p>
                                    <span className="font-medium flex items-center bg-white rounded-xl p-2">
                                        {getProfileTier(horseData.profileLevel).icon}
                                        <span className={`ml-1 ${getProfileTier(horseData.profileLevel).color}`}>
                                            {getProfileTier(horseData.profileLevel).name}
                                        </span>
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={toggleWishlist}
                                    className="bg-blue-50 bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={wishlistLoading}
                                >
                                    {wishlistLoading ? (
                                        <div className="w-6 h-6 border-2 border-t-blue-500 border-blue-200 rounded-full animate-spin" />
                                    ) : (
                                        <Heart size={24} className={isInWishlist ? "text-red-500 fill-red-500" : "text-white"} />
                                    )}
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
                            <Image width={32} height={32} src={image} alt={`${horseData.fullName} - ${index + 1}`} className="w-full h-full object-cover" />
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
                            <Image
                                fill
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
                                        <p className="text-xs text-gray-500">{t('horseDetails:birthDate')}</p>
                                        <p className="font-medium text-sm">{formatDate(horseData.birthDate)}</p>
                                    </div>
                                    <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                                        <Shield size={24} className="text-blue-600 mb-1" />
                                        <p className="text-xs text-gray-500">{t('horseDetails:gender')}</p>
                                        <p className="font-medium text-sm capitalize">{horseData.gender}</p>
                                    </div>
                                    <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                                        <MapPin size={24} className="text-blue-600 mb-1" />
                                        <p className="text-xs text-gray-500">{t('horseDetails:purpose')}</p>
                                        <p className="font-medium text-sm">{getPurposeName(horseData.listingPurpose)}</p>
                                    </div>
                                    <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                                        <Award size={24} className="text-blue-600 mb-1" />
                                        <p className="text-xs text-gray-500">{t('horseDetails:achievements')}</p>
                                        <p className="font-medium text-sm">{horseData.achievements ? '✓' : 'None'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                                <div className="border-b border-gray-200">
                                    <div className="flex">
                                        <button onClick={() => setActiveTab('overview')} className={`px-4 py-3 font-medium text-sm ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>{t('horseDetails:overview')}</button>
                                        <button onClick={() => setActiveTab('details')} className={`px-4 py-3 font-medium text-sm ${activeTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>{t('horseDetails:details')}</button>
                                        <button onClick={() => setActiveTab('lineage')} className={`px-4 py-3 font-medium text-sm ${activeTab === 'lineage' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>{t('horseDetails:lineage')}</button>
                                        <button onClick={() => setActiveTab('activities')} className={`px-4 py-3 font-medium text-sm ${activeTab === 'activities' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>{t('horseDetails:activities')}</button>
                                        <button onClick={() => setActiveTab('documents')} className={`px-4 py-3 font-medium text-sm ${activeTab === 'documents' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>{t('horseDetails:documents')}</button>
                                        <button onClick={() => setActiveTab('ratings')} className={`px-4 py-3 font-medium text-sm ${activeTab === 'ratings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>{t('horseDetails:ratings')}</button>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {activeTab === 'overview' && (
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h2 className="text-xl font-bold">{t('horseDetails:about')} {horseData.fullName}</h2>
                                                <button
                                                    onClick={isRTL ? generateArabicPDF : generatePDF}
                                                    disabled={downloadingPdf}
                                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                                                >
                                                    <Download size={16} />
                                                    {downloadingPdf ? t('horseDetails:generating') : t('horseDetails:downloadProfilePDF')}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h3 className="font-semibold mb-2 text-gray-700">{t('horseDetails:basicInformation')}</h3>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between py-1 border-b border-gray-100">
                                                            <span className="text-gray-500">{t('horseDetails:breed')}</span>
                                                            <span className="font-medium">{getBreedName(horseData.breed)}</span>
                                                        </div>
                                                        <div className="flex justify-between py-1 border-b border-gray-100">
                                                            <span className="text-gray-500">{t('horseDetails:mainColor')}</span>
                                                            <span className="font-medium">{getColorName(horseData.mainColor)}</span>
                                                        </div>
                                                        {horseData.additionalColors?.length > 0 && (
                                                            <div className="flex justify-between py-1 border-b border-gray-100">
                                                                <span className="text-gray-500">{t('horseDetails:additionalColors')}</span>
                                                                <span className="font-medium">{horseData.additionalColors.map(color => getColorName(color)).join(', ')}</span>
                                                            </div>
                                                        )}
                                                        {(horseData.distinctiveMarkArabic || horseData.distinctiveMarkEnglish) && (
                                                            <div className="flex justify-between py-1 border-b border-gray-100">
                                                                <span className="text-gray-500">{t('horseDetails:distinctiveMark')}</span>
                                                                <span className="font-medium">{isRTL ? horseData.distinctiveMarkArabic || horseData.distinctiveMarkEnglish : horseData.distinctiveMarkEnglish || horseData.distinctiveMarkArabic}</span>
                                                            </div>
                                                        )}
                                                        {horseData.electronicChipNumber && (
                                                            <div className="flex justify-between py-1 border-b border-gray-100">
                                                                <span className="text-gray-500">{t('horseDetails:electronicChip')}</span>
                                                                <span className="font-medium">{horseData.electronicChipNumber}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between py-1 border-b border-gray-100">
                                                            <span className="text-gray-500">{t('horseDetails:loveCounter')}</span>
                                                            <span className="font-medium flex items-center">
                                                                <Heart size={16} className={`text-red-500 ${isRTL ? "ml-1" : "mr-1"}`} />
                                                                {horseData.loveCounter || 0}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between py-1 border-b border-gray-100">
                                                            <span className="text-gray-500">{t('horseDetails:profileLevel')}</span>
                                                            <span className="font-medium flex items-center">
                                                                {getProfileTier(horseData.profileLevel).icon}
                                                                <span className={`${isRTL ? "mr-1" : "ml-1"} ${getProfileTier(horseData.profileLevel).color}`}>
                                                                    {getProfileTier(horseData.profileLevel).name}
                                                                </span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold mb-2 text-gray-700">{t('horseDetails:registrationInformation')}</h3>
                                                    <div className="space-y-2">
                                                        {horseData.passportNumber && (
                                                            <div className="flex justify-between py-1 border-b border-gray-100">
                                                                <span className="text-gray-500">{t('horseDetails:passportNumber')}</span>
                                                                <span className="font-medium">{horseData.passportNumber}</span>
                                                            </div>
                                                        )}
                                                        {horseData.nationalID && (
                                                            <div className="flex justify-between py-1 border-b border-gray-100">
                                                                <span className="text-gray-500">{t('horseDetails:nationalID')}</span>
                                                                <span className="font-medium">{horseData.nationalID}</span>
                                                            </div>
                                                        )}
                                                        {horseData.insurancePolicyNumber && (
                                                            <div className="flex justify-between py-1 border-b border-gray-100">
                                                                <span className="text-gray-500">{t('horseDetails:insurancePolicy')}</span>
                                                                <span className="font-medium">{horseData.insurancePolicyNumber}</span>
                                                            </div>
                                                        )}
                                                        {(horseData.insuranceDetailsArabic || horseData.insuranceDetailsEnglish) && (
                                                            <div className="flex justify-between py-1 border-b border-gray-100">
                                                                <span className="text-gray-500">{t('horseDetails:insuranceDetails')}</span>
                                                                <span className="font-medium">{isRTL ? horseData.insuranceDetailsArabic || horseData.insuranceDetailsEnglish : horseData.insuranceDetailsEnglish || horseData.insuranceDetailsArabic}</span>
                                                            </div>
                                                        )}
                                                        {horseData.insuranceEndDate && (
                                                            <div className="flex justify-between py-1 border-b border-gray-100">
                                                                <span className="text-gray-500">{t('horseDetails:insuranceEndDate')}</span>
                                                                <span className="font-medium">{formatDate(horseData.insuranceEndDate)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {horseData.achievements && (
                                                <div className="mt-6">
                                                    <h3 className="font-semibold mb-2 text-gray-700">{t('horseDetails:achievements')}</h3>
                                                    <p className="text-gray-700">{horseData.achievements}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'details' && (
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h2 className="text-xl font-bold">{t('horseDetails:details')}</h2>
                                                <button onClick={generatePDF} disabled={downloadingPdf} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                                                    <Download size={16} />
                                                    {downloadingPdf ? t('horseDetails:generating') : t('horseDetails:downloadProfilePDF')}
                                                </button>
                                            </div>
                                            <div className="space-y-6">
                                                {horseData.listingPurpose === 'sale' && horseData.marketValue && (
                                                    <div className="bg-blue-50 p-4 rounded-lg">
                                                        <h3 className="font-semibold text-blue-800">{t('horseDetails:marketValue')}</h3>
                                                        <p className="text-2xl font-bold text-blue-900">${horseData.marketValue.toLocaleString()}</p>
                                                    </div>
                                                )}
                                                {horseData.listingPurpose === 'rent' && (
                                                    <div className="bg-green-50 p-4 rounded-lg">
                                                        <h3 className="font-semibold text-green-800">{t('horseDetails:availableForRent')}</h3>
                                                        <p className="text-green-900">{t('horseDetails:contactForPricing')}</p>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <h3 className="font-semibold mb-2 text-gray-700">{t('horseDetails:physicalCharacteristics')}</h3>
                                                        <div className="bg-gray-50 p-4 rounded-lg">
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between py-1 border-b border-gray-200">
                                                                    <span className="text-gray-500">{t('horseDetails:mainColor')}</span>
                                                                    <span className="font-medium">{getColorName(horseData.mainColor)}</span>
                                                                </div>
                                                                {horseData.additionalColors?.length > 0 && (
                                                                    <div className="flex justify-between py-1 border-b border-gray-200">
                                                                        <span className="text-gray-500">{t('horseDetails:additionalColors')}</span>
                                                                        <span className="font-medium">{horseData.additionalColors.map(color => getColorName(color)).join(', ')}</span>
                                                                    </div>
                                                                )}
                                                                {(horseData.distinctiveMarkArabic || horseData.distinctiveMarkEnglish) && (
                                                                    <div className="flex justify-between py-1 border-b border-gray-200">
                                                                        <span className="text-gray-500">{t('horseDetails:distinctiveMark')}</span>
                                                                        <span className="font-medium">{isRTL ? horseData.distinctiveMarkArabic || horseData.distinctiveMarkEnglish : horseData.distinctiveMarkEnglish || horseData.distinctiveMarkArabic}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex justify-between py-1 border-b border-gray-200">
                                                                    <span className="text-gray-500">{t('horseDetails:gender')}</span>
                                                                    <span className="font-medium capitalize">{horseData.gender}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold mb-2 text-gray-700">{t('horseDetails:identification')}</h3>
                                                        <div className="bg-gray-50 p-4 rounded-lg">
                                                            <div className="space-y-2">
                                                                {horseData.electronicChipNumber && (
                                                                    <div className="flex justify-between py-1 border-b border-gray-200">
                                                                        <span className="text-gray-500">{t('horseDetails:electronicChip')}</span>
                                                                        <span className="font-medium">{horseData.electronicChipNumber}</span>
                                                                    </div>
                                                                )}
                                                                {horseData.passportNumber && (
                                                                    <div className="flex justify-between py-1 border-b border-gray-200">
                                                                        <span className="text-gray-500">{t('horseDetails:passportNumber')}</span>
                                                                        <span className="font-medium">{horseData.passportNumber}</span>
                                                                    </div>
                                                                )}
                                                                {horseData.nationalID && (
                                                                    <div className="flex justify-between py-1 border-b border-gray-200">
                                                                        <span className="text-gray-500">{t('horseDetails:nationalID')}</span>
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
                                                <h2 className="text-xl font-bold">{t('horseDetails:lineage')}</h2>
                                                <button onClick={generatePDF} disabled={downloadingPdf} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                                                    <Download size={16} />
                                                    {downloadingPdf ? t('horseDetails:generating') : t('horseDetails:downloadProfilePDF')}
                                                </button>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <h3 className="font-semibold mb-2 text-gray-700">{t('horseDetails:parentRegistration')}</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {horseData.fatherRegistrationNumber && (
                                                            <div className="p-3 bg-white rounded-lg shadow-sm">
                                                                <p className="text-xs text-gray-500">{t('horseDetails:fatherRegistrationNumber')}</p>
                                                                <p className="font-medium">{horseData.fatherRegistrationNumber}</p>
                                                            </div>
                                                        )}
                                                        {horseData.motherRegistrationNumber && (
                                                            <div className="p-3 bg-white rounded-lg shadow-sm">
                                                                <p className="text-xs text-gray-500">{t('horseDetails:motherRegistrationNumber')}</p>
                                                                <p className="font-medium">{horseData.motherRegistrationNumber}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {horseData.lineageDetailsArabic && (
                                                    <div>
                                                        <h3 className="font-semibold mb-2 text-gray-700">{t('horseDetails:lineageDetailsArabic')}</h3>
                                                        <p className="text-gray-700 rounded-lg bg-gray-50 p-4">{horseData.lineageDetailsArabic}</p>
                                                    </div>
                                                )}
                                                {horseData.lineageDetailsEnglish && (
                                                    <div>
                                                        <h3 className="font-semibold mb-2 text-gray-700">{t('horseDetails:lineageDetailsEnglish')}</h3>
                                                        <p className="text-gray-700 rounded-lg bg-gray-50 p-4">{horseData.lineageDetailsEnglish}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'activities' && (
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h2 className="text-xl font-bold">{t('horseDetails:activities')}</h2>
                                                <button onClick={generatePDF} disabled={downloadingPdf} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                                                    <Download size={16} />
                                                    {downloadingPdf ? t('horseDetails:generating') : t('horseDetails:downloadProfilePDF')}
                                                </button>
                                            </div>
                                            {horseData.horseActivities?.length > 0 ? (
                                                <div className="space-y-4">
                                                    {horseData.horseActivities.map((activity, index) => (
                                                        <div key={index} className="bg-gray-50 p-4 rounded-lg flex items-center">
                                                            <div className={`bg-blue-100 p-3 rounded-full ${isRTL ? 'mlbg-gray-50 p-4 rounded-lg flex items-center-4' : 'mr-4'}`}>
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
                                                            <h3 className="font-semibold mb-2 text-gray-700">{t('horseDetails:achievements')}</h3>
                                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                                <p className="text-gray-700">{horseData.achievements}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500">{t('horseDetails:noActivities')}</p>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'documents' && (
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h2 className="text-xl font-bold">{t('horseDetails:documentsAndCertificates')}</h2>
                                                <button onClick={generatePDF} disabled={downloadingPdf} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                                                    <Download size={16} />
                                                    {downloadingPdf ? t('horseDetails:generating') : t('horseDetails:downloadProfilePDF')}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                                                    <div className="bg-blue-100 p-3 rounded-full mx-4">
                                                        <FileText size={24} className="text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium">{t('horseDetails:ownershipCertificate')}</h3>
                                                        <p className="text-sm text-gray-500">{horseData.ownershipCertificate ? t('horseDetails:available') : t('horseDetails:notAvailable')}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                                                    <div className="bg-blue-100 p-3 rounded-full mx-4">
                                                        <Dna size={24} className="text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium">{t('horseDetails:geneticAnalysis')}</h3>
                                                        <p className="text-sm text-gray-500">{horseData.geneticAnalysis ? t('horseDetails:available') : t('horseDetails:notAvailable')}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                                                    <div className="bg-blue-100 p-3 rounded-full mx-4">
                                                        <Shield size={24} className="text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium">{t('horseDetails:healthCertificates')}</h3>
                                                        <p className="text-sm text-gray-500">{horseData.healthCertificates?.length > 0 ? `${horseData.healthCertificates.length} ${t('horseDetails:available')}` : t('horseDetails:notAvailable')}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                                                    <div className="bg-blue-100 p-3 rounded-full mx-4">
                                                        <Clipboard size={24} className="text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium">{t('horseDetails:vaccinationRecords')}</h3>
                                                        <p className="text-sm text-gray-500">{horseData.vaccinationCertificates?.length > 0 ? `${horseData.vaccinationCertificates.length} ${t('horseDetails:available')}` : t('horseDetails:notAvailable')}</p>
                                                    </div>
                                                </div>
                                                {horseData.passportImage && (
                                                    <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                                                        <div className="bg-blue-100 p-3 rounded-full mx-4">
                                                            <Info size={24} className="text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium">{t('horseDetails:passportImage')}</h3>
                                                            <p className="text-sm text-gray-500">{t('horseDetails:available')}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {horseData.internationalTransportPermit && (
                                                    <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                                                        <div className="bg-blue-100 p-3 rounded-full mx-4">
                                                            <MapPin size={24} className="text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium">{t('horseDetails:transportPermit')}</h3>
                                                            <p className="text-sm text-gray-500">{t('horseDetails:available')}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'ratings' && (
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h2 className="text-xl font-bold">{t('horseDetails:horseRating')}</h2>
                                                <button
                                                    onClick={isRTL ? generateArabicPDF : generatePDF}
                                                    disabled={downloadingPdf}
                                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                                                >
                                                    <Download size={16} />
                                                    {downloadingPdf ? t('horseDetails:generating') : t('horseDetails:downloadProfilePDF')}
                                                </button>
                                            </div>

                                            {/* Average Rating Display */}
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 bg-gradient-to-r from-gray-50 to-gray-100 p-5 rounded-lg border border-gray-200 shadow-sm">
                                                <div className="flex items-center mb-3 sm:mb-0">
                                                    <div className="flex items-center bg-white px-4 py-2 rounded-xl shadow-md border border-gray-200 transition-all hover:shadow-lg">
                                                        <div className="flex items-center">
                                                            <div className="mr-3">{renderStars(horseData?.averageRating || 0)}</div>
                                                            <div className="h-10 w-px bg-gray-200 mx-2"></div>
                                                            <div className="flex flex-col ml-2">
                                                                <span className="text-2xl font-bold text-yellow-600">
                                                                    {horseData?.averageRating ? horseData.averageRating.toFixed(1) : '0.0'}
                                                                </span>
                                                                <span className="text-sm font-medium text-gray-600">
                                                                    <span className="font-semibold">{horseData?.ratingCount || 0}</span> {t('horseDetails:reviews')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="mt-2 text-sm text-gray-600 italic bg-white px-3 py-1 rounded-md shadow-sm border border-gray-100">
                                                    {t('horseDetails:basedOnReviews')}
                                                </span>
                                            </div>

                                            {/* User Rating Submission */}
                                            <div className="bg-gray-100 p-5 rounded-lg shadow-sm border border-yellow-100 mb-6">
                                                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                    <MessageSquare size={20} className="text-yellow-500" />
                                                    {t('horseDetails:rateThisHorse')}
                                                </h4>
                                                <form onSubmit={handleRatingSubmit}>
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                                                        <div className="flex items-center bg-white py-2 px-3 rounded-md border border-gray-200 shadow-sm">
                                                            {renderStars(userRating, true)}
                                                            <span className="ml-2 text-sm text-gray-600 min-w-20">
                                                                {userRating ? `${userRating}/5` : t('horseDetails:selectRating')}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-gray-500">{t('horseDetails:clickToRate')}</span>
                                                    </div>
                                                    <div className="relative mb-4">
                                                        <textarea
                                                            value={userComment}
                                                            onChange={(e) => setUserComment(e.target.value)}
                                                            placeholder={t('horseDetails:leaveComment')}
                                                            maxLength={200}
                                                            className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                                                            rows={3}
                                                        />
                                                        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                                                            {userComment.length}/200
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="submit"
                                                        disabled={!userRating || isSubmitting}
                                                        className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-md transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Star size={18} />
                                                        {isSubmitting ? t('horseDetails:submitting') : t('horseDetails:submitRating')}
                                                    </button>
                                                </form>
                                            </div>

                                            {/* Existing Ratings */}
                                            <div className="mt-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                                                        <Users size={18} className="text-gray-500" />
                                                        {t('horseDetails:userReviews')}
                                                    </h4>
                                                </div>
                                                <div className="max-h-72 overflow-y-auto pr-1 rounded-md">
                                                    {ratings.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {ratings.map((rating, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                                                                >
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <div className="flex items-center gap-2">
                                                                            {/* User Image or Icon */}
                                                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                                                                {rating.user?.image ? (
                                                                                    <Image
                                                                                        src={
                                                                                            rating.user.image.asset
                                                                                                ? urlFor(rating.user.image).url()
                                                                                                : rating.user.image._upload?.previewImage
                                                                                                    ? rating.user.image._upload.previewImage
                                                                                                    : "/api/placeholder/100/100"
                                                                                        }
                                                                                        alt={rating.user?.userName || 'User'}
                                                                                        className="w-full h-full object-cover"
                                                                                        width={32}
                                                                                        height={32}
                                                                                        onError={(e) => (e.target.src = "/api/placeholder/100/100")}
                                                                                    />
                                                                                ) : (
                                                                                    <User size={16} className="text-gray-500" />
                                                                                )}
                                                                            </div>
                                                                            <span className="font-medium text-gray-800">
                                                                                {rating.user?.userName || t('horseDetails:anonymous')}
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">
                                                                            {new Date(rating.date).toLocaleDateString()}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center mb-2">
                                                                        {renderStars(rating.rating)}
                                                                        <span className="ml-2 text-sm font-medium text-yellow-600">
                                                                            {rating.rating}/5
                                                                        </span>
                                                                    </div>
                                                                    {rating.comment && (
                                                                        <p className="text-gray-600 text-sm mt-1 bg-gray-50 p-2 rounded-md">
                                                                            {rating.comment}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                                                            <MessageSquareOff size={36} className="text-gray-300 mx-auto mb-2" />
                                                            <p className="text-gray-500 text-sm">{t('horseDetails:noRatingsYet')}</p>
                                                            <p className="text-gray-400 text-xs mt-1">{t('horseDetails:beTheFirstToRate')}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-100">
                                <div className="p-6">
                                    {/* Price */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700 font-medium">{t('horseDetails:price')}:</span>
                                        <div className="flex flex-col items-end">
                                            <span className="text-2xl font-bold text-blue-600">${horseData.marketValue?.toLocaleString() || t('horseDetails:contactForPrice')}</span>
                                            {!horseData.marketValue && (
                                                <span className="text-sm text-blue-500 mt-1">{t('horseDetails:contactForPrice')}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-4 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                                        <p className="text-gray-600 text-sm flex flex-col gap-1">
                                            <span className="font-medium text-amber-700">{t('horseDetails:note')}:</span>
                                            <span>{t('horseDetails:marketValueNote')}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            {horseData.listingPurpose === 'sale' && (
                                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                                    <h3 className="text-xl font-bold mb-2">{t('horseDetails:interestedInHorse')}</h3>
                                    <p className="text-gray-600 mb-4">{t('horseDetails:forSale')}</p>
                                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-700">{t('horseDetails:price')}:</span>
                                            <span className="text-xl font-bold text-blue-600">${horseData.marketValue?.toLocaleString() || t('horseDetails:contactForPrice')}</span>
                                        </div>
                                    </div>
                                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg">{t('horseDetails:contactSeller')}</button>
                                </div>
                            )}
                            {horseData.listingPurpose === 'rent' && (
                                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                                    <h3 className="text-xl font-bold mb-2">{t('horseDetails:interestedInHorse')}</h3>
                                    <p className="text-gray-600 mb-4">{t('horseDetails:forRent')}</p>
                                    <button onClick={() => setShowReservationPopup(true)} className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg">{t('horseDetails:checkAvailability')}</button>
                                </div>
                            )}
                            {horseData.listingPurpose === 'training' && (
                                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                                    <h3 className="text-xl font-bold mb-2">{t('horseDetails:trainingAvailable')}</h3>
                                    <p className="text-gray-600 mb-4">{t('horseDetails:trainingAvailable')}</p>
                                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg">{t('horseDetails:bookTraining')}</button>
                                </div>
                            )}

                            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                                <h3 className="font-bold mb-4">{t('horseDetails:quickFacts')}</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <Calendar size={18} className={`text-blue-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                        <span className="text-gray-700 text-sm">{t('horseDetails:age')}: {horseData.birthDate ? `${new Date().getFullYear() - new Date(horseData.birthDate).getFullYear()} ${t('horseDetails:years')}` : t('horseDetails:unknown')}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Shield size={18} className={`text-blue-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                        <span className="text-gray-700 text-sm">{t('horseDetails:breed')}: {getBreedName(horseData.breed)}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <MapPin size={18} className={`text-blue-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                        <span className="text-gray-700 text-sm">{t('horseDetails:purpose')}: {getPurposeName(horseData.listingPurpose)}</span>
                                    </div>
                                    {horseData.electronicChipNumber && (
                                        <div className="flex items-center">
                                            <Info size={18} className={`text-blue-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                            <span className="text-gray-700 text-sm">{t('horseDetails:chip')}: {horseData.electronicChipNumber}</span>
                                        </div>
                                    )}
                                    {horseData.passportNumber && (
                                        <div className="flex items-center">
                                            <FileText size={18} className={`text-blue-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                            <span className="text-gray-700 text-sm">{t('horseDetails:passport')}: {horseData.passportNumber}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center">
                                        <Heart size={18} className={`text-red-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                        <span className="text-gray-700 text-sm">{t('horseDetails:loveCounter')}: {horseData.loveCounter || 0}</span>
                                    </div>
                                    <div className="flex items-center">
                                        {getProfileTier(horseData.profileLevel).icon}
                                        <span className={`text-sm ${getProfileTier(horseData.profileLevel).color} ${isRTL ? 'mr-2' : 'ml-2'}`}>{t('horseDetails:profileLevel')}: {getProfileTier(horseData.profileLevel).name}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                                <h3 className="font-bold mb-4">{t('horseDetails:contactOwner')}</h3>
                                <div className="flex items-center mb-4">
                                    <div className={`w-12 h-12 rounded-full bg-gray-200 ${isRTL ? 'ml-3' : 'mr-3'} overflow-hidden`}>
                                        <Image
                                            width={32}
                                            height={32}
                                            src={
                                                ownerData?.image
                                                    ? urlFor(ownerData.image).url()
                                                        ? urlFor(ownerData.image).url() // Sanity asset
                                                        : ownerData.image._upload?.previewImage // Base64 preview from upload
                                                            ? ownerData.image._upload.previewImage
                                                            : "/api/placeholder/100/100" // Fallback
                                                    : "/api/placeholder/100/100" // Fallback if no image
                                            }
                                            alt="Owner"
                                            className="w-full h-full object-cover"
                                            onError={(e) => (e.target.src = "/api/placeholder/100/100")} // Fallback on error
                                        />
                                    </div>
                                    <div>
                                        <p className="font-medium">{ownerData?.userName || 'Horse Owner'}</p>
                                        <p className="text-sm text-gray-500">{t('horseDetails:ownerSince')} {horseData.birthDate ? new Date(horseData.birthDate).getFullYear() : 'N/A'}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowContact(!showContact)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg flex items-center justify-center">
                                    <MessageSquare size={18} className="mx-2" />
                                    {t('horseDetails:seeContact')}
                                </button>
                                {showContact && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                                        {ownerData?.fullName && (
                                            <p className="flex items-center text-sm text-gray-700 mb-2">
                                                <User className="w-4 h-4 mr-2 text-gray-500" />
                                                <span className="font-medium">{t('horseDetails:fullName')}:</span>
                                                <span className="ml-1">{ownerData.fullName}</span>
                                            </p>
                                        )}
                                        {ownerData?.phoneNumber && (
                                            <p className="flex items-center text-sm text-gray-700 mb-2">
                                                <Phone className="w-4 h-4 mr-2 text-gray-500" />
                                                <span className="font-medium">{t('horseDetails:phone')}:</span>
                                                <a href={`tel:${ownerData.phoneNumber}`} className="ml-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors">{ownerData.phoneNumber}</a>
                                            </p>
                                        )}
                                        {ownerData?.email && (
                                            <p className="flex items-center text-sm text-gray-700">
                                                <Mail className="w-4 h-4 mr-2 text-gray-500" />
                                                <span className="font-medium">{t('horseDetails:email')}:</span>
                                                <a href={`mailto:${ownerData.email}`} className="ml-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors">{ownerData.email}</a>
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="font-bold mb-4">{t('horseDetails:similarHorses')}</h3>
                                <div className="space-y-4">
                                    {similarHorses.length > 0 ? (
                                        similarHorses.slice(0, 3).map((horse) => (
                                            <div key={horse._id} className="flex items-center cursor-pointer" onClick={() => router.replace(`/horses/${horse._id}`)}>
                                                <div className={`w-16 h-16 rounded-md bg-gray-200 ${isRTL ? 'ml-3' : 'mr-3'} overflow-hidden`}>
                                                    <Image fill src={horse.images?.[0] ? urlFor(horse.images[0]).url() : "/api/placeholder/100/100"} alt={horse.fullName || "image hourse"} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{horse.fullName}</p>
                                                    <p className="text-sm text-gray-500">{getBreedName(horse.breed)}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm">{t('horseDetails:noSimilarHorses')}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {showReservationPopup && (
                    <div className="fixed inset-0 bg-[#0000008a] bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">{t('horseDetails:makeReservation')}</h2>
                            <form onSubmit={handleReservationSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">{t('horseDetails:dateAndTime')}</label>
                                    <input type="datetime-local" name="datetime" className="w-full p-2 border rounded" required />
                                </div>
                                <div className="flex justify-end gap-4">
                                    <button type="button" onClick={() => setShowReservationPopup(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">{t('horseDetails:cancel')}</button>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{t('horseDetails:reserve')}</button>
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