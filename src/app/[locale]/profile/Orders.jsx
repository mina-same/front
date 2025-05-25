"use client";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Clock, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { client } from "@/lib/sanity"; // Adjust path to your Sanity client
import imageUrlBuilder from "@sanity/image-url"; // Added for image URL handling

// Initialize Sanity image URL builder
const builder = imageUrlBuilder(client);

export default function OrdersPage({ userId }) { // Fixed props destructuring
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [timeFilter, setTimeFilter] = useState("All time");
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Added error state
  const router = useRouter();
  const ordersPerPage = 4;

  // Status badges with appropriate styling
  const StatusBadge = ({ status }) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-600",
      approved: "bg-blue-100 text-blue-600",
      disapproved: "bg-red-100 text-red-600",
      completed: "bg-green-100 text-green-600",
      cancelled: "bg-red-100 text-red-600",
      failed: "bg-gray-100 text-gray-600",
      "pending approval": "bg-yellow-100 text-yellow-600", // Added for rental pending
    };

    return (
      <span
        className={`text-xs font-medium px-2 py-1 rounded-full ${statusStyles[status] || "bg-gray-100 text-gray-600"}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Fetch orders from Sanity
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null); // Reset error state
      console.log("Fetching orders for userId:", userId); // Debugging
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
          date: new Date(order.orderDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          orderDate: order.orderDate, // Added for filtering
          total: `$${order.price.toFixed(2)}`,
          items: [
            {
              image: order.item?.images?.[0]?.asset?._ref
                ? builder.image(order.item.images[0]).url()
                : order.item?.coverImage?.asset?._ref
                ? builder.image(order.item.coverImage).url()
                : order.item?.image?.asset?._ref
                ? builder.image(order.item.image).url()
                : "/placeholder.svg",
              name: order.item?.name_en || order.item?.title_en || "Item",
              color: order._type === "orderProduct" ? order.item?.listingType || "N/A" : "N/A",
              quantity: 1,
              price: `$${order.price.toFixed(2)}`,
              total: `$${order.price.toFixed(2)}`,
              type: order._type,
              startDate: order.startDate ? new Date(order.startDate).toLocaleDateString() : null,
              endDate: order.endDate ? new Date(order.endDate).toLocaleDateString() : null,
            },
          ],
        }));

        setOrders(mappedOrders);
        console.log("Mapped orders:", mappedOrders); // Debugging
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to fetch orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchOrders();
    } else {
      setError("No user ID provided.");
      setLoading(false);
    }
  }, [userId]);

  // Reset currentPage when timeFilter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [timeFilter]);

  // Filter orders based on timeFilter
  const filteredOrders = orders.filter((order) => {
    if (timeFilter === "All time") return true;
    if (timeFilter === "Last week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(order.orderDate) >= oneWeekAgo;
    }
    if (timeFilter === "Last month") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return new Date(order.orderDate) >= oneMonthAgo;
    }
    if (timeFilter === "In progress") return order.status === "pending" || order.status === "approved" || order.status === "pending approval";
    if (timeFilter === "Canceled") return order.status === "cancelled";
    if (timeFilter === "Delivered") return order.status === "completed";
    return true;
  });

  console.log("Filtered orders:", filteredOrders); // Debugging

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
    "All time",
    "Last week",
    "Last month",
    "In progress",
    "Canceled",
    "Delivered",
  ];

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-600">{error}</div>;
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-300 rounded-full py-2 px-4 pr-8 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[160px]"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              {timeFilterOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200">
            {paginatedOrders.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No orders found.</div>
            ) : (
              paginatedOrders.map((order) => (
                <div key={order.id} className="border-gray-200">
                  {/* Order Header */}
                  <div
                    className="cursor-pointer"
                    onClick={() => toggleOrder(order.id)}
                  >
                    <div className="flex items-center justify-between p-6">
                      <div className="flex space-x-8 items-center">
                        <div>
                          <div className="text-sm text-gray-500">
                            {order.orderNumber}
                          </div>
                          <StatusBadge status={order.status} />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">
                            Order date
                          </div>
                          <div className="text-sm font-medium">{order.date}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Total</div>
                          {order.total}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
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
                        <table className="w-full mb-4">
                          <tbody>
                            {order.items.map((item, idx) => (
                              <tr
                                key={idx}
                                className="border-b last:border-b-0 border-gray-100"
                              >
                                <td className="py-4 pr-4">
                                  <div className="flex items-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden">
                                      <Image
                                        width={64}
                                        height={64}
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="ml-4">
                                      <h4 className="font-medium text-gray-800">
                                        {item.name}
                                      </h4>
                                      <div className="text-sm text-gray-500">
                                        Type:{" "}
                                        <span className="text-gray-800">
                                          {item.type.replace("order", "")}
                                        </span>
                                      </div>
                                      {item.startDate && item.endDate && (
                                        <div className="text-sm text-gray-500">
                                          Rental Period:{" "}
                                          <span className="text-gray-800">
                                            {item.startDate} - {item.endDate}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="text-sm text-gray-500 mb-1">
                                    Quantity
                                  </div>
                                  <div className="text-sm font-medium">
                                    {item.quantity}
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="text-sm text-gray-500 mb-1">
                                    Price
                                  </div>
                                  <div className="text-sm font-medium">
                                    {item.price}
                                  </div>
                                </td>
                                <td className="py-4 pl-4">
                                  <div className="text-sm text-gray-500 mb-1">
                                    Total
                                  </div>
                                  <div className="text-sm font-medium">
                                    {item.total}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Order Info */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="md:flex md:justify-between">
                          <div className="mb-4 md:mb-0">
                            <div className="text-sm font-medium text-gray-800 mb-1">
                              Payment:
                            </div>
                            <div className="text-sm">{order.paymentStatus}</div>
                            <button className="flex items-center text-blue-600 mt-2 text-sm">
                              <Clock size={14} className="mr-1" />
                              Order history
                            </button>
                          </div>
                          <div className="mb-4 md:mb-0">
                            <div className="text-sm font-medium text-gray-800 mb-1">
                              Delivery address:
                            </div>
                            <div className="text-sm">
                              401 Magnetic Drive Unit 2,
                              <br />
                              Toronto, Ontario, M3J 3H9, Canada
                            </div>
                          </div>
                          <div className="flex justify-start md:justify-end">
                            <button className="flex items-center justify-center border border-blue-600 text-blue-600 hover:bg-blue-50 transition px-4 py-2 max-h-[35px] rounded-xl text-sm">
                              <Star size={14} className="mr-1" />
                              Leave a review
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
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-center p-6 border-t border-gray-200">
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-6 rounded-xl transition w-100 w-sm-auto sm:w-auto mb-4 sm:mb-0"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Load more orders
            </button>
            <div className="flex items-center justify-center">
              <nav className="flex items-center">
                <ul className="flex space-x-1">
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