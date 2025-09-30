import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import DashboardPage from '../pages/DashboardPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import StudentsListPage from '../pages/StudentsListPage';
import StudentDetailPage from '../pages/StudentDetailPage';
import MainLayout from '../components/layout/MainLayout';
import NotFoundPage from '../pages/NotFoundPage';
import AddStudentPage from '../pages/AddStudentPage';
import ErrorBoundary from '../components/common/ErrorBoundary';
import AlertsPage from '../pages/AlertsPage';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route 
                path="/"
                element={
                    <PrivateRoute>
                        <ErrorBoundary>
                            <MainLayout />
                        </ErrorBoundary>
                    </PrivateRoute>
                }
            >
                <Route index element={<DashboardPage />} />
                <Route path="students" element={<StudentsListPage />} />
                <Route path="students/new" element={<AddStudentPage />} />
                <Route path="students/:id" element={<StudentDetailPage />} />
                <Route path="alerts" element={<AlertsPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

export default AppRoutes;