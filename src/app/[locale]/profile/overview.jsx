"use client";

import React, { useState } from "react";
import {
  User,
  Edit,
  Mail,
  MapPin,
  CircleAlert,
  CircleCheck,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { urlFor } from "@/lib/sanity";

const Overview = ({ userData }) => {
  // Debug log to inspect userData
  console.log("Overview userData:", userData);

  const [activeAccordion, setActiveAccordion] = useState(null);

  const toggleAccordion = (id) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const fields = [
      userData?.fullName,
      userData?.email,
      userData?.phoneNumber,
      userData?.kind,
      userData?.addressDetails,
      userData?.city?.name,
      userData?.governorate?.name,
      userData?.country?.name,
      userData?.image,
      userData?.isEmailVerified,
    ];
    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  // Mock billing data (replace with actual Sanity data if available)
  const billingInfo = {
    cardType: "Visa",
    cardLastFour: "9016",
    cardExpires: "03/24",
    cardExpired: false, // Set to true if expiration date is past current date
  };

  return (
    <div className="pt-4 pb-2 sm:pb-4">
      <h1 className="text-2xl font-semibold mb-4">Overview</h1>

      {/* Basic Info Section */}
      <section className="bg-white rounded-xl shadow-sm p-1 md:p-2 xl:p-3 2xl:p-4 mb-4">
        <div className="p-4">
          <div className="flex justify-between items-center mt-sm-n1 pb-4 mb-0 lg:mb-1 xl:mb-3">
            <div className="flex">
              <User className="text-primary text-xl mr-2" />
              <h2 className="text-lg font-medium mb-0">Basic info</h2>
            </div>
            <Link href="/test?tab=settings">
              <Button className="rounded-xl bg-gray-200 text-gray-700 text-sm hover:bg-gray-300">
                <Edit className="w-4 h-4 mr-2" />
                Edit info
              </Button>
            </Link>
          </div>

          <div className="md:flex items-center">
            <div className="sm:flex items-center">
              <div
                className="rounded-full bg-cover bg-center flex-shrink-0 w-20 h-20 bg-gray-200"
                style={{
                  backgroundImage: userData?.image
                    ? `url(${urlFor(userData.image).url()})`
                    : `url(/placeholder.svg)`,
                }}
              ></div>
              <div className="pt-3 sm:pt-0 sm:pl-3">
                <h3 className="text-base font-medium mb-2">
                  {userData?.fullName || "User Name"}
                  {userData?.isEmailVerified && (
                    <CircleCheck className="inline-block text-green-500 ml-2 w-4 h-4" />
                  )}
                </h3>
                <div className="text-gray-500 font-medium flex flex-wrap sm:flex-nowrap items-center">
                  <div className="flex items-center mr-3">
                    <Mail className="w-4 h-4 mr-1" />
                    {userData?.email || "No email provided"}
                  </div>
                  <div className="flex items-center text-nowrap">
                    <MapPin className="w-4 h-4 mr-1" />
                    {userData?.country?.name_en ? (
                      `${userData.country.name_en}, ${
                        userData.userType === "rider" ? "USD" : "Local Currency"
                      }`
                    ) : (
                      <Link
                        href="/test?tab=settings"
                        className="text-blue-600 hover:underline"
                      >
                        Add country
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="w-full pt-3 md:pt-0 md:ml-auto"
              style={{ maxWidth: "212px" }}
            >
              <div className="flex justify-between text-sm pb-1 mb-2">
                Profile completion
                <strong className="ml-2">
                  {calculateProfileCompletion()}%
                </strong>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full"
                  style={{ width: `${calculateProfileCompletion()}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex flex-row py-4 mb-2 sm:mb-3">
            <div className="md:w-1/2 mb-4 md:mb-0">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="text-gray-500 py-1 px-0">Phone</td>
                    <td className="text-gray-800 font-medium py-1 pl-3">
                      {userData?.phoneNumber || "Not provided"}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-gray-500 py-1 px-0">Language</td>
                    <td className="text-gray-800 font-medium py-1 pl-3">
                      English
                    </td>
                  </tr>
                  <tr>
                    <td className="text-gray-500 py-1 px-0">Gender</td>
                    <td className="text-gray-800 font-medium py-1 pl-3">
                      {userData?.kind ? (
                        userData.kind.charAt(0).toUpperCase() +
                        userData.kind.slice(1)
                      ) : (
                        <Link
                          href="/test?tab=settings"
                          className="text-blue-600 hover:underline"
                        >
                          Add gender
                        </Link>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-gray-500 py-1 px-0">Communication</td>
                    <td className="text-gray-800 font-medium py-1 pl-3">
                      {userData?.phoneNumber && userData?.email
                        ? "Mobile, email"
                        : userData?.email
                        ? "Email"
                        : userData?.phoneNumber
                        ? "Mobile"
                        : "None"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="md:w-1/2 md:flex md:justify-end">
              <div
                className="w-full border border-gray-200 rounded-lg p-4"
                style={{ maxWidth: "212px" }}
              >
                <CircleCheck className="w-6 h-6 mb-2 text-green-500" />
                <h4 className="text-lg font-medium mb-0">No bonuses</h4>
                <p className="text-sm text-gray-500 mb-0">Earn bonuses soon!</p>
              </div>
            </div>
          </div>

          {!userData?.isProfileCompleted && (
            <div
              className="rounded-xl bg-[#ecf2fa] border-l-4 border-[#9fbfe5] p-4 flex mb-0"
              role="alert"
            >
              <CircleAlert className="text-[#3972b6] w-6 h-6" />
              <div className="pl-2">
                Fill in the information 100% to receive more suitable offers.
                <Link
                  href="/test?tab=settings"
                  className="text-blue-600 font-medium ml-1"
                >
                  Go to settings!
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Address Section */}
        <section className="bg-white rounded-xl shadow-sm h-full p-1 md:p-2 xl:p-3 2xl:p-4">
          <div className="p-4">
            <div className="flex justify-between items-center mt-sm-n1 pb-4 mb-1 lg:mb-2">
              <div className="flex">
                <MapPin className="text-primary text-xl mr-2" />
                <h2 className="text-lg font-medium mb-0">Address</h2>
              </div>
              <Link href="/test?tab=settings">
                <Button className="rounded-xl bg-gray-200 text-gray-700 text-sm hover:bg-gray-300">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit info
                </Button>
              </Link>
            </div>

            <div className="flex items-center pb-1 mb-2">
              <h3 className="text-sm font-semibold mb-0 mr-3">
                Shipping address
              </h3>
              <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded">
                Primary
              </span>
            </div>
            <p className="mb-0">
              {userData?.addressDetails || "No address provided"}
              <br />
              {userData?.city?.name_en ? `${userData.city.name_en},` : ""}
              {userData?.governorate?.name_en
                ? ` ${userData.governorate.name_en}`
                : ""}
              <br />
              {userData?.country?.name_en || (
                <Link
                  href="/test?tab=settings"
                  className="text-blue-600 hover:underline"
                >
                  Add country
                </Link>
              )}
            </p>
          </div>
        </section>

        {/* Billing Section */}
        <section className="bg-white rounded-xl shadow-sm h-full p-1 md:p-2 xl:p-3 2xl:p-4">
          <div className="p-4">
            <div className="flex justify-between items-center mt-sm-n1 pb-4 mb-1 lg:mb-2">
              <div className="flex">
                <Wallet className="text-primary text-xl mr-2" />
                <h2 className="text-lg font-medium mb-0">Billing</h2>
              </div>
              <Link href="/test?tab=settings">
                <Button className="flex items-center rounded-xl bg-gray-200 text-gray-700 text-sm hover:bg-gray-300">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit info
                </Button>
              </Link>
            </div>

            <div className="flex items-center pb-1 mb-2">
              <h3 className="text-sm font-semibold mb-0 mr-3">
                {userData?.fullName || "User Name"}
              </h3>
              <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded">
                Primary
              </span>
            </div>

            <div className="flex items-center pb-4 mb-2 sm:mb-3">
              {/* Visa logo SVG */}
              <svg
                width="52"
                height="42"
                viewBox="0 0 52 42"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                <path
                  d="M22.6402 28.2865H18.5199L21.095 12.7244H25.2157L22.6402 28.2865ZM15.0536 12.7244L11.1255 23.4281L10.6607 21.1232L10.6611 21.124L9.27467 14.1256C9.27467 14.1256 9.10703 12.7244 7.32014 12.7244H0.8262L0.75 12.9879C0.75 12.9879 2.73586 13.3942 5.05996 14.7666L8.63967 28.2869H12.9327L19.488 12.7244H15.0536ZM47.4619 28.2865H51.2453L47.9466 12.7239H44.6345C43.105 12.7239 42.7324 13.8837 42.7324 13.8837L36.5873 28.2865H40.8825L41.7414 25.9749H46.9793L47.4619 28.2865ZM42.928 22.7817L45.093 16.9579L46.3109 22.7817H42.928ZM36.9095 16.4667L37.4975 13.1248C37.4975 13.1248 35.6831 12.4463 33.7916 12.4463C31.7469 12.4463 26.8913 13.3251 26.8913 17.5982C26.8913 21.6186 32.5902 21.6685 32.5902 23.7803C32.5902 25.8921 27.4785 25.5137 25.7915 24.182L25.1789 27.6763C25.1789 27.6763 27.0187 28.555 29.8296 28.555C32.6414 28.555 36.8832 27.1234 36.8832 23.2271C36.8832 19.1808 31.1331 18.8041 31.1331 17.0449C31.1335 15.2853 35.1463 15.5113 36.9095 16.4667Z"
                  fill="#2566AF"
                ></path>
                <path
                  d="M10.6611 22.1235L9.2747 15.1251C9.2747 15.1251 9.10705 13.7239 7.32016 13.7239H0.8262L0.75 13.9874C0.75 13.9874 3.87125 14.6235 6.86507 17.0066C9.72766 19.2845 10.6611 22.1235 10.6611 22.1235Z"
                  fill="#E6A540"
                ></path>
              </svg>

              <div className="pl-3 text-sm">
                <div className="text-gray-800">
                  {billingInfo.cardType} •••• {billingInfo.cardLastFour}
                </div>
                <div className="text-gray-500">
                  Debit - Expires {billingInfo.cardExpires}
                </div>
              </div>
            </div>

            {billingInfo.cardExpired && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 flex mb-0">
                <CircleAlert className="text-red-500 w-6 h-6 mr-2" />
                <p className="mb-0">
                  Your primary credit card expired on {billingInfo.cardExpires}.
                  Please add a new card or update this one.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Overview;
