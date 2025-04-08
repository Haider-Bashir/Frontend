import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Layout = ({ children }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    const handleSearch = async (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term.trim() === "") {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);

        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${process.env.REACT_APP_URL_BACKEND}/api/search`, {
                params: { query: term },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSearchResults(response.data);
        } catch (error) {
            console.error("Error fetching search results:", error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-65 bg-white text-[#274E6B] rounded-tr-3xl rounded-br-3xl shadow-lg p-6">
                {/* Logo and Site Name */}
                <div className="flex items-center mb-10 space-x-3">
                    <img src="/logo.png" alt="Site Logo" className="h-12 w-12" />
                    <h2 className="text-xl font-bold">The Risers Consultancy</h2>
                </div>

                {/* Navigation */}
                <nav className="space-y-4">
                    <button
                        onClick={()=>navigate("/admin/dashboard")}
                        className={`block py-2 px-4 rounded-md w-full text-start ${
                            location.pathname === "/admin/dashboard"
                                ? "bg-[#E8F1F8] text-[#274E6B] font-semibold"
                                : "hover:bg-[#E8F1F8]"
                        } transition`}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={()=>navigate("/admin/branches")}
                        className={`block py-2 px-4 rounded-md w-full text-start ${
                            location.pathname.startsWith("/admin/branches")
                                ? "bg-[#E8F1F8] text-[#274E6B] font-semibold"
                                : "hover:bg-[#E8F1F8]"
                        } transition`}
                    >
                        Branches
                    </button>
                    <button
                        onClick={()=>navigate("/admin/managers")}
                        className={`block py-2 px-4 rounded-md w-full text-start ${
                            location.pathname.startsWith("/admin/managers")
                                ? "bg-[#E8F1F8] text-[#274E6B] font-semibold"
                                : "hover:bg-[#E8F1F8]"
                        } transition`}
                    >
                        Managers
                    </button>
                    <button
                        onClick={()=>navigate("/admin/applicants")}
                        className={`block py-2 px-4 rounded-md w-full text-start ${
                            location.pathname.startsWith("/admin/applicants") || location.pathname.startsWith("/admin/applicant") || location.pathname.startsWith("/applicant")
                                ? "bg-[#E8F1F8] text-[#274E6B] font-semibold"
                                : "hover:bg-[#E8F1F8]"
                        } transition`}
                    >
                        Applicants
                    </button>
                    <button
                        onClick={()=>navigate("/admin/sub-admins")}
                        className={`block py-2 px-4 rounded-md w-full text-start ${
                            location.pathname.startsWith("/admin/sub-admins") || location.pathname.startsWith("/admin/sub-admin") || location.pathname.startsWith("/sub-admin")
                                ? "bg-[#E8F1F8] text-[#274E6B] font-semibold"
                                : "hover:bg-[#E8F1F8]"
                        } transition`}
                    >
                        Sub Admins
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8">
                {/* Top Header */}
                <div className="flex justify-between items-center mb-6">
                    {/* Search Bar */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search branches, managers, applicants..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="px-4 py-2 w-80 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#274E6B]"
                        />
                        {isSearching && (
                            <div className="absolute mt-2 w-80 bg-white shadow-lg rounded-md border">
                                <p className="px-4 py-2 text-gray-600">Searching...</p>
                            </div>
                        )}
                        {searchResults.length > 0 && (
                            <div className="absolute mt-2 w-80 bg-white shadow-lg rounded-md border">
                                {searchResults.map((result, index) => (
                                    <div
                                        key={index}
                                        onClick={() => navigate(result.link)}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    >
                                        <strong>{result.type}:</strong> {result.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* User Icon */}
                    <div className="relative" ref={dropdownRef}>
                        <img
                            src={`${process.env.REACT_APP_URL_BACKEND}/public/images/usr-dmy.jpg`}
                            alt="User Avatar"
                            className="h-16 w-16 cursor-pointer rounded-full object-cover border"
                            onClick={() => setShowDropdown(!showDropdown)}
                        />
                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border">
                                <button
                                    onClick={()=>navigate("/admin/profile")}
                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 text-start w-full"
                                >
                                    Profile
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Page Content */}
                {children}
            </div>
        </div>
    );
};

export default Layout;
