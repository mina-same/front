"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  Download,
  ExternalLink,
  Star,
  Lock,
  Calendar,
  BookOpen,
  Globe,
  User,
  ChevronRight,
  Share2,
  MessageSquare,
  Mail,
  Phone,
  MessageSquareOff
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "../../../../../components/ui/progress";
import { Textarea } from "../../../../../components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import ResourceNotFound from "../../../../../../components/shared/ResourceNotFound";
import { client } from "@/lib/sanity";
import Layout from "components/layout/Layout";
import { useTranslation } from "react-i18next";
import Image from 'next/image';

const AlertNotification = ({ message, isVisible, onClose, type }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed bottom-4 left-2 transform z-50 max-w-md w-full mx-auto"
      >
        <div
          className={`bg-white shadow-lg rounded-lg p-4 flex items-start border-l-4 ${type === "success" ? "border-[#b28a2f]" : "border-red-500"}`}
        >
          {type === "success" ? (
            <svg className="w-6 h-6 text-[#b28a2f] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-[#1f2937]">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-[#e5e7eb] hover:text-[#1f2937] focus:outline-none"
          >
            ×
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

function CheckIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function CourseDetails() {
  const { courseId } = useParams();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [course, setCourse] = useState(null);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ isVisible: false, message: "", type: "error" });
  const [showInstructorContact, setShowInstructorContact] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [userOrder, setUserOrder] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          if (response.status === 401) {
            setCurrentUserId(null);
            return;
          }
          throw new Error(`Verify API failed with status: ${response.status}`);
        }
        const data = await response.json();
        if (data.authenticated) {
          setCurrentUserId(data.userId || data.user?.id || data.user?.userId);
        } else {
          setCurrentUserId(null);
        }
      } catch (error) {
        console.error("Auth verification failed:", error.message);
        setCurrentUserId(null);
      }
    };

    verifyAuth();
  }, []);

  useEffect(() => {
    const fetchCourseAndOrder = async () => {
      try {
        console.log("Fetching course with ID:", courseId);

        const courseQuery = `*[_type == "course" && _id == $courseId][0]{
          _id,
          title,
          description,
          price,
          averageRating,
          ratingCount,
          language,
          category,
          accessLink,
          duration,
          level,
          materials,
          ratings[]{
            _key,
            value,
            message,
            date,
            user->{
              _id,
              fullName,
              userName
            }
          },
          startDate,
          instructor->{
            _id,
            fullName,
            userName,
            email,
            phoneNumber,
            "image": image.asset->url,
            educationalDetails {
              yearsOfExperience,
              certifications {
                "url": asset->url
              }[@.url != null]
            },
            "otherCourses": *[_type == "course" && instructor._ref == ^._id && _id != $courseId][0...3]{
              _id,
              title,
              "image": images[0].asset->url,
              averageRating
            }[images != null]
          },
          "images": images[]{
            "_key": _key,
            "url": asset->url
          }[@.url != null],
          orders
        }`;

        const relatedCoursesQuery = `*[_type == "course" && category == $category && _id != $courseId][0...3]{
          _id,
          title,
          "image": images[0].asset->url,
          averageRating
        }[images != null]`;

        const orderQuery = `*[_type == "orderCourse" && user._ref == $userId && course._ref == $courseId][0]{
          _id,
          status,
          paymentStatus,
          price
        }`;

        const sanityCourse = await client.fetch(courseQuery, { courseId });
        console.log("Fetched course data:", JSON.stringify(sanityCourse, null, 2));


        if (sanityCourse) {
          setCourse(sanityCourse);
          const related = await client.fetch(relatedCoursesQuery, { category: sanityCourse.category || "other", courseId });
          setRelatedCourses(related.filter(course => course._id && course.image));

          if (currentUserId) {
            const userOrderData = await client.fetch(orderQuery, {
              userId: currentUserId,
              courseId
            });
            setUserOrder(userOrderData);
            setHasPurchased(userOrderData?.status === "completed" && userOrderData?.paymentStatus === "paid");
          }
        }
      } catch (error) {
        console.error("Error fetching course or order:", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId && typeof courseId === "string") {
      fetchCourseAndOrder();
    } else {
      console.warn("Invalid courseId:", courseId);
      setLoading(false);
    }
  }, [courseId, currentUserId]);

  const handlePurchase = async () => {
    if (!course || !courseId || !currentUserId) {
      showAlert(
        <>
          {t("courseDetails:errors.userNotAuthenticated", "You must be logged in to enroll in this course.")} {" "}
          <Link href="/login" className="text-red-700 hover:underline">
            {t("courseDetails:login", "Log in here")}
          </Link>
        </>,
        "error"
      );
      return;
    }

    if (typeof courseId !== "string" || !course._id) {
      console.error("Invalid course ID or course data:", { courseId, course });
      showAlert(t("courseDetails:errors.invalidCourse", "Invalid course data. Please try again."), "error");
      return;
    }

    setOrderLoading(true);
    try {
      const orderData = {
        _type: "orderCourse",
        user: { _type: "reference", _ref: currentUserId },
        course: { _type: "reference", _ref: courseId },
        orderDate: new Date().toISOString(),
        status: "pending",
        price: course.price || 0,
        paymentStatus: "pending",
      };

      console.log("Creating order with data:", orderData);
      const order = await client.create(orderData);
      const orderId = order._id;
      console.log("Order created successfully:", orderId);

      try {
        await client
          .patch(courseId)
          .setIfMissing({ orders: [] })
          .append("orders", [{ _type: "reference", _ref: orderId }])
          .commit();
        console.log("Order linked to course:", courseId);
      } catch (patchError) {
        console.warn("Failed to link order to course, proceeding anyway:", patchError.message);
        // Continue even if linking fails, as the order is still created
      }

      if (course.price === 0) {
        await client
          .patch(orderId)
          .set({ status: "completed", paymentStatus: "paid" })
          .commit();
        setHasPurchased(true);
        setUserOrder({ ...order, status: "completed", paymentStatus: "paid" });
        showAlert(t("courseDetails:enrollSuccess", "Enrolled successfully! You can now access the course materials."), "success");
      } else {
        showAlert(t("courseDetails:orderCreated", "Order created! Please complete payment on the orders page."), "success");
        setUserOrder({ ...order, status: "pending", paymentStatus: "pending" });
        router.push("/profile?tab=orders");
      }
    } catch (error) {
      console.error("Error enrolling in course:", error.message, error.stack);
      showAlert(`${t("courseDetails:errors.enrollFailed", "Failed to enroll in course")}: ${error.message}`, "error");
    } finally {
      setOrderLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Course: ${course?.title || "Course"}`,
          text: `Check out this course: ${course?.title || "Course"} by ${course?.instructor?.fullName || course?.instructor?.userName || "Unknown Instructor"}`,
          url: window.location.href,
        })
        .catch((error) => console.log("Error sharing", error));
    } else {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => showAlert(t("courseDetails:linkCopied", "Link copied to clipboard!"), "success"))
        .catch((err) => {
          console.error("Could not copy text: ", err);
          showAlert(t("courseDetails:errors.copyFailed", "Failed to copy link"), "error");
        });
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    if (!currentUserId) {
      showAlert(t("courseDetails:errors.userNotAuthenticated", "You must be logged in to rate this course"), "error");
      setIsSubmitting(false);
      return;
    }
    if (userRating < 1 || userRating > 5) {
      showAlert(t("courseDetails:errors.selectRating", "Please select a rating between 1 and 5"), "error");
      setIsSubmitting(false);
      return;
    }

    const existingRating = course?.ratings?.some((r) => r.user?._id === currentUserId);
    if (existingRating) {
      showAlert(t("courseDetails:errors.alreadyRated", "You have already rated this course"), "error");
      setIsSubmitting(false);
      return;
    }

    const ratingData = {
      _key: Math.random().toString(36).substr(2, 9),
      user: { _type: "reference", _ref: currentUserId },
      value: userRating,
      message: userComment || undefined,
      date: new Date().toISOString(),
    };

    try {
      await client
        .patch(courseId)
        .setIfMissing({ ratings: [] })
        .append("ratings", [ratingData])
        .commit();

      const updatedCourse = await client.fetch(
        `*[_type == "course" && _id == $courseId][0]{
          ratings[]{
            _key,
            value,
            message,
            date,
            user->{
              _id,
              fullName,
              userName
            }
          }
        }`,
        { courseId }
      );

      const totalRatings = updatedCourse.ratings?.length || 0;
      const sumRatings = updatedCourse.ratings?.reduce((sum, r) => sum + (r.value || 0), 0) || 0;
      const newAverageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

      await client
        .patch(courseId)
        .set({
          averageRating: newAverageRating,
          ratingCount: totalRatings,
        })
        .commit();

      setCourse({
        ...course,
        ratings: updatedCourse.ratings,
        averageRating: newAverageRating,
        ratingCount: totalRatings,
      });
      setUserRating(0);
      setUserComment("");
      showAlert(t("courseDetails:ratingSubmitted", "Rating submitted successfully!"), "success");
    } catch (error) {
      console.error("Error submitting rating:", error);
      showAlert(`${t("courseDetails:errors.ratingFailed", "Failed to submit rating")}: ${error.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showAlert = (message, type = "error") => {
    setAlert({ isVisible: true, message, type });
    setTimeout(() => setAlert({ isVisible: false, message: "", type: "error" }), 5000); // Increased to 5s for visibility
  };

  const renderStars = (rating, interactive = false) => {
    const fullStars = Math.floor(rating || 0);
    const decimalPart = (rating || 0) - fullStars;
    const stars = [];

    for (let i = 1; i <= fullStars; i++) {
      stars.push(
        <Star
          key={`star-full-${i}`}
          size={20}
          className={`cursor-${interactive ? "pointer" : "default"} text-[#d4af37] fill-[#d4af37]`}
          onClick={interactive ? () => setUserRating(i) : null}
          aria-label={interactive ? `Rate ${i} star${i > 1 ? "s" : ""}` : undefined}
          role={interactive ? "button" : undefined}
          tabIndex={interactive ? 0 : undefined}
          onKeyDown={interactive ? (e) => e.key === "Enter" && setUserRating(i) : undefined}
        />
      );
    }

    if (decimalPart > 0 && fullStars < 5) {
      stars.push(
        <div key="star-partial" className="relative inline-block">
          <Star
            size={20}
            className={`cursor-${interactive ? "pointer" : "default"} text-[#e5e7eb]`}
          />
          <div
            className="absolute top-0 left-0 overflow-hidden"
            style={{ width: `${decimalPart * 100}%` }}
          >
            <Star
              size={20}
              className={`cursor-${interactive ? "pointer" : "default"} text-[#d4af37] fill-[#d4af37]`}
            />
          </div>
        </div>
      );
    }

    for (let i = fullStars + (decimalPart > 0 ? 1 : 0) + 1; i <= 5; i++) {
      stars.push(
        <Star
          key={`star-empty-${i}`}
          size={20}
          className={`cursor-${interactive ? "pointer" : "default"} text-[#e5e7eb]`}
          onClick={interactive ? () => setUserRating(i) : null}
          aria-label={interactive ? `Rate ${i} star${i > 1 ? "s" : ""}` : undefined}
          role={interactive ? "button" : undefined}
          tabIndex={interactive ? 0 : undefined}
          onKeyDown={interactive ? (e) => e.key === "Enter" && setUserRating(i) : undefined}
        />
      );
    }

    return <div className="flex" role={interactive ? "radiogroup" : undefined}>{stars}</div>;
  };

  const handleCategoryClick = (categoryName) => {
    if (typeof categoryName === "string" && categoryName.trim() !== "") {
      router.push(`/courses?category=${encodeURIComponent(categoryName)}`);
    } else {
      console.warn("Invalid categoryName:", categoryName);
    }
  };

  const navigateToInstructor = (instructorId) => {
    if (typeof instructorId === "string" && instructorId.trim() !== "") {
      router.push(`/instructors/${instructorId}`);
    } else {
      console.warn("Invalid instructorId:", instructorId);
    }
  };

  const navigateToCourse = (courseId) => {
    if (typeof courseId === "string" && courseId.trim() !== "") {
      router.push(`/courses/${courseId}`);
    } else {
      console.warn("Invalid courseId:", courseId);
    }
  };

  const isValidUrl = (url) => {
    if (!url || typeof url !== "string") return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getButtonProps = () => {
    if (!userOrder) {
      return {
        text: course?.price > 0 ? `${t("courseDetails:enrollFor", "Enroll for")} $${course.price.toFixed(2)}` : (
          <span className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            {t("courseDetails:enrollFree", "Enroll Free")}
          </span>
        ),
        onClick: handlePurchase,
        disabled: orderLoading,
        show: true
      };
    }

    if (userOrder.status === "pending" && userOrder.paymentStatus === "pending") {
      return {
        text: t("courseDetails:continuePayment", "Continue Payment"),
        onClick: () => router.push("/profile?tab=orders"),
        disabled: false,
        show: true
      };
    }

    if (userOrder.status === "completed" && userOrder.paymentStatus === "paid") {
      return {
        text: t("courseDetails:accessMaterials", "Access Materials"),
        onClick: () => router.push("/profile?tab=orders"),
        disabled: false,
        show: true
      };
    }

    return {
      text: course?.price > 0 ? `${t("courseDetails:enrollFor", "Enroll for")} $${course.price.toFixed(2)}` : (
        <span className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          {t("courseDetails:enrollFree", "Enroll Free")}
        </span>
      ),
      onClick: handlePurchase,
      disabled: orderLoading,
      show: true
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#b28a2f]"></div>
        <p className="mt-4 text-[#1f2937] font-medium">{t("courseDetails:loading", "Loading course details...")}</p>
      </div>
    );
  }

  if (!course) {
    return <ResourceNotFound type="course" />;
  }

  const defaultImage = course.images?.[0]?.url || "/placeholder.svg";
  const buttonProps = getButtonProps();

  const ratingDistribution = [0, 0, 0, 0, 0];
  if (course.ratings && course.ratings.length > 0) {
    course.ratings.forEach((rating) => {
      const value = Math.min(Math.max(Math.floor(rating.value || 0), 1), 5);
      ratingDistribution[5 - value]++;
    });
  }

  const totalRatings = course.ratingCount || course.ratings?.length || 0;

  return (
    <Layout>
      <div className={`min-h-screen bg-white ${i18n.language === "ar" ? "rtl" : "ltr"}`}>
        <AlertNotification
          message={alert.message}
          isVisible={alert.isVisible}
          onClose={() => setAlert({ isVisible: false, message: "", type: "error" })}
          type={alert.type}
        />

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#b28a2f] to-[#d4af37] text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-row md:flex-row gap-8 items-center">
              <div className="w-full md:w-1/3 flex justify-center">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#d4af37] to-[#b28a2f] rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                  <div className="relative aspect-[2/3] w-64 overflow-hidden rounded-lg shadow-xl border border-[#fef3c7]">
                    <Image
                      fill
                      src={course.images?.[activeImage]?.url || defaultImage}
                      alt={course.title || "Course Image"}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                    />
                  </div>
                </div>
              </div>

              <div className="w-full md:w-2/3 space-y-6">
                <div>
                  <Badge
                    className="mb-2 bg-[#fef3c7] text-[#1f2937] hover:bg-[#d4af37] hover:text-white transition-colors"
                    onClick={() => handleCategoryClick(course.category)}
                  >
                    {course.category || t("courseDetails:uncategorized", "Uncategorized")}
                  </Badge>
                  <h1 className="text-4xl font-bold tracking-tight">{course.title || t("courseDetails:untitled", "Untitled Course")}</h1>
                  <p className="text-xl text-[#fef3c7] mt-2">
                    {t("courseDetails:byInstructor", "By")} {course.instructor?.fullName || course.instructor?.userName || t("courseDetails:unknown", "Unknown Instructor")}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {renderStars(course.averageRating)}
                    <span className="ml-2 text-[#fef3c7]">{course.averageRating?.toFixed(1) || t("courseDetails:noRatings", "No ratings")}</span>
                  </div>
                  <div className="text-[#fef3c7]">
                    {totalRatings} {totalRatings === 1 ? t("courseDetails:review", "review") : t("courseDetails:reviews", "reviews")}
                  </div>
                </div>

                <p className="text-[#fef3c7] line-clamp-3">{course.description || t("courseDetails:noDescription", "No description available.")}</p>

                <div className="flex flex-wrap gap-4">
                  {buttonProps.show && (
                    <Button
                      onClick={buttonProps.onClick}
                      disabled={buttonProps.disabled}
                      className="bg-white text-[#b28a2f] hover:bg-[#fef3c7] hover:text-[#1f2937] border border-[#d4af37] transition-colors"
                    >
                      {buttonProps.disabled ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#b28a2f]"></div>
                          {t("courseDetails:processing", "Processing...")}
                        </span>
                      ) : (
                        buttonProps.text
                      )}
                    </Button>
                  )}
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="bg-transparent border-[#fef3c7] text-[#fef3c7] hover:bg-[#d4af37] hover:text-white hover:border-[#d4af37] transition-colors"
                  >
                    <Share2 className="w-4 h-4 mr-2" /> {t("courseDetails:share", "Share")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Gallery */}
        {course.images && course.images.length > 1 && (
          <div className="container mx-auto px-4 py-4 bg-[#f5f5f5]">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {course.images.map((image, index) => (
                <button
                  key={image._key || `image-${index}`}
                  onClick={() => setActiveImage(index)}
                  className={`flex-shrink-0 w-16 h-24 rounded-md overflow-hidden border-2 transition-all ${activeImage === index ? "border-[#b28a2f] shadow-md" : "border-transparent opacity-70 hover:opacity-100"}`}
                >
                  <Image
                    fill
                    src={image.url || defaultImage}
                    alt={`${course.title || "Course"} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content area */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 mb-6 bg-[#f5f5f5] rounded-lg p-1">
                  <TabsTrigger value="overview" className="text-[#1f2937] data-[state=active]:bg-[#b28a2f] data-[state=active]:text-white rounded-md transition-colors">{t("courseDetails:overview", "Overview")}</TabsTrigger>
                  <TabsTrigger value="details" className="text-[#1f2937] data-[state=active]:bg-[#b28a2f] data-[state=active]:text-white rounded-md transition-colors">{t("courseDetails:details", "Details")}</TabsTrigger>
                  <TabsTrigger value="reviews" className="text-[#1f2937] data-[state=active]:bg-[#b28a2f] data-[state=active]:text-white rounded-md transition-colors">{t("courseDetails:reviews", "Reviews")}</TabsTrigger>
                  <TabsTrigger value="instructor" className="text-[#1f2937] data-[state=active]:bg-[#b28a2f] data-[state=active]:text-white rounded-md transition-colors">{t("courseDetails:instructor", "Instructor")}</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card className="bg-white border-[#e5e7eb] shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#1f2937]">
                        <BookOpen className="w-5 h-5 text-[#b28a2f]" />
                        {t("courseDetails:aboutCourse", "About This Course")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[#1f2937] leading-relaxed whitespace-pre-line">{course.description || t("courseDetails:noDescription", "No description available.")}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-[#e5e7eb] shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#1f2937]">
                        <Star className="w-5 h-5 text-[#b28a2f]" />
                        {t("courseDetails:highlights", "Highlights")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-3">
                          <div className="bg-[#fef3c7] p-2 rounded-full text-[#b28a2f]">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#1f2937]">{t("courseDetails:format", "Format")}</h4>
                            <p className="text-[#1f2937]">{course.accessLink || course.materials ? t("courseDetails:onlineCourse", "Online Course") : t("courseDetails:notSpecified", "Not specified")}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="bg-[#fef3c7] p-2 rounded-full text-[#b28a2f]">
                            <Globe className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#1f2937]">{t("courseDetails:language", "Language")}</h4>
                            <p className="text-[#1f2937]">{course.language || t("courseDetails:english", "English")}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="bg-[#fef3c7] p-2 rounded-full text-[#b28a2f]">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#1f2937]">{t("courseDetails:instructor", "Instructor")}</h4>
                            <p className="text-[#1f2937]">{course.instructor?.fullName || course.instructor?.userName || t("courseDetails:unknown", "Unknown")}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="bg-[#fef3c7] p-2 rounded-full text-[#b28a2f]">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#1f2937]">{t("courseDetails:startDate", "Start Date")}</h4>
                            <p className="text-[#1f2937]">{course.startDate || t("courseDetails:flexible", "Flexible")}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {(course.materials?.length > 0 || course.accessLink) && (
                    <Card className="bg-white border-[#e5e7eb] shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-[#1f2937]">
                          <FileText className="w-5 h-5 text-[#b28a2f]" />
                          {t("courseDetails:courseMaterials", "Course Materials")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {hasPurchased ? (
                          <div className="space-y-4">
                            {course.materials?.length > 0 ? (
                              <div className="space-y-2">
                                {course.materials.map((material, index) => (
                                  <a
                                    key={index}
                                    href={material}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center bg-gradient-to-r from-[#b28a2f] to-[#d4af37] hover:from-[#d4af37] hover:to-[#b28a2f] text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-[#e5e7eb] disabled:cursor-not-allowed"
                                    onClick={(e) => {
                                      if (!material || !isValidUrl(material)) {
                                        e.preventDefault();
                                        showAlert(t("courseDetails:errors.invalidMaterialLink", "Material link is invalid or unavailable. Please try again later."), "error");
                                      } else {
                                        console.log("Attempting to open material link:", material);
                                        window.open(material, "_blank", "noopener,noreferrer");
                                      }
                                    }}
                                    disabled={!material || !isValidUrl(material)}
                                  >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    {t("courseDetails:accessMaterial", "Access Material")} {index + 1}
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <Alert className="bg-[#fef3c7] border-[#d4af37] text-[#1f2937]">
                                <AlertDescription className="flex items-center gap-2">
                                  <Lock className="w-4 h-4 text-[#b28a2f]" />
                                  {t("courseDetails:noMaterials", "No downloadable materials available for this course.")}
                                </AlertDescription>
                              </Alert>
                            )}
                            {course.accessLink && (
                              <a
                                href={course.accessLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center bg-gradient-to-r from-[#b28a2f] to-[#d4af37] hover:from-[#d4af37] hover:to-[#b28a2f] text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-[#e5e7eb] disabled:cursor-not-allowed"
                                onClick={(e) => {
                                  if (!course.accessLink || !isValidUrl(course.accessLink)) {
                                    e.preventDefault();
                                    showAlert(t("courseDetails:errors.invalidAccessLink", "Online access link is invalid or unavailable. Please try again later."), "error");
                                  } else {
                                    console.log("Attempting to open access link:", course.accessLink);
                                    window.open(course.accessLink, "_blank", "noopener,noreferrer");
                                  }
                                }}
                                disabled={!course.accessLink || !isValidUrl(course.accessLink)}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                {t("courseDetails:accessOnline", "Access Online")}
                              </a>
                            )}
                          </div>
                        ) : (
                          <Alert className="bg-[#fef3c7] border-[#d4af37] text-[#1f2937]">
                            <AlertDescription className="flex items-center gap-2">
                              <Lock className="w-4 h-4 text-[#b28a2f]" />
                              {course.price > 0 ? (
                                t("courseDetails:enrollToAccess", "Enroll in this course to access its full content and materials.")
                              ) : (
                                <>
                                  {t("courseDetails:clickToEnroll", "Click")} {" "}
                                  <a href="#" onClick={handlePurchase} className="text-[#b28a2f] hover:underline">
                                    {t("courseDetails:enrollFree", "Enroll Free")}
                                  </a>{" "}
                                  {t("courseDetails:toAccessCourse", "to access this course.")}
                                </>
                              )}
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="details" className="space-y-6">
                  <Card className="bg-white border-[#e5e7eb] shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#1f2937]">
                        <FileText className="w-5 h-5 text-[#b28a2f]" />
                        {t("courseDetails:courseSpecifications", "Course Specifications")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
                        <div>
                          <h4 className="text-sm font-medium text-[#1f2937]/70">{t("courseDetails:title", "Title")}</h4>
                          <p className="text-[#1f2937] font-medium">{course.title || t("courseDetails:untitled", "Untitled")}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-[#1f2937]/70">{t("courseDetails:instructor", "Instructor")}</h4>
                          <p className="text-[#1f2937] font-medium">{course.instructor?.fullName || course.instructor?.userName || t("courseDetails:unknown", "Unknown")}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-[#1f2937]/70">{t("courseDetails:category", "Category")}</h4>
                          <Badge variant="outline" className="mt-1 bg-[#fef3c7] text-[#1f2937] border-[#d4af37] hover:bg-[#d4af37] hover:text-white">{course.category || t("courseDetails:uncategorized", "Uncategorized")}</Badge>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-[#1f2937]/70">{t("courseDetails:language", "Language")}</h4>
                          <p className="text-[#1f2937] font-medium">{course.language || t("courseDetails:english", "English")}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-[#1f2937]/70">{t("courseDetails:duration", "Duration")}</h4>
                          <p className="text-[#1f2937] font-medium">{course.duration || t("courseDetails:notSpecified", "Not specified")}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-[#1f2937]/70">{t("courseDetails:startDate", "Start Date")}</h4>
                          <p className="text-[#1f2937] font-medium">{course.startDate || t("courseDetails:flexible", "Flexible")}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-[#1f2937]/70">{t("courseDetails:level", "Level")}</h4>
                          <p className="text-[#1f2937] font-medium">{course.level || t("courseDetails:notSpecified", "Not specified")}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-[#1f2937]/70">{t("courseDetails:price", "Price")}</h4>
                          <p className="text-[#1f2937] font-medium">
                            {course.price > 0 ? `$${course.price?.toFixed(2) || "0.00"}` : t("courseDetails:free", "Free")}
                          </p>
                        </div>
                      </div>

                      {course.price > 0 && !hasPurchased && (
                        <Alert className="mt-8 bg-[#fef3c7] border-[#d4af37] text-[#1f2937]">
                          <AlertDescription className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-[#b28a2f]" />
                            {t("courseDetails:enrollToAccess", "Enroll in this course to access its full content and materials.")}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-6">
                  <Card className="bg-white border-[#e5e7eb] shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#1f2937]">
                        <Star className="w-5 h-5 text-[#b28a2f]" />
                        {t("courseDetails:learnerReviews", "Learner Reviews")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {course.ratings && course.ratings.length > 0 ? (
                        <div>
                          <div className="flex flex-row lg:flex-row gap-8 mb-8">
                            <div className="flex flex-col items-center justify-center text-center">
                              <div className="text-5xl font-bold text-[#b28a2f]">
                                {course.averageRating?.toFixed(1) || "0.0"}
                              </div>
                              <div className="mt-2">{renderStars(course.averageRating || 0)}</div>
                              <div className="mt-1 text-[#1f2937]/70">
                                {totalRatings} {totalRatings === 1 ? t("courseDetails:review", "review") : t("courseDetails:reviews", "reviews")}
                              </div>
                            </div>

                            <div className="flex-grow">
                              {[5, 4, 3, 2, 1].map((star) => {
                                const count = ratingDistribution[5 - star] || 0;
                                const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;

                                return (
                                  <div key={star} className="flex items-center gap-4 my-1">
                                    <div className="w-8 text-sm text-[#1f2937]">{`${star} star`}</div>
                                    <Progress
                                      value={percentage}
                                      className="h-2 flex-grow bg-[#e5e7eb]"
                                      indicatorClassName="bg-[#b28a2f]"
                                    />
                                    <div className="w-12 text-sm text-[#1f2937] text-right">
                                      {percentage.toFixed(0)}%
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="bg-[#fef3c7] p-5 rounded-lg shadow-sm border border-[#d4af37] mb-6">
                            <h4 className="text-lg font-semibold text-[#1f2937] mb-3 flex items-center gap-2">
                              <MessageSquare size={20} className="text-[#b28a2f]" />
                              {t("courseDetails:rateCourse", "Rate This Course")}
                            </h4>
                            <form onSubmit={handleRatingSubmit}>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                                <div className="flex items-center bg-white py-2 px-3 rounded-md border border-[#e5e7eb] shadow-sm">
                                  {renderStars(userRating, true)}
                                  <span className="ml-2 text-sm text-[#1f2937] min-w-20">
                                    {userRating ? `${userRating}/5` : t("courseDetails:selectRating", "Select a rating")}
                                  </span>
                                </div>
                                <span className="text-xs text-[#1f2937]/70">{t("courseDetails:clickToRate", "Click to rate")}</span>
                              </div>
                              <div className="relative mb-4">
                                <Textarea
                                  value={userComment}
                                  onChange={(e) => setUserComment(e.target.value)}
                                  placeholder={t("courseDetails:leaveComment", "Leave a comment")}
                                  maxLength={200}
                                  className="w-full p-3 border border-[#e5e7eb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#d4af37] bg-white text-[#1f2937]"
                                  rows={3}
                                />
                                <div className="absolute bottom-2 right-2 text-xs text-[#1f2937]/70">
                                  {userComment.length}/200
                                </div>
                              </div>
                              <Button
                                type="submit"
                                disabled={!userRating || isSubmitting}
                                className="w-full bg-gradient-to-r from-[#b28a2f] to-[#d4af37] hover:from-[#d4af37] hover:to-[#b28a2f] disabled:bg-[#e5e7eb] disabled:cursor-not-allowed text-white font-medium"
                              >
                                <Star size={18} className="mr-2" />
                                {isSubmitting ? t("courseDetails:submitting", "Submitting...") : t("courseDetails:submitRating", "Submit Rating")}
                              </Button>
                            </form>
                          </div>

                          <div className="space-y-6 mt-8">
                            {course.ratings.map((rating, index) => (
                              <div
                                key={rating._key || index}
                                className="border-b border-[#e5e7eb] last:border-0 pb-6 last:pb-0 bg-[#fef3c7]/50 p-4 rounded-md"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <div className="font-medium text-[#1f2937]">
                                      {rating.user?.userName || rating.user?.fullName || t("courseDetails:anonymousLearner", "Anonymous Learner")}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      {renderStars(rating.value)}
                                      <span className="text-sm text-[#1f2937]/70">
                                        {rating.date ? new Date(rating.date).toLocaleDateString() : t("courseDetails:noDate", "No date")}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {rating.message && (
                                  <p className="text-[#1f2937] mt-2 whitespace-pre-line">{rating.message}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#fef3c7] text-[#b28a2f] mb-4">
                            <MessageSquareOff className="w-10 h-10" />
                          </div>
                          <h3 className="text-lg font-medium text-[#1f2937] mb-2">{t("courseDetails:noReviews", "No Reviews Yet")}</h3>
                          <p className="text-[#1f2937]/70 max-w-md mx-auto">
                            {t("courseDetails:firstToReview", "Be the first to review this course and share your thoughts with other learners.")}
                          </p>
                          <form onSubmit={handleRatingSubmit} className="mt-6">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                              <div className="flex items-center bg-white py-2 px-3 rounded-md border border-[#e5e7eb] shadow-sm">
                                {renderStars(userRating, true)}
                                <span className="ml-2 text-sm text-[#1f2937] min-w-20">
                                  {userRating ? `${userRating}/5` : t("courseDetails:selectRating", "Select a rating")}
                                </span>
                              </div>
                              <span className="text-xs text-[#1f2937]/70">{t("courseDetails:clickToRate", "Click to rate")}</span>
                            </div>
                            <div className="relative mb-4">
                              <Textarea
                                value={userComment}
                                onChange={(e) => setUserComment(e.target.value)}
                                placeholder={t("courseDetails:leaveComment", "Leave a comment")}
                                maxLength={200}
                                className="w-full p-3 border border-[#e5e7eb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#d4af37] bg-white text-[#1f2937]"
                                rows={3}
                              />
                              <div className="absolute bottom-2 right-2 text-xs text-[#1f2937]/70">
                                {userComment.length}/200
                              </div>
                            </div>
                            <Button
                              type="submit"
                              disabled={!userRating || isSubmitting}
                              className="w-full bg-gradient-to-r from-[#b28a2f] to-[#d4af37] hover:from-[#d4af37] hover:to-[#b28a2f] disabled:bg-[#e5e7eb] disabled:cursor-not-allowed text-white font-medium"
                            >
                              <Star size={18} className="mr-2" />
                              {isSubmitting ? t("courseDetails:submitting", "Submitting...") : t("courseDetails:submitRating", "Submit Rating")}
                            </Button>
                          </form>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="instructor" className="space-y-6">
                  {course.instructor && (
                    <Card className="bg-white border-[#e5e7eb] shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-[#1f2937]">
                          <User className="w-5 h-5 text-[#b28a2f]" />
                          {t("courseDetails:aboutInstructor", "About the Instructor")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-row justify-center items-center md:flex-row gap-6">
                          {course.instructor?.image && (
                            <div className="flex justify-center">
                              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-[#d4af37] shadow-md">
                                <Image
                                  fill
                                  src={course.instructor.image}
                                  alt={course.instructor?.fullName || course.instructor?.userName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          )}

                          <div className={`flex flex-col justify-center w-full ${course.instructor?.image ? "md:w-3/4" : ""}`}>
                            <h3 className="text-xl font-semibold text-[#1f2937] mb-2">
                              {course.instructor?.fullName || course.instructor?.userName || t("courseDetails:unknownInstructor", "Unknown Instructor")}
                            </h3>
                            {course.instructor?.userName && (
                              <p className="text-[#1f2937]/70 mb-2">@{course.instructor.userName}</p>
                            )}
                            {course.instructor?.educationalDetails?.yearsOfExperience && (
                              <p className="text-[#1f2937]">{course.instructor.educationalDetails.yearsOfExperience} {t("courseDetails:yearsExperience", "years of experience")}</p>
                            )}
                          </div>
                        </div>

                        {(course.instructor?.email || course.instructor?.phoneNumber) && (
                          <div className="mt-6">
                            <Button
                              onClick={() => setShowInstructorContact(!showInstructorContact)}
                              className="w-full bg-[#fef3c7] hover:bg-[#d4af37] text-[#1f2937] hover:text-white font-medium border border-[#d4af37] transition-colors"
                              variant="outline"
                            >
                              <MessageSquare size={18} className="mr-2" />
                              {showInstructorContact ? t("courseDetails:hideContact", "Hide Contact") : t("courseDetails:seeContact", "See Contact Details")}
                            </Button>
                            {showInstructorContact && (
                              <div className="mt-4 p-4 bg-[#fef3c7] rounded-lg border border-[#d4af37] shadow-sm">
                                {course.instructor?.email && (
                                  <p className="flex items-center text-sm text-[#1f2937] mb-2">
                                    <Mail className="w-4 h-4 mr-2 text-[#b28a2f]" />
                                    <span className="font-medium">{t("courseDetails:email", "Email")}:</span>
                                    <a
                                      href={`mailto:${course.instructor.email}`}
                                      className="ml-1 text-[#b28a2f] hover:text-[#d4af37] hover:underline"
                                    >
                                      {course.instructor.email}
                                    </a>
                                  </p>
                                )}
                                {course.instructor?.phoneNumber && (
                                  <p className="flex items-center text-sm text-[#1f2937]">
                                    <Phone className="w-4 h-4 mr-2 text-[#b28a2f]" />
                                    <span className="font-medium">{t("courseDetails:phone", "Phone")}:</span>
                                    <a
                                      href={`tel:${course.instructor.phoneNumber}`}
                                      className="ml-1 text-[#b28a2f] hover:text-[#d4af37] hover:underline"
                                    >
                                      {course.instructor.phoneNumber}
                                    </a>
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {course.instructor?.educationalDetails?.certifications?.length > 0 && (
                          <div className="mt-6">
                            <h4 className="text-lg font-semibold text-[#1f2937] mb-4">{t("courseDetails:certifications", "Certifications")}</h4>
                            <ul className="list-disc pl-5">
                              {course.instructor.educationalDetails.certifications.map((cert, index) => (
                                <li key={index}>
                                  <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-[#b28a2f] hover:text-[#d4af37] hover:underline">
                                    {t("courseDetails:certification", "Certification")} {index + 1}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {course.instructor?.otherCourses && course.instructor.otherCourses.length > 0 && (
                          <div className="mt-6">
                            <h4 className="text-lg font-semibold text-[#1f2937] mb-4">{t("courseDetails:otherCourses", "Other Courses by This Instructor")}</h4>
                            <div className="space-y-4">
                              {course.instructor.otherCourses.map((otherCourse) => (
                                <div
                                  key={otherCourse._id}
                                  className="flex gap-3 cursor-pointer hover:bg-[#fef3c7] p-2 rounded-md transition-colors"
                                  onClick={() => navigateToCourse(otherCourse._id)}
                                >
                                  <div className="w-12 h-16 bg-[#e5e7eb] rounded flex-shrink-0 overflow-hidden">
                                    <Image
                                      fill
                                      src={otherCourse.image || "/placeholder.svg"}
                                      alt={otherCourse.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-[#1f2937] line-clamp-1">{otherCourse.title}</h4>
                                    <div className="flex items-center gap-1 mt-1">
                                      {renderStars(otherCourse.averageRating || 0)}
                                      <span className="text-xs text-[#1f2937]/70">
                                        {otherCourse.averageRating?.toFixed(1) || t("courseDetails:noRatings", "No ratings")}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="outline"
                          className="w-full bg-[#fef3c7] text-[#b28a2f] hover:bg-[#d4af37] hover:text-white border-[#d4af37] transition-colors"
                          onClick={() => navigateToInstructor(course.instructor?._id)}
                          disabled={!course.instructor?._id}
                        >
                          <span className="flex items-center justify-center gap-2">
                            {t("courseDetails:viewInstructorProfile", "View Instructor Profile")}
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        </Button>
                      </CardFooter>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="border-[#e5e7eb] bg-white overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-gradient-to-r from-[#b28a2f] to-[#d4af37] px-6 py-4">
                  <h3 className="text-xl font-semibold text-white">{t("courseDetails:getThisCourse", "Get This Course")}</h3>
                </div>

                <CardContent className="pt-6">
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[#1f2937]">{t("courseDetails:price", "Price")}:</span>
                      <span className="text-2xl font-bold text-[#b28a2f]">
                        {course.price > 0 ? `$${course.price.toFixed(2)}` : t("courseDetails:free", "Free")}
                      </span>
                    </div>

                    {course.price > 0 && (
                      <div className="text-sm text-[#b28a2f] flex items-center gap-1 justify-end mb-4">
                        <Lock className="w-3 h-3" />
                        {t("courseDetails:securePayment", "Secure payment")}
                      </div>
                    )}
                  </div>

                  {buttonProps.show && (
                    <Button
                      onClick={buttonProps.onClick}
                      disabled={buttonProps.disabled}
                      className="w-full bg-gradient-to-r from-[#b28a2f] to-[#d4af37] hover:from-[#d4af37] hover:to-[#b28a2f] text-white font-medium disabled:bg-[#e5e7eb] disabled:cursor-not-allowed"
                      size="lg"
                    >
                      {buttonProps.disabled ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          {t("courseDetails:processing", "Processing...")}
                        </span>
                      ) : (
                        buttonProps.text
                      )}
                    </Button>
                  )}

                  {course.price > 0 && (
                    <div className="mt-4 flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-[#1f2937]">
                        <div className="w-5 h-5 rounded-full bg-[#fef3c7] flex items-center justify-center">
                          <CheckIcon className="w-3 h-3 text-[#b28a2f]" />
                        </div>
                        {t("courseDetails:instantAccess", "Instant digital access")}
                      </div>
                      <div className="flex items-center gap-2 text-[#1f2937]">
                        <div className="w-5 h-5 rounded-full bg-[#fef3c7] flex items-center justify-center">
                          <CheckIcon className="w-3 h-3 text-[#b28a2f]" />
                        </div>
                        {course.materials?.length > 0 || course.accessLink ? t("courseDetails:onlineMaterials", "Online course materials") : t("courseDetails:courseAccess", "Course access")}
                      </div>
                      <div className="flex items-center gap-2 text-[#1f2937]">
                        <div className="w-5 h-5 rounded-full bg-[#fef3c7] flex items-center justify-center">
                          <CheckIcon className="w-3 h-3 text-[#b28a2f]" />
                        </div>
                        {t("courseDetails:securePayment", "Secure payment")}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {relatedCourses.length > 0 && (
                <Card className="bg-white border-[#e5e7eb] shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg text-[#1f2937]">{t("courseDetails:relatedCourses", "Related Courses")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {relatedCourses.map((relatedCourse) => (
                      <div
                        key={relatedCourse._id}
                        className="flex gap-3 cursor-pointer hover:bg-[#fef3c7] p-2 rounded-md transition-colors"
                        onClick={() => navigateToCourse(relatedCourse._id)}
                      >
                        <div className="w-12 h-16 bg-[#e5e7eb] rounded flex-shrink-0 overflow-hidden">
                          <Image
                            fill
                            src={relatedCourse.image || "/placeholder.svg"}
                            alt={relatedCourse.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-[#1f2937] line-clamp-1">{relatedCourse.title}</h4>
                          <div className="flex items-center gap-1 mt-1">
                            {renderStars(relatedCourse.averageRating || 0)}
                            <span className="text-xs text-[#1f2937]/70">
                              {relatedCourse.averageRating?.toFixed(1) || t("courseDetails:noRatings", "No ratings")}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="ghost"
                      className="w-full text-[#b28a2f] hover:text-[#d4af37] hover:bg-[#fef3c7]"
                      onClick={() => router.push(`/courses?category=${course.category}`)}
                    >
                      {t("courseDetails:viewAllRelated", "View All Related Courses")}
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}