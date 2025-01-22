"use client"; // Ensure this is at the top of the file
import Image from "next/image";
import Link from "next/link";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const Slider1 = () => {
  // Example service data based on your schema
  const services = [
    {
      _id: "1",
      serviceType: "horse_stable",
      name_en: "Horse Stable",
      name_ar: "إسطبل الخيول",
      image: { asset: { url: "/assets/imgs/placeholders/slider-1.png" } },
      description_en: "Top-notch horse care.",
      description_ar: "رعاية خيول فاخرة.",
    },
    {
      _id: "2",
      serviceType: "veterinary",
      name_en: "Veterinary Services",
      name_ar: "خدمات بيطرية",
      image: { asset: { url: "/assets/imgs/placeholders/slider-2.png" } },
      description_en: "Expert horse health care.",
      description_ar: "رعاية بيطرية متخصصة.",
    },
    {
      _id: "3",
      serviceType: "competitions",
      name_en: "Horse Competitions",
      name_ar: "مسابقات الخيول",
      image: { asset: { url: "/assets/imgs/placeholders/slider-3.png" } },
      description_en: "Exciting horse events.",
      description_ar: "مسابقات خيول ممتعة.",
    },
    {
      _id: "4",
      serviceType: "housing",
      name_en: "Horse Housing",
      name_ar: "إسكان الخيول",
      image: { asset: { url: "/assets/imgs/placeholders/slider-4.png" } },
      description_en: "Secure horse shelters.",
      description_ar: "مساكن آمنة للخيول.",
    },
    {
      _id: "5",
      serviceType: "trip_coordinator",
      name_en: "Trip Coordinator",
      name_ar: "منسق الرحلات",
      image: { asset: { url: "/assets/imgs/placeholders/slider-5.png" } },
      description_en: "Organized horse trips.",
      description_ar: "رحلات منظمة للخيول.",
    },
    {
      _id: "6",
      serviceType: "horse_catering",
      name_en: "Horse Catering",
      name_ar: "خدمات إطعام الخيول",
      image: { asset: { url: "/assets/imgs/placeholders/slider-6.png" } },
      description_en: "Quality horse meals.",
      description_ar: "وجبات عالية الجودة.",
    },
    {
      _id: "7",
      serviceType: "horse_transport",
      name_en: "Horse Transport",
      name_ar: "نقل الخيول",
      image: { asset: { url: "/assets/imgs/placeholders/slider-7.png" } },
      description_en: "Safe horse transportation.",
      description_ar: "نقل آمن للخيول.",
    },
    {
      _id: "8",
      serviceType: "contractors",
      name_en: "Contractors",
      name_ar: "المقاولون",
      image: { asset: { url: "/assets/imgs/placeholders/7.jpg" } },
      description_en: "Professional horse facilities.",
      description_ar: "مرافق خيول محترفة.",
    },
    {
      _id: "9",
      serviceType: "suppliers",
      name_en: "Suppliers",
      name_ar: "الموردون",
      image: { asset: { url: "/assets/imgs/placeholders/slider-9.png" } },
      description_en: "Trusted horse supplies.",
      description_ar: "مستلزمات خيول موثوقة.",
    },
    {
      _id: "10",
      serviceType: "horse_trainer",
      name_en: "Horse Trainer",
      name_ar: "مدرب الخيول",
      image: { asset: { url: "/assets/imgs/placeholders/slider-10.png" } },
      description_en: "Experienced horse training.",
      description_ar: "تدريب خيول بخبرة.",
    },
    {
      _id: "11",
      serviceType: "hoof_trimmer",
      name_en: "Hoof Trimmer",
      name_ar: "مقلم الأظافر",
      image: { asset: { url: "/assets/imgs/placeholders/slider-11.png" } },
      description_en: "Professional hoof care.",
      description_ar: "رعاية أظافر محترفة.",
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
          prevEl: ".custom_prev",
          nextEl: ".custom_next",
        }}
      >
        {services.map((service) => (
          <SwiperSlide key={service._id}>
            <div className="px-3 pb-5">
              <div className="card-slider group">
                <Image
                  width="0"
                  height="0"
                  sizes="100vw"
                  style={{ width: "auto", height: "auto" }}
                  className="rounded-xl"
                  src={service.image.asset.url}
                  alt={service.name_en}
                />
                <div className="flex justify-between items-end">
                  <div>
                    <h1 className="mt-5 text-sm font-semibold group-hover:text-blue-500">
                      <Link href={`/services/${service._id}`} legacyBehavior>
                        <a>{service.name_en}</a>
                      </Link>
                    </h1>
                    <p className="mt-2 text-xs text-gray-500">
                      {service.description_en}
                    </p>
                  </div>
                  <div>
                    <Link
                      href={`/services/${service._id}`}
                      legacyBehavior
                    >
                      <a className="tracking-wide hover-up-2 mr-2 inline-block px-4 py-3 text-xs text-blue-500 font-semibold leading-none border border-blue-200 hover:border-blue-500 hover:text-white hover:bg-blue-500 rounded">
                        View Details
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div id="carausel-2-columns-1-arrows" className="flex">
        <span className="mr-4 text-blue-500 flex slick-arrow custom_prev">
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
        <span className="text-blue-500 flex slick-arrow custom_next">
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
