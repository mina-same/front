'use client'
import CounterUp from "../../components/elements/Counterup"
import TextEffect from "../../components/elements/TextEffect"
import Layout from "../../components/layout/Layout"
import Slider1 from "../../components/slider/Slider1"
import Link from 'next/link'
import Image from "next/image"

import { useEffect, useState } from 'react'

function Home() {
	const [inViewport, setInViewport] = useState(false)

	const handleScroll = () => {
		const elements = document.getElementsByClassName("counterUp")
		if (elements.length > 0) {
			const element = elements[0]
			const rect = element.getBoundingClientRect()
			const isInViewport = rect.top >= 0 && rect.bottom <= window.innerHeight
			if (isInViewport && !inViewport) {
				setInViewport(true)
			}
		}
	}

	useEffect(() => {
		window.addEventListener("scroll", handleScroll)
		return () => {
			window.removeEventListener("scroll", handleScroll)
		}
	}, [handleScroll])

	return (
		<>
			<Layout>
				still working in it.
			</Layout>
		</>
	)
}
export default Home