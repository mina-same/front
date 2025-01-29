import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { client, urlFor } from "../../src/lib/sanity";
import userFallbackImage from "../../public/assets/imgs/elements/user.png";

const Header = ({ handleHidden }) => {
  const router = useRouter();
  const [scroll, setScroll] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.addEventListener("scroll", () => {
      const scrollCheck = window.scrollY > 100;
      if (scrollCheck !== scroll) {
        setScroll(scrollCheck);
      }
    });
  });

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        if (data.authenticated) {
          setIsAuthenticated(true);
          setUserId(data.user.id);

          // Fetch user data after setting userId
          const fetchUserData = async () => {
            try {
              const query = `*[_type == "user" && _id == $userId]{
                image
              }[0]`;
              const params = { userId: data.user.id }; // Use data.user.id directly
              const userData = await client.fetch(query, params);

              if (!userData) {
                throw new Error("User not found.");
              }

              setUserImage(userData.image);

              // Update state with user data (e.g., setUserImage(userData.image))
            } catch (err) {
              console.error("Error fetching user data:", err);
              setError("Failed to load profile data.");
            }
          };

          await fetchUserData(); // Call fetchUserData after setting userId
        }
      } catch (error) {
        console.error("Error verifying user:", error);
        setError("Authentication failed.");
      } finally {
        setIsLoading(false);
      }
    };

    verifyUser();
  }, [client]); // Add dependencies if needed (e.g., client)

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        // Clear local state
        setIsAuthenticated(false);
        setUserId(null);
        setUserImage(null);

        // Redirect to home page
        router.push("/");

        // Force a full page refresh
        window.location.reload();
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <>
      <header
        className={
          scroll
            ? "bg-transparent sticky-bar mt-4 stick"
            : "bg-transparent sticky-bar mt-4"
        }
      >
        <div className="container bg-transparent">
          <nav className="bg-transparent flex justify-between items-center py-3">
            <Link href="/" className="text-3xl font-semibold leading-none">
              <Image
                className="h-10"
                src="/assets/imgs/logos/logohorse.svg"
                alt="Monst"
                width={125}
                height={40}
              />
            </Link>

            <ul className="hidden lg:flex lg:items-center lg:w-auto lg:space-x-12">
              {/* home */}
              <li className="pt-4 pb-4">
                <Link
                  href="/"
                  className="text-sm font-semibold text-blueGray-600 hover:text-blueGray-500"
                >
                  Home
                </Link>
              </li>

              {/* Stables */}
              <li className="pt-4 pb-4">
                <Link
                  href="/Stables"
                  className="text-sm font-semibold text-blueGray-600 hover:text-blueGray-500"
                >
                  Stables
                </Link>
              </li>

              {/* competitions   */}
              <li className="group relative pt-4 pb-4">
                <Link
                  href="/competitions"
                  className="text-sm font-semibold text-blueGray-600 hover:text-blueGray-500"
                >
                  competitions
                </Link>
              </li>

              {/* Trips */}
              <li className="group relative pt-4 pb-4">
                <Link
                  href="/tripCoordinator"
                  className="text-sm font-semibold text-blueGray-600 hover:text-blueGray-500"
                >
                  Trips
                </Link>
              </li>

              {/* Bublic Services */}
              <li className="group relative pt-4 pb-4 has-child">
                <Link
                  href="/publicServices"
                  className="text-sm font-semibold text-blueGray-600 hover:text-blueGray-500"
                >
                  Public Services
                </Link>
                <ul className="drop-down-menu min-w-200">
                  <li>
                    <Link
                      href="/veterinarian"
                      className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                    >
                      Veterinarian
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/housing"
                      className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                    >
                      Housing
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/horseTrainer"
                      className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                    >
                      horse trainer
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/horseTrimmer"
                      className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                    >
                      horse hoof trimmer - FARRIER
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/horseTransport"
                      className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                    >
                      Horse transport
                    </Link>
                  </li>
                </ul>
              </li>

              {/* publicMarket */}
              <li className="group relative pt-4 pb-4 has-child">
                <Link
                  href="publicMarket"
                  className="text-sm font-semibold text-blueGray-600 hover:text-blueGray-500"
                >
                  Public market
                </Link>
                <ul className="drop-down-menu min-w-200">
                  <li>
                    <Link
                      href="/contractors"
                      className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                    >
                      Contractors
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/suppliers"
                      className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                    >
                      Suppliers
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/horseCatering"
                      className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                    >
                      Horse Catering Services
                    </Link>
                  </li>
                </ul>
              </li>

              {/* contact */}
              <li className="pt-4 pb-4">
                <Link
                  href="/contact"
                  className="text-sm font-semibold text-blueGray-600 hover:text-blueGray-500"
                >
                  Contact
                </Link>
              </li>
            </ul>

            <div className="hidden lg:block">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden cursor-pointer">
                    <Image
                      src={
                        userImage ? urlFor(userImage).url() : userFallbackImage
                      }
                      alt="User profile"
                      width={40}
                      height={40}
                      className="object-cover w-full h-full rounded-full cursor-pointer"
                      onClick={() => router.push("/profile")}
                    />
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn-primary hover-up-2"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="hidden lg:block">
                  <Link href="/login" className="btn-accent hover-up-2">
                    Log In
                  </Link>
                  <Link href="/signup" className="btn-primary hover-up-2">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
            <div className="lg:hidden">
              <button
                className="navbar-burger flex items-center py-2 px-3 text-[#b28a2f] hover:text-[#b28a2f] rounded border border-blue-200 hover:border-blue-300"
                onClick={handleHidden}
              >
                <svg
                  className="fill-current h-4 w-4"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Mobile menu</title>
                  <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
                </svg>
              </button>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;
