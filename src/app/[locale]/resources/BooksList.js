  "use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Star, Book, User, Heart, Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { client } from "../../../lib/sanity";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

const mockBooks = [];

export default function BooksList({ viewMode, searchQuery }) {
  const [books, setBooks] = useState(mockBooks);
  const [loading, setLoading] = useState(true);
  const [hoveredBook, setHoveredBook] = useState(null);
  const [wishlist, setWishlist] = useState({});
  const [wishlistLoading, setWishlistLoading] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          if (response.status === 401) {
            console.log("User not authenticated, setting currentUserId to null");
            setCurrentUserId(null);
            return;
          }
          throw new Error(`Verify API failed with status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Verify API response:", data);
        if (data.authenticated) {
          const userId = data.userId || data.user?.id || data.user?.userId || data.user?._id;
          if (!userId) {
            console.error("No valid user ID found in response:", data);
            setCurrentUserId(null);
            return;
          }
          setCurrentUserId(userId);
        } else {
          console.log("User not authenticated in response:", data);
          setCurrentUserId(null);
        }
      } catch (error) {
        console.error("Error verifying user:", error.message);
        setCurrentUserId(null);
      }
    };

    const fetchData = async () => {
      try {
        // Fetch user's wishlistBooks if authenticated
        if (currentUserId) {
          const userQuery = `*[_type == "user" && _id == $userId][0]{wishlistBooks[]->{_id}}`;
          const userData = await client.fetch(userQuery, { userId: currentUserId });
          console.log("Wishlist data:", userData);
          const wishlistBooks = userData?.wishlistBooks || [];
          const wishlistMap = wishlistBooks.reduce((acc, book) => {
            acc[book._id] = true;
            return acc;
          }, {});
          setWishlist(wishlistMap);
        }

        // Fetch books
        const query = `*[_type == "book"] {
          _id,
          title,
          description,
          price,
          averageRating,
          ratingCount,
          language,
          category,
          accessLink,
          file,
          ratings,
          author->{_id, fullName},
          "images": images[]{
            "_key": _key,
            "asset": {
              "_ref": asset._ref,
              "url": asset->url
            }
          }
        }`;

        const sanityBooks = await client.fetch(query);
        const processedSanityBooks = sanityBooks.map((book) => {
          const processedImages = book.images?.map((img) => ({
            asset: {
              _ref: img.asset?._ref,
              url: img.asset?.url || "/placeholder.svg",
            },
          })) || [];
          return {
            ...book,
            images: processedImages.length > 0 ? processedImages : [{ asset: { url: "/placeholder.svg" } }],
          };
        });

        console.log("Fetched books from Sanity:", processedSanityBooks);
        setBooks([...mockBooks, ...processedSanityBooks]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    verifyUser().then(() => {
      fetchData();
    });
  }, [router, currentUserId]);

  const handleWishlistToggle = async (bookId, e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("Wishlist toggle for book:", bookId, "Current wishlist state:", wishlist[bookId]);

    if (!currentUserId) {
      console.log("No user ID, redirecting to login");
      toast.error(
        <div>
          You must be logged in to manage your wishlist.{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Log in here
          </a>
        </div>
      );
      router.push("/login");
      return;
    }

    if (!bookId) {
      console.error("Invalid bookId:", bookId);
      toast.error("Invalid book. Please try again.");
      return;
    }

    setWishlistLoading((prev) => ({ ...prev, [bookId]: true }));

    try {
      // Fetch current wishlist to find the book reference
      const userQuery = `*[_type == "user" && _id == $userId][0]{wishlistBooks}`;
      const userData = await client.fetch(userQuery, { userId: currentUserId });
      const wishlistBooks = userData?.wishlistBooks || [];

      if (wishlist[bookId]) {
        // Remove from wishlist
        const index = wishlistBooks.findIndex((item) => item._ref === bookId);
        if (index === -1) {
          console.warn("Book not found in wishlist:", bookId);
          toast.error("Book not found in wishlist.");
          return;
        }
        await client
          .patch(currentUserId)
          .unset([`wishlistBooks[${index}]`])
          .commit();
        setWishlist((prev) => {
          const newWishlist = { ...prev };
          delete newWishlist[bookId];
          toast.success("Removed from wishlist");
          console.log("Updated wishlist after removal:", newWishlist);
          return newWishlist;
        });
      } else {
        // Add to wishlist
        const wishlistItem = {
          _key: uuidv4(),
          _type: "reference",
          _ref: bookId,
        };
        await client
          .patch(currentUserId)
          .setIfMissing({ wishlistBooks: [] })
          .append("wishlistBooks", [wishlistItem])
          .commit();
        setWishlist((prev) => {
          const newWishlist = { ...prev, [bookId]: true };
          toast.success("Added to wishlist");
          console.log("Updated wishlist after addition:", newWishlist);
          return newWishlist;
        });
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("Failed to update wishlist. Please try again.");
    } finally {
      setWishlistLoading((prev) => ({ ...prev, [bookId]: false }));
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
        />
      );
    }
    return <div className="flex">{stars}</div>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37]"></div>
      </div>
    );
  }

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredBooks.length === 0) {
    return (
      <div className="text-center py-16">
        <Book className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No books found</h3>
        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className={`${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-6"}`}>
      {filteredBooks.map((book) => (
        <Card
          key={book._id}
          className={`relative transition-all hover:shadow-lg ${
            viewMode === "list" ? "flex flex-col md:flex-row" : ""
          }`}
          onMouseEnter={() => {
            console.log("Hovering card:", book._id);
            setHoveredBook(book._id);
          }}
          onMouseLeave={() => {
            console.log("Leaving card:", book._id);
            setHoveredBook(null);
          }}
        >
          <Link href={`/books/view/${book._id}`} className="block cursor-pointer">
            <div
              className={`${
                viewMode === "list" ? "w-full md:w-1/3 h-48 md:h-auto relative" : "aspect-[3/4] relative"
              } z-10`}
            >
              <Image
                fill
                src={book.images?.[0]?.asset?.url || "/placeholder.svg"}
                alt={book.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-[#d4af37] text-white text-xs px-2 py-1 rounded">
                Book
              </div>
            </div>
            <div className={`flex flex-col ${viewMode === "list" ? "md:w-2/3" : ""}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg line-clamp-2">{book.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center space-x-1">{renderStars(book.averageRating || 0)}</div>
                      <span className="text-sm text-gray-500">({book.ratingCount || 0})</span>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-[#d4af37]">${book.price || 0}</div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">{book.description}</p>
                <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {book.author?.fullName || "Unknown Author"}
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{book.language || "English"}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 mt-auto">
                <Button className="w-full" variant="outline">
                  View Book
                </Button>
              </CardFooter>
            </div>
          </Link>
          <div
            className={`absolute top-3 right-3 flex flex-col gap-3 transition-all duration-300 ${
              hoveredBook === book._id ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
            } z-20`}
          >
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => handleWishlistToggle(book._id, e)}
              className={`p-2.5 rounded-full shadow-lg bg-white transition-all duration-300 hover:scale-110 ${
                wishlist[book._id]
                  ? "bg-red-50 text-red-500 border-red-500 hover:bg-red-100 hover:text-red-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-red-50 hover:text-red-500 hover:border-red-500"
              } ${wishlistLoading[book._id] ? "opacity-50 cursor-not-allowed" : ""}`}
              title="Add to Wishlist"
              disabled={wishlistLoading[book._id]}
            >
              {wishlistLoading[book._id] ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Heart className={`w-6 h-6 ${wishlist[book._id] ? "fill-current" : ""}`} />
                  {console.log("Rendering Heart for book:", book._id, "Wishlist:", wishlist[book._id])}
                </>
              )}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}