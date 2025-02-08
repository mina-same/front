"use client";

import Layout from '../../../../components/layout/Layout';
import Link from "next/link";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';

const Signup = () => {
	const router = useRouter();
	const { t, i18n } = useTranslation();
	const isRTL = i18n.language === 'ar';
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
	const [startLoading, setStartLoading] = useState(true);

	useEffect(() => {
		document.body.dir = isRTL ? 'rtl' : 'ltr';
		const verifyUser = async () => {
			try {
				const response = await fetch('/api/auth/verify', {
					method: 'GET',
					credentials: 'include',
				});
				const data = await response.json();

				if (data.authenticated) {
					router.push("/");
				}
			} catch (error) {
				console.error('Error verifying user:', error);
			} finally {
				setStartLoading(false);
			}
		};

		verifyUser();
	}, [router, isRTL]);

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
			setError(t('signup:allFieldsRequired'));
			return false;
		}
		if (!isChecked) {
			setError(t('signup:acceptTerms'));
			return false;
		}
		if (formData.password !== formData.confirmPassword) {
			setError(t('signup:passwordsDoNotMatch'));
			return false;
		}
		if (formData.password.length < 6) {
			setError(t('signup:passwordMinLength'));
			return false;
		}
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(formData.email)) {
			setError(t('signup:validEmail'));
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
			// Step 1: Register the user
			const signupResponse = await fetch('/api/auth/register', {
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

			const signupData = await signupResponse.json();

			if (!signupResponse.ok) {
				throw new Error(signupData.message || 'Registration failed');
			}

			// Step 2: Automatically log in the user
			const loginResponse = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: formData.email,
					password: formData.password,
				}),
			});

			const data = await loginResponse.json();

			if (loginResponse.ok) {
				console.log('User ID:', data.userId); // Here's your user ID
				localStorage.setItem('userId', data.userId); // Optional: store it if needed
				// Handle successful login (e.g., redirect)
			} else {
				console.error('Login failed:', data.message);
			}

			// Step 3: Navigate to user onboarding/profile completion page
			router.push('/user');
			// Optional: Force a router refresh to ensure the auth state is updated
			router.refresh();

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
							<h4 className={`mb-6 text-3xl ${isRTL ? 'font-arabic' : ''}`}>
								{t('signup:createAccount')}
							</h4>
							{error && (
								<div className={`mb-4 p-3 bg-red-100 text-red-700 rounded ${isRTL ? 'font-arabic text-right' : ''}`}>
									{error}
								</div>
							)}
							<form onSubmit={handleSubmit} className={isRTL ? 'text-right' : 'text-left'}>
								<div className="flex mb-4 px-4 bg-blueGray-50 rounded border border-gray-200">
									<input
										className={`w-full py-4 text-xs placeholder-blueGray-400 font-semibold leading-none bg-blueGray-50 outline-none ${isRTL ? 'text-right font-arabic' : 'text-left'
											}`}
										type="text"
										placeholder={t('signup:username')}
										name="userName"
										value={formData.userName}
										onChange={handleChange}
										dir={isRTL ? 'rtl' : 'ltr'}
									/>
									<svg className={`h-6 w-6 ${isRTL ? 'mr-4' : 'ml-4'} my-auto text-blueGray-300`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
									</svg>
								</div>

								<div className="flex mb-4 px-4 bg-blueGray-50 rounded border border-gray-200">
									<input
										className={`w-full py-4 text-xs placeholder-blueGray-400 font-semibold leading-none bg-blueGray-50 outline-none ${isRTL ? 'text-right font-arabic' : 'text-left'
											}`}
										type="email"
										placeholder={t('signup:email')}
										name="email"
										value={formData.email}
										onChange={handleChange}
										dir={isRTL ? 'rtl' : 'ltr'}
									/>
									<svg className={`h-6 w-6 ${isRTL ? 'mr-4' : 'ml-4'} my-auto text-blueGray-300`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
									</svg>
								</div>

								<div className="flex mb-6 px-4 bg-blueGray-50 rounded border border-gray-200">
									<input
										className={`w-full py-4 text-xs placeholder-blueGray-400 font-semibold leading-none bg-blueGray-50 outline-none ${isRTL ? 'text-right font-arabic' : 'text-left'
											}`}
										type={showPassword ? "text" : "password"}
										placeholder={t('signup:password')}
										name="password"
										value={formData.password}
										onChange={handleChange}
										dir={isRTL ? 'rtl' : 'ltr'}
									/>
									<button
										type="button"
										onClick={() => togglePasswordVisibility('password')}
										className={`${isRTL ? 'mr-4' : 'ml-4'}`}
									>
										{showPassword ? (
											<EyeOff className="h-6 w-6 text-blueGray-300" />
										) : (
											<Eye className="h-6 w-6 text-blueGray-300" />
										)}
									</button>
								</div>

								<div className="flex mb-6 px-4 bg-blueGray-50 rounded border border-gray-200">
									<input
										className={`w-full py-4 text-xs placeholder-blueGray-400 font-semibold leading-none bg-blueGray-50 outline-none ${isRTL ? 'text-right font-arabic' : 'text-left'
											}`}
										type={showConfirmPassword ? "text" : "password"}
										placeholder={t('signup:confirmPassword')}
										name="confirmPassword"
										value={formData.confirmPassword}
										onChange={handleChange}
										dir={isRTL ? 'rtl' : 'ltr'}
									/>
									<button
										type="button"
										onClick={() => togglePasswordVisibility('confirm')}
										className={`${isRTL ? 'mr-4' : 'ml-4'}`}
									>
										{showConfirmPassword ? (
											<EyeOff className="h-6 w-6 text-blueGray-300" />
										) : (
											<Eye className="h-6 w-6 text-blueGray-300" />
										)}
									</button>
								</div>

								<div className={`float-${isRTL ? 'right' : 'left'} mb-8`}>
									<label className={`inline-flex text-xs ${isRTL ? 'font-arabic' : ''}`}>
										<input
											type="checkbox"
											className="form-checkbox custom-checkbox"
											checked={isChecked}
											onChange={handleCheckboxChange}
										/>
										<span className={`${isRTL ? 'mr-2' : 'ml-2'}`}>
											{t('signup:agreeTo')}
											<Link
												href="/privacy-policy"
												className="underline hover:text-blueGray-500"
											>
												{t('signup:privacyPolicy')}
											</Link>
											{" "}
											{t('signup:and')}
											{" "}
											<Link
												href="/terms"
												className="underline hover:text-blueGray-500"
											>
												{t('signup:termsOfUse')}
											</Link>
										</span>
									</label>
								</div>

								<button
									type="submit"
									disabled={loading}
									style={{ background: "#C19733" }}
									className={`transition duration-300 ease-in-out transform hover:-translate-y-1 block w-full p-4 text-center text-xs text-white font-semibold leading-none ${loading ? 'bg-gray-400' : 'hover:bg-[#b28a2f]'
										} rounded ${isRTL ? 'font-arabic' : ''}`}
								>
									{loading ? t('signup:signingUp') : t('signup:signUpNow')}
								</button>
							</form>

							<p className={`my-6 text-xs text-blueGray-400 text-center font-semibold ${isRTL ? 'font-arabic' : ''}`}>
								{t('signup:orContinueWith')}
							</p>

							<button className={`transition duration-300 ease-in-out transform hover:-translate-y-1 flex items-center px-4 py-3 w-full text-xs text-blueGray-500 font-semibold leading-none border border-gray-200 hover:bg-blueGray-50 rounded ${isRTL ? 'font-arabic' : ''
								}`}>
								<Image
									width="0"
									height="0"
									sizes="100vw"
									style={{ width: "auto", height: "auto" }}
									className={`h-6 ${isRTL ? 'pl-10' : 'pr-10'}`}
									src="/assets/imgs/logos/google-sign.svg"
									alt="google"
								/>
								<span>{t('signup:signUpWithGoogle')}</span>
							</button>

							<div className="w-full mt-12 mx-auto text-center">
								<p className={`text-sm ${isRTL ? 'font-arabic' : ''}`}>
									{t('signup:alreadyHaveAccount')}
									<Link
										href="/login"
										className={`inline-block text-xs text-[#C19733] hover:text-[#b28a2f] font-semibold leading-none ${isRTL ? 'mr-1 font-arabic' : 'ml-1'
											}`}
									>
										{t('signup:signInNow')}
									</Link>
								</p>
							</div>
						</div>
						<div>
							<p className={`text-xs text-blueGray-400 text-center ${isRTL ? 'font-arabic' : ''}`}>
								<Link className="underline hover:text-blueGray-500" href="/privacy-policy">
									{t('signup:privacyPolicy')}
								</Link>
								{" "}
								{t('signup:and')}
								{" "}
								<Link className="underline hover:text-blueGray-500" href="/terms">
									{t('signup:termsOfUse')}
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
