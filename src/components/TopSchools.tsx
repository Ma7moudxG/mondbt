"use client";

import React from "react";
import Marquee from "react-fast-marquee"; // Import the Marquee component
import { useTranslation } from "react-i18next"; // Import useTranslation

const TopSchools = () => {
  const { t, i18n } = useTranslation(); // Initialize useTranslation hook and get i18n instance
  const isArabic = i18n.language === "ar";

  // Determine marquee direction based on language
  // For Arabic (RTL), we want text to scroll from left to right -> 'right' direction
  // For English (LTR), we want text to scroll from right to left -> 'left' direction
  const marqueeDirection = isArabic ? "right" : "left";

  return (
    <div
      style={{
        width: "100%",
        height: "50px",
        backgroundColor: "#5EB89D",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        padding: "0 10px",
      }}
      // Keep the dir attribute on the container for text alignment within elements
      // The marquee direction will handle the scrolling flow
      dir={isArabic ? "rtl" : "ltr"}
    >
      <Marquee speed={40} gradient={false} direction={marqueeDirection}>
        <span
          style={{ marginRight: "30px", fontSize: "18px", color: "#fff" }}
          className="font-bold"
        >
          {t("Top 5 Schools in June:")}{" "}
        </span>
        <span style={{ marginRight: "30px", fontSize: "18px", color: "#fff" }}>
          {t("Medium Younis Ben Obaid")}{" "}
        </span>
        <span style={{ marginRight: "30px", fontSize: "18px", color: "#fff" }}>
          {t("Yusuf Ben Tashfin Medium")}{" "}
        </span>
        <span style={{ marginRight: "30px", fontSize: "18px", color: "#fff" }}>
          {t("Medium Wahb Bin Alarm Clock")}{" "}
        </span>
        <span style={{ marginRight: "30px", fontSize: "18px", color: "#fff" }}>
          {t("Medium and Washla Bin Al-Khattab")}{" "}
        </span>
        <span style={{ marginRight: "30px", fontSize: "18px", color: "#fff" }}>
          {t("Medium Najd")}{" "}
        </span>
      </Marquee>
    </div>
  );
};

export default TopSchools;