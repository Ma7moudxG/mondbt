// app/student/[student_id]/fines/page.tsx
"use client"; // This component will run on the client-side

import React, { useState, useEffect } from "react";
import DataService from "@/services/dataService"; // Adjust path as necessary

// Helper function for conditional class names
const cm = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(" ");

interface StudentFinesPageProps {
  params: {
    student_id: string; // Next.js dynamic routes provide params as strings
  };
}

const StudentFinesPage: React.FC<StudentFinesPageProps> = ({ params }) => {
  const studentId = Number(params.student_id);
  const [totalFines, setTotalFines] = useState<number>(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("credit_card"); // Default to credit card

  useEffect(() => {
    if (!isNaN(studentId)) {
      // --- DEBUGGING LOGS START ---
      console.log("StudentFinesPage: useEffect triggered for studentId:", studentId);
      // --- DEBUGGING LOGS END ---

      // Fetch the total penalties for this student
      const fines = DataService.getTotalPenaltiesForStudent(studentId);

      // --- DEBUGGING LOGS START ---
      console.log("StudentFinesPage: Fines fetched from DataService:", fines);
      // --- DEBUGGING LOGS END ---
      setTotalFines(fines);
    }
  }, [studentId]); // Re-run when studentId changes

  const paymentMethods = [
    { id: "bank_transfer", label_en: "Bank Transfer", label_ar: "تحويل بنكي" },
    { id: "credit_card", label_en: "Credit Card", label_ar: "بطاقة ائتمان" },
    { id: "apple_pay", label_en: "Apple Pay", label_ar: "Apple pay" },
    {
      id: "fawateer_saddad",
      label_en: "Sadad Invoice",
      label_ar: "فاتورة سداد",
    },
  ];

  const handlePaymentMethodChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedPaymentMethod(event.target.value);
  };

  const handlePayNowClick = () => {
    if (selectedPaymentMethod) {
      // For now, just an alert. In a real app, this would be an API call.
      alert(
        `Initiating mock payment for ${totalFines} SAR using ${selectedPaymentMethod} for student ID: ${studentId}.`
      );
      // You can add navigation here if needed, e.g., router.push('/payment/success');
    } else {
      alert("الرجاء اختيار وسيلة الدفع"); // Please select a payment method
    }
  };

  if (isNaN(studentId)) {
    return <div className="text-center py-8">Invalid Student ID</div>;
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Outer container */}
      <div className="p-8 bg-white rounded-2xl flex flex-col gap-8 w-full max-w-md mx-auto">
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <h1 className="text-lg font-black text-[#8447AB]">Pay Fines</h1>

          <div className="flex justify-between items-center">
            <p className="text-lg font-medium text-[#7C8B9D]">Total Fines</p>
            <p className="text-xl font-bold text-[#4A4A4A]">
              {totalFines} SAR
            </p>{" "}
            {/* Use totalFines from state */}
          </div>
        </div>
        <hr />
        {/* Choose Payment Method Section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-bold text-[#7C8B9D] text-center">
            Payment Method
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={cm(
                  "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200",
                  selectedPaymentMethod === method.id
                    ? "border-[#6BBEA5] bg-[#6BBEA5]" // Selected style (background and border)
                    : "border-[#E0E0E0] bg-white hover:bg-gray-50" // Default/hover style
                )}
              >
                {/* --- FIX FOR TEXT COLOR START --- */}
                <span
                  className={cm(
                    "text-base font-medium",
                    selectedPaymentMethod === method.id
                      ? "text-white" // Text color white when selected
                      : "text-[#B5C0CD]" // Text color gray when not selected
                  )}
                >
                  {method.label_en} {/* Keeping label_en as per your latest code */}
                </span>
                {/* --- FIX FOR TEXT COLOR END --- */}
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedPaymentMethod === method.id}
                  onChange={handlePaymentMethodChange}
                  className={cm(
                    "h-5 w-5 rounded-full border-2",
                    selectedPaymentMethod === method.id
                      ? "border-white bg-white checked:bg-white checked:border-white checked:text-white " // Checked state
                      : "border-[#C4C4C4] bg-white text-transparent checked:bg-transparent" // Unchecked state, transparent to hide default radio fill
                  )}
                  // Hide default radio button visually, rely on custom styling of the label
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
            className="bg-[#8447AB] text-white font-bold text-lg py-3 px-12 rounded-xl hover:opacity-90 transition-opacity"
          >
            Pay now
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentFinesPage;