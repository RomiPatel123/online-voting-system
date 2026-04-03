import React from 'react';
import { LayoutDashboard, Users, BarChart3, LogOut, CheckSquare, Vote } from 'lucide-react';
import { useAuth } from '../../src/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import '../admin.css';

const AdminSidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { label: 'Dashboard',          path: '/admin',          icon: LayoutDashboard },
        { label: 'Elections',           path: '/admin/elections', icon: CheckSquare },
        { label: 'Voter Verification',  path: '/admin/voters',   icon: Users },
        { label: 'Results',             path: '/admin/results',  icon: BarChart3 },
    ];

    const initials = (user?.name || 'Admin User')
        .split(' ')
        .map(w => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <aside className="admin-sidebar">
            {/* Brand */}
            <div>
                <div className="sidebar-brand">
                    <div className="brand-icon">
                        <Vote size={18} />
                    </div>
                    <div>
                        <div className="brand-name">VoteAdmin</div>
                        <div className="brand-tagline">Control Panel</div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    <div className="nav-section-label">Main Menu</div>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <div
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                            >
                                <span className="nav-icon"><Icon size={17} /></span>
                                {item.label}
                            </div>
                        );
                    })}
                </nav>
            </div>

            {/* Footer */}
            <div className="sidebar-footer">
                <div className="admin-profile">
                    <div className="admin-avatar">{initials}</div>
                    <div>
                        <div className="admin-name">{user?.name || 'Admin User'}</div>
                        <div className="admin-role">{user?.role || 'Administrator'}</div>
                    </div>
                </div>
                <button className="btn-logout" onClick={handleLogout}>
                    <LogOut size={15} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
