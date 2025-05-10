"use client";

import { Book, Award, Medal, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";

const getProfileTier = (percentage, t) => {
  if (percentage > 90)
    return {
      name: t("addCourse:tiers.complete"),
      color: "text-purple-500",
      bg: "bg-gradient-to-r from-purple-300 to-purple-500",
      message: t("addCourse:completeMessage"),
      icon: <Book className="text-purple-500" size={20} />,
    };
  if (percentage > 75)
    return {
      name: t("addCourse:tiers.advanced"),
      color: "text-indigo-500",
      bg: "bg-gradient-to-r from-indigo-200 to-indigo-400",
      message: t("addCourse:advancedMessage"),
      icon: <Award className="text-indigo-500" size={20} />,
    };
  if (percentage > 50)
    return {
      name: t("addCourse:tiers.intermediate"),
      color: "text-blue-500",
      bg: "bg-gradient-to-r from-blue-200 to-blue-400",
      message: t("addCourse:intermediateMessage"),
      icon: <Medal className="text-blue-500" size={20} />,
    };
  return {
    name: t("addCourse:tiers.basic"),
      color: "text-gray-600",
      bg: "bg-gray-100",
      message: t("addCourse:basicMessage"),
      icon: <Shield className="text-gray-600" size={20} />,
  };
};

export default function CourseProgressIndicator({ percentage }) {
  const { t } = useTranslation();
  const tier = getProfileTier(percentage, t);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {tier.icon}
          <span className={`font-bold ${tier.color}`}>{tier.name}</span>
        </div>
        <span className="text-sm text-gray-600">{t("addCourse:completion")}: {percentage}%</span>
      </div>
      <Progress value={percentage} className={`h-3 ${tier.bg}`} />
      <div className="mt-1 text-sm text-gray-500">{tier.message}</div>
    </div>
  );
}