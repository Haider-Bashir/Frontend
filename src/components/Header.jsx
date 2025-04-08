import React, { useEffect, useState } from "react";
import {useNavigate} from "react-router-dom";

const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = () => {
            setIsLoggedIn(!!localStorage.getItem("token"));
        };

        checkAuth(); // Run when the component mounts

        // ✅ Listen for localStorage changes
        window.addEventListener("storage", checkAuth);

        return () => {
            window.removeEventListener("storage", checkAuth);
        };
    }, []);

    const handleNavigation = () => {
        // ✅ Force update of isLoggedIn before navigating
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);

        if (token) {
            navigate("/dashboard");
        } else {
            navigate("/login");
        }
    };

    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto flex items-center justify-between py-4 px-6">
                {/* Left Side: Logo and Text */}
                <button onClick={()=>navigate("/")}>
                    <div className="flex items-center space-x-3">
                        <img
                            src="/logo.png"
                            alt="Risers Consultancy Logo"
                            className="h-20 w-20"
                        />
                        <span
                            className="text-xl font-extrabold text-center leading-tight"
                            style={{ color: "#274E6B" }}
                        >
                            The Risers Consultancy <br />{" "}
                            <p className="text-sm">Pvt. Ltd</p>
                        </span>
                    </div>
                </button>

                {/* Right Side: Navigation Links */}
                <nav>
                    <ul className="hidden md:flex items-center justify-center gap-x-8 font-bold text-[#274E6B]">
                        <li>
                            <a href="#services" className="hover:underline">
                                Services
                            </a>
                        </li>
                        <li>
                            <a href="#testimonials" className="hover:underline">
                                Testimonials
                            </a>
                        </li>
                        <li>
                            <a href="#reviews" className="hover:underline">
                                Reviews
                            </a>
                        </li>
                        <li>
                            <a href="#contact" className="hover:underline">
                                Contact
                            </a>
                        </li>
                        <li>
                            <button
                                onClick={handleNavigation}
                                className="text-white bg-[#274E6B] px-4 py-2 rounded-md border-3 border-2 border-[#274E6B] hover:border-[#274E6b] transition-all duration-700 ease-in-out hover:bg-white hover:text-[#274E6B]"
                            >
                                {isLoggedIn ? "Dashboard" : "Login"}
                            </button>
                        </li>
                    </ul>
                </nav>


                {/* Mobile Menu Button */}
                <button
                    className="block md:hidden text-blue-900 focus:outline-none"
                    aria-label="Toggle menu"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16m-7 6h7"
                        />
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden bg-white px-6 py-4">
                <ul className="space-y-4 text-blue-900 font-medium ">
                    <li>
                        <a href="#services" className="hover:underline">
                            Services
                        </a>
                    </li>
                    <li>
                        <a href="#testimonials" className="hover:underline">
                            Testimonials
                        </a>
                    </li>
                    <li>
                        <a href="#reviews" className="hover:underline">
                            Reviews
                        </a>
                    </li>
                    <li>
                        <a href="#contact" className="hover:underline">
                            Contact
                        </a>
                    </li>
                    <li>
                        <button
                            onClick={handleNavigation}
                            className="text-white bg-[#274E6B] px-3 py-2 rounded-md border-[#274E6B] hover:border-[#274E6b] transition-all duration-700 ease-in-out hover:bg-white hover:text-[#274E6B]"
                            style={{ border: "3px solid" }}
                        >
                            {isLoggedIn ? "Dashboard" : "Login"}
                        </button>
                    </li>
                </ul>
            </div>
        </header>
    );
};

export default Header;
