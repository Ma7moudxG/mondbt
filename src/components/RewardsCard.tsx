"use client";
import { Dialog, Transition } from "@headlessui/react";
import React, { useState, Fragment } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { Reward } from "@/services/dataService";
import LinearProgressWithLabel from "@/components/LinearWithValueLabel"

// Assuming RewardType interface is defined in dataService.ts or here:
export interface RewardType {
  reward_type_id: number;
  description_en: string;
  description_ar: string;
}

// Define the reward types based on your provided JSON
const REWARD_TYPES: RewardType[] = [
  {
    reward_type_id: 1,
    description_en: "10% discount on Saudia Airlines",
    description_ar: "خصم 10% الخطوط السعودية",
  },
  {
    reward_type_id: 2,
    description_en: "5% discount from Like Card",
    description_ar: " خصم 5% من like card",
  },
  {
    reward_type_id: 3,
    description_en: "10% discount at VOX Cinema",
    description_ar: "خصم 10% من vox cinema",
  },
  {
    reward_type_id: 4,
    description_en: "10% discount on the NOON app",
    description_ar: " خصم 10% من تطبيق NOON",
  },
  {
    reward_type_id: 5,
    description_en: "5% discount at Sparky's",
    description_ar: " خصم 5% من سباركيز",
  },
  {
    reward_type_id: 6,
    description_en: "10% discount on any course on the Edraak platform",
    description_ar: " خصم 10% على أي دورة في منصة أدراك",
  },
  {
    reward_type_id: 7,
    description_en: "15% discount card at LEGO toy stores",
    description_ar: " بطاقة خصم 15% من محلات lego للألعاب",
  },
  {
    reward_type_id: 8,
    description_en: "10% discount on Fitness Time subscription",
    description_ar: " خصم 10% على الاشتراك في فتنس تايم",
  },
  {
    reward_type_id: 9,
    description_en: "20% discount on entry to Boulevard World",
    description_ar: " خصم 20% للدخول إلى boulevard world",
  },
];

// Month data (unchanged)
const GREGORIAN_MONTHS = [
  { name_en: "September", name_ar: "سبتمبر" },
  { name_en: "October", name_ar: "أكتوبر" },
  { name_en: "November", name_ar: "نوفمبر" },
  { name_en: "December", name_ar: "ديسمبر" },
  { name_en: "January", name_ar: "يناير" },
  { name_en: "February", name_ar: "فبراير" },
  { name_en: "March", name_ar: "مارس" },
  { name_en: "April", name_ar: "أبريل" },
  { name_en: "May", name_ar: "مايو" },
  { name_en: "June", name_ar: "يونيو" },
];

const HIJRI_MONTHS = [
  { name_en: "Rabi' al-Awwal", name_ar: "ربيع الأول" },
  { name_en: "Rabi' al-Thani", name_ar: "ربيع الثاني" },
  { name_en: "Jumada al-Ula", name_ar: "جمادى الأولى" },
  { name_en: "Jumada al-Thania", name_ar: "جمادى الآخرة" },
  { name_en: "Rajab", name_ar: "رجب" },
  { name_en: "Sha'ban", name_ar: "شعبان" },
  { name_en: "Ramadan", name_ar: "رمضان" },
  { name_en: "Shawwal", name_ar: "شوال" },
  { name_en: "Dhu al-Qa'dah", name_ar: "ذو القعدة" },
  { name_en: "Dhu al-Hijjah", name_ar: "ذو الحجة" },
];

interface RewardsProps {
  rewards: Reward[];
  attendance: number;
}

