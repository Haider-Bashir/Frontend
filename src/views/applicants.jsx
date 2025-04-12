import React, { useEffect, useState } from "react";
import axios from "axios";
import ManagerLayout from "../components/ManagerLayout";
import PersonalInfoModal from "../components/PersonalInfoModal";
import {Link, useNavigate} from "react-router-dom"; // Use Manager ManagerLayout

const MyApplicants = () => {
    const [branchDetails, setBranchDetails] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBranchDetails();
    }, []);

    useEffect(() => {
        if (branchDetails?._id) {
            fetchApplicants(branchDetails._id);
        }
    }, [branchDetails]);

    const fetchBranchDetails = async () => {
        try {
            // Extract manager details from local storage
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user || !user.id) {
                setError("Manager ID not found.");
                setLoading(false);
                return;
            }

            const managerId = user.id; // Get manager ID

            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/manager/my-branch`, {
                params: { managerId }, // Send managerId as query param
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });

            if (response.data) {
                setBranchDetails(response.data);
                fetchApplicants(response.data._id); // Fetch applicants for this branch
            } else {
                setError("Not in any branch yet.");
            }
        } catch (error) {
            console.error("Error fetching branch details:", error);
            setError("No branch is assigned to you.");
        } finally {
            setLoading(false);
        }
    };

    const fetchApplicants = async (branchId) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/applicants?branchId=${branchId}`);
            setApplicants(response.data);
        } catch (error) {
            console.error("Error fetching applicants:", error);
        }
    };

    const filteredApplicants = applicants.filter((applicant) =>
        applicant.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleApplicantSuccess = (applicantId) => {
        setShowPersonalInfoModal(false);  // Close modal
        navigate(`/applicant/${applicantId}`); // Redirect to the applicant details page
    };

    if (loading) {
        return <ManagerLayout>Loading My Branch...</ManagerLayout>;
    }

    return (
        <ManagerLayout>
            <h1 className="text-2xl font-bold text-[#274E6B] mb-6">My Applicants</h1>

            {error ? (
                <div className="bg-white p-6 rounded-md shadow-md">
                    <p className="text-red-500">{error}</p>
                </div>
            ) : (
                <>
                    {/* Applicants Section */}
                    <div className="bg-white p-6 rounded-md shadow-md">
                        <div className="flex justify-between">
                            <h2 className="text-xl font-bold text-[#274E6B]">Applicants</h2>
                            <button
                                className="px-4 py-2 bg-[#0B7ABE] text-white rounded-md"
                                onClick={() => setShowPersonalInfoModal(true)}
                            >
                                New Applicant
                            </button>
                        </div>


                        {/* Search Field */}
                        <div className="mt-4 mb-4">
                            <input
                                type="text"
                                placeholder="Search applicants..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#274E6B]"
                            />
                        </div>

                        {/* Applicants Table */}
                        <table className="w-full border-collapse border border-gray-300 rounded-md">
                            <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Phone</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredApplicants.length > 0 ? (
                                filteredApplicants.map((applicant) => (
                                    <tr key={applicant._id}>
                                        <td className="border border-gray-300 px-4 py-2">{applicant.name}</td>
                                        <td className="border border-gray-300 px-4 py-2">{applicant.email}</td>
                                        <td className="border border-gray-300 px-4 py-2">{applicant.phoneNumber}</td>
                                        <td className="border border-gray-300 px-4 py-2">{applicant.status}</td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <button onClick={() => navigate(`/applicant/${applicant._id}`)} className="px-3 py-1 bg-[#0B7ABE] text-white rounded-md hover:bg-[#086198]">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="border border-gray-300 px-4 py-2 text-center text-gray-500">
                                        No applicants found.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {showPersonalInfoModal && <PersonalInfoModal onClose={() => setShowPersonalInfoModal(false)} onSuccess={handleApplicantSuccess} />}
        </ManagerLayout>
    );
};

export default MyApplicants;
