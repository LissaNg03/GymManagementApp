/** @format */

import { useEffect, useState } from "react";
import {
	ArrowUpRight,
	CalendarDays,
	Link,
	Plus,
	UserRoundCog,
	Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function AdminDashboard() {
	const navigate = useNavigate();

	const [members, setMembers] = useState([]);
	const [trainers, setTrainers] = useState([]);
	const [programmes, setProgrammes] = useState([]);
	const [workoutPlans, setWorkoutPlans] = useState([]);

	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadDashboard = async () => {
			try {
				const [
					membersResponse,
					trainersResponse,
					programmesResponse,
					plansResponse,
				] = await Promise.all([
					api.get("/GymMembers"),
					api.get("/PersonalTrainers"),
					api.get("/TrainingProgrammes"),
					api.get("/WorkoutPlans"),
				]);

				setMembers(membersResponse.data);
				setTrainers(trainersResponse.data);
				setProgrammes(programmesResponse.data);
				setWorkoutPlans(plansResponse.data);
			} catch (error) {
				console.error("Failed to load dashboard:", error);
			} finally {
				setLoading(false);
			}
		};

		loadDashboard();
	}, []);

	const recentMembers = [...members].slice(-5).reverse();

	return (
		<div className="fitcore-content">
			{/* PAGE HEADER */}
			<div className="mb-4">
				<div
					style={{
						color: "#0878f9",
						fontSize: "13px",
						marginBottom: "5px",
					}}
				>
					Good Morning, Admin
				</div>

				<h1 className="fitcore-page-title">
					Welcome to <span style={{ color: "#0878f9" }}>FitCore</span>
				</h1>

				<p className="fitcore-page-subtitle">
					Manage your gym members, trainers, programmes and more — all in one
					place.
				</p>
			</div>

			{/* STATS */}
			<div className="row g-3 mb-4">
				<div className="col-12 col-md-6 col-xl-3">
					<div className="fitcore-stat-card">
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
							<div className="fitcore-stat-label">Total Members</div>

							<div className="fitcore-stat-value">
								{loading ? "—" : members.length}
							</div>

							<div
								style={{
									color: "#16b364",
									fontSize: "11px",
									marginTop: "3px",
								}}
							>
								↑ Active members
							</div>
						</div>
					</div>
				</div>

				<div className="col-12 col-md-6 col-xl-3">
					<div className="fitcore-stat-card">
						<div
							className="fitcore-stat-icon"
							style={{
								background: "#e8f9ef",
								color: "#16b364",
							}}
						>
							<UserRoundCog size={24} />
						</div>

						<div>
							<div className="fitcore-stat-label">Total Trainers</div>

							<div className="fitcore-stat-value">
								{loading ? "—" : trainers.length}
							</div>

							<div
								style={{
									color: "#16b364",
									fontSize: "11px",
									marginTop: "3px",
								}}
							>
								↑ Active trainers
							</div>
						</div>
					</div>
				</div>

				<div className="col-12 col-md-6 col-xl-3">
					<div className="fitcore-stat-card">
						<div
							className="fitcore-stat-icon"
							style={{
								background: "#fff4df",
								color: "#f59e0b",
							}}
						>
							<CalendarDays size={24} />
						</div>

						<div>
							<div className="fitcore-stat-label">Programmes</div>

							<div className="fitcore-stat-value">
								{loading ? "—" : programmes.length}
							</div>

							<div
								style={{
									color: "#16b364",
									fontSize: "11px",
									marginTop: "3px",
								}}
							>
								↑ Available programmes
							</div>
						</div>
					</div>
				</div>

				<div className="col-12 col-md-6 col-xl-3">
					<div className="fitcore-stat-card">
						<div
							className="fitcore-stat-icon"
							style={{
								background: "#f1e9ff",
								color: "#7c3aed",
							}}
						>
							<Link size={24} />
						</div>

						<div>
							<div className="fitcore-stat-label">Active Assignments</div>

							<div className="fitcore-stat-value">
								{loading ? "—" : workoutPlans.length}
							</div>

							<div
								style={{
									color: "#16b364",
									fontSize: "11px",
									marginTop: "3px",
								}}
							>
								↑ Workout plans
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* MAIN DASHBOARD ROW */}
			<div className="row g-4 mb-4">
				{/* MEMBERSHIP OVERVIEW */}
				<div className="col-12 col-xl-8">
					<div className="fitcore-card h-100">
						<div className="fitcore-card-header d-flex justify-content-between align-items-center">
							<div>
								<strong>Membership Overview</strong>

								<div
									style={{
										fontSize: "11px",
										color: "#8a96a6",
										marginTop: "3px",
									}}
								>
									Current member activity
								</div>
							</div>

							<select
								className="form-select form-select-sm"
								style={{
									width: "130px",
									fontSize: "11px",
								}}
							>
								<option>Last 6 Months</option>
								<option>Last 12 Months</option>
							</select>
						</div>

						<div className="fitcore-card-body">
							{/* SIMPLE CHART */}
							<div
								style={{
									height: "245px",
									position: "relative",
									padding: "15px 10px 25px 35px",
								}}
							>
								<div
									style={{
										position: "absolute",
										left: "0",
										right: "0",
										top: "20px",
										borderTop: "1px dashed #e8edf3",
									}}
								/>

								<div
									style={{
										position: "absolute",
										left: "0",
										right: "0",
										top: "75px",
										borderTop: "1px dashed #e8edf3",
									}}
								/>

								<div
									style={{
										position: "absolute",
										left: "0",
										right: "0",
										top: "130px",
										borderTop: "1px dashed #e8edf3",
									}}
								/>

								<div
									style={{
										position: "absolute",
										left: "0",
										right: "0",
										top: "185px",
										borderTop: "1px dashed #e8edf3",
									}}
								/>

								<svg
									viewBox="0 0 700 220"
									width="100%"
									height="100%"
									preserveAspectRatio="none"
								>
									<polyline
										points="
                                            20,175
                                            150,135
                                            280,145
                                            410,100
                                            540,75
                                            680,45
                                        "
										fill="none"
										stroke="#0878f9"
										strokeWidth="3"
									/>

									<polygon
										points="
                                            20,175
                                            150,135
                                            280,145
                                            410,100
                                            540,75
                                            680,45
                                            680,220
                                            20,220
                                        "
										fill="rgba(8,120,249,0.08)"
									/>

									{[
										[20, 175],
										[150, 135],
										[280, 145],
										[410, 100],
										[540, 75],
										[680, 45],
									].map(([x, y], index) => (
										<circle
											key={index}
											cx={x}
											cy={y}
											r="5"
											fill="white"
											stroke="#0878f9"
											strokeWidth="3"
										/>
									))}
								</svg>

								<div
									className="d-flex justify-content-between"
									style={{
										position: "absolute",
										bottom: "0",
										left: "25px",
										right: "0",
										color: "#8995a5",
										fontSize: "11px",
									}}
								>
									<span>Apr</span>
									<span>May</span>
									<span>Jun</span>
									<span>Jul</span>
									<span>Aug</span>
									<span>Sep</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* QUICK ACTIONS */}
				<div className="col-12 col-xl-4">
					<div className="fitcore-card h-100">
						<div className="fitcore-card-header">
							<strong>Quick Actions</strong>
						</div>

						<div className="fitcore-card-body">
							<button
								className="fitcore-btn-primary w-100 mb-2 d-flex align-items-center gap-2"
								onClick={() => navigate("/admin/members")}
							>
								<Plus size={17} />
								Add Member
							</button>

							<button
								className="fitcore-btn-primary w-100 mb-2 d-flex align-items-center gap-2"
								onClick={() => navigate("/admin/trainers")}
							>
								<Plus size={17} />
								Add Trainer
							</button>

							<button
								className="fitcore-btn-primary w-100 mb-2 d-flex align-items-center gap-2"
								onClick={() => navigate("/admin/programmes")}
							>
								<Plus size={17} />
								Create Programme
							</button>

							<button
								className="fitcore-btn-primary w-100 mb-2 d-flex align-items-center gap-2"
								onClick={() => navigate("/admin/workout-plans")}
							>
								<Link size={17} />
								Assign Programme
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* RECENT MEMBERS */}
			<div className="fitcore-card">
				<div className="fitcore-card-header d-flex justify-content-between align-items-center">
					<div>
						<strong>Recent Members</strong>
					</div>

					<button
						className="btn btn-link p-0"
						style={{
							fontSize: "12px",
							color: "#0878f9",
						}}
						onClick={() => navigate("/admin/members")}
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
								<th>Name</th>
								<th>Surname</th>
								<th>Membership Type</th>
								<th>Email</th>
							</tr>
						</thead>

						<tbody>
							{recentMembers.length === 0 ? (
								<tr>
									<td colSpan="5" className="text-center text-muted">
										No members found.
									</td>
								</tr>
							) : (
								recentMembers.map((member) => (
									<tr key={member.gymMemberId}>
										<td>
											<strong>{member.memberNumber}</strong>
										</td>

										<td>{member.name}</td>

										<td>{member.surname}</td>

										<td>
											<span className="fitcore-badge fitcore-badge-blue">
												{member.membershipType}
											</span>
										</td>

										<td>{member.email}</td>
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

export default AdminDashboard;
