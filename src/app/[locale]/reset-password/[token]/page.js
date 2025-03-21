"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from '../../../../../components/layout/Layout';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function ResetPasswordClient() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const params = useParams();
  const router = useRouter();
  const token = params.token;

  useEffect(() => {
    document.body.dir = isRTL ? 'rtl' : 'ltr';
  }, [isRTL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setError(t('resetPassword:passwordsDoNotMatch'));
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError(t('resetPassword:passwordMinLength'));
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/auth/reset", {
        method: "POST",
        body: JSON.stringify({ token, password: newPassword }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(t('resetPassword:errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) return <div>{t('resetPassword:invalidLink')}</div>;

  return (
    <Layout>
      <section className="relative pb-20 pt-28">
        <div className={`hidden lg:block absolute inset-0 ${isRTL ? 'w-1/2 mr-auto' : 'w-1/2 ml-auto'}`}>
          <div className="flex items-center h-full wow animate__animated animate__fadeIn animated" data-wow-delay=".1s">
            <Image
              width="0"
              height="0"
              sizes="100vw"
              style={{ width: 'auto', height: 'auto' }}
              className="lg:max-w-lg mx-auto"
              src="/assets/imgs/illustrations/forgot-password.svg"
              alt="Monst"
            />
          </div>
        </div>
        <div className="container">
          <div className="relative flex flex-wrap pt-12">
            <div className={`lg:flex lg:flex-col w-full lg:w-1/2 py-6 ${isRTL ? 'lg:pl-20' : 'lg:pr-20'}`}>
              <div className="w-full max-w-lg mx-auto lg:mx-0 my-auto wow animate__animated animate__fadeIn animated" data-wow-delay=".3s">
                <span className="text-sm text-blueGray-400">{t('resetPassword:resetPassword')}</span>
                <h4 className={`mb-6 text-3xl ${isRTL ? 'font-arabic' : ''}`}>{t('resetPassword:createNewPassword')}</h4>

                {success ? (
                  <div className="text-center p-4 mb-4 text-green-700 bg-green-100 rounded">
                    {t('resetPassword:resetSuccess')}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="flex mb-4 px-4 bg-blueGray-50 rounded border border-gray-200">
                      <input
                        type="password"
                        placeholder={t('resetPassword:enterNewPassword')}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`w-full py-4 text-xs placeholder-blueGray-400 font-semibold leading-none bg-blueGray-50 outline-none ${isRTL ? 'text-right font-arabic' : 'text-left'}`}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex mb-4 px-4 bg-blueGray-50 rounded border border-gray-200">
                      <input
                        type="password"
                        placeholder={t('resetPassword:confirmNewPassword')}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full py-4 text-xs placeholder-blueGray-400 font-semibold leading-none bg-blueGray-50 outline-none ${isRTL ? 'text-right font-arabic' : 'text-left'}`}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    {error && <p className="text-red-500 text-xs mb-4">{error}</p>}

                    <button
                      type="submit"
                      disabled={isLoading}
                      style={{backgroundColor: "#b28a2f"}}
                      className="flex justify-center items-center gap-2 transition duration-300 ease-in-out transform hover:-translate-y-1 w-full p-4 text-center text-lg text-white font-semibold leading-none hover:bg-[#C19733] rounded disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          {t('resetPassword:resettingPassword')}
                        </span>
                      ) : (
                        t('resetPassword:resetPasswordButton')
                      )}
                    </button>
                  </form>
                )}
              </div>

              <div className="w-full mt-12 mx-auto text-center">
                <p className={isRTL ? 'font-arabic' : ''}>
                  {t('resetPassword:rememberPassword')}{' '}
                  <Link href="/login" className="inline-block text-xs text-[#a78638] hover:text-[#C19733] font-semibold leading-none wow animate__animated animate__fadeIn animated" data-wow-delay=".1s">
                    {t('resetPassword:loginNow')}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
