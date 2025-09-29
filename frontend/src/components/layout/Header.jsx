import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
            <div>
                {/* Can add breadcrumbs or page title here */}
            </div>
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                     <User className="h-5 w-5 text-gray-500" />
                     <span className="text-sm font-medium">{user?.name || 'User'}</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    aria-label="Logout"
                >
                    <LogOut className="h-5 w-5 text-gray-500" />
                </button>
            </div>
        </header>
    );
};

export default Header;