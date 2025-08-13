"use client";

import { Home, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "../../src/components/ui/button";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const ResourceNotFound = ({ type }) => {
  const { t, i18n } = useTranslation("notFound");
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12 ${i18n.language === 'ar' ? 'rtl' : ''}`}>
      <div className="max-w-lg w-full text-center">
        <motion.img
          src="/images/unnamed2.png"
          alt={t("imageAlt")}
          className="w-full max-w-md mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {type === "book"
              ? t("titleBook")
              : type === "course"
              ? t("titleCourse")
              : t("titleGeneric")}
          </h2>
          <p className="text-gray-600 mb-8">
            {type ? t("descriptionTyped", { type }) : t("descriptionGeneric")}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center ">
            <Button asChild variant="default" size="lg">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                {t("backHome")}
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link href={type === "book" ? "/books" : type === "course" ? "/courses" : "/"}>
                <BookOpen className="mr-2 h-4 w-4" />
                {type === "book"
                  ? t("browseBooks")
                  : type === "course"
                  ? t("browseCourses")
                  : t("explore")}
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResourceNotFound;
