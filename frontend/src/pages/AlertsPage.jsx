import React, { useState, useEffect } from 'react';
import { getAlerts } from '../api/apiClient';
import Spinner from '../components/common/Spinner';

const AlertsPage = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const response = await getAlerts();
                setAlerts(response.data.data);
            } catch (err) {
                setError('Failed to fetch alerts. Please try again later.');
            }
            setLoading(false);
        };

        fetchAlerts();
    }, []);

    if (loading) {
        return <Spinner />;
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">{error}</div>;
    }

    return (
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Open Alerts</h1>
            {alerts.length === 0 ? (
                <p className="text-gray-500">No open alerts at the moment.</p>
            ) : (
                <div className="overflow-x-auto shadow-lg rounded-lg">
                    <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
                        <thead className="bg-gray-200 dark:bg-gray-700">
                            <tr>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {alerts.map((alert) => (
                                <tr key={alert.id} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                                    <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{alert.student.name}</td>
                                    <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{alert.reason}</td>
                                    <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{alert.riskScore}</td>
                                    <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(alert.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AlertsPage;
