"use client"; // Ensure this is at the top of the file
import Image from "next/image";
import Link from "next/link";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useTranslation } from "react-i18next";

const Slider1 = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar"; // Check if the language is Arabic

  // Example service data based on your schema
  const services = [
    {
      _id: "1",
      serviceType: "horse_stable",
      name: { en: "Horse Stable", ar: "إسطبل الخيول" },
      image: { asset: { url: "/assets/imgs/placeholders/slider-1.png" } },
      description: { en: "Top-notch horse care.", ar: "رعاية خيول فاخرة." },
      route: "Stables",
    },
    {
      _id: "2",
      serviceType: "veterinary",
      name: { en: "Veterinary Services", ar: "خدمات بيطرية" },
      image: { asset: { url: "/assets/imgs/placeholders/slider-2.png" } },
      description: { en: "Expert horse health care.", ar: "رعاية بيطرية متخصصة." },
      route: "veterinarian",
    },
    {
      _id: "3",
      serviceType: "competitions",
      name: { en: "Horse Competitions", ar: "مسابقات الخيول" },
      image: { asset: { url: "/assets/imgs/placeholders/slider-3.png" } },
      description: { en: "Exciting horse events.", ar: "مسابقات خيول ممتعة." },
      route: "competitions",
    },
    {
      _id: "4",
      serviceType: "housing",
      name: { en: "Horse Housing", ar: "إسكان الخيول" },
      image: { asset: { url: "/assets/imgs/placeholders/slider-4.png" } },
      description: { en: "Secure horse shelters.", ar: "مساكن آمنة للخيول." },
      route: "housing",
    },
    {
      _id: "5",
      serviceType: "trip_coordinator",
      name: { en: "Trip Coordinator", ar: "منسق الرحلات" },
      image: { asset: { url: "/assets/imgs/placeholders/slider-5.png" } },
      description: { en: "Organized horse trips.", ar: "رحلات منظمة للخيول." },
      route: "tripCoordinator",
    },
    {
      _id: "6",
      serviceType: "horse_catering",
      name: { en: "Horse Catering", ar: "خدمات إطعام الخيول" },
      image: { asset: { url: "/assets/imgs/placeholders/slider-6.png" } },
      description: { en: "Quality horse meals.", ar: "وجبات عالية الجودة." },
      route: "horseCatering",
    },
    {
      _id: "7",
      serviceType: "horse_transport",
      name: { en: "Horse Transport", ar: "نقل الخيول" },
      image: { asset: { url: "/assets/imgs/placeholders/slider-7.png" } },
      description: { en: "Safe horse transportation.", ar: "نقل آمن للخيول." },
      route: "horseTransport",
    },
    {
      _id: "8",
      serviceType: "contractors",
      name: { en: "Contractors", ar: "المقاولون" },
      image: { asset: { url: "/assets/imgs/placeholders/7.jpg" } },
      description: { en: "Professional horse facilities.", ar: "مرافق خيول محترفة." },
      route: "contractors",
    },
    {
      _id: "9",
      serviceType: "suppliers",
      name: { en: "Suppliers", ar: "الموردون" },
      image: { asset: { url: "/assets/imgs/placeholders/slider-9.png" } },
      description: { en: "Trusted horse supplies.", ar: "مستلزمات خيول موثوقة." },
      route: "suppliers",
    },
    {
      _id: "10",
      serviceType: "horse_trainer",
      name: { en: "Horse Trainer", ar: "مدرب الخيول" },
      image: { asset: { url: "/assets/imgs/placeholders/slider-10.png" } },
      description: { en: "Experienced horse training.", ar: "تدريب خيول بخبرة." },
      route: "horseTrainer",
    },
    {
      _id: "11",
      serviceType: "hoof_trimmer",
      name: { en: "Hoof Trimmer", ar: "مقلم الأظافر" },
      image: { asset: { url: "/assets/imgs/placeholders/slider-11.png" } },
      description: { en: "Professional hoof care.", ar: "رعاية أظافر محترفة." },
      route: "hoofTrimmer",
    },
  ];

  return (
    <>
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        breakpoints={{
          768: {
            width: 768,
            slidesPerView: 2,
          },
        }}
        slidesPerView={1}
        spaceBetween={30}
        navigation={{
          prevEl: isRTL ? ".custom_next" : ".custom_prev", // Swap arrows for RTL
          nextEl: isRTL ? ".custom_prev" : ".custom_next", // Swap arrows for RTL
        }}
        dir={isRTL ? "rtl" : "ltr"} // Set Swiper direction based on language
      >
        {services.map((service) => (
          <SwiperSlide key={service._id}>
            <div className={`px-3 pb-5 ${isRTL ? "text-right" : "text-left"}`}>
              <div className="card-slider group">
                <Image
                  width="0"
                  height="0"
                  sizes="100vw"
                  style={{ width: "auto", height: "auto" }}
                  className="rounded-xl"
                  src={service.image.asset.url}
                  alt={service.name[i18n.language]}
                />
                <div className="flex justify-between items-end">
                  <div>
                    <h1 className="mt-5 text-sm font-semibold group-hover:text-blue-500">
                      <Link href={`/${service.route}`} legacyBehavior>
                        <a>{service.name[i18n.language]}</a>
                      </Link>
                    </h1>
                    <p className="mt-2 text-xs text-gray-500">
                      {service.description[i18n.language]}
                    </p>
                  </div>
                  <div>
                    <Link href={`/${service.route}`} legacyBehavior>
                      <a
                        className={`tracking-wide hover-up-2 inline-block px-4 py-3 text-xs text-blue-500 font-semibold leading-none border border-blue-200 hover:border-blue-500 hover:text-white hover:bg-blue-500 rounded ${
                          isRTL ? "ml-2" : "mr-2"
                        }`}
                      >
                        {i18n.language === "ar" ? "انظر التفاصيل" : "View details"}
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div
        id="carausel-2-columns-1-arrows"
        className="flex"
        style={{ direction: isRTL ? "rtl" : "ltr" , justifyContent:  isRTL ? "flex-end" : "flex-start" }} // Set direction for the arrows container
      >
        <span
          className={`text-blue-500 flex slick-arrow ${
            isRTL ? "custom_next" : "custom_prev"
          }`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16l-4-4m0 0l4-4m-4 4h18"
            ></path>
          </svg>
        </span>
        <span
          className={`text-blue-500 flex slick-arrow ${
            isRTL ? "custom_prev" : "custom_next"
          }`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            ></path>
          </svg>
        </span>
      </div>
    </>
  );
};

export default Slider1;
