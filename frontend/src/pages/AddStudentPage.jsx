import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import Spinner from '../components/common/Spinner';
import { ArrowLeft } from 'lucide-react';


const AddStudentPage = () => {  
    const [formData, setFormData] = useState({
        name: '',
        studentId: '',
        email: '',
        enrollmentDate: ''
    });
    const [error,setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading,setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                ...formData,
                enrollmentDate: new Date(formData.enrollmentDate).toISOString()
            };
            await apiClient.post('/students', payload);
            setSuccess('Student added successfully! Redirecting...');
            setTimeout(() => navigate('/students'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add student. Please check the details.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
             <Link to="/students" className="flex items-center gap-2 text-sm text-blue-600 hover:underline mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to Students List
            </Link>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
                <h1 className="text-2xl font-bold mb-6">Add New Student</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                        <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"/>
                    </div>
                     <div>
                        <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Student ID</label>
                        <input type="text" name="studentId" id="studentId" required value={formData.studentId} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"/>
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                        <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"/>
                    </div>
                     <div>
                        <label htmlFor="enrollmentDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Enrollment Date</label>
                        <input type="date" name="enrollmentDate" id="enrollmentDate" required value={formData.enrollmentDate} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"/>
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    {success && <p className="text-sm text-green-500">{success}</p>}
                    <div className="flex justify-end">
                        <button type="submit" disabled={isLoading} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300">
                             {isLoading ? <Spinner size="sm"/> : 'Add Student'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddStudentPage;