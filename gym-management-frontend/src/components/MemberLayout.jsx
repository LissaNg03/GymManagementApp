/** @format */

import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import {
	Bell,
	ChevronDown,
	ClipboardList,
	Dumbbell,
	LayoutDashboard,
	LogOut,
	Search,
	Target,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function MemberLayout() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const [globalSearch, setGlobalSearch] = useState("");

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	const getInitials = () => {
		const firstName = user?.name || "";
		const surname = user?.surname || "";

		const firstInitial = firstName.charAt(0).toUpperCase();
		const surnameInitial = surname.charAt(0).toUpperCase();

		return `${firstInitial}${surnameInitial}` || "GM";
	};

	const memberName =
		`${user?.name || ""} ${user?.surname || ""}`.trim() || "Gym Member";

	return (
		<div className="fitcore-layout">
			{/* =====================================================
				SIDEBAR
			===================================================== */}

			<aside className="fitcore-sidebar">
				{/* LOGO */}
				<div className="fitcore-logo">
					<div className="fitcore-logo-icon">
						<Dumbbell size={21} />
					</div>

					<div className="fitcore-logo-text">
						Fit<span>Core</span>
					</div>
				</div>

				{/* NAVIGATION */}
				<nav className="fitcore-nav">
					<NavLink
						to="/member"
						end
						className={({ isActive }) =>
							`fitcore-nav-link ${isActive ? "active" : ""}`
						}
					>
						<span className="fitcore-nav-icon">
							<LayoutDashboard size={19} />
						</span>

						<span>Dashboard</span>
					</NavLink>

					<NavLink
						to="/member/programmes"
						className={({ isActive }) =>
							`fitcore-nav-link ${isActive ? "active" : ""}`
						}
					>
						<span className="fitcore-nav-icon">
							<Target size={19} />
						</span>

						<span>My Programme</span>
					</NavLink>

					<NavLink
						to="/member/workout-plans"
						className={({ isActive }) =>
							`fitcore-nav-link ${isActive ? "active" : ""}`
						}
					>
						<span className="fitcore-nav-icon">
							<ClipboardList size={19} />
						</span>

						<span>Workout Plans</span>
					</NavLink>

					<NavLink
						to="/member/workout-tasks"
						className={({ isActive }) =>
							`fitcore-nav-link ${isActive ? "active" : ""}`
						}
					>
						<span className="fitcore-nav-icon">
							<Dumbbell size={19} />
						</span>

						<span>Workout Tasks</span>
					</NavLink>
				</nav>

				{/* =====================================================
					SIDEBAR USER
				===================================================== */}

				<div className="fitcore-sidebar-user">
					<div className="fitcore-user">
						<div className="fitcore-avatar">{getInitials()}</div>

						<div
							style={{
								flex: 1,
								minWidth: 0,
							}}
						>
							<div className="fitcore-user-name">{memberName}</div>

							<div className="fitcore-user-role">Gym Member</div>
						</div>

						<button
							type="button"
							onClick={handleLogout}
							title="Logout"
							style={{
								width: "34px",
								height: "34px",
								border: "none",
								borderRadius: "7px",
								background: "transparent",
								color: "#9eabba",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								flexShrink: 0,
							}}
						>
							<LogOut size={17} />
						</button>
					</div>
				</div>
			</aside>

			{/* =====================================================
				MAIN AREA
			===================================================== */}

			<div className="fitcore-main">
				{/* =================================================
					FIXED TOP HEADER
				================================================= */}

				<header className="fitcore-topbar">
					{/* GLOBAL SEARCH */}

					<div className="fitcore-global-search">
						<Search size={18} className="fitcore-global-search-icon" />

						<input
							type="text"
							placeholder="Search programmes, workouts, tasks..."
							value={globalSearch}
							onChange={(event) => setGlobalSearch(event.target.value)}
						/>
					</div>

					{/* HEADER RIGHT */}

					<div className="fitcore-topbar-user">
						{/* NOTIFICATIONS */}

						<button
							type="button"
							className="fitcore-notification-btn"
							title="Notifications"
						>
							<Bell size={20} />

							<span className="fitcore-notification-badge">3</span>
						</button>

						{/* MEMBER PROFILE */}

						<div className="fitcore-header-profile">
							<div className="fitcore-header-avatar">{getInitials()}</div>

							<div className="fitcore-header-user-info">
								<span className="fitcore-header-user-name">{memberName}</span>

								<span className="fitcore-header-user-role">Gym Member</span>
							</div>

							<ChevronDown size={17} className="fitcore-header-chevron" />
						</div>
					</div>
				</header>

				{/* =================================================
					PAGE CONTENT
				================================================= */}

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

export default MemberLayout;
