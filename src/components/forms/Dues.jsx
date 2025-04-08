import React, { useState, useRef, useEffect } from "react";
import { MdClose, MdPrint } from "react-icons/md";
import StudentInvoice from "../invoice/student_invoice";
import { v4 as uuidv4 } from 'uuid';
import WorkInvoice from "../invoice/work_invoice";
import VisitInvoice from "../invoice/visit_invoice";

const Dues = ({ prevStep, applicant }) => {
    const [showInvoicePopup, setShowInvoicePopup] = useState(false);
    const [amount, setAmount] = useState("");
    const [purpose, setPurpose] = useState("");
    const [currency, setCurrency] = useState("PKR");
    const [refundable, setRefundable] = useState("no");
    const [comment, setComment] = useState("");
    const [rate, setRate] = useState("");
    const [invoiceDetails, setInvoiceDetails] = useState(null);
    const [savedPayments, setSavedPayments] = useState([]); // Saved payments fetched from DB
    const [newPayments, setNewPayments] = useState([]); // New payments added by the user
    const [showPaymentForm, setShowPaymentForm] = useState(false); // Toggle for showing payment form
    const [batchId, setBatchId] = useState(uuidv4());
    const [agreedAmount, setAgreedAmount] = useState(null);
    const [agreedCurrency, setAgreedCurrency] = useState("USD");
    const [isEditingAmount, setIsEditingAmount] = useState(false);

    const invoiceRef = useRef(); // Reference for the invoice content

    // Fetch saved payments when component mounts
    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/api/applicants/${applicant._id}/payments`);
                const data = await response.json();
                setSavedPayments(data); // Store the saved payments in the savedPayments array
            } catch (error) {
                console.error("Error fetching payments:", error);
            }
        };

        const fetchAgreedAmount = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/api/applicants/${applicant._id}/agreedAmount`);
                const data = await response.json();
                if (data) {
                    setAgreedAmount(data.amount);
                    setAgreedCurrency(data.currency);
                }
            } catch (error) {
                console.error("Error fetching agreed amount:", error);
            }
        };

        fetchPayments();
        fetchAgreedAmount();
    }, [applicant._id]);

    // Handle adding a new payment
    const handleAddPayment = async () => {
        if (!amount || !purpose || !currency) {
            alert("Please fill all fields (amount, purpose, and currency).");
            return;
        }

        const newPayment = {
            amount,
            purpose,
            currency,
            rate,
            refundable,
            applicantId: applicant._id,
            batchId,
        };

        // Add the new payment to the newPayments array
        setNewPayments((prevPayments) => [...prevPayments, newPayment]);

        // Reset the form inputs
        setAmount("");
        setPurpose("");
        setCurrency("USD");
        setRate("");
        setRefundable("no");
        setShowPaymentForm(false); // Hide payment form after adding
    };


    // Handle invoice generation and show the popup with data
    const handleGenerateInvoice = async () => {
        if (newPayments.length === 0) {
            alert("Please add at least one payment.");
            return;
        }

        const totalAmount = newPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

        // Prepare the invoice data
        const data = {
            name: applicant.name,
            cnic: applicant.cnic,
            contact: applicant.phoneNumber,
            address: applicant.address,
            payments: newPayments, // Only include new payments
            comment: comment,
            date: new Date().toLocaleDateString(),
            totalInWords: convertNumberToWords(totalAmount),
        };

        // Save new payments to the database
        try {
            // Loop through each new payment and send it individually to the backend
            for (let payment of newPayments) {
                const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/api/applicants/${applicant._id}/payments`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payment),
                });

                if (!response.ok) {
                    alert("Failed to save payment.");
                    return;
                }
            }

            data.futureEducationDetails = applicant.futureEducationDetails;
            data.agreedAmount = agreedAmount;
            data.agreedCurrency = agreedCurrency;
            data.batchId = batchId;
            data.visaType = applicant.visaType;
            data.totalAmount = totalAmount;

            // After successfully saving the payments, set the invoice details
            setInvoiceDetails(data);
            setShowInvoicePopup(true);  // Show invoice preview popup

            // Optionally, you can fetch the saved payments again to update the list (if needed)
            const savedPaymentsResponse = await fetch(`${process.env.REACT_APP_URL_BACKEND}/api/applicants/${applicant._id}/payments`);
            const savedPaymentsData = await savedPaymentsResponse.json();
            setSavedPayments(savedPaymentsData);  // Update saved payments if necessary
            setNewPayments('');
        } catch (error) {
            console.error("Error saving payments:", error);
            alert("Error saving payments. Please try again.");
        }
    };

    // Convert numbers to words (for total amount)
    const convertNumberToWords = (num) => {
        const ones = [
            "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
        ];
        const teens = [
            "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
        ];
        const tens = [
            "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
        ];
        const thousands = ["", "Thousand", "Million", "Billion", "Trillion", "Quadrillion", "Quintillion"];

        const convert = (n) => {
            if (n === 0) return "";

            if (n < 10) return ones[n];
            if (n < 20) return teens[n - 10];
            if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
            if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convert(n % 100) : "");

            let i = 0;
            let result = "";
            while (n > 0) {
                if (n % 1000 !== 0) {
                    result = convert(n % 1000) + " " + thousands[i] + " " + result;
                }
                n = Math.floor(n / 1000);
                i++;
            }
            return result.trim();
        };

        return convert(num);
    };


    const handleClosePopup = () => {
        setShowInvoicePopup(false);
        setInvoiceDetails(null);
    };

    // Handle Print - Only print the modal content
    const handlePrint = () => {
        const content = invoiceRef.current;

        // Create a new print window
        const printWindow = window.open('', '', 'width=800,height=600');

        // Write the content to the print window
        printWindow.document.write(`
        <html>
            <head>
                <title>Invoice Print</title>
                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.1.2/dist/tailwind.min.css" rel="stylesheet">  <!-- Tailwind CDN -->
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                    }
                    .invoice-container {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        width: 100%;
                    }
                    .invoice-header {
                        text-align: center;
                        font-size: 24px;
                        font-weight: bold;
                    }
                    .invoice-details th, .invoice-details td {
                        padding: 8px 12px;
                        border: 1px solid #ddd;
                        text-align: left;
                    }
                    .action-buttons {
                        display: none;  /* Hide action buttons while printing */
                    }
                </style>
            </head>
            <body>
                <div class="invoice-container">
                    ${content.innerHTML}
                </div>
            </body>
        </html>
    `);

        // Close the document and trigger the print dialog
        printWindow.document.close();
        printWindow.print();
    };

    // Function to handle deleting saved payments from the database
    const handleDeleteSavedPayment = async (paymentId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/api/applicants/${applicant._id}/payments/${paymentId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                // Remove the deleted payment from the frontend state
                setSavedPayments((prevPayments) => prevPayments.filter(payment => payment._id !== paymentId));
                alert("Payment deleted successfully!");
            } else {
                alert("Failed to delete payment.");
            }
        } catch (error) {
            console.error("Error deleting saved payment:", error);
            alert("Error deleting payment.");
        }
    };


    // Function to handle deleting a new payment (just remove it from the newPayments state)
    const handleDeleteNewPayment = (paymentIndex) => {
        setNewPayments((prevPayments) => prevPayments.filter((_, index) => index !== paymentIndex));
    };

    const handleViewInvoice = (batchId, payments) => {
        const totalAmount = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

        setInvoiceDetails({
            name: applicant.name,
            cnic: applicant.cnic,
            contact: applicant.phoneNumber,
            address: applicant.address,
            payments: payments,
            visaType : applicant.visaType,
            comment: comment,
            date: new Date().toLocaleDateString(),
            totalAmount: totalAmount,
            totalInWords: convertNumberToWords(totalAmount),
            futureEducationDetails: applicant.futureEducationDetails,
            agreedAmount: agreedAmount,
            agreedCurrency: agreedCurrency,
            agreedAmountInWords: convertNumberToWords(agreedAmount),
            batchId: batchId,
        });
        setShowInvoicePopup(true);  // Show invoice preview popup with the payments for the selected batch
    };

    const handleDeleteAllPayments = async (batchId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/api/applicants/${applicant._id}/payments/${batchId}/deleteAll`, {
                method: "DELETE",
            });

            if (response.ok) {
                // If successful, remove payments of the batchId from the frontend
                setSavedPayments((prevPayments) => {
                    // Check if prevPayments is an array before filtering
                    return Array.isArray(prevPayments)
                        ? prevPayments.filter(payment => payment.batchId !== batchId)
                        : [];
                });

                setNewPayments((prevPayments) => {
                    // Check if prevPayments is an array before filtering
                    return Array.isArray(prevPayments)
                        ? prevPayments.filter(payment => payment.batchId !== batchId)
                        : [];
                });

                alert("All payments for this batch have been deleted.");
            } else {
                alert("Failed to delete payments.");
            }
        } catch (error) {
            console.error("Error deleting all payments:", error);
            alert("Error deleting payments. Please try again.");
        }
    };

    const handleEditAgreedAmount = () => {
        setIsEditingAmount(true);
    };

    const handleSaveAgreedAmount = async () => {
        const data = { amount: agreedAmount, currency: agreedCurrency };
        try {
            const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/api/applicants/${applicant._id}/agreedAmount`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                setIsEditingAmount(false);
                const updatedData = await response.json();
                setAgreedAmount(updatedData.amount);
                setAgreedCurrency(updatedData.currency);
            } else {
                alert("Failed to save the agreed amount.");
            }
        } catch (error) {
            console.error("Error saving agreed amount:", error);
        }
    };

    const formatNumberWithComma = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-[#274E6B] mb-4">Payments & Dues</h2>

            {/* Agreement details */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold mb-5">Agreement Details</h3>

                {/* Show the Edit button only if the agreedAmount exists and we are not in editing mode */}
                {(!isEditingAmount) && (
                    <button onClick={handleEditAgreedAmount} className="px-4 py-2 bg-[#0B7ABE] hover:bg-[#086198] text-white rounded-md">
                        Edit
                    </button>
                )}
            </div>

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-semibold">Total Amount:</h3>
                <div className="flex items-center">

                    <span className="text-lg mr-4">
                        {agreedAmount !== null && agreedAmount !== undefined
                            ? `${agreedCurrency} ${formatNumberWithComma(agreedAmount)} /-`
                            : "No agreed amount set"}
                    </span>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-semibold">In Words:</h3>

                <span>{convertNumberToWords(agreedAmount)} {agreedCurrency} Only</span>
            </div>


            {/* Edit Agreed Amount Form */}
            {isEditingAmount && (
                <div className="mb-4">
                    <input
                        type="number"
                        value={agreedAmount}
                        onChange={(e) => setAgreedAmount(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md mb-2"
                        placeholder="Enter agreed amount"
                    />
                    <select
                        value={agreedCurrency}
                        onChange={(e) => setAgreedCurrency(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md mb-2"
                    >
                        <option value="PKR">PKR Rs</option>
                        <option value="USD">USD $</option>
                        <option value="GBP">GBP £</option>
                        <option value="EUR">EUR €</option>
                        <option value="AUD">AUD $</option>
                    </select>
                    <div className="flex gap-4">
                        <button onClick={handleSaveAgreedAmount} className="px-4 py-2 bg-[#0B7ABE] hover:bg-[#086198] text-white rounded-md">Save</button>
                        <button onClick={() => setIsEditingAmount(false)} className="px-4 py-2 bg-gray-500 text-white rounded-md">Cancel</button>
                    </div>
                </div>
            )}

            <hr className="mb-4 bg-gray-500 h-1 border-r-8"/>

            {/* Display Saved Payments */}
            {savedPayments.length > 0 ? (
                <div className="mt-4">
                    <h3 className="font-bold text-lg">Saved Payments</h3>
                    {Object.entries(
                        savedPayments.reduce((acc, payment) => {
                            // Group payments by batchId
                            if (!acc[payment.batchId]) {
                                acc[payment.batchId] = [];
                            }
                            acc[payment.batchId].push(payment);
                            return acc;
                        }, {})
                    ).map(([batchId, paymentsInBatch]) => (
                        <div key={batchId} className="mb-5">
                            <h4 className="font-semibold text-md text-gray-600 flex justify-between items-center">
                                Batch ID: {batchId}

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleViewInvoice(batchId, paymentsInBatch)}
                                        className="px-4 py-2 bg-[#0B7ABE] hover:bg-[#086198] text-white rounded-md"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAllPayments(batchId)} // Call delete function
                                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700"
                                    >
                                        Delete Payment
                                    </button>
                                </div>
                            </h4>
                            <div className="mt-4">
                                <div className="flex justify-between items-center bg-gray-100 px-4 py-2 mb-2 border rounded-md">
                                    <div className="flex flex-grow">
                                        <div className="w-1/5 text-center">#</div>
                                        <div className="w-2/5 text-center">Purpose</div>
                                        <div className="w-1/5 text-center">Amount</div>
                                        <div className="w-1/5 text-center">Currency</div>
                                        <div className="w-1/5 text-center">Rate</div>
                                    </div>
                                    <div className="text-right">
                                        Action
                                    </div>
                                </div>
                                {paymentsInBatch.map((payment, index) => (
                                    <div
                                        key={payment._id}
                                        className="flex justify-between items-center bg-gray-100 p-4 mb-2 border rounded-md"
                                    >
                                        <div className="flex flex-grow">
                                            <div className="w-1/5 text-center">{index + 1}</div>
                                            <div className="w-2/5 text-center">{payment.purpose}</div>
                                            <div className="w-1/5 text-center">{formatNumberWithComma(payment.amount)} /-</div>
                                            <div className="w-1/5 text-center">{payment.currency}</div>
                                            <div className="w-1/5 text-center">{formatNumberWithComma(payment.rate)} /-</div>
                                        </div>
                                        <div className="text-right">
                                            <button
                                                onClick={() => handleDeleteSavedPayment(payment._id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No saved payments found.</p>
            )}

            {/* Button to Toggle Payment Form */}
            <div className="mt-4">
                <button
                    type="button"
                    onClick={() => setShowPaymentForm(!showPaymentForm)}
                    className="px-4 py-2 bg-[#0B7ABE] hover:bg-[#086198] text-white rounded-md mt-4"
                >
                    {showPaymentForm ? "Cancel" : "New Payment"}
                </button>
            </div>

            {/* Payment Form (visible when 'New Payment' is clicked) */}
            {showPaymentForm && (
                <div className="mt-4">
                    <label className="block font-semibold">Amount:</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md bg-[#F3F4F6]"
                        placeholder="Enter amount"
                    />
                    <label className="block font-semibold mt-4">Purpose:</label>
                    <input
                        type="text"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md bg-[#F3F4F6]"
                        placeholder="Enter purpose"
                    />
                    <label className="block font-semibold mt-4">Currency:</label>
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md bg-[#F3F4F6]"
                    >
                        <option value="PKR">PKR Rs</option>
                        <option value="USD">USD $</option>
                        <option value="GBP">GBP £</option>
                        <option value="EUR">EUR €</option>
                        <option value="AUD">AUD $</option>
                    </select>
                    <label className="block font-semibold mt-4">Rate:</label>
                    <input
                        type="text"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md bg-[#F3F4F6]"
                        placeholder="Enter rate"
                    />
                    <label className="block font-semibold mt-4">Refundable:</label>
                    <select
                        value={refundable}
                        onChange={(e) => setRefundable(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md bg-[#F3F4F6]"
                    >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>

                    <label className="block font-semibold mt-4">Comment:</label>
                    <input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md bg-[#F3F4F6]"
                        placeholder="Enter comment"
                    />
                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={handleAddPayment}
                            className="px-4 py-2 bg-[#0B7ABE] hover:bg-[#086198] text-white rounded-md"
                        >
                            Add Payment
                        </button>
                    </div>
                </div>
            )}

            {/* Display New Payments Table */}
            {newPayments.length > 0 && (
                <div className="mt-4">
                    <h3 className="font-semibold text-lg">New Payments</h3>
                    <table className="min-w-full mt-4 table-auto border-collapse border border-gray-300">
                        <thead>
                        <tr>
                            <th className="px-4 py-2 border border-gray-300 text-center">Sr.</th>
                            <th className="px-4 py-2 border border-gray-300 text-center">Purpose</th>
                            <th className="px-4 py-2 border border-gray-300 text-center">Amount</th>
                            <th className="px-4 py-2 border border-gray-300 text-center">Currency</th>
                            <th className="px-4 py-2 border border-gray-300 text-center">Rate</th>
                            <th className="px-4 py-2 border border-gray-300 text-center">Refundable</th>
                            <th className="px-4 py-2 border border-gray-300 text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {newPayments.map((payment, index) => (
                            <tr key={index}>
                                <td className="px-4 py-2 border border-gray-300 text-center">{index + 1}</td>
                                <td className="px-4 py-2 border border-gray-300 text-center">{payment.purpose}</td>
                                <td className="px-4 py-2 border border-gray-300 text-center">{payment.amount}</td>
                                <td className="px-4 py-2 border border-gray-300 text-center">{payment.currency}</td>
                                <td className="px-4 py-2 border border-gray-300 text-center">{payment.rate}</td>
                                <td className="px-4 py-2 border border-gray-300 text-center">{payment.refundable}</td>
                                <td className="px-4 py-2 border border-gray-300 text-center">
                                    <button
                                        onClick={() => handleDeleteNewPayment(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Generate Invoice Button */}
            <div className="mt-4">
                <button
                    type="button"
                    onClick={handleGenerateInvoice}
                    className="px-4 py-2 bg-[#0B7ABE] hover:bg-[#086198] text-white rounded-md mt-4"
                >
                    Generate Invoice
                </button>
            </div>

            {/* Invoice Preview Popup */}
            {showInvoicePopup && invoiceDetails && (
                <div className="mt-2 p-2 inset-0 flex justify-center items-center bg-black bg-opacity-50">
                    <div ref={invoiceRef} className="bg-white p-6 rounded-md shadow-lg w-full relative">
                        {invoiceDetails.visaType === 'Student Visa'  && <StudentInvoice invoiceDetails={invoiceDetails} />}
                        {invoiceDetails.visaType === 'Work Permit'  && <WorkInvoice invoiceDetails={invoiceDetails} />}
                        {invoiceDetails.visaType === 'Visit Visa'  && <VisitInvoice invoiceDetails={invoiceDetails} />}
                        <div className="action-buttons mt-4 flex justify-between">
                            <button onClick={handlePrint} className="print-btn px-4 py-2 bg-green-500 text-white rounded-md">
                                Print
                            </button>
                            <button onClick={handleClosePopup} className="close-btn px-4 py-2 bg-gray-500 text-white rounded-md">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dues;
