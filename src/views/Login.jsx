import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const urlBackend = process.env.REACT_APP_URL_BACKEND;

    // ✅ Redirect logged-in users to the dashboard
    useEffect(() => {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));

        if (token && user) {
            if (user.role === "admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/dashboard");
            }
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            console.log("Sending request to:", `${urlBackend}/api/users/login`);

            // Send login request to the backend
            const response = await axios.post(`${urlBackend}/api/users/login`, {
                email,
                password,
            });

            const { data } = response;

            if (data) {
                // Store the token and user details in localStorage
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify({
                    id: data._id,
                    username: data.username,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    role: data.role,
                    address: data.address || "",
                    phoneNumber: data.phoneNumber || "",
                    city: data.city || "",
                }));

                window.dispatchEvent(new Event("storage"));

                if (data.role === "admin" || data.role === "sub-admin") {
                    navigate("/admin/dashboard");
                } else if (data.role === "manager") {
                    navigate("/dashboard");
                } else {
                    setError("Unauthorized Access");
                }
            }
        } catch (err) {
            console.error("Error:", err.response);
            setError(err.response?.data?.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <Header />

            {/* Login Form */}
            <div className="flex items-center justify-center flex-grow bg-gray-100">
                <div className="bg-white p-8 rounded-md shadow-md w-full max-w-lg">
                    <h2 className="text-2xl font-bold text-center text-[#274E6B] mb-6">
                        Login
                    </h2>
                    {error && <div className="text-red-500 text-center mb-4">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#274E6B] focus:border-transparent"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#274E6B] focus:border-transparent"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#274E6B] text-white py-2 rounded-md font-semibold border-2 transition-all duration-300 ease-in-out hover:border-2 hover:bg-white hover:text-[#274E6B] hover:border-[#274E6B] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default LoginPage;
