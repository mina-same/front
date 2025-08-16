"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Plus,
  Filter,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CalendarIcon,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Tag,
  Box,
  DollarSign,
  Calendar,
  Users,
  Clipboard,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { client, urlFor } from "../../../lib/sanity";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import userFallbackImage from "../../../../public/assets/imgs/elements/user.png";

const SupplierProducts = ({ userId }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [ordersByProduct, setOrdersByProduct] = useState({});
  const [loadingOrders, setLoadingOrders] = useState(false);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const query = `*[_type == "product" && supplier._ref == $userId]{
          _id,
          name_ar,
          name_en,
          description_ar,
          description_en,
          price,
          category,
          listingType,
          stock,
          images,
          averageRating,
          rentalDurationUnit,
          ratingCount,
          orders[]->{
            _id
          }
        }`;
        const params = { userId };
        const result = await client.fetch(query, params);
        setProducts(result);
        setFilteredProducts(result);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(t("profile:failedLoadProducts"));
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchProducts();
    }
  }, [userId, t]);

  useEffect(() => {
    const fetchAllProductOrders = async () => {
      setLoadingOrders(true);
      try {
        for (const product of products) {
          if (!ordersByProduct[product._id]) {
            await fetchProductOrders(product._id);
          }
        }
      } catch (error) {
        console.error("Error fetching all product orders:", error);
      } finally {
        setLoadingOrders(false);
      }
    };

    if (products.length > 0) {
      fetchAllProductOrders();
    }
  }, [products, fetchProductOrders, ordersByProduct]);

  useEffect(() => {
    let filtered = [...products];
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (product) => product.category === categoryFilter
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((product) => {
        if (statusFilter === "active") return product.stock > 0;
        if (statusFilter === "inactive") return product.stock === 0;
        return true;
      });
    }
    setFilteredProducts(filtered);
  }, [categoryFilter, statusFilter, products]);

  const getDirectionClass = (defaultClasses = "") => {
    return `${defaultClasses} ${isRTL ? "rtl" : "ltr"}`;
  };

  const fetchProductOrders = async (productId) => {
    if (ordersByProduct[productId]) return;
    try {
      const query = `*[_type == "orderProduct" && product._ref == $productId]{
        _id,
        orderDate,
        startDate,
        endDate,
        status,
        paymentStatus,
        price,
        user->{
          _id,
          userName,
          email
        }
      }`;
      const params = { productId };
      const result = await client.fetch(query, params);
      setOrdersByProduct((prev) => ({
        ...prev,
        [productId]: result,
      }));
    } catch (error) {
      console.error("Error fetching product orders:", error);
    }
  };

  const toggleProductExpansion = async (productId) => {
    if (expandedProductId === productId) {
      setExpandedProductId(null);
    } else {
      setExpandedProductId(productId);
      await fetchProductOrders(productId);
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await client.patch(orderId).set({ status: newStatus }).commit();
      setOrdersByProduct((prev) => {
        const updated = { ...prev };
        for (const productId in updated) {
          updated[productId] = updated[productId].map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          );
        }
        return updated;
      });
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    const productOrders = ordersByProduct[productId] || [];
    const product = products.find((p) => p._id === productId);
    const initialOrders = product?.orders || [];

    if (productOrders.length > 0 || initialOrders.length > 0) {
      alert(t("profile:cannotDeleteWithOrders"));
      return;
    }

    if (confirm(t("profile:confirmDelete"))) {
      try {
        await client.delete(productId);
        setProducts(products.filter((product) => product._id !== productId));
        setFilteredProducts(
          filteredProducts.filter((product) => product._id !== productId)
        );
      } catch (error) {
        console.error("Error deleting product:", error);
        alert(t("profile:failedDelete"));
      }
    }
  };

  const NoProductsView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={getDirectionClass(
        "text-center py-16 px-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg h-full min-h-[700px] flex justify-center items-center"
      )}
    >
      <div className="max-w-md mx-auto space-y-6 flex flex-col justify-center items-center text-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-2xl">
          <ShoppingBag className="w-12 h-12 text-gray-800" />
        </div>
        <h3 className="text-3xl font-extrabold text-gray-900">
          {t("profile:noProductsFound")}
        </h3>
        <p className="text-gray-600 text-lg">{t("profile:noProductsYet")}</p>
        <button
          onClick={() => (window.location.href = "/products/add-product")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-black text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          {t("profile:addProduct")}
        </button>
      </div>
    </motion.div>
  );

  const categoryOptions = [
    { value: "all", label: t("profile:allCategories") },
    { value: "feed_nutrition", label: t("profile:categories.feed_nutrition") },
    { value: "tack_equipment", label: t("profile:categories.tack_equipment") },
    {
      value: "apparel_accessories",
      label: t("profile:categories.apparel_accessories"),
    },
    {
      value: "health_wellness",
      label: t("profile:categories.health_wellness"),
    },
    { value: "barn_stable", label: t("profile:categories.barn_stable") },
    {
      value: "riding_competition",
      label: t("profile:categories.riding_competition"),
    },
    { value: "other", label: t("profile:categories.other") },
  ];

  const getProductTitle = (product) => {
    const title = isRTL ? product.name_ar : product.name_en;
    return (
      title ||
      (isRTL ? product.name_en : product.name_ar) ||
      t("profile:untitledProduct")
    );
  };

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
      approved: "bg-green-100 text-green-800 border-green-300",
      disapproved: "bg-red-100 text-red-800 border-red-300",
      completed: "bg-blue-100 text-blue-800 border-blue-300",
      cancelled: "bg-gray-100 text-gray-800 border-gray-300",
      failed: "bg-red-100 text-red-800 border-red-300",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium border ${
          statusStyles[status] || "bg-gray-100 border-gray-300"
        }`}
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
        className={`px-3 py-1 rounded-full text-sm font-medium border ${
          statusStyles[status] || "bg-gray-100 border-gray-300"
        }`}
      >
        {t(`profile:paymentStatus.${status}`)}
      </span>
    );
  };

  const renderProductOrders = (productId) => {
    const orders = ordersByProduct[productId] || [];
    const product = products.find((p) => p._id === productId);
    const isRental = product?.listingType === "rent";

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
        <h4 className="font-semibold text-xl border-b border-gray-200 pb-3">
          {t("profile:orderHistory")}
        </h4>
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-500" />
                    <span className="text-base font-medium">
                      {order.user?.userName || t("profile:unknownUser")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">
                      {t("profile:orderDate")}: {formatDate(order.orderDate)}
                    </span>
                  </div>
                  {isRental && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <span className="text-sm">
                        {t("profile:rentalPeriod")}:{" "}
                        {formatDate(order.startDate)} -{" "}
                        {formatDate(order.endDate)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">
                      {t("profile:price")}: {order.price}{" "}
                      {t("profile:currency")}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {t("profile:status")}:
                      </span>
                      {renderOrderStatusBadge(order.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {t("profile:payment")}:
                      </span>
                      {renderPaymentStatusBadge(order.paymentStatus)}
                    </div>
                  </div>
                </div>
                {isRental && order.status === "pending" && (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() =>
                        handleOrderStatusChange(order._id, "approved")
                      }
                      className="px-5 py-2 bg-green-100 text-green-800 rounded-xl hover:bg-green-200 transition-all flex items-center justify-center gap-2 font-medium"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {t("profile:approveRental")}
                    </button>
                    <button
                      onClick={() =>
                        handleOrderStatusChange(order._id, "disapproved")
                      }
                      className="px-5 py-2 bg-red-100 text-red-800 rounded-xl hover:bg-red-200 transition-all flex items-center justify-center gap-2 font-medium"
                    >
                      <XCircle className="w-5 h-5" />
                      {t("profile:rejectRental")}
                    </button>
                  </div>
                )}
                {!isRental &&
                  order.status === "pending" &&
                  order.paymentStatus === "paid" && (
                    <button
                      onClick={() =>
                        handleOrderStatusChange(order._id, "completed")
                      }
                      className="px-5 py-2 bg-blue-100 text-blue-800 rounded-xl hover:bg-blue-200 transition-all flex items-center justify-center gap-2 font-medium"
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
      className="container mx-auto px-4 py-8"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-5 gap-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <h2 className="text-3xl font-extrabold text-gray-900">
          {t("profile:productManagement")}
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <button
            onClick={() => (window.location.href = "/products/add-product")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-black text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            {t("profile:addProduct")}
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-4 pb-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="relative flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-2 w-full sm:w-auto">
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
        <div className="relative flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-2 w-full sm:w-auto">
          <Box className="w-5 h-5 text-gray-600" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-gray-800 font-medium focus:outline-none w-full"
          >
            <option value="all">{t("profile:allInventory")}</option>
            <option value="active">{t("profile:inStock")}</option>
            <option value="inactive">{t("profile:outOfStock")}</option>
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
        ) : filteredProducts.length === 0 ? (
          <NoProductsView />
        ) : (
          <div className="space-y-6">
            {filteredProducts.map((product) => (
              <motion.div
                key={product._id}
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
                                  product.images?.[0]
                                    ? urlFor(product.images[0]).url()
                                    : "/placeholder.svg"
                                }
                                width={200}
                                height={200}
                                alt={getProductTitle(product)}
                                className="object-cover rounded-xl"
                              />
                            </div>
                          </a>
                          {product.images?.length > 1 && (
                            <>
                              <button
                                className="absolute top-1/2 -translate-y-1/2 left-2 p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                                type="button"
                                aria-label={t("profile:previousImage")}
                              >
                                <ChevronLeft className="h-5 w-5 text-gray-600" />
                              </button>
                              <button
                                className="absolute top-1/2 -translate-y-1/2 right-2 p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                                type="button"
                                aria-label={t("profile:nextImage")}
                              >
                                <ChevronRight className="h-5 w-5 text-gray-600" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-center gap-3">
                          {getProductTitle(product)}
                          <span
                            className={`px-3 py-1 text-sm rounded-full font-medium ${
                              product.listingType === "rent"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {product.listingType === "rent"
                              ? t("profile:forRent")
                              : t("profile:forSale")}
                          </span>
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Tag className="w-5 h-5 text-gray-500" />
                            {t(
                              `profile:categories.${
                                product.category || "other"
                              }`
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Box className="w-5 h-5 text-gray-500" />
                            {t("profile:stock")}: {product.stock || 0}
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-gray-500" />
                            {product.price} {t("profile:currency")}
                            {product.listingType === "rent" &&
                              product.rentalDurationUnit && (
                                <span>
                                  /
                                  {t(
                                    `profile:per.${product.rentalDurationUnit}`
                                  )}
                                </span>
                              )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 items-center">
                          <button
                            onClick={() =>
                              (window.location.href = `/products/edit/${product._id}`)
                            }
                            className="px-5 py-2 bg-blue-100 text-blue-800 rounded-xl hover:bg-blue-200 transition-all flex items-center gap-2 font-medium"
                          >
                            <Edit className="w-5 h-5" />
                            {t("profile:editProduct")}
                          </button>
                          <button
                            onClick={() => toggleProductExpansion(product._id)}
                            className="px-5 py-2 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2 font-medium"
                          >
                            {expandedProductId === product._id ? (
                              <>
                                <ChevronUp className="w-5 h-5" />
                                {t("profile:hideOrders")}
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-5 h-5" />
                                {t("profile:showOrders")} (
                                {ordersByProduct[product._id]?.length ||
                                  product.orders?.length ||
                                  0})
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="px-5 py-2 bg-red-100 text-red-800 rounded-xl hover:bg-red-200 transition-all flex items-center gap-2 font-medium"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <AnimatePresence>
                  {expandedProductId === product._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden bg-gray-50"
                    >
                      <div className="border-t border-gray-200 p-6">
                        {renderProductOrders(product._id)}
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

export default SupplierProducts;