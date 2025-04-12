import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PersonalInfo from "../components/forms/PersonalInfo";
import Documents from "../components/forms/Documents";
import CountrySelection from "../components/forms/CountrySelection";
import Processing from "../components/forms/Processing";
import Dues from "../components/forms/Dues";
import AdminLayout from "../components/AdminLayout"; // Import AdminLayout
import ManagerLayout from "../components/ManagerLayout"; // Import ManagerLayout

const NewApplicant = () => {
    const { id } = useParams();
    const [currentStep, setCurrentStep] = useState(0);
    const [applicant, setApplicant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [userRole, setUserRole] = useState(""); // State to store user role
    const [isSubAdmin, setIsSubAdmin] = useState(false);
    const navigate = useNavigate();

    const steps = [
        "Personal Info",
        "Documents",
        "Study Preferences",
        "Processing",
        ...(!isSubAdmin ? ["Payments & Dues"] : []), // Conditionally add Dues step based on sub-admin role
    ];

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user?.role === 'sub-admin') {
            setIsSubAdmin(true);
        }
    }, []);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            setUserRole(user.role); // Set the role (admin or manager or sub-admin)
        }

        fetchApplicant();
    }, [id]);

    const fetchApplicant = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/applicants/${id}`);
            setApplicant(response.data);
        } catch (error) {
            console.error("Error fetching applicant:", error);
            setError("Failed to load applicant data.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <ManagerLayout>Loading...</ManagerLayout>;
    if (error) return <ManagerLayout><p className="text-red-500">{error}</p></ManagerLayout>;

    // Choose the layout based on the user's role
    const Layout = userRole === "admin" || userRole === "sub-admin" ? AdminLayout : ManagerLayout;

    // Save data when moving to the next step
    const handleNextStep = async () => {
        try {
            // Save form data based on current step before moving to the next step
            switch (currentStep) {
                case 0:
                    // PersonalInfo: You can implement form data saving here if needed
                    break;
                case 1:
                    // Documents: Save documents form data
                    break;
                case 2:
                    // CountrySelection: Save country selection data
                    break;
                case 3:
                    // Processing: Save processing status or other details
                    break;
                case 4:
                    // Dues: Save dues information
                    break;
                default:
                    break;
            }

            if (currentStep === steps.length - 1) {
                // On the last step, redirect to the applicant details page
                navigate(`/admin/applicant/${id}`);
            } else {
                setCurrentStep(currentStep + 1); // Move to the next step
            }
        } catch (error) {
            console.error("Error saving data before next step:", error);
        }
    };

    // Move to the previous step
    const handlePrevStep = () => {
        setCurrentStep(currentStep - 1);
    };

    return (
        <Layout>
            <div className="p-8 bg-white rounded-md shadow-md">
                <h1 className="text-2xl font-bold text-[#274E6B] mb-4">Applicant Details</h1>

                {/* Step Navigation */}
                <div className="flex justify-between bg-gray-100 p-4 rounded-md">
                    {steps.map((step, index) => (
                        <span
                            key={index}
                            className={`px-4 py-2 cursor-pointer ${currentStep === index ? "bg-[#0B7ABE] text-white rounded-md" : "text-gray-600"}`}
                            onClick={() => setCurrentStep(index)}
                        >
                            {step}
                        </span>
                    ))}
                </div>

                {/* Step Forms */}
                <div className="mt-6">
                    {currentStep === 0 && <PersonalInfo applicant={applicant} fetchApplicant={fetchApplicant} />}
                    {currentStep === 1 && <Documents applicant={applicant} fetchApplicant={fetchApplicant} />}
                    {currentStep === 2 && <CountrySelection applicant={applicant} fetchApplicant={fetchApplicant} />}
                    {currentStep === 3 && <Processing applicant={applicant} fetchApplicant={fetchApplicant} />}
                    {currentStep === 4 && !isSubAdmin && <Dues applicant={applicant} fetchApplicant={fetchApplicant} />}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-4">
                    {currentStep > 0 && (
                        <button onClick={handlePrevStep} className="px-4 py-2 bg-gray-500 text-white rounded-md">
                            Back
                        </button>
                    )}

                    {currentStep < steps.length - 1 && (
                        <button onClick={handleNextStep} className="px-4 py-2 bg-[#0B7ABE] hover:bg-[#086198] text-white rounded-md">
                            Next
                        </button>
                    )}

                    {/* For the last step, display save and finish */}
                    {currentStep === steps.length - 1 && (
                        <button onClick={handleNextStep} className="px-4 py-2 bg-[#0B7ABE] hover:bg-[#086198] text-white rounded-md">
                            Finish
                        </button>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default NewApplicant;
