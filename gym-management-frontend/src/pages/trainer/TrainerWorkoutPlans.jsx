/** @format */

import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
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

function TrainerWorkoutPlans() {
	const { globalSearch = "" } = useOutletContext() || {};

	const [plans, setPlans] = useState([]);
	const [members, setMembers] = useState([]);
	const [programmes, setProgrammes] = useState([]);

	const [loading, setLoading] = useState(true);
	const [modalLoading, setModalLoading] = useState(false);

	const [error, setError] = useState("");
	const [modalError, setModalError] = useState("");

	const [showModal, setShowModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const [editingPlan, setEditingPlan] = useState(null);

	const [deletingPlan, setDeletingPlan] = useState(null);

	const [formData, setFormData] = useState({
		planName: "",
		description: "",
		gymMemberId: "",
		trainingProgrammeId: "",
	});

	useEffect(() => {
		loadPlans();
		loadFormData();
	}, []);

	/* =====================================================
		LOAD WORKOUT PLANS
	===================================================== */

	const loadPlans = async () => {
		try {
			setLoading(true);
			setError("");

			const response = await api.get("/WorkoutPlans");

			setPlans(Array.isArray(response.data) ? response.data : []);
		} catch (error) {
			console.error("Failed to load workout plans:", error);

			setError(
				error.response?.data?.message || "Failed to load workout plans.",
			);
		} finally {
			setLoading(false);
		}
	};

	/* =====================================================
		LOAD TRAINER MEMBERS + PROGRAMMES
	===================================================== */

	const loadFormData = async () => {
		try {
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
			console.error("Failed to load workout plan form data:", error);

			setError(
				error.response?.data?.message || "Failed to load workout plan data.",
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
		setEditingPlan(null);

		setFormData({
			planName: "",
			description: "",
			gymMemberId: "",
			trainingProgrammeId: "",
		});

		setModalError("");
		setShowModal(true);
	};

	const openEditModal = (plan) => {
		setEditingPlan(plan);

		setFormData({
			planName: plan.planName || "",
			description: plan.description || "",
			gymMemberId: String(plan.gymMemberId),
			trainingProgrammeId: String(plan.trainingProgrammeId),
		});

		setModalError("");
		setShowModal(true);
	};

	const closeModal = () => {
		if (modalLoading) return;

		setShowModal(false);
		setEditingPlan(null);
		setModalError("");
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		setModalError("");

		if (!formData.planName.trim()) {
			setModalError("Plan name is required.");
			return;
		}

		if (!formData.gymMemberId) {
			setModalError("Please select a gym member.");
			return;
		}

		if (!formData.trainingProgrammeId) {
			setModalError("Please select a training programme.");
			return;
		}

		try {
			setModalLoading(true);

			const requestData = {
				planName: formData.planName,
				description: formData.description,
				gymMemberId: Number(formData.gymMemberId),
				trainingProgrammeId: Number(formData.trainingProgrammeId),
			};

			if (editingPlan) {
				await api.put(
					`/WorkoutPlans/${editingPlan.workoutPlanId}`,
					requestData,
				);
			} else {
				await api.post("/WorkoutPlans", requestData);
			}

			setShowModal(false);
			setEditingPlan(null);
			setModalError("");

			await loadPlans();
		} catch (error) {
			console.error("Failed to save workout plan:", error);

			setModalError(
				error.response?.data?.message || "Failed to save workout plan.",
			);
		} finally {
			setModalLoading(false);
		}
	};

	/* =====================================================
		DELETE
	===================================================== */

	const openDeleteModal = (plan) => {
		setDeletingPlan(plan);
		setModalError("");
		setShowDeleteModal(true);
	};

	const closeDeleteModal = () => {
		if (modalLoading) return;

		setShowDeleteModal(false);
		setDeletingPlan(null);
		setModalError("");
	};

	const handleDelete = async () => {
		if (!deletingPlan) return;

		try {
			setModalLoading(true);
			setModalError("");

			await api.delete(`/WorkoutPlans/${deletingPlan.workoutPlanId}`);

			setShowDeleteModal(false);
			setDeletingPlan(null);

			await loadPlans();
		} catch (error) {
			console.error("Failed to delete workout plan:", error);

			setModalError(
				error.response?.data?.message || "Failed to delete workout plan.",
			);
		} finally {
			setModalLoading(false);
		}
	};

	/* =====================================================
		GLOBAL SEARCH
	===================================================== */

	const filteredPlans = plans.filter((plan) => {
		const search = globalSearch.trim().toLowerCase();

		if (!search) {
			return true;
		}

		const searchableText = `
			${plan.planName || ""}
			${plan.memberName || ""}
			${plan.memberSurname || ""}
			${plan.memberNumber || ""}
			${plan.trainingProgramme || ""}
			${plan.description || ""}
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
					<ClipboardList size={165} />
				</div>

				<div className="admin-hero-overlay" />

				<div className="admin-hero-content">
					<p className="admin-hero-greeting">Personal Trainer</p>

					<h1>
						Workout <span>Plans</span>
					</h1>

					<p className="admin-hero-subtitle">
						Create and manage workout plans for your assigned gym members.
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
					<h2 className="fitcore-page-title">Workout Plans</h2>

					<div className="fitcore-page-subtitle">
						{loading
							? "Loading workout plans..."
							: `${filteredPlans.length} ${
									filteredPlans.length === 1 ? "workout plan" : "workout plans"
								}`}
					</div>
				</div>

				<button
					type="button"
					className="fitcore-btn-primary"
					onClick={openAddModal}
				>
					<Plus size={17} />
					Add Workout Plan
				</button>
			</div>

			{/* =====================================================
				WORKOUT PLAN TABLE
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
								Loading workout plans...
							</p>
						</div>
					</div>
				) : filteredPlans.length === 0 ? (
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
							<ClipboardList size={27} />
						</div>

						<strong
							style={{
								fontSize: "14px",
								color: "#172033",
							}}
						>
							No workout plans found
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
								? "No workout plans match your search."
								: "You have not created any workout plans yet."}
						</p>
					</div>
				) : (
					<div className="table-responsive">
						<table className="fitcore-table">
							<thead>
								<tr>
									<th>Plan Name</th>
									<th>Member</th>
									<th>Programme</th>
									<th>Description</th>
									<th>Actions</th>
								</tr>
							</thead>

							<tbody>
								{filteredPlans.map((plan) => (
									<tr key={plan.workoutPlanId}>
										{/* PLAN */}
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

												<strong
													style={{
														color: "#172033",
													}}
												>
													{plan.planName}
												</strong>
											</div>
										</td>

										{/* MEMBER */}
										<td>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "9px",
													minWidth: "170px",
												}}
											>
												<div
													className="fitcore-icon-box"
													style={{
														width: "32px",
														height: "32px",
														borderRadius: "50%",
													}}
												>
													<UserRound size={15} />
												</div>

												<div>
													<div
														style={{
															fontWeight: 600,
															color: "#172033",
														}}
													>
														{plan.memberName} {plan.memberSurname}
													</div>

													<div
														style={{
															fontSize: "11px",
															color: "#8a96a6",
															marginTop: "2px",
														}}
													>
														{plan.memberNumber || "—"}
													</div>
												</div>
											</div>
										</td>

										{/* PROGRAMME */}
										<td>
											<span className="fitcore-badge fitcore-badge-blue">
												{plan.trainingProgramme || "—"}
											</span>
										</td>

										{/* DESCRIPTION */}
										<td
											style={{
												maxWidth: "300px",
												color: "#687588",
											}}
										>
											{plan.description || "—"}
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
													title="Edit workout plan"
													onClick={() => openEditModal(plan)}
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
													onClick={() => openDeleteModal(plan)}
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
				ADD / EDIT MODAL
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
							{editingPlan ? "Edit Workout Plan" : "Add Workout Plan"}
						</Modal.Title>

						<p
							style={{
								margin: "4px 0 0",
								fontSize: "12px",
								color: "#7b8798",
							}}
						>
							{editingPlan
								? "Update the workout plan information."
								: "Create a workout plan for one of your assigned members."}
						</p>
					</div>
				</Modal.Header>

				<Form onSubmit={handleSubmit}>
					<Modal.Body>
						{modalError && <Alert variant="danger">{modalError}</Alert>}

						<Row className="g-3">
							{/* PLAN NAME */}

							<Col md={6}>
								<Form.Group>
									<Form.Label>Plan Name</Form.Label>

									<Form.Control
										type="text"
										name="planName"
										value={formData.planName}
										onChange={handleChange}
										placeholder="Enter plan name"
										disabled={modalLoading}
									/>
								</Form.Group>
							</Col>

							{/* MEMBER */}

							<Col md={6}>
								<Form.Group>
									<Form.Label>Gym Member</Form.Label>

									<Form.Select
										name="gymMemberId"
										value={formData.gymMemberId}
										onChange={handleChange}
										disabled={modalLoading}
									>
										<option value="">Select member</option>

										{members.map((member) => (
											<option
												key={member.gymMemberId}
												value={member.gymMemberId}
											>
												{member.memberNumber} — {member.name} {member.surname}
											</option>
										))}
									</Form.Select>
								</Form.Group>
							</Col>

							{/* PROGRAMME */}

							<Col md={6}>
								<Form.Group>
									<Form.Label>Training Programme</Form.Label>

									<Form.Select
										name="trainingProgrammeId"
										value={formData.trainingProgrammeId}
										onChange={handleChange}
										disabled={modalLoading}
									>
										<option value="">Select programme</option>

										{programmes.map((programme) => (
											<option
												key={programme.trainingProgrammeId}
												value={programme.trainingProgrammeId}
											>
												{programme.programmeName}
											</option>
										))}
									</Form.Select>
								</Form.Group>
							</Col>

							{/* DESCRIPTION */}

							<Col md={6}>
								<Form.Group>
									<Form.Label>Description</Form.Label>

									<Form.Control
										as="textarea"
										rows={3}
										name="description"
										value={formData.description}
										onChange={handleChange}
										placeholder="Enter description"
										disabled={modalLoading}
									/>
								</Form.Group>
							</Col>
						</Row>
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
							) : editingPlan ? (
								"Update Plan"
							) : (
								"Create Plan"
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
						Delete Workout Plan
					</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					{modalError && <Alert variant="danger">{modalError}</Alert>}

					<p
						style={{
							color: "#4f5d70",
							fontSize: "14px",
						}}
					>
						Are you sure you want to delete{" "}
						<strong>{deletingPlan?.planName}</strong>?
					</p>

					<div
						style={{
							background: "#fff7e6",
							border: "1px solid #fde4af",
							borderRadius: "8px",
							padding: "12px 14px",
							fontSize: "12px",
							color: "#9a6700",
						}}
					>
						Deleting this workout plan will also delete all workout tasks
						associated with it.
					</div>
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
								Delete Plan
							</>
						)}
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
}

export default TrainerWorkoutPlans;
