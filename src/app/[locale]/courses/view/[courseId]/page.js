"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  Download,
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
import { Progress } from "../../../../../components/ui new/progress";
import { Textarea } from "../../../../../components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import ResourceNotFound from "../../../../../../components/shared/ResourceNotFound";
import { client } from "@/lib/sanity";
import Layout from "components/layout/Layout";
import { useTranslation } from "react-i18next";

const AlertNotification = ({ message, isVisible, onClose, type }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed bottom-4 right-15 transform z-50 max-w-md w-full mx-auto"
      >
        <div
          className={`bg-white shadow-lg rounded-lg p-4 flex items-start ${type === "success" ? "border-l-4 border-green-500" : "border-l-4 border-red-500"
            }`}
        >
          {type === "success" ? (
            <svg className="w-6 h-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            ×
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

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
    const fetchCourse = async () => {
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
          }[@.url != null]
        }`;

        const relatedCoursesQuery = `*[_type == "course" && category == $category && _id != $courseId][0...3]{
          _id,
          title,
          "image": images[0].asset->url,
          averageRating
        }[images != null]`;

        const sanityCourse = await client.fetch(courseQuery, { courseId });
        console.log("Fetched course data:", JSON.stringify(sanityCourse, null, 2));

        if (sanityCourse) {
          setCourse(sanityCourse);
          const related = await client.fetch(relatedCoursesQuery, { category: sanityCourse.category || "other", courseId });
          console.log("Related courses:", JSON.stringify(related, null, 2));
          setRelatedCourses(related.filter(course => course._id && course.image));
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId && typeof courseId === "string") {
      fetchCourse();
    } else {
      console.warn("Invalid courseId:", courseId);
      setLoading(false);
    }
  }, [courseId]);

  const handlePurchase = async () => {
    if (!course || !courseId) return;

    setOrderLoading(true);
    try {
      // Placeholder for purchase functionality
      setTimeout(() => {
        showAlert("Purchase functionality would go here", "success");
        setOrderLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error purchasing course:", error);
      showAlert("Failed to purchase course", "error");
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
        .then(() => showAlert("Link copied to clipboard!", "success"))
        .catch((err) => {
          console.error("Could not copy text: ", err);
          showAlert("Failed to copy link", "error");
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
      showAlert(t("courseDetails:errors.selectRating"), "error");
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
    setTimeout(() => setAlert({ isVisible: false, message: "", type: "error" }), 3000);
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
          className={`cursor-${interactive ? "pointer" : "default"} text-amber-400 fill-amber-400`}
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
            className={`cursor-${interactive ? "pointer" : "default"} text-gray-300`}
          />
          <div
            className="absolute top-0 left-0 overflow-hidden"
            style={{ width: `${decimalPart * 100}%` }}
          >
            <Star
              size={20}
              className={`cursor-${interactive ? "pointer" : "default"} text-amber-400 fill-amber-400`}
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
          className={`cursor-${interactive ? "pointer" : "default"} text-gray-300`}
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-600"></div>
        <p className="mt-4 text-amber-700 font-medium">{t("courseDetails:loading", "Loading course details...")}</p>
      </div>
    );
  }

  if (!course) {
    return <ResourceNotFound type="course" />;
  }

  const defaultImage = course.images?.[0]?.url || "/placeholder.svg";

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
      <div className={`min-h-screen bg-gradient-to-br from-amber-50 to-white ${i18n.language === "ar" ? "rtl" : "ltr"}`}>
        <AlertNotification
          message={alert.message}
          isVisible={alert.isVisible}
          onClose={() => setAlert({ isVisible: false, message: "", type: "error" })}
          type={alert.type}
        />

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-row md:flex-row gap-8 items-center">
              <div className="w-full md:w-1/3 flex justify-center">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
                  <div className="relative w-64 overflow-hidden rounded-lg shadow-xl">
                    <img
                      src={course.images?.[activeImage]?.url || defaultImage}
                      alt={course.title || "Course Image"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="w-full md:w-2/3 space-y-6">
                <div>
                  <Badge
                    className="mb-2 bg-amber-100 text-amber-800 hover:bg-amber-200 cursor-pointer"
                    onClick={() => handleCategoryClick(course.category)}
                  >
                    {course.category || "Uncategorized"}
                  </Badge>
                  <h1 className="text-4xl font-bold tracking-tight">{course.title || "Untitled Course"}</h1>
                  <p className="text-xl text-amber-100 mt-2">
                    By {course.instructor?.fullName || course.instructor?.userName || "Unknown Instructor"}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {renderStars(course.averageRating)}
                    <span className="ml-2 text-amber-100">{course.averageRating?.toFixed(1) || "No ratings"}</span>
                  </div>
                  <div className="text-amber-100">
                    {totalRatings} {totalRatings === 1 ? "review" : "reviews"}
                  </div>
                </div>

                <p className="text-amber-100 line-clamp-3">{course.description || "No description available."}</p>

                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={handlePurchase}
                    disabled={orderLoading}
                    className="bg-white text-amber-700 hover:bg-amber-50"
                  >
                    {orderLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-700"></div>
                        {t("courseDetails:processing", "Processing...")}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        {course.price > 0 ? (
                          <>{t("courseDetails:enrollFor", "Enroll for")} ${course.price?.toFixed(2) || "0.00"}</>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            {t("courseDetails:enrollFree", "Enroll Free")}
                          </>
                        )}
                      </span>
                    )}
                  </Button>

                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="bg-transparent border-white text-white hover:bg-white/20"
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
          <div className="container mx-auto px-4 py-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {course.images.map((image, index) => (
                <button
                  key={image._key || `image-${index}`}
                  onClick={() => setActiveImage(index)}
                  className={`flex-shrink-0 w-16 h-24 rounded-md overflow-hidden border-2 transition-all ${activeImage === index ? "border-amber-600 shadow-md" : "border-transparent opacity-70"
                    }`}
                >
                  <img
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
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="overview" className="text-center">{t("courseDetails:overview", "Overview")}</TabsTrigger>
                  <TabsTrigger value="details" className="text-center">{t("courseDetails:details", "Details")}</TabsTrigger>
                  <TabsTrigger value="reviews" className="text-center">{t("courseDetails:reviews", "Reviews")}</TabsTrigger>
                  <TabsTrigger value="instructor" className="text-center">{t("courseDetails:instructor", "Instructor")}</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-amber-600" />
                        {t("courseDetails:aboutCourse", "About This Course")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">{course.description || t("courseDetails:noDescription", "No description available.")}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-600" />
                        {t("courseDetails:highlights", "Highlights")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-3">
                          <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{t("courseDetails:format", "Format")}</h4>
                            <p className="text-gray-600">{course.accessLink ? t("courseDetails:onlineCourse", "Online Course") : t("courseDetails:notSpecified", "Not specified")}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                            <Globe className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{t("courseDetails:language", "Language")}</h4>
                            <p className="text-gray-600">{course.language || t("courseDetails:english", "English")}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{t("courseDetails:instructor", "Instructor")}</h4>
                            <p className="text-gray-600">{course.instructor?.fullName || course.instructor?.userName || t("courseDetails:unknown", "Unknown")}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{t("courseDetails:startDate", "Start Date")}</h4>
                            <p className="text-gray-600">{course.startDate || t("courseDetails:flexible", "Flexible")}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="details" className="space-y-6">
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-amber-600" />
                        {t("courseDetails:courseSpecifications", "Course Specifications")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">{t("courseDetails:title", "Title")}</h4>
                          <p className="text-gray-900 font-medium">{course.title || t("courseDetails:untitled", "Untitled")}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-500">{t("courseDetails:instructor", "Instructor")}</h4>
                          <p className="text-gray-900 font-medium">{course.instructor?.fullName || course.instructor?.userName || t("courseDetails:unknown", "Unknown")}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-500">{t("courseDetails:category", "Category")}</h4>
                          <Badge variant="outline" className="mt-1">{course.category || t("courseDetails:uncategorized", "Uncategorized")}</Badge>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-500">{t("courseDetails:language", "Language")}</h4>
                          <p className="text-gray-900 font-medium">{course.language || t("courseDetails:english", "English")}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-500">{t("courseDetails:duration", "Duration")}</h4>
                          <p className="text-gray-900 font-medium">{course.duration || t("courseDetails:notSpecified", "Not specified")}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-500">{t("courseDetails:startDate", "Start Date")}</h4>
                          <p className="text-gray-900 font-medium">{course.startDate || t("courseDetails:flexible", "Flexible")}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-500">{t("courseDetails:level", "Level")}</h4>
                          <p className="text-gray-900 font-medium">{course.level || t("courseDetails:notSpecified", "Not specified")}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-500">{t("courseDetails:price", "Price")}</h4>
                          <p className="text-gray-900 font-medium">
                            {course.price > 0 ? `$${course.price?.toFixed(2) || "0.00"}` : t("courseDetails:free", "Free")}
                          </p>
                        </div>
                      </div>

                      {course.price > 0 && (
                        <Alert className="mt-8 bg-amber-50 border-amber-200 text-amber-700">
                          <AlertDescription className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            {t("courseDetails:enrollToAccess", "Enroll in this course to access its full content and materials.")}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-6">
                  <Card className="bg-white dark:bg-gray-800 border-amber-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                        <Star className="w-5 h-5 text-amber-600" />
                        Learner Reviews
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {course.ratings && course.ratings.length > 0 ? (
                        <div>
                          <div className="flex flex-row lg:flex-row gap-8 mb-8">
                            <div className="flex flex-col items-center justify-center text-center">
                              <div className="text-5xl font-bold text-amber-800 dark:text-amber-300">
                                {course.averageRating?.toFixed(1) || "0.0"}
                              </div>
                              <div className="mt-2">{renderStars(course.averageRating || 0)}</div>
                              <div className="mt-1 text-gray-500 dark:text-gray-400">
                                {totalRatings} {totalRatings === 1 ? "review" : "reviews"}
                              </div>
                            </div>

                            <div className="flex-grow">
                              {[5, 4, 3, 2, 1].map((star) => {
                                const count = ratingDistribution[5 - star] || 0;
                                const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;

                                return (
                                  <div key={star} className="flex items-center gap-4 my-1">
                                    <div className="w-8 text-sm text-gray-700 dark:text-gray-300">{`${star} star`}</div>
                                    <Progress
                                      value={percentage}
                                      className="h-2 flex-grow bg-gray-200 dark:bg-gray-600"
                                    />
                                    <div className="w-12 text-sm text-gray-700 dark:text-gray-300 text-right">
                                      {percentage.toFixed(0)}%
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="bg-amber-50 p-5 rounded-lg shadow-sm border border-amber-200 mb-6 dark:bg-gray-700 dark:border-amber-900">
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                              <MessageSquare size={20} className="text-amber-500" />
                              Rate This Course
                            </h4>
                            <form onSubmit={handleRatingSubmit}>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                                <div className="flex items-center bg-white dark:bg-gray-800 py-2 px-3 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm">
                                  {renderStars(userRating, true)}
                                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-300 min-w-20">
                                    {userRating ? `${userRating}/5` : "Select a rating"}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Click to rate</span>
                              </div>
                              <div className="relative mb-4">
                                <textarea
                                  value={userComment}
                                  onChange={(e) => setUserComment(e.target.value)}
                                  placeholder="Leave a comment"
                                  maxLength={200}
                                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white dark:bg-gray-800 text-black"
                                  rows={3}
                                />
                                <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500">
                                  {userComment.length}/200
                                </div>
                              </div>
                              <Button
                                type="submit"
                                disabled={!userRating || isSubmitting}
                                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium"
                              >
                                <Star size={18} className="mr-2" />
                                {isSubmitting ? "Submitting..." : "Submit Rating"}
                              </Button>
                            </form>
                          </div>

                          <div className="space-y-6 mt-8">
                            {course.ratings.map((rating, index) => (
                              <div
                                key={rating._key || index}
                                className="border-b border-gray-100 dark:border-gray-700 last:border-0 pb-6 last:pb-0 bg-amber-50/50 dark:bg-gray-900/50 p-4 rounded-md"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <div className="font-medium text-gray-800 dark:text-gray-200">
                                      {rating.user?.userName || rating.user?.name || "Anonymous Learner"}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      {renderStars(rating.value)}
                                      <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {rating.date ? new Date(rating.date).toLocaleDateString() : "No date"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {rating.message && (
                                  <p className="text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-line">{rating.message}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-4">
                            <MessageSquareOff className="w-10 h-10" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">No Reviews Yet</h3>
                          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                            Be the first to review this course and share your thoughts with other learners.
                          </p>
                          <form onSubmit={handleRatingSubmit} className="mt-6">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                              <div className="flex items-center bg-white dark:bg-gray-800 py-2 px-3 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm">
                                {renderStars(userRating, true)}
                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-300 min-w-20">
                                  {userRating ? `${userRating}/5` : "Select a rating"}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">Click to rate</span>
                            </div>
                            <div className="relative mb-4">
                              <textarea
                                value={userComment}
                                onChange={(e) => setUserComment(e.target.value)}
                                placeholder="Leave a comment"
                                maxLength={200}
                                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white dark:bg-gray-800 text-black"
                                rows={3}
                              />
                              <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500">
                                {userComment.length}/200
                              </div>
                            </div>
                            <Button
                              type="submit"
                              disabled={!userRating || isSubmitting}
                              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium"
                            >
                              <Star size={18} className="mr-2" />
                              {isSubmitting ? "Submitting..." : "Submit Rating"}
                            </Button>
                          </form>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="instructor" className="space-y-6">
                  {course.instructor && (
                    <Card className="bg-white">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="w-5 h-5 text-amber-600" />
                          About the Instructor
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-row justify-center items-center md:flex-row gap-6">
                          {course.instructor?.image && (
                            <div className="flex justify-center">
                              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-amber-100">
                                <img
                                  src={course.instructor.image}
                                  alt={course.instructor?.fullName || course.instructor?.userName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          )}

                          <div className={`flex flex-col justify-center w-full ${course.instructor?.image ? "md:w-3/4" : ""}`}>
                            <h3 className="text-xl font-semibold mb-2">
                              {course.instructor?.fullName || course.instructor?.userName || "Unknown Instructor"}
                            </h3>
                            {course.instructor?.userName && (
                              <p className="text-gray-600 mb-2">@{course.instructor.userName}</p>
                            )}
                            {course.instructor?.educationalDetails?.yearsOfExperience && (
                              <p className="text-gray-600">{course.instructor.educationalDetails.yearsOfExperience} years of experience</p>
                            )}
                          </div>
                        </div>

                        {(course.instructor?.email || course.instructor?.phoneNumber) && (
                          <div className="mt-6">
                            <Button
                              onClick={() => setShowInstructorContact(!showInstructorContact)}
                              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium"
                              variant="outline"
                            >
                              <MessageSquare size={18} className="mr-2" />
                              {showInstructorContact ? "Hide Contact" : "See Contact Details"}
                            </Button>
                            {showInstructorContact && (
                              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                                {course.instructor?.email && (
                                  <p className="flex items-center text-sm text-gray-700 mb-2">
                                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                                    <span className="font-medium">Email:</span>
                                    <a
                                      href={`mailto:${course.instructor.email}`}
                                      className="ml-1 text-amber-600 hover:text-amber-800 hover:underline"
                                    >
                                      {course.instructor.email}
                                    </a>
                                  </p>
                                )}
                                {course.instructor?.phoneNumber && (
                                  <p className="flex items-center text-sm text-gray-700">
                                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                                    <span className="font-medium">Phone:</span>
                                    <a
                                      href={`tel:${course.instructor.phoneNumber}`}
                                      className="ml-1 text-amber-600 hover:text-amber-800 hover:underline"
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
                            <h4 className="text-lg font-semibold mb-4">Certifications</h4>
                            <ul className="list-disc pl-5">
                              {course.instructor.educationalDetails.certifications.map((cert, index) => (
                                <li key={index}>
                                  <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
                                    Certification {index + 1}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {course.instructor?.otherCourses && course.instructor.otherCourses.length > 0 && (
                          <div className="mt-6">
                            <h4 className="text-lg font-semibold mb-4">Other Courses by This Instructor</h4>
                            <div className="space-y-4">
                              {course.instructor.otherCourses.map((otherCourse) => (
                                <div
                                  key={otherCourse._id}
                                  className="flex gap-3 cursor-pointer"
                                  onClick={() => navigateToCourse(otherCourse._id)}
                                >
                                  <div className="w-12 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                                    <img
                                      src={otherCourse.image || "/placeholder.svg"}
                                      alt={otherCourse.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <h4 className="font-medium line-clamp-1">{otherCourse.title}</h4>
                                    <div className="flex items-center gap-1 mt-1">
                                      {renderStars(otherCourse.averageRating || 0)}
                                      <span className="text-xs text-gray-500">
                                        {otherCourse.averageRating?.toFixed(1) || "No ratings"}
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
                          className="w-full"
                          onClick={() => navigateToInstructor(course.instructor?._id)}
                          disabled={!course.instructor?._id}
                        >
                          <span className="flex items-center justify-center gap-2">
                            View Instructor Profile
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
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-white sticky top-4">
                <CardHeader>
                  <CardTitle>{t("courseDetails:courseInfo", "Course Info")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>{t("courseDetails:level", "Level")}: {course.level || t("courseDetails:notSpecified", "Not specified")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>{t("courseDetails:duration", "Duration")}: {course.duration || t("courseDetails:notSpecified", "Not specified")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-600" />
                    <span>{t("courseDetails:language", "Language")}: {course.language || t("courseDetails:english", "English")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-600" />
                    <span>{t("courseDetails:rating", "Rating")}: {course.averageRating?.toFixed(1) || "0.0"} ({totalRatings} {t("courseDetails:reviews", "reviews")})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-600" />
                    <span>{t("courseDetails:instructor", "Instructor")}: {course.instructor?.fullName || course.instructor?.userName || t("courseDetails:unknown", "Unknown")}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handlePurchase}
                    disabled={orderLoading}
                    className="w-full bg-amber-600 text-white hover:bg-amber-700"
                  >
                    {orderLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {t("courseDetails:processing", "Processing...")}
                      </span>
                    ) : (
                      course.price > 0 ? (
                        <>{t("courseDetails:enrollFor", "Enroll for")} ${course.price?.toFixed(2) || "0.00"}</>
                      ) : (
                        <>{t("courseDetails:enrollFree", "Enroll Free")}</>
                      )
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {relatedCourses.length > 0 && (
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle>{t("courseDetails:relatedCourses", "Related Courses")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {relatedCourses.map((relatedCourse) => (
                        <div
                          key={relatedCourse._id}
                          className="flex items-center gap-4 cursor-pointer hover:bg-amber-50 p-2 rounded"
                          onClick={() => navigateToCourse(relatedCourse._id)}
                        >
                          <img
                            src={relatedCourse.image || "/placeholder.svg"}
                            alt={relatedCourse.title || "Course"}
                            className="w-12 h-12 rounded-md object-cover"
                          />
                          <div>
                            <h4 className="font-semibold">{relatedCourse.title || "Untitled"}</h4>
                            <div className="flex items-center gap-1">
                              {renderStars(relatedCourse.averageRating)}
                              <span className="text-sm text-gray-500">({relatedCourse.averageRating?.toFixed(1) || "0.0"})</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}