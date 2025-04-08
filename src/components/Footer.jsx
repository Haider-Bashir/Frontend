// components/Footer.jsx
import React from "react";

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-6">
            <div className="container mx-auto text-center">
                <p className="mb-4">© 2025 Risers Consultancy. All rights reserved.</p>
                <ul className="flex justify-center space-x-6">
                    <li><a href="#facebook" className="hover:underline">Facebook</a></li>
                    <li><a href="#twitter" className="hover:underline">Twitter</a></li>
                    <li><a href="#linkedin" className="hover:underline">LinkedIn</a></li>
                </ul>
            </div>
        </footer>
    );
};

export default Footer;
