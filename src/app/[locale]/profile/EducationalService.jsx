"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Book,
  Plus,
  Filter,
  Trash2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  Edit,
  Tag,
} from "lucide-react";
import { client, urlFor } from "../../../lib/sanity";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import userFallbackImage from "../../../../public/assets/imgs/elements/user.png";

const EducationalServices = ({ userId }) => {
  const [courses, setCourses] = useState([]);
  const [books, setBooks] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [ordersByItem, setOrdersByItem] = useState({});
  const [loadingOrders, setLoadingOrders] = useState(false);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const locale = i18n.language;

  useEffect(() => {
    const fetchEducationalServices = async () => {
      setIsLoading(true);
      try {
        const courseQuery = `*[_type == "course" && instructor._ref == $userId]{
          _id,
          title,
          description,
          price,
          category,
          language,
          level,
          duration,
          averageRating,
          ratingCount,
          images,
          orders[]->{ _id }
        }`;
        const bookQuery = `*[_type == "book" && author._ref == $userId]{
          _id,
          title,
          description,
          price,
          category,
          language,
          averageRating,
          ratingCount,
          images,
          orders[]->{ _id }
        }`;

        const params = { userId };
        const [courseResult, bookResult] = await Promise.all([
          client.fetch(courseQuery, params),
          client.fetch(bookQuery, params),
        ]);

        setCourses(courseResult);
        setBooks(bookResult);

        const combinedItems = [
          ...courseResult.map((item) => ({ ...item, type: "course" })),
          ...bookResult.map((item) => ({ ...item, type: "book" })),
        ];
        setFilteredItems(combinedItems);
      } catch (error) {
        console.error("Error fetching educational services:", error);
        setError(t("profile:failedLoadEducationalServices"));
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchEducationalServices();
    }
  }, [userId, t]);

  useEffect(() => {
    let filtered = [
      ...courses.map((item) => ({ ...item, type: "course" })),
      ...books.map((item) => ({ ...item, type: "book" })),
    ];

    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    setFilteredItems(filtered);
  }, [categoryFilter, courses, books]);

  const getDirectionClass = (defaultClasses = "") => {
    return `${defaultClasses} ${isRTL ? "rtl" : "ltr"}`;
  };

  const fetchItemOrders = async (itemId, itemType) => {
    if (ordersByItem[itemId]) return;
    setLoadingOrders(true);
    try {
      const query =
        itemType === "course"
          ? `*[_type == "orderCourse" && course._ref == $itemId]{
              _id,
              orderDate,
              status,
              paymentStatus,
              price,
              user->{
                _id,
                userName,
                email
              }
            }`
          : `*[_type == "orderBook" && book._ref == $itemId]{
              _id,
              orderDate,
              status,
              paymentStatus,
              price,
              user->{
                _id,
                userName,
                email
              }
            }`;
      const params = { itemId };
      const result = await client.fetch(query, params);
      setOrdersByItem((prev) => ({
        ...prev,
        [itemId]: result,
      }));
    } catch (error) {
      console.error("Error fetching item orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const toggleItemExpansion = async (itemId, itemType) => {
    if (expandedItemId === itemId) {
      setExpandedItemId(null);
    } else {
      setExpandedItemId(itemId);
      await fetchItemOrders(itemId, itemType);
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await client.patch(orderId).set({ status: newStatus }).commit();
      setOrdersByItem((prev) => {
        const updated = { ...prev };
        for (const itemId in updated) {
          updated[itemId] = updated[itemId].map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          );
        }
        return updated;
      });
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleDeleteItem = async (itemId, itemType) => {
    const itemOrders = ordersByItem[itemId] || [];
    if (itemOrders.length > 0) {
      alert(t("profile:cannotDeleteWithOrders"));
      return;
    }

    if (confirm(t("profile:confirmDelete"))) {
      try {
        await client.delete(itemId);
        if (itemType === "course") {
          setCourses(courses.filter((course) => course._id !== itemId));
        } else {
          setBooks(books.filter((book) => book._id !== itemId));
        }
        setFilteredItems(filteredItems.filter((item) => item._id !== itemId));
      } catch (error) {
        console.error("Error deleting item:", error);
        alert(t("profile:failedDelete"));
      }
    }
  };

  const NoEducationalServicesView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={getDirectionClass(
        "text-center py-16 px-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg h-full min-h-[700px] flex justify-center items-center"
      )}
    >
      <div className="max-w-md mx-auto space-y-6 flex flex-col justify-center items-center text-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-2xl">
          <Book className="w-12 h-12 text-gray-800" />
        </div>
        <h3 className="text-3xl font-extrabold text-gray-900">
          {t("profile:noEducationalServicesFound")}
        </h3>
        <p className="text-gray-600 text-lg">
          {t("profile:noEducationalServicesYet")}
        </p>
        <div className={getDirectionClass("flex gap-4")}>
          <button
            onClick={() => (window.location.href = `/${locale}/books/add-book`)}
            className={getDirectionClass(
              "inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-black text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            )}
          >
            <Plus className="w-5 h-5" />
            {t("profile:addBook")}
          </button>
          <button
            onClick={() => (window.location.href = `/${locale}/courses/add-course`)}
            className={getDirectionClass(
              "inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-black text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            )}
          >
            <Plus className="w-5 h-5" />
            {t("profile:addCourse")}
          </button>
        </div>
      </div>
    </motion.div>
  );

  const categoryOptions = [
    { value: "all", label: t("profile:allCategories") },
    {
      value: "equine_anatomy_physiology",
      label: t("profile:category.equine_anatomy_physiology"),
    },
    {
      value: "equine_nutrition",
      label: t("profile:category.equine_nutrition"),
    },
    {
      value: "stable_management",
      label: t("profile:category.stable_management"),
    },
    {
      value: "horse_care_grooming",
      label: t("profile:category.horse_care_grooming"),
    },
    {
      value: "riding_instruction",
      label: t("profile:category.riding_instruction"),
    },
    {
      value: "equine_health_first_aid",
      label: t("profile:category.equine_health_first_aid"),
    },
    {
      value: "equine_reproduction_breeding",
      label: t("profile:category.equine_reproduction_breeding"),
    },
    {
      value: "horse_training_behavior",
      label: t("profile:category.horse_training_behavior"),
    },
    {
      value: "equine_business_management",
      label: t("profile:category.equine_business_management"),
    },
    {
      value: "equine_law_ethics",
      label: t("profile:category.equine_law_ethics"),
    },
    {
      value: "horse_show_management_judging",
      label: t("profile:category.horse_show_management_judging"),
    },
    {
      value: "equine_assisted_services",
      label: t("profile:category.equine_assisted_services"),
    },
    {
      value: "equine_competition_disciplines",
      label: t("profile:category.equine_competition_disciplines"),
    },
    {
      value: "equine_recreation_tourism",
      label: t("profile:category.equine_recreation_tourism"),
    },
    {
      value: "equine_rescue_rehabilitation",
      label: t("profile:category.equine_rescue_rehabilitation"),
    },
    {
      value: "equine_sports_medicine",
      label: t("profile:category.equine_sports_medicine"),
    },
    {
      value: "equine_facility_design_management",
      label: t("profile:category.equine_facility_design_management"),
    },
    {
      value: "equine_marketing_promotion",
      label: t("profile:category.equine_marketing_promotion"),
    },
    {
      value: "equine_photography_videography",
      label: t("profile:category.equine_photography_videography"),
    },
    {
      value: "equine_journalism_writing",
      label: t("profile:category.equine_journalism_writing"),
    },
    {
      value: "equine_history_culture",
      label: t("profile:category.equine_history_culture"),
    },
    {
      value: "equine_environmental_stewardship",
      label: t("profile:category.equine_environmental_stewardship"),
    },
    {
      value: "equine_technology_innovation",
      label: t("profile:category.equine_technology_innovation"),
    },
    {
      value: "equine_entrepreneurship",
      label: t("profile:category.equine_entrepreneurship"),
    },
    {
      value: "equine_dentistry",
      label: t("profile:category.equine_dentistry"),
    },
    { value: "equine_podiatry", label: t("profile:category.equine_podiatry") },
    { value: "english_riding", label: t("profile:category.english_riding") },
    { value: "western_riding", label: t("profile:category.western_riding") },
    { value: "jumping_hunter", label: t("profile:category.jumping_hunter") },
    { value: "other", label: t("profile:category.other") },
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

  const renderOrderStatusBadge = (status) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      completed: "bg-green-100 text-green-800 border-green-300",
      cancelled: "bg-red-100 text-red-800 border-red-300",
      failed: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return (
      <span
        className={getDirectionClass(
          `px-3 py-1 rounded-full text-sm font-medium border ${
            statusStyles[status] || "bg-gray-100 border-gray-300"
          }`
        )}
      >
        {t(`profile:orderStatus.${status}`)}
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
        className={getDirectionClass(
          `px-3 py-1 rounded-full text-sm font-medium border ${
            statusStyles[status] || "bg-gray-100 border-gray-300"
          }`
        )}
      >
        {t(`profile:paymentStatus.${status}`)}
      </span>
    );
  };

  const renderItemOrders = (itemId) => {
    const orders = ordersByItem[itemId] || [];

    if (loadingOrders) {
      return (
        <div className="py-6 text-center">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="h-5 w-40 bg-gray-200 rounded-full"></div>
            <div className="h-4 w-60 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="py-8 text-center">
          <p className="text-gray-600 text-lg">{t("profile:noOrdersFound")}</p>
        </div>
      );
    }

    return (
      <div className="mt-6 space-y-6">
        <h4 className={getDirectionClass("font-semibold text-xl border-b border-gray-200 pb-3")}>
          {t("profile:orderHistory")}
        </h4>
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className={getDirectionClass(
                "bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              )}
            >
              <div className={getDirectionClass("flex flex-col md:flex-row justify-between gap-6")}>
                <div className="space-y-3">
                  <div className={getDirectionClass("flex items-center gap-3")}>
                    <Users className="w-5 h-5 text-gray-500" />
                    <span className="text-base font-medium">
                      {order.user?.userName || t("profile:unknownUser")}
                    </span>
                  </div>
                  <div className={getDirectionClass("flex items-center gap-3")}>
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">
                      {t("profile:orderDate")}: {formatDate(order.orderDate)}
                    </span>
                  </div>
                  <div className={getDirectionClass("flex items-center gap-3")}>
                    <DollarSign className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">
                      {t("profile:price")}: {order.price}{" "}
                      {t("profile:currency")}
                    </span>
                  </div>
                  <div className={getDirectionClass("flex flex-wrap items-center gap-4")}>
                    <div className={getDirectionClass("flex items-center gap-2")}>
                      <span className="text-sm font-medium">
                        {t("profile:status")}:
                      </span>
                      {renderOrderStatusBadge(order.status)}
                    </div>
                    <div className={getDirectionClass("flex items-center gap-2")}>
                      <span className="text-sm font-medium">
                        {t("profile:payment")}:
                      </span>
                      {renderPaymentStatusBadge(order.paymentStatus)}
                    </div>
                  </div>
                </div>
                {order.status === "pending" &&
                  order.paymentStatus === "paid" && (
                    <button
                      onClick={() =>
                        handleOrderStatusChange(order._id, "completed")
                      }
                      className={getDirectionClass(
                        "px-5 py-2 bg-blue-100 text-blue-800 rounded-xl hover:bg-blue-200 transition-all flex items-center justify-center gap-2 font-medium"
                      )}
                    >
                      <CheckCircle className="w-5 h-5" />
                      {t("profile:markAsCompleted")}
                    </button>
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
      className={getDirectionClass("container mx-auto px-4 py-8 font-sans")}
      dir={isRTL ? "rtl" : "ltr"}
      style={isRTL ? { fontFamily: "'Noto Sans Arabic', sans-serif" } : {}}
    >
      <div
        className={getDirectionClass(
          `flex flex-col md:flex-row ${isRTL ? "md:" : ""} md:items-start md:justify-between mb-5 gap-6`
        )}
      >
        <h2 className="text-3xl font-extrabold text-gray-900">
          {t("profile:educationalServices")}
        </h2>
        <div
          className={getDirectionClass(
            `flex flex-col sm:flex-row ${isRTL ? "sm:" : ""} gap-4 w-full md:w-auto`
          )}
        >
          <button
            onClick={() => (window.location.href = `/${locale}/books/add-book`)}
            className={getDirectionClass(
              "inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-black text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            )}
          >
            <Plus className="w-5 h-5" />
            {t("profile:addBook")}
          </button>
          <button
            onClick={() => (window.location.href = `/${locale}/courses/add-course`)}
            className={getDirectionClass(
              "inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-black text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            )}
          >
            <Plus className="w-5 h-5" />
            {t("profile:addCourse")}
          </button>
        </div>
      </div>
      <div
        className={getDirectionClass(
          `flex flex-row ${isRTL ? "" : ""} justify-end gap-4 pb-4`
        )}
      >
        <div className={getDirectionClass("relative flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-2")}>
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent text-gray-800 font-medium focus:outline-none w-full"
          >
            {categoryOptions.map((option) => (
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
          <NoEducationalServicesView />
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
                  <div className={getDirectionClass("flex flex-col md:flex-row md:items-start justify-between gap-6")}>
                      <div
                        className={getDirectionClass(
                          `flex items-start gap-6 ${isRTL ? "md:" : ""}`
                        )}
                      >
                      <div className="group relative bg-gray-100 rounded-2xl p-4">
                        <div className="relative">
                          <a className="block" href="#">
                            <div className="p-3 flex justify-center">
                              <Image
                                src={
                                  item.images?.[0]
                                    ? urlFor(item.images[0]).url()
                                    : userFallbackImage
                                }
                                width={200}
                                height={200}
                                alt={item.title}
                                className="object-cover rounded-xl"
                              />
                            </div>
                          </a>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className={getDirectionClass("text-xl font-semibold flex items-center gap-3")}>
                          {item.title}
                          <span
                            className={getDirectionClass(
                              `px-3 py-1 text-sm rounded-full font-medium ${
                                item.type === "course"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`
                            )}
                          >
                            {t(`profile:${item.type}`)}
                          </span>
                        </h3>
                        <div className={getDirectionClass("flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600")}>
                          <div className={getDirectionClass("flex items-center gap-2")}>
                            <Tag className="w-5 h-5 text-gray-500" />
                            {t(`profile:category.${item.category || "other"}`)}
                          </div>
                          <div className={getDirectionClass("flex items-center gap-2")}>
                            <DollarSign className="w-5 h-5 text-gray-500" />
                            {item.price
                              ? `${item.price} ${t("profile:currency")}`
                              : t("profile:free")}
                          </div>
                          <div className={getDirectionClass("flex items-center gap-2")}>
                            <Book className="w-5 h-5 text-gray-500" />
                            {t("profile:rating")}:{" "}
                            {item.averageRating?.toFixed(1) || 0} (
                            {item.ratingCount || 0} {t("profile:reviews")})
                          </div>
                          {item.type === "course" && (
                            <>
                              <div className={getDirectionClass("flex items-center gap-2")}>
                                <Clock className="w-5 h-5 text-gray-500" />
                                {t("profile:duration")}: {item.duration}
                              </div>
                              <div className={getDirectionClass("flex items-center gap-2")}>
                                <Users className="w-5 h-5 text-gray-500" />
                                {t("profile:level")}:{" "}
                                {t(`profile:${item.level}`)}
                              </div>
                            </>
                          )}
                        </div>
                        <div className={getDirectionClass("flex flex-wrap gap-3 items-center")}>
                          <button
                            onClick={() =>
                              (window.location.href = `/${locale}/${
                                item.type === "book" ? "books" : "courses"
                              }/edit/${item._id}`)
                            }
                            className={getDirectionClass(
                              "px-5 py-2 bg-blue-100 text-blue-800 rounded-xl hover:bg-blue-200 transition-all flex items-center gap-2 font-medium"
                            )}
                          >
                            <Edit className="w-5 h-5" />
                            {t("profile:editService")}
                          </button>
                          <button
                            onClick={() =>
                              toggleItemExpansion(item._id, item.type)
                            }
                            className={getDirectionClass(
                              "px-5 py-2 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2 font-medium"
                            )}
                          >
                            {expandedItemId === item._id ? (
                              <>
                                <ChevronUp className="w-5 h-5" />
                                {t("profile:hideOrders")}
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-5 h-5" />
                                {t("profile:showOrders")} (
                                {ordersByItem[item._id]?.length || item.orders?.length || 0})
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item._id, item.type)}
                            className={getDirectionClass(
                              "px-5 py-2 bg-red-100 text-red-800 rounded-xl hover:bg-red-200 transition-all flex items-center gap-2 font-medium"
                            )}
                          >
                            <Trash2 className="w-5 h-5" />
                            {t("profile:delete_label")}
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
                        {renderItemOrders(item._id)}
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

export default EducationalServices;