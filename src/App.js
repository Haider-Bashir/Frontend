import React from "react";
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import LoginPage from "./views/Login";
import LandingPage from "./views/LandingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./views/admin/adminDashboard";
import Branches from "./views/admin/branches";
import AdminBranchDetails from "./components/AdminBranchDetails";
import ProfileAdmin from "./views/admin/profileAdmin";
import Managers from "./views/admin/managers";
import Dashboard from "./views/dashboard";
import Profile from "./views/profile";
import MyBranch from "./components/MyBranch";
import NewApplicant from "./views/newApplcant";
import SearchResultPage from "./components/searchResultPage";
import AdminApplicantsPage from "./views/admin/AdminApplicantsPage";
import AdminViewApplicant from "./views/admin/applicant";
import MyApplicants from "./views/applicants";
import StudentInvoice from "./components/invoice/student_invoice";
import SubAdmins from "./views/admin/SubAdmins";

const App = () => {
    return (
        <Router>
            <Routes>
                {/* ----------------------------Generic Routes------------------------------- */}


                {/* Landing Page */}
                <Route path="/" element={<LandingPage />} />

                {/* Login Page */}
                <Route path="/login" element={<LoginPage />} />

                {/* Catch-All Redirect */}
                <Route path="*" element={<Navigate to="/login" />} />

                {/* -----------------------------Admin Routes------------------------------- */}

                {/* Admin Dashboard */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["admin", "sub-admin"]}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Branches */}
                <Route
                    path={"/admin/branches"}
                    element={
                        <ProtectedRoute allowedRoles={["admin", "sub-admin"]}>
                            <Branches />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Branch Details */}
                <Route
                    path={"/admin/branches/:id"}
                    element={
                        <ProtectedRoute allowedRoles={["admin", "sub-admin"]}>
                            <AdminBranchDetails />
                        </ProtectedRoute>
                    }
                />

                {/* Profile Admin Page */}
                <Route
                    path={"/admin/profile"}
                    element={
                        <ProtectedRoute allowedRoles={["admin", "sub-admin"]}>
                            <ProfileAdmin />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Managers Page */}
                <Route
                    path={"/admin/managers"}
                    element={
                        <ProtectedRoute allowedRoles={["admin", "sub-admin"]}>
                            <Managers />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Applicants Page */}
                <Route
                    path="/admin/applicants"
                    element={
                        <ProtectedRoute allowedRoles={["admin", "sub-admin"]}>
                            <AdminApplicantsPage />
                        </ProtectedRoute>
                    }
                />

                {/* Admin View Applicant Details Page */}
                <Route
                    path="/admin/applicant/:id"
                    element={
                        <ProtectedRoute allowedRoles={["admin", "sub-admin"]}>
                            <AdminViewApplicant />
                        </ProtectedRoute>
                    }
                />

                {/* Admin View Sub Admin Page */}
                <Route
                    path="/admin/sub-admins"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <SubAdmins />
                        </ProtectedRoute>
                    }
                />

                {/* --------------------------Manager Routes--------------------------------- */}

                {/* Manager Dashboard Page */}
                <Route
                    path={"/dashboard"}
                    element={
                        <ProtectedRoute allowedRoles={["manager"]}>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Manager Profile */}
                <Route
                    path={"/profile"}
                    element={
                        <ProtectedRoute allowedRoles={["manager"]}>
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/branch"
                    element={
                        <ProtectedRoute allowedRoles={["manager"]}>
                            <MyBranch />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/applicants"
                    element={
                        <ProtectedRoute allowedRoles={["manager"]}>
                            <MyApplicants />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/applicant/:id"
                    element={
                        <ProtectedRoute allowedRoles={["manager", "admin", "sub-admin"]}>
                            <NewApplicant />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/search/:type/:id"
                    element={
                        <ProtectedRoute allowedRoles={["manager", "admin", "sub-admin"]}>
                            <SearchResultPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/invoice"
                    element={
                        <StudentInvoice />
                    }
                />
            </Routes>
        </Router>
    );
};

export default App;
