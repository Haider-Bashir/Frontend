import React, {useState, useEffect, useCallback, useRef} from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminLayout from "../../components/AdminLayout";
import StudentInvoice from "../../components/invoice/student_invoice";
import {MdClose, MdPrint} from "react-icons/md"; // Assuming you have this component to render the invoice

const AdminViewApplicant = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [applicant, setApplicant] = useState(null);
    const [branch, setBranch] = useState(null);
    const [manager, setManager] = useState(null);
    const [payments, setPayments] = useState({}); // Grouped payments by batchId
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showInvoicePopup, setShowInvoicePopup] = useState(false); // Manage invoice popup
    const [invoiceDetails, setInvoiceDetails] = useState(null); // Invoice data
    const [isSubAdmin, setIsSubAdmin] = useState(false);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user?.role === 'sub-admin') {
            setIsSubAdmin(true);
        }
    }, []);

    const invoiceRef = useRef();

    const fetchApplicant = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/applicants/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setApplicant(response.data);

            if (response.data.branchId) {
                await fetchBranch(response.data.branchId, token);
            }

            setLoading(false); // ✅ Fix: Mark loading as done even on success
        } catch (error) {
            console.error("❌ Error fetching applicant:", error);
            setError("Failed to load applicant details.");
            setLoading(false);
        }
    }, [id]);


    useEffect(() => {
        fetchApplicant();
    }, [fetchApplicant]);

    // Fetch payments once the applicant data is fetched and _id is available
    useEffect(() => {
        if (applicant?._id) {
            const fetchPayments = async () => {
                try {
                    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/applicants/${applicant._id}/payments`);
                    const data = await response.json();

                    // ✅ Check if it's an array before reducing
                    if (Array.isArray(data)) {
                        groupPaymentsByBatchId(data);
                    } else {
                        setPayments({}); // Set empty payment object if no valid data
                    }
                } catch (error) {
                    console.error("Error fetching payments:", error);
                }
            };

            fetchPayments();
        }
    }, [applicant?._id]);

    const fetchBranch = async (branchId, token) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/branches/${branchId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setBranch(response.data);

            if (response.data.managerId) {
                fetchManager(response.data.managerId, token);
            }
        } catch (error) {
            console.error("❌ Error fetching branch:", error);
        }
    };

    const fetchManager = async (managerId, token) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/${managerId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setManager(response.data);
            setLoading(false);
        } catch (error) {
            console.error("❌ Error fetching manager:", error);
        }
    };

    // Group payments based on batchId
    const groupPaymentsByBatchId = (paymentsArray) => {
        const groupedPayments = paymentsArray.reduce((acc, payment) => {
            const batchId = payment.batchId;
            if (!acc[batchId]) {
                acc[batchId] = [];
            }
            acc[batchId].push(payment);
            return acc;
        }, {});

        setPayments(groupedPayments);
    };

    const handleViewInvoice = (batchId, paymentGroup) => {
        // Generate the invoice data for the batch
        const totalAmount = paymentGroup.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
        const invoiceData = {
            name: applicant.name,
            cnic: applicant.cnic,
            contact: applicant.phoneNumber,
            address: applicant.address,
            payments: paymentGroup,
            date: new Date().toLocaleDateString(),
            totalInWords: convertNumberToWords(totalAmount),
            agreedAmount: applicant.agreement?.agreedAmount,
            agreedAmountInWords: convertNumberToWords(applicant.agreement?.agreedAmount),
            agreedCurrency: applicant.agreement?.agreedCurrency,
        };

        setInvoiceDetails(invoiceData);
        setShowInvoicePopup(true);  // Show invoice popup
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

    // Close the invoice popup
    const handleClosePopup = () => {
        setShowInvoicePopup(false);
        setInvoiceDetails(null);
    };

    const formatNumberWithComma = (num) => {
        if (num == null) return "";
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const handlePrint = () => {
        const content = invoiceRef.current;

        if (!content) {
            console.error("❌ Invoice content not found!");
            return;  // Exit if the content is not ready
        } else {
            console.log(content);
        }

        // Create a new print window
        const printWindow = window.open('', '', 'width=800,height=600');

        if (printWindow) {
            // Write the content to the print window
            printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice Print</title>
                    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.1.2/dist/tailwind.min.css" rel="stylesheet"> <!-- Tailwind CDN -->
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
                            display: none; /* Hide action buttons while printing */
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
        } else {
            console.error("❌ Failed to open print window.");
        }
    };

    const handleDeleteApplicant = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this applicant? This action cannot be undone.");
        if (!confirmed) return;
    
        try {
            const token = localStorage.getItem("token");
    
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/applicants/${applicant._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            alert("Applicant deleted successfully.");
            navigate("/admin/applicants");
        } catch (error) {
            console.error("❌ Error deleting applicant:", error);
            alert("Failed to delete applicant. Please try again.");
        }
    };


    if (loading) return <AdminLayout>Loading...</AdminLayout>;
    if (error) return <AdminLayout><p className="text-red-500">{error}</p></AdminLayout>;

    return (
        <AdminLayout>
            <div className="p-8 bg-white rounded-md shadow-md">
                <button
                    onClick={() => navigate("/admin/applicants")}
                    className="px-4 py-2 mb-4 bg-gray-500 text-white rounded-md"
                >
                    ← Back to Applicants
                </button>

                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-[#274E6B] mb-6">Applicant Details</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate(`/applicant/${applicant._id}`)}
                            className="px-4 py-2 bg-[#0B7ABE] hover:bg-[#274E8B] text-white rounded-md"
                        >
                            Edit
                        </button>
                        <button
                            onClick={handleDeleteApplicant}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                        >
                            Delete
                        </button>
                    </div>
                </div>


                <div className="grid grid-cols-3 gap-6">
                    {/* Left Side - Profile Image */}
                    <div className="col-span-1 flex flex-col items-center">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Profile Picture</h3>
                        {applicant.photo ? (
                            <img
                                src={applicant.photo}
                                alt="Applicant"
                                className="w-40 h-40 object-cover rounded-md border"
                            />
                        ) : (
                            <div className="w-32 h-32 flex items-center justify-center bg-gray-200 text-gray-500 rounded-md border">
                                No Image
                            </div>
                        )}
                    </div>

                    {/* Right Side - Details */}
                    <div className="col-span-2">
                        <h2 className="text-xl font-bold text-[#274E6B] mb-4">{applicant.name}</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <p><strong>Email:</strong> {applicant.email}</p>
                            <p><strong>Phone:</strong> {applicant.phoneNumber}</p>
                            <p><strong>CNIC:</strong> {applicant.cnic}</p>
                            <p><strong>Address:</strong> {applicant.address}</p>
                            <p><strong>City:</strong> {applicant.city}</p>
                            <p><strong>Country:</strong> {applicant.country}</p>
                            <p><strong>Visa Type:</strong> {applicant.visaType}</p>
                            <p><strong>Qualification:</strong> {applicant.qualification}</p>
                        </div>

                        <hr className="mt-5 bg-black"/>

                        {/* Branch & Manager Details */}
                        <h3 className="text-lg font-bold text-[#274E6B] mt-6 mb-5">Branch & Manager</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <p>
                                <strong>Branch:</strong>{" "}
                                {branch ? (
                                    <button
                                        onClick={() => navigate(`/admin/branches/${branch._id}`)}
                                        className="text-blue-600 underline hover:text-blue-800"
                                    >
                                        {branch.name}
                                    </button>
                                ) : (
                                    "N/A"
                                )}
                            </p>

                            <p><strong>Manager:</strong> {manager ? `${manager.firstName} ${manager.lastName}` : "N/A"}</p>

                            <p><strong>Counselor:</strong> {applicant.counselor || "N/A"}</p><br />


                            <p><strong>Agreed Amount: </strong>{ applicant.agreement?.agreedAmount ? (formatNumberWithComma(applicant.agreement?.agreedAmount) + ' ' + applicant.agreement?.agreedCurrency + ' /-') : 'Not Decided Yet'}</p>
                            <p><strong>Agreed Amount In Words: </strong>{ applicant.agreement?.agreedAmount ? (convertNumberToWords(applicant.agreement?.agreedAmount) + ' ' + applicant.agreement?.agreedCurrency + ' Only') : 'Not Decided Yet'}</p>
                        </div>

                        <hr className="mt-5 bg-black"/>

                        <h3 className="text-lg font-bold text-[#274E6B] mt-6 mb-5">Future Education Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <p><strong>Country:</strong> {applicant.futureEducationDetails?.country || "N/A"}</p>
                            <p><strong>City:</strong> {applicant.futureEducationDetails?.city || "N/A"}</p>
                            <p><strong>Institute:</strong> {applicant.futureEducationDetails?.institute || "N/A"}</p>
                            <p><strong>Course:</strong> {applicant.futureEducationDetails?.course || "N/A"}</p>
                            <p><strong>Intake:</strong> {applicant.futureEducationDetails?.intake || "N/A"}</p>
                        </div>
                        <hr className="mt-5 bg-black"/>
                    </div>
                </div>

                {/* Documents Section */}
                <h3 className="text-lg font-bold text-[#274E6B] mt-6">Documents</h3>
                {applicant.documents?.length > 0 ? (
                    <ul className="mt-2">
                        {applicant.documents.map((doc, index) => (
                            <li key={index} className="flex justify-between border p-2 rounded-md mb-2 bg-[#F3F4F6]">
                                <span className="text-gray-700 font-bold">{doc.title}</span>
                                <a
                                    href={doc.path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1 bg-[#0B7ABE] hover:bg-[#274E8B] text-white rounded-md"
                                        >
                                        View
                                        </a>
                                        </li>
                                        ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No documents uploaded.</p>
                            )}

                {/* Processing Section */}
                <h3 className="text-lg font-bold text-[#274E6B] mt-6">Processing</h3>
                <p><strong>Status:</strong> {applicant.status}</p>
                <p><strong>Notes:</strong></p>
                {applicant.processingNotes?.length > 0 ? (
                    <ul className="mt-2">
                        {applicant.processingNotes.map((note, index) => (
                            <li key={index} className="flex justify-between border p-2 rounded-md mb-2 bg-[#F3F4F6]">
                                <span className="text-gray-700 font-bold text-justify">{note.note}</span> {/* Accessing note.note */}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No processing notes available.</p>
                )}

                {!isSubAdmin && (
                    <div>
                        <h3 className="text-lg font-bold text-[#274E6B] mt-6">Payments</h3>
                        {Object.entries(payments).length > 0 ? (
                            Object.entries(payments).map(([batchId, paymentGroup], index) => (
                                <div key={index} className="mb-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-semibold text-md">Batch ID: {batchId}</h4>
                                        <button
                                            onClick={() => handleViewInvoice(batchId, paymentGroup)}
                                            className="px-4 py-2 bg-[#0B7ABE] hover:bg-[#274E8B] text-white rounded-md"
                                        >
                                            View Invoice
                                        </button>
                                    </div>
                                    <ul className="mt-2">
                                        {paymentGroup && paymentGroup.map((payment, paymentIndex) => (
                                            <li key={paymentIndex} className="flex justify-between border p-2 rounded-md mb-2 bg-[#F3F4F6]">
                                                <span className="text-gray-700 font-bold">{payment.purpose}</span>
                                                <p>{payment.amount} {payment.currency}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No payments available.</p>
                        )}
                    </div>
                )}

            </div>

            {/* Invoice Popup */}
            {showInvoicePopup && invoiceDetails && (
                <div className="mt-2 p-2 inset-0 flex justify-center items-center bg-black bg-opacity-50">
                    <div ref={invoiceRef} className="bg-white p-6 rounded-md shadow-lg w-full relative">
                        <StudentInvoice invoiceDetails={invoiceDetails} />
                        <div className="action-buttons mt-4 flex justify-between">
                            <button onClick={handlePrint} className="print-btn px-4 py-2 bg-green-500 text-white rounded-md">
                                <MdPrint /> Print
                            </button>
                            <button onClick={handleClosePopup} className="close-btn px-4 py-2 bg-gray-500 text-white rounded-md">
                                <MdClose /> Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminViewApplicant;
