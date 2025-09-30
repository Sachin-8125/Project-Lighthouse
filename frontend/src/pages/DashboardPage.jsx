import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import Spinner from '../components/common/Spinner';
import { AlertTriangle, UserCheck, UserX, User, BarChart } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const DashboardPage = () => {
    const [stats,setStats] = useState({ high: 0, medium: 0, low: 0, total: 0 });
    const [alerts,setAlerts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error,setError] = useState('');

    useEffect(() => {
        const fetchData = async () => { 
            setIsLoading(true);
            try {
                const [studentsResponse, alertsResponse] = await Promise.all([
                    apiClient.get('/students'),
                    apiClient.get('/alerts')
                ]);

                const studentsData = studentsResponse.data?.data || [];
                const highRisk = studentsData.filter(s => s.riskLevel === 'High').length;
                const mediumRisk = studentsData.filter(s => s.riskLevel === 'Medium').length;
                const lowRisk = studentsData.filter(s => s.riskLevel === 'Low').length;
                
                setStats({
                    high: highRisk,
                    medium: mediumRisk,
                    low: lowRisk,
                    total: studentsData.length
                });
                
                setAlerts((alertsResponse.data?.data || []).slice(0,5));
            } catch (err) {
                setError("failed to fetch dashboard data");
                console.error(err);
            }finally{
                setIsLoading(false);
            }
        };
        fetchData();
    },[]);

    const chartData = [
        { name: 'Low Risk', count:stats.low, color:'#4ade80' },
        { name: 'Medium Risk', count: stats.medium, color: '#facc15' },
        { name: 'High Risk', count: stats.high, color: '#f87171' },
    ];

    if(isLoading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<UserX className="text-red-500" />} title="High Risk" value={stats.high} color="red" />
                <StatCard icon={<AlertTriangle className="text-yellow-500" />} title="Medium Risk" value={stats.medium} color="yellow" />
                <StatCard icon={<UserCheck className="text-green-500" />} title="Low Risk" value={stats.low} color="green" />
                <StatCard icon={<User className="text-blue-500" />} title="Total Students" value={stats.total} color="blue" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Risk Distribution Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <BarChart className="mr-2 h-5 w-5" /> Student Risk Distribution
                    </h2>
                    <div style={{ width: '100%', height: 300 }}>
                         <ResponsiveContainer>
                            <RechartsBarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="name" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(31, 41, 55, 0.8)', 
                                        borderColor: '#4b5563'
                                    }}
                                    cursor={{fill: 'rgba(75, 85, 99, 0.2)'}}
                                />
                                <Bar dataKey="count" name="Students" barSize={50}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Alerts */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <AlertTriangle className="mr-2 h-5 w-5 text-red-500" /> Recent Alerts
                    </h2>
                    <div className="space-y-4">
                        {(alerts || []).length > 0 ? (alerts || []).map(alert => (
                            <div key={alert.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                <Link to={`/students/${alert.studentId}`} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                                    {alert.student.name}
                                </Link>
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate" title={alert.reason}>{alert.reason}</p>
                                <p className="text-xs text-gray-400 mt-1">{format(new Date(alert.createdAt), 'PPp')}</p>
                            </div>
                        )) : (
                            <p className="text-gray-500">No open alerts.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value, color }) => { 
    const colors = {
        red: 'border-red-500',
        yellow: 'border-yellow-500',
        green: 'border-green-500',
        blue: 'border-blue-500',
    };

    return (
        <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex items-center space-x-4 border-l-4 ${colors[color]}`}>
            <div className="text-3xl">{icon}</div>
            <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
    );
};

export default DashboardPage;