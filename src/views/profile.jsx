import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagerLayout from "../components/ManagerLayout";
import axios from "axios";

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        address: "",
        city: "",
    });

    useEffect(() => {
        // Check if the token exists (authentication check)
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login"); // Redirect to login if not logged in
            return;
        }

        // Retrieve user details
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setFormData({
                firstName: userData.firstName,
                lastName: userData.lastName,
                address: userData.address || "",
                city: userData.city || "",
            });
        }
    }, [navigate]);

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        try {
            const storedUser = localStorage.getItem("user");
            const userData = JSON.parse(storedUser);

            console.log(userData.id + ' ' + "Sending profile update request with data:", formData); // Log data

            // Send PUT request to update profile
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/users/${userData.id}`, // Correct endpoint for profile update
                formData,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                }
            );

            // Get the updated user data from the response
            const updatedUser = response.data;

            // Store the updated user data in localStorage
            localStorage.removeItem("user");

            localStorage.setItem("user", JSON.stringify({
                id: userData.id,
                username: userData.username,
                firstName: formData?.firstName || userData.firstName,
                lastName: formData?.lastName || userData.lastName,
                email: userData.email,
                role: userData.role,
                address: formData?.address || userData.address,
                phoneNumber: formData?.phoneNumber || userData.phoneNumber,
                city: formData?.city || userData.city,
            }));

            // Hide the form and update the user state with new data
            setIsEditing(false);
            setUser(updatedUser);  // Update the user state with updated details

            // Optionally, update any other state or UI components here
            window.dispatchEvent(new Event("storage"));  // Trigger an event to notify any listeners that the user data has changed

            // You may also want to refresh page
            navigate("/profile");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile. Please try again.");
        }
    };

    return (
        <ManagerLayout>
            <div className="text-sm text-gray-600 mb-4">
                <span className="mr-2">Settings</span>
                <span className="text-gray-400">/</span>
                <span className="ml-2">Profile</span>
            </div>

            <div className="bg-white p-6 rounded-md shadow-md max-w-xl mx-auto">
                <h2 className="text-2xl text-center font-bold text-[#274E6B] mb-4">User Profile</h2>

                {user ? (
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                            {/* Profile Image */}
                            <img
                                src={formData.profilePicture || `${process.env.REACT_APP_API_URL}/public/images/usr-dmy.jpg`}
                                alt="User Avatar"
                                className="h-24 w-24 rounded-full object-cover border border-[#274E6B]"
                            />
                            <div>
                                <h3 className="text-xl font-semibold text-[#274E6B]">
                                    {user.firstName + ' ' + user.lastName}
                                </h3>
                                <p className="text-gray-600">{user.role}</p>
                            </div>
                        </div>

                        <div className="border-t pt-4 space-y-4">
                            <p><strong>Username:</strong> {user.username}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Address:</strong> {user.address || "Not provided"}</p>
                            <p><strong>City:</strong> {user.city || "Not provided"}</p>
                            <p><strong>Phone Number:</strong> {user.phoneNumber || "Not provided"}</p>
                        </div>

                        {/* Edit Profile Button */}
                        <button
                            onClick={() => setIsEditing((prev) => !prev)}
                            className="bg-[#274E6B] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#1d3d55] transition duration-300"
                        >
                            {isEditing ? "Cancel" : "Edit Profile"}
                        </button>

                        {/* Edit Profile Form */}
                        {isEditing && (
                            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                                <div>
                                    <label className="block text-gray-700">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="mt-4 px-6 py-2 bg-[#274E6B] text-white rounded-md"
                                >
                                    Save Changes
                                </button>
                            </form>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-gray-600">Loading user details...</div>
                )}
            </div>
        </ManagerLayout>
    );
};

export default Profile;
