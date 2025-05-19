import React, { useState } from "react";
import { Trash2, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";

export default function FavoritesPage() {
  // State for color selections for each product
  const [selectedColors, setSelectedColors] = useState({
    loftLamp: "dark-gray",
    glossyVase: "light-gray",
    ceramicPot: "gray-concrete",
    pendantLamp: "gray",
  });

  // Handle color change
  const handleColorChange = (product, color) => {
    setSelectedColors((prev) => ({
      ...prev,
      [product]: color,
    }));
  };

  return (
    <div className="container mx-auto py-5 mt-4 lg:mt-5 mb-lg-4 my-xl-5">
      <div className="flex flex-wrap pt-2 lg:pt-0">
        {/* Sidebar (hidden for simplicity) */}

        {/* Page content */}
        <div className="w-full lg:w-9/12 pt-4 pb-2 sm:pb-4">
          <div className="flex items-center mb-4">
            <h1 className="text-2xl font-medium mb-0">
              Favorites{" "}
              <span className="text-sm font-normal text-gray-500">
                (6 items)
              </span>
            </h1>
            <button
              className="ml-auto flex items-center text-red-500 border border-red-500 hover:bg-red-50 px-3 py-1 rounded-xl text-sm"
              type="button"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear all
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border-0 py-1 p-2 md:p-3">
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Item 1 - Dispenser for soap */}
                <div className="pb-2 sm:pb-3">
                  <div className="group relative bg-gray-100 rounded-xl p-3 mb-4">
                    <button
                      className="btn absolute top-3 right-3 p-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-gray-100"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>

                    <div className="relative">
                      <a className="block" href="#">
                        <div className="p-2 xl:p-4 flex justify-center">
                          <img
                            className="mx-auto"
                            src="/placeholder.svg"
                            width="226"
                            alt="Product"
                          />
                        </div>
                      </a>
                      <button
                        className="absolute top-1/2 -translate-y-1/2 left-0 opacity-0 group-hover:opacity-100 p-1 bg-white hover:bg-gray-100 rounded-full transition-opacity"
                        type="button"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        className="absolute top-1/2 -translate-y-1/2 right-0 opacity-0 group-hover:opacity-100 p-1 bg-white hover:bg-gray-100 rounded-full transition-opacity"
                        type="button"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex mb-1">
                    <h3 className="text-sm font-medium mb-0">
                      <a href="#" className="hover:text-blue-600">
                        Dispenser for soap
                      </a>
                    </h3>
                  </div>

                  <div className="flex items-center">
                    <span className="mr-2">$16.00</span>
                    <div className="ml-auto group relative">
                      <a
                        className="nav-link text-lg py-2 px-1 text-gray-700 hover:text-blue-600"
                        href="#"
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </a>
                      <div className="tooltip opacity-0 invisible group-hover:opacity-100 group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white text-xs text-gray-500 p-1 rounded-xl shadow-sm transition-opacity">
                        Add to cart
                      </div>
                    </div>
                  </div>
                </div>

                {/* Item 2 - Loft style lamp */}
                <div className="pb-2 sm:pb-3">
                  <div className="group relative bg-gray-100 rounded-xl p-3 mb-4">
                    <span className="badge absolute top-3 left-3 bg-red-50 text-red-500 text-xs px-2 py-1 rounded">
                      Sale
                    </span>
                    <button
                      className="btn absolute top-3 right-3 p-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-gray-100"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>

                    <div className="relative">
                      <a className="block" href="#">
                        <div className="p-2 xl:p-4 flex justify-center">
                          <img
                            className="mx-auto"
                            src="/placeholder.svg"
                            width="226"
                            alt="Product"
                          />
                        </div>
                      </a>
                      <button
                        className="absolute top-1/2 -translate-y-1/2 left-0 opacity-0 group-hover:opacity-100 p-1 bg-white hover:bg-gray-100 rounded-full transition-opacity"
                        type="button"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        className="absolute top-1/2 -translate-y-1/2 right-0 opacity-0 group-hover:opacity-100 p-1 bg-white hover:bg-gray-100 rounded-full transition-opacity"
                        type="button"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex mb-1">
                    <h3 className="text-sm font-medium mb-0">
                      <a href="#" className="hover:text-blue-600">
                        Loft style lamp
                      </a>
                    </h3>
                    <div className="flex ps-2 -mt-1 ml-auto">
                      {[
                        { id: "dark-gray", color: "#576071" },
                        { id: "light-gray", color: "#d5d4d3" },
                        { id: "blue", color: "#a1b7d9" },
                      ].map((color) => (
                        <div key={`lamp-${color.id}`} className="ml-1">
                          <input
                            className="btn-check hidden"
                            type="radio"
                            name="color1"
                            id={`lamp-${color.id}`}
                            checked={selectedColors.loftLamp === color.id}
                            onChange={() =>
                              handleColorChange("loftLamp", color.id)
                            }
                          />
                          <label
                            className="flex items-center justify-center w-5 h-5 border border-gray-300 rounded-full cursor-pointer hover:border-gray-400"
                            htmlFor={`lamp-${color.id}`}
                          >
                            <span
                              className="block w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: color.color }}
                            ></span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="mr-2">$21.00</span>
                    <del className="text-sm text-gray-400">$35.00</del>
                    <div className="ml-auto group relative">
                      <a
                        className="nav-link text-lg py-2 px-1 text-gray-700 hover:text-blue-600"
                        href="#"
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </a>
                      <div className="tooltip opacity-0 invisible group-hover:opacity-100 group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white text-xs text-gray-500 p-1 rounded-xl shadow-sm transition-opacity">
                        Add to cart
                      </div>
                    </div>
                  </div>
                </div>

                {/* Item 3 - Glossy round vase */}
                <div className="pb-2 sm:pb-3">
                  <div className="group relative bg-gray-100 rounded-xl p-3 mb-4">
                    <button
                      className="btn absolute top-3 right-3 p-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-gray-100"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>

                    <div className="relative">
                      <a className="block" href="#">
                        <div className="p-2 xl:p-4 flex justify-center">
                          <img
                            className="mx-auto"
                            src="/placeholder.svg"
                            width="226"
                            alt="Product"
                          />
                        </div>
                      </a>
                      <button
                        className="absolute top-1/2 -translate-y-1/2 left-0 opacity-0 group-hover:opacity-100 p-1 bg-white hover:bg-gray-100 rounded-full transition-opacity"
                        type="button"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        className="absolute top-1/2 -translate-y-1/2 right-0 opacity-0 group-hover:opacity-100 p-1 bg-white hover:bg-gray-100 rounded-full transition-opacity"
                        type="button"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex mb-1">
                    <h3 className="text-sm font-medium mb-0">
                      <a href="#" className="hover:text-blue-600">
                        Glossy round vase
                      </a>
                    </h3>
                    <div className="flex ps-2 -mt-1 ml-auto">
                      {[
                        { id: "light-gray", color: "#d5d4d3" },
                        { id: "dark-gray", color: "#576071" },
                        { id: "blue", color: "#a1b7d9" },
                      ].map((color) => (
                        <div key={`vase-${color.id}`} className="ml-1">
                          <input
                            className="btn-check hidden"
                            type="radio"
                            name="color2"
                            id={`vase-${color.id}`}
                            checked={selectedColors.glossyVase === color.id}
                            onChange={() =>
                              handleColorChange("glossyVase", color.id)
                            }
                          />
                          <label
                            className="flex items-center justify-center w-5 h-5 border border-gray-300 rounded-full cursor-pointer hover:border-gray-400"
                            htmlFor={`vase-${color.id}`}
                          >
                            <span
                              className="block w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: color.color }}
                            ></span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="mr-2">$15.00</span>
                    <div className="ml-auto group relative">
                      <a
                        className="nav-link text-lg py-2 px-1 text-gray-700 hover:text-blue-600"
                        href="#"
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </a>
                      <div className="tooltip opacity-0 invisible group-hover:opacity-100 group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white text-xs text-gray-500 p-1 rounded-xl shadow-sm transition-opacity">
                        Add to cart
                      </div>
                    </div>
                  </div>
                </div>

                {/* Item 4 - Living room table */}
                <div className="pb-2 sm:pb-3">
                  <div className="group relative bg-gray-100 rounded-xl p-3 mb-4">
                    <span className="badge absolute top-3 left-3 bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                      Out of stock
                    </span>
                    <button
                      className="btn absolute top-3 right-3 p-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-gray-100"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>

                    <div className="relative">
                      <a className="block" href="#">
                        <div className="p-2 xl:p-4 flex justify-center">
                          <img
                            className="mx-auto"
                            src="/placeholder.svg"
                            width="226"
                            alt="Product"
                          />
                        </div>
                      </a>
                      <button
                        className="absolute top-1/2 -translate-y-1/2 left-0 opacity-0 group-hover:opacity-100 p-1 bg-white hover:bg-gray-100 rounded-full transition-opacity"
                        type="button"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        className="absolute top-1/2 -translate-y-1/2 right-0 opacity-0 group-hover:opacity-100 p-1 bg-white hover:bg-gray-100 rounded-full transition-opacity"
                        type="button"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex mb-1">
                    <h3 className="text-sm font-medium mb-0">
                      <a href="#" className="hover:text-blue-600">
                        Living room table
                      </a>
                    </h3>
                  </div>

                  <div className="flex items-center pt-1">
                    <span className="mr-2">$46.00</span>
                  </div>
                </div>

                {/* Item 5 - Ceramic flower pot */}
                <div className="pb-2 sm:pb-3">
                  <div className="group relative bg-gray-100 rounded-xl p-3 mb-4">
                    <button
                      className="btn absolute top-3 right-3 p-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-gray-100"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>

                    <div className="relative">
                      <a className="block" href="#">
                        <div className="p-2 xl:p-4 flex justify-center">
                          <img
                            className="mx-auto"
                            src="/placeholder.svg"
                            width="226"
                            alt="Product"
                          />
                        </div>
                      </a>
                      <button
                        className="absolute top-1/2 -translate-y-1/2 left-0 opacity-0 group-hover:opacity-100 p-1 bg-white hover:bg-gray-100 rounded-full transition-opacity"
                        type="button"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        className="absolute top-1/2 -translate-y-1/2 right-0 opacity-0 group-hover:opacity-100 p-1 bg-white hover:bg-gray-100 rounded-full transition-opacity"
                        type="button"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex mb-1">
                    <h3 className="text-sm font-medium mb-0">
                      <a href="#" className="hover:text-blue-600">
                        Ceramic flower pot
                      </a>
                    </h3>
                    <div className="flex ps-2 -mt-1 ml-auto">
                      {[
                        {
                          id: "gray-concrete",
                          color: "#c0c0c0",
                          pattern: true,
                        },
                        { id: "beige", color: "#d9c9a1" },
                        { id: "blue", color: "#a1b7d9" },
                      ].map((color) => (
                        <div key={`pot-${color.id}`} className="ml-1">
                          <input
                            className="btn-check hidden"
                            type="radio"
                            name="color3"
                            id={`pot-${color.id}`}
                            checked={selectedColors.ceramicPot === color.id}
                            onChange={() =>
                              handleColorChange("ceramicPot", color.id)
                            }
                          />
                          <label
                            className="flex items-center justify-center w-5 h-5 border border-gray-300 rounded-full cursor-pointer hover:border-gray-400"
                            htmlFor={`pot-${color.id}`}
                          >
                            <span
                              className="block w-2.5 h-2.5 rounded-full bg-cover bg-center"
                              style={{
                                backgroundColor: color.color,
                                backgroundImage: color.pattern
                                  ? "linear-gradient(45deg, #c0c0c0, #d0d0d0)"
                                  : "none",
                              }}
                            ></span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="mr-2">$19.00</span>
                    <div className="ml-auto group relative">
                      <a
                        className="nav-link text-lg py-2 px-1 text-gray-700 hover:text-blue-600"
                        href="#"
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </a>
                      <div className="tooltip opacity-0 invisible group-hover:opacity-100 group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white text-xs text-gray-500 p-1 rounded-xl shadow-sm transition-opacity">
                        Add to cart
                      </div>
                    </div>
                  </div>
                </div>

                {/* Item 6 - Pendant lamp */}
                <div className="pb-2 sm:pb-3">
                  <div className="group relative bg-gray-100 rounded-xl p-3 mb-4">
                    <span className="badge absolute top-3 left-3 bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded">
                      New
                    </span>
                    <button
                      className="btn absolute top-3 right-3 p-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-gray-100"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>

                    <div className="relative">
                      <a className="block" href="#">
                        <div className="p-2 xl:p-4 flex justify-center">
                          <img
                            className="mx-auto"
                            src="/placeholder.svg"
                            width="226"
                            alt="Product"
                          />
                        </div>
                      </a>
                      <button
                        className="absolute top-1/2 -translate-y-1/2 left-0 opacity-0 group-hover:opacity-100 p-1 bg-white hover:bg-gray-100 rounded-full transition-opacity"
                        type="button"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        className="absolute top-1/2 -translate-y-1/2 right-0 opacity-0 group-hover:opacity-100 p-1 bg-white hover:bg-gray-100 rounded-full transition-opacity"
                        type="button"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex mb-1">
                    <h3 className="text-sm font-medium mb-0">
                      <a href="#" className="hover:text-blue-600">
                        Pendant lamp
                      </a>
                    </h3>
                    <div className="flex ps-2 -mt-1 ml-auto">
                      {[
                        { id: "gray", color: "#bab8b7" },
                        {
                          id: "woody-brown",
                          color: "#c0c0c0",
                          pattern: "wood",
                        },
                        {
                          id: "gray-marble",
                          color: "#c0c0c0",
                          pattern: "marble",
                        },
                      ].map((color) => (
                        <div key={`pendant-${color.id}`} className="ml-1">
                          <input
                            className="btn-check hidden"
                            type="radio"
                            name="color4"
                            id={`pendant-${color.id}`}
                            checked={selectedColors.pendantLamp === color.id}
                            onChange={() =>
                              handleColorChange("pendantLamp", color.id)
                            }
                          />
                          <label
                            className="flex items-center justify-center w-5 h-5 border border-gray-300 rounded-full cursor-pointer hover:border-gray-400"
                            htmlFor={`pendant-${color.id}`}
                          >
                            <span
                              className="block w-2.5 h-2.5 rounded-full bg-cover bg-center"
                              style={{
                                backgroundColor: color.color,
                                backgroundImage:
                                  color.pattern === "wood"
                                    ? "linear-gradient(45deg, #a87c5b, #8b5e3c)"
                                    : color.pattern === "marble"
                                    ? "linear-gradient(45deg, #c0c0c0, #e0e0e0)"
                                    : "none",
                              }}
                            ></span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="mr-2">$22.00</span>
                    <div className="ml-auto group relative">
                      <a
                        className="nav-link text-lg py-2 px-1 text-gray-700 hover:text-blue-600"
                        href="#"
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </a>
                      <div className="tooltip opacity-0 invisible group-hover:opacity-100 group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white text-xs text-gray-500 p-1 rounded-xl shadow-sm transition-opacity">
                        Add to cart
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
