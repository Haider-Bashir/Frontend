import React, { useState, useEffect } from "react";
import ManagerLayout from "../components/ManagerLayout";
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';

// Register required components for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement);

const ManagerDashboard = () => {
    const [stats, setStats] = useState(null);
    const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/api/stats`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,  // Add token in the Authorization header
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                } else {
                    throw new Error('Failed to fetch stats');
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };

        fetchStats();
    }, [token]);

    // Safe data access for charts
    const getApplicantsByVisaTypeData = stats?.applicantsByVisaType || [];
    const getPaymentsByCurrencyData = stats?.paymentsByCurrency || [];
    const getApplicantsByQualificationData = stats?.applicantsByQualification || [];
    const getTotalApplicantsOverTimeData = stats?.totalApplicantsOverTime || [];
    const getPaymentsOverTimeData = stats?.paymentsOverTime || [];

    // Chart data preparation
    const applicantsByVisaTypeData = {
        labels: getApplicantsByVisaTypeData.map(visa => visa._id),
        datasets: [
            {
                label: 'Applicants by Visa Type',
                data: getApplicantsByVisaTypeData.map(visa => visa.count),
                backgroundColor: '#4A90E2',
            }
        ]
    };

    const paymentsByCurrencyData = {
        labels: getPaymentsByCurrencyData.map(payment => payment._id),
        datasets: [
            {
                label: 'Payments by Currency',
                data: getPaymentsByCurrencyData.map(payment => payment.total),
                backgroundColor: '#4A90E2',
            }
        ]
    };

    const applicantsByQualificationData = {
        labels: getApplicantsByQualificationData.map(qualification => qualification._id),
        datasets: [
            {
                label: 'Applicants by Qualification',
                data: getApplicantsByQualificationData.map(qualification => qualification.count),
                backgroundColor: '#4A90E2',
            }
        ]
    };

    const totalApplicantsOverTimeData = {
        labels: getTotalApplicantsOverTimeData.map(time => time.date),
        datasets: [
            {
                label: 'Total Applicants Over Time',
                data: getTotalApplicantsOverTimeData.map(time => time.count),
                fill: true,
                backgroundColor: 'rgba(74, 144, 226, 0.2)',
                borderColor: '#4A90E2',
                tension: 0.1,
            }
        ]
    };

    const paymentsOverTimeData = {
        labels: getPaymentsOverTimeData.map(time => time.date),
        datasets: [
            {
                label: 'Payments Over Time',
                data: getPaymentsOverTimeData.map(time => time.total),
                fill: true,
                backgroundColor: 'rgba(74, 144, 226, 0.2)',
                borderColor: '#4A90E2',
                tension: 0.1,
            }
        ]
    };

    return (
        <ManagerLayout>
            {/* Breadcrumbs */}
            <div className="text-sm text-gray-600 mb-6">
                <span className="mr-2">Dashboard</span>
                <span className="text-gray-400">/</span>
                <span className="ml-2">Home</span>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-md shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <h3 className="text-lg font-semibold text-[#274E6B]">Total Applicants</h3>
                    <p className="text-4xl font-bold mt-4 text-gray-800">{stats ? stats.totalApplicants : 'Loading...'}</p>
                </div>
                <div className="bg-white p-6 rounded-md shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <h3 className="text-lg font-semibold text-[#274E6B]">Total Payments</h3>
                    <p className="text-4xl font-bold mt-4 text-gray-800">${stats ? stats.totalPayments : 'Loading...'}</p>
                </div>
                <div className="bg-white p-6 rounded-md shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <h3 className="text-lg font-semibold text-[#274E6B]">Applicants by Visa Type</h3>
                    <ul className="mt-2">
                        {stats ? stats.applicantsByVisaType.map((visa, index) => (
                            <li key={index} className="text-gray-800">
                                {visa._id}: {visa.count}
                            </li>
                        )) : 'Loading...'}
                    </ul>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {/* Applicants by Visa Type Bar Chart */}
                <div className="bg-white p-6 rounded-md shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <h3 className="text-lg font-semibold text-[#274E6B]">Applicants by Visa Type</h3>
                    <Bar data={applicantsByVisaTypeData} options={{ responsive: true }} />
                </div>

                {/* Payments by Currency Pie Chart */}
                <div className="bg-white p-6 rounded-md shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <h3 className="text-lg font-semibold text-[#274E6B]">Payments by Currency</h3>
                    <Pie data={paymentsByCurrencyData} options={{ responsive: true }} />
                </div>

                {/* Applicants by Qualification Bar Chart */}
                <div className="bg-white p-6 rounded-md shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <h3 className="text-lg font-semibold text-[#274E6B]">Applicants by Qualification</h3>
                    <Bar data={applicantsByQualificationData} options={{ responsive: true }} />
                </div>
            </div>

            {/* Time-based Charts Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {/* Total Applicants Over Time Line Chart */}
                <div className="bg-white p-6 rounded-md shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <h3 className="text-lg font-semibold text-[#274E6B]">Total Applicants Over Time</h3>
                    <Line data={totalApplicantsOverTimeData} options={{ responsive: true }} />
                </div>

                {/* Payments Over Time Line Chart */}
                <div className="bg-white p-6 rounded-md shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <h3 className="text-lg font-semibold text-[#274E6B]">Payments Over Time</h3>
                    <Line data={paymentsOverTimeData} options={{ responsive: true }} />
                </div>
            </div>
        </ManagerLayout>
    );
};

export default ManagerDashboard;
