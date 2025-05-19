"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Plus,
  Filter,
  ChevronDown,
  ChevronUp,
  Edit,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Tag,
  Box,
  Clipboard,
  Trash,
  Users,
  Clock,
  UserPlus,
} from "lucide-react";
import { client, urlFor } from "../../../lib/sanity";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import userFallbackImage from "../../../../public/assets/imgs/elements/user.png";
import NewProviderServiceForm from "../../../../components/elements/NewProviderServiceForm";
import AddServiceForm from "../../../../components/elements/AddServiceForm";
import JoinServiceForm from "../../../../components/elements/JoinServiceForm";
import ServiceRequestsDashboard from "../../../../components/elements/ServiceRequestsDashboard";

// Delete handlers (unchanged)
const handleProviderDeletion = async (providerId, client) => {
  try {
    const references = await client.fetch(
      `*[_type == "provider" && _id == $providerId]{_id, _type, "fields": *[references($providerId)]}`,
      { providerId }
    );

    const activeReservations = await client.fetch(
      `*[_type == "reservation" && provider._ref == $providerId && (status == "pending" || status == "approved")]{_id}`,
      { providerId }
    );

    if (activeReservations.length > 0) {
      throw new Error("Cannot delete provider with active reservations");
    }

    await client
      .fetch(
        `*[_type == "user" && references($providerId)]{_id}`,
        { providerId }
      )
      .then((users) =>
        Promise.all(
          users.map((user) =>
            client.patch(user._id).unset(["provider"]).commit()
          )
        )
      );

    await client
      .fetch(
        `*[_type == "services" && references($providerId)]{_id}`,
        { providerId }
      )
      .then((services) =>
        Promise.all(
          services.map((service) =>
            client.patch(service._id).unset(["providerRef"]).commit()
          )
        )
      );

    await client
      .fetch(
        `*[_type == "provider" && _id != $providerId && references($providerId)]{_id}`,
        { providerId }
      )
      .then((providers) =>
        Promise.all(
          providers.map((provider) =>
            client
              .patch(provider._id)
              .unset(["mainServiceRef", "servicesRef", "pendingRequests"])
              .commit()
          )
        )
      );

    await client
      .fetch(
        `*[_type == "serviceRequest" && (requesterProviderRef._ref == $providerId || receiverProviderRef._ref == $providerId)]{_id}`,
        { providerId }
      )
      .then((requests) =>
        Promise.all(requests.map((request) => client.delete(request._id)))
      );

    await client
      .fetch(
        `*[_type == "reservation" && provider._ref == $providerId && status == "rejected"]{_id}`,
        { providerId }
      )
      .then((reservations) =>
        Promise.all(
          reservations.map((reservation) => client.delete(reservation._id))
        )
      );

    const providerServices = await client.fetch(
      `*[_type == "services" && providerRef._ref == $providerId]{_id}`,
      { providerId }
    );

    await Promise.all(
      providerServices.map((service) => client.delete(service._id))
    );

    const remainingRefs = await client.fetch(
      `*[_type == "provider" && _id == $providerId]{_id, _type}`,
      { providerId }
    );

    if (remainingRefs.length > 0) {
      await Promise.all(
        remainingRefs.map((ref) =>
          client
            .patch(ref._id)
            .unset([
              "provider",
              "providerRef",
              "mainServiceRef",
              "servicesRef",
              "pendingRequests",
              "requesterProviderRef",
              "receiverProviderRef",
            ])
            .commit()
        )
      );
    }

    await client.delete(providerId);

    return {
      success: true,
      message: "Provider deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete provider",
      error: error.message,
    };
  }
};

const handleServiceDeletion = async (serviceId, providerId, client) => {
  try {
    await client
      .patch(providerId)
      .unset([`servicesRef[_ref == "${serviceId}"]`])
      .commit();

    const reservationIds = await client.fetch(
      `*[_type == "reservation" && services[0].serviceRef._ref == $serviceId]{_id}`,
      { serviceId }
    );

    if (reservationIds.length > 0) {
      await Promise.all(
        reservationIds.map((id) => client.delete(id))
      );
    }

    await client.delete(serviceId);

    return { success: true };
  } catch (error) {
    throw error;
  }
};

