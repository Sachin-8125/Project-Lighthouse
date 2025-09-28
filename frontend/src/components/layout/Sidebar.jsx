import React from "react";
import { NavLink } from "react-router-dom";
import {LayoutDashboard, Users, AlertTriangle} from "lucide-react";

const Sidebar = () => {
    const navLinkClass = ({ isActive }) =>
        `flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 ${
            isActive ? 'bg-blue-100 dark:bg-gray-700 text-blue-600 dark:text-white font-semibold' : ''
        }`;

    return (
        <aside className="w-64 flex-shrink-0 p-4 bg-white dark:bg-gray-800 border-r dark:border-gray-700">
            <div className="flex items-center mb-8">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-blue-600"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 12v6"/><path d="M12 6h.01"/></svg>
                <h1 className="text-xl font-bold ml-2">AcadiaPulse</h1>
            </div>
            <nav className="space-y-2">
                <NavLink to="/" end className={navLinkClass}>
                    <LayoutDashboard className="h-5 w-5 mr-3" />
                    Dashboard
                </NavLink>
                <NavLink to="/students" className={navLinkClass}>
                    <Users className="h-5 w-5 mr-3" />
                    Students
                </NavLink>
                <NavLink to="/alerts" className={navLinkClass}>
                    <AlertTriangle className="h-5 w-5 mr-3" />
                    Alerts
                </NavLink>
            </nav>
        </aside>
    );
}

export default Sidebar;