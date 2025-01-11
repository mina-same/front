'use client';

import React, { useState } from 'react';
import Layout from '../../../components/layout/Layout';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
	const router = useRouter();
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});
	const [isChecked, setIsChecked] = useState(true);
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const handleCheckboxChange = (event) => {
		setIsChecked(event.target.checked);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!isChecked) {
			setError('Please accept the terms and conditions');
			return;
		}

		if (!formData.email || !formData.password) {
			setError('Please fill in all fields');
			return;
		}

		setIsLoading(true);
		setError('');

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Login failed');
			}

			// Login successful
			router.push('/'); // Redirect to dashboard or home page
		} catch (err) {
			setError(err.message || 'An error occurred during login');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Layout>
			<section className="relative pb-20">
				<div className="hidden lg:block absolute inset-0 w-1/2 ml-auto">
					<div className="flex items-center h-full wow animate__animated animate__fadeIn animated" data-wow-delay=".1s">
						<Image
							width="0"
							height="0"
							sizes="100vw"
							style={{ width: "auto", height: "auto" }}
							className="lg:max-w-lg mx-auto"
							src="/assets/imgs/illustrations/horse.svg"
							alt="Monst"
						/>
					</div>
				</div>
				<div className="container">
					<div className="relative flex flex-wrap pt-12">
						<div className="lg:flex lg:flex-col w-full lg:w-1/2 py-6 lg:pr-20">
							<div className="w-full max-w-lg mx-auto lg:mx-0 my-auto wow animate__animated animate__fadeIn animated" data-wow-delay=".3s">
								<span className="text-sm text-blueGray-400">Sign In</span>
								<h4 className="mb-6 text-3xl">Join our community</h4>

								{error && (
									<div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
										{error}
									</div>
								)}

								<form onSubmit={handleSubmit}>
									<div className="flex mb-4 px-4 bg-blueGray-50 rounded border border-gray-200">
										<input
											className="w-full py-4 text-xs placeholder-blueGray-400 font-semibold leading-none bg-blueGray-50 outline-none"
											type="email"
											name="email"
											placeholder="name@email.com"
											value={formData.email}
											onChange={handleInputChange}
										/>
										<svg className="h-6 w-6 ml-4 my-auto text-blueGray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
										</svg>
									</div>

									<div className="flex mb-6 px-4 bg-blueGray-50 rounded border border-gray-200">
										<input
											className="w-full py-4 text-xs placeholder-blueGray-400 font-semibold leading-none bg-blueGray-50 outline-none"
											type={showPassword ? "text" : "password"}
											name="password"
											placeholder="Enter your password"
											value={formData.password}
											onChange={handleInputChange}
										/>
										<button
											type="button"
											className="ml-4 focus:outline-none"
											onClick={togglePasswordVisibility}
										>
											{showPassword ? (
												<Eye className="h-6 w-6 text-blueGray-300 hover:text-blueGray-400 transition-colors" />
											) : (
												<EyeOff className="h-6 w-6 text-blueGray-300 hover:text-blueGray-400 transition-colors" />
											)}
										</button>
									</div>

									<div className="float-left mb-6 wow animate__animated animate__fadeIn animated" data-wow-delay=".1s">
										<label className="inline-flex text-xs">
											<input
												type="checkbox"
												className="text-red-700 bg-white custom-checkbox"
												checked={isChecked}
												onChange={handleCheckboxChange}
											/>
											<span className="ml-2">
												I agree to{" "}
												<Link href="/about" className="underline hover:text-blueGray-500">
													Privacy Policy
												</Link>{" "}
												and{" "}
												<Link href="/about" className="underline hover:text-blueGray-500">
													Terms of Use
												</Link>
											</span>
										</label>
									</div>

									<button
										type="submit"
										disabled={isLoading}
										style={{ backgroundColor: "#a78638" }}
										className="transition duration-300 ease-in-out transform hover:-translate-y-1 block w-full p-4 text-center text-xs text-white font-semibold leading-none hover:bg-[#C19733] rounded disabled:opacity-50"
									>
										{isLoading ? 'Signing In...' : 'Sign In'}
									</button>
									<Link
										href="/forget-password"
										className="mt-5 flex text-xs text-[#a78638] hover:text-[#C19733] font-semibold leading-none wow animate__animated animate__fadeIn animated justify-center items-center mx-auto"
										data-wow-delay=".1s"
									>
										Forget Your Password?
									</Link>
								</form>

								<p className="my-6 text-xs text-blueGray-400 text-center font-semibold">or continue with</p>

								<button className="transition duration-300 ease-in-out transform hover:-translate-y-1 flex items-center px-4 py-3 w-full text-xs text-blueGray-500 font-semibold leading-none border border-gray-200 hover:bg-blueGray-50 rounded">
									<Image
										width="0"
										height="0"
										sizes="100vw"
										style={{ width: "auto", height: "auto" }}
										className="h-6 pr-10"
										src="/assets/imgs/logos/google-sign.svg"
										alt="google"
									/>
									<span>Sign In with Google</span>
								</button>
							</div>

							<div className="w-full mt-12 mx-auto text-center">
								<p>
									Don't Have an Account?{" "}
									<Link
										href="/signup"
										className="inline-block text-xs text-[#a78638] hover:text-[#C19733] font-semibold leading-none wow animate__animated animate__fadeIn animated"
										data-wow-delay=".1s"
									>
										Sign Up now
									</Link>
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>
		</Layout>
	);
};

export default Login;