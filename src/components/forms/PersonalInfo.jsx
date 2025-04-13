import React, { useState, useEffect } from "react";
import axios from "axios";

const PersonalInfo = ({ applicant, fetchApplicant }) => {
    const [formData, setFormData] = useState({
        name: "",
        cnic: "",
        phoneNumber: "",
        city: "",
        country: "",
        address: "",
        qualification: "",
        counselor: "",
        visaType: "Work Permit",
        photo: null,
    });

    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        if (applicant) {
            setFormData({
                name: applicant.name || "",
                cnic: applicant.cnic || "",
                phoneNumber: applicant.phoneNumber || "",
                city: applicant.city || "",
                country: applicant.country || "",
                address: applicant.address || "",
                qualification: applicant.qualification || "",
                counselor: applicant.counselor || "",
                visaType: applicant.visaType || "Work Permit",
                photo: applicant.photo || null,
            });

            if (applicant.photo) {
                setPreviewImage(applicant.photo);
            }
        }
    }, [applicant]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData({ ...formData, photo: file });

        // Show a temporary preview before uploading
        setPreviewImage(URL.createObjectURL(file));
    };

    const getFieldStyle = (fieldName) => {
        // Check if the field is empty and return a style or class
        return formData[fieldName] === "" ? "bg-red-100" : ""; // You can adjust the color here (bg-red-100 is light red)
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formDataToSend = new FormData();

            // Append the form fields
            for (const key in formData) {
                if (key === "photo" && formData.photo instanceof File) {
                    // Append new photo only if a new file is selected
                    formDataToSend.append("photo", formData.photo);
                } else if (key !== "photo") {
                    // Append other form data fields
                    formDataToSend.append(key, formData[key]);
                }
            }

            // If no new image is uploaded, append the current photo path
            if (!formData.photo) {
                formDataToSend.append("photo", applicant.photo); // existing photo path
            }

            // Log FormData to verify data
            // for (let pair of formDataToSend.entries()) {
            //     console.log(pair[0] + ': ' + pair[1]);
            // }

            await axios.put(`${process.env.REACT_APP_API_URL}/api/applicants/${applicant._id}`, formDataToSend, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert("Personal Info Updated!");
            fetchApplicant(); // Refresh the data after updating
        } catch (error) {
            console.error("Error updating personal info:", error);
        }
    };

    return (
        <div className="flex gap-8">
            {/* Left Side Form */}
            <div className="w-2/3">
                <h2 className="text-xl font-bold text-[#274E6B] mb-4">Personal Info</h2>
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Full Name */}
                    <div className="flex flex-col">
                        <label htmlFor="name" className="font-bold text-gray-700">Full Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            placeholder="Full Name"
                            onChange={handleChange}
                            required
                            className={`w-full px-4 py-2 border rounded-md bg-[#F3F4F6] ${getFieldStyle('name')}`}
                        />
                    </div>

                    {/* CNIC */}
                    <div className="flex flex-col">
                        <label htmlFor="cnic" className="font-bold text-gray-700">CNIC:</label>
                        <input
                            type="text"
                            name="cnic"
                            value={formData.cnic}
                            placeholder="CNIC"
                            onChange={handleChange}
                            required
                            className={`w-full px-4 py-2 border rounded-md bg-[#F3F4F6] ${getFieldStyle('cnic')}`}
                        />
                    </div>

                    {/* Phone Number */}
                    <div className="flex flex-col">
                        <label htmlFor="phoneNumber" className="font-bold text-gray-700">Phone Number:</label>
                        <input
                            type="text"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            placeholder="Phone Number"
                            onChange={handleChange}
                            required
                            className={`w-full px-4 py-2 border rounded-md bg-[#F3F4F6] ${getFieldStyle('phoneNumber')}`}
                        />
                    </div>

                    {/* Address */}
                    <div className="flex flex-col">
                        <label htmlFor="address" className="font-bold text-gray-700">Address:</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            placeholder="Address"
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-md bg-[#F3F4F6] ${getFieldStyle('address')}`}
                        />
                    </div>

                    {/* City */}
                    <div className="flex flex-col">
                        <label htmlFor="city" className="font-bold text-gray-700">City:</label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            placeholder="City"
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-md bg-[#F3F4F6] ${getFieldStyle('city')}`}
                        />
                    </div>

                    {/* Country */}
                    <div className="flex flex-col">
                        <label htmlFor="country" className="font-bold text-gray-700">Country:</label>
                        <input
                            type="text"
                            name="country"
                            value={formData.country}
                            placeholder="Country"
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-md bg-[#F3F4F6] ${getFieldStyle('country')}`}
                        />
                    </div>

                    {/* Qualification */}
                    <div className="flex flex-col">
                        <label htmlFor="qualification" className="font-bold text-gray-700">Qualification:</label>
                        <input
                            type="text"
                            name="qualification"
                            value={formData.qualification}
                            placeholder="Qualification"
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-md bg-[#F3F4F6] ${getFieldStyle('qualification')}`}
                        />
                    </div>

                    {/* Counselor */}
                    <div className="flex flex-col">
                        <label htmlFor="counselor" className="font-bold text-gray-700">Counselor:</label>
                        <input
                            type="text"
                            name="counselor"
                            value={formData.counselor}
                            placeholder="Counselor"
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-md bg-[#F3F4F6] ${getFieldStyle('counselor')}`}
                        />
                    </div>

                    {/* Visa Type */}
                    <div className="flex flex-col">
                        <label htmlFor="visaType" className="font-bold text-gray-700">Visa Type:</label>
                        <select
                            name="visaType"
                            value={formData.visaType}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md bg-[#F3F4F6] focus:border cursor-pointer"
                        >
                            <option value="Work Permit">Work Permit</option>
                            <option value="Student Visa">Student Visa</option>
                            <option value="Visit Visa">Visit Visa</option>
                        </select>
                    </div>

                    {/* Profile Picture Upload */}
                    <div className="flex flex-col">
                        <label htmlFor="photo" className="font-bold text-gray-700">Upload Profile Picture:</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full px-4 py-2 border rounded-md bg-[#F3F4F6]"
                        />
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-start">
                        <button type="submit" className="px-4 py-2 bg-[#0B7ABE] text-white rounded-md">
                            Save
                        </button>
                    </div>
                </form>
            </div>


            {/* Right Side - User Image */}
            <div className="w-1/3 flex flex-col items-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Profile Picture</h3>
                {previewImage ? (
                    <img src={previewImage} alt="User" className="w-40 h-40 object-cover rounded-md border" />
                ) : (
                    <div className="w-32 h-32 flex items-center justify-center bg-gray-200 text-gray-500 rounded-full border">
                        No Image
                    </div>
                )}
            </div>
        </div>
    );
};

export default PersonalInfo;
