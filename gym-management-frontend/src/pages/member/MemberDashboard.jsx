/** @format */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	ArrowUpRight,
	ClipboardList,
	Dumbbell,
	Mail,
	Phone,
	Target,
	UserRound,
} from "lucide-react";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function MemberDashboard() {
	const { user } = useAuth();
	const navigate = useNavigate();

	const [member, setMember] = useState(null);
	const [programmes, setProgrammes] = useState([]);
	const [workoutPlans, setWorkoutPlans] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const loadDashboard = async () => {
			try {
				setLoading(true);
				setError("");

				const [memberResponse, programmesResponse, plansResponse] =
					await Promise.all([
						api.get("/GymMembers/my"),
						api.get("/GymMembers/my/training-programmes"),
						api.get("/GymMembers/my/workout-plans"),
					]);

				setMember(memberResponse.data);

				setProgrammes(
					Array.isArray(programmesResponse.data) ? programmesResponse.data : [],
				);

				setWorkoutPlans(
					Array.isArray(plansResponse.data) ? plansResponse.data : [],
				);
			} catch (error) {
				console.error("Failed to load member dashboard:", error);

				setError(error.response?.data?.message || "Failed to load dashboard.");
			} finally {
				setLoading(false);
			}
		};

		loadDashboard();
	}, []);

	/* =====================================================
		HELPERS
	===================================================== */

	const getMembershipBadge = (type) => {
		const value = type?.toLowerCase() || "";

		if (value.includes("premium") || value.includes("gold")) {
			return "fitcore-badge-warning";
		}

		if (value.includes("vip") || value.includes("platinum")) {
			return "fitcore-badge-purple";
		}

		if (value.includes("standard") || value.includes("basic")) {
			return "fitcore-badge-blue";
		}

		return "fitcore-badge-gray";
	};

	/* =====================================================
		LOADING
	===================================================== */

	if (loading) {
		return (
			<div className="fitcore-content">
				<div
					className="fitcore-card"
					style={{
						minHeight: "420px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<div className="text-center">
						<div className="spinner-border text-primary" role="status">
							<span className="visually-hidden">Loading...</span>
						</div>

						<p
							style={{
								marginTop: "12px",
								marginBottom: 0,
								fontSize: "13px",
								color: "#7b8798",
							}}
						>
							Loading your dashboard...
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="fitcore-content">
			{/* =====================================================
				HERO
			===================================================== */}

			<section
				className="admin-hero"
				style={{
					background:
						"linear-gradient(110deg, #031525 0%, #08243d 60%, #0878f9 150%)",
				}}
			>
				<div
					style={{
						position: "absolute",
						right: "6%",
						top: "50%",
						transform: "translateY(-50%)",
						opacity: 0.08,
						color: "#ffffff",
						zIndex: 1,
					}}
				>
					<Dumbbell size={170} />
				</div>

				<div className="admin-hero-overlay" />

				<div className="admin-hero-content">
					<p className="admin-hero-greeting">
						Welcome, {user?.name || "Member"}
					</p>

					<h1>
						My <span>Fitness Dashboard</span>
					</h1>

					<p className="admin-hero-subtitle">
						View your training programme, workout plans and fitness activities —
						all in one place.
					</p>
				</div>
			</section>

			{/* =====================================================
				ERROR
			===================================================== */}

			{error && (
				<div className="alert alert-danger" role="alert">
					{error}
				</div>
			)}

			{/* =====================================================
				STATS
			===================================================== */}

			<div className="row g-4 mb-4">
				{/* PROGRAMMES */}

				<div className="col-12 col-md-6">
					<div
						className="fitcore-stat-card h-100"
						style={{
							display: "block",
							padding: "20px",
						}}
					>
						{/* TOP ROW */}
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								gap: "15px",
								marginBottom: "20px",
							}}
						>
							{/* ICON + HEADING */}
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "12px",
								}}
							>
								<div
									className="fitcore-stat-icon"
									style={{
										background: "#e7f1ff",
										color: "#0878f9",
										flexShrink: 0,
									}}
								>
									<Target size={23} />
								</div>

								<span className="fitcore-stat-label">Training Programmes</span>
							</div>

							{/* ARROW */}
							<button
								type="button"
								onClick={() => navigate("/member/programmes")}
								title="View programmes"
								style={{
									width: "36px",
									height: "36px",
									border: "1px solid #e8edf3",
									borderRadius: "9px",
									background: "#f7f9fc",
									color: "#0878f9",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									padding: 0,
									cursor: "pointer",
									flexShrink: 0,
								}}
							>
								<ArrowUpRight size={18} />
							</button>
						</div>

						{/* BOTTOM ROW */}
						<div
							style={{
								display: "flex",
								alignItems: "flex-end",
								justifyContent: "space-between",
								gap: "20px",
							}}
						>
							<h2
								style={{
									margin: 0,
									fontSize: "32px",
									fontWeight: 700,
									color: "#172033",
									lineHeight: 1,
								}}
							>
								{programmes.length}
							</h2>

							<p
								style={{
									margin: 0,
									fontSize: "12px",
									color: "#7b8798",
									textAlign: "right",
								}}
							>
								Assigned training programmes
							</p>
						</div>
					</div>
				</div>

				{/* WORKOUT PLANS */}

				<div className="col-12 col-md-6">
					<div
						className="fitcore-stat-card h-100"
						style={{
							display: "block",
							padding: "20px",
						}}
					>
						{/* TOP ROW */}
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								gap: "15px",
								marginBottom: "20px",
							}}
						>
							{/* ICON + HEADING */}
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "12px",
								}}
							>
								<div
									className="fitcore-stat-icon"
									style={{
										background: "#eef9f3",
										color: "#16b364",
										flexShrink: 0,
									}}
								>
									<ClipboardList size={23} />
								</div>

								<span className="fitcore-stat-label">Workout Plans</span>
							</div>

							{/* ARROW */}
							<button
								type="button"
								onClick={() => navigate("/member/workout-plans")}
								title="View workout plans"
								style={{
									width: "36px",
									height: "36px",
									border: "1px solid #e8edf3",
									borderRadius: "9px",
									background: "#f7f9fc",
									color: "#0878f9",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									padding: 0,
									cursor: "pointer",
									flexShrink: 0,
								}}
							>
								<ArrowUpRight size={18} />
							</button>
						</div>

						{/* BOTTOM ROW */}
						<div
							style={{
								display: "flex",
								alignItems: "flex-end",
								justifyContent: "space-between",
								gap: "20px",
							}}
						>
							<h2
								style={{
									margin: 0,
									fontSize: "32px",
									fontWeight: 700,
									color: "#172033",
									lineHeight: 1,
								}}
							>
								{workoutPlans.length}
							</h2>

							<p
								style={{
									margin: 0,
									fontSize: "12px",
									color: "#7b8798",
									textAlign: "right",
								}}
							>
								Assigned workout plans
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* =====================================================
				MEMBER PROFILE
			===================================================== */}

			{member && (
				<div className="fitcore-card mb-4">
					<div className="fitcore-card-header">
						<div>
							<h3>My Profile</h3>

							<p>Your FitCore membership information</p>
						</div>

						<div
							className="fitcore-icon-box"
							style={{
								width: "40px",
								height: "40px",
							}}
						>
							<UserRound size={19} />
						</div>
					</div>

					<div className="fitcore-card-body">
						<div className="row g-4">
							{/* MEMBER NUMBER */}

							<div className="col-12 col-sm-6 col-lg-3">
								<div
									style={{
										fontSize: "11px",
										color: "#8a96a6",
										marginBottom: "5px",
										fontWeight: 600,
										textTransform: "uppercase",
										letterSpacing: "0.4px",
									}}
								>
									Member Number
								</div>

								<strong
									style={{
										color: "#172033",
										fontSize: "14px",
									}}
								>
									{member.memberNumber || "—"}
								</strong>
							</div>

							{/* NAME */}

							<div className="col-12 col-sm-6 col-lg-3">
								<div
									style={{
										fontSize: "11px",
										color: "#8a96a6",
										marginBottom: "5px",
										fontWeight: 600,
										textTransform: "uppercase",
										letterSpacing: "0.4px",
									}}
								>
									Full Name
								</div>

								<strong
									style={{
										color: "#172033",
										fontSize: "14px",
									}}
								>
									{member.name} {member.surname}
								</strong>
							</div>

							{/* MEMBERSHIP */}

							<div className="col-12 col-sm-6 col-lg-3">
								<div
									style={{
										fontSize: "11px",
										color: "#8a96a6",
										marginBottom: "7px",
										fontWeight: 600,
										textTransform: "uppercase",
										letterSpacing: "0.4px",
									}}
								>
									Membership
								</div>

								<span
									className={`fitcore-badge ${getMembershipBadge(
										member.membershipType,
									)}`}
								>
									{member.membershipType || "—"}
								</span>
							</div>

							{/* GENDER */}

							<div className="col-12 col-sm-6 col-lg-3">
								<div
									style={{
										fontSize: "11px",
										color: "#8a96a6",
										marginBottom: "5px",
										fontWeight: 600,
										textTransform: "uppercase",
										letterSpacing: "0.4px",
									}}
								>
									Gender
								</div>

								<strong
									style={{
										color: "#172033",
										fontSize: "14px",
									}}
								>
									{member.gender || "—"}
								</strong>
							</div>

							{/* EMAIL */}

							{member.email && (
								<div className="col-12 col-md-6">
									<div
										style={{
											display: "flex",
											alignItems: "center",
											gap: "9px",
											color: "#687588",
											fontSize: "13px",
										}}
									>
										<Mail
											size={15}
											style={{
												color: "#0878f9",
											}}
										/>

										{member.email}
									</div>
								</div>
							)}

							{/* PHONE */}

							{member.phoneNumber && (
								<div className="col-12 col-md-6">
									<div
										style={{
											display: "flex",
											alignItems: "center",
											gap: "9px",
											color: "#687588",
											fontSize: "13px",
										}}
									>
										<Phone
											size={15}
											style={{
												color: "#0878f9",
											}}
										/>

										{member.phoneNumber}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* =====================================================
				TRAINING PROGRAMMES
			===================================================== */}

			<div className="fitcore-card">
				<div className="fitcore-card-header">
					<div>
						<h3>My Training Programmes</h3>

						<p>Programmes currently assigned to you</p>
					</div>

					<button
						type="button"
						className="fitcore-btn-primary"
						onClick={() => navigate("/member/programmes")}
					>
						View All
						<ArrowUpRight size={16} />
					</button>
				</div>

				<div className="fitcore-card-body">
					{programmes.length === 0 ? (
						<div
							style={{
								minHeight: "180px",
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								justifyContent: "center",
								textAlign: "center",
							}}
						>
							<div
								className="fitcore-icon-box"
								style={{
									width: "52px",
									height: "52px",
									marginBottom: "12px",
								}}
							>
								<Target size={23} />
							</div>

							<strong
								style={{
									fontSize: "14px",
									color: "#172033",
								}}
							>
								No programmes assigned
							</strong>

							<p
								style={{
									fontSize: "12px",
									color: "#7b8798",
									marginTop: "5px",
									marginBottom: 0,
								}}
							>
								You don't have any training programmes assigned yet.
							</p>
						</div>
					) : (
						<div className="row g-3">
							{programmes.slice(0, 3).map((programme) => (
								<div
									className="col-12 col-md-6 col-xl-4"
									key={programme.trainingProgrammeId}
								>
									<div
										style={{
											height: "100%",
											border: "1px solid #e8edf3",
											borderRadius: "10px",
											padding: "18px",
											background: "#ffffff",
										}}
									>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												justifyContent: "space-between",
												gap: "10px",
												marginBottom: "14px",
											}}
										>
											<div
												className="fitcore-icon-box"
												style={{
													width: "40px",
													height: "40px",
												}}
											>
												<Target size={18} />
											</div>

											<span className="fitcore-badge fitcore-badge-blue">
												{programme.fitnessGoal || "Fitness"}
											</span>
										</div>

										<h4
											style={{
												fontSize: "15px",
												fontWeight: 700,
												color: "#172033",
												marginBottom: "7px",
											}}
										>
											{programme.programmeName}
										</h4>

										<p
											style={{
												fontSize: "12px",
												lineHeight: 1.6,
												color: "#7b8798",
												marginBottom: "14px",
												minHeight: "38px",
											}}
										>
											{programme.description || "No description available."}
										</p>

										<div
											style={{
												borderTop: "1px solid #edf0f4",
												paddingTop: "12px",
												display: "flex",
												alignItems: "center",
												justifyContent: "space-between",
												fontSize: "12px",
											}}
										>
											<span
												style={{
													color: "#7b8798",
												}}
											>
												Duration
											</span>

											<strong
												style={{
													color: "#172033",
												}}
											>
												{programme.duration}{" "}
												{programme.duration === 1 ? "week" : "weeks"}
											</strong>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* =====================================================
				QUICK ACTIONS
			===================================================== */}

			<div className="fitcore-card mt-4">
				<div className="fitcore-card-header">
					<div>
						<h3>Quick Access</h3>

						<p>Jump straight to your fitness information</p>
					</div>
				</div>

				<div className="fitcore-card-body">
					<div className="row g-3">
						<div className="col-12 col-md-4">
							<button
								type="button"
								className="fitcore-btn-primary w-100"
								onClick={() => navigate("/member/programmes")}
							>
								<Target size={17} />
								My Programme
							</button>
						</div>

						<div className="col-12 col-md-4">
							<button
								type="button"
								className="fitcore-btn-primary w-100"
								onClick={() => navigate("/member/workout-plans")}
							>
								<ClipboardList size={17} />
								Workout Plans
							</button>
						</div>

						<div className="col-12 col-md-4">
							<button
								type="button"
								className="fitcore-btn-primary w-100"
								onClick={() => navigate("/member/workout-tasks")}
							>
								<Dumbbell size={17} />
								Workout Tasks
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default MemberDashboard;
