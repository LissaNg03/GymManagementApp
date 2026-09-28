/** @format */

import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
	CalendarDays,
	CheckCircle2,
	ClipboardList,
	Dumbbell,
	Pencil,
	Plus,
	Trash2,
	UserRound,
	X,
} from "lucide-react";
import { Alert, Button, Col, Form, Modal, Row, Spinner } from "react-bootstrap";

import api from "../../services/api";

function TrainerWorkoutTasks() {
	const { globalSearch = "" } = useOutletContext() || {};

	const [tasks, setTasks] = useState([]);
	const [plans, setPlans] = useState([]);

	const [loading, setLoading] = useState(true);
	const [modalLoading, setModalLoading] = useState(false);

	const [error, setError] = useState("");
	const [modalError, setModalError] = useState("");

	const [showModal, setShowModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const [editingTask, setEditingTask] = useState(null);

	const [deletingTask, setDeletingTask] = useState(null);

	const [formData, setFormData] = useState({
		exerciseName: "",
		description: "",
		sets: "",
		repetitions: "",
		workoutDate: "",
		workoutPlanId: "",
	});

	useEffect(() => {
		loadTasks();
		loadPlans();
	}, []);

	/* =====================================================
		LOAD TASKS
	===================================================== */

	const loadTasks = async () => {
		try {
			setLoading(true);
			setError("");

			const response = await api.get("/WorkoutTasks");

			setTasks(Array.isArray(response.data) ? response.data : []);
		} catch (error) {
			console.error("Failed to load workout tasks:", error);

			setError(
				error.response?.data?.message || "Failed to load workout tasks.",
			);
		} finally {
			setLoading(false);
		}
	};

	/* =====================================================
		LOAD WORKOUT PLANS
	===================================================== */

	const loadPlans = async () => {
		try {
			const response = await api.get("/WorkoutPlans");

			setPlans(Array.isArray(response.data) ? response.data : []);
		} catch (error) {
			console.error("Failed to load workout plans:", error);

			setError(
				error.response?.data?.message || "Failed to load workout plans.",
			);
		}
	};

	/* =====================================================
		FORM
	===================================================== */

	const handleChange = (event) => {
		const { name, value } = event.target;

		setFormData((previous) => ({
			...previous,
			[name]: value,
		}));
	};

	const openAddModal = () => {
		setEditingTask(null);

		setFormData({
			exerciseName: "",
			description: "",
			sets: "",
			repetitions: "",
			workoutDate: "",
			workoutPlanId: "",
		});

		setModalError("");
		setShowModal(true);
	};

	const openEditModal = (task) => {
		setEditingTask(task);

		setFormData({
			exerciseName: task.exerciseName || "",
			description: task.description || "",
			sets: task.sets ?? "",
			repetitions: task.repetitions ?? "",
			workoutDate: task.workoutDate ? task.workoutDate.substring(0, 10) : "",
			workoutPlanId: String(task.workoutPlanId),
		});

		setModalError("");
		setShowModal(true);
	};

	const closeModal = () => {
		if (modalLoading) return;

		setShowModal(false);
		setEditingTask(null);
		setModalError("");
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		setModalError("");

		if (!formData.exerciseName.trim()) {
			setModalError("Exercise name is required.");
			return;
		}

		if (!formData.sets || Number(formData.sets) <= 0) {
			setModalError("Sets must be greater than 0.");
			return;
		}

		if (!formData.repetitions || Number(formData.repetitions) <= 0) {
			setModalError("Repetitions must be greater than 0.");
			return;
		}

		if (!formData.workoutDate) {
			setModalError("Workout date is required.");
			return;
		}

		if (!formData.workoutPlanId) {
			setModalError("Please select a workout plan.");
			return;
		}

		try {
			setModalLoading(true);

			if (editingTask) {
				await api.put(`/WorkoutTasks/${editingTask.workoutTaskId}`, {
					exerciseName: formData.exerciseName,
					description: formData.description,
					sets: Number(formData.sets),
					repetitions: Number(formData.repetitions),
					workoutDate: formData.workoutDate,
				});
			} else {
				await api.post("/WorkoutTasks", {
					exerciseName: formData.exerciseName,
					description: formData.description,
					sets: Number(formData.sets),
					repetitions: Number(formData.repetitions),
					workoutDate: formData.workoutDate,
					workoutPlanId: Number(formData.workoutPlanId),
				});
			}

			setShowModal(false);
			setEditingTask(null);
			setModalError("");

			await loadTasks();
		} catch (error) {
			console.error("Failed to save workout task:", error);

			setModalError(
				error.response?.data?.message || "Failed to save workout task.",
			);
		} finally {
			setModalLoading(false);
		}
	};

	/* =====================================================
		DELETE
	===================================================== */

	const openDeleteModal = (task) => {
		setDeletingTask(task);
		setModalError("");
		setShowDeleteModal(true);
	};

	const closeDeleteModal = () => {
		if (modalLoading) return;

		setShowDeleteModal(false);
		setDeletingTask(null);
		setModalError("");
	};

	const handleDelete = async () => {
		if (!deletingTask) return;

		try {
			setModalLoading(true);
			setModalError("");

			await api.delete(`/WorkoutTasks/${deletingTask.workoutTaskId}`);

			setShowDeleteModal(false);
			setDeletingTask(null);

			await loadTasks();
		} catch (error) {
			console.error("Failed to delete workout task:", error);

			setModalError(
				error.response?.data?.message || "Failed to delete workout task.",
			);
		} finally {
			setModalLoading(false);
		}
	};

	/* =====================================================
		HELPERS
	===================================================== */

	const formatDate = (date) => {
		if (!date) return "—";

		return new Date(date).toLocaleDateString("en-ZA", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
	};

	const getStatusClass = (status) => {
		const value = status?.toLowerCase() || "";

		if (value === "completed" || value === "complete") {
			return "fitcore-badge-success";
		}

		if (value === "in progress" || value === "in-progress") {
			return "fitcore-badge-warning";
		}

		if (value === "not started" || value === "pending") {
			return "fitcore-badge-gray";
		}

		return "fitcore-badge-blue";
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
			${task.memberName || ""}
			${task.memberSurname || ""}
			${task.memberNumber || ""}
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
					<p className="admin-hero-greeting">Personal Trainer</p>

					<h1>
						Workout <span>Tasks</span>
					</h1>

					<p className="admin-hero-subtitle">
						Create and manage exercises for your members' workout plans.
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
					<h2 className="fitcore-page-title">Workout Tasks</h2>

					<div className="fitcore-page-subtitle">
						{loading
							? "Loading workout tasks..."
							: `${filteredTasks.length} ${
									filteredTasks.length === 1 ? "workout task" : "workout tasks"
								}`}
					</div>
				</div>

				<button
					type="button"
					className="fitcore-btn-primary"
					onClick={openAddModal}
				>
					<Plus size={17} />
					Add Workout Task
				</button>
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
								Loading workout tasks...
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
							}}
						>
							{globalSearch
								? "No workout tasks match your search."
								: "No workout tasks have been created yet."}
						</p>
					</div>
				) : (
					<div className="table-responsive">
						<table className="fitcore-table">
							<thead>
								<tr>
									<th>Exercise</th>
									<th>Member</th>
									<th>Workout Plan</th>
									<th>Sets</th>
									<th>Reps</th>
									<th>Date</th>
									<th>Status</th>
									<th>Actions</th>
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
													minWidth: "170px",
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
																maxWidth: "190px",
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

										{/* MEMBER */}

										<td>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "8px",
													minWidth: "160px",
												}}
											>
												<UserRound
													size={15}
													style={{
														color: "#0878f9",
													}}
												/>

												<div>
													<div
														style={{
															fontWeight: 600,
															color: "#172033",
														}}
													>
														{task.memberName} {task.memberSurname}
													</div>

													{task.memberNumber && (
														<div
															style={{
																fontSize: "10px",
																color: "#8a96a6",
															}}
														>
															{task.memberNumber}
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
													gap: "6px",
													minWidth: "140px",
												}}
											>
												<ClipboardList
													size={14}
													style={{
														color: "#0878f9",
													}}
												/>

												<span>{task.planName || "—"}</span>
											</div>
										</td>

										{/* SETS */}

										<td>
											<strong>{task.sets}</strong>
										</td>

										{/* REPS */}

										<td>
											<strong>{task.repetitions}</strong>
										</td>

										{/* DATE */}

										<td>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "6px",
													whiteSpace: "nowrap",
												}}
											>
												<CalendarDays
													size={14}
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

										{/* ACTIONS */}

										<td>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "7px",
												}}
											>
												<button
													type="button"
													className="fitcore-action-btn"
													title="Edit workout task"
													onClick={() => openEditModal(task)}
												>
													<Pencil size={15} />
												</button>

												<button
													type="button"
													className="btn btn-sm"
													style={{
														color: "#ffffff",
														background: "#ef4444",
														border: "1px solid #ef4444",
														borderRadius: "6px",
													}}
													title="Delete"
													onClick={() => openDeleteModal(task)}
												>
													<Trash2 size={15} />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{/* =====================================================
				ADD / EDIT TASK MODAL
			===================================================== */}

			<Modal
				show={showModal}
				onHide={closeModal}
				size="lg"
				centered
				backdrop={modalLoading ? "static" : true}
			>
				<Modal.Header>
					<div>
						<Modal.Title
							style={{
								fontSize: "18px",
								fontWeight: 700,
								color: "#172033",
							}}
						>
							{editingTask ? "Edit Workout Task" : "Add Workout Task"}
						</Modal.Title>

						<p
							style={{
								margin: "4px 0 0",
								fontSize: "12px",
								color: "#7b8798",
							}}
						>
							{editingTask
								? "Update this exercise and its workout details."
								: "Add an exercise to one of your workout plans."}
						</p>
					</div>

					<button
						type="button"
						onClick={closeModal}
						disabled={modalLoading}
						style={{
							border: "none",
							background: "transparent",
							color: "#7b8798",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<X size={20} />
					</button>
				</Modal.Header>

				<Form onSubmit={handleSubmit}>
					<Modal.Body>
						{modalError && <Alert variant="danger">{modalError}</Alert>}

						<Row className="g-3">
							{/* EXERCISE */}

							<Col md={6}>
								<Form.Group>
									<Form.Label>Exercise Name</Form.Label>

									<Form.Control
										type="text"
										name="exerciseName"
										value={formData.exerciseName}
										onChange={handleChange}
										placeholder="e.g. Barbell Squat"
										disabled={modalLoading}
									/>
								</Form.Group>
							</Col>

							{/* PLAN */}

							<Col md={6}>
								<Form.Group>
									<Form.Label>Workout Plan</Form.Label>

									<Form.Select
										name="workoutPlanId"
										value={formData.workoutPlanId}
										onChange={handleChange}
										disabled={!!editingTask || modalLoading}
									>
										<option value="">Select workout plan</option>

										{plans.map((plan) => (
											<option
												key={plan.workoutPlanId}
												value={plan.workoutPlanId}
											>
												{plan.planName} —{" "}
												{plan.memberNumber ? `${plan.memberNumber} — ` : ""}
												{plan.memberName} {plan.memberSurname}
											</option>
										))}
									</Form.Select>
								</Form.Group>
							</Col>

							{/* SETS */}

							<Col md={6}>
								<Form.Group>
									<Form.Label>Sets</Form.Label>

									<Form.Control
										type="number"
										min="1"
										name="sets"
										value={formData.sets}
										onChange={handleChange}
										placeholder="e.g. 4"
										disabled={modalLoading}
									/>
								</Form.Group>
							</Col>

							{/* REPS */}

							<Col md={6}>
								<Form.Group>
									<Form.Label>Repetitions</Form.Label>

									<Form.Control
										type="number"
										min="1"
										name="repetitions"
										value={formData.repetitions}
										onChange={handleChange}
										placeholder="e.g. 12"
										disabled={modalLoading}
									/>
								</Form.Group>
							</Col>

							{/* DATE */}

							<Col md={6}>
								<Form.Group>
									<Form.Label>Workout Date</Form.Label>

									<Form.Control
										type="date"
										name="workoutDate"
										value={formData.workoutDate}
										onChange={handleChange}
										disabled={modalLoading}
									/>
								</Form.Group>
							</Col>

							{/* DESCRIPTION */}

							<Col md={6}>
								<Form.Group>
									<Form.Label>Description</Form.Label>

									<Form.Control
										as="textarea"
										rows={2}
										name="description"
										value={formData.description}
										onChange={handleChange}
										placeholder="Optional description"
										disabled={modalLoading}
									/>
								</Form.Group>
							</Col>
						</Row>

						{editingTask && (
							<div
								style={{
									marginTop: "16px",
									padding: "11px 13px",
									borderRadius: "8px",
									background: "#f5f8fc",
									border: "1px solid #e7edf4",
									display: "flex",
									alignItems: "center",
									gap: "8px",
									color: "#687588",
									fontSize: "12px",
								}}
							>
								<CheckCircle2
									size={15}
									style={{
										color: "#0878f9",
										flexShrink: 0,
									}}
								/>
								The workout plan cannot be changed while editing this task.
							</div>
						)}
					</Modal.Body>

					<Modal.Footer>
						<Button
							variant="light"
							onClick={closeModal}
							disabled={modalLoading}
						>
							Cancel
						</Button>

						<Button variant="primary" type="submit" disabled={modalLoading}>
							{modalLoading ? (
								<>
									<Spinner size="sm" className="me-2" />
									Saving...
								</>
							) : editingTask ? (
								"Update Task"
							) : (
								"Create Task"
							)}
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>

			{/* =====================================================
				DELETE MODAL
			===================================================== */}

			<Modal
				show={showDeleteModal}
				onHide={closeDeleteModal}
				centered
				backdrop={modalLoading ? "static" : true}
			>
				<Modal.Header>
					<Modal.Title
						style={{
							fontSize: "18px",
							fontWeight: 700,
							color: "#172033",
						}}
					>
						Delete Workout Task
					</Modal.Title>

					<button
						type="button"
						onClick={closeDeleteModal}
						disabled={modalLoading}
						style={{
							border: "none",
							background: "transparent",
							color: "#7b8798",
							display: "flex",
						}}
					>
						<X size={20} />
					</button>
				</Modal.Header>

				<Modal.Body>
					{modalError && <Alert variant="danger">{modalError}</Alert>}

					<p
						style={{
							color: "#4f5d70",
							fontSize: "14px",
							marginBottom: 0,
						}}
					>
						Are you sure you want to delete{" "}
						<strong>{deletingTask?.exerciseName}</strong>?
					</p>
				</Modal.Body>

				<Modal.Footer>
					<Button
						variant="light"
						onClick={closeDeleteModal}
						disabled={modalLoading}
					>
						Cancel
					</Button>

					<Button
						variant="danger"
						onClick={handleDelete}
						disabled={modalLoading}
					>
						{modalLoading ? (
							<>
								<Spinner size="sm" className="me-2" />
								Deleting...
							</>
						) : (
							<>
								<Trash2 size={15} className="me-2" />
								Delete Task
							</>
						)}
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
}

export default TrainerWorkoutTasks;
