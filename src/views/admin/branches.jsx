import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/AdminLayout";

const Branches = () => {
    const [showModal, setShowModal] = useState(false);
    const [branches, setBranches] = useState([]);
    const [newBranch, setNewBranch] = useState({
        name: "",
        city: "",
        phoneNumber: "",
        image: null,
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/branches`);
            console.log("Fetched branches:", response.data);
    
            // Ensure the result is an array before setting it
            if (Array.isArray(response.data)) {
                setBranches(response.data);
            } else {
                console.error("Unexpected data format for branches:", response.data);
                setBranches([]); // fallback to empty array
            }
        } catch (error) {
            console.error("Error fetching branches:", error);
            setBranches([]); // fallback to empty array on error
        }
    };

    // Handle input change
    const handleChange = (e) => {
        setNewBranch({ ...newBranch, [e.target.name]: e.target.value });
    };

    // Handle file upload
    const handleFileChange = (e) => {
        setNewBranch({ ...newBranch, image: e.target.files[0] });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        let validationErrors = {};
        if (!newBranch.name) validationErrors.name = "Branch name is required";
        if (!newBranch.city) validationErrors.city = "Branch city is required";
        if (!newBranch.image) validationErrors.image = "Branch image is required";

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const formData = new FormData();
        formData.append("name", newBranch.name);
        formData.append("city", newBranch.city);
        formData.append("phoneNumber", newBranch.phoneNumber);
        formData.append("image", newBranch.image);

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/branches`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            fetchBranches(); // Refresh the branches list
            handleCloseModal();
        } catch (error) {
            console.error("Error adding branch:", error);
        }
    };

    // Close modal
    const handleCloseModal = () => {
        setShowModal(false);
        setNewBranch({ name: "", city: "", phoneNumber: "", image: null });
        setErrors({});
    };

    return (
        <Layout>
            <div className="text-sm text-gray-600 mb-4">
                <span className="mr-2">Dashboard</span>
                <span className="text-gray-400">/</span>
                <span className="ml-2">Branches</span>
            </div>

            <h1 className="text-2xl font-bold text-[#274E6B] mb-6">Branches</h1>

            {/* Add Branch Button */}
            <div className="mb-6">
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-[#0B7ABE] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#086198] transition"
                >
                    Add New Branch
                </button>
            </div>

            {/* Branch Cards */}
            <div className="grid grid-cols-4 gap-6">
                {Array.isArray(branches) && branches.length > 0 ? (
                    branches.map((branch) => (
                        <div
                            key={branch._id}
                            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
                            onClick={() => navigate(`/admin/branches/${branch._id}`)}
                        >
                            <img
                                src={branch.image}
                                alt={branch.name}
                                className="h-40 w-full object-cover"
                            />
                            <div className="p-4">
                                <h3 className="text-lg font-bold text-[#274E6B]">{branch.name}</h3>
                                <p className="text-gray-600 mt-2">{branch.city}</p>
                                {branch.phoneNumber && (
                                    <p className="text-gray-500">📞 {branch.phoneNumber}</p>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-600">No branches available.</p>
                )}
            </div>



            {/* Add New Branch Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white w-96 p-6 rounded-md shadow-md">
                        <h2 className="text-xl font-bold text-[#274E6B] mb-4">Add New Branch</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Branch Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={newBranch.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#274E6B]"
                                />
                                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={newBranch.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#274E6B]"
                                />
                                {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={newBranch.phoneNumber}
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
                                {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
                            </div>

                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#274E6B] text-white rounded-md hover:bg-[#1d3d55]"
                                >
                                    Add Branch
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Branches;
