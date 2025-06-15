// app/parent/fines/[parentId]/page.tsx
"use client"; // This component will run on the client-side

import React, { useState, useEffect, useCallback } from "react"; // Import useCallback
import DataService, { ParentPenalty } from "@/services/dataService"; // Adjust path as necessary, and import ParentPenalty interface
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next"; // Import useTranslation

// Helper function for conditional class names
const cm = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(" ");

export default function FinesPage() {
  const { t } = useTranslation(); // Removed i18n as it's not directly used here
  const params = useParams();

  const idParam = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const parentId = idParam ? Number(idParam) : undefined;

  // State to hold the list of *unpaid* penalty objects
  const [unpaidPenalties, setUnpaidPenalties] = useState<ParentPenalty[]>([]);
  const [totalFines, setTotalFines] = useState<number>(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("credit_card");

  // Loading and error states for initial data fetch
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [initialDataError, setInitialDataError] = useState<string | null>(null);

  // Loading and error states for the "Pay Now" action
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentActionError, setPaymentActionError] = useState<string | null>(null);

  const [isMounted, setIsMounted] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"success" | "error" | "info">("info");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use useCallback to memoize the data fetching function
  const fetchFinesData = useCallback(async () => {
    if (!isMounted) return; // Only run if component is mounted

    if (typeof parentId === "number" && !isNaN(parentId)) {
      setLoadingInitialData(true);
      setInitialDataError(null); // Clear previous initial data errors
      setPaymentActionError(null); // Clear previous payment action errors on refresh

      try {
        // Fetch ALL penalties for the parent's students
        const allPenalties = await DataService.getPenaltiesForParent(parentId);
        
        // Filter for penalties that are explicitly NOT paid ('N' or undefined/null)
        // This ensures only outstanding fines are shown
        const currentUnpaid = allPenalties.filter(p => p.paid !== "Y"); 
        
        setUnpaidPenalties(currentUnpaid); // Store the filtered unpaid penalties
        
        // Calculate the total from the currently unpaid penalties
        const currentTotal = currentUnpaid.reduce((sum, penalty) => sum + (penalty.amount_due || 0), 0);
        setTotalFines(currentTotal);
        
        console.log("Fetched All Penalties for Parent:", allPenalties);
        console.log("Filtered Unpaid Penalties for display:", currentUnpaid);
        console.log("Calculated Total Unpaid Fines:", currentTotal);

      } catch (err) {
        console.error("FinesPage: Error fetching fines:", err);
        setUnpaidPenalties([]);
        setTotalFines(0);
        setInitialDataError(t("fines.errorLoading"));
      } finally {
        setLoadingInitialData(false);
      }
    } else {
      // Handle invalid parentId scenario
      setUnpaidPenalties([]);
      setTotalFines(0);
      setLoadingInitialData(false);
      setInitialDataError(t("fines.invalidParentId"));
    }
  }, [parentId, t, isMounted]); // Dependencies for useCallback

  useEffect(() => {
    fetchFinesData(); // Call the memoized fetch function
  }, [fetchFinesData]); // Dependency on the memoized fetchFinesData

  const paymentMethods = [
    { id: "bank_transfer", key: "Bank Transfer" },
    { id: "credit_card", key: "Credit Card" },
    { id: "apple_pay", key: "ApplePay" },
    { id: "fawateer_saddad", key: "Sadad Invoice" },
  ];

  const handlePaymentMethodChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedPaymentMethod(event.target.value);
  };

  const openModal = (message: string, type: "success" | "error" | "info") => {
    setModalMessage(message);
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
    setModalType("info");
  };

  const handlePayNowClick = async () => { // Make this function async
    if (processingPayment) return; // Prevent double submission

    if (!selectedPaymentMethod) {
      alert(t("fines.alertSelectPaymentMethod"));
      return;
    }

    if (totalFines <= 0 || unpaidPenalties.length === 0) {
      openModal(t("fines.noFinesToPay"), "info");
      return;
    }

    // Optional: Add a confirmation dialog before proceeding with payment
    const selectedMethodName = t(paymentMethods.find(m => m.id === selectedPaymentMethod)?.key || selectedPaymentMethod);
    // const confirmProceed = window.confirm(t("Confirm Payment", { totalFines, selectedPaymentMethod: selectedMethodName }));
    
    // if (!confirmProceed) {
    //   return;
    // }

    setProcessingPayment(true); // Start payment processing loading state
    setPaymentActionError(null); // Clear previous payment action errors

    try {
      // Iterate over the currently displayed (unpaid) penalties and update their status
      const updatePromises = unpaidPenalties.map(penalty =>
        DataService.updatePenaltyStatus(penalty.id, "Y") // Change 'paid' to "Y"
      );

      // Wait for all update operations to complete, even if some fail
      const results = await Promise.allSettled(updatePromises);

      // Check if any updates failed
      const failedUpdates = results.filter(result => result.status === 'rejected' || result.value === null);

      if (failedUpdates.length === 0) {
        const message = t(`Successful Payment!`) + `, ${totalFines} ` + t(`Saudi Riyal`)
        openModal(t(message, { totalFines, selectedPaymentMethod: selectedMethodName }), "success");
        // Successfully updated all, re-fetch data to reflect changes (totalFines will become 0)
        await fetchFinesData(); 
      } else {
        // Handle partial or full failure
        const failedCount = failedUpdates.length;
        console.error(`FinesPage: Failed to update ${failedCount} penalties.`, failedUpdates);
        const errorMessage = t("Payment Failed", { failedCount });
        setPaymentActionError(t("fines.partialPaymentFailed", { failedCount }));
        openModal(errorMessage, "error");// Generic alert for user
      }
    } catch (err: any) {
      console.error("FinesPage: Critical error during payment processing:", err);
      const errorMessage = err.message || t("Payment Failed");
      setPaymentActionError(errorMessage); // Keep this for display under the button
      openModal(errorMessage, "error");
    } finally {
      setProcessingPayment(false); // End payment processing loading state
    }
  };

  // --- Render Logic ---
  if (!isMounted) {
    return (
      <div className="text-center py-8 text-lg font-medium">
        {t("Loading...")}
      </div>
    );
  }

  if (loadingInitialData) {
    return <div className="text-center py-8 text-lg font-medium">{t("Loading...")}</div>;
  }

  if (initialDataError) {
    return <div className="text-center py-8 text-red-500 font-medium">{initialDataError}</div>;
  }
  
  // Show payment specific error if any
  if (paymentActionError) {
    return <div className="text-center py-8 text-red-500 font-medium">{paymentActionError}</div>;
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Outer container */}
      <div className="p-8 bg-white rounded-2xl flex flex-col gap-8 w-full max-w-md mx-auto">
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <h1 className="text-lg font-black text-[#8447AB]">{t("Fines")}</h1>

          <div className="flex justify-between items-center">
            <p className="text-lg font-medium text-[#7C8B9D]">{t("Total Fines")}</p>
            <p className="text-xl font-bold text-[#4A4A4A]">
              {totalFines} {t("Saudi Riyal")}
            </p>
          </div>
        </div>
        <hr />
        {/* Choose Payment Method Section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-bold text-[#7C8B9D] text-center">
            {t("Payment Methods")}
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={cm(
                  "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200",
                  selectedPaymentMethod === method.id
                    ? "border-[#6BBEA5] bg-[#6BBEA5]" // Selected style
                    : "border-[#E0E0E0] bg-white hover:bg-gray-50" // Default/hover style
                )}
              >
                <span
                  className={cm(
                    "text-base font-medium",
                    selectedPaymentMethod === method.id
                      ? "text-white"
                      : "text-[#B5C0CD]"
                  )}
                >
                  {t(method.key)}{" "}
                </span>
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedPaymentMethod === method.id}
                  onChange={handlePaymentMethodChange}
                  className={cm(
                    "h-5 w-5 rounded-full border-2",
                    selectedPaymentMethod === method.id
                      ? "border-white bg-white checked:bg-white checked:border-white checked:text-white "
                      : "border-[#C4C4C4] bg-white text-transparent checked:bg-transparent"
                  )}
                  style={{
                    WebkitAppearance: "none",
                    appearance: "none",
                    outline: "none",
                  }}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Pay Now Button */}
        <div className="flex justify-center mt-4">
          <button
            onClick={handlePayNowClick}
            className="bg-[#8447AB] text-white font-bold text-lg py-3 px-12 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={processingPayment || totalFines <= 0} // Disable if processing or no fines
          >
            {processingPayment ? t("Processing Payment") : t("Pay Now")}
          </button>
        </div>
      </div>


      {/* Payment Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div 
            className={cm(
              "bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center",
              modalType === "success" && "border-t-4 border-green-500",
              modalType === "error" && "border-t-4 border-red-500",
              modalType === "info" && "border-t-4 border-blue-500"
            )}
          >
            <h3 className={cm(
              "text-xl font-bold mb-4",
              modalType === "success" && "text-green-700",
              modalType === "error" && "text-red-700",
              modalType === "info" && "text-blue-700"
            )}>
              {modalType === "success" ? t("Successful Payment") :
               modalType === "error" ? t("Payment Failed") :
               t("fines.modal.infoTitle")}
            </h3>
            <p className="text-gray-700 mb-6">{modalMessage}</p>
            <button
              onClick={closeModal}
              className={cm(
                "py-2 px-6 rounded-md font-medium text-white transition-colors duration-200",
                modalType === "success" && "bg-green-600 hover:bg-green-700",
                modalType === "error" && "bg-red-600 hover:bg-red-700",
                modalType === "info" && "bg-blue-600 hover:bg-blue-700"
              )}
            >
              {t("Close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}