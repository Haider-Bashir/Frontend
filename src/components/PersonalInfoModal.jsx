import React, {useEffect, useState} from "react";
import axios from "axios";

const PersonalInfoModal = ({ onClose, onSuccess, id }) => {
    const [formData, setFormData] = useState({
        name: "",
        cnic: "",
        phoneNumber: "",
        email: "",
        address: "",
        city: "",
        country: "",
        visaType: "",
        counselor: "",
        photo: null,
        branchId: ""
    });

    let branchId = null;

    if (id) {
        branchId = id;
    }

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchBranchId = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            if (user.role === "manager") {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/manager/my-branch`, {
                    params: { managerId: user.id }, // Use the managerId directly
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });

                if (response.data && response.data._id) {
                    setFormData(prev => ({ ...prev, branchId: response.data._id })); // Assign branchId
                }
            } else if (user.role === "admin" || user.role === "sub-admin") {
                setFormData(prev=>({ ...prev, branchId: branchId}));
            }
        } catch (error) {
            console.error("Error fetching branch ID:", error);
        }
    };

    useEffect(() => {
        fetchBranchId(); // Fetch branchId when the component mounts
    }, []);

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
        setError("Manager ID not found.");
        setLoading(false);
        return;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData((prev) => ({ ...prev, photo: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const formDataToSend = new FormData();
            for (const key in formData) {
                if (key === "photo") {
                    formDataToSend.append("photo", formData[key]); // File input
                } else {
                    formDataToSend.append(key, String(formData[key])); // Convert all other values to strings
                }
            }

            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/applicants`, formDataToSend, {
                headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${localStorage.getItem("token")}` },
            });

            console.log("Response Data:", response.data);  // Debugging log
            onSuccess(response.data._id); // Redirect to new applicant page
        } catch (error) {
            console.error("Error saving applicant:", error);
            setError("Error saving applicant. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-md shadow-md w-96">
                <h2 className="text-xl font-bold mb-4">Add New Applicant</h2>
                {error && <p className="text-red-500">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded-md mb-2"/>
                    <input type="text" name="cnic" placeholder="CNIC" value={formData.cnic} onChange={handleChange} required className="w-full p-2 border rounded-md mb-2"/>
                    <input type="text" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} required className="w-full p-2 border rounded-md mb-2"/>
                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded-md mb-2"/>
                    <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} className="w-full p-2 border rounded-md mb-2"/>
                    <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className="w-full p-2 border rounded-md mb-2"/>
                    <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} className="w-full p-2 border rounded-md mb-2"/>
                    <input type="text" name="counselor" placeholder="Counselor" value={formData.counselor} onChange={handleChange} className="w-full p-2 border rounded-md mb-2"/>

                    <select name="visaType" value={formData.visaType} onChange={handleChange} required className="w-full p-2 border rounded-md mb-2">
                        <option value="">Select Visa Type</option>
                        <option value="Work Permit">Work Permit</option>
                        <option value="Student Visa">Student Visa</option>
                        <option value="Visit Visa">Visit Visa</option>
                    </select>


                    <input type="file" accept="image/*" onChange={handleFileChange} required className="w-full p-2 border rounded-md mb-2"/>

                    <div className="flex justify-between mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-[#0B7ABE] text-white rounded-md hover:bg-[#086198]" disabled={loading}>
                            {loading ? "Saving..." : "Save & Proceed"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PersonalInfoModal;
