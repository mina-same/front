"use client";

import Layout from '../../../components/layout/Layout'
import Link from "next/link"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image';

const Signup = () => {
	const router = useRouter();
	const [formData, setFormData] = useState({
		userName: '',
		email: '',
		password: '',
		confirmPassword: '',
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isChecked, setIsChecked] = useState(false);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleCheckboxChange = (event) => {
		setIsChecked(event.target.checked);
	};

	const togglePasswordVisibility = (field) => {
		if (field === 'password') {
			setShowPassword(!showPassword);
		} else {
			setShowConfirmPassword(!showConfirmPassword);
		}
	};

	const validateForm = () => {
		if (!formData.userName || !formData.email || !formData.password || !formData.confirmPassword) {
			setError('All fields are required');
			return false;
		}
		if (!isChecked) {
			setError('Please accept the terms and conditions');
			return false;
		}
		if (formData.password !== formData.confirmPassword) {
			setError('Passwords do not match');
			return false;
		}
		if (formData.password.length < 6) {
			setError('Password must be at least 6 characters long');
			return false;
		}
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(formData.email)) {
			setError('Please enter a valid email address');
			return false;
		}
		return true;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');

		if (!validateForm()) {
			return;
		}

		setLoading(true);
		try {
			const response = await fetch('/api/signup', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: formData.email,
					password: formData.password,
					userName: formData.userName,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Something went wrong');
			}

			// Successful signup
			router.push('/login');
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Layout>
			<section className="py-12 bg-blueGray-50">
				<div className="container">
					<div className="flex max-w-md mx-auto flex-col text-center">
						<div className="mt-12 mb-8 p-8 bg-white rounded shadow">
							<h4 className="mb-6 text-3xl">Create an Account</h4>
							{error && (
								<div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
									{error}
								</div>
							)}
							<form onSubmit={handleSubmit}>
								<div className="flex mb-4 px-4 bg-blueGray-50 rounded border border-gray-200">
									<input
										className="w-full py-4 text-xs placeholder-blueGray-400 font-semibold leading-none bg-blueGray-50 outline-none"
										type="text"
										placeholder="Username"
										name="userName"
										value={formData.userName}
										onChange={handleChange}
									/>
									<svg className="h-6 w-6 ml-4 my-auto text-blueGray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
									</svg>
								</div>
								<div className="flex mb-4 px-4 bg-blueGray-50 rounded border border-gray-200">
									<input
										className="w-full py-4 text-xs placeholder-blueGray-400 font-semibold leading-none bg-blueGray-50 outline-none"
										type="email"
										placeholder="Email"
										name="email"
										value={formData.email}
										onChange={handleChange}
									/>
									<svg className="h-6 w-6 ml-4 my-auto text-blueGray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
									</svg>
								</div>
								<div className="flex mb-6 px-4 bg-blueGray-50 rounded border border-gray-200">
									<input
										className="w-full py-4 text-xs placeholder-blueGray-400 font-semibold leading-none bg-blueGray-50 outline-none"
										type={showPassword ? "text" : "password"}
										placeholder="Enter your password"
										name="password"
										value={formData.password}
										onChange={handleChange}
									/>
									<button type="button" onClick={() => togglePasswordVisibility('password')} className="ml-4">
										<svg className="h-6 w-6 my-auto text-blueGray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
										</svg>
									</button>
								</div>
								<div className="flex mb-6 px-4 bg-blueGray-50 rounded border border-gray-200">
									<input
										className="w-full py-4 text-xs placeholder-blueGray-400 font-semibold leading-none bg-blueGray-50 outline-none"
										type={showConfirmPassword ? "text" : "password"}
										placeholder="Confirm password"
										name="confirmPassword"
										value={formData.confirmPassword}
										onChange={handleChange}
									/>
									<button type="button" onClick={() => togglePasswordVisibility('confirm')} className="ml-4">
										<svg className="h-6 w-6 my-auto text-blueGray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
										</svg>
									</button>
								</div>

								<div className="float-left mb-8">
									<label className="inline-flex text-xs">
										<input
											type="checkbox"
											className="form-checkbox custom-checkbox"
											checked={isChecked}
											onChange={handleCheckboxChange}
										/>
										<span className="ml-2">
											I agree to{" "}
											<Link
												href="/privacy-policy"
												className="underline hover:text-blueGray-500"
											>
												Privacy Policy
											</Link>{" "}
											and{" "}
											<Link
												href="/terms"
												className="underline hover:text-blueGray-500"
											>
												Terms of Use
											</Link>
										</span>
									</label>
								</div>

								<button
									type="submit"
									disabled={loading}
									style={{ background: "#C19733" }}
									className={`transition duration-300 ease-in-out transform hover:-translate-y-1 block w-full p-4 text-center text-xs text-white font-semibold leading-none ${loading ? 'bg-gray-400' : 'hover:bg-[#b28a2f]'
										} rounded`}
								>
									{loading ? 'Signing up...' : 'Sign Up Now'}
								</button>
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
								<span>Sign Up with Google</span>
							</button>

							<div className="w-full mt-12 mx-auto text-center">
								<p className="text-sm">
									Already have an account?{" "}
									<Link href="/login" className="inline-block text-xs text-[#C19733] hover:text-[#b28a2f] font-semibold leading-none">
										Sign in now
									</Link>
								</p>
							</div>
						</div>
						<div>
							<p className="text-xs text-blueGray-400 text-center">
								<Link className="underline hover:text-blueGray-500" href="/privacy-policy">
									Privacy Policy
								</Link>
								{" "}and{" "}
								<Link className="underline hover:text-blueGray-500" href="/terms">
									Terms of Use
								</Link>
							</p>
						</div>
					</div>
				</div>
			</section>
		</Layout>
	);
};

export default Signup;