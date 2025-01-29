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
						<Link href="/" className="mr-auto text-3xl font-semibold leading-none">
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
							<li className="mb-1 rounded-xl">
								<Link href="/" className="block p-4 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500 rounded-xl">Home</Link>
							</li>
							<li className="mb-1 rounded-xl">
								<Link href="/Stables" className="block p-4 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500 rounded-xl">Stables</Link>
							</li>
							<li className="mb-1 rounded-xl">
								<Link href="/competitions" className="block p-4 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500 rounded-xl">Competitions</Link>
							</li>
							<li className="mb-1 rounded-xl">
								<Link href="/tripCoordinator" className="block p-4 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500 rounded-xl">Trips</Link>
							</li>
							<li className={isActive.key == 1 ? "mb-1 menu-item-has-children rounded-xl active" : "mb-1 menu-item-has-children rounded-xl"} onClick={() => handleToggle(1)}>
								<span className="menu-expand">+</span>
								<Link href="/publicServices" className="block p-4 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500 rounded-xl">Public Services</Link>
								<ul className={isActive.key == 1 ? "dropdown pl-5" : "hidden"}>
									<li>
										<Link href="/veterinarian" className="block p-3 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500">Veterinarian</Link>
									</li>
									<li>
										<Link href="/housing" className="block p-3 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500">Housing</Link>
									</li>
									<li>
										<Link href="/horseTrainer" className="block p-3 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500">Horse Trainer</Link>
									</li>
									<li>
										<Link href="/horseTrimmer" className="block p-3 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500">Horse Hoof Trimmer - FARRIER</Link>
									</li>
									<li>
										<Link href="/horseTransport" className="block p-3 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500">Horse Transport</Link>
									</li>
								</ul>
							</li>
							<li className={isActive.key == 2 ? "mb-1 menu-item-has-children rounded-xl active" : "mb-1 menu-item-has-children rounded-xl"} onClick={() => handleToggle(2)}>
								<span className="menu-expand">+</span>
								<Link href="/publicMarket" className="block p-4 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500 rounded-xl">Public Market</Link>
								<ul className={isActive.key == 2 ? "dropdown pl-5" : "hidden"}>
									<li>
										<Link href="/contractors" className="block p-3 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500">Contractors</Link>
									</li>
									<li>
										<Link href="/suppliers" className="block p-3 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500">Suppliers</Link>
									</li>
									<li>
										<Link href="/horseCatering" className="block p-3 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500">Horse Catering Services</Link>
									</li>
								</ul>
							</li>
							<li className="mb-1 rounded-xl">
								<Link href="/contact" className="block p-4 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500 rounded-xl">Contact</Link>
							</li>
						</ul>
						<div className="mt-4 pt-6 border-t border-blueGray-100">
							<Link href="/signup" className="block px-4 py-3 mb-3 text-xs text-center font-semibold leading-none bg-blue-400 hover:bg-blue-500 text-white rounded">Sign Up</Link>
							<Link href="/login" className="block px-4 py-3 mb-2 text-xs text-center text-blue-500 hover:text-blue-700 font-semibold leading-none border border-blue-200 hover:border-blue-300 rounded">Log In</Link>
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