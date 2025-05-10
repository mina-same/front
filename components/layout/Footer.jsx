import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";

const Footer = () => {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language;
  const isRTL = currentLocale === "ar";

  return (
    <section className="py-20">
      <div
        className="container px-4 mx-auto wow animate__animated animate__fadeIn"
        data-wow-delay=".3s"
      >
        <div className="flex flex-wrap mb-12 lg:mb-20 -mx-3 text-center lg:text-right">
          {/* Logo Section */}
          <div className={`w-full lg:w-1/5 px-3 mb-6 lg:mb-0 ${isRTL ? "order-4" : "order-4"}`}>
            <Link
              href="/"
              className={`inline-block ${isRTL ? "lg:ml-auto" : "lg:mr-auto"} text-3xl font-semibold leading-none`}
            >
              <Image
                width="0"
                height="0"
                sizes="100vw"
                style={{ width: "auto", height: "auto" }}
                className="h-10"
                src="/assets/imgs/logos/logo.png"
                alt="Monst"
              />
            </Link>
          </div>

          {/* Main content section */}
          <div className={`w-full lg:w-2/5 px-3 mb-8 lg:mb-0 ${isRTL ? "order-2" : "order-2"}`}>
            <p
              className={`max-w-md mx-auto lg:max-w-full lg:mx-0 ${
                isRTL ? "lg:pl-32" : "lg:pr-32"
              } lg:text-lg text-blueGray-400 leading-relaxed`}
              dangerouslySetInnerHTML={{ __html: t("footer:tagline") }}
            ></p>
          </div>

         

          {/* Contact Section */}
          <div className={`w-full lg:w-1/5 px-3 ${isRTL ? "order-2" : "order-2"}`}>
            <p className="mb-2 lg:mb-4 lg:text-lg font-bold font-heading text-blueGray-800">
              {t("footer:contacts")}
            </p>
            <p className="lg:text-lg text-blueGray-400">{t("footer:phone")}</p>
            <p className="lg:text-lg text-blueGray-400">{t("footer:email")}</p>
          </div>

           {/* Office Section */}
           <div className={`w-full lg:w-1/5 px-3 mb-8 lg:mb-0 ${isRTL ? "order-3" : "order-3"}`}>
            <p className="mb-2 lg:mb-4 lg:text-lg font-bold font-heading text-blueGray-800">
              {t("footer:office")}
            </p>
            <p className="lg:text-lg text-blueGray-400">
              {t("footer:officeAddress")}
            </p>
          </div>
        </div>

        {/* Bottom section */}
        <div className={`flex flex-col lg:flex-row items-center ${isRTL ? "lg:flex-row-reverse" : ""} justify-between`}>
          <p className={`text-sm text-blueGray-400 ${isRTL ? "lg:text-right" : "lg:text-left"}`}>
            &copy; {new Date().getFullYear()}. {t("footer:rights")}{" "}
            <Link style={{ color: "#b28a2f" }} href="https://alithemes.com">
              {t("footer:designer")}
            </Link>
          </p>
          <div className="flex -mx-2 mb-4 lg:mb-0">
            <Link className="inline-block px-2" href="https://facebook.com">
              <Image
                width="0"
                height="0"
                sizes="100vw"
                style={{ width: "auto", height: "auto" }}
                src="/assets/imgs/icons/facebook-blue.svg"
                alt="Facebook"
              />
            </Link>
            <Link className="inline-block px-2" href="https://twitter.com">
              <Image
                width="0"
                height="0"
                sizes="100vw"
                style={{ width: "auto", height: "auto" }}
                src="/assets/imgs/icons/twitter-blue.svg"
                alt="Twitter"
              />
            </Link>
            <Link className="inline-block px-2" href="https://www.instagram.com">
              <Image
                width="0"
                height="0"
                sizes="100vw"
                style={{ width: "auto", height: "auto" }}
                src="/assets/imgs/icons/instagram-blue.svg"
                alt="Instagram"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Footer;
