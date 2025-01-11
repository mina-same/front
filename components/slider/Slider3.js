'use client'
import Image from "next/image"
import { Autoplay, Navigation, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"




const Slider3 = () => {
	return (
		<>
			<Swiper
				modules={[Autoplay, Pagination, Navigation]}
				slidesPerView={1}
				spaceBetween={30}
				navigation={{
					prevEl: ".custom_prev",
					nextEl: ".custom_next",
				}}
				className="custom-class"
			>

				<SwiperSlide>
					<Image
						width="0"
						height="0"
						sizes="100vw"
						style={{ width: "auto", height: "auto" }} className="rounded" src="/assets/imgs/placeholders/mockup-1.png" alt="Monst" />
				</SwiperSlide>
				<SwiperSlide>

					<Image
						width="0"
						height="0"
						sizes="100vw"
						style={{ width: "auto", height: "auto" }} className="rounded" src="/assets/imgs/placeholders/mockup-2.png" alt="Monst" />
				</SwiperSlide>
				<SwiperSlide>

					<Image
						width="0"
						height="0"
						sizes="100vw"
						style={{ width: "auto", height: "auto" }} className="rounded" src="/assets/imgs/placeholders/mockup-3.png" alt="Monst" />
				</SwiperSlide>
			</Swiper>
		</>
	)
}

export default Slider3