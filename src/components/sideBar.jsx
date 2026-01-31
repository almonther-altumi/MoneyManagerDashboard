
import "./Styles/sideBarStyle.css";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
// Icons
import HomeIcon from "./Icons/HomeIcon";
import OrderIcon from "./Icons/IncomeIcon";
import ExpenseIcon from './Icons/ExpenseIcon';
import CustomersIcon from './Icons/CustomersIcon';
import ReportIcon from './Icons/ReportIcon';
import SettingsIcon from './Icons/SettingsIcon';
import CloseSideBarIcon from './Icons/CloseSideBarIcon';
import BugIcon from './Icons/BugIcon';
import NotificationIcon from './Icons/Header_Icons/NotificationIcon';
import { auth } from '../firebase';
import { Users } from 'lucide-react';

const SideBar = ({ isOpen, toggleSidebar }) => {
    const { t } = useTranslation();
    const menuGroups = [
        {
            title: t('sidebar.navigation'),
            items: [
                { to: "/", label: t('sidebar.dashboard'), icon: <HomeIcon className="sidebar-icon" /> },
                { to: "/income", label: t('sidebar.income'), icon: <OrderIcon className="sidebar-icon" /> },
                { to: "/expense", label: t('sidebar.expense'), icon: <ExpenseIcon className="sidebar-icon" /> },
                { to: "/debts", label: t('sidebar.debts'), icon: <CustomersIcon className="sidebar-icon" /> },
                { to: "/reports", label: t('sidebar.reports'), icon: <ReportIcon className="sidebar-icon" /> },
            ]
        },
        {
            title: t('sidebar.management'),
            className: "mt-auto",
            items: [
                ...(auth.currentUser?.email === 'monthertumi2025@gmail.com' ? [
                    { to: "/admin/notifications", label: t('sidebar.admin'), icon: <NotificationIcon className="sidebar-icon" /> },
                    { to: "/admin/users", label: t('sidebar.admin_users'), icon: <Users size={20} className="sidebar-icon" /> }
                ] : []),
                { to: "/settings", label: t('sidebar.settings'), icon: <SettingsIcon className="sidebar-icon" /> },
                { to: "/report-problem", label: t('report.title'), icon: <BugIcon className="sidebar-icon" /> },
            ]
        }
    ];


    return (
        <aside className={`sidebar ${isOpen ? '' : 'closed'}`}>
            <div className="sidebar-header">
                <h2 className="sidebar-title">{t('sidebar.shortcuts')}</h2>
                <button className="close-sidebar-button" type="button" onClick={toggleSidebar} aria-label="Close Sidebar">
                    <CloseSideBarIcon />
                </button>
            </div>

            <nav className="sidebar-menu">
                {menuGroups.map((group, idx) => (
                    <div key={idx} className={`sidebar-group ${group.className || ''}`}>
                        <span className="group-label">{group.title}</span>
                        {group.items.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) => `sidebar-menu-item ${isActive ? 'active' : ''}`}
                                onClick={() => {
                                    if (window.innerWidth <= 1024) toggleSidebar();
                                }}
                            >
                                {item.icon}
                                <h3>{item.label}</h3>
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            <style>{`
                .group-label {
                    font-size: 10px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: var(--text-muted);
                    padding: 0 20px;
                    margin-bottom: 8px;
                    opacity: 0.6;
                }

                @media (max-width: 1024px) {
                    .sidebar {
                        width: 100%;
                        max-width: 300px;
                    }
                }
            `}</style>
        </aside>
    );
};

export default SideBar;
