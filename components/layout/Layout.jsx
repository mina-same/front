'use client'
import { useEffect, useState } from "react"
import BackToTop from "../elements/BackToTop"
import Footer from "./Footer"
import Header from "./Header"
import MobileMenu from "./MobileMenu"
import { useTranslation } from 'react-i18next'
import { usePathname } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { Lock } from 'lucide-react'

const Layout = ({ children }) => {
	const [hiddenClass, setHiddenClass] = useState("hidden")
	const [showAuthPrompt, setShowAuthPrompt] = useState(false)
	const [checking, setChecking] = useState(true)
	const [isClosing, setIsClosing] = useState(false)
	const { t, i18n } = useTranslation()
	const isArabic = i18n?.language === 'ar'
	const pathname = usePathname()

	const handleHidden = () => setHiddenClass("")

	const handleRemove = () => {
		if (hiddenClass === "") {
			setHiddenClass("hidden")
		}
	}

	const closePrompt = () => {
		setIsClosing(true)
		setTimeout(() => {
			setShowAuthPrompt(false)
			setIsClosing(false)
		}, 220)
	}

	useEffect(() => {
		let isMounted = true
		const verify = async () => {
			try {
				// Hide on auth pages
				if (pathname && (/\/login$/.test(pathname) || /\/signup$/.test(pathname))) {
					if (isMounted) setShowAuthPrompt(false)
					return
				}
				const res = await fetch('/api/auth/verify', { method: 'GET', credentials: 'include' })
				if (!res.ok) {
					if (isMounted) setShowAuthPrompt(true)
					return
				}
				const data = await res.json()
				if (isMounted) setShowAuthPrompt(!data?.authenticated)
			} catch (_) {
				if (isMounted) setShowAuthPrompt(true)
			} finally {
				if (isMounted) setChecking(false)
			}
		}
		verify()
		return () => { isMounted = false }
	}, [pathname])

	const handleGoogleSuccess = async (response) => {
		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ googleToken: response.credential })
			})
			const data = await res.json()
			if (!res.ok) {
				throw new Error(data?.message || 'Google sign-in failed')
			}
			setShowAuthPrompt(false)
			if (typeof window !== 'undefined') {
				window.location.reload()
			}
		} catch (_) {
			// optional: surface a toast
		}
	}

	return (
		<>
			<div className="main font-body text-body">
				<Header handleHidden={handleHidden} />
				<MobileMenu
					hiddenClass={hiddenClass}
					handleRemove={handleRemove}
				/>
				{children}
				<Footer />
				<BackToTop />

				{/* Global Auth Prompt (LTR/RTL aware) */}
				{!checking && showAuthPrompt && (
					<div className={`fixed bottom-3 ${isArabic ? 'right-3 md:right-6' : 'left-3 md:left-6'} z-50 w-[340px] max-w-[92vw] ${isClosing ? (isArabic ? 'animate-slide-out-rtl' : 'animate-slide-out-ltr') : (isArabic ? 'animate-slide-in-rtl' : 'animate-slide-in-ltr')}`}>
						<Alert
							className={`relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-background/95 to-background/90 backdrop-blur-xl shadow-xl ${isArabic ? 'pr-5 pl-12 text-right' : 'pl-5 pr-12 text-left'} py-4 ring-1 ring-black/5`}
							aria-live="polite"
						>
							{/* Gradient accent bar */}
							<div className={`absolute inset-y-0 ${isArabic ? 'right-0' : 'left-0'} w-1.5 bg-gradient-to-b from-primary to-primary/50`} />
							<div className={`flex items-start gap-3 ${isArabic ? 'flex-row-reverse' : 'flex-row'}`}>
								{/* Icon badge */}
								<div className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5 ${isArabic ? 'ml-1' : 'mr-1'}`}>
									<Lock className="h-4 w-4 text-primary" />
								</div>
								<div className="flex-1">
									<AlertTitle className="text-[0.95rem] font-semibold">
										{t('stablesPage:notLoggedInTitle', 'You are not logged in')}
									</AlertTitle>
									<AlertDescription className="mt-1 text-[0.9rem] text-muted-foreground leading-snug">
										{t('stablesPage:notLoggedInDesc', 'Log in to save favorites and access all features.')}
									</AlertDescription>
									<div className={`mt-3 flex flex-col sm:flex-row gap-2 ${isArabic ? 'sm:flex-row-reverse' : ''}`}>
										<Button size="lg" className="sm:flex-1" onClick={() => { closePrompt(); if (typeof window !== 'undefined') window.location.href = '/login' }}>
											{t('stablesPage:loginBtn', 'Log In')}
										</Button>
										<div className="flex items-center gap-2 text-[11px] text-muted-foreground">
											<span className="h-px flex-1 bg-border" />
											{t('stablesPage:or', 'or')}
											<span className="h-px flex-1 bg-border" />
										</div>
										{process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
											<GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
												<div className="flex justify-center sm:flex-1">
													<GoogleLogin
														onSuccess={handleGoogleSuccess}
														onError={() => {}}
														text="signin_with"
														width="210"
														locale={i18n?.language === 'ar' ? 'ar' : 'en'}
														key={i18n?.language}
													/>
												</div>
											</GoogleOAuthProvider>
										) : null}
									</div>
								</div>
							</div>
							<button
								aria-label={t('common:close', 'Close')}
								onClick={closePrompt}
								className={`absolute top-2 ${isArabic ? 'left-2' : 'right-2'} rounded-md px-2 text-muted-foreground hover:text-foreground transition-colors`}
							>
								&times;
							</button>
						</Alert>
					</div>
				)}
			</div>

			<style jsx global>{`
			@keyframes slide-in-ltr { from { opacity: 0; transform: translate(-8px, 10px); } to { opacity: 1; transform: translate(0, 0); } }
			@keyframes slide-out-ltr { from { opacity: 1; transform: translate(0, 0); } to { opacity: 0; transform: translate(-8px, 10px); } }
			@keyframes slide-in-rtl { from { opacity: 0; transform: translate(8px, 10px); } to { opacity: 1; transform: translate(0, 0); } }
			@keyframes slide-out-rtl { from { opacity: 1; transform: translate(0, 0); } to { opacity: 0; transform: translate(8px, 10px); } }
			.animate-slide-in-ltr { animation: slide-in-ltr 0.22s ease-out both; }
			.animate-slide-out-ltr { animation: slide-out-ltr 0.22s ease-in both; }
			.animate-slide-in-rtl { animation: slide-in-rtl 0.22s ease-out both; }
			.animate-slide-out-rtl { animation: slide-out-rtl 0.22s ease-in both; }
			`}</style>
		</>
	)
}

export default Layout
