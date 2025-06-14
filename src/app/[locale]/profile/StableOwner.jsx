"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Plus,
  Filter,
  Trash2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Users,
  DollarSign,
  CheckCircle,
  Edit,
  Tag,
  XCircle,
} from "lucide-react";
import { client, urlFor } from "@/lib/sanity";
import { useTranslation } from "react-i18next";
import Image from "next/image";
// import userFallbackImage from "../../../../public/assets/imgs/elements/stable.png"; // Uncommented and restored fallback image

const StableOwner = ({ userId }) => {
  const [stables, setStables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [reservationsByStable, setReservationsByStable] = useState({});
  const [loadingReservations, setLoadingReservations] = useState(false);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    const fetchStablesAndReservations = async () => {
      setIsLoading(true);
      try {
        // Fetch stables
        const stableQuery = `*[_type == "stables" && userRef._ref == $userId]{
          _id,
          name_ar,
          name_en,
          servicePhone,
          serviceEmail,
          images,
          kindOfStable,
          boardingCapacity,
          serviceAverageRating,
          serviceRatingCount,
          reservations[]->{ _id }
        }`;
        const params = { userId };
        const stableResult = await client.fetch(stableQuery, params);
        setStables(stableResult);

        // Combine stables for filtering
        const combinedItems = stableResult.map((item) => ({ ...item, type: "stable" }));
        setFilteredItems(combinedItems);
      } catch (error) {
        console.error("Error fetching stables:", error);
        setError(t("profile:failedLoadStables"));
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchStablesAndReservations();
    }
  }, [userId, t]);

  useEffect(() => {
    let filtered = stables.map((item) => ({ ...item, type: "stable" }));
    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.kindOfStable.includes(categoryFilter));
    }
    setFilteredItems(filtered);
  }, [categoryFilter, stables]);

  const getDirectionClass = (defaultClasses = "") => {
    return `${defaultClasses} ${isRTL ? "rtl" : "ltr"}`;
  };

  const fetchStableReservations = async (stableId) => {
    if (reservationsByStable[stableId]) return;
    setLoadingReservations(true);
    try {
      const query = `*[_type == "reservation" && stableRef._ref == $stableId && status != "rejected"]{
        _id,
        user->{
          _id,
          userName,
          email
        },
        boarding,
        services[]{
          serviceRef->{
            _id,
            name_en,
            name_ar,
            serviceType,
            serviceManagementType
          },
          priceUnit,
          quantity,
          startDate,
          endDate,
          eventDate,
          additionalBenefits
        },
        totalPrice,
        status,
        paymentStatus,
        createdAt
      }`;
      const params = { stableId };
      const result = await client.fetch(query, params);
      setReservationsByStable((prev) => ({
        ...prev,
        [stableId]: result,
      }));
    } catch (error) {
      console.error("Error fetching stable reservations:", error);
    } finally {
      setLoadingReservations(false);
    }
  };

  const toggleItemExpansion = async (stableId) => {
    if (expandedItemId === stableId) {
      setExpandedItemId(null);
    } else {
      setExpandedItemId(stableId);
      await fetchStableReservations(stableId);
    }
  };

  const handleReservationStatusChange = async (reservationId, newStatus, rejectionReason = "") => {
    try {
      const patch = { status: newStatus };
      if (newStatus === "rejected") {
        patch.rejectionReason = rejectionReason || t("profile:reservationRejectedDefaultReason");
        patch.cancellationDetails = {
          reason: rejectionReason || t("profile:reservationRejectedDefaultReason"),
          cancelledAt: new Date().toISOString(),
        };
      }
      await client.patch(reservationId).set(patch).commit();
      setReservationsByStable((prev) => {
        const updated = { ...prev };
        for (const stableId in updated) {
          updated[stableId] = updated[stableId].map((reservation) =>
            reservation._id === reservationId
              ? { ...reservation, ...patch }
              : reservation
          );
        }
        return updated;
      });
    } catch (error) {
      console.error("Error updating reservation status:", error);
      alert(t("profile:failedUpdateReservation"));
    }
  };

  const handleDeleteStable = async (stableId) => {
    const stableReservations = reservationsByStable[stableId] || [];
    if (stableReservations.some((res) => res.status === "approved" || res.status === "pending")) {
      alert(t("profile:cannotDeleteStableWithReservations"));
      return;
    }

    if (confirm(t("profile:confirmDeleteStable"))) {
      try {
        await client.delete(stableId);
        setStables(stables.filter((stable) => stable._id !== stableId));
        setFilteredItems(filteredItems.filter((item) => item._id !== stableId));
      } catch (error) {
        console.error("Error deleting stable:", error);
        alert(t("profile:failedDeleteStable"));
      }
    }
  };

  const NoStablesView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={getDirectionClass(
        "text-center py-16 px-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg h-full min-h-[700px] flex justify-center items-center"
      )}
    >
      <div className="max-w-md mx-auto space-y-6 flex flex-col justify-center items-center text-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-2xl">
          <Home className="w-12 h-12 text-gray-800" />
        </div>
        <h3 className="text-3xl font-extrabold text-gray-900">
          {t("profile:noStablesFound")}
        </h3>
        <p className="text-gray-600 text-lg">
          {t("profile:noStablesYet")}
        </p>
        <button
          onClick={() => (window.location.href = "/stables/add-stable")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-black text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          {t("profile:addStable")}
        </button>
      </div>
    </motion.div>
  );

  const stableTypeOptions = [
    { value: "all", label: t("profile:allCategories") },
    { value: "educational", label: t("profile:category.educational") },
    { value: "entertainment", label: t("profile:category.entertainment") },
    { value: "competitions", label: t("profile:category.competitions") },
    { value: "events", label: t("profile:category.events") },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const renderReservationStatusBadge = (status) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      approved: "bg-green-100 text-green-800 border-green-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium border ${
          statusStyles[status] || "bg-gray-100 border-gray-300"
        }`}
      >
        {t(`profile:reservationStatus.${status}`)}
      </span>
    );
  };

  const renderPaymentStatusBadge = (status) => {
    const statusStyles = {
      paid: "bg-green-100 text-green-800 border-green-300",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      failed: "bg-red-100 text-red-800 border-red-300",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium border ${
          statusStyles[status] || "bg-gray-100 border-gray-300"
        }`}
      >
        {t(`profile:paymentStatus.${status}`)}
      </span>
    );
  };

  const renderStableReservations = (stableId) => {
    const reservations = reservationsByStable[stableId] || [];

    if (loadingReservations) {
      return (
        <div className="py-6 text-center">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="h-5 w-40 bg-gray-200 rounded-full"></div>
            <div className="h-4 w-60 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      );
    }

    if (reservations.length === 0) {
      return (
        <div className="py-8 text-center">
          <p className="text-gray-600 text-lg">{t("profile:noReservationsFound")}</p>
        </div>
      );
    }

    return (
      <div className="mt-6 space-y-6">
        <h4 className="font-semibold text-xl border-b border-gray-200 pb-3">
          {t("profile:reservationHistory")}
        </h4>
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <div
              key={reservation._id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-500" />
                    <span className="text-base font-medium">
                      {reservation.user?.userName || t("profile:unknownUser")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">
                      {t("profile:reservationDate")}: {formatDate(reservation.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">
                      {t("profile:price")}: {reservation.totalPrice}{" "}
                      {t("profile:currency")}
                    </span>
                  </div>
                  {reservation.boarding && (
                    <div className="flex items-center gap-3">
                      <Home className="w-5 h-5 text-gray-500" />
                      <span className="text-sm">
                        {t("profile:boarding")}: {reservation.boarding.horses?.length} {t("profile:horses")} ({reservation.boarding.priceUnit})
                      </span>
                    </div>
                  )}
                  {reservation.services && reservation.services.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium">{t("profile:services")}:</span>
                      {reservation.services.map((service, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Tag className="w-5 h-5 text-gray-500" />
                          <span className="text-sm">
                            {isRTL ? service.serviceRef?.name_ar : service.serviceRef?.name_en} ({service.priceUnit})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {t("profile:status")}:
                      </span>
                      {renderReservationStatusBadge(reservation.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {t("profile:payment")}:
                      </span>
                      {renderPaymentStatusBadge(reservation.paymentStatus)}
                    </div>
                  </div>
                </div>
                {reservation.status === "pending" &&
                  reservation.paymentStatus === "paid" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleReservationStatusChange(reservation._id, "approved")
                        }
                        className="px-5 py-2 bg-green-100 text-green-800 rounded-xl hover:bg-green-200 transition-all flex items-center justify-center gap-2 font-medium"
                      >
                        <CheckCircle className="w-5 h-5" />
                        {t("profile:approveReservation")}
                      </button>
                      <button
                        onClick={() =>
                          handleReservationStatusChange(reservation._id, "rejected", prompt(t("profile:enterRejectionReason")))
                        }
                        className="px-5 py-2 bg-red-100 text-red-800 rounded-xl hover:bg-red-200 transition-all flex items-center justify-center gap-2 font-medium"
                      >
                        <XCircle className="w-5 h-5" />
                        {t("profile:rejectReservation")}
                      </button>
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="flex flex-row items-start md:items-center justify-between mb-5 gap-6">
        <h2 className="text-3xl font-extrabold text-gray-900">
          {t("profile:stableOwnerDashboard")}
        </h2>
        <div className="flex flex-row sm:flex-row gap-4 w-full md:w-auto">
          {stables.length === 0 && ( // Conditionally render Add Stable button
            <button
              onClick={() => (window.location.href = "/stables/add-stable")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-black text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              {t("profile:addStable")}
            </button>
          )}
          <button
            onClick={() => (window.location.href = "/services/add-service?type=fulltime")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-black text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            {t("profile:addFullTimeService")}
          </button>
        </div>
      </div>
      <div className="flex flex-row justify-end gap-4 pb-4">
        <div className="relative flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent text-gray-800 font-medium focus:outline-none w-full"
          >
            {stableTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div
        className={getDirectionClass(
          "bg-white rounded-2xl p-8 shadow-lg min-h-[700px]"
        )}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-20 h-96">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-gray-200 to-gray-300"></div>
              <div className="h-6 w-56 bg-gray-200 rounded-full"></div>
              <div className="h-5 w-40 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600 text-lg font-medium">
            {error}
          </div>
        ) : filteredItems.length === 0 ? (
          <NoStablesView />
        ) : (
          <div className="space-y-6">
            {filteredItems.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={getDirectionClass(
                  "rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow"
                )}
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex items-start gap-6">
                      <div className="group relative bg-gray-100 rounded-2xl p-4">
                        <div className="relative">
                          <a className="block" href="#">
                            <div className="p-3 flex justify-center">
                              <Image
                                src={
                                  item.images?.[0]
                                    ? urlFor(item.images[0]).url()
                                    : "/placholder.svg"
                                }
                                width={200}
                                height={200}
                                alt={isRTL ? item.name_ar : item.name_en}
                                className="object-cover rounded-xl"
                              />
                            </div>
                          </a>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-center gap-3">
                          {isRTL ? item.name_ar : item.name_en}
                          <span className="px-3 py-1 text-sm rounded-full font-medium bg-blue-100 text-blue-800">
                            {t("profile:stable")}
                          </span>
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Tag className="w-5 h-5 text-gray-500" />
                            {item.kindOfStable
                              ? item.kindOfStable.map((type) => t(`profile:category.${type}`)).join(", ")
                              : t("profile:category.other")}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-gray-500" />
                            {t("profile:boardingCapacity")}: {item.boardingCapacity}
                          </div>
                          <div className="flex items-center gap-2">
                            <Tag className="w-5 h-5 text-gray-500" />
                            {t("profile:rating")}:{" "}
                            {item.serviceAverageRating?.toFixed(1) || 0} (
                            {item.serviceRatingCount || 0} {t("profile:reviews")})
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 items-center">
                          <button
                            onClick={() =>
                              (window.location.href = `/Stables/edit-stable/${item._id}`)
                            }
                            className="px-5 py-2 bg-blue-100 text-blue-800 rounded-xl hover:bg-blue-200 transition-all flex items-center gap-2 font-medium"
                          >
                            <Edit className="w-5 h-5" />
                            {t("profile:editStable")}
                          </button>
                          <button
                            onClick={() => toggleItemExpansion(item._id)}
                            className="px-5 py-2 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2 font-medium"
                          >
                            {expandedItemId === item._id ? (
                              <>
                                <ChevronUp className="w-5 h-5" />
                                {t("profile:hideReservations")}
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-5 h-5" />
                                {t("profile:showReservations")} (
                                {reservationsByStable[item._id]?.length || item.reservations?.length || 0})
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteStable(item._id)}
                            className="px-5 py-2 bg-red-100 text-red-800 rounded-xl hover:bg-red-200 transition-all flex items-center gap-2 font-medium"
                          >
                            <Trash2 className="w-5 h-5" />
                            {t("profile:deleteStable")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <AnimatePresence>
                  {expandedItemId === item._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden bg-gray-50"
                    >
                      <div className="border-t border-gray-200 p-6">
                        {renderStableReservations(item._id)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StableOwner;
