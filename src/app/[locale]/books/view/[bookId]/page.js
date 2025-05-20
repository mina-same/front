"use client";
import { useEffect, useState } from "react";
import Image from 'next/image';
import { useParams, useRouter } from "next/navigation";
import {
    Book,
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
    Users,
    Mail,
    Phone,
    MessageSquareOff
} from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../../../../components/ui/card";
import { Badge } from "../../../../../components/ui/badge";
import { Button } from "../../../../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { Alert, AlertDescription } from "../../../../../components/ui/alert";
import { Progress } from "../../../../../components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import ResourceNotFound from "../../../../../../components/shared/ResourceNotFound";
import { client } from "../../../../../lib/sanity";
import Layout from "components/layout/Layout";
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

export default function BookDetails() {
    const { bookId } = useParams();
    const router = useRouter();
    const [book, setBook] = useState(null);
    const [relatedBooks, setRelatedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [orderLoading, setOrderLoading] = useState(false);
    const [activeImage, setActiveImage] = useState(0);
    const [activeTab, setActiveTab] = useState("overview");
    const [currentUserId, setCurrentUserId] = useState(null);
    const [userRating, setUserRating] = useState(0);
    const [userComment, setUserComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alert, setAlert] = useState({ isVisible: false, message: "", type: "error" });
    const [showAuthorContact, setShowAuthorContact] = useState(false);
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
        const fetchBookAndOrder = async () => {
            try {
                console.log("Fetching book with ID:", bookId);

                const bookQuery = `*[_type == "book" && _id == $bookId][0]{
                    _id,
                    title,
                    description,
                    price,
                    averageRating,
                    ratingCount,
                    language,
                    category,
                    accessLink,
                    file {
                        asset->{
                            url
                        }
                    },
                    ratings,
                    publishDate,
                    pageCount,
                    author->{
                        _id,
                        fullName,
                        userName,
                        email,
                        phoneNumber,
                        bio,
                        "image": image.asset->url,
                        "otherBooks": *[_type == "book" && author._ref == ^._id && _id != $bookId][0...3]{
                            _id,
                            title,
                            "image": images[0].asset->url,
                            averageRating
                        }
                    },
                    "images": images[]{
                        "_key": _key,
                        "asset": {
                            "_ref": asset._ref,
                            "url": asset->url
                        }
                    },
                    orders
                }`;

                const relatedBooksQuery = `*[_type == "book" && category == $category && _id != $bookId][0...3]{
                    _id,
                    title,
                    "image": images[0].asset->url,
                    averageRating
                }`;

                const orderQuery = `*[_type == "orderBook" && user._ref == $userId && book._ref == $bookId][0]{
                    _id,
                    status,
                    paymentStatus,
                    price
                }`;

                const sanityBook = await client.fetch(bookQuery, { bookId });
                console.log("Fetched book data:", sanityBook);

                if (sanityBook) {
                    setBook(sanityBook);
                    const related = await client.fetch(relatedBooksQuery, {
                        category: sanityBook.category,
                        bookId
                    });
                    setRelatedBooks(related);

                    if (currentUserId) {
                        const userOrderData = await client.fetch(orderQuery, {
                            userId: currentUserId,
                            bookId
                        });

                        setUserOrder(userOrderData);
                        setHasPurchased(userOrderData?.status === "completed" && userOrderData?.paymentStatus === "paid");
                    }
                }
            } catch (error) {
                console.error("Error fetching book or order:", error);
            } finally {
                setLoading(false);
            }
        };

        if (bookId) {
            fetchBookAndOrder();
        }
    }, [bookId, currentUserId]);

    const handlePurchase = async () => {
        if (!book || !bookId || !currentUserId) {
            showAlert(
                <>You must be logged in to purchase this book.{" "}
                    <Link href="/login" className="text-red-700 hover:underline">
                        Log in here
                    </Link>
                </>,
                "error"
            );
            return;
        }

        setOrderLoading(true);
        try {
            const orderData = {
                _type: "orderBook",
                user: { _type: "reference", _ref: currentUserId },
                book: { _type: "reference", _ref: bookId },
                orderDate: new Date().toISOString(),
                status: "pending",
                price: book.price || 0,
                paymentStatus: "pending",
            };

            const order = await client.create(orderData);
            const orderId = order._id;

            await client
                .patch(bookId)
                .setIfMissing({ orders: [] })
                .append("orders", [{ _type: "reference", _ref: orderId }])
                .commit();

            if (book.price === 0) {
                await client
                    .patch(orderId)
                    .set({ status: "completed", paymentStatus: "paid" })
                    .commit();
                setHasPurchased(true);
                setUserOrder({ ...order, status: "completed", paymentStatus: "paid" });
                showAlert("Book ordered successfully! You can now access the materials.", "success");
            } else {
                showAlert("Order created! Please complete payment on the orders page.", "success");
                router.push("/profile?tab=orders");
            }
        } catch (error) {
            console.error("Error purchasing book:", error);
            showAlert(`Failed to purchase book: ${error.message}`, "error");
        } finally {
            setOrderLoading(false);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator
                .share({
                    title: `Book: ${book.title}`,
                    text: `Check out this book: ${book.title} by ${book.author?.fullName || book.author?.name || "Unknown Author"}`,
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
            showAlert("You must be logged in to rate this book", "error");
            setIsSubmitting(false);
            return;
        }
        if (userRating < 1 || userRating > 5) {
            showAlert("Please select a rating between 1 and 5", "error");
            setIsSubmitting(false);
            return;
        }

        const existingRating = book.ratings?.some((r) => r.user?._id === currentUserId);
        if (existingRating) {
            showAlert("You have already rated this book", "error");
            setIsSubmitting(false);
            return;
        }

        const ratingData = {
            _type: "bookRating",
            book: { _type: "reference", _ref: bookId },
            user: { _type: "reference", _ref: currentUserId },
            value: userRating,
            message: userComment || undefined,
            date: new Date().toISOString(),
        };

        try {
            await client.create(ratingData);

            const updatedBook = await client.fetch(
                `*[_type == "book" && _id == $bookId][0]{
                    ratings
                }`,
                { bookId }
            );

            const totalRatings = updatedBook.ratings?.length || 0;
            const sumRatings = updatedBook.ratings?.reduce((sum, r) => sum + r.value, 0) || 0;
            const newAverageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

            await client
                .patch(bookId)
                .set({
                    averageRating: newAverageRating,
                    ratingCount: totalRatings,
                })
                .commit();

            setBook({
                ...book,
                ratings: updatedBook.ratings,
                averageRating: newAverageRating,
                ratingCount: totalRatings,
            });
            setUserRating(0);
            setUserComment("");
            showAlert("Rating submitted successfully!", "success");
        } catch (error) {
            console.error("Error submitting rating:", error);
            showAlert(`Failed to submit rating: ${error.message}`, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const showAlert = (message, type = "error") => {
        setAlert({ isVisible: true, message, type });
        setTimeout(() => setAlert({ isVisible: false, message: "", type: "error" }), 3000);
    };

    const renderStars = (rating, interactive = false) => {
        const fullStars = Math.floor(rating);
        const decimalPart = rating - fullStars;
        const stars = [];

        for (let i = 1; i <= fullStars; i++) {
            stars.push(
                <Star
                    key={i}
                    size={20}
                    className={`cursor-${interactive ? "pointer" : "default"} text-[#d4af37] fill-[#d4af37]`}
                    onClick={interactive ? () => setUserRating(i) : null}
                />
            );
        }

        if (decimalPart > 0 && fullStars < 5) {
            stars.push(
                <div key="partial" className="relative inline-block">
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
                    key={i}
                    size={20}
                    className={`cursor-${interactive ? "pointer" : "default"} text-[#e5e7eb]`}
                    onClick={interactive ? () => setUserRating(i) : null}
                />
            );
        }

        return <div className="flex">{stars}</div>;
    };

    const getButtonProps = () => {
        if (!userOrder) {
            return {
                text: book.price > 0 ? `Purchase for $${book.price.toFixed(2)}` : (
                    <span className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Download Free
                    </span>
                ),
                onClick: handlePurchase,
                disabled: orderLoading,
                show: true
            };
        }

        if (userOrder.status === "pending" && userOrder.paymentStatus === "pending") {
            return {
                text: "Continue Payment",
                onClick: () => router.push("/profile?tab=orders"),
                disabled: false,
                show: true
            };
        }

        if (userOrder.status === "completed" && userOrder.paymentStatus === "paid") {
            return {
                text: "Access Materials",
                onClick: () => router.push("/profile?tab=orders"),
                disabled: false,
                show: true
            };
        }

        return {
            text: book.price > 0 ? `Purchase for $${book.price.toFixed(2)}` : (
                <span className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download Free
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
                <p className="mt-4 text-[#1f2937] font-medium">Loading book details...</p>
            </div>
        );
    }

    if (!book) {
        return <ResourceNotFound type="book" />;
    }

    const defaultImage = book.images?.[0]?.asset?.url || "/placeholder.svg";
    const buttonProps = getButtonProps();

    const ratingDistribution = [0, 0, 0, 0, 0];
    if (book.ratings && book.ratings.length > 0) {
        book.ratings.forEach((rating) => {
            const value = Math.min(Math.max(Math.floor(rating.value), 1), 5);
            ratingDistribution[5 - value]++;
        });
    }

    const totalRatings = book.ratingCount || book.ratings?.length || 0;

    const isValidUrl = (url) => {
        if (!url || typeof url !== "string") return false;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-white">
                <AlertNotification
                    message={alert.message}
                    isVisible={alert.isVisible}
                    onClose={() => setAlert({ isVisible: false, message: "", type: "error" })}
                    type={alert.type}
                />

                <div className="bg-gradient-to-r from-[#b28a2f] to-[#d4af37] text-white">
                    <div className="container mx-auto px-4 py-12">
                        <div className="flex flex-row md:flex-row gap-8 items-center">
                            <div className="w-full md:w-1/3 flex justify-center">
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-[#d4af37] to-[#b28a2f] rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                                    <div className="relative aspect-[2/3] w-64 overflow-hidden rounded-lg shadow-xl border border-[#fef3c7]">
                                        <Image
                                            src={book.images?.[activeImage]?.asset?.url || defaultImage}
                                            alt={book.title}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                                            width={256}
                                            height={384}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-2/3 space-y-6">
                                <div>
                                    <Badge className="mb-2 bg-[#fef3c7] text-[#1f2937] hover:bg-[#d4af37] hover:text-white transition-colors">
                                        {book.category || "Uncategorized"}
                                    </Badge>
                                    <h1 className="text-4xl font-bold tracking-tight">{book.title}</h1>
                                    <p className="text-xl text-[#fef3c7] mt-2">
                                        By {book.author?.fullName || book.author?.name || "Unknown Author"}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                        {renderStars(book.averageRating || 0)}
                                        <span className="ml-2 text-[#fef3c7]">{book.averageRating?.toFixed(1) || "No ratings"}</span>
                                    </div>
                                    <div className="text-[#fef3c7]">
                                        {totalRatings} {totalRatings === 1 ? "review" : "reviews"}
                                    </div>
                                </div>

                                <p className="text-[#fef3c7] line-clamp-3">{book.description}</p>

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
                                                    Processing...
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
                                        <Share2 className="w-4 h-4 mr-2" /> Share
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {book.images && book.images.length > 1 && (
                    <div className="container mx-auto px-4 py-4 bg-[#f5f5f5]">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {book.images.map((image, index) => (
                                <button
                                    key={image._key || index}
                                    onClick={() => setActiveImage(index)}
                                    className={`flex-shrink-0 w-16 h-24 rounded-md overflow-hidden border-2 transition-all ${activeImage === index ? "border-[#b28a2f] shadow-md" : "border-transparent opacity-70 hover:opacity-100"}`}
                                >
                                    <Image
                                        src={book.images?.[activeImage]?.asset?.url || defaultImage}
                                        alt={`${book.title} - Image ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        width={256}
                                        height={384}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
                                <TabsList className="grid grid-cols-4 mb-6 bg-[#f5f5f5] rounded-lg p-1">
                                    <TabsTrigger value="overview" className="text-[#1f2937] data-[state=active]:bg-[#b28a2f] data-[state=active]:text-white rounded-md transition-colors">Overview</TabsTrigger>
                                    <TabsTrigger value="details" className="text-[#1f2937] data-[state=active]:bg-[#b28a2f] data-[state=active]:text-white rounded-md transition-colors">Details</TabsTrigger>
                                    <TabsTrigger value="reviews" className="text-[#1f2937] data-[state=active]:bg-[#b28a2f] data-[state=active]:text-white rounded-md transition-colors">Reviews</TabsTrigger>
                                    <TabsTrigger value="author" className="text-[#1f2937] data-[state=active]:bg-[#b28a2f] data-[state=active]:text-white rounded-md transition-colors">Author</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="space-y-6">
                                    <Card className="bg-white border-[#e5e7eb] shadow-md hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-[#1f2937]">
                                                <BookOpen className="w-5 h-5 text-[#b28a2f]" />
                                                About This Book
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-[#1f2937] leading-relaxed whitespace-pre-line">{book.description}</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-white border-[#e5e7eb] shadow-md hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-[#1f2937]">
                                                <Star className="w-5 h-5 text-[#b28a2f]" />
                                                Highlights
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="flex items-start gap-3">
                                                    <div className="bg-[#fef3c7] p-2 rounded-full text-[#b28a2f]">
                                                        <Book className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-[#1f2937]">Format</h4>
                                                        <p className="text-[#1f2937]">
                                                            {book.file ? "Digital PDF / Online Access" : book.accessLink ? "Online Access" : "Not specified"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <div className="bg-[#fef3c7] p-2 rounded-full text-[#b28a2f]">
                                                        <Globe className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-[#1f2937]">Language</h4>
                                                        <p className="text-[#1f2937]">{book.language || "English"}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <div className="bg-[#fef3c7] p-2 rounded-full text-[#b28a2f]">
                                                        <User className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-[#1f2937]">Author</h4>
                                                        <p className="text-[#1f2937]">{book.author?.fullName || book.author?.name || "Unknown"}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <div className="bg-[#fef3c7] p-2 rounded-full text-[#b28a2f]">
                                                        <Calendar className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-[#1f2937]">Published</h4>
                                                        <p className="text-[#1f2937]">{book.publishDate || "Not specified"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {(book.file?.asset?.url || book.accessLink) && (
                                        <Card className="bg-white border-[#e5e7eb] shadow-md hover:shadow-lg transition-shadow">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-[#1f2937]">
                                                    <Book className="w-5 h-5 text-[#b28a2f]" />
                                                    Book Materials
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {hasPurchased ? (
                                                    <div className="space-y-4">
                                                        {book.file?.asset?.url ? (
                                                            <a
                                                                href={book.file.asset.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                download
                                                                className="w-full flex items-center justify-center bg-gradient-to-r from-[#b28a2f] to-[#d4af37] hover:from-[#d4af37] hover:to-[#b28a2f] text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-[#e5e7eb] disabled:cursor-not-allowed"
                                                                onClick={(e) => {
                                                                    if (!book.file?.asset?.url || !isValidUrl(book.file.asset.url)) {
                                                                        e.preventDefault();
                                                                        showAlert("Download link is invalid or unavailable. Please try again later.", "error");
                                                                    } else {
                                                                        console.log("Attempting to download file:", book.file.asset.url);
                                                                        window.open(book.file.asset.url, "_blank", "noopener,noreferrer");
                                                                    }
                                                                }}
                                                                disabled={!book.file?.asset?.url || !isValidUrl(String(book.file.asset.url))}
                                                            >
                                                                <Download className="w-4 h-4 mr-2" />
                                                                Download Book (PDF/ePub)
                                                            </a>
                                                        ) : (
                                                            <Alert className="bg-[#fef3c7] border-[#d4af37] text-[#1f2937]">
                                                                <AlertDescription className="flex items-center gap-2">
                                                                    <Lock className="w-4 h-4 text-[#b28a2f]" />
                                                                    No downloadable file available for this book.
                                                                </AlertDescription>
                                                            </Alert>
                                                        )}
                                                        {book.accessLink ? (
                                                            <a
                                                                href={book.accessLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="w-full flex items-center justify-center bg-gradient-to-r from-[#b28a2f] to-[#d4af37] hover:from-[#d4af37] hover:to-[#b28a2f] text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-[#e5e7eb] disabled:cursor-not-allowed"
                                                                onClick={(e) => {
                                                                    if (!book.accessLink || !isValidUrl(book.accessLink)) {
                                                                        e.preventDefault();
                                                                        showAlert("Online access link is invalid or unavailable. Please try again later.", "error");
                                                                    } else {
                                                                        console.log("Attempting to open access link:", book.accessLink);
                                                                        window.open(book.accessLink, "_blank", "noopener,noreferrer");
                                                                    }
                                                                }}
                                                                disabled={!book.accessLink || !isValidUrl(String(book.accessLink))}
                                                            >
                                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                                Access Online
                                                            </a>
                                                        ) : (
                                                            <Alert className="bg-[#fef3c7] border-[#d4af37] text-[#1f2937]">
                                                                <AlertDescription className="flex items-center gap-2">
                                                                    <Lock className="w-4 h-4 text-[#b28a2f]" />
                                                                    No online access link available for this book.
                                                                </AlertDescription>
                                                            </Alert>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <Alert className="bg-[#fef3c7] border-[#d4af37] text-[#1f2937]">
                                                        <AlertDescription className="flex items-center gap-2">
                                                            <Lock className="w-4 h-4 text-[#b28a2f]" />
                                                            {book.price > 0 ? (
                                                                "Purchase this book to access its full content and downloadable materials."
                                                            ) : (
                                                                <>
                                                                    Click{" "}
                                                                    <a href="#" onClick={handlePurchase} className="text-[#b28a2f] hover:underline">
                                                                        &apos;Download Free&apos;
                                                                    </a>{" "}
                                                                    to access this book.
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
                                                <Book className="w-5 h-5 text-[#b28a2f]" />
                                                Book Specifications
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
                                                <div>
                                                    <h4 className="text-sm font-medium text-[#1f2937]/70">Title</h4>
                                                    <p className="text-[#1f2937] font-medium">{book.title}</p>
                                                </div>

                                                <div>
                                                    <h4 className="text-sm font-medium text-[#1f2937]/70">Author</h4>
                                                    <p className="text-[#1f2937] font-medium">{book.author?.fullName || book.author?.name || "Unknown"}</p>
                                                </div>

                                                <div>
                                                    <h4 className="text-sm font-medium text-[#1f2937]/70">Category</h4>
                                                    <Badge variant="outline" className="mt-1 bg-[#fef3c7] text-[#1f2937] border-[#d4af37] hover:bg-[#d4af37] hover:text-white">{book.category || "Uncategorized"}</Badge>
                                                </div>

                                                <div>
                                                    <h4 className="text-sm font-medium text-[#1f2937]/70">Language</h4>
                                                    <p className="text-[#1f2937] font-medium">{book.language || "English"}</p>
                                                </div>

                                                <div>
                                                    <h4 className="text-sm font-medium text-[#1f2937]/70">Pages</h4>
                                                    <p className="text-[#1f2937] font-medium">{book.pageCount || "Not specified"}</p>
                                                </div>

                                                <div>
                                                    <h4 className="text-sm font-medium text-[#1f2937]/70">Publication Date</h4>
                                                    <p className="text-[#1f2937] font-medium">{book.publishDate || "Not specified"}</p>
                                                </div>

                                                <div>
                                                    <h4 className="text-sm font-medium text-[#1f2937]/70">Format</h4>
                                                    <div className="flex gap-2 mt-1">
                                                        {book.file && (
                                                            <Badge variant="outline" className="bg-[#fef3c7] text-[#1f2937] hover:bg-[#d4af37] hover:text-white border-[#d4af37]">
                                                                PDF
                                                            </Badge>
                                                        )}
                                                        {book.accessLink && (
                                                            <Badge variant="outline" className="bg-[#fef3c7] text-[#1f2937] hover:bg-[#d4af37] hover:text-white border-[#d4af37]">
                                                                Online Access
                                                            </Badge>
                                                        )}
                                                        {!book.file && !book.accessLink && (
                                                            <span className="text-[#1f2937]/70">Not specified</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-sm font-medium text-[#1f2937]/70">Price</h4>
                                                    <p className="text-[#1f2937] font-medium">
                                                        {book.price > 0 ? `$${book.price.toFixed(2)}` : "Free"}
                                                    </p>
                                                </div>
                                            </div>

                                            {book.price > 0 && !hasPurchased && (
                                                <Alert className="mt-8 bg-[#fef3c7] border-[#d4af37] text-[#1f2937]">
                                                    <AlertDescription className="flex items-center gap-2">
                                                        <Lock className="w-4 h-4 text-[#b28a2f]" />
                                                        Purchase this book to access its full content and downloadable materials.
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
                                                Reader Reviews
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {book.ratings && book.ratings.length > 0 ? (
                                                <div>
                                                    <div className="flex flex-col lg:flex-row gap-8 mb-8">
                                                        <div className="flex flex-col items-center justify-center text-center">
                                                            <div className="text-5xl font-bold text-[#b28a2f]">
                                                                {book.averageRating?.toFixed(1) || "0.0"}
                                                            </div>
                                                            <div className="mt-2">{renderStars(book.averageRating || 0)}</div>
                                                            <div className="mt-1 text-[#1f2937]/70">
                                                                {totalRatings} {totalRatings === 1 ? "review" : "reviews"}
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
                                                            Rate This Book
                                                        </h4>
                                                        <form onSubmit={handleRatingSubmit}>
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                                                                <div className="flex items-center bg-white py-2 px-3 rounded-md border border-[#e5e7eb] shadow-sm">
                                                                    {renderStars(userRating, true)}
                                                                    <span className="ml-2 text-sm text-[#1f2937] min-w-20">
                                                                        {userRating ? `${userRating}/5` : "Select a rating"}
                                                                    </span>
                                                                </div>
                                                                <span className="text-xs text-[#1f2937]/70">Click to rate</span>
                                                            </div>
                                                            <div className="relative mb-4">
                                                                <textarea
                                                                    value={userComment}
                                                                    onChange={(e) => setUserComment(e.target.value)}
                                                                    placeholder="Leave a comment"
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
                                                                {isSubmitting ? "Submitting..." : "Submit Rating"}
                                                            </Button>
                                                        </form>
                                                    </div>

                                                    <div className="space-y-6 mt-8">
                                                        {book.ratings.map((rating, index) => (
                                                            <div
                                                                key={rating._key || index}
                                                                className="border-b border-[#e5e7eb] last:border-0 pb-6 last:pb-0 bg-[#fef3c7]/50 p-4 rounded-md"
                                                            >
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div>
                                                                        <div className="font-medium text-[#1f2937]">
                                                                            {rating.user?.userName || rating.user?.name || "Anonymous Reader"}
                                                                        </div>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            {renderStars(rating.value)}
                                                                            <span className="text-sm text-[#1f2937]/70">
                                                                                {rating.date ? new Date(rating.date).toLocaleDateString() : "No date"}
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
                                                    <h3 className="text-lg font-medium text-[#1f2937] mb-2">No Reviews Yet</h3>
                                                    <p className="text-[#1f2937]/70 max-w-md mx-auto">
                                                        Be the first to review this book and share your thoughts with other readers.
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="author" className="space-y-6">
                                    <Card className="bg-white border-[#e5e7eb] shadow-md hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-[#1f2937]">
                                                <User className="w-5 h-5 text-[#b28a2f]" />
                                                About the Author
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                                {book.author?.image && (
                                                    <div className="flex justify-center">
                                                        <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-[#d4af37] shadow-md">
                                                            <Image
                                                                src={book.author.image}
                                                                alt={book.author?.fullName || book.author?.name}
                                                                className="w-full h-full object-cover"
                                                                width={128}
                                                                height={128}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <div className={`flex flex-col justify-center w-full ${book.author?.image ? "md:w-3/4" : ""}`}>
                                                    <h3 className="text-xl font-semibold text-[#1f2937] mb-2">
                                                        {book.author?.fullName || book.author?.name || "Unknown Author"}
                                                    </h3>
                                                    {book.author?.userName && (
                                                        <p className="text-[#1f2937]/70 mb-2">@{book.author.userName}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {(book.author?.email || book.author?.phoneNumber) && (
                                                <div className="mt-6">
                                                    <Button
                                                        onClick={() => setShowAuthorContact(!showAuthorContact)}
                                                        className="w-full bg-[#fef3c7] hover:bg-[#d4af37] text-[#1f2937] hover:text-white font-medium border border-[#d4af37] transition-colors"
                                                        variant="outline"
                                                    >
                                                        <MessageSquare size={18} className="mr-2" />
                                                        {showAuthorContact ? "Hide Contact" : "See Contact Details"}
                                                    </Button>
                                                    {showAuthorContact && (
                                                        <div className="mt-4 p-4 bg-[#fef3c7] rounded-lg border border-[#d4af37] shadow-sm">
                                                            {book.author?.email && (
                                                                <p className="flex items-center text-sm text-[#1f2937] mb-2">
                                                                    <Mail className="w-4 h-4 mr-2 text-[#b28a2f]" />
                                                                    <span className="font-medium">Email:</span>
                                                                    <a
                                                                        href={`mailto:${book.author.email}`}
                                                                        className="ml-1 text-[#b28a2f] hover:text-[#d4af37] hover:underline"
                                                                    >
                                                                        {book.author.email}
                                                                    </a>
                                                                </p>
                                                            )}
                                                            {book.author?.phoneNumber && (
                                                                <p className="flex items-center text-sm text-[#1f2937]">
                                                                    <Phone className="w-4 h-4 mr-2 text-[#b28a2f]" />
                                                                    <span className="font-medium">Phone:</span>
                                                                    <a
                                                                        href={`tel:${book.author.phoneNumber}`}
                                                                        className="ml-1 text-[#b28a2f] hover:text-[#d4af37] hover:underline"
                                                                    >
                                                                        {book.author.phoneNumber}
                                                                    </a>
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {book.author?.otherBooks && book.author.otherBooks.length > 0 && (
                                                <div className="mt-6">
                                                    <h4 className="text-lg font-semibold text-[#1f2937] mb-4">Other Books by This Author</h4>
                                                    <div className="space-y-4">
                                                        {book.author.otherBooks.map((otherBook) => (
                                                            <div
                                                                key={otherBook._id}
                                                                className="flex gap-3 cursor-pointer hover:bg-[#fef3c7] p-2 rounded-md transition-colors"
                                                                onClick={() => router.push(`/books/${otherBook._id}`)}
                                                            >
                                                                <div className="w-12 h-16 bg-[#e5e7eb] rounded flex-shrink-0 overflow-hidden">
                                    <Image
                                        src={otherBook.image || "/placeholder.svg"}
                                        alt={otherBook.title}
                                        className="w-full h-full object-cover"
                                        width={48}
                                        height={64}
                                    />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-medium text-[#1f2937] line-clamp-1">{otherBook.title}</h4>
                                                                    <div className="flex items-center gap-1 mt-1">
                                                                        {renderStars(otherBook.averageRating || 0)}
                                                                        <span className="text-xs text-[#1f2937]/70">
                                                                            {otherBook.averageRating?.toFixed(1) || "No ratings"}
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
                                                onClick={() => router.push(`/authors/${book.author?._id}`)}
                                            >
                                                <span className="flex items-center justify-center gap-2">
                                                    View Author Profile
                                                    <ChevronRight className="w-4 h-4" />
                                                </span>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>

                        <div className="space-y-6">
                            <Card className="border-[#e5e7eb] bg-white overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                                <div className="bg-gradient-to-r from-[#b28a2f] to-[#d4af37] px-6 py-4">
                                    <h3 className="text-xl font-semibold text-white">Get This Book</h3>
                                </div>

                                <CardContent className="pt-6">
                                    <div className="mb-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[#1f2937]">Price:</span>
                                            <span className="text-2xl font-bold text-[#b28a2f]">
                                                {book.price > 0 ? `$${book.price.toFixed(2)}` : "Free"}
                                            </span>
                                        </div>

                                        {book.price > 0 && (
                                            <div className="text-sm text-[#b28a2f] flex items-center gap-1 justify-end mb-4">
                                                <Lock className="w-3 h-3" />
                                                Secure payment
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
                                                    Processing...
                                                </span>
                                            ) : (
                                                buttonProps.text
                                            )}
                                        </Button>
                                    )}

                                    {book.price > 0 && (
                                        <div className="mt-4 flex flex-col gap-3">
                                            <div className="flex items-center gap-2 text-[#1f2937]">
                                                <div className="w-5 h-5 rounded-full bg-[#fef3c7] flex items-center justify-center">
                                                    <CheckIcon className="w-3 h-3 text-[#b28a2f]" />
                                                </div>
                                                Instant digital access
                                            </div>
                                            <div className="flex items-center gap-2 text-[#1f2937]">
                                                <div className="w-5 h-5 rounded-full bg-[#fef3c7] flex items-center justify-center">
                                                    <CheckIcon className="w-3 h-3 text-[#b28a2f]" />
                                                </div>
                                                {book.file ? "Downloadable PDF included" : "Online access"}
                                            </div>
                                            <div className="flex items-center gap-2 text-[#1f2937]">
                                                <div className="w-5 h-5 rounded-full bg-[#fef3c7] flex items-center justify-center">
                                                    <CheckIcon className="w-3 h-3 text-[#b28a2f]" />
                                                </div>
                                                Secure payment
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="bg-white border-[#e5e7eb] shadow-md hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="text-lg text-[#1f2937]">Related Books</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {relatedBooks.length > 0 ? (
                                        relatedBooks.map((relatedBook) => (
                                            <div
                                                key={relatedBook._id}
                                                className="flex gap-3 cursor-pointer hover:bg-[#fef3c7] p-2 rounded-md transition-colors"
                                                onClick={() => router.push(`/books/${relatedBook._id}`)}
                                            >
                                                <div className="w-12 h-16 bg-[#e5e7eb] rounded flex-shrink-0 overflow-hidden">
                                                    <Image
                                                        width={48}
                                                        height={64}
                                                        src={relatedBook.image || "/placeholder.svg"}
                                                        alt={relatedBook.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-[#1f2937] line-clamp-1">{relatedBook.title}</h4>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {renderStars(relatedBook.averageRating || 0)}
                                                        <span className="text-xs text-[#1f2937]/70">
                                                            {relatedBook.averageRating?.toFixed(1) || "No ratings"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-[#1f2937]/70 text-sm">No related books found.</p>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        variant="ghost"
                                        className="w-full text-[#b28a2f] hover:text-[#d4af37] hover:bg-[#fef3c7]"
                                        onClick={() => router.push(`/books?category=${book.category}`)}
                                    >
                                        View All Related Books
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

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
