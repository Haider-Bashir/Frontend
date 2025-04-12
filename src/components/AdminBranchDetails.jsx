import React, { useEffect, useState } from "react";
import {useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import Layout from "../components/AdminLayout";
import PersonalInfoModal from "./PersonalInfoModal";
import {Line} from "react-chartjs-2";

const AdminBranchDetails = () => {
    const { id } = useParams();
    const [branchDetails, setBranchDetails] = useState(null);
    const [managerDetails, setManagerDetails] = useState(null);
    const [showManagerModal, setShowManagerModal] = useState(false);
    const [applicants, setApplicants] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchManager, setSearchManager] = useState("");
    const [showAddNewManagerModal, setShowAddNewManagerModal] = useState(false);
    const [managers, setManagers] = useState([]);

    // Define state variables for a manager form
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const navigate = useNavigate();

    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);

    const [showEditBranchModal, setShowEditBranchModal] = useState(false);
    const [showRemoveBranchModal, setShowRemoveBranchModal] = useState(false);
    const [editBranchData, setEditBranchData] = useState({
        name: "",
        city: "",
        phoneNumber: "",
        image: null,
    });
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchBranchDetails();
        fetchApplicants();
        fetchManagers();
        // eslint-disable-next-line
    }, [id]);

    useEffect(() => {
        // Dynamically filter managers based on search term
        if (searchManager.trim() !== "") {
            fetchFilteredManagers(searchManager);
        } else {
            fetchManagers(); // Fetch all managers if no search term
        }
    }, [searchManager]);

    const fetchBranchDetails = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/branches/${id}`);
            setBranchDetails(response.data);

            if (response.data.managerId) {
                const managerResponse = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/users/${response.data.managerId}`
                );
                setManagerDetails(managerResponse.data);
            } else {
                setManagerDetails(null);
            }
        } catch (error) {
            console.error("Error fetching branch details:", error);
        }
    };

    const fetchApplicants = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/applicants?branchId=${id}`);
            setApplicants(response.data);
        } catch (error) {
            console.error("Error fetching applicants:", error);
        }
    };

    const fetchFilteredManagers = async (searchTerm) => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/users?role=manager&search=${searchTerm}`
            );
            setManagers(response.data);
        } catch (error) {
            console.error("Error fetching filtered managers:", error);
        }
    };

    // Fetch the stats for the specific branch
    const fetchBranchStats = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/branches/${id}/stats`);
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching branch stats:", error);
        }
    };

    useEffect(() => {
        fetchBranchStats();
    }, [id]);

    const filteredApplicants = applicants.filter((applicant) =>
        applicant.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEditBranch = () => {
        // Pre-fill form with current branch details
        setEditBranchData({
            name: branchDetails.name,
            city: branchDetails.city,
            phoneNumber: branchDetails.phoneNumber,
            image: null, // Image upload will be optional
        });
        setShowEditBranchModal(true);
    };

    const handleEditBranchSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", editBranchData.name);
        formData.append("city", editBranchData.city);
        formData.append("phoneNumber", editBranchData.phoneNumber);
        if (editBranchData.image) {
            formData.append("image", editBranchData.image);
        }

        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/branches/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("Branch updated successfully!");
            setShowEditBranchModal(false);
            fetchBranchDetails(); // Refresh branch details
        } catch (error) {
            console.error("Error updating branch:", error);
            alert("Failed to update branch.");
        }
    };

    const handleRemoveBranch = async () => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/branches/${id}`);
            alert("Branch removed successfully!");
            setShowRemoveBranchModal(false);
            window.location.href = "/admin/branches";
        } catch (error) {
            console.error("Error removing branch:", error);
            alert("Failed to remove branch.");
        }
    };

    const handleViewManager = (manager) => {
        setManagerDetails(manager);
        setShowViewModal(true);
    };

    const handleEditManager = (manager) => {
        // Pre-fill form fields with manager details
        setFirstName(manager.firstName);
        setLastName(manager.lastName);
        setEmail(manager.email);
        setPhoneNumber(manager.phoneNumber || "");
        setAddress(manager.address || "");
        setCity(manager.city || "");
        setShowEditModal(true);
    };

    const handleRemoveManager = async () => {
        try {
            // Unlink the manager from the branch
            await axios.put(`${process.env.REACT_APP_API_URL}/api/branches/${id}/removeManager`);
            setManagerDetails(null); // Clear manager details from the state
            alert("Manager removed successfully!");
        } catch (error) {
            console.error("Error removing manager:", error);
            alert("Failed to remove manager.");
        }
    };

    const handleAddManager = () => {
        fetchManagers(); // Fetch managers before showing the modal
        setShowManagerModal(true);
    };

    const handleAddNewManager = async (e) => {
        e.preventDefault();
        try {
            // Validate fields
            let validationErrors = {};
            if (!firstName) validationErrors.firstName = "First name is required";
            if (!lastName) validationErrors.lastName = "Last name is required";
            if (!email) validationErrors.email = "Email is required";
            if (!password) validationErrors.password = "Password is required";
            if (password !== confirmPassword) validationErrors.confirmPassword = "Passwords do not match";
            if (!city) validationErrors.city = "City is required";

            await axios.post(`${process.env.REACT_APP_API_URL}/api/users/addManager`, {
                branchId: id,
                firstName,
                lastName,
                email,
                password,
                confirmPassword,
                phoneNumber,
                address,
                city,
            });
            alert("Manager added successfully!");
            setShowAddNewManagerModal(false);
            fetchManagers();
        } catch (error) {
            console.error("Error adding manager:", error);
            alert("Failed to add new manager.");
        }
    };

    const filteredManagers = managers.filter((manager) =>
        `${manager.firstName} ${manager.lastName}`.toLowerCase().includes(searchManager.toLowerCase())
    );

    const fetchManagers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users?role=manager`);
            setManagers(response.data); // Update the managers state
        } catch (error) {
            console.error("Error fetching managers:", error);
        }
    };

    const handleAssignManager = async (managerId) => {
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/branches/${id}/assignManager`, { managerId });
            alert("Manager assigned successfully!");
            fetchBranchDetails();
            setShowManagerModal(false);
        } catch (error) {
            console.error("Error assigning manager:", error);
            alert("Failed to assign manager.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditBranchData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setEditBranchData((prev) => ({ ...prev, image: e.target.files[0] }));
    };

    const handleApplicantSuccess = (applicantId) => {
        setShowPersonalInfoModal(false);  // Close modal
        navigate(`/applicant/${applicantId}`); // Redirect to the applicant details page
    };

    if (!branchDetails) {
        return <Layout>Loading Admin Branch Details...</Layout>;
    }

    return (
        <Layout>
            <div className="text-sm text-gray-600 mb-4">
                <span className="mr-2">Dashboard</span>
                <span className="text-gray-400">/</span>
                <a href="/admin/branches" className="mr-2 text-[#274E6B]">
                    Branches
                </a>
                <span className="text-gray-400">/</span>
                <span className="ml-2">{branchDetails.name}</span>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Branch Details Section */}
                <div className="flex bg-white p-6 rounded-md shadow-md mb-6">
                    <div className="w-1/3">
                        <img
                            src={`${process.env.REACT_APP_API_URL}/public${branchDetails.image}`}
                            alt={branchDetails.name}
                            className="w-full h-64 object-cover rounded-md"
                        />
                    </div>

                    <div className="ml-6 w-2/3">
                        <h1 className="text-3xl font-bold text-[#274E6B]">{branchDetails.name}</h1>
                        <p className="text-gray-600 mt-4">
                            <strong>City:</strong> {branchDetails.city}
                        </p>
                        <p className="text-gray-600 mt-2">
                            <strong>Phone Number:</strong> {branchDetails.phoneNumber || "N/A"}
                        </p>

                        <div className="mt-6 space-x-4">
                            <button onClick={handleEditBranch} className="px-4 py-2 bg-[#0B7ABE] text-white rounded-md hover:bg-[#086198]">
                                Edit
                            </button>
                            <button onClick={()=>setShowRemoveBranchModal(true)} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                                Remove
                            </button>
                        </div>
                    </div>
                </div>

                {/* Branch Manager Section */}
                <div className="bg-white p-6 rounded-md shadow-md mb-6">
                    <h2 className="text-3xl font-bold text-[#274E6B]">Branch Manager</h2>
                    {managerDetails ? (
                        <div className="mt-4">
                            <p>
                                <strong>Name:</strong> {managerDetails.firstName + " " + managerDetails.lastName}
                            </p>
                            <p>
                                <strong>Email:</strong> {managerDetails.email}
                            </p>
                            <p>
                                <strong>Phone:</strong> {managerDetails.phoneNumber || "N/A"}
                            </p>
                            <p>
                                <strong>City:</strong> {managerDetails.city}
                            </p>

                            {/* Action Buttons */}
                            <div className="mt-4 space-x-4">
                                <button
                                    onClick={() => handleViewManager(managerDetails)}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => handleEditManager(managerDetails)}
                                    className="px-4 py-2 bg-[#0B7ABE] text-white rounded-md hover:bg-[#086198]"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => setShowManagerModal(true)}
                                    className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                >
                                    Change Manager
                                </button>
                                <button
                                    onClick={handleRemoveManager}
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4">
                            <p>No manager assigned to this branch.</p>
                            <button
                                onClick={handleAddManager}
                                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                            >
                                Assign Manager
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {/* Revenue Box */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h3 className="text-xl font-semibold text-[#274E6B] mb-3">Branch Revenue</h3>
                    {stats && stats.revenuePerCurrency && stats.revenuePerCurrency.length > 0 ? (
                        <ul className="space-y-2 text-gray-800 text-base">
                            {stats.revenuePerCurrency.map((item) => (
                                <li key={item._id} className="flex justify-between">
                                    <span className="font-bold">{item._id}</span>
                                    <span>{item.total.toLocaleString()} /-</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-400">Loading or no data</p>
                    )}
                </div>

                {/* Total Applicants Box */}
                <div className="bg-white p-6 rounded-xl shadow-sm border ">
                    <h3 className="text-xl font-semibold text-[#274E6B] mb-2">Total Applicants</h3>
                    <div className="text-4xl font-bold text-gray-800 flex flex-col justify-center items-center">
                        {stats ? stats.totalApplicants : '...'}
                    </div>
                </div>

                {/* Visa Type Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h3 className="text-xl font-semibold text-[#274E6B] mb-3">Applicants by Visa Type</h3>
                    <div className="w-full h-64">
                        {stats && stats.applicantsByVisaType ? (
                            <Line
                                data={{
                                    labels: stats.applicantsByVisaType.map((item) => item._id),
                                    datasets: [
                                        {
                                            label: 'Number of Applicants',
                                            data: stats.applicantsByVisaType.map((item) => item.count),
                                            fill: false,
                                            borderColor: 'rgba(75, 192, 192, 1)',
                                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                            tension: 0.3,
                                            pointRadius: 4,
                                            pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                                        },
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                            labels: {
                                                color: '#274E6B',
                                                font: {
                                                    size: 12,
                                                    weight: 'bold',
                                                },
                                            },
                                        },
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                stepSize: 1,
                                            },
                                        },
                                    },
                                }}
                            />
                        ) : (
                            <p className="text-sm text-gray-400">Loading chart...</p>
                        )}
                    </div>
                </div>
            </div>


            {/* Applicants Section */}
            <div className="bg-white p-6 rounded-md shadow-md mt-5">
                <div className="flex justify-between">
                    <h2 className="text-xl font-bold text-[#274E6B]">Applicants</h2>
                    <button
                        className="px-4 py-2 bg-[#0B7ABE] text-white rounded-md hover:bg-[#086198]"
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
                <table className="w-full border-collapse border border-gray-300">
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
                                    <button
                                        onClick={() => navigate(`/admin/applicant/${applicant._id}`)}
                                        className="px-3 py-1 bg-[#0B7ABE] text-white rounded-md hover:bg-[#086198]"
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center text-gray-500 py-4">
                                No applicants found for this branch.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {showViewModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold text-[#274E6B] mb-4">Manager Details</h2>
                        <p><strong>Name:</strong> {managerDetails.firstName + " " + managerDetails.lastName}</p>
                        <p><strong>Email:</strong> {managerDetails.email}</p>
                        <p><strong>Phone:</strong> {managerDetails.phoneNumber}</p>
                        <p><strong>Address:</strong> {managerDetails.address}</p>
                        <p><strong>City:</strong> {managerDetails.city}</p>
                        <button
                            onClick={() => setShowViewModal(false)}
                            className="mt-4 px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold text-[#274E6B] mb-4">Edit Manager</h2>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    const token = localStorage.getItem("token");
                                    const response = await axios.put(
                                        `${process.env.REACT_APP_API_URL}/api/users/${managerDetails._id}`,
                                        {
                                            firstName,
                                            lastName,
                                            email,
                                            phoneNumber,
                                            address,
                                            city,
                                        },
                                        {
                                            headers: {
                                                Authorization: `Bearer ${token}`,
                                            },
                                        }
                                    );
                                    setManagerDetails(response.data); // Update the state with the new manager details
                                    setShowEditModal(false);
                                    alert("Manager updated successfully!");
                                } catch (error) {
                                    console.error("Error updating manager:", error);
                                    alert(error.response?.data?.message || "Failed to update manager.");
                                }
                            }}
                            className="space-y-4"
                        >
                            <input
                                type="text"
                                placeholder="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md"
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Phone Number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md"
                            />
                            <input
                                type="text"
                                placeholder="Address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md"
                            />
                            <input
                                type="text"
                                placeholder="City"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md"
                                required
                            />
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-[#0B7ABE] text-white rounded-md hover:bg-[#086198]"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showManagerModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold text-[#274E6B]">Assign Manager</h2>
                        <input
                            type="text"
                            placeholder="Search manager..."
                            value={searchManager}
                            onChange={(e) => setSearchManager(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md mt-4"
                        />
                        <table className="w-full mt-4">
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>City</th>
                                <th>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredManagers.map((manager) => (
                                <tr key={manager._id}>
                                    <td>{manager.firstName} {manager.lastName}</td>
                                    <td>{manager.city}</td>
                                    <td>
                                        <button
                                            onClick={() => handleAssignManager(manager._id)}
                                            className="px-2 py-1 bg-[#0B7ABE] text-white rounded-md hover:bg-[#086198]"
                                        >
                                            Assign
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <div className="mt-4 space-x-2">
                            <button
                                onClick={() => setShowAddNewManagerModal(true)}
                                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                            >
                                Add New Manager
                            </button>
                            <button
                                onClick={() => setShowManagerModal(false)}
                                className="mt-4 mr-2 px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAddNewManagerModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold text-[#274E6B]">Add New Manager</h2>
                        <form onSubmit={handleAddNewManager} className="space-y-4">
                            <input
                                type="text"
                                placeholder="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                className="w-full px-4 py-2 border rounded-md"
                            />
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                className="w-full px-4 py-2 border rounded-md"
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2 border rounded-md"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2 border rounded-md"
                            />
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2 border rounded-md"
                            />
                            <input
                                type="text"
                                placeholder="Phone Number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md"
                            />
                            <input
                                type="text"
                                placeholder="Address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md"
                            />
                            <input
                                type="text"
                                placeholder="City"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                required
                                className="w-full px-4 py-2 border rounded-md"
                            />
                            <div className="mt-4 space-x-2">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#0B7ABE] text-white rounded-md hover:bg-[#086198]"
                                >
                                    Add Manager
                                </button>
                                <button
                                    onClick={() => setShowAddNewManagerModal(false)}
                                    className="mt-4 mr-2 px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                                >
                                    Close
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Branch Modal */}
            {showEditBranchModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white w-96 p-6 rounded-md shadow-md">
                        <h2 className="text-xl font-bold text-[#274E6B] mb-4">Edit Branch</h2>
                        <form onSubmit={handleEditBranchSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Branch Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editBranchData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#274E6B]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={editBranchData.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#274E6B]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={editBranchData.phoneNumber}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#274E6B]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Branch Image</label>
                                <input
                                    type="file"
                                    name="image"
                                    onChange={handleFileChange}
                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#274E6B]"
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEditBranchModal(false)}
                                    className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#0B7ABE] text-white rounded-md hover:bg-[#086198]"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Remove Branch Confirmation Modal */}
            {showRemoveBranchModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white w-80 p-6 rounded-md shadow-md">
                        <h2 className="text-xl font-bold text-red-500 mb-4">Confirm Removal</h2>
                        <p>Are you sure you want to remove this branch?</p>
                        <div className="mt-6 flex justify-end space-x-4">
                            <button
                                onClick={() => setShowRemoveBranchModal(false)}
                                className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRemoveBranch}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showPersonalInfoModal && <PersonalInfoModal onClose={() => setShowPersonalInfoModal(false)} onSuccess={handleApplicantSuccess} id={id}/>}
        </Layout>
    );
};

export default AdminBranchDetails;
