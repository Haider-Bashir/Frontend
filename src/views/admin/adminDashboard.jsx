import React, { useEffect, useState } from "react";
import Layout from "../../components/AdminLayout";
import axios from "axios";

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubAdmin, setIsSubAdmin] = useState(false);

    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [revenueData, setRevenueData] = useState([]);


    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user?.role === 'sub-admin') {
            setIsSubAdmin(true);
        }
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/stats/admin`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setStats(response.data);
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const fetchRevenueData = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/stats/branch-per-currency`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setRevenueData(response.data);
        } catch (error) {
            console.error("Error fetching revenue data:", error);
        }
    };

    const togglePopup = () => {
        setIsPopupOpen(!isPopupOpen);
        if (!isPopupOpen) {
            fetchRevenueData();
        }
    };


    if (loading) {
        return <Layout>Loading...</Layout>;
    }

    return (
        <Layout>
            {/* Breadcrumbs */}
            <div className="text-sm text-gray-600 mb-4">
                <span className="mr-2">Dashboard</span>
                <span className="text-gray-400">/</span>
                <span className="ml-2">Home</span>
            </div>

            <h1 className="text-2xl font-bold text-[#274E6B] mb-6">Dashboard</h1>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-6">
                {/* Total Branches */}
                <div className="bg-white p-6 rounded-md shadow-md">
                    <h3 className="text-lg font-bold text-[#274E6B]">Total Branches</h3>
                    <p className="text-4xl font-bold mt-4 text-gray-800">
                        {stats ? stats.totalBranches : 'Loading...'}
                    </p>
                </div>

                {/* Total Employees */}
                <div className="bg-white p-6 rounded-md shadow-md">
                    <h3 className="text-lg font-bold text-[#274E6B]">Total Employees</h3>
                    <p className="text-4xl font-bold mt-4 text-gray-800">
                        {stats ? stats.totalEmployees : 'Loading...'}
                    </p>
                </div>

                {/* Payments by Currency Section */}
                {!isSubAdmin && (
                    <div className="bg-white p-6 rounded-md shadow-md cursor-pointer" onClick={togglePopup}>
                        <h3 className="text-lg font-bold text-[#274E6B]">Revenue by Currency</h3>
                        <div className="mt-4">
                            {stats?.paymentsByCurrency && Array.isArray(stats.paymentsByCurrency) && stats.paymentsByCurrency.length > 0 ? (
                                stats.paymentsByCurrency.map((item, index) => (
                                    <div key={index} className="text-gray-600">
                                        <strong>{item._id}:</strong> {item.total.toLocaleString()} /-
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-600">No revenue data available.</div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Applicants Stats Section */}
            <div className="grid grid-cols-2 gap-6 mt-6">
                {/* Total Applicants */}
                <div className="bg-white p-6 rounded-md shadow-md">
                    <h3 className="text-lg font-bold text-[#274E6B]">Total Applicants</h3>
                    <p className="text-4xl font-bold mt-4 text-gray-800">
                        {stats ? stats.totalApplicants : 'Loading...'}
                    </p>
                </div>

                {/* Applicants by Country */}
                <div className="bg-white p-6 rounded-md shadow-md">
                    <h3 className="text-lg font-bold text-[#274E6B]">Applicants by Country</h3>
                    <ul className="mt-4">
                        {stats?.applicantsByCountry && Array.isArray(stats.applicantsByCountry) && stats.applicantsByCountry.length > 0 ? (
                            stats.applicantsByCountry.map((item, index) => (
                                <li key={index} className="text-gray-600">
                                    {item._id}: {item.count}
                                </li>
                            ))
                        ) : (
                            <li className="text-gray-600">No applicants by country found.</li>
                        )}
                    </ul>
                </div>

            </div>

            <div className="grid grid-cols-2 gap-6 mt-6">
                {/* Applicants by Visa Type */}
                <div className="bg-white p-6 rounded-md shadow-md">
                  <h3 className="text-lg font-bold text-[#274E6B]">Applicants by Visa Type</h3>
                  <ul className="mt-4">
                    {Array.isArray(stats?.applicantsByVisaType) && stats?.applicantsByVisaType.length > 0 ? (
                      stats.applicantsByVisaType.map((item, index) => (
                        <li key={index} className="text-gray-600">
                          {item._id}: {item.count}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-600">No applicants by visa type found.</li>
                    )}
                  </ul>
                </div>
              </div>


            {isPopupOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-md shadow-lg w-3/4">
                        <h3 className="text-xl font-bold text-[#274E6B] mb-4">Revenue per Branch per Currency</h3>
                        <table className="table-auto w-full">
                            <thead>
                            <tr>
                                <th className="border px-4 py-2">Branch</th>
                                <th className="border px-4 py-2">Currency</th>
                                <th className="border px-4 py-2">Revenue</th>
                            </tr>
                            </thead>
                            <tbody>
                            {revenueData.map((item, index) => (
                                <tr key={index}>
                                    <td className="border px-4 py-2">{item.branch.name}</td>
                                    <td className="border px-4 py-2">{item.currency}</td>
                                    <td className="border px-4 py-2">{item.revenue.toLocaleString()} /-</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <button
                            onClick={togglePopup}
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

        </Layout>
    );
};

export default AdminDashboard;
