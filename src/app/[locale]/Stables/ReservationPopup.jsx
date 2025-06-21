"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Horse, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { client } from "../../../../lib/sanity";
import { v4 as uuidv4 } from "uuid";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ReservationPopup = ({ isOpen, onClose, stableId, stableName, userRef }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // State management
  const [step, setStep] = useState(1); // Multi-step form
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userHorses, setUserHorses] = useState([]);
  const [stableData, setStableData] = useState(null);

  // Reservation state
  const [reservationType, setReservationType] = useState(""); // "boarding", "services", or "both"
  const [boarding, setBoarding] = useState({
    horses: [],
    startDate: null,
    endDate: null,
    additionalServices: [],
    quantity: 1,
    priceUnit: "",
  });
  const [services, setServices] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // Fetch user and stable data
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Verify user authentication
        const authResponse = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!authResponse.ok) throw new Error("Authentication failed");
        const authData = await authResponse.json();
        if (authData.authenticated) {
          setCurrentUserId(authData.userId || authData.user?.id || authData.user?.userId);
        } else {
          throw new Error("User not authenticated");
        }

        // Fetch user horses
        const userQuery = `*[_type == "user" && _id == $userId][0]{horses[]->{_id, name_ar, name_en}}`;
        const userData = await client.fetch(userQuery, { userId: authData.userId });
        setUserHorses(userData?.horses || []);

        // Fetch stable details
        const stableQuery = `*[_type == "stables" && _id == $stableId][0]{
          boardingDetails,
          fullTimeServices[]->{
            _id,
            name_ar,
            name_en,
            price,
            priceUnit,
            serviceType,
            "additionalServices": *[_type == "services" && _id == ^._id][0].VeterinaryDetails.additionalServices || 
                                 *[_type == "services" && _id == ^._id][0].horseTrainerDetails.additionalBenefits ||
                                 *[_type == "services" && _id == ^._id][0].hoofTrimmerDetails.additionalServices ||
                                 *[_type == "services" && _id == ^._id][0].horseGroomingDetails.additionalServices ||
                                 *[_type == "services" && _id == ^._id][0].horseCateringDetails.additionalServices ||
                                 []
          },
          freelancerServices[]->{
            _id,
            name_ar,
            name_en,
            price,
            priceUnit,
            serviceType,
            "additionalServices": *[_type == "services" && _id == ^._id][0].VeterinaryDetails.additionalServices || 
                                 *[_type == "services" && _id == ^._id][0].horseTrainerDetails.additionalBenefits ||
                                 *[_type == "services" && _id == ^._id][0].hoofTrimmerDetails.additionalServices ||
                                 *[_type == "services" && _id == ^._id][0].horseGroomingDetails.additionalServices ||
                                 *[_type == "services" && _id == ^._id][0].horseCateringDetails.additionalServices ||
                                 []
          }
        }`;
        const stableData = await client.fetch(stableQuery, { stableId });
        setStableData(stableData);
        setBoarding((prev) => ({
          ...prev,
          priceUnit: stableData?.boardingDetails?.boardingPriceUnit || "per_day",
        }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, stableId]);

  // Calculate total price
  useEffect(() => {
    let calculatedTotal = 0;

    // Boarding price
    if (reservationType === "boarding" || reservationType === "both") {
      const boardingPrice = stableData?.boardingDetails?.boardingPrice || 0;
      const boardingQuantity = boarding.quantity || 1;
      const boardingServicesPrice = boarding.additionalServices.reduce(
        (sum, service) => sum + (service.price || 0),
        0
      );
      calculatedTotal += boardingPrice * boardingQuantity + boardingServicesPrice;
    }

    // Services price
    if (reservationType === "services" || reservationType === "both") {
      services.forEach((service) => {
        const servicePrice = service.price || 0;
        const quantity = service.quantity || 1;
        const benefitsPrice = service.additionalServices.reduce(
          (sum, benefit) => sum + (benefit.price || 0),
          0
        );
        calculatedTotal += servicePrice * quantity + benefitsPrice;
      });
    }

    setTotalPrice(calculatedTotal);
  }, [reservationType, boarding, services, stableData]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUserId) {
      setError(t("reservation:loginRequired"));
      return;
    }

    setLoading(true);
    try {
      const reservation = {
        _type: "reservation",
        user: { _type: "reference", _ref: currentUserId },
        stableRef: { _type: "reference", _ref: stableId },
        totalPrice,
        status: "pending",
        paymentStatus: "pending",
        createdAt: new Date().toISOString(),
      };

      if (reservationType === "boarding" || reservationType === "both") {
        reservation.boarding = {
          horses: boarding.horses.map((horse) => ({
            _type: "reference",
            _ref: horse._id,
          })),
          startDate: boarding.startDate?.toISOString(),
          endDate: boarding.endDate?.toISOString(),
          priceUnit: boarding.priceUnit,
          quantity: boarding.quantity,
          additionalServices: boarding.additionalServices.map((service) => ({
            name_ar: service.name_ar,
            name_en: service.name_en,
            price: service.price,
          })),
        };
      }

      if (reservationType === "services" || reservationType === "both") {
        reservation.services = services.map((service) => ({
          serviceRef: { _type: "reference", _ref: service._id },
          priceUnit: service.priceUnit,
          quantity: service.quantity || 1,
          startDate: service.startDate?.toISOString(),
          endDate: service.endDate?.toISOString(),
          additionalBenefits: service.additionalServices.map((benefit) => ({
            name_ar: benefit.name_ar,
            name_en: benefit.name_en,
            additional_price: benefit.price,
          })),
          ...(service.horse && {
            horse: { _type: "reference", _ref: service.horse._id },
          }),
        }));
      }

      await client.create(reservation);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setStep(1);
        setReservationType("");
        setBoarding({
          horses: [],
          startDate: null,
          endDate: null,
          additionalServices: [],
          quantity: 1,
          priceUnit: stableData?.boardingDetails?.boardingPriceUnit || "per_day",
        });
        setServices([]);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Render step 1: Choose reservation type
  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-center">
        {t("reservation:chooseType")}
      </h2>
      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => {
            setReservationType("boarding");
            setStep(2);
          }}
          className="p-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-left flex items-center transition-all"
        >
          <Horse className="mr-3 text-primary" size={24} />
          <div>
            <p className="font-semibold">{t("reservation:boarding")}</p>
            <p className="text-sm text-gray-600">
              {t("reservation:boardingDescription")}
            </p>
          </div>
        </button>
        <button
          onClick={() => {
            setReservationType("services");
            setStep(2);
          }}
          className="p-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-left flex items-center transition-all"
        >
          <CheckCircle className="mr-3 text-primary" size={24} />
          <div>
            <p className="font-semibold">{t("reservation:services")}</p>
            <p className="text-sm text-gray-600">
              {t("reservation:servicesDescription")}
            </p>
          </div>
        </button>
        <button
          onClick={() => {
            setReservationType("both");
            setStep(2);
          }}
          className="p-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-left flex items-center transition-all"
        >
          <div className="mr-3 text-primary flex items-center">
            <Horse size={20} className="mr-1" />
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="font-semibold">{t("reservation:both")}</p>
            <p className="text-sm text-gray-600">
              {t("reservation:bothDescription")}
            </p>
          </div>
        </button>
      </div>
    </motion.div>
  );

  // Render step 2: Configure reservation
  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-center">
        {t("reservation:configureReservation")}
      </h2>

      {(reservationType === "boarding" || reservationType === "both") && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold">{t("reservation:boardingDetails")}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("reservation:selectHorses")}
              </label>
              <select
                multiple
                value={boarding.horses.map((h) => h._id)}
                onChange={(e) => {
                  const selectedIds = Array.from(e.target.selectedOptions).map((o) => o.value);
                  const selectedHorses = userHorses.filter((h) => selectedIds.includes(h._id));
                  setBoarding((prev) => ({ ...prev, horses: selectedHorses }));
                }}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              >
                {userHorses.map((horse) => (
                  <option key={horse._id} value={horse._id}>
                    {isRTL ? horse.name_ar : horse.name_en}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t("reservation:startDate")}
                </label>
                <DatePicker
                  selected={boarding.startDate}
                  onChange={(date) => setBoarding((prev) => ({ ...prev, startDate: date }))}
                  showTimeSelect
                  timeIntervals={15}
                  dateFormat="yyyy-MM-dd HH:mm"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                  minDate={new Date()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t("reservation:endDate")}
                </label>
                <DatePicker
                  selected={boarding.endDate}
                  onChange={(date) => setBoarding((prev) => ({ ...prev, endDate: date }))}
                  showTimeSelect
                  timeIntervals={15}
                  dateFormat="yyyy-MM-dd HH:mm"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                  minDate={boarding.startDate || new Date()}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("reservation:quantity")} ({t(`reservation:${boarding.priceUnit}`)})
              </label>
              <input
                type="number"
                value={boarding.quantity}
                onChange={(e) =>
                  setBoarding((prev) => ({
                    ...prev,
                    quantity: parseInt(e.target.value) || 1,
                  }))
                }
                min="1"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("reservation:additionalServices")}
              </label>
              {stableData?.boardingDetails?.additionalServices?.map((service, index) => (
                <div key={index} className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={boarding.additionalServices.some(
                      (s) => s.name_en === service.name_en
                    )}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setBoarding((prev) => ({
                          ...prev,
                          additionalServices: [...prev.additionalServices, service],
                        }));
                      } else {
                        setBoarding((prev) => ({
                          ...prev,
                          additionalServices: prev.additionalServices.filter(
                            (s) => s.name_en !== service.name_en
                          ),
                        }));
                      }
                    }}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-600">
                    {isRTL ? service.name_ar : service.name_en} (+{service.price}{" "}
                    {t("reservation:currency")})
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(reservationType === "services" || reservationType === "both") && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold">{t("reservation:servicesDetails")}</h3>
          <div className="space-y-4">
            {[...(stableData?.fullTimeServices || []), ...(stableData?.freelancerServices || [])].map(
              (service) => (
                <div key={service._id} className="border p-4 rounded-lg">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={services.some((s) => s._id === service._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setServices((prev) => [
                            ...prev,
                            {
                              _id: service._id,
                              name_ar: service.name_ar,
                              name_en: service.name_en,
                              price: service.price,
                              priceUnit: service.priceUnit,
                              startDate: null,
                              endDate: null,
                              quantity: 1,
                              additionalServices: [],
                              horse:
                                [
                                  "veterinary",
                                  "horse_catering",
                                  "horse_transport",
                                  "hoof_trimmer",
                                  "horse_grooming",
                                  "horse_trainer",
                                ].includes(service.serviceType)
                                  ? userHorses[0]
                                  : null,
                            },
                          ]);
                        } else {
                          setServices((prev) => prev.filter((s) => s._id !== service._id));
                        }
                      }}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label className="ml-2 font-medium">
                      {isRTL ? service.name_ar : service.name_en} ({service.price}{" "}
                      {t("reservation:currency")}/{t(`reservation:${service.priceUnit}`)})
                    </label>
                  </div>
                  {services.some((s) => s._id === service._id) && (
                    <div className="mt-4 space-y-4">
                      {service.priceUnit !== "per_project" && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              {t("reservation:startDate")}
                            </label>
                            <DatePicker
                              selected={services.find((s) => s._id === service._id)?.startDate}
                              onChange={(date) =>
                                setServices((prev) =>
                                  prev.map((s) =>
                                    s._id === service._id ? { ...s, startDate: date } : s
                                  )
                                )
                              }
                              showTimeSelect
                              timeIntervals={15}
                              dateFormat="yyyy-MM-dd HH:mm"
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                              minDate={new Date()}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              {t("reservation:endDate")}
                            </label>
                            <DatePicker
                              selected={services.find((s) => s._id === service._id)?.endDate}
                              onChange={(date) =>
                                setServices((prev) =>
                                  prev.map((s) =>
                                    s._id === service._id ? { ...s, endDate: date } : s
                                  )
                                )
                              }
                              showTimeSelect
                              timeIntervals={15}
                              dateFormat="yyyy-MM-dd HH:mm"
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                              minDate={
                                services.find((s) => s._id === service._id)?.startDate || new Date()
                              }
                            />
                          </div>
                        </div>
                      )}
                      {service.priceUnit !== "per_project" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            {t("reservation:quantity")} ({t(`reservation:${service.priceUnit}`)})
                          </label>
                          <input
                            type="number"
                            value={services.find((s) => s._id === service._id)?.quantity || 1}
                            onChange={(e) =>
                              setServices((prev) =>
                                prev.map((s) =>
                                  s._id === service._id
                                    ? { ...s, quantity: parseInt(e.target.value) || 1 }
                                    : s
                                )
                              )
                            }
                            min="1"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                          />
                        </div>
                      )}
                      {[
                        "veterinary",
                        "horse_catering",
                        "horse_transport",
                        "hoof_trimmer",
                        "horse_grooming",
                        "horse_trainer",
                      ].includes(service.serviceType) && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            {t("reservation:selectHorse")}
                          </label>
                          <select
                            value={services.find((s) => s._id === service._id)?.horse?._id || ""}
                            onChange={(e) =>
                              setServices((prev) =>
                                prev.map((s) =>
                                  s._id === service._id
                                    ? {
                                        ...s,
                                        horse: userHorses.find((h) => h._id === e.target.value),
                                      }
                                    : s
                                )
                              )
                            }
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                          >
                            {userHorses.map((horse) => (
                              <option key={horse._id} value={horse._id}>
                                {isRTL ? horse.name_ar : horse.name_en}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      {service.additionalServices?.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            {t("reservation:additionalServices")}
                          </label>
                          {service.additionalServices.map((benefit, index) => (
                            <div key={index} className="flex items-center mt-2">
                              <input
                                type="checkbox"
                                checked={services
                                  .find((s) => s._id === service._id)
                                  ?.additionalServices.some(
                                    (b) => b.name_en === benefit.name_en
                                  )}
                                onChange={(e) => {
                                  const currentService = services.find(
                                    (s) => s._id === service._id
                                  );
                                  if (e.target.checked) {
                                    setServices((prev) =>
                                      prev.map((s) =>
                                        s._id === service._id
                                          ? {
                                              ...s,
                                              additionalServices: [
                                                ...s.additionalServices,
                                                benefit,
                                              ],
                                            }
                                          : s
                                      )
                                    );
                                  } else {
                                    setServices((prev) =>
                                      prev.map((s) =>
                                        s._id === service._id
                                          ? {
                                              ...s,
                                              additionalServices: s.additionalServices.filter(
                                                (b) => b.name_en !== benefit.name_en
                                              ),
                                            }
                                          : s
                                      )
                                    );
                                  }
                                }}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                              />
                              <label className="ml-2 text-sm text-gray-600">
                                {isRTL ? benefit.name_ar : benefit.name_en} (+{benefit.price}{" "}
                                {t("reservation:currency")})
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => setStep(1)}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
        >
          {t("reservation:back")}
        </button>
        <button
          onClick={() => setStep(3)}
          disabled={
            (reservationType === "boarding" || reservationType === "both") &&
            (!boarding.horses.length || !boarding.startDate || !boarding.endDate)
          }
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("reservation:next")}
        </button>
      </div>
    </motion.div>
  );

  // Render step 3: Review and submit
  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-center">
        {t("reservation:reviewReservation")}
      </h2>
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        {(reservationType === "boarding" || reservationType === "both") && (
          <div>
            <h3 className="text-lg font-semibold">{t("reservation:boardingDetails")}</h3>
            <p>
              {t("reservation:horses")}:{" "}
              {boarding.horses.map((h) => (isRTL ? h.name_ar : h.name_en)).join(", ") || "N/A"}
            </p>
            <p>
              {t("reservation:dates")}:{" "}
              {boarding.startDate?.toLocaleString()} - {boarding.endDate?.toLocaleString()}
            </p>
            <p>
              {t("reservation:quantity")}: {boarding.quantity}{" "}
              {t(`reservation:${boarding.priceUnit}`)}
            </p>
            <p>
              {t("reservation:additionalServices")}:{" "}
              {boarding.additionalServices
                .map((s) => `${isRTL ? s.name_ar : s.name_en} (+${s.price})`)
                .join(", ") || "None"}
            </p>
            <p>
              {t("reservation:price")}:{" "}
              {(stableData?.boardingDetails?.boardingPrice || 0) * boarding.quantity +
                boarding.additionalServices.reduce((sum, s) => sum + s.price, 0)}{" "}
              {t("reservation:currency")}
            </p>
          </div>
        )}
        {(reservationType === "services" || reservationType === "both") && (
          <div>
            <h3 className="text-lg font-semibold">{t("reservation:servicesDetails")}</h3>
            {services.map((service) => (
              <div key={service._id} className="mt-2">
                <p>
                  {t("reservation:service")}: {isRTL ? service.name_ar : service.name_en}
                </p>
                {service.horse && (
                  <p>
                    {t("reservation:horse")}: {isRTL ? service.horse.name_ar : service.horse.name_en}
                  </p>
                )}
                {service.priceUnit !== "per_project" && (
                  <>
                    <p>
                      {t("reservation:dates")}:{" "}
                      {service.startDate?.toLocaleString()} - {service.endDate?.toLocaleString()}
                    </p>
                    <p>
                      {t("reservation:quantity")}: {service.quantity}{" "}
                      {t(`reservation:${service.priceUnit}`)}
                    </p>
                  </>
                )}
                <p>
                  {t("reservation:additionalServices")}:{" "}
                  {service.additionalServices
                    .map((b) => `${isRTL ? b.name_ar : b.name_en} (+${b.price})`)
                    .join(", ") || "None"}
                </p>
                <p>
                  {t("reservation:price")}:{" "}
                  {(service.price || 0) * (service.quantity || 1) +
                    service.additionalServices.reduce((sum, b) => sum + b.price, 0)}{" "}
                  {t("reservation:currency")}
                </p>
              </div>
            ))}
          </div>
        )}
        <div className="text-lg font-bold">
          {t("reservation:totalPrice")}: {totalPrice} {t("reservation:currency")}
        </div>
      </div>
      <div className="flex justify-between">
        <button
          onClick={() => setStep(2)}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
        >
          {t("reservation:back")}
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
          {t("reservation:submit")}
        </button>
      </div>
    </motion.div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 relative"
          onClick={(e) => e.stopPropagation()}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            aria-label={t("reservation:close")}
          >
            <X size={24} />
          </button>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-center">
              {t("reservation:title", { stableName })}
            </h1>
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>{t("reservation:step")} {step} {t("reservation:of")} 3</span>
              <span>
                {step === 1
                  ? t("reservation:chooseType")
                  : step === 2
                  ? t("reservation:configure")
                  : t("reservation:review")}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center">
              <AlertTriangle className="mr-2" size={20} />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center">
              <CheckCircle className="mr-2" size={20} />
              {t("reservation:successMessage")}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReservationPopup;