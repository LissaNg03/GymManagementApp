/** @format */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	ArrowUpRight,
	ClipboardList,
	Dumbbell,
	Target,
	UserRound,
	Users,
} from "lucide-react";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function TrainerDashboard() {
	const { user } = useAuth();
	const navigate = useNavigate();

	const [members, setMembers] = useState([]);
	const [programmes, setProgrammes] = useState([]);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const loadDashboard = async () => {
			try {
				setLoading(true);
				setError("");

				const [membersResponse, programmesResponse] = await Promise.all([
					api.get("/PersonalTrainers/my/members"),
					api.get("/PersonalTrainers/my/training-programmes"),
				]);

				setMembers(
					Array.isArray(membersResponse.data) ? membersResponse.data : [],
				);

				setProgrammes(
					Array.isArray(programmesResponse.data) ? programmesResponse.data : [],
				);
			} catch (error) {
				console.error("Failed to load trainer dashboard:", error);

				setError(
					error.response?.data?.message || "Failed to load trainer dashboard.",
				);
			} finally {
				setLoading(false);
			}
		};

		loadDashboard();
	}, []);

	const recentMembers = [...members].slice(-5).reverse();

	const getMembershipBadge = (membershipType) => {
		const type = membershipType?.toLowerCase() || "";

		if (type.includes("premium") || type.includes("gold")) {
			return "fitcore-badge-warning";
		}

		if (type.includes("vip") || type.includes("platinum")) {
			return "fitcore-badge-purple";
		}

		if (type.includes("standard") || type.includes("basic")) {
			return "fitcore-badge-blue";
		}

		return "fitcore-badge-gray";
	};

	if (loading) {
		return (
			<div
				className="fitcore-content"
				style={{
					minHeight: "70vh",
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
							color: "#7b8798",
							fontSize: "13px",
						}}
					>
						Loading dashboard...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="fitcore-content">
			{/* =====================================================
				ERROR
			===================================================== */}

			{error && (
				<div className="alert alert-danger" role="alert">
					{error}
				</div>
			)}

			{/* =====================================================
				WELCOME
			===================================================== */}

			<div
				className="admin-hero"
				style={{
					background:
						"linear-gradient(110deg, #031525 0%, #08243d 60%, #0878f9 150%)",
				}}
			>
				<div
					style={{
						position: "absolute",
						right: "5%",
						top: "50%",
						transform: "translateY(-50%)",
						opacity: 0.08,
						color: "#ffffff",
					}}
				>
					<Dumbbell size={170} />
				</div>

				<div className="admin-hero-overlay" />

				<div className="admin-hero-content">
					<p className="admin-hero-greeting">
						Welcome, {user?.name || "Trainer"}
					</p>

					<h1>
						Personal Trainer <span>Dashboard</span>
					</h1>

					<p className="admin-hero-subtitle">
						Manage your assigned members, training programmes and workout plans.
					</p>
				</div>
			</div>

			{/* =====================================================
				STAT CARDS
			===================================================== */}

			<div className="row g-3 mb-4">
				{/* MEMBERS */}
				<div className="col-12 col-md-6">
					<div className="fitcore-stat-card h-100">
						<div
							className="fitcore-stat-icon"
							style={{
								background: "#e7f1ff",
								color: "#0878f9",
							}}
						>
							<Users size={24} />
						</div>

						<div>
							<div className="fitcore-stat-label">My Members</div>

							<div className="fitcore-stat-value">{members.length}</div>

							<div
								style={{
									color: "#7b8798",
									fontSize: "11px",
									marginTop: "3px",
								}}
							>
								Members currently assigned to you
							</div>
						</div>
					</div>
				</div>

				{/* PROGRAMMES */}
				<div className="col-12 col-md-6">
					<div className="fitcore-stat-card h-100">
						<div
							className="fitcore-stat-icon"
							style={{
								background: "#e8f9ef",
								color: "#16b364",
							}}
						>
							<Target size={24} />
						</div>

						<div>
							<div className="fitcore-stat-label">My Programmes</div>

							<div className="fitcore-stat-value">{programmes.length}</div>

							<div
								style={{
									color: "#7b8798",
									fontSize: "11px",
									marginTop: "3px",
								}}
							>
								Programmes assigned to your members
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* =====================================================
				MAIN DASHBOARD ROW
			===================================================== */}

			<div className="row g-4 mb-4">
				{/* ASSIGNED MEMBERS */}
				<div className="col-12 col-xl-8">
					<div className="fitcore-card h-100">
						<div className="fitcore-card-header d-flex justify-content-between align-items-center">
							<div>
								<strong>Assigned Members</strong>

								<div
									style={{
										fontSize: "11px",
										color: "#8a96a6",
										marginTop: "3px",
									}}
								>
									Members currently assigned to you
								</div>
							</div>

							<button
								type="button"
								className="btn btn-link p-0"
								style={{
									fontSize: "12px",
									color: "#0878f9",
									textDecoration: "none",
								}}
								onClick={() => navigate("/trainer/members")}
							>
								View All
								<ArrowUpRight size={14} className="ms-1" />
							</button>
						</div>

						<div className="table-responsive">
							<table className="fitcore-table">
								<thead>
									<tr>
										<th>Member No.</th>
										<th>Member</th>
										<th>Gender</th>
										<th>Membership</th>
										<th>Email</th>
									</tr>
								</thead>

								<tbody>
									{recentMembers.length === 0 ? (
										<tr>
											<td
												colSpan="5"
												className="text-center text-muted"
												style={{
													padding: "35px",
												}}
											>
												No members are currently assigned to you.
											</td>
										</tr>
									) : (
										recentMembers.map((member) => (
											<tr key={member.gymMemberId}>
												<td>
													<strong>{member.memberNumber || "—"}</strong>
												</td>

												<td>
													<div
														style={{
															display: "flex",
															alignItems: "center",
															gap: "10px",
														}}
													>
														<div
															className="fitcore-icon-box"
															style={{
																width: "34px",
																height: "34px",
															}}
														>
															<UserRound size={17} />
														</div>

														<div>
															<strong>
																{member.name} {member.surname}
															</strong>
														</div>
													</div>
												</td>

												<td>{member.gender || "—"}</td>

												<td>
													<span
														className={`fitcore-badge ${getMembershipBadge(
															member.membershipType,
														)}`}
													>
														{member.membershipType || "—"}
													</span>
												</td>

												<td>{member.email || "—"}</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					</div>
				</div>

				{/* QUICK ACTIONS */}
				<div className="col-12 col-xl-4">
					<div className="fitcore-card h-100">
						<div className="fitcore-card-header">
							<strong>Quick Actions</strong>

							<div
								style={{
									fontSize: "11px",
									color: "#8a96a6",
									marginTop: "3px",
								}}
							>
								Manage your training activities
							</div>
						</div>

						<div className="fitcore-card-body">
							<button
								type="button"
								className="fitcore-btn-primary w-100 mb-2 d-flex align-items-center gap-2"
								onClick={() => navigate("/trainer/members")}
							>
								<Users size={17} />
								View My Members
							</button>

							<button
								type="button"
								className="fitcore-btn-primary w-100 mb-2 d-flex align-items-center gap-2"
								onClick={() => navigate("/trainer/programmes")}
							>
								<Target size={17} />
								View My Programmes
							</button>

							<button
								type="button"
								className="fitcore-btn-primary w-100 mb-2 d-flex align-items-center gap-2"
								onClick={() => navigate("/trainer/workout-plans")}
							>
								<ClipboardList size={17} />
								Manage Workout Plans
							</button>

							<button
								type="button"
								className="fitcore-btn-primary w-100 d-flex align-items-center gap-2"
								onClick={() => navigate("/trainer/workout-tasks")}
							>
								<Dumbbell size={17} />
								Manage Workout Tasks
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* =====================================================
				PROGRAMMES
			===================================================== */}

			<div className="fitcore-card">
				<div className="fitcore-card-header d-flex justify-content-between align-items-center">
					<div>
						<strong>My Training Programmes</strong>

						<div
							style={{
								fontSize: "11px",
								color: "#8a96a6",
								marginTop: "3px",
							}}
						>
							Programmes currently associated with your members
						</div>
					</div>

					<button
						type="button"
						className="btn btn-link p-0"
						style={{
							fontSize: "12px",
							color: "#0878f9",
							textDecoration: "none",
						}}
						onClick={() => navigate("/trainer/programmes")}
					>
						View All
						<ArrowUpRight size={14} className="ms-1" />
					</button>
				</div>

				<div className="table-responsive">
					<table className="fitcore-table">
						<thead>
							<tr>
								<th>Programme</th>
								<th>Fitness Goal</th>
								<th>Duration</th>
								<th>Description</th>
							</tr>
						</thead>

						<tbody>
							{programmes.length === 0 ? (
								<tr>
									<td
										colSpan="4"
										className="text-center text-muted"
										style={{
											padding: "35px",
										}}
									>
										No training programmes are currently assigned.
									</td>
								</tr>
							) : (
								programmes.slice(0, 5).map((programme) => (
									<tr key={programme.trainingProgrammeId}>
										<td>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "10px",
												}}
											>
												<div className="fitcore-icon-box">
													<Target size={17} />
												</div>

												<strong>{programme.programmeName || "—"}</strong>
											</div>
										</td>

										<td>
											<span className="fitcore-badge fitcore-badge-blue">
												{programme.fitnessGoal || "—"}
											</span>
										</td>

										<td>{programme.duration ?? "—"}</td>

										<td
											style={{
												maxWidth: "330px",
												color: "#687588",
											}}
										>
											{programme.description || "—"}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

export default TrainerDashboard;
