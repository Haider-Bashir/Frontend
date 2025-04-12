import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from "../../components/AdminLayout";

const SubAdmins = () => {
    const [subAdmins, setSubAdmins] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false); // Add modal state
    const [showEditModal, setShowEditModal] = useState(false); // Edit modal state
    const [newSubAdmin, setNewSubAdmin] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        role: 'sub-admin', // Default to sub-admin role
    });
    const [editingSubAdmin, setEditingSubAdmin] = useState(null); // For editing

    useEffect(() => {
        // Fetch the list of sub admins
        const fetchSubAdmins = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/sub-admins`);
                setSubAdmins(response.data);
            } catch (error) {
                console.error('Error fetching sub admins:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSubAdmins();
    }, []);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/sub-admins/${id}`);
            setSubAdmins(subAdmins.filter(subAdmin => subAdmin._id !== id)); // Remove from state
            alert('Sub Admin deleted successfully');
        } catch (error) {
            console.error('Error deleting sub admin:', error);
        }
    };

    const handleAdd = () => {
        setNewSubAdmin({ // Reset newSubAdmin for a clean state
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            phone: '',
            role: 'sub-admin',
        });
        setShowAddModal(true);  // Show the modal for adding sub admin
    };

    const handleEdit = (subAdmin) => {
        setEditingSubAdmin(subAdmin);  // Set the sub admin details to edit
        setNewSubAdmin({
            firstName: subAdmin.firstName,
            lastName: subAdmin.lastName,
            email: subAdmin.email,
            phone: subAdmin.phoneNumber,
            role: subAdmin.role,
        });
        setShowEditModal(true);  // Show the modal for editing sub admin
    };

    const handleCloseAddModal = () => {
        setShowAddModal(false);  // Close the add modal
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);  // Close the edit modal
    };

    const handleSubmitAdd = async (e) => {
        e.preventDefault();

        try {
            // Create a new sub admin via API
            await axios.post(`${process.env.REACT_APP_API_URL}/api/sub-admins`, newSubAdmin);
            setShowAddModal(false);  // Close modal on success
            alert('Sub Admin added successfully');
            // Re-fetch the sub admins list
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/sub-admins`);
            setSubAdmins(response.data);
        } catch (error) {
            console.error('Error adding sub admin:', error);
            alert('Failed to add sub admin');
        }
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();

        try {
            // Update the sub admin via API
            await axios.put(`${process.env.REACT_APP_API_URL}/api/sub-admins/${editingSubAdmin._id}`, newSubAdmin);
            setShowEditModal(false);  // Close modal on success
            alert('Sub Admin updated successfully');
            // Re-fetch the sub admins list
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/sub-admins`);
            setSubAdmins(response.data);
        } catch (error) {
            console.error('Error updating sub admin:', error);
            alert('Failed to update sub admin');
        }
    };

    return (
        <Layout>
            <div>
                {/* Breadcrumbs */}
                <div className="text-sm text-gray-600 mb-4">
                    <span className="mr-2">Dashboard</span>
                    <span className="text-gray-400">/</span>
                    <span className="ml-2">Sub Admins</span>
                </div>

                <h1 className="text-2xl font-bold text-[#274E6B] mb-6">Sub Admins</h1>

                <div className="mb-6">
                    <button
                        onClick={handleAdd}
                        className="bg-[#0B7ABE] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#086198] transition"
                    >
                        Add New Sub Admin
                    </button>
                </div>

                <div>
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : (
                        <table className="w-full bg-white rounded-md shadow-md mb-6">
                            <thead>
                            <tr className="bg-gray-100 rounded-md">
                                <th className="border border-gray-300 px-4 py-2 text-left">First Name</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Last Name</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Phone</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Role</th>
                                <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {subAdmins.map((subAdmin, index) => (
                                <tr key={subAdmin._id} className={index % 2 === 0 ? '' : ''}>
                                    <td className="border border-gray-300 px-4 py-2">{subAdmin.firstName}</td>
                                    <td className="border border-gray-300 px-4 py-2">{subAdmin.lastName}</td>
                                    <td className="border border-gray-300 px-4 py-2">{subAdmin.email}</td>
                                    <td className="border border-gray-300 px-4 py-2">{subAdmin.phoneNumber}</td>
                                    <td className="border border-gray-300 px-4 py-2">{subAdmin.role}</td>
                                    <td className="border border-gray-300 px-4 py-2 space-x-2">
                                        <button
                                            onClick={() => handleEdit(subAdmin)}
                                            className="px-4 py-2 bg-[#0B7ABE] text-white rounded-md hover:bg-[#086198] transition"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(subAdmin._id)}
                                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Modal for Adding New Sub Admin */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-md shadow-lg w-1/3">
                            <h2 className="text-xl font-bold mb-4">Add New Sub Admin</h2>
                            <form onSubmit={handleSubmitAdd} className="space-y-4">
                                <div>
                                    <label className="block font-semibold">First Name</label>
                                    <input
                                        type="text"
                                        value={newSubAdmin.firstName}
                                        onChange={(e) => setNewSubAdmin({ ...newSubAdmin, firstName: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-md bg-[#F3F4F6]"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold">Last Name</label>
                                    <input
                                        type="text"
                                        value={newSubAdmin.lastName}
                                        onChange={(e) => setNewSubAdmin({ ...newSubAdmin, lastName: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-md bg-[#F3F4F6]"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold">Email</label>
                                    <input
                                        type="email"
                                        value={newSubAdmin.email}
                                        onChange={(e) => setNewSubAdmin({ ...newSubAdmin, email: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-md bg-[#F3F4F6]"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold">Password</label>
                                    <input
                                        type="password"
                                        value={newSubAdmin.password}
                                        onChange={(e) => setNewSubAdmin({ ...newSubAdmin, password: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-md bg-[#F3F4F6]"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold">Phone</label>
                                    <input
                                        type="text"
                                        value={newSubAdmin.phone}
                                        onChange={(e) => setNewSubAdmin({ ...newSubAdmin, phone: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-md bg-[#F3F4F6]"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold">Role</label>
                                    <select
                                        value={newSubAdmin.role}
                                        onChange={(e) => setNewSubAdmin({ ...newSubAdmin, role: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-md bg-[#F3F4F6]"
                                    >
                                        <option value="sub-admin">Sub Admin</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="flex justify-end mt-4">
                                    <button
                                        type="submit"
                                        className="bg-[#0B7ABE] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#086198] transition"
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCloseAddModal}
                                        className="ml-2 bg-gray-400 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-500 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal for Editing Sub Admin */}
                {showEditModal && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-md shadow-lg w-1/3">
                            <h2 className="text-xl font-bold mb-4">Edit Sub Admin</h2>
                            <form onSubmit={handleSubmitEdit} className="space-y-4">
                                <div>
                                    <label className="block font-semibold">First Name</label>
                                    <input
                                        type="text"
                                        value={newSubAdmin.firstName}
                                        onChange={(e) => setNewSubAdmin({ ...newSubAdmin, firstName: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-md bg-[#F3F4F6]"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold">Last Name</label>
                                    <input
                                        type="text"
                                        value={newSubAdmin.lastName}
                                        onChange={(e) => setNewSubAdmin({ ...newSubAdmin, lastName: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-md bg-[#F3F4F6]"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold">Email</label>
                                    <input
                                        type="email"
                                        value={newSubAdmin.email}
                                        onChange={(e) => setNewSubAdmin({ ...newSubAdmin, email: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-md bg-[#F3F4F6]"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold">Phone</label>
                                    <input
                                        type="text"
                                        value={newSubAdmin.phone}
                                        onChange={(e) => setNewSubAdmin({ ...newSubAdmin, phone: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-md bg-[#F3F4F6]"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold">Role</label>
                                    <select
                                        value={newSubAdmin.role}
                                        onChange={(e) => setNewSubAdmin({ ...newSubAdmin, role: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-md bg-[#F3F4F6]"
                                    >
                                        <option value="sub-admin">Sub Admin</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="flex justify-end mt-4">
                                    <button
                                        type="submit"
                                        className="bg-[#0B7ABE] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#086198] transition"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCloseEditModal}
                                        className="ml-2 bg-gray-400 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-500 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default SubAdmins;
