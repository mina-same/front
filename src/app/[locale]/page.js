'use client'

import { useTranslation } from 'react-i18next';
import CounterUp from "../../../components/elements/Counterup";
import TextEffect from "../../../components/elements/TextEffect";
import Layout from "../../../components/layout/Layout";
import Slider1 from "../../../components/slider/Slider1";
import Link from 'next/link';
import Image from "next/image";
import { GiHorseHead } from "react-icons/gi";
import { LuHeartHandshake } from "react-icons/lu";
import { RiLineChartLine } from "react-icons/ri";
import { useEffect, useState } from 'react';

function Home({ params }) {
	const { t, i18n } = useTranslation();
	const [inViewport, setInViewport] = useState(false);
	const isRTL = i18n.language === 'ar';

	const handleScroll = () => {
		const elements = document.getElementsByClassName("counterUp");
		if (elements.length > 0) {
			const element = elements[0];
			const rect = element.getBoundingClientRect();
			const isInViewport = rect.top >= 0 && rect.bottom <= window.innerHeight;
			if (isInViewport && !inViewport) {
				setInViewport(true);
			}
		}
	};

	useEffect(() => {
		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	useEffect(() => {
		document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
	}, [isRTL]);

	return (
		<Layout>
			<section className="xl:bg-contain bg-top bg-no-repeat -mt-24 pt-24" style={{ backgroundImage: "url('assets/imgs/backgrounds/intersect.svg')" }}>
				<div className="container px-4 mx-auto">
					<div className="pt-12 text-center">
						<div className="max-w-2xl mx-auto mb-8">
							<h2 className="text-3xl lg:text-5xl lg:leading-normal mb-4 font-bold font-heading wow animate__animated animate__fadeIn">
								{t('hero.mainTitle')} <br />
								<span className="text-black">{t('hero.subtitlePart1')}</span>
								<span className="text-blue-500">{t('hero.subtitlePart2')}</span>
							</h2>
							<div className="text-blueGray-400 leading-relaxed wow animate__animated animate__fadeIn d-inline">
								{t('hero.description')} <strong className="text-blue-500">{t('hero.companyName')}</strong>, {t('hero.partnerText')}{" "}
								<div className="typewrite d-inline text-brand">
									<TextEffect
										texts={t('hero.services', { returnObjects: true })}
										typingSpeed={100}
										deletingSpeed={50}
										delayBetweenTexts={2000}
									/>
								</div>
							</div>
						</div>
						<div>
							<Link className="btn-primary py-4 px-8 mr-2 wow animate__animated animate__fadeIn hover-up-2" href="#key-features">
								{t('hero.buttons.services')}
							</Link>
							<Link className="btn-white wow animate__animated animate__fadeIn hover-up-2" data-wow-delay=".3s" href="#how-we-work">
								{t('hero.buttons.howItWorks')}
							</Link>
						</div>
					</div>	
				</div>

				<div className="container px-4 mx-auto">
					<div className="flex flex-wrap justify-between pt-8 pb-16">
						<div className="hover-up-5 flex w-1/2 lg:w-auto py-4 wow animate__animated animate__fadeIn" data-wow-delay=".2s">
							<div className="flex justify-center items-center bg-blueGray-50 text-blue-500 rounded-xl h-12 w-12 sm:h-20 sm:w-20">
								<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
								</svg>
							</div>
							<div className="sm:py-2 ml-2 sm:ml-6">
								<span className="sm:text-2xl font-bold font-heading">+ </span>
								<span className="sm:text-2xl font-bold font-heading count counterUp">
									{inViewport && <CounterUp end={parseInt(t('stats.annualPartner.count'))} duration={10} />}
								</span>
								<p className="text-xs sm:text-base text-blueGray-400">{t('stats.annualPartner.title')}</p>
							</div>
						</div>
						<div className="hover-up-5 flex w-1/2 lg:w-auto py-4 wow animate__animated animate__fadeIn" data-wow-delay=".4s">
							<div className="flex justify-center items-center bg-blueGray-50 text-blue-500 rounded-xl h-12 w-12 sm:h-20 sm:w-20">
								<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
								</svg>
							</div>
							<div className="sm:py-2 ml-2 sm:ml-6">
								<span className="sm:text-2xl font-bold font-heading">+ </span>
								<span className="sm:text-2xl font-bold font-heading count counterUp">
									{inViewport && <CounterUp end={parseInt(t('stats.completedProjects.count'))} duration={10} />}
								</span>
								<span className="sm:text-2xl font-bold font-heading"> k </span>
								<p className="text-xs sm:text-base text-blueGray-400">{t('stats.completedProjects.title')}</p>
							</div>
						</div>
						<div className="hover-up-5 flex w-1/2 lg:w-auto py-4 wow animate__animated animate__fadeIn" data-wow-delay=".6s">
							<div className="flex justify-center items-center bg-blueGray-50 text-blue-500 rounded-xl h-12 w-12 sm:h-20 sm:w-20">
								<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
								</svg>
							</div>
							<div className="sm:py-2 ml-2 sm:ml-6">
								<span className="sm:text-2xl font-bold font-heading">+ </span>
								<span className="sm:text-2xl font-bold font-heading count counterUp">
									{inViewport && <CounterUp end={parseInt(t('stats.happyCustomers.count'))} duration={10} />}
								</span>
								<p className="text-xs sm:text-base text-blueGray-400">{t('stats.happyCustomers.title')}</p>
							</div>
						</div>
						<div className="hover-up-5 flex w-1/2 lg:w-auto py-4 wow animate__animated animate__fadeIn" data-wow-delay=".8s">
							<div className="flex justify-center items-center bg-blueGray-50 text-blue-500 rounded-xl h-12 w-12 sm:h-20 sm:w-20">
								<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
								</svg>
							</div>
							<div className="sm:py-2 ml-2 sm:ml-6">
								<span className="sm:text-2xl font-bold font-heading">+ </span>
								<span className="sm:text-2xl font-bold font-heading count counterUp">
									{inViewport && <CounterUp end={parseInt(t('stats.researchWork.count'))} duration={10} />}
								</span>
								<p className="text-xs sm:text-base text-blueGray-400">{t('stats.researchWork.title')}</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="pt-8 pb-12 md:py-16 lg:py-16 overflow-x-hidden" id="key-features">
				<div className="container px-4 mx-auto">
					<div className="flex flex-wrap lg:flex-nowrap">
						<div className="w-full lg:w-1/2">
							<div className="lg:py-6 lg:pr-77 wow animate__animated animate__fadeIn" data-wow-delay=".3s">
								<div className="mb-4">
									<span className="text-xs py-1 px-3 text-blue-500 font-semibold bg-blue-50 rounded-xl wow animate__animated animate__fadeInDown" data-wow-delay=".9s">
										{t('features.title')}
									</span>
									<h2 className="text-4xl mt-5 font-bold font-heading wow animate__animated animate__fadeIn" data-wow-delay=".3s">
										{t('features.subtitle')}
									</h2>
								</div>

								<div className="flex items-start py-4 wow animate__animated animate__fadeIn" data-wow-delay=".5s">
									<div className="w-8 mr-5 text-blue-500">
										<LuHeartHandshake className="w-6 h-6" />
									</div>
									<div>
										<h3 className="mb-2 text-xl font-semibold font-heading">{t('features.items.expandReach.title')}</h3>
										<p className={`text-blueGray-400 leading-loose ${isRTL ? 'pl-12' : 'pr-12'}`}>
											{t('features.items.expandReach.description')}
										</p>
									</div>
								</div>

								<div className="flex items-start py-4 wow animate__animated animate__fadeIn" data-wow-delay=".7s">
									<div className="w-8 mr-5 text-blue-500">
										<GiHorseHead className="w-6 h-6" />
									</div>
									<div>
										<h3 className="mb-2 text-xl font-semibold font-heading">{t('features.items.horsesNation.title')}</h3>
										<p className="text-blueGray-400 leading-loose ${isRTL ? 'pl-12' : 'pr-12'}">{t('features.items.horsesNation.description')}</p>
									</div>
								</div>

								<div className="flex items-start py-4 wow animate__animated animate__fadeIn" data-wow-delay=".9s">
									<div className="w-8 mr-5 text-blue-500">
										<RiLineChartLine className="w-6 h-6" />
									</div>
									<div>
										<h3 className="mb-2 text-xl font-semibold font-heading">{t('features.items.elevateSkills.title')}</h3>
										<p className="text-blueGray-400 leading-loose ${isRTL ? 'pl-12' : 'pr-12'}">{t('features.items.elevateSkills.description')}</p>
									</div>
								</div>
							</div>
						</div>
						<div className="relative w-full lg:w-1/2 my-12 lg:my-0">
							<div className="wow animate__animated animate__fadeIn" data-wow-delay=".5s">
								<Image
									width="0"
									height="0"
									sizes="100vw"
									style={{ width: "80", height: "600" }} className="jump relative mx-auto rounded-xl w-full z-10" src="/assets/imgs/placeholders/Couple-horses.png" alt="Monst" />
								<Image
									width="0"
									height="0"
									sizes="100vw"
									style={{ width: "auto", height: "auto" }} className="absolute top-0 left-0 w-40 -ml-12 -mt-12" src="/assets/imgs/elements/blob-tear.svg" alt="Monst" />
								<Image
									width="0"
									height="0"
									sizes="100vw"
									style={{ width: "auto", height: "auto" }} className="absolute bottom-0 right-0 w-40 -mr-12 -mb-12" src="/assets/imgs/elements/blob-tear.svg" alt="Monst" />
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="py-20 bg-blueGray-50" id="how-we-work">
				<div className="container px-4 mx-auto">
					<div className="flex flex-wrap items-center justify-between max-w-2xl lg:max-w-full mb-12">
						<div className="w-full lg:w-1/2 mb-4 lg:mb-0">
							<h2 className="text-3xl md:text-4xl font-bold font-heading wow animate__animated animate__fadeInDown">
								<span>{t('welcome.title')}</span>
								<span className="text-blue-500"> {t('welcome.companyName')}</span>
								<br />
								<span>{t('welcome.subtitle')}</span>
							</h2>
						</div>
						<div className="w-full lg:w-1/2">
							<p className="text-blueGray-400 leading-loose wow animate__animated animate__fadeIn">
								{t('welcome.description')}
							</p>
						</div>
					</div>
					<div className="flex flex-wrap -mx-3 -mb-6 text-center">
						<div className="hover-up-5 w-full md:w-1/2 lg:w-1/3 px-3 mb-6 wow animate__animated animate__fadeIn" data-wow-delay=".3s">
							<div className="p-12 bg-white shadow rounded">
								<div className="flex w-12 h-12 mx-auto items-center justify-center text-white font-bold font-heading bg-blue-500 rounded-full">1</div>
								<Image
									width="0"
									height="0"
									sizes="100vw"
									style={{ width: "auto", height: "auto" }}
									className="h-36 mx-auto my-4"
									src="/assets/imgs/illustrations/Equestrian-amico.svg"
									alt="Workshops" />
								<h3 className="mb-2 font-bold font-heading text-xl">{t('howWeWork.items.workshops.title')}</h3>
								<p className="text-sm text-blueGray-400 leading-relaxed">
									{t('howWeWork.items.workshops.description')}
								</p>
							</div>
						</div>
						<div className="hover-up-5 w-full md:w-1/2 lg:w-1/3 px-3 mb-6 wow animate__animated animate__fadeIn" data-wow-delay=".5s">
							<div className="p-12 bg-white shadow rounded">
								<div className="flex w-12 h-12 mx-auto items-center justify-center text-white font-bold font-heading bg-blue-500 rounded-full">2</div>
								<Image
									width="0"
									height="0"
									sizes="100vw"
									style={{ width: "auto", height: "auto" }}
									className="h-36 mx-auto my-4"
									src="/assets/imgs/illustrations/download.svg"
									alt="Community" />
								<h3 className="mb-2 font-bold font-heading text-xl">{t('howWeWork.items.community.title')}</h3>
								<p className="text-sm text-blueGray-400 leading-relaxed">
									{t('howWeWork.items.community.description')}
								</p>
							</div>
						</div>
						<div className="hover-up-5 w-full lg:w-1/3 px-3 mb-6">
							<div className="p-12 bg-white shadow rounded wow animate__animated animate__fadeIn" data-wow-delay=".7s">
								<div className="flex w-12 h-12 mx-auto items-center justify-center text-white font-bold font-heading bg-blue-500 rounded-full">3</div>
								<Image
									width="0"
									height="0"
									sizes="100vw"
									style={{ width: "auto", height: "auto" }}
									className="h-36 mx-auto my-4"
									src="/assets/imgs/illustrations/downloadwd.svg"
									alt="Resources" />
								<h3 className="mb-2 font-bold font-heading text-xl">{t('howWeWork.items.resources.title')}</h3>
								<p className="text-sm text-blueGray-400 leading-relaxed">
									{t('howWeWork.items.resources.description')}
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="py-12 md:py-20">
				<div className="container px-4 mx-auto">
					<div className="flex flex-wrap -mx-3">
						<div className="relative w-full lg:w-1/3 mb-8 lg:mb-0 text-center lg:text-left">
							<div
								className={`max-w-md lg:max-w-xs mx-auto mb-6 lg:mb-0 ${isRTL ? 'lg:pl-16 lg:mr-0' : 'lg:pr-16 lg:ml-0'
									}`}
							>
								<h2
									className="text-3xl md:text-4xl mb-4 font-bold font-heading wow animate__animated animate__fadeIn"
									data-wow-delay=".3s"
								>
									{t('empowering.title')} <span className="text-blue-500">{t('empowering.companyName')}</span>
									<span> {t('empowering.subtitle')}</span>
								</h2>
								<p
									className="text-xs md:text-base text-blueGray-400 leading-loose wow animate__animated animate__fadeIn"
									data-wow-delay=".9s"
								>
									{t('empowering.description')}
								</p>
							</div>
						</div>
						<div className="w-full lg:w-2/3 flex flex-wrap">
							<div className="relative w-full">
								<div className="carausel-2-columns slick-carausel" id="carausel-2-columns-1">
									<Slider1 />
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="py-20 bg-top bg-no-repeat" style={{ backgroundImage: "url('assets/imgs/elements/blob.svg')" }}>
				<div className="container px-4 mx-auto">
					<div className="relative py-20 px-4 lg:p-20">
						<div className="max-w-lg mx-auto text-center">
							<h2 className="mb-4 text-3xl lg:text-4xl font-bold font-heading wow animate__animated animate__fadeIn">
								<span>{t('newsletter.title')} </span>
								<span className="text-blue-500">{t('newsletter.companyName')}</span>
								<span> {t('newsletter.subtitle')}</span>
							</h2>
							<p className="mb-8 text-blueGray-400 wow animate__animated animate__fadeIn" data-wow-delay=".3s">
								{t('newsletter.description')}
							</p>
							<div className="p-4 bg-white rounded-lg flex flex-wrap max-w-md mx-auto wow animate__animated animate__fadeIn" data-wow-delay=".5s">
								<div className="flex w-full md:w-2/3 px-3 mb-3 md:mb-0 md:mr-6 bg-blueGray-100 rounded">
									<svg className="h-6 w-6 my-auto text-blueGray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
										<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
										<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
									</svg>
									<input
										className="w-full pl-3 py-4 text-xs text-blueGray-400 font-semibold leading-none bg-blueGray-100 outline-none"
										type="text"
										placeholder={t('newsletter.placeholder')}
									/>
								</div>
								<button className="w-full md:w-auto py-4 px-8 text-xs text-white font-semibold leading-none bg-blue-400 hover:bg-blue-500 rounded" type="submit">
									{t('newsletter.button')}
								</button>
							</div>
						</div>
					</div>
				</div>
			</section>
		</Layout>
	)
}

export default Home
