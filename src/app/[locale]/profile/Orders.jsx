"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Clock, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { client } from "@/lib/sanity";
import imageUrlBuilder from "@sanity/image-url";
import { useTranslation } from "react-i18next";
import Preloader from "components/elements/Preloader";

// Initialize Sanity image URL builder
const builder = imageUrlBuilder(client);

export default function OrdersPage({ userId }) {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [timeFilter, setTimeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const ordersPerPage = 4;

  const getDirectionClass = (defaultClasses = "") => {
    return `${defaultClasses} ${isRTL ? "rtl text-right space-x-reverse" : "ltr"}`;
  };

  // Status badges with appropriate styling
  const StatusBadge = ({ status }) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-600",
      approved: "bg-blue-100 text-blue-600",
      disapproved: "bg-red-100 text-red-600",
      completed: "bg-green-100 text-green-600",
      cancelled: "bg-red-100 text-red-600",
      failed: "bg-gray-100 text-gray-600",
      "pending approval": "bg-yellow-100 text-yellow-600",
    };

    return (
      <span
        className={`text-xs font-medium px-2 py-1 rounded-full ${statusStyles[status] || "bg-gray-100 text-gray-600"}`}
      >
        {t(`profile:orderStatus.${status}`)}
      </span>
    );
  };

  // Fetch orders from Sanity
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      console.log("Fetching orders for userId:", userId);
      try {
        const query = `
          *[_type in ["orderProduct", "orderBook", "orderCourse"] && user._ref == $userId] {
            _id,
            _type,
            orderDate,
            status,
            paymentStatus,
            price,
            transactionId,
            _type == "orderProduct" => {
              "item": *[_type == "product" && _id == ^.product._ref][0] {
                _id,
                name_en,
                name_ar,
                images,
                listingType,
                price,
                supplier-> {
                  _id,
                  username
                }
              },
              startDate,
              endDate
            },
            _type == "orderBook" => {
              "item": *[_type == "book" && _id == ^.book._ref][0] {
                _id,
                title_en,
                title_ar,
                coverImage
              }
            },
            _type == "orderCourse" => {
              "item": *[_type == "course" && _id == ^.course._ref][0] {
                _id,
                title_en,
                title_ar,
                image
              }
            }
          }
        `;
        const ordersData = await client.fetch(query, { userId });

        // Map orders to unified structure
        const mappedOrders = ordersData.map((order) => ({
          id: order._id,
          orderNumber: `#${order._id.slice(0, 10).toUpperCase()}`,
          status: order._type === "orderProduct" && order.item?.listingType === "rent" && order.status === "pending" ? "pending approval" : order.status,
          date: new Date(order.orderDate).toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          orderDate: order.orderDate,
          total: `${order.price.toFixed(2)} SAR`,
          items: [
            {
              image: order.item?.images?.[0]?.asset?._ref
                ? builder.image(order.item.images[0]).url()
                : order.item?.coverImage?.asset?._ref
                ? builder.image(order.item.coverImage).url()
                : order.item?.image?.asset?._ref
                ? builder.image(order.item.image).url()
                : "/placeholder.svg",
              name: isRTL ? (order.item?.name_ar || order.item?.title_ar || t("profile:item")) : (order.item?.name_en || order.item?.title_en || t("profile:item")),
              color: order._type === "orderProduct" ? order.item?.listingType || t("profile:notApplicable") : t("profile:notApplicable"),
              quantity: 1,
              price: `${order.price.toFixed(2)} SAR`,
              total: `${order.price.toFixed(2)} SAR`,
              type: order._type,
              startDate: order.startDate ? new Date(order.startDate).toLocaleDateString(isRTL ? "ar-EG" : "en-US") : null,
              endDate: order.endDate ? new Date(order.endDate).toLocaleDateString(isRTL ? "ar-EG" : "en-US") : null,
            },
          ],
        }));

        setOrders(mappedOrders);
        console.log("Mapped orders:", mappedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError(t("profile:failedFetchOrders"));
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchOrders();
    } else {
      setError(t("profile:noUserId"));
      setLoading(false);
    }
  }, [userId, t, isRTL]);

  // Reset currentPage when timeFilter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [timeFilter]);

  // Initialize time filter based on current language
  useEffect(() => {
    // Set default to localized "All time" when translations are ready
    const defaultFilter = t("profile:timeFilter.allTime");
    setTimeFilter((prev) => (prev ? prev : defaultFilter));
  }, [t]);

  // Filter orders based on timeFilter
  const filteredOrders = orders.filter((order) => {
    if (timeFilter === t("profile:timeFilter.allTime")) return true;
    if (timeFilter === t("profile:timeFilter.lastWeek")) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(order.orderDate) >= oneWeekAgo;
    }
    if (timeFilter === t("profile:timeFilter.lastMonth")) {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return new Date(order.orderDate) >= oneMonthAgo;
    }
    if (timeFilter === t("profile:timeFilter.inProgress")) return order.status === "pending" || order.status === "approved" || order.status === "pending approval";
    if (timeFilter === t("profile:timeFilter.canceled")) return order.status === "cancelled";
    if (timeFilter === t("profile:timeFilter.delivered")) return order.status === "completed";
    return true;
  });

  console.log("Filtered orders:", filteredOrders);

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  // Toggle accordion expansion
  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Time filter options
  const timeFilterOptions = [
    t("profile:timeFilter.allTime"),
    t("profile:timeFilter.lastWeek"),
    t("profile:timeFilter.lastMonth"),
    t("profile:timeFilter.inProgress"),
    t("profile:timeFilter.canceled"),
    t("profile:timeFilter.delivered"),
  ];

  if (error) {
    return (
      <div className={getDirectionClass("container mx-auto px-4 py-8 text-red-600")}>
        {error}
      </div>
    );
  }

  if (loading) {
    return <Preloader />;
  }

  return (
    <div
      className={getDirectionClass("container mx-auto px-4 py-8 font-sans")}
      style={isRTL ? { fontFamily: "'Noto Sans Arabic', sans-serif" } : {}}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className={getDirectionClass("flex items-center justify-between mb-8")}>
          <h1 className="text-3xl font-bold text-gray-800">{t("profile:ordersTitle")}</h1>
          <div className="relative">
            <select
              className={`${getDirectionClass("appearance-none bg-white border border-gray-300 rounded-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[160px]")} ${isRTL ? "pl-8" : "pr-8"}`}
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              {timeFilterOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className={`pointer-events-none absolute inset-y-0 ${isRTL ? "left-0" : "right-0"} flex items-center px-2 text-gray-700`}>
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200">
            {paginatedOrders.length === 0 ? (
              <div className={getDirectionClass("p-6 text-center text-gray-500")}>
                {t("profile:noOrdersFound")}
              </div>
            ) : (
              paginatedOrders.map((order) => (
                <div key={order.id} className="border-gray-200">
                  {/* Order Header */}
                  <div
                    className="cursor-pointer"
                    onClick={() => toggleOrder(order.id)}
                  >
                      <div className={getDirectionClass("flex items-center justify-between p-6")}>
                        <div className={getDirectionClass("flex space-x-8 items-center")}>
                        <div>
                          <div className="text-sm text-gray-500">{order.orderNumber}</div>
                          <StatusBadge status={order.status} />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">{t("profile:orderDate")}</div>
                          <div className="text-sm font-medium">{order.date}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">{t("profile:total")}</div>
                          {order.total}
                        </div>
                      </div>
                        <div className={getDirectionClass("flex items-center space-x-4")}>
                        <div className="hidden sm:flex space-x-2">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <div
                              key={idx}
                              className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden"
                            >
                              <Image
                                width={48}
                                height={48}
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                        {expandedOrder === order.id ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Details (Expanded) */}
                  {expandedOrder === order.id && (
                    <div className="px-6 pb-6">
                      {/* Items Table */}
                      <div className="overflow-x-auto">
                        <table className={getDirectionClass("w-full mb-4")}>
                          <tbody>
                            {order.items.map((item, idx) => (
                              <tr
                                key={idx}
                                className="border-b last:border-b-0 border-gray-100"
                              >
                                <td className={isRTL ? "py-4 pl-4" : "py-4 pr-4"}>
                                  <div className={getDirectionClass("flex items-center")}>
                                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden">
                                      <Image
                                        width={64}
                                        height={64}
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className={isRTL ? "mr-4" : "ml-4"}>
                                      <h4 className="font-medium text-gray-800">{item.name}</h4>
                                      <div className="text-sm text-gray-500">
                                        {t("profile:type")}:{" "}
                                        <span className="text-gray-800">
                                          {t(`profile:itemType.${item.type.replace("order", "").toLowerCase()}`)}
                                        </span>
                                      </div>
                                      {item.startDate && item.endDate && (
                                        <div className="text-sm text-gray-500">
                                          {t("profile:rentalPeriod")}:{" "}
                                          <span className="text-gray-800">
                                            {item.startDate} - {item.endDate}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="text-sm text-gray-500 mb-1">{t("profile:quantity")}</div>
                                  <div className="text-sm font-medium">{item.quantity}</div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="text-sm text-gray-500 mb-1">{t("profile:price")}</div>
                                  <div className="text-sm font-medium">{item.price}</div>
                                </td>
                                <td className={isRTL ? "py-4 pr-4" : "py-4 pl-4"}>
                                  <div className="text-sm text-gray-500 mb-1">{t("profile:total")}</div>
                                  <div className="text-sm font-medium">{item.total}</div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Order Info */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className={getDirectionClass("md:flex md:justify-between")}>
                          <div className="mb-4 md:mb-0">
                            <div className="text-sm font-medium text-gray-800 mb-1">{t("profile:payment")}</div>
                            <div className="text-sm">{t(`profile:paymentStatus.${order.paymentStatus.toLowerCase()}`)}</div>
                            <button className={getDirectionClass("flex items-center text-blue-600 mt-2 text-sm")}>
                              <Clock size={14} className={isRTL ? "ml-1" : "mr-1"} />
                              {t("profile:orderHistory")}
                            </button>
                          </div>
                          <div className="mb-4 md:mb-0">
                            <div className="text-sm font-medium text-gray-800 mb-1">{t("profile:deliveryAddress")}</div>
                            <div className="text-sm" dangerouslySetInnerHTML={{ __html: t("profile:addressDetails") }} />
                          </div>
                          <div className={getDirectionClass("flex justify-start md:justify-end")}>
                            <button className={getDirectionClass("flex items-center justify-center border border-blue-600 text-blue-600 hover:bg-blue-50 transition px-4 py-2 max-h-[35px] rounded-xl text-sm")}>
                              <Star size={14} className={isRTL ? "ml-1" : "mr-1"} />
                              {t("profile:leaveReview")}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className={getDirectionClass("flex flex-col-reverse sm:flex-row sm:justify-between items-center p-6 border-t border-gray-200")}>
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-6 rounded-xl transition w-full sm:w-auto mb-4 sm:mb-0"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              {t("profile:loadMoreOrders")}
            </button>
            <div className={getDirectionClass("flex items-center justify-center")}>
              <nav className="flex items-center">
                <ul className={getDirectionClass("flex space-x-1")}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <li key={page}>
                      <button
                        className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${
                          currentPage === page
                            ? "bg-gray-200 text-gray-700"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}