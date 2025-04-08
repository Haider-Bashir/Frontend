import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminLayout from "../../components/AdminLayout";

const AdminApplicantsPage = () => {
    const navigate = useNavigate();
    const [applicants, setApplicants] = useState([]);
    const [, setLoading] = useState(true);
    const [, setError] = useState("");

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedBranch, setSelectedBranch] = useState("");
    const [selectedUniversity, setSelectedUniversity] = useState("");

    // Sorting
    const [sortField, setSortField] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");

    useEffect(() => {
        fetchApplicants();
    }, []);

    const fetchApplicants = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(`${process.env.REACT_APP_URL_BACKEND}/api/applicants`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Fetch branches based on branchId and attach the branch name to each applicant
            const branchIds = [...new Set(response.data.map(a => a?.branchId))]; // Collect unique branchIds
            const branchNamesResponse = await axios.get(`${process.env.REACT_APP_URL_BACKEND}/api/branches`, {
                params: { branchIds: branchIds }, // Assuming backend can accept and return multiple branch names
                headers: { Authorization: `Bearer ${token}` },
            });

            const branchNames = branchNamesResponse.data.reduce((acc, branch) => {
                acc[branch._id.toString()] = branch.name; // Mapping branchId to branch name
                return acc;
            }, {});

            const applicantsWithBranchNames = response.data.map(applicant => ({
                ...applicant,
                branchName: branchNames[applicant.branchId?.toString()] || "Unknown", // Add branch name to applicant
            }));

            setApplicants(applicantsWithBranchNames);
        } catch (error) {
            console.error("❌ Error fetching applicants:", error);
            setError("Failed to load applicants.");
        } finally {
            setLoading(false);
        }
    };

    // **Filtering Logic**
    const filteredApplicants = applicants.filter((applicant) => {
        return (
            (searchTerm === "" || applicant.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (selectedCountry === "" || applicant.futureEducationDetails?.country === selectedCountry) &&
            (selectedBranch === "" || applicant.branchName === selectedBranch) &&
            (selectedUniversity === "" || applicant.futureEducationDetails?.institute === selectedUniversity)
        );
    });

    // **Sorting Logic**
    const sortedApplicants = [...filteredApplicants].sort((a, b) => {
        let valueA, valueB;

        switch (sortField) {
            case "country":
                valueA = a.futureEducationDetails?.country?.toLowerCase() || "";
                valueB = b.futureEducationDetails?.country?.toLowerCase() || "";
                break;
            case "institute":
                valueA = a.futureEducationDetails?.institute?.toLowerCase() || "";
                valueB = b.futureEducationDetails?.institute?.toLowerCase() || "";
                break;
            case "branch":
                valueA = a.branchName?.toLowerCase() || "";
                valueB = b.branchName?.toLowerCase() || "";
                break;
            default:
                valueA = a[sortField]?.toLowerCase() || "";
                valueB = b[sortField]?.toLowerCase() || "";
                break;
        }

        return sortOrder === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
    });

    return (
        <AdminLayout>
            {/* Breadcrumbs */}
            <div className="text-sm text-gray-600 mb-4">
                <span className="mr-2">Dashboard</span>
                <span className="text-gray-400">/</span>
                <span className="ml-2">All Applicants</span>
            </div>

            <h1 className="text-2xl font-bold text-[#274E6B] mb-6">All Applicants</h1>

            <div className="p-8 bg-white rounded-md shadow-md">

                {/* Filters Section */}
                <div className="flex gap-4 mb-4 items-center">
                    <span className="text-gray-600 font-bold">Filter by:</span>

                    {/* Filter by Country */}
                    <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none cursor-pointer"
                    >
                        <option value="">Filter by Country</option>
                        {[...new Set(applicants.map((a) => a.futureEducationDetails?.country).filter(Boolean))].map((country, index) => (
                            <option key={index} value={country}>{country}</option>
                        ))}
                    </select>

                    {/* Filter by University */}
                    <select
                        value={selectedUniversity}
                        onChange={(e) => setSelectedUniversity(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none cursor-pointer"
                    >
                        <option value="">Filter by University</option>
                        {/* Remove empty values from the university list */}
                        {[...new Set(applicants.map((a) => a.futureEducationDetails?.institute))]
                            .filter(uni => uni) // Filters out empty, null or undefined values
                            .map((uni, index) => (
                                <option key={index} value={uni}>{uni}</option>
                            ))}
                    </select>

                    {/* Filter by Branch */}
                    <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none cursor-pointer"
                    >
                        <option value="">Filter by Branch</option>
                        {[...new Set(applicants.map((a) => a.branchName))].map((branchName, index) => (
                            <option key={index} value={branchName}>{branchName}</option>
                        ))}
                    </select>
                </div>

                {/* Sorting Section */}
                <div className="flex justify-start gap-6 items-center mb-4">
                    <span className="text-gray-600 font-bold">Sort by:</span>
                    <select
                        value={sortField}
                        onChange={(e) => setSortField(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none cursor-pointer"
                    >
                        <option value="name">Name</option>
                        <option value="country">Country</option>
                        <option value="branch">Branch</option>
                        <option value="institute">University</option>
                    </select>
                    <button
                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                        className="px-4 py-2 bg-[#0B7ABE] text-white rounded-md hover:bg-[#086198]"
                    >
                        {sortOrder === "asc" ? "▲ Ascending" : "▼ Descending"}
                    </button>
                </div>

                <div className="flex mb-4">
                    {/* Search by Name */}
                    <input
                        type="text"
                        placeholder="Search by Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border w-full border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#274E6B]"
                    />
                </div>

                {/* Applicants Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead className="bg-gray-200">
                        <tr>
                            <th className="border border-gray-300 px-4 py-2">#</th>
                            <th className="border border-gray-300 px-4 py-2">Name</th>
                            <th className="border border-gray-300 px-4 py-2">Phone</th>
                            <th className="border border-gray-300 px-4 py-2">Country</th>
                            <th className="border border-gray-300 px-4 py-2">University</th>
                            <th className="border border-gray-300 px-4 py-2">Branch</th>
                            <th className="border border-gray-300 px-4 py-2">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sortedApplicants.length > 0 ? (
                            sortedApplicants.map((applicant, index) => {
                                // If futureEducationDetails.institute is empty, set it to "Not Decided Yet"
                                const university = applicant.futureEducationDetails?.institute || "Not Decided Yet";

                                return (
                                    <tr key={applicant._id} className="hover:bg-gray-100">
                                        <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                                        <td className="border border-gray-300 px-4 py-2">{applicant.name}</td>
                                        <td className="border border-gray-300 px-4 py-2">{applicant.phoneNumber}</td>
                                        <td className="border border-gray-300 px-4 py-2">{applicant.futureEducationDetails?.country || 'Not Decided'}</td>
                                        <td className="border border-gray-300 px-4 py-2">{university}</td>
                                        <td className="border border-gray-300 px-4 py-2">{applicant.branchName}</td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <button
                                                onClick={() => navigate(`/admin/applicant/${applicant._id}`)}
                                                className="px-3 py-1 bg-[#0B7ABE] text-white rounded-md hover:bg-[#086198] transition"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center py-4 text-gray-500">No applicants found</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminApplicantsPage;