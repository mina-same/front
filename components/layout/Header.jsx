import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

const Header = ({ handleHidden }) => {
  const [scroll, setScroll] = useState(0);
  useEffect(() => {
    document.addEventListener("scroll", () => {
      const scrollCheck = window.scrollY > 100;
      if (scrollCheck !== scroll) {
        setScroll(scrollCheck);
      }
    });
  });
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
              <li className="group relative pt-4 pb-4 has-child">
                <Link
                  href="/"
                  className="text-sm font-semibold text-blueGray-600 hover:text-blueGray-500"
                >
                  Home
                </Link>
                <ul className="drop-down-menu min-w-200">
                  <li>
                    <Link
                      href="/"
                      className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                    >
                      Landing page 1
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/index-2"
                      className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                    >
                      Landing page 2
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/index-3"
                      className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                    >
                      Landing page 3
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/index-4"
                      className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                    >
                      Landing page 4
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/index-5"
                      className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                    >
                      Landing page 5
                    </Link>
                  </li>
                </ul>
              </li>
              <li className="pt-4 pb-4">
                <Link
                  href="/about"
                  className="text-sm font-semibold text-blueGray-600 hover:text-blueGray-500"
                >
                  About Us
                </Link>
              </li>
              <li className="pt-4 pb-4">
                <Link
                  href="/services"
                  className="text-sm font-semibold text-blueGray-600 hover:text-blueGray-500"
                >
                  Services
                </Link>
              </li>
              <li className="group relative pt-4 pb-4 has-child">
                <Link
                  href="#"
                  className="text-sm font-semibold text-blueGray-600 hover:text-blueGray-500"
                >
                  Company
                </Link>
                <ul className="drop-down-menu min-w-200">
                  <li>
                    <Link
                      href="/portfolio"
                      className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                    >
                      Portfolio
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/team"
                      className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                    >
                      Team
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/testimonials"
                      className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                    >
                      Testimonials
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/pricing"
                      className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                    >
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faqs"
                      className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                    >
                      Faqs
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/404"
                      className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                    >
                      404
                    </Link>
                  </li>
                </ul>
              </li>
              <li className="group relative pt-4 pb-4 has-child">
                <Link
                  href="#"
                  className="text-sm font-semibold text-blueGray-600 hover:text-blueGray-500"
                >
                  Blog
                </Link>
                <ul className="drop-down-menu min-w-200">
                  <li>
                    <Link
                      href="/blog"
                      className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                    >
                      Category 1
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/blog-2"
                      className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                    >
                      Category 2
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/blog-single"
                      className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                    >
                      Single 1
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/blog-single-2"
                      className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                    >
                      Single 2
                    </Link>
                  </li>
                </ul>
              </li>
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
              <Link
                href="/login"
                className="btn-accent hover-up-2"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="btn-primary hover-up-2"
              >
                Sign Up
              </Link>
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
