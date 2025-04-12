import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ManagerLayout from "../components/ManagerLayout";

const SearchResultPage = () => {
    const { type, id } = useParams(); // Extract dynamic params (type and id)
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");
            const token = localStorage.getItem("token");
            let endpoint = "";

            if (type === "applicant") {
                endpoint = `/api/applicants/${id}`;
            } else if (type === "manager") {
                endpoint = `/api/managers/${id}`;
            } else if (type === "branch") {
                endpoint = `/api/branches/${id}`;
            }

            if (!endpoint) {
                setError("Invalid search type.");
                return;
            }

            const response = await axios.get(`${process.env.REACT_APP_API_URL}${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setData(response.data);
        } catch (err) {
            console.error("❌ Error fetching details:", err);
            setError("Failed to load details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type, id]);

    if (loading) return <ManagerLayout>Loading...</ManagerLayout>;
    if (error) return <ManagerLayout><p className="text-red-500">{error}</p></ManagerLayout>;

    return (
        <ManagerLayout>
            <div className="p-8 bg-white rounded-md shadow-md">
                <h1 className="text-2xl font-bold text-[#274E6B] mb-4">{type.toUpperCase()} Details</h1>

                {/* Applicant Details */}
                {type === "applicant" && data && (
                    <div>
                        <p><strong>Name:</strong> {data.name}</p>
                        <p><strong>Phone:</strong> {data.phoneNumber}</p>
                        <p><strong>Country:</strong> {data.country}</p>
                        <p><strong>Qualification:</strong> {data.qualification}</p>
                        <button
                            onClick={() => navigate(`/applicant/${data._id}`)}
                            className="px-4 py-2 bg-[#0B7ABE] text-white rounded-md mt-4">
                            View Full Details
                        </button>
                    </div>
                )}

                {/* Manager Details */}
                {type === "manager" && data && (
                    <div>
                        <p><strong>Name:</strong> {data.firstName} {data.lastName}</p>
                        <p><strong>Phone:</strong> {data.phoneNumber}</p>
                        <p><strong>Email:</strong> {data.email}</p>
                        <button
                            onClick={() => navigate(`/managers/${data._id}`)}
                            className="px-4 py-2 bg-[#0B7ABE] text-white rounded-md mt-4">
                            View Full Details
                        </button>
                    </div>
                )}

                {/* Branch Details */}
                {type === "branch" && data && (
                    <div>
                        <p><strong>Branch Name:</strong> {data.name}</p>
                        <p><strong>City:</strong> {data.city}</p>
                        <p><strong>Phone:</strong> {data.phoneNumber}</p>
                        <button
                            onClick={() => navigate(`/branches/${data._id}`)}
                            className="px-4 py-2 bg-[#0B7ABE] text-white rounded-md mt-4">
                            View Full Details
                        </button>
                    </div>
                )}
            </div>
        </ManagerLayout>
    );
};

export default SearchResultPage;
