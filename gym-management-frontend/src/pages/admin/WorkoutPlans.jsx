/** @format */

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Dumbbell } from "lucide-react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useOutletContext } from "react-router-dom";
import api from "../../services/api";
import AdminHero from "../../components/AdminHero";

const WorkoutPlans = () => {
	const { globalSearch = "" } = useOutletContext() || {};

	const [workoutPlans, setWorkoutPlans] = useState([]);
	const [members, setMembers] = useState([]);
	const [programmes, setProgrammes] = useState([]);

	const [showModal, setShowModal] = useState(false);
	const [editingWorkoutPlan, setEditingWorkoutPlan] = useState(null);

	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deletingWorkoutPlan, setDeletingWorkoutPlan] = useState(null);
	const [deleting, setDeleting] = useState(false);

	const [formData, setFormData] = useState({
		planName: "",
		description: "",
		gymMemberId: "",
		trainingProgrammeId: "",
	});

	// =========================================
	// LOAD DATA
	// =========================================

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			const [workoutPlansResponse, membersResponse, programmesResponse] =
				await Promise.all([
					api.get("/WorkoutPlans"),
					api.get("/GymMembers"),
					api.get("/TrainingProgrammes"),
				]);

			setWorkoutPlans(workoutPlansResponse.data);

			setMembers(membersResponse.data);

			setProgrammes(programmesResponse.data);
		} catch (error) {
			console.error("Failed to load workout plan data:", error);
		}
	};

	// =========================================
	// FORM CHANGE
	// =========================================

	const handleInputChange = (event) => {
		const { name, value } = event.target;

		setFormData((previous) => ({
			...previous,
			[name]: value,
		}));
	};

	// =========================================
	// OPEN ADD MODAL
	// =========================================

	const openAddModal = () => {
		setEditingWorkoutPlan(null);

		setFormData({
			planName: "",
			description: "",
			gymMemberId: "",
			trainingProgrammeId: "",
		});

		setShowModal(true);
	};

	// =========================================
	// OPEN EDIT MODAL
	// =========================================

	const openEditModal = (workoutPlan) => {
		setEditingWorkoutPlan(workoutPlan);

		setFormData({
			planName: workoutPlan.planName || "",

			description: workoutPlan.description || "",

			gymMemberId: workoutPlan.gymMemberId || "",

			trainingProgrammeId: workoutPlan.trainingProgrammeId || "",
		});

		setShowModal(true);
	};

	// =========================================
	// CLOSE MODAL
	// =========================================

	const closeModal = () => {
		setShowModal(false);
		setEditingWorkoutPlan(null);
	};

	// =========================================
	// CREATE / UPDATE WORKOUT PLAN
	// =========================================

	const handleSubmit = async (event) => {
		event.preventDefault();

		try {
			const data = {
				planName: formData.planName,

				description: formData.description || null,

				gymMemberId: Number(formData.gymMemberId),

				trainingProgrammeId: Number(formData.trainingProgrammeId),
			};

			if (editingWorkoutPlan) {
				await api.put(
					`/WorkoutPlans/${editingWorkoutPlan.workoutPlanId}`,
					data,
				);
			} else {
				await api.post("/WorkoutPlans", data);
			}

			setShowModal(false);
			setEditingWorkoutPlan(null);

			await loadData();
		} catch (error) {
			console.error("Failed to save workout plan:", error);
		}
	};

	// =========================================
	// DELETE WORKOUT PLAN
	// =========================================

	const openDeleteModal = (workoutPlan) => {
		setDeletingWorkoutPlan(workoutPlan);
		setShowDeleteModal(true);
	};

	const closeDeleteModal = () => {
		if (deleting) return;

		setShowDeleteModal(false);
		setDeletingWorkoutPlan(null);
	};

	const handleDelete = async () => {
		if (!deletingWorkoutPlan) return;

		try {
			setDeleting(true);

			await api.delete(`/WorkoutPlans/${deletingWorkoutPlan.workoutPlanId}`);

			setShowDeleteModal(false);
			setDeletingWorkoutPlan(null);

			await loadData();
		} catch (error) {
			console.error("Failed to delete workout plan:", error);
		} finally {
			setDeleting(false);
		}
	};

	// =========================================
	// GET MEMBER
	// =========================================

	const getMember = (id) => {
		return members.find((member) => member.gymMemberId === id);
	};

	// =========================================
	// GET PROGRAMME
	// =========================================

	const getProgramme = (id) => {
		return programmes.find((programme) => programme.trainingProgrammeId === id);
	};

	// =========================================
	// GLOBAL HEADER SEARCH
	// =========================================

	const filteredWorkoutPlans = workoutPlans.filter((plan) => {
		const search = globalSearch.trim().toLowerCase();

		if (!search) {
			return true;
		}

		const member = getMember(plan.gymMemberId);

		const programme = getProgramme(plan.trainingProgrammeId);

		const searchString = `
                ${plan.planName || ""}
                ${plan.description || ""}
                ${member?.memberNumber || ""}
                ${member?.name || ""}
                ${member?.surname || ""}
                ${programme?.programmeName || ""}
            `.toLowerCase();

		return searchString.includes(search);
	});

	return (
		<div className="fitcore-content">
			{/* =====================================
                HERO
            ====================================== */}

			<AdminHero
				title="Workout Plans"
				subtitle="Create and manage workout plans for your gym members."
			/>

			{/* =====================================
                PAGE HEADER
            ====================================== */}

			<div className="d-flex justify-content-between align-items-center mb-3">
				<div>
					<h5 className="mb-1 fw-bold">Workout Plans</h5>

					<small className="text-muted">
						{globalSearch.trim()
							? `${filteredWorkoutPlans.length} matching workout plans`
							: `${workoutPlans.length} total workout plans`}
					</small>
				</div>

				<button
					type="button"
					className="fitcore-btn-primary d-flex align-items-center gap-2"
					onClick={openAddModal}
				>
					<Plus size={17} />
					Add Workout Plan
				</button>
			</div>

			{/* =====================================
                WORKOUT PLANS TABLE
            ====================================== */}

			<div className="fitcore-card">
				<div className="table-responsive">
					<table className="fitcore-table">
						<thead>
							<tr>
								<th>Workout Plan</th>

								<th>Description</th>

								<th>Member</th>

								<th>Training Programme</th>

								<th className="text-end">Actions</th>
							</tr>
						</thead>

						<tbody>
							{filteredWorkoutPlans.length > 0 ? (
								filteredWorkoutPlans.map((plan) => {
									const member = getMember(plan.gymMemberId);

									const programme = getProgramme(plan.trainingProgrammeId);

									return (
										<tr key={plan.workoutPlanId}>
											{/* WORKOUT PLAN */}

											<td>
												<div className="d-flex align-items-center gap-2">
													<div className="fitcore-icon-box">
														<Dumbbell size={17} />
													</div>

													<div>
														<div className="fw-semibold">{plan.planName}</div>
													</div>
												</div>
											</td>

											{/* DESCRIPTION */}

											<td>
												<span className="text-muted">
													{plan.description || "No description"}
												</span>
											</td>

											{/* MEMBER */}

											<td>
												{member ? (
													<div>
														<div className="fw-semibold">
															{member.name} {member.surname}
														</div>

														<small className="text-muted">
															{member.memberNumber}
														</small>
													</div>
												) : (
													<span className="text-muted">Unknown member</span>
												)}
											</td>

											{/* TRAINING PROGRAMME */}

											<td>
												{programme ? (
													<span className="fitcore-badge fitcore-badge-blue">
														{programme.programmeName}
													</span>
												) : (
													<span className="text-muted">Unknown programme</span>
												)}
											</td>

											{/* ACTIONS */}

											<td>
												<div className="d-flex justify-content-end gap-2">
													<button
														type="button"
														className="fitcore-action-btn fitcore-action-edit"
														onClick={() => openEditModal(plan)}
														title="Edit"
													>
														<Pencil size={16} />
													</button>

													<button
														type="button"
														className="fitcore-action-btn fitcore-action-delete"
														onClick={() => openDeleteModal(plan)}
														title="Delete"
													>
														<Trash2 size={16} />
													</button>
												</div>
											</td>
										</tr>
									);
								})
							) : (
								<tr>
									<td colSpan="5" className="text-center py-5 text-muted">
										{globalSearch.trim()
											? `No workout plans found matching "${globalSearch}".`
											: "No workout plans found."}
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* =====================================
                ADD / EDIT MODAL
            ====================================== */}

			<Modal show={showModal} onHide={closeModal} centered>
				<Modal.Header closeButton>
					<Modal.Title>
						{editingWorkoutPlan ? "Edit Workout Plan" : "Add Workout Plan"}
					</Modal.Title>
				</Modal.Header>

				<Form onSubmit={handleSubmit}>
					<Modal.Body>
						{/* PLAN NAME */}

						<Form.Group className="mb-3">
							<Form.Label className="fitcore-form-label">Plan Name</Form.Label>

							<Form.Control
								type="text"
								className="fitcore-form-control"
								name="planName"
								value={formData.planName}
								onChange={handleInputChange}
								placeholder="e.g. Beginner Strength Plan"
								required
							/>
						</Form.Group>

						{/* DESCRIPTION */}

						<Form.Group className="mb-3">
							<Form.Label className="fitcore-form-label">
								Description
							</Form.Label>

							<Form.Control
								as="textarea"
								rows={4}
								className="fitcore-form-control"
								name="description"
								value={formData.description}
								onChange={handleInputChange}
								placeholder="Describe the workout plan..."
							/>
						</Form.Group>

						{/* MEMBER */}

						<Form.Group className="mb-3">
							<Form.Label className="fitcore-form-label">Gym Member</Form.Label>

							<Form.Select
								className="fitcore-form-control"
								name="gymMemberId"
								value={formData.gymMemberId}
								onChange={handleInputChange}
								required
							>
								<option value="">Select member</option>

								{members.map((member) => (
									<option key={member.gymMemberId} value={member.gymMemberId}>
										{member.memberNumber} — {member.name} {member.surname}
									</option>
								))}
							</Form.Select>
						</Form.Group>

						{/* TRAINING PROGRAMME */}

						<Form.Group>
							<Form.Label className="fitcore-form-label">
								Training Programme
							</Form.Label>

							<Form.Select
								className="fitcore-form-control"
								name="trainingProgrammeId"
								value={formData.trainingProgrammeId}
								onChange={handleInputChange}
								required
							>
								<option value="">Select training programme</option>

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
					</Modal.Body>

					<Modal.Footer>
						<Button variant="light" onClick={closeModal}>
							Cancel
						</Button>

						<button type="submit" className="fitcore-btn-primary">
							{editingWorkoutPlan
								? "Update Workout Plan"
								: "Create Workout Plan"}
						</button>
					</Modal.Footer>
				</Form>
			</Modal>

			<Modal
				show={showDeleteModal}
				onHide={closeDeleteModal}
				centered
				backdrop={deleting ? "static" : true}
			>
				<Modal.Header closeButton={!deleting}>
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
					<p
						style={{
							color: "#4f5d70",
							fontSize: "14px",
						}}
					>
						Are you sure you want to delete{" "}
						<strong>{deletingWorkoutPlan?.planName}</strong>?
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
						Deleting this workout plan may also affect its associated workout
						tasks.
					</div>
				</Modal.Body>

				<Modal.Footer>
					<Button
						variant="light"
						onClick={closeDeleteModal}
						disabled={deleting}
					>
						Cancel
					</Button>

					<Button variant="danger" onClick={handleDelete} disabled={deleting}>
						{deleting ? (
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
};

export default WorkoutPlans;