const UserServices = ({ userId }) => {
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedProviderId, setExpandedProviderId] = useState(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [showJoinService, setShowJoinService] = useState(false);
  const [existingProviderId, setExistingProviderId] = useState(null);
  const [selectedProviderName, setSelectedProviderName] = useState(null);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    const fetchProviders = async () => {
      setIsLoadingProviders(true);
      try {
        const query = `*[_type == "provider" && userRef._ref == $userId]{
          _id,
          name_en,
          name_ar,
          status,
          mainServiceRef->{
            _id,
            name_en,
            name_ar,
            image,
            price,
            statusAdminApproved,
            serviceType
          },
          servicesRef[]->{
            _id,
            name_en,
            name_ar,
            image,
            price,
            statusAdminApproved,
            serviceType
          },
          userRef->{
            userName,
            image
          }
        }`;
        const params = { userId };
        const result = await client.fetch(query, params);
        setProviders(result);
        setFilteredProviders(result);
      } catch (error) {
        console.error("Error fetching providers:", error);
        setError(t("profile:failedLoadProviders"));
      } finally {
        setIsLoadingProviders(false);
      }
    };

    const fetchReservations = async () => {
      setIsLoadingReservations(true);
      try {
        const query = `*[_type == "reservation" && provider._ref in *[_type == "provider" && userRef._ref == $userId]._id]{
          _id,
          status,
          paymentStatus,
          totalPrice,
          services[]{
            serviceRef->{
              _id,
              name_en,
              name_ar,
              serviceType
            },
            startDate,
            endDate,
            eventDate
          },
          createdAt,
          provider->{
            _id
          }
        }`;
        const params = { userId };
        const result = await client.fetch(query, params);
        setReservations(result);
      } catch (error) {
        console.error("Error fetching reservations:", error);
        setError(t("profile:failedLoadReservations"));
      } finally {
        setIsLoadingReservations(false);
      }
    };

    if (userId) {
      fetchProviders();
      fetchReservations();
    }
  }, [userId, t]);

  useEffect(() => {
    let filtered = [...providers];
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (provider) => provider.status === statusFilter
      );
    }
    setFilteredProviders(filtered);
  }, [statusFilter, providers]);

  const getDirectionClass = (defaultClasses = "") => {
    return `${defaultClasses} ${isRTL ? "rtl" : "ltr"}`;
  };

  const toggleProviderExpansion = (providerId) => {
    setExpandedProviderId(expandedProviderId === providerId ? null : providerId);
  };

  const handleDeleteProvider = async (providerId) => {
    if (window.confirm(t("profile:confirmDeleteProvider"))) {
      try {
        const result = await handleProviderDeletion(providerId, client);
        if (result.success) {
          setProviders((prev) =>
            prev.filter((provider) => provider._id !== providerId)
          );
          setFilteredProviders((prev) =>
            prev.filter((provider) => provider._id !== providerId)
          );
        } else {
          setError(result.message);
        }
      } catch (error) {
        console.error("Error deleting provider:", error);
        setError(t("profile:failedDeleteProvider"));
      }
    }
  };

  const handleDeleteService = async (serviceId, providerId) => {
    if (window.confirm(t("profile:confirmDeleteService"))) {
      try {
        await handleServiceDeletion(serviceId, providerId, client);
        setProviders((prevProviders) =>
          prevProviders.map((provider) =>
            provider._id === providerId
              ? {
                  ...provider,
                  servicesRef: provider.servicesRef.filter(
                    (service) => service._id !== serviceId
                  ),
                }
              : provider
          )
        );
        setFilteredProviders((prevProviders) =>
          prevProviders.map((provider) =>
            provider._id === providerId
              ? {
                  ...provider,
                  servicesRef: provider.servicesRef.filter(
                    (service) => service._id !== serviceId
                  ),
                }
              : provider
          )
        );
      } catch (error) {
        console.error("Error deleting service:", error);
        setError(t("profile:failedDeleteService"));
      }
    }
  };

  const NoProvidersView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={getDirectionClass(
        "text-center py-16 px-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg h-full min-h-[700px] flex justify-center items-center"
      )}
    >
      <div className="max-w-md mx-auto space-y-6 flex flex-col justify-center items-center text-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-2xl">
          <Users className="w-12 h-12 text-gray-800" />
        </div>
        <h3 className="text-3xl font-extrabold text-gray-900">
          {t("profile:startYourProviderJourney")}
        </h3>
        <p className="text-gray-600 text-lg">
          {t("profile:createYourFirstService")}
        </p>
        <button
          onClick={() => setShowServiceForm(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-black text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          {t("profile:createYourFirstService")}
        </button>
      </div>
    </motion.div>
  );

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

  const renderReservations = (providerId) => {
    const providerReservations = reservations.filter(
      (res) => res.provider._id === providerId
    );

    if (isLoadingReservations) {
      return (
        <div className="py-6 text-center">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="h-5 w-40 bg-gray-200 rounded-full"></div>
            <div className="h-4 w-60 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      );
    }

    if (providerReservations.length === 0) {
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
          {providerReservations.map((reservation) => (
            <div
              key={reservation._id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Clipboard className="w-5 h-5 text-gray-500" />
                    <span className="text-base font-medium">
                      {isRTL
                        ? reservation.services[0]?.serviceRef?.name_ar
                        : reservation.services[0]?.serviceRef?.name_en}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">
                      {t("profile:reservationDate")}: {formatDate(reservation.createdAt)}
                    </span>
                  </div>
                  {(reservation.services[0]?.startDate || reservation.services[0]?.endDate) && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <span className="text-sm">
                        {t("profile:servicePeriod")}:{" "}
                        {formatDate(reservation.services[0]?.startDate)} -{" "}
                        {formatDate(reservation.services[0]?.endDate)}
                      </span>
                    </div>
                  )}
                  {reservation.services[0]?.eventDate && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <span className="text-sm">
                        {t("profile:eventDate")}: {formatDate(reservation.services[0]?.eventDate)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">
                      {t("profile:totalPrice")}: {reservation.totalPrice}{" "}
                      {t("profile:currency")}
                    </span>
                  </div>
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
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() =>
                      (window.location.href = `/reservations/${reservation._id}`)
                    }
                    className="px-5 py-2 bg-blue-100 text-blue-800 rounded-xl hover:bg-blue-200 transition-all flex items-center justify-center gap-2 font-medium"
                  >
                    <Edit className="w-5 h-5" />
                    {t("profile:viewDetails")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const Modal = ({ isOpen, onClose, title, children }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
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
      )}
    </AnimatePresence>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="flex flex-row items-start md:items-center justify-between mb-5 gap-6">
        <h2 className="text-3xl font-extrabold text-gray-900">
          {t("profile:serviceManagement")}
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <button
            onClick={() => setShowServiceForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-black text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            {providers.length === 0
              ? t("profile:createYourFirstService")
              : t("profile:addNewService")}
          </button>
        </div>
      </div>
      <div className="flex flex-row justify-end gap-4 pb-4">
        <div className="relative flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-gray-800 font-medium focus:outline-none w-full"
          >
            <option value="all">{t("profile:allStatuses")}</option>
            <option value="active">{t("profile:active")}</option>
            <option value="inactive">{t("profile:inactive")}</option>
          </select>
        </div>
      </div>
      <div
        className={getDirectionClass(
          "bg-white rounded-2xl p-8 shadow-lg min-h-[700px]"
        )}
      >
        {isLoadingProviders || isLoadingReservations ? (
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
        ) : filteredProviders.length === 0 ? (
          <NoProvidersView />
        ) : (
          <div className="space-y-12">
            {filteredProviders.map((provider) => (
              <motion.div
                key={provider._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={getDirectionClass(
                  "relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100/50"
                )}
              >
                {/* Hero Section */}
                <div className="relative h-64 sm:h-80 overflow-hidden group">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Image
                      src={
                        provider.mainServiceRef?.image
                          ? urlFor(provider.mainServiceRef.image).url()
                          : userFallbackImage
                      }
                      alt={isRTL ? provider.name_ar : provider.name_en}
                      className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                      width={800}
                      height={320}
                    />
                  </motion.div>
                  {/* Status Badge */}
                  <div
                    className={`absolute top-4 ${
                      isRTL ? "left-4" : "right-4"
                    } px-4 py-2 inline-flex items-center rounded-full text-sm font-semibold backdrop-blur-sm transition-all duration-300 ${
                      provider.mainServiceRef?.statusAdminApproved
                        ? "bg-emerald-600/90 hover:bg-emerald-700 text-emerald-50 ring-2 ring-emerald-200/30"
                        : "bg-amber-500/90 hover:bg-amber-600/90 text-amber-50 ring-2 ring-amber-200/30 animate-pulse"
                    } shadow-xl hover:shadow-lg`}
                  >
                    {provider.mainServiceRef?.statusAdminApproved ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2 text-current" />
                        <span>{t("profile:approved")}</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-5 h-5 mr-2 text-current animate-pulse" />
                        <span>{t("profile:pendingReview")}</span>
                      </>
                    )}
                  </div>
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteProvider(provider._id)}
                    className={`absolute top-4 ${
                      isRTL ? "right-4" : "left-4"
                    } px-4 py-2 bg-red-600/90 text-white rounded-full flex items-center gap-2 text-sm hover:bg-red-700/90 transition-all duration-300`}
                  >
                    <Trash className="w-4 h-4" />
                    <span>{t("profile:delete")}</span>
                  </button>
                  {/* Profile Section */}
                  <div
                    className={getDirectionClass(
                      "absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/50 to-transparent"
                    )}
                  >
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                      <div className="relative">
                        <Image
                          src={
                            provider.userRef?.image
                              ? urlFor(provider.userRef.image).url()
                              : userFallbackImage
                          }
                          alt={provider.userRef?.userName}
                          className="w-20 h-20 rounded-full ring-4 ring-white/20 backdrop-blur-sm"
                          width={80}
                          height={80}
                        />
                      </div>
                      <div className="space-y-1 text-center sm:text-left">
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                          {isRTL ? provider.name_ar : provider.name_en}
                        </h2>
                        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 text-white/90">
                          <span>{t("profile:yearsExp")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Content Section */}
                <div className={getDirectionClass("p-6 space-y-6")}>
                  {provider.mainServiceRef && (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {t("profile:featuredService")}
                        </h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-gray-900">
                            {provider.mainServiceRef.price}
                          </span>
                          <span className="text-base text-gray-500">
                            {t("profile:currency")}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          {t(
                            `profile:serviceType.${
                              provider.mainServiceRef?.serviceType || "other"
                            }`
                          )}
                        </div>
                        <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center gap-2">
                          <Box className="w-4 h-4" />
                          {t(`profile:${provider.status}`)}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Additional Services Section */}
                  {provider.servicesRef?.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pt-6">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                          <Briefcase className="w-5 h-5 text-blue-600" />
                          {t("profile:additionalServices")}
                          <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-sm">
                            {provider.servicesRef.length}
                          </span>
                        </h4>
                      </div>
                      <div className="bg-gray-50 flex gap-4 pb-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-50">
                        {provider.servicesRef.map((service) => (
                          <motion.div
                            key={service._id}
                            whileHover={{ scale: 1.05 }}
                            className="relative group flex-shrink-0"
                          >
                            <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-white shadow-lg">
                              <Image
                                src={
                                  service.image
                                    ? urlFor(service.image).url()
                                    : userFallbackImage
                                }
                                alt={isRTL ? service.name_ar : service.name_en}
                                className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                                width={96}
                                height={96}
                              />
                              <div
                                className={`absolute top-1 ${
                                  isRTL ? "left-1" : "right-1"
                                } w-3 h-3 rounded-full ${
                                  service.statusAdminApproved
                                    ? "bg-green-500"
                                    : "bg-yellow-500 animate-pulse"
                                }`}
                              />
                              <button
                                onClick={() =>
                                  handleDeleteService(service._id, provider._id)
                                }
                                className="absolute top-1 left-1 p-1 bg-red-600/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              >
                                <Trash className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="absolute inset-x-0 -bottom-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <span className="inline-block px-2 py-1 bg-black/90 text-white text-xs rounded-lg">
                                {isRTL ? service.name_ar : service.name_en}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Service Requests Dashboard */}
                  <ServiceRequestsDashboard providerId={provider._id} />
                  {/* Action Buttons */}
                  <div className={getDirectionClass("grid grid-cols-1 sm:grid-cols-3 gap-4")}>
                    <motion.button
                      whileHover={{ y: -2 }}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-blue-500 text-blue-500 rounded-xl font-medium hover:bg-blue-50 transition-colors"
                      onClick={() =>
                        (window.location.href = `/services/edit/${provider._id}`)
                      }
                    >
                      <Edit className="w-5 h-5" />
                      {t("profile:editService")}
                    </motion.button>
                    <motion.button
                      whileHover={{ y: -2 }}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-blue-500 text-blue-500 rounded-xl font-medium hover:bg-blue-50 transition-colors"
                      onClick={() => {
                        setExistingProviderId(provider._id);
                        setSelectedProviderName(isRTL ? provider.name_ar : provider.name_en);
                        setShowAddService(true);
                      }}
                    >
                      <Plus className="w-5 h-5" />
                      {t("profile:addService")}
                    </motion.button>
                    <motion.button
                      whileHover={{ y: -2 }}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#b28a2f] to-[#9b7733] text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
                      onClick={() => {
                        setExistingProviderId(provider._id);
                        setShowJoinService(true);
                      }}
                    >
                      <UserPlus className="w-5 h-5" />
                      {t("profile:joinService")}
                    </motion.button>
                    <motion.button
                      whileHover={{ y: -2 }}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-800 rounded-xl font-medium hover:bg-gray-200 transition-all"
                      onClick={() => toggleProviderExpansion(provider._id)}
                    >
                      {expandedProviderId === provider._id ? (
                        <>
                          <ChevronUp className="w-5 h-5" />
                          {t("profile:hideReservations")}
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-5 h-5" />
                          {t("profile:showReservations")} (
                          {
                            reservations.filter(
                              (res) => res.provider._id === provider._id
                            ).length
                          })
                        </>
                      )}
                    </motion.button>
                  </div>
                  {/* Reservations Section */}
                  <AnimatePresence>
                    {expandedProviderId === provider._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden bg-gray-50"
                      >
                        <div className="border-t border-gray-200 p-6">
                          {renderReservations(provider._id)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Modal
        isOpen={showServiceForm}
        onClose={() => setShowServiceForm(false)}
        title={t("profile:createNewService")}
      >
        <NewProviderServiceForm
          currentUser={{ userId, userType: "provider" }}
          onSuccess={() => {
            setShowServiceForm(false);
            const fetchProviders = async () => {
              try {
                const query = `*[_type == "provider" && userRef._ref == $userId]{
                  _id,
                  name_en,
                  name_ar,
                  status,
                  mainServiceRef->{
                    _id,
                    name_en,
                    name_ar,
                    image,
                    price,
                    statusAdminApproved,
                    serviceType
                  },
                  servicesRef[]->{
                    _id,
                    name_en,
                    name_ar,
                    image,
                    price,
                    statusAdminApproved,
                    serviceType
                  },
                  userRef->{
                    userName,
                    image
                  }
                }`;
                const params = { userId };
                const result = await client.fetch(query, params);
                setProviders(result);
                setFilteredProviders(result);
              } catch (error) {
                console.error("Error fetching providers:", error);
                setError(t("profile:failedLoadProviders"));
              }
            };
            fetchProviders();
          }}
        />
      </Modal>
      <Modal
        isOpen={showAddService}
        onClose={() => setShowAddService(false)}
        title={`${t("profile:addService")} ${selectedProviderName || t("profile:featuredService")}`}
      >
        <AddServiceForm
          providerId={existingProviderId}
          onSuccess={() => {
            setShowAddService(false);
            const fetchProviders = async () => {
              try {
                const query = `*[_type == "provider" && userRef._ref == $userId]{
                  _id,
                  name_en,
                  name_ar,
                  status,
                  mainServiceRef->{
                    _id,
                    name_en,
                    name_ar,
                    image,
                    price,
                    statusAdminApproved,
                    serviceType
                  },
                  servicesRef[]->{
                    _id,
                    name_en,
                    name_ar,
                    image,
                    price,
                    statusAdminApproved,
                    serviceType
                  },
                  userRef->{
                    userName,
                    image
                  }
                }`;
                const params = { userId };
                const result = await client.fetch(query, params);
                setProviders(result);
                setFilteredProviders(result);
              } catch (error) {
                console.error("Error fetching providers:", error);
                setError(t("profile:failedLoadProviders"));
              }
            };
            fetchProviders();
          }}
        />
      </Modal>
      <Modal
        isOpen={showJoinService}
        onClose={() => setShowJoinService(false)}
        title={t("profile:joinService")}
      >
        <JoinServiceForm
          currentProviderId={existingProviderId}
          currentUserId={userId}
          onClose={() => setShowJoinService(false)}
        />
      </Modal>
    </motion.div>
  );
};

export default UserServices;