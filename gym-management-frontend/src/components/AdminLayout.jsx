/** @format */
import { useState } from "react";
import {
	Bell,
	CalendarDays,
	Dumbbell,
	LayoutDashboard,
	Link,
	LogOut,
	Search,
	ChevronDown,
	Settings,
	Users,
	UserRoundCog,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminLayout() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const [globalSearch, setGlobalSearch] = useState("");

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	const getInitials = () => {
		return `${user?.name?.charAt(0) || ""}${user?.surname?.charAt(0) || ""}`;
	};

	return (
		<div className="fitcore-layout">
			{/* SIDEBAR */}
			<aside className="fitcore-sidebar">
				<div className="fitcore-logo">
					<div className="fitcore-logo-icon">
						<Dumbbell size={20} />
					</div>

					<div className="fitcore-logo-text">
						Fit<span>Core</span>
					</div>
				</div>

				<nav className="fitcore-nav">
					<NavLink
						to="/admin"
						end
						className={({ isActive }) =>
							`fitcore-nav-link ${isActive ? "active" : ""}`
						}
					>
						<LayoutDashboard className="fitcore-nav-icon" size={19} />
						<span>Dashboard</span>
					</NavLink>

					<NavLink
						to="/admin/members"
						className={({ isActive }) =>
							`fitcore-nav-link ${isActive ? "active" : ""}`
						}
					>
						<Users className="fitcore-nav-icon" size={19} />
						<span>Members</span>
					</NavLink>

					<NavLink
						to="/admin/trainers"
						className={({ isActive }) =>
							`fitcore-nav-link ${isActive ? "active" : ""}`
						}
					>
						<UserRoundCog className="fitcore-nav-icon" size={19} />
						<span>Trainers</span>
					</NavLink>

					<NavLink
						to="/admin/programmes"
						className={({ isActive }) =>
							`fitcore-nav-link ${isActive ? "active" : ""}`
						}
					>
						<CalendarDays className="fitcore-nav-icon" size={19} />
						<span>Programmes</span>
					</NavLink>

					<NavLink
						to="/admin/workout-plans"
						className={({ isActive }) =>
							`fitcore-nav-link ${isActive ? "active" : ""}`
						}
					>
						<Link className="fitcore-nav-icon" size={19} />
						<span>Workout Plans</span>
					</NavLink>
				</nav>

				<div className="fitcore-sidebar-user">
					<div className="fitcore-user">
						<div className="fitcore-avatar">{getInitials()}</div>

						<div>
							<div className="fitcore-user-name">
								{user?.name} {user?.surname}
							</div>

							<div className="fitcore-user-role">Administrator</div>
						</div>
					</div>

					<button
						onClick={handleLogout}
						className="btn btn-link text-secondary p-0 mt-3"
						style={{
							fontSize: "12px",
							textDecoration: "none",
						}}
					>
						<LogOut size={14} className="me-1" />
						Logout
					</button>
				</div>
			</aside>

			{/* MAIN */}
			<div className="fitcore-main">
				{/* TOPBAR */}
				<header className="fitcore-topbar">
					<div className="fitcore-global-search">
						<Search size={18} className="fitcore-global-search-icon" />

						<input
							type="text"
							placeholder="Search members, trainers, programmes..."
							value={globalSearch}
							onChange={(event) => setGlobalSearch(event.target.value)}
						/>
					</div>

					<div className="fitcore-topbar-user">
						<button
							type="button"
							className="fitcore-notification-btn"
							title="Notifications"
						>
							<Bell size={20} />

							<span className="fitcore-notification-badge">3</span>
						</button>

						<div className="fitcore-header-profile">
							<div className="fitcore-header-avatar">
								{user?.name?.charAt(0)?.toUpperCase() || "A"}
							</div>

							<div className="fitcore-header-user-info">
								<span className="fitcore-header-user-name">
									{user?.name || "Admin"}
								</span>

								<span className="fitcore-header-user-role">Administrator</span>
							</div>

							<ChevronDown size={17} className="fitcore-header-chevron" />
						</div>
					</div>
				</header>

				<main>
					<Outlet
						context={{
							globalSearch,
							setGlobalSearch,
						}}
					/>
				</main>
			</div>
		</div>
	);
}

export default AdminLayout;
