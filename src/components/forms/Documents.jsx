import React, {useState, useEffect, useRef} from "react";
import axios from "axios";

const Documents = ({ applicant, fetchApplicant, nextStep, prevStep }) => {
    const [documents, setDocuments] = useState([]);
    const [newDocument, setNewDocument] = useState(null);
    const [documentTitle, setDocumentTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (applicant?.documents) {
            setDocuments(applicant.documents); // Load existing documents
        }
    }, [applicant]);

    const handleFileChange = (e) => {
        setNewDocument(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!newDocument || !documentTitle) return alert("Please enter a title and select a file.");

        setLoading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("document", newDocument);
            formData.append("title", documentTitle);

            await axios.post(
                `${process.env.REACT_APP_API_URL}/api/applicants/${applicant._id}/documents`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            setDocumentTitle(""); // Reset title field
            setNewDocument(null); // Reset file input
            fileInputRef.current.value = "";
            alert("Document uploaded successfully!");
            fetchApplicant(); // Refresh applicant data
        } catch (error) {
            console.error("Error uploading document:", error);
            setError("Failed to upload document.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (docId) => {
        if (!window.confirm("Are you sure you want to delete this document?")) return;

        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/applicants/${applicant._id}/documents/${docId}`);
            alert("Document deleted successfully!");
            fetchApplicant(); // Refresh applicant data
        } catch (error) {
            console.error("Error deleting document:", error);
            setError("Failed to delete document.");
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-[#274E6B] mb-4">Uploaded Documents</h2>

            {error && <p className="text-red-500">{error}</p>}

            {/* Display Existing Documents */}
            {documents.length > 0 ? (
                <ul className="mb-4">
                    {documents.map((doc, index) => (
                        <li key={index} className="flex justify-between items-center border p-2 rounded-md mb-2 bg-[#F3F4F6]">
                            <span className="text-gray-700 font-bold">{ index+1 + ' - ' + doc.title || `Document ${index + 1}`}</span>
                            <div className="flex gap-2">
                                <a href={doc.path}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="px-3 py-1 bg-[#0B7ABE] hover:bg-[#274E8B] transition text-white rounded-md">
                                    View
                                </a>
                                <button
                                    onClick={() => handleDelete(doc._id)}
                                    className="px-3 py-1 bg-red-500 hover:bg-red-700 text-white rounded-md">
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">No documents uploaded yet.</p>
            )}

            <hr className="mb-4 bg-gray-500 h-1 border-r-8"/>

            <h2 className="text-xl font-bold text-[#274E6B] mb-4">Insert Document</h2>

            {/* Upload New Document */}
            <form onSubmit={handleUpload} className="space-y-4">
                <input
                    type="text"
                    placeholder="Document Title"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md bg-[#F3F4F6]"
                    required
                />
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border rounded-md bg-[#F3F4F6]"
                    required
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-[#0B7ABE] hover:bg-[#274E8B] text-white rounded-md"
                    disabled={loading}>
                    {loading ? "Uploading..." : "Upload Document"}
                </button>
            </form>
        </div>
    );
};

export default Documents;
