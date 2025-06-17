"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
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

  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (session?.user?.role) {
      const role = session.user.role;
      router.push(`/${role}`);
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const result = await signIn("credentials", {
        username: formData.get("username"),
        password: formData.get("password"),
        redirect: false,
      });

      if (result?.error) {
        setError("Authentication failed. Please check your credentials.");
      } else {
        // Force session update and redirect
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
  };

  const getConsistentTranslatedText = (key: string) => {
    if (!mounted) return key;
    return t(key);
  };

  return (
    <div className="bg-[url('/background.png')] bg-cover bg-no-repeat min-h-screen flex flex-col items-center gap-12 justify-center">
      <div className="flex flex-col gap-4 lg:w-[30%]">
        <div className="flex mb-8 gap-8 items-center justify-center">
          <Image
            src="/w-logo.svg"
            alt={getConsistentTranslatedText("Mondbt Logo")}
            width={125}
            height={125}
            className="mb-2 md:mb-2"
          />
          <Image
            src="/m-logo.svg"
            alt={getConsistentTranslatedText("Mondbt Logo")}
            width={100}
            height={100}
            priority
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-lg flex flex-col gap-4 w-full text-center"
        >
          <h1 className="text-2xl mb-4 text-white">{getConsistentTranslatedText("LOGIN")}</h1>
          <div className="mb-4">
            <input
              name="username"
              type="text"
              className="p-2 border rounded-md w-full"
              placeholder={getConsistentTranslatedText("Civil Number")}
              required
              disabled={isLoading}
            />
          </div>
          <div className="mb-4">
            <input
              name="password"
              type="password"
              className="p-2 border rounded-md w-full"
              placeholder={getConsistentTranslatedText("Password")}
              required
              disabled={isLoading}
            />
          </div>
          <p className="text-sm text-white">{getConsistentTranslatedText("Forgot Password?")}</p>
          <button
            type="submit"
            className="w-full bg-[#8447AB] text-white p-2 rounded-md hover:bg-[#5d3279] disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? getConsistentTranslatedText("Loading...") : getConsistentTranslatedText("Login")}
          </button>
          <p className="text-sm text-white">
            {getConsistentTranslatedText("Don't have an account?")}{" "}
            <span className="text-[#8447AB] cursor-pointer">
              {getConsistentTranslatedText("Register Now")}
            </span>
          </p>
        </form>

        <hr className="w-full border-white my-4" />

        <button
          type="button"
          className="w-full flex gap-4 items-center justify-center bg-white text-[#8447AB] hover:text-white p-4 rounded-md hover:bg-[#8447AB] disabled:opacity-50"
          disabled={isLoading}
        >
          {getConsistentTranslatedText("Login using")}
          <Image
            src="/nafath-logo.png"
            alt={getConsistentTranslatedText("Nafath Logo")}
            width={40}
            height={40}
            priority
          />
        </button>
      </div>

      <div className="flex gap-4 items-center">
        <p className="text-white">{getConsistentTranslatedText("Language")}:</p>
        <button
          type="button"
          onClick={toggleLanguage}
          className="bg-white text-[#8447AB] hover:text-white p-2 rounded-md hover:bg-[#8447AB] w-16 disabled:opacity-50"
          disabled={isLoading}
        >
          {mounted ? (i18n.language === "en" ? t("Ar") : t("En")) : "Ar"}
        </button>
      </div>
    </div>
  );
}