import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const AdditionalServices = ({ stable, t, isRTL }) => {
  const allServices = [
    ...(stable.fullTimeServices || []),
    ...(stable.freelancerServices || []),
  ];
  if (!allServices.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-12"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <h2 className="text-2xl font-semibold mb-6 flex items-center">
        <span className="mr-2">{t("stableDetails:additionalServices")}</span>
        <div className="h-1 flex-grow bg-gray-200 rounded ml-4"></div>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {allServices.map((service) => (
          <Link
            href={`/services/${service._id}`}
            key={service._id}
            className="group"
          >
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative h-48 w-full">
                <Image
                  src="/placeholder.jpg"
                  alt={isRTL ? service.name_ar : service.name_en}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                  {isRTL ? service.name_ar : service.name_en}
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-primary font-medium">
                    {service.price} {t("stableDetails:currency")}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

export default AdditionalServices; 