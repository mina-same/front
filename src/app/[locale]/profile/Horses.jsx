"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Edit,
  Eye,
  MapPin,
  Plus,
  Star,
  Trash,
  Trash2,
} from "lucide-react";
import { LiaHorseHeadSolid } from "react-icons/lia";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { client, urlFor } from "../../../lib/sanity";
import HorseRegistrationForm from "../../../../components/elements/HorseRegistrationForm";
import { useTranslation } from "react-i18next";
import userFallbackImage from "../../../../public/assets/imgs/elements/user.png";
import { Button } from "@/components/ui/button";

const HorsesDashboard = ({ userId, isRTL }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [horses, setHorses] = useState([]);
  const [horseReservations, setHorseReservations] = useState([]);
  const [isLoadingHorses, setIsLoadingHorses] = useState(false);
  const [isLoadingHorseReservations, setIsLoadingHorseReservations] =
    useState(false);
  const [showHorseForm, setShowHorseForm] = useState(false);
  const [error, setError] = useState(null);

  // Modal Component
  const Modal = ({ isOpen, onClose, title, children }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 bg-black/50 flex items-center justify-center ${
        isOpen ? "block" : "hidden"
      }`}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: isOpen ? 1 : 0.95, opacity: isOpen ? 1 : 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-6xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </motion.div>
    </motion.div>
  );

  // Fetch horses
  useEffect(() => {
    const fetchHorses = async () => {
      if (!userId) return;

      setIsLoadingHorses(true);
      try {
        const query = `*[_type == "horse" && owner._ref == $userId]{
                    _id,
                    fullName,
                    breed,
                    birthDate,
                    images,
                    gender,
                    mainColor,
                    listingPurpose,
                }`;
        const result = await client.fetch(query, { userId });
        setHorses(result);
      } catch (error) {
        console.error("Error fetching horses:", error);
        setError("Failed to load horses.");
      } finally {
        setIsLoadingHorses(false);
      }
    };

    fetchHorses();
  }, [userId]);

  // Fetch horse reservations
  useEffect(() => {
    const fetchHorseReservations = async () => {
      if (!userId) return;

      setIsLoadingHorseReservations(true);
      try {
        const query = `*[_type == "horseReservation" && user._ref == $userId && horse->listingPurpose == "rent"]{
                    _id,
                    datetime,
                    status,
                    horse->{
                        _id,
                        fullName,
                        breed,
                        birthDate,
                        images,
                        listingPurpose
                    },
                    user->{
                        _id,
                        userName,
                        email,
                        image
                    }
                }`;
        const result = await client.fetch(query, { userId });
        setHorseReservations(result);
      } catch (error) {
        console.error("Error fetching horse reservations:", error);
        setError("Failed to load horse reservations.");
      } finally {
        setIsLoadingHorseReservations(false);
      }
    };

    fetchHorseReservations();
  }, [userId]);

  // Handle horse deletion
  const handleHorseDeletion = async (horseId, client) => {
    try {
      const reservations = await client.fetch(
        `
                *[_type == "horseReservation" && horse._ref == $horseId]{
                    _id,
                    status
                }
            `,
        { horseId }
      );

      if (reservations.length > 0) {
        throw new Error("Cannot delete horse with existing reservations");
      }

      await client
        .fetch(
          `
                *[_type == "horseRating" && horse._ref == $horseId]{_id}
            `,
          { horseId }
        )
        .then((ratings) => {
          return Promise.all(
            ratings.map((rating) => client.delete(rating._id))
          );
        });

      await client
        .fetch(
          `
                *[_type == "user" && references($horseId)]{_id}
            `,
          { horseId }
        )
        .then((users) => {
          return Promise.all(
            users.map((user) =>
              client
                .patch(user._id)
                .unset([`horses[_ref == "${horseId}"]`])
                .commit()
            )
          );
        });

      await client.delete(horseId);

      return {
        success: true,
        message: "Horse deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to delete horse",
        error: error.message,
      };
    }
  };

  // Helper function for horse color hex
  const getColorHex = (color) => {
    const colorMap = {
      brown: "#8B4513",
      black: "#222222",
      white: "#f8f9fa",
      gray: "#6c757d",
      chestnut: "#954535",
      bay: "#8B0000",
      palomino: "#FFD700",
      cremello: "#FFF8DC",
      dun: "#D2B48C",
      buckskin: "#DEB887",
      roan: "#B0C4DE",
      pinto: "#8FBC8F",
      appaloosa: "#F0E68C",
    };

    return colorMap[color?.toLowerCase()] || "#8B4513";
  };

  // Helper function to get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get breed name
  const getBreedName = (breedValue) => {
    const breedMap = {
      purebredArabian: "Purebred Arabian",
      tibetanPony: "Tibetan Pony",
      mongolianHorse: "Mongolian Horse",
      andalusian: "Andalusian",
      friesian: "Friesian",
      hungarianHorse: "Hungarian Horse",
      bulgarianHorse: "Bulgarian Horse",
      uzbekHorse: "Uzbek Horse",
      afghanHorse: "Afghan Horse",
      turkishHorse: "Turkish Horse",
      persianHorse: "Persian Horse",
      kurdishHorse: "Kurdish Horse",
      armenianHorse: "Armenian Horse",
      georgianHorse: "Georgian Horse",
      abkhazianHorse: "Abkhazian Horse",
      altaiHorse: "Altai Horse",
      bashkirHorse: "Bashkir Horse",
      tatarHorse: "Tatar Horse",
      kyrgyzHorse: "Kyrgyz Horse",
      tajikHorse: "Tajik Horse",
      turkmenHorse: "Turkmen Horse",
      karakalpakUzbekHorse: "Karakalpak Uzbek Horse",
      kazakhHorse: "Kazakh Horse",
      donHorse: "Don Horse",
      kubanHorse: "Kuban Horse",
      belarusianHorse: "Belarusian Horse",
      ukrainianHorse: "Ukrainian Horse",
      polishHorse: "Polish Horse",
      czechHorse: "Czech Horse",
      slovakHorse: "Slovak Horse",
      hungarianHorse2: "Hungarian Horse",
      romanianHorse: "Romananian Horse",
      shaggyBulgarianHorse: "Shaggy Bulgarian Horse",
      greekHorse: "Greek Horse",
      anatolianHorse: "Anatolian Horse",
      persianBlueHorse: "Persian Blue Horse",
      hazaragiHorse: "Hazaragi Horse",
      pashtunHorse: "Pashtun Horse",
      marwari: "Marwari",
      nepalesePony: "Nepalese Pony",
      bhutanesePony: "Bhutanese Pony",
      thaiPony: "Thai Pony",
      cambodianPony: "Cambodian Pony",
      vietnamesePony: "Vietnamese Pony",
      laotianPony: "Laotian Pony",
      burmesePony: "Burmese Pony",
      manchuHorse: "Manchu Horse",
      kisoHorse: "Kiso Horse",
      koreanHorse: "Korean Horse",
      bayankhongorMongolianHorse: "Bayankhongor Mongolian Horse",
      khentiiMongolianHorse: "Khentii Mongolian Horse",
      tibetanPony2: "Tibetan Pony",
      nepalesePony2: "Nepalese Pony",
      bhutanesePony2: "Bhutanese Pony",
      thaiPony2: "Thai Pony",
      cambodianPony2: "Cambodian Pony",
      vietnamesePony2: "Vietnamese Pony",
      laotianPony2: "Laotian Pony",
      burmesePony2: "Burmese Pony",
      manchuHorse2: "Manchu Horse",
      kisoHorse2: "Kiso Horse",
      koreanHorse2: "Korean Horse",
      bayankhongorMongolianHorse2: "Bayankhongor Mongolian Horse",
      khentiiMongolianHorse2: "Khentii Mongolian Horse",
      tibetanPony3: "Tibetan Pony",
      nepalesePony3: "Nepalese Pony",
      bhutanesePony3: "Bhutanese Pony",
      thaiPony3: "Thai Pony",
      cambodianPony3: "Cambodian Pony",
      vietnamesePony3: "Vietnamese Pony",
      laotianPony3: "Laotian Pony",
      burmesePony3: "Burmese Pony",
      manchuHorse3: "Manchu Horse",
      kisoHorse3: "Kiso Horse",
      koreanHorse3: "Korean Horse",
      arabian: "Arabian",
      spanishAndalusian: "Spanish Andalusian",
      thoroughbred: "Thoroughbred",
      frenchHorse: "French Horse",
      germanHorse: "German Horse",
      italianHorse: "Italian Horse",
      belgianDraft: "Belgian Draft",
      dutchHorse: "Dutch Horse",
      danishHorse: "Danish Horse",
      norwegianFjord: "Norwegian Fjord",
      swedishHorse: "Swedish Horse",
      finnhorse: "Finnhorse",
      estonianHorse: "Estonian Horse",
      latvianHorse: "Latvian Horse",
      lithuanianHorse: "Lithuanian Horse",
      konik: "Konik",
      donHorse2: "Don Horse",
      kubanHorse2: "Kuban Horse",
      ukrainianHorse2: "Ukrainian Horse",
      belarusianHorse2: "Belarusian Horse",
    };
    return breedMap[breedValue] || breedValue;
  };

  // No Horses View
  const NoHorsesView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[700px] text-center justify-center items-center align-center px-4 bg-gradient-to-br bg-white rounded-xl shadow-sm"
      style={{ alignContent: "center" }}
    >
      <div className="space-y-6 bg-gray-100 w-full h-full min-h-[650px] flex justify-center items-center flex-col rounded-xl">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg">
          <LiaHorseHeadSolid className="w-10 h-10 text-black" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">
          {t("profile:noHorsesYet")}
        </h3>
        <p className="text-gray-500">{t("profile:addYourFirstHorse")}</p>
        <button
          onClick={() => setShowHorseForm(true)}
          className="rounded-xl inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#333] to-[#000] text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          {t("profile:addHorse")}
        </button>
      </div>
    </motion.div>
  );

  // Render Horses Content
  const renderHorsesContent = () => {
    if (isLoadingHorses || isLoadingHorseReservations) {
      return (
        <div className="flex items-center justify-center py-20 h-96">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#f5e8b2] via-[#b28a2f] to-[#8c6b23] mb-6"></div>
            <div className="h-5 w-48 bg-gradient-to-r from-[#f5e8b2] via-[#b28a2f] to-[#8c6b23] rounded-full mb-4"></div>
            <div className="h-4 w-36 bg-gradient-to-r from-[#f5e8b2] via-[#b28a2f] to-[#8c6b23] rounded-full"></div>
          </div>
        </div>
      );
    }

    if (!horses.length) {
      return <NoHorsesView />;
    }

    const handleDeleteHorse = async (horseId) => {
      if (window.confirm(t("profile:confirmDeleteHorse"))) {
        try {
          const result = await handleHorseDeletion(horseId, client);
          if (result.success) {
            setHorses((prevHorses) =>
              prevHorses.filter((horse) => horse._id !== horseId)
            );
            setHorseReservations((prevReservations) =>
              prevReservations.filter(
                (reservation) => reservation.horse._id !== horseId
              )
            );
          } else {
            setError(result.message);
          }
        } catch (error) {
          console.error("Error deleting horse:", error);
          setError("Failed to delete horse.");
        }
      }
    };

    // Calculate stats for summary cards
    const totalHorses = horses.length;
    const rentableHorses = horses.filter(
      (horse) => horse.listingPurpose === "rent"
    ).length;
    const upcomingReservationsCount = horseReservations.filter(
      (res) => new Date(res.datetime) > new Date()
    ).length;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full lg:w-9/12 pt-4 pb-2 sm:pb-4 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white"
      >
        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
          <div className="bg-gradient-to-br from-[#fcfc9e54] to-[#f5e8b2] rounded-xl p-6 shadow-md border border-[#f5e8b2]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#8c6b23] font-semibold">
                {t("profile:totalHorses")}
              </h3>
              <div className="bg-[#f5e8b2] p-2 rounded-xl">
                <LiaHorseHeadSolid className="w-6 h-6 text-[#8c6b23]" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#4a3b12]">{totalHorses}</p>
            <div className="mt-2 text-[#8c6b23] text-sm font-medium">
              {t("profile:stableOverview")}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#fcfc9e54] to-[#f5e8b2] rounded-xl p-6 shadow-md border border-[#f5e8b2]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#8c6b23] font-semibold">
                {t("profile:rentableHorses")}
              </h3>
              <div className="bg-[#f5e8b2] p-2 rounded-xl">
                <DollarSign className="w-6 h-6 text-[#8c6b23]" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#4a3b12]">
              {rentableHorses}
            </p>
            <div className="mt-2 text-[#8c6b23] text-sm font-medium">
              {((rentableHorses / totalHorses) * 100).toFixed(0)}%{" "}
              {t("profile:ofYourCollection")}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#fcfc9e54] to-[#f5e8b2] rounded-xl p-6 shadow-md border border-[#f5e8b2]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#8c6b23] font-semibold">
                {t("profile:upcomingBookings")}
              </h3>
              <div className="bg-[#f5e8b2] p-2 rounded-xl">
                <Calendar className="w-6 h-6 text-[#8c6b23]" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#4a3b12]">
              {upcomingReservationsCount}
            </p>
            <div className="mt-2 text-[#8c6b23] text-sm font-medium">
              {t("profile:nextSevenDays")}
            </div>
          </div>
        </div>

        {/* Horse Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {horses.map((horse, index) => {
            const horseReservationsForThisHorse = horseReservations.filter(
              (reservation) =>
                reservation.horse._id === horse._id &&
                horse.listingPurpose === "rent"
            );

            const now = new Date();
            const upcomingReservations = horseReservationsForThisHorse
              .filter((res) => new Date(res.datetime) > now)
              .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

            return (
              <motion.div
                key={horse._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-xl p-6 flex flex-col relative overflow-hidden border border-gray-100"
                whileHover={{
                  y: -8,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
                  borderColor: "rgba(178, 138, 47, 0.4)",
                }}
              >
                {horse.listingPurpose === "rent" && (
                  <div className="absolute -right-12 top-7 bg-gradient-to-r from-[#b28a2f] via-[#8c6b23] to-[#70541b] text-white px-12 py-1.5 transform rotate-45 shadow-lg font-medium text-sm">
                    {t("profile:forRent")}
                  </div>
                )}

                <div
                  onClick={() => router.push(`horses/${horse._id}`)}
                  className="cursor-pointer w-full group"
                >
                  <div className="relative mb-7">
                    <div className="relative mx-auto w-44 h-44">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#f5e8b2] via-[#b28a2f] to-[#8c6b23] opacity-20 rounded-full transform scale-105"></div>
                      <Image
                        src={
                          horse?.images?.[0]
                            ? urlFor(horse.images[0]).url()
                            : userFallbackImage
                        }
                        alt={horse.fullName}
                        className="w-full h-full rounded-full object-cover mx-auto border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-500"
                        width={176}
                        height={176}
                      />
                      <motion.div
                        className="absolute bottom-2 right-2 bg-white p-1.5 rounded-full shadow-lg"
                        whileHover={{ scale: 1.1 }}
                      >
                        <span className="bg-gradient-to-r from-[#8c6b23] via-[#b28a2f] to-[#8c6b23] text-white text-xs rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                          {horse?.images?.length || 0}
                        </span>
                      </motion.div>
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:bg-gradient-to-r group-hover:from-[#8c6b23] group-hover:via-[#b28a2f] group-hover:to-[#8c6b23] group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      {horse.fullName}
                    </h3>
                    <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mt-2">
                      <MapPin className="w-4 h-4 text-[#b28a2f]" />
                      <span>{getBreedName(horse.breed)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-gray-50 to-[#fcfc9e54] p-4 rounded-xl shadow-sm border border-[#f5e8b2]">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        {t("profile:listingPurpose")}
                      </p>
                      <p className="text-sm font-semibold text-gray-800 capitalize mt-1">
                        {horse.listingPurpose === "rent" ? (
                          <span className="flex items-center text-[#8c6b23]">
                            <DollarSign className="w-3.5 h-3.5 mr-1" />
                            {horse.listingPurpose}
                          </span>
                        ) : (
                          horse.listingPurpose
                        )}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-[#fcfc9e54] p-4 rounded-xl shadow-sm border border-[#f5e8b2]">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        {t("profile:age")}
                      </p>
                      <p className="text-sm font-semibold text-gray-800 mt-1">
                        {new Date().getFullYear() -
                          new Date(horse.birthDate).getFullYear()}{" "}
                        {t("profile:years")}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-[#fcfc9e54] p-4 rounded-xl shadow-sm border border-[#f5e8b2]">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        {t("profile:gender")}
                      </p>
                      <p className="text-sm font-semibold text-gray-800 capitalize mt-1">
                        {horse.gender === "male" ? (
                          <span className="flex items-center text-[#8c6b23]">
                            <span className="w-3.5 h-3.5 mr-1 text-[#8c6b23]">
                              ♂
                            </span>
                            {horse.gender}
                          </span>
                        ) : horse.gender === "female" ? (
                          <span className="flex items-center text-rose-700">
                            <span className="w-3.5 h-3.5 mr-1 text-rose-600">
                              ♀
                            </span>
                            {horse.gender}
                          </span>
                        ) : (
                          horse.gender || "-"
                        )}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-[#fcfc9e54] p-4 rounded-xl shadow-sm border border-[#f5e8b2]">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        {t("profile:color")}
                      </p>
                      <div className="flex items-center mt-1">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{
                            backgroundColor: getColorHex(horse.mainColor),
                          }}
                        ></div>
                        <p className="text-sm font-semibold text-gray-800 capitalize">
                          {horse.mainColor || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-[#f5e8b2] to-transparent my-4"></div>

                {horse.listingPurpose === "rent" && (
                  <div className="mt-3 w-full">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-[#b28a2f]" />
                      {t("profile:upcomingReservations")}
                    </h4>
                    {upcomingReservations.length > 0 ? (
                      <div className="space-y-3 max-h-52 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#b28a2f] scrollbar-track-gray-100 custom-scrollbar">
                        {upcomingReservations.slice(0, 3).map((reservation) => {
                          const isToday =
                            new Date(reservation.datetime).toDateString() ===
                            new Date().toDateString();

                          return (
                            <motion.div
                              key={reservation._id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`p-4 rounded-xl border shadow-sm ${getStatusStyles(
                                reservation.status
                              )}`}
                              whileHover={{
                                scale: 1.03,
                                boxShadow:
                                  "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                              }}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  {getStatusIcon(reservation.status)}
                                  <div className="flex flex-col">
                                    <div className="flex items-center">
                                      <span className="text-sm font-semibold">
                                        {isToday
                                          ? "Today"
                                          : new Date(
                                              reservation.datetime
                                            ).toLocaleDateString(undefined, {
                                              weekday: "short",
                                              month: "short",
                                              day: "numeric",
                                            })}
                                      </span>
                                      {isToday && (
                                        <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                          Today
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-xs text-gray-500 flex items-center">
                                      <Clock className="w-3 h-3 inline mr-1" />
                                      {new Date(
                                        reservation.datetime
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span
                                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusBadgeColor(
                                      reservation.status
                                    )}`}
                                  >
                                    {reservation.status}
                                  </span>
                                  {reservation.user && (
                                    <div className="flex items-center text-xs text-gray-500 mt-1.5">
                                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#b28a2f] to-[#8c6b23] mr-1.5 flex items-center justify-center text-white uppercase font-bold text-[10px]">
                                        {reservation.user.userName.charAt(0)}
                                      </div>
                                      {reservation.user.userName}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                        {upcomingReservations.length > 3 && (
                          <button className="w-full text-center py-2 text-sm text-[#8c6b23] hover:text-[#70541b] font-medium bg-[#fcfc9e54] rounded-xl hover:bg-[#f5e8b2] transition-colors">
                            +{upcomingReservations.length - 3}{" "}
                            {t("profile:moreReservations")}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-gradient-to-br from-gray-50 to-[#fcfc9e54] rounded-xl border border-[#f5e8b2]">
                        <Calendar className="w-12 h-12 text-[#b28a2f] mx-auto mb-3 opacity-60" />
                        <p className="text-gray-600 font-medium mb-2">
                          {t("profile:noReservations")}
                        </p>
                        <button className="mt-1 text-sm text-[#8c6b23] font-medium hover:text-[#70541b] bg-white py-2 px-4 rounded-xl shadow-sm border border-[#f5e8b2] hover:shadow-md transition-all inline-flex items-center">
                          <CalendarRange className="w-4 h-4 mr-1.5" />
                          {t("profile:manageAvailability")}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-5 px-3 py-2 bg-gradient-to-r from-[#fcfc9e54] to-[#f5e8b2] rounded-xl flex items-center justify-between">
                  <div className="flex items-center">
                    <Star
                      className="w-5 h-5 text-[#b28a2f] mr-1.5"
                      fill="#b28a2f"
                    />
                    <div className="text-sm font-medium text-gray-700">
                      {horse.rating || "4.8"}{" "}
                      <span className="text-gray-500 font-normal">
                        ({horse.reviewCount || "12"} {t("profile:reviews")})
                      </span>
                    </div>
                  </div>
                  <button className="text-xs text-[#8c6b23] hover:text-[#70541b]">
                    {t("profile:viewAll")}
                  </button>
                </div>

                <div className="mt-auto pt-5 flex gap-2.5">
                  <motion.button
                    onClick={() => router.push(`horses/${horse._id}`)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#8c6b23] to-[#b28a2f] text-white py-3 rounded-xl hover:from-[#70541b] hover:to-[#8c6b23] transition-colors font-medium shadow-md hover:shadow-lg"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Eye className="w-4 h-4" />
                    {t("profile:view")}
                  </motion.button>
                  <motion.button
                    onClick={() => router.push(`horses/${horse._id}/edit`)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-3 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-colors font-medium shadow-md hover:shadow-lg"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Edit className="w-4 h-4" />
                    {t("profile:edit")}
                  </motion.button>
                  <div className="group relative">
                    <motion.button
                      onClick={() => handleDeleteHorse(horse._id)}
                      className="w-12 flex items-center justify-center gap-2 bg-gradient-to-r from-red-50 to-red-100 text-red-600 py-3 rounded-xl hover:from-red-100 hover:to-red-200 transition-colors font-medium shadow-md hover:shadow-lg"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Trash className="w-5 h-5" />
                    </motion.button>
                    <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded-xl py-1.5 px-3 whitespace-nowrap pointer-events-none z-10">
                      {t("profile:deleteHorse")}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {horses.length > 6 && (
          <div className="flex justify-center mt-8">
            <nav className="inline-flex bg-white rounded-full px-1.5 py-1.5 shadow-lg border border-gray-100">
              <button className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-[#fcfc9e54] hover:text-[#8c6b23] transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-[#8c6b23] to-[#b28a2f] text-white shadow-md">
                1
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full text-gray-700 hover:bg-[#fcfc9e54] hover:text-[#8c6b23] transition-colors">
                2
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full text-gray-700 hover:bg-[#fcfc9e54] hover:text-[#8c6b23] transition-colors">
                3
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-[#fcfc9e54] hover:text-[#8c6b23] transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </nav>
          </div>
        )}
      </motion.div>
    );
  };

  // Horse Registration Form Modal
  const renderHorseFormModal = () => (
    <Modal
      isOpen={showHorseForm}
      onClose={() => setShowHorseForm(false)}
      title={t("profile:registerNewHorse")}
    >
      <HorseRegistrationForm
        userId={userId}
        onSuccess={(newHorse) => {
          setHorses((prevHorses) => [...prevHorses, newHorse]);
          setShowHorseForm(false);
        }}
      />
    </Modal>
  );

  // Status styles and icons
  const getStatusStyles = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-50 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <Check className="w-4 h-4" />;
      case "rejected":
        return <X className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto py-5 mt-4 lg:mt-5 mb-lg-4 my-xl-5">
      <div className="w-full lg:w-9/12 pt-4 pb-2 sm:pb-4">
        <div className="flex items-center mb-4">
          <h1 className="text-2xl font-medium mb-0">
            Horses{" "}
            <span className="text-sm font-normal text-gray-500">{horses.length} horses</span>
          </h1>
          <Button
            className="ml-auto flex items-center border bg-black px-3 py-1 rounded-xl text-sm"
            type="button"
          >
            <Plus className="h-4 w-4 mr-2" />
            ADD NEW HORSE
          </Button>
        </div>
        {renderHorsesContent()}
        {renderHorseFormModal()}
      </div>
    </div>
  );
};

export default HorsesDashboard;
