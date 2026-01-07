
import "./Styles/sideBarStyle.css";
import { NavLink } from "react-router-dom";
// Icons
import HomeIcon from "./Icons/HomeIcon";
import OrderIcon from "./Icons/IncomeIcon";
import ExpenseIcon from './Icons/ExpenseIcon';
import CustomersIcon from './Icons/CustomersIcon';
import ReportIcon from './Icons/ReportIcon';
import SettingsIcon from './Icons/SettingsIcon';
import CloseSideBarIcon from './Icons/CloseSideBarIcon';

const SideBar = ({ isOpen, toggleSidebar }) => {
    const menuGroups = [
        {
            title: "Navigation",
            items: [
                { to: "/", label: "Dashboard", icon: <HomeIcon className="sidebar-icon" /> },
                { to: "/income", label: "Income", icon: <OrderIcon className="sidebar-icon" /> },
                { to: "/expense", label: "Expense", icon: <ExpenseIcon className="sidebar-icon" /> },
                { to: "/debts", label: "Debts", icon: <CustomersIcon className="sidebar-icon" /> },
            ]
        },
        {
            title: "Management",
            items: [
                { to: "/reports", label: "Reports", icon: <ReportIcon className="sidebar-icon" /> },
                { to: "/settings", label: "Settings", icon: <SettingsIcon className="sidebar-icon" /> },
            ]
        }
    ];

    
    return (
        <aside className={`sidebar ${isOpen ? '' : 'closed'}`}>
            <div className="sidebar-header">
                <h2 className="sidebar-title">Shortcuts</h2>
                <button className="close-sidebar-button" type="button" onClick={toggleSidebar} aria-label="Close Sidebar">
                    <CloseSideBarIcon />
                </button>
            </div>

            <nav className="sidebar-menu">
                {menuGroups.map((group, idx) => (
                    <div key={idx} className="sidebar-group">
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
