import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/AdminLayout";

const ProfileAdmin = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

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
            setUser(JSON.parse(storedUser));
        }
    }, [navigate]);

    return (
        <Layout>
            <div className="text-sm text-gray-600 mb-4">
                <span className="mr-2">Settings</span>
                <span className="text-gray-400">/</span>
                <span className="ml-2">Profile</span>
            </div>

            <div className="bg-white p-6 rounded-md shadow-md max-w-xl mx-auto">
                <h2 className="text-2xl text-center font-bold text-[#274E6B] mb-4">User Profile</h2>

                {user ? (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <img
                                src={`${process.env.REACT_APP_URL_BACKEND}/public/images/usr-dmy.jpg`}
                                alt="User Avatar"
                                className="h-24 w-24 rounded-full object-cover border"
                            />
                            <div>
                                <h3 className="text-xl font-semibold text-[#274E6B]">
                                    {user.firstName + ' ' + user.lastName}
                                </h3>
                                <p className="text-gray-600">{user.role}</p>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <p><strong>Username:</strong> {user.username}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Address:</strong> {user.address || "Nil"}</p>
                            <p><strong>City:</strong> {user.city || "Nil"}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-600">Loading user details...</p>
                )}
            </div>
        </Layout>
    );
};

export default ProfileAdmin;
