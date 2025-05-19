import { useState } from "react";
import { ChevronDown, ChevronUp, Clock, Star } from "lucide-react";

export default function OrdersPage() {
  const [expandedOrder, setExpandedOrder] = useState("orderThree");
  const [timeFilter, setTimeFilter] = useState("All time");
  const [currentPage, setCurrentPage] = useState(1);

  // Order status badges with appropriate styling
  const StatusBadge = ({ status }) => {
    const statusStyles = {
      "In progress": "bg-blue-100 text-blue-600",
      Canceled: "bg-red-100 text-red-600",
      Delivered: "bg-green-100 text-green-600",
    };

    return (
      <span
        className={`text-xs font-medium px-2 py-1 rounded-full ${statusStyles[status]}`}
      >
        {status}
      </span>
    );
  };

  // Toggle accordion expansion
  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Sample order data
  const orders = [
    {
      id: "orderOne",
      orderNumber: "#78A6431D409",
      status: "In progress",
      date: "Jan 27, 2023",
      total: "$16.00",
      items: [
        {
          image: "/placeholder.svg",
          name: "Candle in concrete bowl",
          color: "Gray night",
          quantity: 1,
          price: "$16",
          total: "$16",
        },
      ],
    },
    {
      id: "orderTwo",
      orderNumber: "#47H76G09F33",
      status: "Canceled",
      date: "Sep 14, 2023",
      total: "$59.00",
      items: [
        {
          image: "/placeholder.svg",
          name: "Analogue wall clock",
          color: "Turquoise",
          quantity: 1,
          price: "$25",
          total: "$25",
        },
        {
          image: "/placeholder.svg",
          name: "Glossy round vase",
          color: "White",
          quantity: 1,
          price: "$15",
          total: "$15",
        },
        {
          image: "/placeholder.svg",
          name: "Ceramic flower pot",
          color: "Gray concrete",
          quantity: 1,
          price: "$19",
          total: "$19",
        },
      ],
    },
    {
      id: "orderThree",
      orderNumber: "#34VB5540K83",
      status: "Delivered",
      date: "Jul 10, 2023",
      total: "$38.00",
      items: [
        {
          image: "/placeholder.svg",
          name: "Candle in concrete bowl",
          color: "Gray night",
          quantity: 1,
          price: "$16",
          total: "$16",
        },
        {
          image: "/placeholder.svg",
          name: "Exquisite glass vase",
          color: "Rose",
          quantity: 2,
          price: "$11",
          total: "$22",
        },
      ],
    },
    {
      id: "orderFour",
      orderNumber: "#502TR872W2",
      status: "Delivered",
      date: "May 11, 2023",
      total: "$17.00",
      items: [
        {
          image: "/placeholder.svg",
          name: "Dispenser for soap",
          color: "White marble",
          quantity: 1,
          price: "$17",
          total: "$17",
        },
      ],
    },
  ];

  // Time filter options
  const timeFilterOptions = [
    "All time",
    "Last week",
    "Last month",
    "In progress",
    "Canceled",
    "Delivered",
  ];

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
            {orders.map((order) => (
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
                        <div className="text-sm font-medium">{order.total}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="hidden sm:flex space-x-2">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div
                            key={idx}
                            className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden"
                          >
                            <img
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
                                    <img
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
                                      Color:{" "}
                                      <span className="text-gray-800">
                                        {item.color}
                                      </span>
                                    </div>
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
                          <div className="text-sm">Upon the delivery</div>
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
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-center p-6 border-t border-gray-200">
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-6 rounded-xl transition w-100 w-sm-auto 1 ms-sm-auto me-sm-n5 sm:w-auto mb-4 sm:mb-0">
              Load more orders
            </button>
            <div className="flex items-center justify-center">
              <nav className="flex items-center">
                <ul className="flex space-x-1">
                  {[1, 2, 3, 4].map((page) => (
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
