import React, { useEffect, useState } from "react";

const WorkInvoice = ({ invoiceDetails }) => {
    const [currentDateTime, setCurrentDateTime] = useState("");

    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getFullYear()}`;

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            const formattedDate = now.toLocaleString("en-GB", {
                weekday: "long", // "Monday"
                year: "numeric", // "2025"
                month: "long", // "March"
                day: "numeric", // "9"
                hour: "numeric", // "2"
                minute: "numeric", // "30"
                second: "numeric", // "00"
                hour12: true, // 12-hour format (AM/PM)
            });
            setCurrentDateTime(formattedDate);
        };

        updateDateTime();
        const intervalId = setInterval(updateDateTime, 1000); // Update every second

        return () => clearInterval(intervalId); // Clear interval on component unmount
    }, []);

    const formatNumberWithComma = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    return (
        <div className="invoice-container">
            <div className="flex items-center p-6 bg-white">
                {/* Logo on the left */}
                <div className="flex items-center">
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="w-20 h-20" // Adjust size as necessary
                    />
                </div>

                {/* Text centered */}
                <div className="flex flex-col items-center justify-center mx-auto">
                    <h1 className="text-2xl font-bold text-blue-900">THE RISERS CONSULTANCY</h1>
                    <p className="text-[#0B7ABE] text-lg">(PRIVATE) LIMITED</p>
                </div>
            </div>

            <div>
                <p className="text-[#0B7ABE] font-semibold">Date: {currentDateTime}</p>
            </div>

            {/* Director Info */}
            <div className="text-left mt-5 mb-5">
                <img src="/director.png" alt="director" className="w-100 h-12" />
            </div>

            <div className="flex justify-between items-center mb-6">
                <div className="text-xl font-bold">Invoice# {invoiceDetails.batchId}</div>
                <div className="text-xl font-bold">
                    {invoiceDetails.payments[0].currency} Rate: {invoiceDetails.payments[0].rate} /-
                </div>
            </div>

            <div className="mb-4">
                <div className="font-semibold text-lg mb-2">Client Detail:</div>
                <div className="grid grid-cols-3 gap-y-2">
                    {/* Row 1 */}
                    <div className="flex flex-row items-center bg-gray-100">
                        <p className="block font-bold">Name:</p>
                    </div>
                    <div className="col-span-2 flex flex-row items-center justify-start bg-gray-100">
                        <p className="w-full">{invoiceDetails.name}</p>
                    </div>

                    {/* Row 2 */}
                    <div className="flex flex-row items-center">
                        <p className="block font-bold">CNIC/Passport:</p>
                    </div>
                    <div className="col-span-2 flex flex-row items-center justify-start">
                        <p className="w-full">{invoiceDetails.cnic}</p>
                    </div>

                    {/* Row 3 */}
                    <div className="flex flex-row items-center bg-gray-100">
                        <p className="block font-bold">Contact:</p>
                    </div>
                    <div className="col-span-2 flex flex-row items-center justify-start bg-gray-100">
                        <p className="w-full">{invoiceDetails.contact}</p>
                    </div>

                    {/* Row 4 */}
                    <div className="flex flex-row items-center">
                        <p className="block font-bold">Address:</p>
                    </div>
                    <div className="col-span-2 flex flex-row items-center justify-start">
                        <p className="w-full">{invoiceDetails.address}</p>
                    </div>

                    {/* Row 5 */}
                    <div className="flex flex-row items-center bg-gray-100">
                        <p className="block font-bold">Total Agreed Amount:</p>
                    </div>
                    <div className="col-span-2 flex flex-row items-center justify-start bg-gray-100">
                        <p className="w-full">{formatNumberWithComma(invoiceDetails.agreedAmount) + ' ' + invoiceDetails.agreedCurrency} /-</p>
                    </div>

                    {/* Row 6 */}
                    <div className="flex flex-row items-center">
                        <p className="block font-bold">Agreed Amount In Words:</p>
                    </div>
                    <div className="col-span-2 flex flex-row items-center justify-start">
                        <p className="w-full">{invoiceDetails.agreedAmountInWords + ' ' + invoiceDetails.agreedCurrency} Only</p>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <table className="min-w-full table-auto border-collapse border border-gray-300">
                    <thead>
                    <tr>
                        <th className="px-4 py-2 border border-gray-300 text-center">Sr.</th>
                        <th className="px-4 py-2 border border-gray-300 text-center">Description</th>
                        <th className="px-4 py-2 border border-gray-300 text-center">Non-Refundable</th>
                        <th className="px-4 py-2 border border-gray-300 text-center">Refundable</th>
                        <th className="px-4 py-2 border border-gray-300 text-center">Remaining</th>
                    </tr>
                    </thead>
                    <tbody>
                    {invoiceDetails.payments.map((payment, index) => {
                        // If this is the first row, start with the total agreed amount
                        const previousRemaining = index === 0 ? invoiceDetails.agreedAmount : invoiceDetails.payments[index - 1].remainingAmount;

                        // Calculate the remaining amount by subtracting the current row's amount
                        const remainingAmount = previousRemaining - payment.amount;

                        // Attach the remaining amount to the payment for future rows
                        payment.remainingAmount = remainingAmount;

                        return (
                            <tr key={index} className={index % 2 === 0 ? "bg-gray-100" : ""}>
                                <td className="px-4 py-2 border border-gray-300 text-center">{index + 1}</td>
                                <td className="px-4 py-2 border border-gray-300 text-center">{payment.purpose}</td>

                                {/* Non-Refundable Column */}
                                <td className="px-4 py-2 border border-gray-300 text-center">
                                    {payment.refundable === "no" ? formatNumberWithComma(payment.amount) + " /-" : "0"}
                                </td>

                                {/* Refundable Column */}
                                <td className="px-4 py-2 border border-gray-300 text-center">
                                    {payment.refundable === "yes" ? formatNumberWithComma(payment.amount) + " /-" : "0"}
                                </td>

                                {/* Remaining Column - Dynamic calculation */}
                                <td className="px-4 py-2 border border-gray-300 text-center">
                                    {formatNumberWithComma(remainingAmount)} /-
                                </td>
                            </tr>
                        );
                    })}
                    <tr className="bg-gray-200">
                        <td colSpan="5" className="px-4 py-2 border border-gray-300 text-left">
                            <strong>Total In Numbers:</strong> {formatNumberWithComma(invoiceDetails.totalAmount) + ' ' + invoiceDetails.payments[0].currency} Only <br />

                            <strong>Total In Words:</strong> {invoiceDetails.totalInWords + ' ' + invoiceDetails.payments[0].currency} Only
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <div className="flex gap-2 mb-5 mt-5">
                <p className="font-bold">Comment: </p>
                <p>{invoiceDetails.comment}</p>
            </div>

            {/* Signature Section */}
            <div className="flex justify-between items-center mb-6">
                <div className="signature-section">
                    <p>____________________</p>
                    <p>Haider Basheer</p>
                </div>
                <div className="signature-section">
                    <p>____________________</p>
                    <p>{invoiceDetails.name}</p>
                </div>
            </div>

            <div className="flex flex-row items-center mt-8 w-full">
                {/* Contact Image */}
                <div className="flex items-center justify-center">
                    <img
                        src="/contact.png"
                        alt="Contact"
                        className="h-30" // Set fixed height
                    />
                </div>

                {/* Footer Image */}
                <div className="flex justify-center items-center w-full">
                    {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                    <img
                        src="/invoice_footer.png" // Ensure this is the correct image path
                        alt="Footer Image"
                        className="h-30 w-auto" // Set fixed height for alignment
                    />
                </div>
            </div>

            {/* Second Page Content */}
            <div className="second-page mt-16 mb-16">
                <div className="flex items-center p-6 bg-white">
                    {/* Logo on the left */}
                    <div className="flex items-center">
                        <img
                            src="/logo.png"
                            alt="Logo"
                            className="w-20 h-20" // Adjust size as necessary
                        />
                    </div>

                    {/* Text centered */}
                    <div className="flex flex-col items-center justify-center mx-auto">
                        <h1 className="text-2xl font-bold text-blue-900">THE RISERS CONSULTANCY</h1>
                        <p className="text-[#0B7ABE] text-lg">(PRIVATE) LIMITED</p>
                    </div>
                </div>

                <div className="text-justify mt-5">
                    This Agreement is drafted on <strong>{formattedDate}</strong> between <strong>The Risers Consultancy Pvt Ltd</strong> and <strong>{invoiceDetails.name}</strong> for the services of obtaining a <strong>{invoiceDetails.visaType}</strong> of <strong>{invoiceDetails.futureEducationDetails?.country}</strong>, hereinafter <strong>The Risers Consultancy Pvt Ltd</strong> known as a company, and as <strong>{invoiceDetails.name}</strong>.<br />
                    The client has agreed to the following terms and provided his documents for attestations of admissions and visa-related services.<br />

                    <strong>Obligations of Company:</strong>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>The Consultant will keep the applicant informed about the progress of the visa application.</li>
                    </ul>

                    <strong>No Win No Loss:</strong><br />
                    This agreement is entered into No Win No Loss. The total amount agreed for the <strong>{invoiceDetails.visaType}</strong> is <strong>{formatNumberWithComma(invoiceDetails.agreedAmount) + ' /- ' + invoiceDetails.agreedCurrency}</strong> which in word is <strong>{invoiceDetails.agreedAmountInWords + ' ' + invoiceDetails.agreedCurrency}</strong> only. The client has to Pay <strong>{formatNumberWithComma(invoiceDetails.totalAmount)  + ' /- ' + invoiceDetails.payments[0].currency}</strong> only, which in words is <strong>{invoiceDetails.totalInWords + ' ' + invoiceDetails.payments[0].currency}</strong> in advance and then pay tuition fee in time. <strong>The remaining balance should be paid within Seven days of receiving the entry visa.</strong><br />
                    In the event of visa refusal, the consultant agrees to refund the total amount paid by the client within a month. The refund process will be initiated immediately upon receiving official documents of visa refusal. In case of withdrawal by the client, he should pay consultancy fees and bear refund charges for everything.<br/>

                    <strong>Non-Refund:</strong>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>In the case where a visa is refused due to fake or fraudulent documents, the fee paid by the applicant will not be refunded.</li>
                        <li>If a applicant is found medically unfit in (Country) and shows fake documents, the above consideration will apply.</li>
                    </ul>
                    By signing on page 1 both parties agree to this agreement and these terms and conditions.
                </div>


                <div className="flex flex-row items-center mt-16 w-full">
                    {/* Contact Image */}
                    <div className="flex items-center justify-center">
                        <img
                            src="/contact.png"
                            alt="Contact"
                            className="h-30" // Set fixed height
                        />
                    </div>

                    {/* Footer Image */}
                    <div className="flex justify-center items-center w-full mb-14">
                        {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                        <img
                            src="/invoice_footer.png" // Ensure this is the correct image path
                            alt="Footer Image"
                            className="h-30 w-auto" // Set fixed height for alignment
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkInvoice;
