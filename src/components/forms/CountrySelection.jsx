import React, { useState, useEffect } from "react";
import axios from "axios";

const CountrySelection = ({ applicant, fetchApplicant, nextStep, prevStep }) => {
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);
    const [universities, setUniversities] = useState([]);

    const [formData, setFormData] = useState({
        country: applicant?.futureEducationDetails?.country || "",
        city: applicant?.futureEducationDetails?.city || "",
        institute: applicant?.futureEducationDetails?.institute || "",
        course: applicant?.futureEducationDetails?.course || "",
        intake: applicant?.futureEducationDetails?.intake || "",
    });

    useEffect(() => {
        fetchCountries();
    }, []);

    useEffect(() => {
        if (formData.country) {
            fetchCities(formData.country);
            fetchUniversities(formData.country);
        }
    }, [formData.country]);

    // Fetch Countries
    const fetchCountries = async () => {
        try {
            const response = await axios.get("https://restcountries.com/v3.1/all");
            const countryList = response.data
                .map(country => ({ name: country.name.common, code: country.cca2 }))
                .sort((a, b) => a.name.localeCompare(b.name));
            setCountries(countryList);
        } catch (error) {
            console.error("Error fetching countries:", error);
        }
    };

    // Fetch Cities
    const fetchCities = async (countryName) => {
        try {
            setCities([]);
            setUniversities([]);
            const response = await axios.post("https://countriesnow.space/api/v0.1/countries/cities", {
                country: countryName
            });

            if (!response.data.error) {
                const sortedCities = response.data.data.sort((a, b) => a.localeCompare(b));
                setCities(sortedCities);
            }
        } catch (error) {
            console.error("Error fetching cities:", error);
            setCities([]);
        }
    };

    // Fetch Universities
    const fetchUniversities = async (country) => {
        try {
            setUniversities([]);
            const response = await axios.get(`http://universities.hipolabs.com/search?country=${country}`);
            const sortedUniversities = response.data
                .map(uni => uni.name)
                .sort((a, b) => a.localeCompare(b));

            setUniversities(sortedUniversities);
        } catch (error) {
            console.error("Error fetching universities:", error);
            setUniversities([]);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === "country") {
            fetchCities(value);
            fetchUniversities(value);
            setFormData(prev => ({ ...prev, city: "", institute: "" }));
        } else if (name === "city") {
            setFormData(prev => ({ ...prev, institute: "" }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/applicants/${applicant._id}/education`, {
                futureEducationDetails: formData, // Send as futureEducationDetails
            });

            alert("Education details saved!");
            fetchApplicant(); // Refresh applicant data
            nextStep();
        } catch (error) {
            console.error("Error saving education details:", error);
        }
    };

    const getFieldStyle = (fieldName) => {
        // Check if the field is empty and return a style or class
        return formData[fieldName] === "" ? "bg-red-100" : ""; // You can adjust the color here (bg-red-100 is light red)
    };

    return (
        <div className="mx-auto">
            <h2 className="text-2xl font-bold text-[#274E6B] mb-6">Select Country & University</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Country Selection */}
                <div className="grid grid-cols-3 items-center gap-4">
                    <label htmlFor="country" className="font-bold text-right">Country:</label>
                    <select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                        className={`col-span-2 px-4 py-2 border rounded-md cursor-pointer bg-[#F3F4F6] w-full ${getFieldStyle('country')}`}
                    >
                        <option value="">🔍 Search & Select Country</option>
                        {countries.map((country) => (
                            <option key={country.code} value={country.name} className="cursor-pointer">
                                {country.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* City Selection */}
                {formData.country && (
                    <div className="grid grid-cols-3 items-center gap-4">
                        <label htmlFor="city" className="font-bold text-right">City:</label>
                        <select
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            className={`col-span-2 px-4 py-2 border rounded-md cursor-pointer bg-[#F3F4F6] w-full ${getFieldStyle('city')}`}
                        >
                            <option value="">🔍 Search & Select City</option>
                            {cities.map((city, index) => (
                                <option key={index} value={city} className="cursor-pointer">
                                    {city}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* University Selection */}
                {formData.city && (
                    <div className="grid grid-cols-3 items-center gap-4">
                        <label htmlFor="institute" className="font-bold text-right">Institute:</label>
                        <input
                            type="text"
                            name="institute"
                            value={formData.institute}
                            placeholder="Institute Name"
                            onChange={handleChange}
                            className={`col-span-2 px-4 py-2 border rounded-md w-full bg-[#F3F4F6] ${getFieldStyle('course')}`}
                            required
                        />
                        {/*<select*/}
                        {/*    name="institute"*/}
                        {/*    value={formData.institute}*/}
                        {/*    onChange={handleChange}*/}
                        {/*    required*/}
                        {/*    className={`col-span-2 px-4 py-2 border rounded-md cursor-pointer bg-[#F3F4F6] w-full ${getFieldStyle('institute')}`}*/}
                        {/*>*/}
                        {/*    <option value="">🔍 Search & Select University</option>*/}
                        {/*    {universities.map((uni, index) => (*/}
                        {/*        <option key={index} value={uni} className="cursor-pointer">*/}
                        {/*            {uni}*/}
                        {/*        </option>*/}
                        {/*    ))}*/}
                        {/*</select>*/}
                    </div>
                )}

                {/* Course Name */}
                {formData.institute && (
                    <div className="grid grid-cols-3 items-center gap-4">
                        <label htmlFor="course" className="font-bold text-right">Course:</label>
                        <input
                            type="text"
                            name="course"
                            value={formData.course}
                            placeholder="Enter Course Name"
                            onChange={handleChange}
                            className={`col-span-2 px-4 py-2 border rounded-md w-full bg-[#F3F4F6] ${getFieldStyle('course')}`}
                            required
                        />
                    </div>
                )}

                {/* Intake */}
                {formData.institute && (
                    <div className="grid grid-cols-3 items-center gap-4">
                        <label htmlFor="intake" className="font-bold text-right">Intake:</label>
                        <input
                            type="text"
                            name="intake"
                            value={formData.intake}
                            placeholder="Intake (e.g., Fall 2025)"
                            onChange={handleChange}
                            className={`col-span-2 px-4 py-2 border rounded-md w-full bg-[#F3F4F6] ${getFieldStyle('intake')}`}
                            required
                        />
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-6">
                    <button type="submit" className="px-6 py-2 bg-[#0B7ABE] text-white rounded-md">Save</button>
                </div>
            </form>
        </div>
    );
};

export default CountrySelection;
