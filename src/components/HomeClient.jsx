"use client";

import { useTranslation } from "react-i18next";
import CounterUp from "../../components/elements/Counterup";
import TextEffect from "../../components/elements/TextEffect";
import Layout from "../../components/layout/Layout";
import Slider1 from "../../components/slider/Slider1";
import Link from "next/link";
import Image from "next/image";
import { GiHorseHead } from "react-icons/gi";
import { LuHeartHandshake } from "react-icons/lu";
import { RiLineChartLine } from "react-icons/ri";
import { FaBook } from "react-icons/fa";

export default function HomeClient({ locale, statsData }) {
  const { t } = useTranslation(locale);
  const isRTL = locale === "ar";

  return (
    <Layout>
      <section
        className="xl:bg-cover bg-top bg-no-repeat -mt-24 pt-24 sm:pt-28 lg:pt-32"
        style={{
          backgroundImage: "url('assets/imgs/backgrounds/intersect.svg')",
        }}
      >
        <div className="container px-4 mx-auto">
          <div className="pt-8 sm:pt-12 text-center">
            <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl lg:leading-normal mb-4 font-bold font-heading wow animate__animated animate__fadeIn px-2">
                {t("hero.mainTitle")} <br />
                <span className="text-black">{t("hero.subtitlePart1")}</span><br/>
                <span className="text-blue-500">{t("hero.subtitlePart2")}</span>
              </h2>
              <div className="text-sm sm:text-base text-blueGray-400 leading-relaxed wow animate__animated animate__fadeIn d-inline px-4">
                {t("hero.description")}{" "}
                <strong className="text-blue-500">
                  {t("hero.companyName")}
                </strong>
                , {t("hero.partnerText")}{" "}
                <div className="typewrite d-inline text-brand">
                  <TextEffect
                    texts={t("hero.services", { returnObjects: true })}
                    typingSpeed={100}
                    deletingSpeed={50}
                    delayBetweenTexts={2000}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-center items-center">
              <Link
                className="btn-primary py-3 sm:py-4 px-6 sm:px-8 text-center wow animate__animated animate__fadeIn hover-up-2"
                href="#key-features"
              >
                {t("hero.buttons.services")}
              </Link>
              <Link
                className="btn-white py-3 sm:py-4 px-6 sm:px-8 text-center wow animate__animated animate__fadeIn hover-up-2"
                data-wow-delay=".3s"
                href="#how-we-work"
              >
                {t("hero.buttons.howItWorks")}
              </Link>
            </div>
          </div>
        </div>

        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 lg:flex lg:flex-wrap lg:justify-between pt-8 pb-12 sm:pb-16 gap-4 lg:gap-0">
            <div
              className={`hover-up-5 flex flex-row items-center py-4 wow animate__animated animate__fadeIn${isRTL ? ' lg:mr-16' : ''}`}
              data-wow-delay=".2s"
            >
              <div className="flex justify-center items-center bg-blueGray-50 text-blue-500 rounded-xl h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20">
                <GiHorseHead className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
              </div>
              <div className={`py-2 ml-2 sm:ml-6${isRTL ? ' text-right lg:mr-2' : ''}`}
                dir={isRTL ? 'rtl' : 'ltr'}
                style={isRTL ? { fontFamily: "'Tajawal', 'Cairo', 'Amiri', 'Noto Sans Arabic', sans-serif" } : {}}>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold font-heading">+ </span>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold font-heading count counterUp">
                  <CounterUp end={statsData.horses} duration={10} />
                </span>
                <p className="text-xs sm:text-sm lg:text-base text-blueGray-400">
                  {t('stats.horses.title')}
                </p>
              </div>
            </div>
            <div
              className={`hover-up-5 flex flex-row items-center py-4 wow animate__animated animate__fadeIn${isRTL ? ' lg:mr-16' : ''}`}
              data-wow-delay=".4s"
            >
              <div className="flex justify-center items-center bg-blueGray-50 text-blue-500 rounded-xl h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20">
                <LuHeartHandshake className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
              </div>
              <div className={`py-2 ml-2 sm:ml-6${isRTL ? ' text-right lg:mr-2' : ''}`}
                dir={isRTL ? 'rtl' : 'ltr'}
                style={isRTL ? { fontFamily: "'Tajawal', 'Cairo', 'Amiri', 'Noto Sans Arabic', sans-serif" } : {}}>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold font-heading">+ </span>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold font-heading count counterUp">
                  <CounterUp end={statsData.services} duration={10} />
                </span>
                <p className="text-xs sm:text-sm lg:text-base text-blueGray-400">
                  {t('stats.services.title')}
                </p>
              </div>
            </div>
            <div
              className={`hover-up-5 flex flex-row items-center py-4 wow animate__animated animate__fadeIn${isRTL ? ' lg:mr-16' : ''}`}
              data-wow-delay=".6s"
            >
              <div className="flex justify-center items-center bg-blueGray-50 text-blue-500 rounded-xl h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20">
                <RiLineChartLine className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
              </div>
              <div className={`py-2 ml-2 sm:ml-6${isRTL ? ' text-right lg:mr-2' : ''}`}
                dir={isRTL ? 'rtl' : 'ltr'}
                style={isRTL ? { fontFamily: "'Tajawal', 'Cairo', 'Amiri', 'Noto Sans Arabic', sans-serif" } : {}}>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold font-heading">+ </span>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold font-heading count counterUp">
                  <CounterUp end={statsData.products} duration={10} />
                </span>
                <p className="text-xs sm:text-sm lg:text-base text-blueGray-400">
                  {t('stats.products.title')}
                </p>
              </div>
            </div>
            <div
              className={`hover-up-5 flex flex-row items-center py-4 wow animate__animated animate__fadeIn${isRTL ? ' lg:mr-16' : ''}`}
              data-wow-delay=".8s"
            >
              <div className="flex justify-center items-center bg-blueGray-50 text-blue-500 rounded-xl h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20">
                <FaBook className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
              </div>
              <div className={`py-2 ml-2 sm:ml-6${isRTL ? ' text-right lg:mr-2' : ''}`}
                dir={isRTL ? 'rtl' : 'ltr'}
                style={isRTL ? { fontFamily: "'Tajawal', 'Cairo', 'Amiri', 'Noto Sans Arabic', sans-serif" } : {}}>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold font-heading">+ </span>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold font-heading count counterUp">
                  <CounterUp end={statsData.educationalServices} duration={10} />
                </span>
                <p className="text-xs sm:text-sm lg:text-base text-blueGray-400">
                  {t('stats.educationalServices.title')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="pt-8 pb-12 md:py-16 lg:py-16 overflow-x-hidden"
        id="key-features"
      >
        <div className="container px-4 mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-0">
            <div className="w-full lg:w-1/2 order-2 lg:order-1">
              <div
                className={`lg:py-6 lg:pr-8 xl:pr-16 wow animate__animated animate__fadeIn ${
                  isRTL ? "text-right" : "text-left"
                }`}
                data-wow-delay=".3s"
              >
                <div className="mb-6 sm:mb-8">
                  <span
                    className="text-xs py-1 px-3 text-blue-500 font-semibold bg-blue-50 rounded-xl wow animate__animated animate__fadeInDown"
                    data-wow-delay=".9s"
                  >
                    {t("features.title")}
                  </span>
                  <h2
                    className={`text-2xl sm:text-3xl md:text-4xl mt-4 sm:mt-5 font-bold font-heading wow animate__animated animate__fadeIn ${isRTL ? 'text-right' : 'text-left'}`}
                    data-wow-delay=".3s"
                  >
                    {t("features.subtitle")}
                  </h2>
                </div>

                <div
                  className={`flex flex-col sm:flex-row items-start lg:items-start py-4 sm:py-6 wow animate__animated animate__fadeIn ${isRTL ? 'lg:flex-row-reverse' : ''}`}
                  data-wow-delay=".5s"
                >
                  <div className={`w-8 text-blue-500 mb-3 sm:mb-0 flex ${isRTL ? 'justify-end' : 'justify-start'} lg:${isRTL ? 'justify-end' : 'justify-start'} ${isRTL ? 'sm:ml-5 lg:ml-0' : 'sm:mr-5 lg:mr-0'}`}> 
                    <LuHeartHandshake className="w-6 h-6" />
                  </div>
                  <div className={`${isRTL ? 'text-right' : 'text-left'}`}> 
                    <h3 className="mb-2 text-lg sm:text-xl font-semibold font-heading">
                      {t("features.items.expandReach.title")}
                    </h3>
                    <p
                      className={`text-sm sm:text-base text-blueGray-400 leading-loose ${isRTL ? 'lg:pl-12' : 'lg:pr-12'}`}
                    >
                      {t("features.items.expandReach.description")}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex flex-col sm:flex-row items-start lg:items-start py-4 sm:py-6 wow animate__animated animate__fadeIn ${isRTL ? 'lg:flex-row-reverse' : ''}`}
                  data-wow-delay=".7s"
                >
                  <div className={`w-8 text-blue-500 mb-3 sm:mb-0 flex ${isRTL ? 'justify-end' : 'justify-start'} lg:${isRTL ? 'justify-end' : 'justify-start'} ${isRTL ? 'sm:ml-5 lg:ml-0' : 'sm:mr-5 lg:mr-0'}`}> 
                    <GiHorseHead className="w-6 h-6" />
                  </div>
                  <div className={`${isRTL ? 'text-right' : 'text-left'}`}> 
                    <h3 className="mb-2 text-lg sm:text-xl font-semibold font-heading">
                      {t("features.items.horsesNation.title")}
                    </h3>
                    <p
                      className={`text-sm sm:text-base text-blueGray-400 leading-loose ${isRTL ? 'lg:pl-12' : 'lg:pr-12'}`}
                    >
                      {t("features.items.horsesNation.description")}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex flex-col sm:flex-row items-start lg:items-start py-4 sm:py-6 wow animate__animated animate__fadeIn ${isRTL ? 'lg:flex-row-reverse' : ''}`}
                  data-wow-delay=".9s"
                >
                  <div className={`w-8 text-blue-500 mb-3 sm:mb-0 flex ${isRTL ? 'justify-end' : 'justify-start'} lg:${isRTL ? 'justify-end' : 'justify-start'} ${isRTL ? 'sm:ml-5 lg:ml-0' : 'sm:mr-5 lg:mr-0'}`}> 
                    <RiLineChartLine className="w-6 h-6" />
                  </div>
                  <div className={`${isRTL ? 'text-right' : 'text-left'}`}> 
                    <h3 className="mb-2 text-lg sm:text-xl font-semibold font-heading">
                      {t("features.items.elevateSkills.title")}
                    </h3>
                    <p
                      className={`text-sm sm:text-base text-blueGray-400 leading-loose ${isRTL ? 'lg:pl-12' : 'lg:pr-12'}`}
                    >
                      {t("features.items.elevateSkills.description")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative w-full lg:w-1/2 order-1 lg:order-2 my-8 lg:my-0">
              <div
                className="wow animate__animated animate__fadeIn"
                data-wow-delay=".5s"
              >
                <Image
                  width={800}
                  height={600}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                  className={`jump relative mx-auto rounded-xl w-full z-10${isRTL ? ' lg:ml-16' : ''}`}
                  src="/assets/imgs/placeholders/Couple-horses.png"
                  alt="Monst"
                />
                {isRTL ? (
                  <Image
                    width={400}
                    height={400}
                    sizes="(max-width: 768px) 80px, (max-width: 1024px) 120px, 160px"
                    className="absolute top-0 right-0 w-20 sm:w-24 lg:w-32 -mr-6 sm:-mr-8 lg:-mr-12 -mt-6 sm:-mt-8 lg:-mt-12"
                    src="/assets/imgs/elements/blob-tear.svg"
                    alt="Monst"
                  />
                ) : (
                  <Image
                    width={400}
                    height={400}
                    sizes="(max-width: 768px) 80px, (max-width: 1024px) 120px, 160px"
                    className="absolute top-0 left-0 w-20 sm:w-24 lg:w-32 -ml-6 sm:-ml-8 lg:-ml-12 -mt-6 sm:-mt-8 lg:-mt-12"
                    src="/assets/imgs/elements/blob-tear.svg"
                    alt="Monst"
                  />
                )}
                <Image
                  width={400}
                  height={400}
                  sizes="(max-width: 768px) 80px, (max-width: 1024px) 120px, 160px"
                  className={`absolute bottom-0 ${isRTL ? 'left-0' : 'right-0'} w-20 sm:w-24 lg:w-32 -mb-6 sm:-mb-8 lg:-mb-12 ${isRTL ? '-ml-6 sm:-ml-8 lg:-ml-12' : '-mr-6 sm:-mr-8 lg:-mr-12'}`}
                  src="/assets/imgs/elements/blob-tear.svg"
                  alt="Monst"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20 bg-blueGray-50" id="how-we-work">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between max-w-2xl lg:max-w-full mb-8 sm:mb-12 gap-6 lg:gap-0">
            <div
              className={`w-full lg:w-1/2 mb-4 lg:mb-0 ${isRTL ? "text-right" : "text-center lg:text-left"}`}
              dir={isRTL ? "rtl" : "ltr"}
              style={isRTL ? { fontFamily: "'Tajawal', 'Cairo', 'Amiri', 'Noto Sans Arabic', sans-serif" } : {}}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading wow animate__animated animate__fadeInDown">
                <span>{t("welcome.title")}</span>
                <span className="text-blue-500">
                  {" "}
                  {t("welcome.companyName")}
                </span>
                <br />
                <span>{t("welcome.subtitle")}</span>
              </h2>
            </div>
            <div
              className={`w-full lg:w-1/2 ${isRTL ? "text-right" : "text-center lg:text-left"}`}
              dir={isRTL ? "rtl" : "ltr"}
              style={isRTL ? { fontFamily: "'Tajawal', 'Cairo', 'Amiri', 'Noto Sans Arabic', sans-serif" } : {}}
            >
              <p className="text-sm sm:text-base text-blueGray-400 leading-loose wow animate__animated animate__fadeIn">
                {t("welcome.description")}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div
              className="hover-up-5 wow animate__animated animate__fadeIn"
              data-wow-delay=".3s"
            >
              <div className="p-6 sm:p-8 lg:p-12 bg-white shadow rounded">
                <div className="flex w-12 h-12 mx-auto items-center justify-center text-white font-bold font-heading bg-blue-500 rounded-full">
                  1
                </div>
                <Image
                  width={100}
                  height={100}
                  sizes="(max-width: 768px) 80px, (max-width: 1024px) 90px, 100px"
                  className="h-24 sm:h-28 lg:h-36 mx-auto my-4"
                  src="/assets/imgs/illustrations/Equestrian-amico.svg"
                  alt="Workshops"
                />
                <h3 className="mb-2 font-bold font-heading text-lg sm:text-xl">
                  {t("howWeWork.items.workshops.title")}
                </h3>
                <p className="text-xs sm:text-sm text-blueGray-400 leading-relaxed">
                  {t("howWeWork.items.workshops.description")}
                </p>
              </div>
            </div>
            <div
              className="hover-up-5 wow animate__animated animate__fadeIn"
              data-wow-delay=".5s"
            >
              <div className="p-6 sm:p-8 lg:p-12 bg-white shadow rounded">
                <div className="flex w-12 h-12 mx-auto items-center justify-center text-white font-bold font-heading bg-blue-500 rounded-full">
                  2
                </div>
                <Image
                  width={100}
                  height={100}
                  sizes="(max-width: 768px) 80px, (max-width: 1024px) 90px, 100px"
                  className="h-24 sm:h-28 lg:h-36 mx-auto my-4"
                  src="/assets/imgs/illustrations/download.svg"
                  alt="Community"
                />
                <h3 className="mb-2 font-bold font-heading text-lg sm:text-xl">
                  {t("howWeWork.items.community.title")}
                </h3>
                <p className="text-xs sm:text-sm text-blueGray-400 leading-relaxed">
                  {t("howWeWork.items.community.description")}
                </p>
              </div>
            </div>
            <div className="hover-up-5 md:col-span-2 lg:col-span-1">
              <div
                className="p-6 sm:p-8 lg:p-12 bg-white shadow rounded wow animate__animated animate__fadeIn"
                data-wow-delay=".7s"
              >
                <div className="flex w-12 h-12 mx-auto items-center justify-center text-white font-bold font-heading bg-blue-500 rounded-full">
                  3
                </div>
                <Image
                  width={100}
                  height={100}
                  sizes="(max-width: 768px) 80px, (max-width: 1024px) 90px, 100px"
                  className="h-24 sm:h-28 lg:h-36 mx-auto my-4"
                  src="/assets/imgs/illustrations/downloadwd.svg"
                  alt="Resources"
                />
                <h3 className="mb-2 font-bold font-heading text-lg sm:text-xl">
                  {t("howWeWork.items.resources.title")}
                </h3>
                <p className="text-xs sm:text-sm text-blueGray-400 leading-relaxed">
                  {t("howWeWork.items.resources.description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-0">
            <div className="relative w-full lg:w-1/3 mb-8 lg:mb-0 text-center lg:text-left">
              <div
                className={`max-w-md lg:max-w-xs mx-auto mb-6 lg:mb-0 ${
                  isRTL ? "lg:pl-16 lg:mr-0" : ""
                }`}
              >
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl mb-4 font-bold font-heading wow animate__animated animate__fadeIn"
                  data-wow-delay=".3s"
                >
                  {t("empowering.title")}{" "}
                  <span className="text-blue-500">
                    {t("empowering.companyName")}
                  </span>
                  <span> {t("empowering.subtitle")}</span>
                </h2>
                <p
                  className="text-xs sm:text-sm md:text-base text-blueGray-400 leading-loose wow animate__animated animate__fadeIn"
                  data-wow-delay=".9s"
                >
                  {t("empowering.description")}
                </p>
              </div>
            </div>
            <div className="w-full lg:w-2/3 flex flex-wrap">
              <div className="relative w-full">
                <div
                  className="carausel-2-columns slick-carausel"
                  id="carausel-2-columns-1"
                >
                  <Slider1 />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="py-12 sm:py-16 lg:py-20 bg-top bg-no-repeat"
        style={{ backgroundImage: "url('assets/imgs/elements/blob.svg')" }}
      >
        <div className="container px-4 mx-auto">
          <div className="relative py-12 sm:py-16 lg:py-20 px-4 lg:px-20">
            <div className="max-w-lg mx-auto text-center">
              <h2 className="mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold font-heading wow animate__animated animate__fadeIn">
                <span>{t("newsletter.title")} </span>
                <span className="text-blue-500">
                  {t("newsletter.companyName")}
                </span>
                <span> {t("newsletter.subtitle")}</span>
              </h2>
              <p
                className="mb-6 sm:mb-8 text-sm sm:text-base text-blueGray-400 wow animate__animated animate__fadeIn"
                data-wow-delay=".3s"
              >
                {t("newsletter.description")}
              </p>
              <div
                className="p-4 sm:p-6 bg-white rounded-lg flex flex-col sm:flex-row gap-3 sm:gap-0 max-w-md mx-auto wow animate__animated animate__fadeIn"
                data-wow-delay=".5s"
              >
                <div className="flex w-full sm:w-2/3 px-3 py-3 sm:py-4 bg-blueGray-100 rounded">
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6 my-auto text-blueGray-500 flex-shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                  </svg>
                  <input
                    className="w-full pl-3 text-xs sm:text-sm text-blueGray-400 font-semibold leading-none bg-blueGray-100 outline-none"
                    type="text"
                    placeholder={t("newsletter.placeholder")}
                  />
                </div>
                <button
                  className="w-full sm:w-auto py-3 sm:py-4 px-6 sm:px-8 text-xs sm:text-sm text-white font-semibold leading-none bg-blue-400 hover:bg-blue-500 rounded"
                  type="submit"
                >
                  {t("newsletter.button")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