const RewardsCard: React.FC<RewardsProps> = ({ rewards, attendance }) => {
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === "ar";
  const dirAttribute = isArabic ? "rtl" : "ltr";
  console.log("aaaaa", attendance)

  // State to control primary modal visibility
  const [showPrizeSelectionModal, setShowPrizeSelectionModal] = useState(false);
  // State for the selected reward type ID from the radio buttons
  const [selectedRewardTypeId, setSelectedRewardTypeId] = useState<
    number | null
  >(null);


  // State to control the prize code display modal visibility
  const [showPrizeCodeModal, setShowPrizeCodeModal] = useState(false);
  // State to store the generated prize code
  const [prizeCode, setPrizeCode] = useState<string | null>(null);

  // Get current date details
  const today = new Date();
  const currentGregorianMonthIndex = today.getMonth();
  const currentGregorianYear = today.getFullYear();
  today.setHours(0, 0, 0, 0); // Normalize today's date to start of day

  // Determine the start year for "last September"
  const startYear =
    currentGregorianMonthIndex < 8
      ? currentGregorianYear - 1
      : currentGregorianYear;

  const monthsToDisplay = GREGORIAN_MONTHS.map((month, index) => {
    const gregorianMonthNumber = (8 + index) % 12;

    let monthYear = startYear;
    if (gregorianMonthNumber >= 0 && gregorianMonthNumber <= 5) {
      monthYear = startYear + 1;
    }

    const displayMonthDate = new Date(monthYear, gregorianMonthNumber, 1);
    displayMonthDate.setHours(0, 0, 0, 0);

    let imgSrc = "/reward3.svg"; // Default for future months
    let textColorClass = "text-[#CCCCCC]"; // Default color for future months
    let isClickable = false; // Flag to enable click only for current month

    const isCurrentMonth =
      displayMonthDate.getMonth() === today.getMonth() &&
      displayMonthDate.getFullYear() === today.getFullYear();

    if (isCurrentMonth) {
      imgSrc = "/reward2.svg"; // Current month
      textColorClass = "text-[#FFD009]"; // Color for current month
      isClickable = true; // Enable click for current month
    } else if (displayMonthDate < today) {
      imgSrc = "/reward1.svg"; // Past month
      textColorClass = "text-[#D4AE0E]"; // Color for past month
    }

    const earnedReward = rewards.find(
      (r) =>
        new Date(r.issued_at).getMonth() === gregorianMonthNumber &&
        new Date(r.issued_at).getFullYear() === monthYear
    );

    if (earnedReward && displayMonthDate < today) {
      textColorClass = "text-[#D4AE0E]"; // Keep original color for earned past rewards
      isClickable = false; // Past months with earned rewards are not clickable for new redemption
    }

    return {
      month_en: month.name_en,
      month_ar: month.name_ar,
      display_name: isArabic
        ? HIJRI_MONTHS[index]?.name_ar || month.name_ar
        : month.name_en,
      img: imgSrc,
      textColor: textColorClass,
      isClickable: isClickable, // Pass the clickable flag
    };
  });

  const handleImageClick = (monthData: any) => {
    if (monthData.isClickable) {
      setShowPrizeSelectionModal(true);
      setSelectedRewardTypeId(null); // Reset selection when modal opens
    }
  };

  const handleRedeem = () => {
    if (selectedRewardTypeId !== null) {
      console.log("Redeeming prize with reward_type_id:", selectedRewardTypeId);
      
      // Simulate API call and get a prize code
      const generatedCode = "PRW6324"; // In a real app, this would come from your backend
      setPrizeCode(generatedCode);

      setShowPrizeSelectionModal(false); // Close the first modal
      setShowPrizeCodeModal(true); // Open the second modal
      setSelectedRewardTypeId(null); // Clear selection

    } else {
      alert(t("Please select a prize to redeem.")); // Basic alert for no selection
    }
  };

  return (
    <div
      className={`p-8 bg-white rounded-2xl flex flex-col gap-8`}
      dir={dirAttribute}
    >
      <div className="flex flex-col">
        <h1 className="text-lg font-black text-[#8447AB]">{t("Rewards")}</h1>
      </div>
      <div>
        <div className="flex flex-col justify-between py-2">
          <div
            className={`grid gap-2 grid-cols-2 md:grid-cols-3 `}
          >
            {monthsToDisplay.map((monthData) => (
              <div
                key={monthData.month_en}
                className="flex flex-col gap-2 items-center"
              >
                <div
                  className={`relative ${
                    monthData.isClickable ? "cursor-pointer" : ""
                  }`}
                  onClick={() => handleImageClick(monthData)}
                >
                  <Image
                    src={monthData.img}
                    height={128}
                    width={128}
                    alt={t("reward_alt")}
                    className="pt-2 hover:opacity-75 transition-opacity"
                  />
                </div>
                <p className={`text-[11px] font-medium ${monthData.textColor}`}>
                  {t(monthData.display_name)}
                </p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex justify-between gap-2 items-center">
              <div className="flex flex-col gap-2">
                <h1 className="text-[#5EB89D] font-bold text-lg">
                  {t("Congratulations!")}
                </h1>
                <p>
                  {t(`You've got`)} {`${attendance}`} {t(`% in June`)}
                </p>
              </div>
              <div className="flex ">
                <Image
                  src="/face-90.svg"
                  height={64}
                  width={64}
                  alt={t("reward_alt")}
                  className="pt-2 hover:opacity-75 transition-opacity"
                />
              </div>
            </div>
            <LinearProgressWithLabel value={100} />
          </div>
        </div>
      </div>

      {/* Prize Selection Modal */}
      <Transition appear show={showPrizeSelectionModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setShowPrizeSelectionModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 align-middle shadow-xl transition-all"
                  dir={dirAttribute}
                >
                  <div className="mt-2">
                    <h1 className="text-[#08A192] font-bold text-xl">
                      {t("CONGRATULATIONS")}
                    </h1>
                    <p className="text-sm text-gray-500">
                      {t("On Your Commitment in June")}
                    </p>
                    <h1 className="text-[#08A192] font-bold text-xl mt-4">
                      {t("Choose from the list")}
                    </h1>
                  </div>

                  {/* Radio button list for prize options */}
                  <div className="mt-4 space-y-3">
                    {REWARD_TYPES.map((rewardType) => (
                      <div
                        key={rewardType.reward_type_id}
                        className="flex items-center"
                      >
                        <input
                          id={`reward-${rewardType.reward_type_id}`}
                          name="prize_selection" // All radios in the group must have the same name
                          type="radio"
                          value={rewardType.reward_type_id}
                          checked={
                            selectedRewardTypeId === rewardType.reward_type_id
                          }
                          onChange={() =>
                            setSelectedRewardTypeId(rewardType.reward_type_id)
                          }
                          className="h-4 w-4 text-[#8447AB] border-gray-300 focus:ring-[#8447AB]"
                        />
                        <label
                          htmlFor={`reward-${rewardType.reward_type_id}`}
                          className={`ml-3 text-sm font-medium text-gray-700 ${
                            isArabic ? "mr-3" : ""
                          }`}
                        >
                          {isArabic
                            ? rewardType.description_ar
                            : rewardType.description_en}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div
                    className={`mt-6 flex gap-3 ${
                      isArabic ? "justify-start" : "justify-end"
                    }`}
                  >
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-[#8447AB] px-4 py-2 text-sm font-medium text-white hover:bg-[#643581] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8447AB] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleRedeem}
                      disabled={selectedRewardTypeId === null} // Disable if no prize is selected
                    >
                      {t("Redeem")}
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={() => setShowPrizeSelectionModal(false)}
                    >
                      {t("Close")}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Prize Code Display Modal */}
      <Transition appear show={showPrizeCodeModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setShowPrizeCodeModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 align-middle shadow-xl transition-all"
                  dir={dirAttribute}
                >
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {t("Your Prize Code")}
                  </Dialog.Title>
                  <div className="mt-2 text-center">
                    <p className="text-sm text-gray-500">
                      {t("Here is your prize code:")}
                    </p>
                    <h1 className="text-3xl font-bold text-[#8447AB] mt-4 select-all">
                      {prizeCode}
                    </h1>
                  </div>

                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-[#8447AB] px-4 py-2 text-sm font-medium text-white hover:bg-[#643581] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8447AB] focus-visible:ring-offset-2"
                      onClick={() => setShowPrizeCodeModal(false)}
                    >
                      {t("Close")}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default RewardsCard;
