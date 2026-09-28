/** @format */

import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
	CalendarDays,
	CheckCircle2,
	ClipboardList,
	Dumbbell,
	Filter,
	RotateCcw,
} from "lucide-react";

import api from "../../services/api";

function MemberWorkoutTasks() {
	const { globalSearch = "" } = useOutletContext() || {};

	const [tasks, setTasks] = useState([]);
	const [statusFilter, setStatusFilter] = useState("");
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(null);
	const [error, setError] = useState("");

	/* =====================================================
		LOAD TASKS
	===================================================== */

	const loadTasks = async () => {
		try {
			setLoading(true);
			setError("");

			let response;

			if (statusFilter) {
				response = await api.get(
					`/WorkoutTasks/my/filter?status=${encodeURIComponent(statusFilter)}`,
				);
			} else {
				response = await api.get("/WorkoutTasks/my");
			}

			setTasks(Array.isArray(response.data) ? response.data : []);
		} catch (error) {
			console.error("Failed to load workout tasks:", error);

			setError(
				error.response?.data?.message || "Failed to load your workout tasks.",
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadTasks();
	}, [statusFilter]);

	/* =====================================================
		UPDATE STATUS
	===================================================== */

	const updateStatus = async (taskId, status) => {
		try {
			setUpdating(taskId);
			setError("");

			await api.put(`/WorkoutTasks/${taskId}/status`, {
				status,
			});

			await loadTasks();
		} catch (error) {
			console.error("Failed to update task status:", error);

			setError(
				error.response?.data?.message || "Failed to update task status.",
			);
		} finally {
			setUpdating(null);
		}
	};

	/* =====================================================
		HELPERS
	===================================================== */

	const getStatusClass = (status) => {
		switch (status) {
			case "Complete":
				return "fitcore-badge-success";

			case "In Progress":
				return "fitcore-badge-warning";

			case "Not Started":
				return "fitcore-badge-gray";

			default:
				return "fitcore-badge-blue";
		}
	};

	const formatDate = (date) => {
		if (!date) return "—";

		return new Date(date).toLocaleDateString("en-ZA", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
	};

	/* =====================================================
		GLOBAL SEARCH
	===================================================== */

	const filteredTasks = tasks.filter((task) => {
		const search = globalSearch.trim().toLowerCase();

		if (!search) {
			return true;
		}

		const searchableText = `
			${task.exerciseName || ""}
			${task.description || ""}
			${task.planName || ""}
			${task.status || ""}
			${task.sets || ""}
			${task.repetitions || ""}
		`.toLowerCase();

		return searchableText.includes(search);
	});

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
					<Dumbbell size={165} />
				</div>

				<div className="admin-hero-overlay" />

				<div className="admin-hero-content">
					<p className="admin-hero-greeting">Gym Member</p>

					<h1>
						My Workout <span>Tasks</span>
					</h1>

					<p className="admin-hero-subtitle">
						View your exercises, track your progress and update each workout
						task as you train.
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
				PAGE HEADER
			===================================================== */}

			<div className="fitcore-page-header">
				<div>
					<h2 className="fitcore-page-title">My Workout Tasks</h2>

					<div className="fitcore-page-subtitle">
						{loading
							? "Loading workout tasks..."
							: `${filteredTasks.length} ${
									filteredTasks.length === 1 ? "task" : "tasks"
								} found`}
					</div>
				</div>
			</div>

			{/* =====================================================
				FILTER
			===================================================== */}

			<div
				className="fitcore-card"
				style={{
					marginBottom: "20px",
				}}
			>
				<div
					className="fitcore-card-body"
					style={{
						display: "flex",
						alignItems: "flex-end",
						gap: "12px",
						flexWrap: "wrap",
					}}
				>
					<div
						style={{
							flex: "1 1 260px",
							maxWidth: "350px",
						}}
					>
						<label
							htmlFor="statusFilter"
							style={{
								display: "flex",
								alignItems: "center",
								gap: "6px",
								fontSize: "12px",
								fontWeight: 600,
								color: "#4f5d70",
								marginBottom: "7px",
							}}
						>
							<Filter
								size={14}
								style={{
									color: "#0878f9",
								}}
							/>
							Filter by Status
						</label>

						<select
							id="statusFilter"
							className="form-select"
							value={statusFilter}
							onChange={(event) => setStatusFilter(event.target.value)}
						>
							<option value="">All Tasks</option>

							<option value="Not Started">Not Started</option>

							<option value="In Progress">In Progress</option>

							<option value="Complete">Complete</option>
						</select>
					</div>

					<button
						type="button"
						className="btn btn-light"
						onClick={() => setStatusFilter("")}
						disabled={!statusFilter}
						style={{
							height: "38px",
							display: "flex",
							alignItems: "center",
							gap: "7px",
							border: "1px solid #e1e7ef",
							fontSize: "12px",
						}}
					>
						<RotateCcw size={14} />
						Clear Filter
					</button>
				</div>
			</div>

			{/* =====================================================
				TASK TABLE
			===================================================== */}

			<div className="fitcore-card">
				{loading ? (
					<div
						style={{
							minHeight: "300px",
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
									color: "#7b8798",
									fontSize: "13px",
								}}
							>
								Loading your workout tasks...
							</p>
						</div>
					</div>
				) : filteredTasks.length === 0 ? (
					<div
						style={{
							minHeight: "280px",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							textAlign: "center",
							padding: "30px",
						}}
					>
						<div
							className="fitcore-icon-box"
							style={{
								width: "58px",
								height: "58px",
								borderRadius: "13px",
								marginBottom: "14px",
							}}
						>
							<Dumbbell size={27} />
						</div>

						<strong
							style={{
								fontSize: "14px",
								color: "#172033",
							}}
						>
							No workout tasks found
						</strong>

						<p
							style={{
								fontSize: "12px",
								color: "#7b8798",
								marginTop: "6px",
								marginBottom: 0,
								maxWidth: "380px",
							}}
						>
							{globalSearch
								? "No workout tasks match your search."
								: statusFilter
									? `You don't have any ${statusFilter.toLowerCase()} workout tasks.`
									: "You currently have no workout tasks assigned to you."}
						</p>
					</div>
				) : (
					<div className="table-responsive">
						<table className="fitcore-table">
							<thead>
								<tr>
									<th>Exercise</th>
									<th>Workout Plan</th>
									<th>Sets</th>
									<th>Reps</th>
									<th>Workout Date</th>
									<th>Status</th>
									<th>Update Status</th>
								</tr>
							</thead>

							<tbody>
								{filteredTasks.map((task) => (
									<tr key={task.workoutTaskId}>
										{/* EXERCISE */}

										<td>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "10px",
													minWidth: "190px",
												}}
											>
												<div
													className="fitcore-icon-box"
													style={{
														width: "36px",
														height: "36px",
													}}
												>
													<Dumbbell size={17} />
												</div>

												<div>
													<strong
														style={{
															color: "#172033",
														}}
													>
														{task.exerciseName}
													</strong>

													{task.description && (
														<div
															style={{
																fontSize: "11px",
																color: "#8a96a6",
																marginTop: "2px",
																maxWidth: "210px",
																overflow: "hidden",
																textOverflow: "ellipsis",
																whiteSpace: "nowrap",
															}}
														>
															{task.description}
														</div>
													)}
												</div>
											</div>
										</td>

										{/* PLAN */}

										<td>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "7px",
													minWidth: "140px",
												}}
											>
												<ClipboardList
													size={15}
													style={{
														color: "#0878f9",
													}}
												/>

												<span
													style={{
														color: "#4f5d70",
													}}
												>
													{task.planName || "—"}
												</span>
											</div>
										</td>

										{/* SETS */}

										<td>
											<strong
												style={{
													color: "#172033",
												}}
											>
												{task.sets}
											</strong>
										</td>

										{/* REPS */}

										<td>
											<strong
												style={{
													color: "#172033",
												}}
											>
												{task.repetitions}
											</strong>
										</td>

										{/* DATE */}

										<td>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "7px",
													whiteSpace: "nowrap",
													color: "#4f5d70",
												}}
											>
												<CalendarDays
													size={15}
													style={{
														color: "#8a96a6",
													}}
												/>

												{formatDate(task.workoutDate)}
											</div>
										</td>

										{/* STATUS */}

										<td>
											<span
												className={`fitcore-badge ${getStatusClass(
													task.status,
												)}`}
											>
												{task.status || "Not Started"}
											</span>
										</td>

										{/* UPDATE */}

										<td>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "8px",
													minWidth: "155px",
												}}
											>
												<select
													className="form-select form-select-sm"
													value={task.status}
													disabled={updating === task.workoutTaskId}
													onChange={(event) =>
														updateStatus(task.workoutTaskId, event.target.value)
													}
													style={{
														fontSize: "12px",
														minWidth: "135px",
													}}
												>
													<option value="Not Started">Not Started</option>

													<option value="In Progress">In Progress</option>

													<option value="Complete">Complete</option>
												</select>

												{updating === task.workoutTaskId && (
													<div
														className="spinner-border spinner-border-sm text-primary"
														role="status"
													>
														<span className="visually-hidden">Updating...</span>
													</div>
												)}

												{updating !== task.workoutTaskId &&
													task.status === "Complete" && (
														<CheckCircle2
															size={17}
															style={{
																color: "#16b364",
																flexShrink: 0,
															}}
														/>
													)}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}

export default MemberWorkoutTasks;
