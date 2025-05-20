"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Save, Award, Camera, FileText, Heart, Shield, CreditCard, Clipboard, Star, Trophy, Medal, AlertTriangle, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { client, urlFor } from "@/lib/sanity"; // Adjust path
import { useParams, useRouter } from "next/navigation";
import SearchableBreedDropdown from "../../../../../../components/elements/SearchableBreedDropdown"; // Adjust path
import Layout from "components/layout/Layout";
import Image from 'next/image';

// Custom Alert Component
const Alert = ({ message, isVisible, onClose, type }) => (
    <AnimatePresence>
        {isVisible && (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-auto"
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
                    <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none">×</button>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

export default function EditHorsePage() {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === "ar";
    const { horseId } = useParams();
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stables, setStables] = useState([]);
    const [trainersList, setTrainersList] = useState([]);
    const [formData, setFormData] = useState({
        fullName: "",
        breed: "",
        birthDate: "",
        gender: "",
        images: [],
        mainColor: "",
        additionalColors: [],
        distinctiveMarkArabic: "",
        distinctiveMarkEnglish: "",
        electronicChipNumber: "",
        passportNumber: "",
        nationalID: "",
        fatherRegistrationNumber: "",
        motherRegistrationNumber: "",
        lineageDetailsArabic: "",
        lineageDetailsEnglish: "",
        previousOwner: "",
        stableLocation: "",
        healthCertificates: [],
        vaccinationCertificates: [],
        geneticAnalysis: null,
        ownershipCertificate: null,
        internationalTransportPermit: null,
        passportImage: null,
        insurancePolicyNumber: "",
        insuranceDetailsArabic: "",
        insuranceDetailsEnglish: "",
        insuranceEndDate: "",
        horseActivities: [],
        achievements: "",
        trainers: [],
        listingPurpose: "",
        marketValue: 0,
        loveCounter: 0,
        profileLevel: "basic",
    });

    const [completionPercentage, setCompletionPercentage] = useState(0);
    const [alert, setAlert] = useState({ isVisible: false, message: "", type: "error" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // Verify user and check ownership
    useEffect(() => {
        const verifyUser = async () => {
            try {
                const response = await fetch('/api/auth/verify', {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();

                if (data.authenticated) {
                    setUser(data.user);

                    // Fetch horse data and check ownership
                    const query = `*[_type == "horse" && _id == $horseId][0] {
            _id,
            "ownerId": owner._ref
          }`;
                    const horse = await client.fetch(query, { horseId });

                    if (!horse || horse.ownerId !== data.user.id) {
                        router.push(`/horses/${horseId}`); // Redirect if not owner
                    }
                } else {
                    router.push('/login');
                }
            } catch (error) {
                console.error('Error verifying user:', error);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        verifyUser();
    }, [horseId, router]);

    // Fetch horse data
    useEffect(() => {
        const fetchHorseData = async () => {
            if (!horseId || !user) return;

            const query = `*[_type == "horse" && _id == $horseId][0]`;
            const result = await client.fetch(query, { horseId });
            if (result) {
                setFormData({
                    fullName: result.fullName || "",
                    breed: result.breed || "",
                    birthDate: result.birthDate ? result.birthDate.split("T")[0] : "",
                    gender: result.gender || "",
                    images: result.images || [],
                    mainColor: result.mainColor || "",
                    additionalColors: result.additionalColors || [],
                    distinctiveMarkArabic: result.distinctiveMarkArabic || "",
                    distinctiveMarkEnglish: result.distinctiveMarkEnglish || "",
                    electronicChipNumber: result.electronicChipNumber || "",
                    passportNumber: result.passportNumber || "",
                    nationalID: result.nationalID || "",
                    fatherRegistrationNumber: result.fatherRegistrationNumber || "",
                    motherRegistrationNumber: result.motherRegistrationNumber || "",
                    lineageDetailsArabic: result.lineageDetailsArabic || "",
                    lineageDetailsEnglish: result.lineageDetailsEnglish || "",
                    previousOwner: result.previousOwner || "",
                    stableLocation: result.stableLocation?._ref || "",
                    healthCertificates: result.healthCertificates || [],
                    vaccinationCertificates: result.vaccinationCertificates || [],
                    geneticAnalysis: result.geneticAnalysis || null,
                    ownershipCertificate: result.ownershipCertificate || null,
                    internationalTransportPermit: result.internationalTransportPermit || null,
                    passportImage: result.passportImage || null,
                    insurancePolicyNumber: result.insurancePolicyNumber || "",
                    insuranceDetailsArabic: result.insuranceDetailsArabic || "",
                    insuranceDetailsEnglish: result.insuranceDetailsEnglish || "",
                    insuranceEndDate: result.insuranceEndDate ? result.insuranceEndDate.split("T")[0] : "",
                    horseActivities: result.horseActivities || [],
                    achievements: result.achievements || "",
                    trainers: result.trainers || [],
                    listingPurpose: result.listingPurpose || "",
                    marketValue: result.marketValue || 0,
                    loveCounter: result.loveCounter || 0,
                    profileLevel: result.profileLevel || "basic",
                });
            }
        };

        fetchHorseData();
    }, [horseId, user]);

    // Fetch stables and trainers
    useEffect(() => {
        const fetchStables = async () => {
            const query = `*[_type == "services" && serviceType == "horse_stable" && statusAdminApproved == true && isMainService == true] {
        _id, name_en, name_ar
      }`;
            const result = await client.fetch(query);
            setStables(result);
        };

        const fetchTrainers = async () => {
            const query = `*[_type == "services" && serviceType == "horse_trainer" && statusAdminApproved == true && isMainService == true] {
        _id, name_en, name_ar
      }`;
            const result = await client.fetch(query);
            setTrainersList(result);
        };

        fetchStables();
        fetchTrainers();
    }, []);

    // Calculate completion percentage
    useEffect(() => {
        const totalFields = Object.keys(formData).length;
        let filledFields = 0;

        Object.entries(formData).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                if (value.length > 0) filledFields++;
            } else if (value !== null && value !== "" && value !== 0 && value !== "basic") {
                filledFields++;
            }
        });

        const percentage = Math.floor((filledFields / totalFields) * 100);
        setCompletionPercentage(percentage);
    }, [formData]);

    const getProfileTier = (percentage) => {
        if (percentage > 90) return { name: t("user:horseRegistration.profileTier.gold"), level: "gold", color: "text-amber-500", message: t("user:horseRegistration.profileTier.goldMessage"), icon: <Trophy className="text-amber-500" size={20} /> };
        if (percentage > 75) return { name: t("user:horseRegistration.profileTier.silver"), level: "silver", color: "text-gray-400", message: t("user:horseRegistration.profileTier.silverMessage"), icon: <Award className="text-gray-400" size={20} /> };
        if (percentage > 50) return { name: t("user:horseRegistration.profileTier.bronze"), level: "bronze", color: "text-orange-400", message: t("user:horseRegistration.profileTier.bronzeMessage"), icon: <Medal className="text-orange-400" size={20} /> };
        return { name: t("user:horseRegistration.profileTier.basic"), level: "basic", color: "text-gray-600", message: t("user:horseRegistration.profileTier.basicMessage"), icon: <Shield className="text-gray-600" size={20} /> };
    };

    const tier = getProfileTier(completionPercentage);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === "file") {
            setFormData({ ...formData, [name]: files ? Array.from(files) : null });
        } else if (type === "checkbox") {
            if (e.target.checked) {
                setFormData({ ...formData, [name]: [...formData[name], value] });
            } else {
                setFormData({ ...formData, [name]: formData[name].filter((item) => item !== value) });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleMultiSelect = (name, value) => {
        if (formData[name].includes(value)) {
            setFormData({ ...formData, [name]: formData[name].filter((item) => item !== value) });
        } else {
            setFormData({ ...formData, [name]: [...formData[name], value] });
        }
    };

    const uploadFileToSanity = async (file) => {
        const response = await client.assets.upload("file", file);
        return response._id;
    };

    const uploadImageToSanity = async (image) => {
        const response = await client.assets.upload("image", image);
        return response._id;
    };

    const showAlert = (message, type = "error") => {
        setAlert({ isVisible: true, message, type });
        setTimeout(() => setAlert({ isVisible: false, message: "", type: "error" }), 5000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const requiredFields = ["fullName", "breed", "birthDate", "gender", "images", "mainColor", "listingPurpose"];
        const isComplete = requiredFields.every((field) =>
            Array.isArray(formData[field]) ? formData[field].length > 0 : formData[field] !== ""
        ) && formData.marketValue > 0;

        if (!isComplete) {
            showAlert(t("user:horseRegistration.alerts.incompleteForm"), "error");
            setIsSubmitting(false);
            return;
        }

        try {
            const profileTier = getProfileTier(completionPercentage);

            const horseData = {
                fullName: formData.fullName,
                breed: formData.breed,
                birthDate: formData.birthDate,
                gender: formData.gender,
                mainColor: formData.mainColor,
                additionalColors: formData.additionalColors,
                distinctiveMarkArabic: formData.distinctiveMarkArabic,
                distinctiveMarkEnglish: formData.distinctiveMarkEnglish,
                electronicChipNumber: formData.electronicChipNumber,
                passportNumber: formData.passportNumber,
                nationalID: formData.nationalID,
                fatherRegistrationNumber: formData.fatherRegistrationNumber,
                motherRegistrationNumber: formData.motherRegistrationNumber,
                lineageDetailsArabic: formData.lineageDetailsArabic,
                lineageDetailsEnglish: formData.lineageDetailsEnglish,
                previousOwner: formData.previousOwner,
                insurancePolicyNumber: formData.insurancePolicyNumber,
                insuranceDetailsArabic: formData.insuranceDetailsArabic,
                insuranceDetailsEnglish: formData.insuranceDetailsEnglish,
                insuranceEndDate: formData.insuranceEndDate,
                horseActivities: formData.horseActivities,
                achievements: formData.achievements,
                trainers: formData.trainers,
                listingPurpose: formData.listingPurpose,
                marketValue: Number(formData.marketValue),
                loveCounter: formData.loveCounter,
                profileLevel: profileTier.level,
            };

            if (formData.images.length > 0 && formData.images[0] instanceof File) {
                horseData.images = await Promise.all(
                    formData.images.map(async (image) => ({
                        _type: "image",
                        _key: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
                        asset: { _ref: await uploadImageToSanity(image) },
                    }))
                );
            }

            if (formData.stableLocation && formData.stableLocation !== "") {
                horseData.stableLocation = { _type: "reference", _ref: formData.stableLocation };
            }

            if (formData.healthCertificates.length > 0 && formData.healthCertificates[0] instanceof File) {
                horseData.healthCertificates = await Promise.all(
                    formData.healthCertificates.map(async (file) => ({
                        _type: "file",
                        _key: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
                        asset: { _ref: await uploadFileToSanity(file) },
                    }))
                );
            }

            if (formData.vaccinationCertificates.length > 0 && formData.vaccinationCertificates[0] instanceof File) {
                horseData.vaccinationCertificates = await Promise.all(
                    formData.vaccinationCertificates.map(async (file) => ({
                        _type: "file",
                        _key: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
                        asset: { _ref: await uploadFileToSanity(file) },
                    }))
                );
            }

            if (formData.geneticAnalysis?.[0] instanceof File) {
                horseData.geneticAnalysis = {
                    _type: "file",
                    _key: `${Date.now()}-genetic`,
                    asset: { _ref: await uploadFileToSanity(formData.geneticAnalysis[0]) },
                };
            }

            if (formData.ownershipCertificate?.[0] instanceof File) {
                horseData.ownershipCertificate = {
                    _type: "file",
                    _key: `${Date.now()}-ownership`,
                    asset: { _ref: await uploadFileToSanity(formData.ownershipCertificate[0]) },
                };
            }

            if (formData.internationalTransportPermit?.[0] instanceof File) {
                horseData.internationalTransportPermit = {
                    _type: "file",
                    _key: `${Date.now()}-transport`,
                    asset: { _ref: await uploadFileToSanity(formData.internationalTransportPermit[0]) },
                };
            }

            if (formData.passportImage?.[0] instanceof File) {
                horseData.passportImage = {
                    _type: "image",
                    _key: `${Date.now()}-passport`,
                    asset: { _ref: await uploadImageToSanity(formData.passportImage[0]) },
                };
            }

            await client.patch(horseId).set(horseData).commit();

            showAlert(t("user:horseRegistration.alerts.successUpdate"), "success");
            setShowConfetti(true);
            setTimeout(() => {
                setShowConfetti(false);
                router.push(`/horses/${horseId}`);
            }, 3000);
        } catch (error) {
            console.error("Error updating horse:", error);
            showAlert(t("user:horseRegistration.alerts.errorUpdate"), "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getIconMargin = () => (isRTL ? "ml-2" : "mr-2");
    const formGroupClass = `form-group ${isRTL ? "text-right" : "text-left"}`;

    if (loading) return <div>Loading...</div>;

    return (
        <Layout>
            <div className={`max-w-7xl mx-auto px-4 pb-8 ${isRTL ? "text-right" : "text-left"}`} dir={isRTL ? "rtl" : "ltr"}>
                <Alert
                    message={alert.message}
                    isVisible={alert.isVisible}
                    type={alert.type}
                    onClose={() => setAlert({ isVisible: false, message: "", type: "error" })}
                />
                <div className="sticky top-20 my-5 p-6 bg-white shadow-md w-full z-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("user:horseRegistration.editTitle")}</h1>
                    <p className="text-gray-600">{t("user:horseRegistration.editSubtitle")}</p>
                    <div className="mt-4">
                        <div className="bg-gray-200 h-2 rounded-full">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${completionPercentage === 100 ? "bg-green-600" : "bg-black"}`}
                                style={{ width: `${completionPercentage}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-2">
                            <div className="flex items-center">
                                {tier.icon}
                                <span className={`text-sm font-medium ${tier.color}`}>{tier.name}</span>
                            </div>
                            <span className="text-sm text-gray-600">
                                {t("user:horseRegistration.trustScore")}: {completionPercentage}/100
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{tier.message}</p>
                    </div>
                </div>


                <form onSubmit={handleSubmit} className="space-y-8" style={{ marginTop: "80px" }}>
                    {/* Basic Information */}
                    <div className="space-y-6">
                        <h2 className={`text-2xl font-bold text-gray-800 flex items-center`}>
                            <Star className={`${getIconMargin()} text-amber-500`} size={28} />
                            {t("user:horseRegistration.basicInformation")}
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className={formGroupClass}>
                                <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.fullName")} <span className="text-red-500">*</span></label>
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md" required dir={isRTL ? "rtl" : "ltr"} />
                            </div>
                            <SearchableBreedDropdown formData={formData} handleChange={handleChange} t={t} isRTL={isRTL} formGroupClass={formGroupClass} />
                            <div className={formGroupClass}>
                                <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.birthDate")} <span className="text-red-500">*</span></label>
                                <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md" required />
                            </div>
                            <div className={formGroupClass}>
                                <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.gender")} <span className="text-red-500">*</span></label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md" required dir={isRTL ? "rtl" : "ltr"}>
                                    <option value="">{t("user:horseRegistration.selectGender")}</option>
                                    <option value="male">{t("user:horseRegistration.male")}</option>
                                    <option value="female">{t("user:horseRegistration.female")}</option>
                                </select>
                            </div>
                        </div>
                        <div className={formGroupClass}>
                            <label className="block text-gray-700 font-medium mb-2">
                                {t("user:horseRegistration.horseImages")} <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {formData.images.map((image, index) => (
                                    <div
                                        key={index}
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-between h-48 sm:h-56 md:h-64 relative"
                                    >
                                        {image instanceof File ? (
                                            <div className="text-center w-full">
                                                <Image
                                                    width={200}
                                                    height={160}
                                                    src={URL.createObjectURL(image)}
                                                    alt={`Horse image ${index + 1}`}
                                                    className="w-full h-32 sm:h-36 md:h-40 object-contain rounded-md mb-2"
                                                />
                                                <p className="text-green-600 text-sm truncate w-full">{image.name}</p>
                                            </div>
                                        ) : image?.asset?._ref ? (
                                            <div className="text-center w-full">
                                                <Image
                                                    width={200}
                                                    height={160}
                                                    src={urlFor(image).width(200).height(160).url()} // Adjusted height for better visibility
                                                    alt={`Horse image ${index + 1}`}
                                                    className="w-full h-32 sm:h-36 md:h-40 object-contain rounded-md mb-2"
                                                />
                                                <p className="text-green-600 text-sm">{t("user:horseRegistration.imageUploaded")}</p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <Camera className="text-gray-400 mb-2" size={36} />
                                                <label className="cursor-pointer text-[#333] hover:text-black text-sm text-center">
                                                    {t("user:horseRegistration.uploadImage")}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            if (e.target.files[0]) {
                                                                const newImages = [...formData.images];
                                                                newImages[index] = e.target.files[0];
                                                                setFormData({ ...formData, images: newImages });
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                        )}
                                        {(image instanceof File || image?.asset?._ref) && (
                                            <button
                                                type="button"
                                                className="text-red-600 text-sm absolute bottom-2 hover:text-red-800 transition-colors"
                                                onClick={() => {
                                                    const newImages = [...formData.images];
                                                    newImages.splice(index, 1);
                                                    setFormData({ ...formData, images: newImages });
                                                }}
                                            >
                                                {t("user:horseRegistration.remove")}
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center h-48 sm:h-56 md:h-64">
                                    <Camera className="text-gray-400 mb-2" size={36} />
                                    <label className="cursor-pointer text-[#333] hover:text-black text-sm text-center">
                                        {t("user:horseRegistration.addMoreImages")}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files[0]) {
                                                    setFormData({ ...formData, images: [...formData.images, e.target.files[0]] });
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className={formGroupClass}>
                            <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.mainColor")} <span className="text-red-500">*</span></label>
                            <select name="mainColor" value={formData.mainColor} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md" required dir={isRTL ? "rtl" : "ltr"}>
                                <option value="">{t("user:horseRegistration.selectMainColor")}</option>
                                <option value="grey">{t("user:horseRegistration.grey")}</option>
                                <option value="black">{t("user:horseRegistration.black")}</option>
                                <option value="bay">{t("user:horseRegistration.bay")}</option>
                                <option value="chestnut">{t("user:horseRegistration.chestnut")}</option>
                                <option value="dappleGrey">{t("user:horseRegistration.dappleGrey")}</option>
                                <option value="pinto">{t("user:horseRegistration.pinto")}</option>
                                <option value="darkBlack">{t("user:horseRegistration.darkBlack")}</option>
                                <option value="lightGrey">{t("user:horseRegistration.lightGrey")}</option>
                                <option value="reddishBay">{t("user:horseRegistration.reddishBay")}</option>
                                <option value="goldenChestnut">{t("user:horseRegistration.goldenChestnut")}</option>
                                <option value="goldenYellow">{t("user:horseRegistration.goldenYellow")}</option>
                                <option value="blazedWhite">{t("user:horseRegistration.blazedWhite")}</option>
                            </select>
                        </div>
                        <div className={formGroupClass}>
                            <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.additionalColors")}</label>
                            <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-2">
                                {["palomino", "buckskin", "roan", "dun", "grullo", "cremello"].map((color) => (
                                    <div key={color} className="flex items-center">
                                        <input type="checkbox" id={color} checked={formData.additionalColors.includes(color)} onChange={() => handleMultiSelect("additionalColors", color)} className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                                        <label htmlFor={color} className="text-sm text-gray-700">{t(`user:horseRegistration.${color}`)}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={formGroupClass}>
                            <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.distinctiveMarkArabic")}</label>
                            <input type="text" name="distinctiveMarkArabic" value={formData.distinctiveMarkArabic} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md" dir="rtl" />
                        </div>
                        <div className={formGroupClass}>
                            <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.distinctiveMarkEnglish")}</label>
                            <input type="text" name="distinctiveMarkEnglish" value={formData.distinctiveMarkEnglish} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md" dir="ltr" />
                        </div>
                    </div>

                    {/* Identification and Lineage */}
                    <div className="space-y-6">
                        <h2 className={`text-2xl font-bold text-gray-800 flex items-center`}>
                            <FileText className={`${getIconMargin()} text-blue-500`} size={28} />
                            {t("user:horseRegistration.identificationAndLineage")}
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className={formGroupClass}>
                                <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.electronicChipNumber")}</label>
                                <input type="text" name="electronicChipNumber" value={formData.electronicChipNumber} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md" dir={isRTL ? "rtl" : "ltr"} />
                            </div>
                            <div className={formGroupClass}>
                                <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.passportNumber")}</label>
                                <input type="text" name="passportNumber" value={formData.passportNumber} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md" dir={isRTL ? "rtl" : "ltr"} />
                            </div>
                            <div className={formGroupClass}>
                                <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.nationalID")}</label>
                                <input type="text" name="nationalID" value={formData.nationalID} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md" dir={isRTL ? "rtl" : "ltr"} />
                            </div>
                            <div className={formGroupClass}>
                                <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.fatherRegistrationNumber")}</label>
                                <input type="text" name="fatherRegistrationNumber" value={formData.fatherRegistrationNumber} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md" dir={isRTL ? "rtl" : "ltr"} />
                            </div>
                            <div className={formGroupClass}>
                                <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.motherRegistrationNumber")}</label>
                                <input type="text" name="motherRegistrationNumber" value={formData.motherRegistrationNumber} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md" dir={isRTL ? "rtl" : "ltr"} />
                            </div>
                        </div>
                        <div className={formGroupClass}>
                            <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.lineageDetailsArabic")}</label>
                            <textarea name="lineageDetailsArabic" value={formData.lineageDetailsArabic} onChange={handleChange} rows={4} className="w-full p-3 border border-gray-300 rounded-md" maxLength={180} dir="rtl" />
                        </div>
                        <div className={formGroupClass}>
                            <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.lineageDetailsEnglish")}</label>
                            <textarea name="lineageDetailsEnglish" value={formData.lineageDetailsEnglish} onChange={handleChange} rows={4} className="w-full p-3 border border-gray-300 rounded-md" maxLength={180} dir="ltr" />
                        </div>
                    </div>

                    {/* Health and Documentation */}
                    <div className="space-y-6">
                        <h2 className={`text-2xl font-bold text-gray-800 flex items-center`}>
                            <Heart className={`${getIconMargin()} text-rose-500`} size={28} />
                            {t("user:horseRegistration.healthAndDocumentation")}
                        </h2>
                        <div className={formGroupClass}>
                            <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.healthCertificates")}</label>
                            <input type="file" name="healthCertificates" onChange={handleChange} multiple accept=".pdf,.jpg,.jpeg,.png" className="w-full p-3 border border-gray-300 rounded-md" />
                        </div>
                        <div className={formGroupClass}>
                            <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.vaccinationCertificates")}</label>
                            <input type="file" name="vaccinationCertificates" onChange={handleChange} multiple accept=".pdf,.jpg,.jpeg,.png" className="w-full p-3 border border-gray-300 rounded-md" />
                        </div>
                        <div className={formGroupClass}>
                            <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.geneticAnalysis")}</label>
                            <input type="file" name="geneticAnalysis" onChange={handleChange} accept=".pdf,.jpg,.jpeg,.png" className="w-full p-3 border border-gray-300 rounded-md" />
                        </div>
                        <div className={formGroupClass}>
                            <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.ownershipCertificate")}</label>
                            <input type="file" name="ownershipCertificate" onChange={handleChange} accept=".pdf,.jpg,.jpeg,.png" className="w-full p-3 border border-gray-300 rounded-md" />
                        </div>
                    </div>

                    {/* Ownership and Location */}
                    <div className="space-y-6">
                        <h2 className={`text-2xl font-bold text-gray-800 flex items-center`}>
                            <User className={`${getIconMargin()} text-violet-500`} size={28} />
                            {t("user:horseRegistration.ownershipAndLocation")}
                        </h2>
                        <div className={formGroupClass}>
                            <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.previousOwner")}</label>
                            <input type="text" name="previousOwner" value={formData.previousOwner} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md" dir={isRTL ? "rtl" : "ltr"} />
                        </div>
                        <div className={formGroupClass}>
                            <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.stableLocation")}</label>
                            <select name="stableLocation" value={formData.stableLocation} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md" dir={isRTL ? "rtl" : "ltr"}>
                                <option value="">{t("user:horseRegistration.selectStable")}</option>
                                {stables.map((stable) => (
                                    <option key={stable._id} value={stable._id}>{isRTL ? stable.name_ar : stable.name_en}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* International and Insurance */}
                    <div className="space-y-6">
                        <h2 className={`text-2xl font-bold text-gray-800 flex items-center`}>
                            <CreditCard className={`${getIconMargin()} text-emerald-500`} size={28} />
                            {t("user:horseRegistration.internationalAndInsurance")}
                        </h2>
                        <div className={formGroupClass}>
                            <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.internationalTransportPermit")}</label>
                            <input type="file" name="internationalTransportPermit" onChange={handleChange} accept=".pdf,.jpg,.jpeg,.png" className="w-full p-3 border border-gray-300 rounded-md" />
                        </div>
                        <div className={formGroupClass}>
                            <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.passportImage")}</label>
                            <input type="file" name="passportImage" onChange={handleChange} accept=".jpg,.jpeg,.png" className="w-full p-3 border border-gray-300 rounded-md" />
                        </div>
                        <div className={formGroupClass}>
                            <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.insurancePolicyNumber")}</label>
                            <input type="text" name="insurancePolicyNumber" value={formData.insurancePolicyNumber} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md" dir={isRTL ? "rtl" : "ltr"} />
                        </div>
                        <div className={formGroupClass}>
                            <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.insuranceDetailsArabic")}</label>
                            <textarea name="insuranceDetailsArabic" value={formData.insuranceDetailsArabic} onChange={handleChange} rows={3} className="w-full p-3 border border-gray-300 rounded-md" dir="rtl" />
                        </div>
                        <div className={formGroupClass}>
                            <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.insuranceDetailsEnglish")}</label>
                            <textarea name="insuranceDetailsEnglish" value={formData.insuranceDetailsEnglish} onChange={handleChange} rows={3} className="w-full p-3 border border-gray-300 rounded-md" dir="ltr" />
                        </div>
                        <div className={formGroupClass}>
                            <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.insuranceEndDate")}</label>
                            <input type="date" name="insuranceEndDate" value={formData.insuranceEndDate} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md" />
                        </div>
                    </div>

                    {/* Activities and Value */}
                    <div className="space-y-6">
                        <h2 className={`text-2xl font-bold text-gray-800 flex items-center`}>
                            <Award className={`${getIconMargin()} text-amber-500`} size={28} />
                            {t("user:horseRegistration.activitiesAndValue")}
                        </h2>
                        <div className={formGroupClass}>
                            <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.horseActivities")}</label>
                            <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-4">
                                {["shortRace", "enduranceRace", "jumping", "training", "tours", "parades", "dancing", "taming", "polo", "archery", "entertainmentGames", "individualSkills", "circus", "security", "beautyAndShow"].map((activity) => (
                                    <div key={activity} className="border rounded-lg p-3">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={activity}
                                                checked={formData.horseActivities.some((item) => item.activity === activity)}
                                                onChange={() => {
                                                    if (formData.horseActivities.some((item) => item.activity === activity)) {
                                                        setFormData({ ...formData, horseActivities: formData.horseActivities.filter((item) => item.activity !== activity) });
                                                    } else {
                                                        setFormData({ ...formData, horseActivities: [...formData.horseActivities, { _key: `${activity}-${Date.now()}`, activity, level: "beginner" }] });
                                                    }
                                                }}
                                                className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`}
                                            />
                                            <label htmlFor={activity} className="text-sm text-gray-700">{t(`user:horseRegistration.${activity}`)}</label>
                                        </div>
                                        {formData.horseActivities.some((item) => item.activity === activity) && (
                                            <div className="mt-2 pl-6">
                                                <label className="block text-xs text-gray-600 mb-1">{t("user:horseRegistration.level")}</label>
                                                <select
                                                    value={formData.horseActivities.find((item) => item.activity === activity).level}
                                                    onChange={(e) => {
                                                        const updatedActivities = formData.horseActivities.map((item) => item.activity === activity ? { ...item, level: e.target.value } : item);
                                                        setFormData({ ...formData, horseActivities: updatedActivities });
                                                    }}
                                                    className="w-full p-1 text-xs border border-gray-300 rounded-md"
                                                    dir={isRTL ? "rtl" : "ltr"}
                                                >
                                                    <option value="beginner">{t("user:horseRegistration.beginner")}</option>
                                                    <option value="intermediate">{t("user:horseRegistration.intermediate")}</option>
                                                    <option value="advanced">{t("user:horseRegistration.advanced")}</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={formGroupClass}>
                            <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.achievements")}</label>
                            <textarea name="achievements" value={formData.achievements} onChange={handleChange} rows={4} className="w-full p-3 border border-gray-300 rounded-md" maxLength={300} dir={isRTL ? "rtl" : "ltr"} />
                        </div>
                        <div className={formGroupClass}>
                            <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.trainers")}</label>
                            <select
                                name="trainers"
                                value=""
                                onChange={(e) => {
                                    if (e.target.value && !formData.trainers.some((t) => t._ref === e.target.value)) {
                                        setFormData({ ...formData, trainers: [...formData.trainers, { _key: `${e.target.value}-${Date.now()}`, _type: "reference", _ref: e.target.value }] });
                                    }
                                }}
                                className="w-full p-3 border border-gray-300 rounded-md"
                                dir={isRTL ? "rtl" : "ltr"}
                            >
                                <option value="">{t("user:horseRegistration.selectTrainer")}</option>
                                {trainersList.map((trainer) => (
                                    <option key={trainer._id} value={trainer._id}>{isRTL ? trainer.name_ar : trainer.name_en}</option>
                                ))}
                            </select>
                            {formData.trainers.length > 0 && (
                                <div className="mt-2">
                                    {formData.trainers.map((trainer, index) => (
                                        <div key={trainer._key} className="bg-indigo-100 px-3 py-1 rounded-full flex items-center mt-1">
                                            <span className="text-sm text-indigo-800">{trainersList.find(t => t._id === trainer._ref)?.[isRTL ? "name_ar" : "name_en"] || "Unknown"}</span>
                                            <button type="button" onClick={() => setFormData({ ...formData, trainers: formData.trainers.filter((_, i) => i !== index) })} className={`${isRTL ? "mr-2" : "ml-2"} text-indigo-600`}>×</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className={formGroupClass}>
                                <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.listingPurpose")} <span className="text-red-500">*</span></label>
                                <select name="listingPurpose" value={formData.listingPurpose} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md" required dir={isRTL ? "rtl" : "ltr"}>
                                    <option value="">{t("user:horseRegistration.selectPurpose")}</option>
                                    <option value="sale">{t("user:horseRegistration.sale")}</option>
                                    <option value="stud">{t("user:horseRegistration.stud")}</option>
                                    <option value="lease">{t("user:horseRegistration.lease")}</option>
                                    <option value="sharing">{t("user:horseRegistration.sharing")}</option>
                                </select>
                            </div>
                            <div className={formGroupClass}>
                                <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.marketValue")} <span className="text-red-500">*</span></label>
                                <input type="number" name="marketValue" value={formData.marketValue} onChange={handleChange} min="1" className="w-full p-3 border border-gray-300 rounded-md" required dir={isRTL ? "rtl" : "ltr"} />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-10 pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full px-6 py-3 rounded-md flex items-center justify-center ${isSubmitting ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
                        >
                            <Save className={`${getIconMargin()}`} size={18} />
                            {isSubmitting ? t("user:horseRegistration.submitting") : t("user:horseRegistration.saveChanges")}
                        </button>
                    </div>
                </form>

                {/* Confetti Animation */}
                <AnimatePresence>
                    {showConfetti && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 pointer-events-none z-50">
                            <div className="absolute w-full h-full overflow-hidden">
                                {Array.from({ length: 50 }).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute w-2 h-2 rounded-full"
                                        style={{ backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`, left: `${Math.random() * 100}%`, top: '-10%' }}
                                        animate={{ y: '110vh', rotate: Math.random() * 360 }}
                                        transition={{ duration: 2 + Math.random() * 2, ease: 'linear' }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Layout>
    );
}