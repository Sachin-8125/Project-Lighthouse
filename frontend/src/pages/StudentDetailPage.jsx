import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/apiClient';
import Spinner from '../components/common/Spinner';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';
import { AlertTriangle, TrendingDown, Clock, BookOpen } from 'lucide-react';

const StudentDetailPage = () => {
    const { id } = useParams();
    const [student, setStudent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [adding, setAdding] = useState(false);
    const [scoreForm, setScoreForm] = useState({
        assignmentId: '',
        courseId: '',
        courseCode: '',
        title: '',
        dueDate: '',
        maxScore: '',
        submittedAt: '',
        grade: '',
        mode: 'existing',
    });
    const [allCourses, setAllCourses] = useState([]);

    useEffect(() => {
        const fetchStudent = async () => {
            setIsLoading(true);
            try {
                const response = await apiClient.get(`/students/${id}`);
                setStudent(response.data.data);
            } catch (err) {
                setError('Failed to fetch student details.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchAllCourses = async () => {
            try {
                const response = await apiClient.get('/courses');
                setAllCourses(response.data.data);
            } catch (err) {
                console.error('Failed to fetch courses.', err);
            }
        };

        fetchStudent();
        fetchAllCourses();
    }, [id]);

    const postScore = async (e) => {
        e.preventDefault();
        setAdding(true);
        setError('');
        try {
            // Basic client-side validation to avoid 400s
            if (scoreForm.mode === 'existing') {
                if (!scoreForm.assignmentId.trim()) {
                    setError('Assignment ID is required when adding a score to an existing assignment.');
                    setAdding(false);
                    return;
                }
                if (!scoreForm.submittedAt) {
                    setError('Submitted At is required.');
                    setAdding(false);
                    return;
                }
            } else {
                const hasCourseRef = (scoreForm.courseId && scoreForm.courseId.trim()) || (scoreForm.courseCode && scoreForm.courseCode.trim());
                if (!hasCourseRef || !scoreForm.title.trim() || !scoreForm.dueDate || !scoreForm.maxScore || !scoreForm.submittedAt) {
                    setError('Course (select from list) or Course Code, Title, Due Date, Max Score, and Submitted At are required when creating a new assignment.');
                    setAdding(false);
                    return;
                }
            }

            // Convert datetime-local values to ISO 8601 strings the backend expects
            const submittedAtIso = new Date(scoreForm.submittedAt).toISOString();
            const dueDateIso = scoreForm.dueDate ? new Date(scoreForm.dueDate).toISOString() : undefined;

            const payload = scoreForm.mode === 'existing'
                ? {
                    assignmentId: scoreForm.assignmentId.trim(),
                    submittedAt: submittedAtIso,
                    grade: scoreForm.grade !== '' ? Number(scoreForm.grade) : null,
                }
                : {
                    ...(scoreForm.courseId.trim() ? { courseId: scoreForm.courseId.trim() } : { courseCode: scoreForm.courseCode.trim() }),
                    title: scoreForm.title.trim(),
                    dueDate: dueDateIso,
                    maxScore: Number(scoreForm.maxScore),
                    submittedAt: submittedAtIso,
                    grade: scoreForm.grade !== '' ? Number(scoreForm.grade) : null,
                };

            await apiClient.post(`/students/${id}/scores`, payload);

            // Refresh the student detail to update riskProfile and charts
            const response = await apiClient.get(`/students/${id}`);
            setStudent(response.data.data);

            // Reset form
            setScoreForm({ assignmentId: '', courseId: '', courseCode: '', title: '', dueDate: '', maxScore: '', submittedAt: '', grade: '', mode: 'existing' });
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to add score.');
        } finally {
            setAdding(false);
        }
    };
    
    const getRiskColor = (level, type) => {
        const colorMap = {
            High: { text: 'text-red-500', bg: 'bg-red-100', border: 'border-red-500' },
            Medium: { text: 'text-yellow-500', bg: 'bg-yellow-100', border: 'border-yellow-500' },
            Low: { text: 'text-green-500', bg: 'bg-green-100', border: 'border-green-500' },
        };
        const colors = colorMap[level] || { text: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-500' };
        return colors[type];
    };

    const submissionData = (student?.submissions || []).map(sub => {
        const daysLate = Math.max(0, (new Date(sub.submittedAt) - new Date(sub.assignment.dueDate)) / (1000 * 3600 * 24));
        return {
            date: parseISO(sub.assignment.dueDate),
            grade: sub.grade ? (sub.grade / sub.assignment.maxScore) * 100 : null,
            daysLate: daysLate.toFixed(1),
            assignment: sub.assignment.title
        }
    }).sort((a,b) => a.date - b.date);

    if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!student) return <div>Student not found.</div>;

    const { riskProfile } = student;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">{student.name}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{student.studentId} | {student.email}</p>
                </div>
                <div className={`p-4 rounded-lg shadow-sm text-center ${getRiskColor(riskProfile.riskLevel, 'bg')} dark:bg-opacity-20`}>
                    <p className={`text-sm font-semibold uppercase ${getRiskColor(riskProfile.riskLevel, 'text')}`}>Risk Level</p>
                    <p className={`text-2xl font-bold ${getRiskColor(riskProfile.riskLevel, 'text')}`}>{riskProfile.riskLevel}</p>
                    <p className="text-xs text-gray-500">Score: {(riskProfile.riskScore * 100).toFixed(0)}</p>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard icon={<TrendingDown />} title="Avg. Grade" value={`${riskProfile.averageGrade}%`} />
                <MetricCard icon={<Clock />} title="Late Submissions" value={riskProfile.lateSubmissions} />
                <MetricCard icon={<BookOpen />} title="Missing Work" value={riskProfile.missingAssignments} />
                <MetricCard icon={<AlertTriangle />} title="Open Alerts" value={(student?.alerts || []).filter(a => a.status === 'OPEN').length} />
            </div>

            {/* Performance Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                 <h2 className="text-xl font-semibold mb-4">Performance Over Time</h2>
                 <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                        <LineChart data={submissionData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                            <XAxis 
                                dataKey="date" 
                                tickFormatter={(date) => format(date, 'MMM d')}
                                stroke="#6b7280" 
                            />
                            <YAxis yAxisId="left" stroke="#8884d8" label={{ value: 'Grade %', angle: -90, position: 'insideLeft' }}/>
                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Days Late', angle: -90, position: 'insideRight' }}/>
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563' }}
                                labelFormatter={(label) => format(label, 'PP')}
                            />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="grade" stroke="#8884d8" strokeWidth={2} name="Grade (%)" />
                            <Line yAxisId="right" type="monotone" dataKey="daysLate" stroke="#82ca9d" strokeWidth={2} name="Days Late" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Add Score */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Add Score</h2>
                <form onSubmit={postScore} className="space-y-4">
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                            <input type="radio" name="mode" value="existing" checked={scoreForm.mode === 'existing'} onChange={(e) => setScoreForm({ ...scoreForm, mode: e.target.value })} />
                            Existing Assignment
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="radio" name="mode" value="new" checked={scoreForm.mode === 'new'} onChange={(e) => setScoreForm({ ...scoreForm, mode: e.target.value })} />
                            New Assignment
                        </label>
                    </div>

                    {scoreForm.mode === 'existing' ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-300">Assignment ID</label>
                                <input type="text" className="mt-1 w-full p-2 border rounded bg-white dark:bg-gray-700" value={scoreForm.assignmentId} onChange={(e) => setScoreForm({ ...scoreForm, assignmentId: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-300">Submitted At</label>
                                <input type="datetime-local" className="mt-1 w-full p-2 border rounded bg-white dark:bg-gray-700" value={scoreForm.submittedAt} onChange={(e) => setScoreForm({ ...scoreForm, submittedAt: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-300">Grade</label>
                                <input type="number" className="mt-1 w-full p-2 border rounded bg-white dark:bg-gray-700" value={scoreForm.grade} onChange={(e) => setScoreForm({ ...scoreForm, grade: e.target.value })} placeholder="Leave blank for N/A" />
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-300">Course</label>
                                <select className="mt-1 w-full p-2 border rounded bg-white dark:bg-ray-700" value={scoreForm.courseId} onChange={(e) => setScoreForm({ ...scoreForm, courseId: e.target.value })}>
                                    <option value="">Select a course</option>
                                    {(allCourses || []).map((c) => (
                                        <option key={c.id} value={c.id}>{c.title} ({c.courseCode})</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Or specify Course Code below</p>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-300">Course Code (e.g., CS101)</label>
                                <input type="text" className="mt-1 w-full p-2 border rounded bg-white dark:bg-gray-700" value={scoreForm.courseCode} onChange={(e) => setScoreForm({ ...scoreForm, courseCode: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-300">Title</label>
                                <input type="text" className="mt-1 w-full p-2 border rounded bg-white dark:bg-gray-700" value={scoreForm.title} onChange={(e) => setScoreForm({ ...scoreForm, title: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-300">Due Date</label>
                                <input type="datetime-local" className="mt-1 w-full p-2 border rounded bg-white dark:bg-gray-700" value={scoreForm.dueDate} onChange={(e) => setScoreForm({ ...scoreForm, dueDate: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-300">Max Score</label>
                                <input type="number" className="mt-1 w-full p-2 border rounded bg-white dark:bg-gray-700" value={scoreForm.maxScore} onChange={(e) => setScoreForm({ ...scoreForm, maxScore: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-300">Submitted At</label>
                                <input type="datetime-local" className="mt-1 w-full p-2 border rounded bg-white dark:bg-gray-700" value={scoreForm.submittedAt} onChange={(e) => setScoreForm({ ...scoreForm, submittedAt: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-300">Grade</label>
                                <input type="number" className="mt-1 w-full p-2 border rounded bg-white dark:bg-gray-700" value={scoreForm.grade} onChange={(e) => setScoreForm({ ...scoreForm, grade: e.target.value })} placeholder="Leave blank for N/A" />
                            </div>
                        </div>
                    )}

                    <button type="submit" disabled={adding} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        {adding ? 'Saving...' : 'Add Score'}
                    </button>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </form>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Submission History */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Submission History</h2>
                    <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                        {(student?.submissions || []).map(sub => {
                             const daysLate = Math.round((new Date(sub.submittedAt) - new Date(sub.assignment.dueDate)) / (1000 * 3600 * 24));
                            return (
                               <div key={sub.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                   <div className="flex justify-between items-start">
                                       <div>
                                           <p className="font-semibold">{sub.assignment.title}</p>
                                           <p className="text-xs text-gray-500">{sub.assignment.course.title}</p>
                                       </div>
                                       <p className="text-lg font-bold">{sub.grade || 'N/A'}<span className="text-sm font-normal text-gray-400">/{sub.assignment.maxScore}</span></p>
                                   </div>
                                    <p className={`text-xs mt-1 ${daysLate > 1 ? 'text-yellow-500' : 'text-green-500'}`}>
                                        Submitted {daysLate > 0 ? `${daysLate} day(s) late` : 'on time'}
                                    </p>
                               </div>
                            )
                        })}
                    </div>
                </div>

                {/* Alerts History */}
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Alerts History</h2>
                     <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                        {(student?.alerts || []).length > 0 ? (student?.alerts || []).map(alert => (
                           <div key={alert.id} className={`p-3 rounded-md border-l-4 ${alert.status === 'OPEN' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-400'}`}>
                               <p className="font-semibold text-sm">{alert.reason}</p>
                               <div className="flex justify-between items-baseline mt-1">
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${alert.status === 'OPEN' ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-800'}`}>
                                        {alert.status}
                                    </span>
                                    <p className="text-xs text-gray-400">{format(new Date(alert.createdAt), 'PP')}</p>
                               </div>
                           </div>
                        )) : <p className="text-gray-500">No alerts found for this student.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ icon, title, value }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center space-x-3">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-600 dark:text-blue-300">
            {React.cloneElement(icon, { className: "h-6 w-6"})}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-xl font-bold">{value}</p>
        </div>
    </div>
);


export default StudentDetailPage;