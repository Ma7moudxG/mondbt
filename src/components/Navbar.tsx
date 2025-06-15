"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { t, i18n } = useTranslation();
  const { data: session, status } = useSession();
  const [hijriDate, setHijriDate] = useState("");
  const [gregorianDate, setGregorianDate] = useState("");
  const [useHijri, setUseHijri] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // Effect to set isMounted and read client-side storage
  useEffect(() => {
    setIsMounted(true); // Component has mounted on the client

    // Read client-side storage only after mount
    const savedLang = localStorage.getItem('i18nextLng');
    const savedDateType = localStorage.getItem('dateType');

    if (savedLang) {
      // Only change language if it's different from current to avoid unnecessary re-renders
      if (i18n.language !== savedLang) {
        i18n.changeLanguage(savedLang);
      }
      document.documentElement.lang = savedLang;
      document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    } else if (typeof window !== 'undefined') { // Ensure localStorage is available and it's client-side
        // If no language saved in localStorage, default to 'en' and set it.
        // This 'else if' only runs on client.
        localStorage.setItem('i18nextLng', 'en');
        i18n.changeLanguage('en');
        document.documentElement.lang = 'en';
        document.documentElement.dir = 'ltr';
    }

    if (savedDateType) {
      setUseHijri(savedDateType === 'hijri');
    }
  }, [i18n]); // Dependency on i18n object itself to ensure it's stable


  // Effect to calculate dates, runs after mount and language changes
  useEffect(() => {
    // Only proceed if component is mounted on the client
    if (!isMounted) return;

    const lang = i18n.language;
    const currentDate = new Date();

    const hijriFormatter = new Intl.DateTimeFormat(
      lang === 'ar' ? 'ar-SA-u-ca-islamic-umalqura' : 'en-US',
      { day: 'numeric', month: 'long', year: 'numeric' }
    );
    const formattedHijri = hijriFormatter.format(currentDate);
    setHijriDate(lang === 'ar' ? `${formattedHijri}` : `${formattedHijri} AH`);

    const gregorianFormatter = new Intl.DateTimeFormat(
      lang === 'ar' ? 'ar-EG' : 'en-US',
      { day: 'numeric', month: 'long', year: 'numeric' }
    );
    const formattedGregorian = gregorianFormatter.format(currentDate);
    setGregorianDate(formattedGregorian);

  }, [i18n.language, isMounted]); // Recalculate dates when language or mount status changes

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    router.refresh(); // Refresh to potentially re-fetch server data based on new language
  };

  const toggleDateType = () => {
    const newDateType = !useHijri;
    setUseHijri(newDateType);
    localStorage.setItem('dateType', newDateType ? 'hijri' : 'gregorian');
    router.refresh(); // Refresh to potentially re-fetch server data
  };

  let greetingName = t('guest'); 

  if (isMounted && status !== "loading") {
    const userRole = session?.user?.role; // Access userRole here
    if (userRole) {
      greetingName = t(userRole.toLowerCase());
    } else if (session?.user?.name) {
      greetingName = session.user.name;
    } else if (session?.user?.email) {
      greetingName = session.user.email;
    }
  }


  if (!isMounted || status === "loading") {
    return (
      <header className="flex justify-between items-center p-4">
        <div className="text-sm text-gray-600 whitespace-nowrap">
          Loading...
        </div>
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold">Loading...</span>
        </div>
      </header>
    );
  }

  // Once isMounted is true and session is not loading, render the full header
  return (
    <header className="flex justify-between items-center p-4 bg-white">
      {/* Date Display */}
      <div className="text-xs text-[#9B9B9B] text-right font-bold whitespace-nowrap">
        {useHijri ? (
          <>
            <span className="text-[#5EB89D]">{t('today')}</span>: {hijriDate}
            &nbsp;&nbsp;&nbsp;
            <span className="text-[#5EB89D]">{t('corresponding')}</span>: {gregorianDate}
          </>
        ) : (
          <>
            <span className="text-[#5EB89D]">{t('today')}</span>: {gregorianDate}
            &nbsp;&nbsp;&nbsp;
            <span className="text-[#5EB89D]">{t('corresponding')}</span>: {hijriDate}
          </>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Toggle Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={toggleLanguage}
            className={`px-3 py-1 text-xs rounded-full border ${
              i18n.language === 'ar'
                ? "bg-[#5EB89D] text-white border-[#5EB89D]"
                : "bg-white text-[#5EB89D] border-[#5EB89D]"
            }`}
          >
            {i18n.language === 'ar' ? "EN" : "AR"}
          </button>
          {/* Re-enable this button if you want the user to toggle date type */}
          {/* <button
            onClick={toggleDateType}
            className={`px-3 py-1 text-xs rounded-full border ${
              useHijri
                ? "bg-[#8447AB] text-white border-[#8447AB]"
                : "bg-white text-[#8447AB] border-[#8447AB]"
            }`}
          >
            {useHijri ? t('gregorian') : t('hijri')}
          </button> */}
        </div>

        {/* User Greeting */}
        <span className="text-sm font-semibold text-[#9B9B9B]">
          {t('hello')}, {greetingName}!
        </span>

        {/* Logout Button */}
        {session && (
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="bg-white rounded-full text-[#9B9B9B] text-sm font-medium px-4 py-2 hover:text-white hover:bg-[#8447AB]"
          >
            {t('logout')}
          </button>
        )}
      </div>
    </header>
  );
}