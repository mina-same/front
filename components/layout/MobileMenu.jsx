'use client'
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const MobileMenu = ({ hiddenClass, handleRemove }) => {
	const [isActive, setIsActive] = useState({
		status: false,
		key: "",
	})

	const handleToggle = (key) => {
		if (isActive.key === key) {
			setIsActive({
				status: false,
			})
		} else {
			setIsActive({
				status: true,
				key,
			})
		}
	}
	return (
		<>
			<div className={`${hiddenClass} navbar-menu relative z-50 transition duration-300`}>
				<div className="navbar-backdrop fixed inset-0 bg-blueGray-800 opacity-25"></div>
				<nav className="fixed top-0 left-0 bottom-0 flex flex-col w-5/6 max-w-sm py-6 px-6 bg-white border-r overflow-y-auto transition duration-300">
					<div className="flex items-center mb-8">
						<Link href="#" className="mr-auto text-3xl font-semibold leading-none">
							<Image
								width="0"
								height="0"
								sizes="100vw"
								style={{ width: "auto", height: "auto" }} className="h-10" src="/assets/imgs/logos/logohorse.svg" alt="Monst" />

						</Link>
						<button className="navbar-close" onClick={handleRemove}>
							<svg className="h-6 w-6 text-blueGray-400 cursor-pointer hover:text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
							</svg>
						</button>
					</div>
					<div>
						<ul className="mobile-menu">
							<li className={isActive.key == 1 ? "mb-1 menu-item-has-children rounded-xl active" : "mb-1 menu-item-has-children rounded-xl"} onClick={() => handleToggle(1)}>
								<span className="menu-expand">+</span>
								<Link href="#" className="block p-4 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500 rounded-xl">Home
								</Link>
								<ul className={isActive.key == 1 ? "dropdown pl-5" : "hidden"}>
									<li>
										<Link href="/index" className="block p-3 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500">Home 1
										</Link>
									</li>
									<li>
										<Link href="/index-2" className="block p-3 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500">Home 2
										</Link>
									</li>
									<li>
										<Link href="/index-3" className="block p-3 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500">Home 3
										</Link>
									</li>
									<li>
										<Link href="/index-4" className="block p-3 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500">Home 4
										</Link>
									</li>
									<li>
										<Link href="/index-5" className="block p-3 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500">Home 5
										</Link>
									</li>
								</ul>
							</li>
							<li className="mb-1 rounded-xl">
								<Link href="/about" className="block p-4 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500 rounded-xl">About Us
								</Link>
							</li>
							<li className="mb-1">
								<Link href="/services" className="block p-4 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500">Services
								</Link>
							</li>
							<li className="mb-1">
								<Link href="/portfolio" className="block p-4 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500">Portfolio
								</Link>
							</li>
							<li className="mb-1">
								<Link href="/pricing" className="block p-4 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500">Pricing
								</Link>
							</li>
							<li className="mb-1">
								<Link href="/team" className="block p-4 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500">Team
								</Link>
							</li>
							<li className={isActive.key == 2 ? "mb-1 menu-item-has-children rounded-xl active" : "mb-1 menu-item-has-children rounded-xl"} onClick={() => handleToggle(2)}>
								<span className="menu-expand">+</span>
								<Link href="#" className="block p-4 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500">Blog
								</Link>
								<ul className={isActive.key == 2 ? "dropdown pl-5" : "hidden"}>
									<li>
										<Link href="/blog" className="block p-3 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500">Category 1
										</Link>
									</li>
									<li>
										<Link href="/blog-2" className="block p-3 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500">Category 2
										</Link>
									</li>
									<li>
										<Link href="/blog-single" className="block p-3 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500">Single 1
										</Link>
									</li>
									<li>
										<Link href="/blog-single-2" className="block p-3 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500">Single 2
										</Link>
									</li>
								</ul>
							</li>
							<li className="mb-1">
								<Link href="/faqs" className="block p-4 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500">Faqs
								</Link>
							</li>
							<li className="mb-1">
								<Link href="/testimonials" className="block p-4 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500">Testimonial
								</Link>
							</li>
							<li className="mb-1">
								<Link href="/contact" className="block p-4 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500">Contact Us
								</Link>
							</li>
						</ul>
						<div className="mt-4 pt-6 border-t border-blueGray-100">
							<Link href="/signup" className="block px-4 py-3 mb-3 text-xs text-center font-semibold leading-none bg-blue-400 hover:bg-blue-500 text-white rounded">Sign Up
							</Link>
							<Link href="/login" className="block px-4 py-3 mb-2 text-xs text-center text-blue-500 hover:text-blue-700 font-semibold leading-none border border-blue-200 hover:border-blue-300 rounded">Log In
							</Link>
						</div>	
					</div>
					<div className="mt-auto">
						<p className="my-4 text-xs text-blueGray-400">
							<span>Get in Touch</span>
							<span className="text-blue-500 hover:text-blue-500 underline">contact@monst.com</span>
						</p>
						<Link className="inline-block px-1" href="https://facebook.com">
							<Image
								width="0"
								height="0"
								sizes="100vw"
								style={{ width: "auto", height: "auto" }} src="/assets/imgs/icons/facebook-blue.svg" alt="Monst" />
						</Link>
						<Link className="inline-block px-1" href="https://twitter.com">
							<Image
								width="0"
								height="0"
								sizes="100vw"
								style={{ width: "auto", height: "auto" }} src="/assets/imgs/icons/twitter-blue.svg" alt="Monst" />
						</Link>
						<Link className="inline-block px-1" href="https://www.instagram.com">
							<Image
								width="0"
								height="0"
								sizes="100vw"
								style={{ width: "auto", height: "auto" }} src="/assets/imgs/icons/instagram-blue.svg" alt="Monst" />
						</Link>
					</div>
				</nav>
			</div>
		</>
	)
}

export default MobileMenu
