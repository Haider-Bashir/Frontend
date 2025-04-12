import React, {useState, useEffect, useRef} from "react";
import axios from "axios";
import { MdDelete } from "react-icons/md"; // Import dustbin (delete) icon

const Processing = ({ applicant, fetchApplicant, nextStep, prevStep }) => {
    const [status, setStatus] = useState("Pending");
    const [notes, setNotes] = useState(""); // Single note input
    const [notesArray, setNotesArray] = useState([]); // Array to store multiple notes
    const [attestation, setAttestation] = useState({
        board: "Pending",
        ibcc: "Pending",
        hec: "Pending",
        mofa: "Pending",
        consulate: "Pending",
        apostille: "Pending",
        filePreparation: "Pending",
        embassyAppointmentFile: "",
        fileToEmbassy: "",
    });
    const [visaStatus, setVisaStatus] = useState("Pending");
    const [offerLetterStatus, setOfferLetterStatus] = useState("no");
    const [offerLetterReceived, setOfferLetterReceived] = useState("no");

    const [offerLetterFile, setOfferLetterFile] = useState(null);
    const [offerLetterFileName, setOfferLetterFileName] = useState("");
    const [offerLetterFilePath, setOfferLetterFilePath] = useState("");

    const [confirmationInvoiceFile, setConfirmationInvoiceFile] = useState(null);
    const [confirmationInvoiceFilePath, setConfirmationInvoiceFilePath] = useState("");
    const [confirmationInvoiceFileName, setConfirmationInvoiceFileName] = useState("");

    const [embassyAppointmentFile, setEmbassyAppointmentFile] = useState(null);
    const [embassyAppointmentFilePath, setEmbassyAppointmentFilePath] = useState("");
    const [embassyAppointmentFileName, setEmbassyAppointmentFileName] = useState("");

    const fileInputRef = useRef(null);

    // Re-fetch the applicant data when the component mounts or when the applicant changes
    useEffect(() => {
        if (applicant) {
            setNotesArray(applicant.processingNotes || []); // Set notes array if available
            setStatus(applicant.status || "Pending"); // Set the status if available

            // Check if there is processing data in the applicant
            if (applicant.processing.length > 0) {
                const processing = applicant.processing[0]; // Get the first (and only) processing entry

                setAttestation(processing.attestation || {});
                setVisaStatus(processing.visaStatus || "Pending");
                setOfferLetterReceived(processing.offerLetterReceived || null);
                setOfferLetterStatus(processing.applyForOfferLetterStatus || "no");

                setOfferLetterFileName(processing.offerLetterFileName || null);
                setOfferLetterFilePath(processing.offerLetterFilePath || null);

                setConfirmationInvoiceFileName(processing.confirmationInvoiceFileName || null);
                setConfirmationInvoiceFilePath(processing.confirmationInvoiceFilePath || null);

                setEmbassyAppointmentFileName(processing.embassyAppointmentFileName || null);
                setEmbassyAppointmentFilePath(processing.embassyAppointmentFilePath || null);
            }
        }
    }, [applicant]); // This will re-fetch every time the applicant data is updated

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const currentTime = new Date().toISOString();

            // Send status, processingNotes, and other form data
            await axios.post(`${process.env.REACT_APP_API_URL}/api/applicants/${applicant._id}/processing`, {
                status,
                processingNotes: notesArray,
                attestation,
                visaStatus,
                applyForOfferLetterStatus: offerLetterStatus,
                offerLetterReceived: offerLetterReceived,

                offerLetterFile: offerLetterFile,
                offerLetterFileName: offerLetterFileName,
                offerLetterFilePath: offerLetterFilePath,

                confirmationInvoiceFile: confirmationInvoiceFile,
                confirmationInvoiceFileName: confirmationInvoiceFileName,
                confirmationInvoiceFilePath: confirmationInvoiceFilePath,

                embassyAppointmentFile: embassyAppointmentFile,
                embassyAppointmentFileName: embassyAppointmentFileName,
                embassyAppointmentFilePath: embassyAppointmentFilePath,

                saveTime: currentTime,
            }, {
                headers: {
                    'Content-Type': "multipart/form-data",
                }
            });

            alert("Processing Updated!");
            fileInputRef.current.value = "";
            fetchApplicant(); // Refresh the data after updating
        } catch (error) {
            console.error("Error saving processing status:", error);
        }
    };

    const handleAddNote = () => {
        if (notes.trim() !== "") {
            const newNote = { note: notes, saveTime: new Date().toISOString() };

            // Check if the note already exists in the array
            const isDuplicate = notesArray.some(
                (existingNote) =>
                    existingNote.note === newNote.note && existingNote.saveTime === newNote.saveTime
            );

            if (!isDuplicate) {
                setNotesArray([...notesArray, newNote]);
                setNotes(""); // Clear input after adding note
            } else {
                console.log("Duplicate note detected, not adding it again.");
            }
        }
    };

    const handleDeleteNote = async (index, noteId) => {
        try {
            // Remove the note from the frontend
            const updatedNotes = notesArray.filter((_, i) => i !== index);
            setNotesArray(updatedNotes); // Update the notes state to remove the deleted note

            // Send a request to the backend to delete the note
            await axios.post(`${process.env.REACT_APP_API_URL}/api/applicants/${applicant._id}/processing/deleteNote`, {
                noteId: noteId, // Pass the noteId to be deleted
            });

            await fetchApplicant();
            alert("Note deleted successfully!");
        } catch (error) {
            console.error("Error deleting note:", error);
            // Optionally restore the deleted note on failure
            setNotesArray(notesArray);
        }
    };

    // Handle File Uploads
    const handleFileChange = (e, type) => {
        const file = e.target.files[0];

        if (type === "offerLetter") {
            setOfferLetterFile(file);
            setOfferLetterFileName(file.name);
        } else if (type === "confirmationInvoice") {
            setConfirmationInvoiceFile(file);
            setConfirmationInvoiceFileName(file.name);
        } else if (type === "embassyAppointmentFile") {
            setEmbassyAppointmentFile(file);
            setEmbassyAppointmentFileName(file.name);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-[#274E6B] mb-4">Applicant Processing</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Status Select */}
                <div>
                    <label className="font-bold">Applicant Process Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-4 py-2 border rounded-md bg-[#F3F4F6]">
                        <option value="⏳ Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="COR">Conditional Offer Received</option>
                        <option value="UOR">Unconditional Offer Received</option>
                        <option value="MPCI">Mock Pre Cas Interviews Done</option>
                        <option value="PCI">Pre Cas Interview Done</option>
                        <option value="CAS Submitted">CAS Submitted</option>
                        <option value="CAS Received">CAS Received</option>
                        <option value="Visa Applied">Visa Applied</option>
                        <option value="Visa Received">Visa Received</option>
                        <option value="✅ Completed">Completed</option>
                    </select>
                </div>

                {/* Offer Letter Status */}
                <div>
                    <label className="font-bold">Apply for Offer Letter</label>
                    <select
                        value={offerLetterStatus}
                        onChange={(e) => setOfferLetterStatus(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md bg-[#F3F4F6]"
                    >
                        <option value="no">❌ No</option>
                        <option value="yes">✅ Yes</option>
                    </select>
                </div>

                {/* Offer Letter Received */}
                {offerLetterStatus === "yes" && (
                <div>
                    <label className="font-bold">Offer Letter Received?</label>
                    <select
                        value={offerLetterReceived}
                        onChange={(e) => setOfferLetterReceived(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md bg-[#F3F4F6]"
                    >
                        <option value="no">❌ No</option>
                        <option value="yes">✅ Yes</option>
                    </select>
                    {offerLetterReceived === "yes" && (
                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => handleFileChange(e, "offerLetter")}
                                className="w-full px-4 py-2 border rounded-md mt-2 bg-[#F3F4F6]"
                            />
                        </div>
                    )}
                </div>
                )}

                {offerLetterFileName && (
                    <div className="flex justify-between items-center border bg-gray-100 px-4 py-2 mb-2 rounded-md mt-2">
                        <span>{offerLetterFileName}</span>

                        <a
                            type="button"
                            href={`${process.env.REACT_APP_API_URL}/public${offerLetterFilePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-[#0B7ABE] hover:bg-[#274E8B] transition text-white rounded-md"
                        >
                            View
                        </a>
                    </div>
                )}

                {/* Confirmation Invoice PDF */}
                <div>
                    <label className="font-bold">Confirmation Invoice</label>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleFileChange(e, "confirmationInvoice")}
                        className="w-full px-4 py-2 border rounded-md mt-2 bg-[#F3F4F6]"
                    />

                    {confirmationInvoiceFileName && (
                        <div className="flex justify-between items-center border bg-gray-100 px-4 py-2 mb-2 rounded-md mt-2">
                            <span>{confirmationInvoiceFileName}</span>

                            <a
                                href={`${process.env.REACT_APP_API_URL}/public${confirmationInvoiceFilePath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-[#0B7ABE] hover:bg-[#274E8B] transition text-white rounded-md"
                            >
                                View
                            </a>
                        </div>
                    )}
                </div>

                {/* Attestation Status */}
                <div className="space-y-2">
                    <h3 className="font-bold">Attestation Status</h3>
                    {["board", "ibcc", "hec", "mofa", "consulate", "apostille", "filePreparation"].map((type) => (
                        <div key={type} className="flex justify-between items-center">
                            <label className="text-sm capitalize">{type}</label>
                            <select
                                value={attestation[type]}
                                onChange={(e) => setAttestation({ ...attestation, [type]: e.target.value })}
                                className="w-1/4 px-4 py-2 border rounded-md bg-[#F3F4F6]"
                            >
                                <option value="Pending">⏳ Pending</option>
                                <option value="Done">✅ Done</option>
                                <option value="NA">🚫 Not Applicable</option>
                            </select>
                        </div>
                    ))}
                </div>

                {/* Embassy Appointment and Visa Status */}
                <div>
                    <label className="font-bold">Embassy Appointment</label>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="w-full px-4 py-2 border rounded-md mt-2 bg-[#F3F4F6]"
                        onChange={(e) => handleFileChange(e, "embassyAppointmentFile")}
                    />

                    {embassyAppointmentFileName && (
                        <div className="flex justify-between items-center border bg-gray-100 px-4 py-2 mb-2 rounded-md mt-2">
                            <span>{embassyAppointmentFileName}</span>

                            <a
                                href={`${process.env.REACT_APP_API_URL}/public${embassyAppointmentFilePath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-[#0B7ABE] hover:bg-[#274E8B] transition text-white rounded-md"
                            >
                                View
                            </a>
                        </div>
                    )}

                </div>

                <div>
                    <label className="font-bold">Visa Status</label>
                    <select
                        value={visaStatus}
                        onChange={(e) => setVisaStatus(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md bg-[#F3F4F6]"
                    >
                        <option value="Pending">⏳ Pending</option>
                        <option value="Applied">✅ Applied</option>
                        <option value="Congrats">🎉 Congrats</option>
                        <option value="Better luck next time!">👍 Better luck next time!</option>
                    </select>
                </div>

                {/* Notes input */}
                <div className="space-y-2">
                    <label className="font-bold">Notes Management</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes"
                        className="w-full px-4 py-2 border rounded-md bg-[#F3F4F6]"
                    ></textarea>
                    <button
                        type="button"
                        onClick={handleAddNote}
                        className="px-4 py-2 bg-[#0B7ABE] text-white rounded-md"
                    >
                        Add Note
                    </button>

                    <div>
                        <h3 className="font-semibold">Notes:</h3>
                        <ul className="space-y-2">
                            {notesArray.map((noteObj, index) => (
                                <li key={index} className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200">
                                    <span className={`text-justify`}>{noteObj.note}</span> {/* Render only note */}
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteNote(index, noteObj._id)}
                                        className="text-gray-500 ml-2 hover:text-gray-800"
                                    >
                                        <MdDelete size={30} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <button type="submit" className="px-4 py-2 bg-[#0B7ABE] text-white rounded-md">Save</button>
            </form>
        </div>
    );
};

export default Processing;
