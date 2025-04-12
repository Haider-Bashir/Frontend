import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Layout from "../../components/AdminLayout";
import {useNavigate} from "react-router-dom";

const Managers = () => {
    const [managers, setManagers] = useState([]);
    const [branches, setBranches] = useState({});
    const [branchNamesMap, setBrancheNamesMap] = useState({});
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedManager, setSelectedManager] = useState(null);
    const [showAddNewManagerModal, setShowAddNewManagerModal] = useState(false);
    const [error, setError] = useState("");
    const [passwordVisible, setPasswordVisible] = useState({});

    // Define state variables for a manager form
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");

    useEffect(() => {
        fetchManagers();
        fetchBranches();
    }, []);

    // Fetch all managers
    const fetchManagers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users?role=manager`);
            setManagers(response.data);
        } catch (error) {
            console.error("Error fetching managers:", error);
        }
    };

    // Fetch all branches to find manager assignments
    const fetchBranches = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/branches`);
            const branchMap = {};
            const branchNamesMap = {};
            response.data.forEach((branch) => {
                if (branch.managerId) {
                    branchMap[branch.managerId] = branch._id;
                    branchNamesMap[branch._id] = branch.name;
                }
            });

            setBranches(branchMap);
            setBrancheNamesMap(branchNamesMap);
        } catch (error) {
            console.error("Error fetching branches:", error);
        }
    };

    const handleEditManager = (manager) => {
        setSelectedManager(manager);
        setShowEditModal(true);
    };

    const handleDeleteManager = async (manager) => {
        if (branches[manager._id]) {
            setError("Unassign the manager from the branch before deleting.");
            return;
        }

        if (window.confirm("Are you sure you want to delete this manager?")) {
            try {
                // Get the token from localStorage
                const token = localStorage.getItem("token");

                // Add the token to the headers of the DELETE request
                const response = await axios.delete(
                    `${process.env.REACT_APP_API_URL}/api/users/${manager._id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`, // Pass the token here
                        },
                    }
                );

                // Fetch the updated list of managers
                fetchManagers();
                alert("Manager deleted successfully!");
            } catch (error) {
                console.error("Error deleting manager:", error);
                alert("Failed to delete the manager.");
            }
        }
    };

    const handleUnassignManager = async (managerId) => {
        try {
            const branchId = branches[managerId]

            if (!branchId) {
                alert("No branch assigned to this manager.");
                return;
            }

            await axios.put(`${process.env.REACT_APP_API_URL}/api/branches/${branchId}/removeManager`);
            fetchManagers();
            fetchBranches();
            alert("Manager unassigned from the branch.");
        } catch (error) {
            console.error("Error unassigning manager:", error);
            alert("Failed to unassign the manager.");
        }
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

            await axios.post(`${process.env.REACT_APP_API_URL}/api/users/registerManager`, {
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

    const togglePasswordVisibility = (managerId) => {
        setPasswordVisible((prev) => ({
            ...prev,
            [managerId]: !prev[managerId],
        }));
    };

    return (
        <Layout>
            {/* Breadcrumbs */}
            <div className="text-sm text-gray-600 mb-4">
                <span className="mr-2">Dashboard</span>
                <span className="text-gray-400">/</span>
                <span className="ml-2">Managers</span>
            </div>

            <h1 className="text-2xl font-bold text-[#274E6B] mb-6">Managers</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}

            {/* Add Branch Button */}
            <div className="mb-6">
                <button
                    onClick={() => setShowAddNewManagerModal(true)}
                    className="bg-[#0B7ABE] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#086198] transition"
                >
                    Add New Manager
                </button>
            </div>

            <table className="w-full bg-white rounded-md shadow-md mb-6">
                <thead>
                <tr className="bg-gray-100 rounded-md">
                    <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Password</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Phone</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Branch</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Role</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
                </tr>
                </thead>
                <tbody>
                {Array.isArray(managers) && managers.length > 0 ? (
                    managers.map((manager) => (
                        <tr key={manager._id}>
                            <td className="border border-gray-300 px-4 py-2">
                                {manager.firstName} {manager.lastName}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">{manager.email}</td>
                            <td className="border border-gray-300 px-4 ">
                                {passwordVisible[manager._id] ? "Hashed" : "●●●●●●●●"}
                                <button
                                    onClick={() => togglePasswordVisibility(manager._id)}
                                    className="ml-16 text-gray-500"
                                >
                                    {passwordVisible[manager._id] ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                                {manager.phoneNumber || "N/A"}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                                {branchNamesMap[branches[manager._id]] || "Not Assigned"}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                                {manager.role || "N/A"}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center space-x-2">
                                <button
                                    onClick={() => handleEditManager(manager)}
                                    className="px-4 py-2 bg-[#0B7ABE] text-white rounded-md hover:bg-[#086198]"
                                >
                                    Edit
                                </button>
                                {branches[manager._id] ? (
                                    <button
                                        onClick={() => handleUnassignManager(manager._id)}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                    >
                                        Unassign
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleDeleteManager(manager)}
                                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                                    >
                                        Delete
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="7" className="text-center text-gray-500 py-4">
                            No managers found.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>

            {/* Edit Manager Modal */}
            {showEditModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold text-[#274E6B] mb-4">Edit Manager</h2>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    const token = localStorage.getItem("token");
                                    await axios.put(
                                        `${process.env.REACT_APP_API_URL}/api/users/${selectedManager._id}`,
                                        selectedManager,
                                        {
                                            headers: {
                                                Authorization: `Bearer ${token}`,
                                            }
                                        }
                                    );
                                    fetchManagers();
                                    setShowEditModal(false);
                                    alert("Manager updated successfully!");
                                } catch (error) {
                                    console.error("Error updating manager:", error);
                                    alert("Failed to update manager.");
                                }
                            }}
                        >
                            <input
                                type="text"
                                placeholder="First Name"
                                value={selectedManager?.firstName || ""}
                                onChange={(e) =>
                                    setSelectedManager({ ...selectedManager, firstName: e.target.value })
                                }
                                className="w-full px-4 py-2 border rounded-md mb-4"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={selectedManager?.lastName || ""}
                                onChange={(e) =>
                                    setSelectedManager({ ...selectedManager, lastName: e.target.value })
                                }
                                className="w-full px-4 py-2 border rounded-md mb-4"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Phone Number"
                                value={selectedManager?.phoneNumber || ""}
                                onChange={(e) =>
                                    setSelectedManager({ ...selectedManager, phoneNumber: e.target.value })
                                }
                                className="w-full px-4 py-2 border rounded-md mb-4"
                            />
                            <input
                                type="text"
                                placeholder="Addresss"
                                value={selectedManager?.address || ""}
                                onChange={(e) =>
                                    setSelectedManager({ ...selectedManager, address: e.target.value })
                                }
                                className="w-full px-4 py-2 border rounded-md mb-4"
                            />
                            <input
                                type="text"
                                placeholder="City"
                                value={selectedManager?.city || ""}
                                onChange={(e) =>
                                    setSelectedManager({ ...selectedManager, city: e.target.value })
                                }
                                className="w-full px-4 py-2 border rounded-md mb-4"
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
        </Layout>
    );
};

export default Managers;
