import React from "react";
import { motion } from "framer-motion";
import { Award, Calendar, Users, Shield } from "lucide-react";

const StableDetailsContent = ({ stable, t, isRTL }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="bg-white p-6 rounded-xl shadow-md"
  >
    <h3 className="text-xl font-bold mb-4">
      {t("stableDetails:stableDetails")}
    </h3>
    <div className="space-y-4">
      {stable.kindOfStable?.length > 0 && (
        <div className="flex items-start">
          <div className="mt-1 mr-3 text-primary">
            <Award size={20} />
          </div>
          <div>
            <p className="font-medium">{t("stableDetails:stableType")}</p>
            <p className="text-gray-600">
              {stable.kindOfStable
                .map((type) => t(`stableDetails:stableTypes.${type}`))
                .join(", ")}
            </p>
          </div>
        </div>
      )}
      {stable.dateOfEstablishment && (
        <div className="flex items-start">
          <div className="mt-1 mr-3 text-primary">
            <Calendar size={20} />
          </div>
          <div>
            <p className="font-medium">
              {t("stableDetails:dateOfEstablishment")}
            </p>
            <p className="text-gray-600">
              {new Date(stable.dateOfEstablishment).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}
      {stable.boardingCapacity && (
        <div className="flex items-start">
          <div className="mt-1 mr-3 text-primary">
            <Users size={20} />
          </div>
          <div>
            <p className="font-medium">
              {t("stableDetails:boardingCapacity")}
            </p>
            <p className="text-gray-600">
              {stable.boardingCapacity} {t("stableDetails:horses")}
            </p>
          </div>
        </div>
      )}
      {stable.stableDescription && (
        <div className="flex items-start">
          <div className="mt-1 mr-3 text-primary">
            <Shield size={20} />
          </div>
          <div>
            <p className="font-medium">
              {t("stableDetails:stableDescription")}
            </p>
            <p className="text-gray-600">{stable.stableDescription}</p>
          </div>
        </div>
      )}
    </div>
  </motion.div>
);

export default StableDetailsContent; 