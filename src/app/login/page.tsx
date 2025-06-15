"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react"; // Import useState
import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import { Noto_Sans_Arabic } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-sans-arabic",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const { data: session } = useSession();
  const router = useRouter();

  // START: Hydration Fix - Mounted state
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  // END: Hydration Fix

  // Helper to ensure consistent translated text during SSR
  const getConsistentTranslatedText = (key: string) => {
    if (!mounted) {
      return key; // During SSR, return the key itself
    }
    return t(key); // After hydration, use the actual translation
  };

  useEffect(() => {
    console.log("Client Session:", session);
    if (session?.user?.role) {
      const role = session.user.role;
      router.push(`/${role}`);
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      callbackUrl: "/", // temporarily goes to /, then redirect in useEffect
    });
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="bg-[url('/background.png')] bg-cover bg-no-repeat min-h-screen flex flex-col items-center gap-12 justify-center">
      <div className="flex flex-col gap-4 lg:w-[30%]">
        <div className="flex mb-8 gap-8 items-center justify-center">
          <Image
            src="/w-logo.svg"
            alt={getConsistentTranslatedText("Mondbt Logo")} // Use helper
            width={125}
            height={125}
            className="mb-2 md:mb-2"
          />
          <Image
            src="/m-logo.svg"
            alt={getConsistentTranslatedText("Mondbt Logo")} // Use helper
            width={100}
            height={100}
            priority
          />
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg flex flex-col gap-4 w-full text-center"
        >
          <h1 className="text-2xl mb-4 text-white">{getConsistentTranslatedText("LOGIN")}</h1> {/* Use helper */}
          <div className="mb-4">
            <input
              name="username"
              type="text"
              className="p-2 border rounded-md w-full"
              placeholder={getConsistentTranslatedText("Civil Number")} // Use helper
              required
            />
          </div>
          <div className="mb-4">
            <input
              name="password"
              type="password"
              className="p-2 border rounded-md w-full"
              placeholder={getConsistentTranslatedText("Password")} // Use helper
              required
            />
          </div>
          <p className="text-sm text-white">{getConsistentTranslatedText("Forgot Password?")}</p> {/* Use helper */}
          <button
            type="submit"
            className="w-full bg-[#8447AB] text-white p-2 rounded-md hover:bg-[#5d3279]"
          >
            {getConsistentTranslatedText("Login")} {/* Use helper */}
          </button>
          <p className="text-sm text-white">
            {getConsistentTranslatedText("Don't have an account?")}{" "} {/* Use helper */}
            <span className="text-[#8447AB] cursor-pointer">
              {getConsistentTranslatedText("Register Now")} {/* Use helper */}
            </span>
          </p>
        </form>

        <hr className="w-full border-white my-4" />

        <button
          type="button"
          className="w-full flex gap-4 items-center justify-center bg-white text-[#8447AB] hover:text-white p-4 rounded-md hover:bg-[#8447AB]"
        >
          {getConsistentTranslatedText("Login using")} {/* Use helper */}
          <Image
            src="/nafath-logo.png"
            alt={getConsistentTranslatedText("Nafath Logo")} // Use helper
            width={40}
            height={40}
            priority
          />
        </button>
      </div>

      {/* Language Toggle */}
      <div className="flex gap-4 items-center">
        <p className="text-white">{getConsistentTranslatedText("Language")}:</p> {/* Use helper */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="bg-white text-[#8447AB] hover:text-white p-2 rounded-md hover:bg-[#8447AB] w-16"
        >
          {/* This is a special case: we want to show 'Ar' or 'En' based on the *current* client language,
              but for SSR, we need a stable value. Display the default language's text. */}
          {mounted ? (i18n.language === "en" ? t("Ar") : t("En")) : "Ar"}
        </button>
      </div>
    </div>
  );
}