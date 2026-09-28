/** @format */

import { useEffect, useState } from "react";
import { Edit3, Plus, Trash2, X } from "lucide-react";
import { Alert, Button, Form, Modal, Spinner } from "react-bootstrap";
import { useOutletContext } from "react-router-dom";

import api from "../../services/api";
import AdminHero from "../../components/AdminHero";

function PersonalTrainers() {
	const { globalSearch = "" } = useOutletContext() || {};

	const [trainers, setTrainers] = useState([]);

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const [showModal, setShowModal] = useState(false);
	const [editingTrainer, setEditingTrainer] = useState(null);

	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deletingTrainer, setDeletingTrainer] = useState(null);

	const [error, setError] = useState("");

	const [formData, setFormData] = useState({
		name: "",
		surname: "",
		gender: "",
		email: "",
		phoneNumber: "",
		specialization: "",
		password: "",
	});

	const specializations = [
		"Strength Training",
		"Weight Loss",
		"Muscle Building",
		"Cardio Training",
		"CrossFit",
		"Functional Training",
		"Bodybuilding",
		"Fitness & Conditioning",
		"Sports Training",
		"Mobility & Flexibility",
	];

	// =========================================
	// LOAD TRAINERS
	// =========================================

	const loadTrainers = async () => {
		try {
			setLoading(true);
			setError("");

			const response = await api.get("/PersonalTrainers");

			setTrainers(response.data);
		} catch (error) {
			console.error(error);

			setError(
				error.response?.data?.message || "Failed to load personal trainers.",
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadTrainers();
	}, []);

	// =========================================
	// GLOBAL HEADER SEARCH
	// =========================================

	const filteredTrainers = trainers.filter((trainer) => {
		const search = globalSearch.trim().toLowerCase();

		if (!search) {
			return true;
		}

		return (
			trainer.name?.toLowerCase().includes(search) ||
			trainer.surname?.toLowerCase().includes(search) ||
			trainer.staffNumber?.toLowerCase().includes(search) ||
			trainer.email?.toLowerCase().includes(search) ||
			trainer.phoneNumber?.toLowerCase().includes(search) ||
			trainer.gender?.toLowerCase().includes(search) ||
			trainer.specialization?.toLowerCase().includes(search)
		);
	});

	// =========================================
	// FORM CHANGE
	// =========================================

	const handleChange = (event) => {
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
		setEditingTrainer(null);

		setFormData({
			name: "",
			surname: "",
			gender: "",
			email: "",
			phoneNumber: "",
			specialization: "",
			password: "",
		});

		setError("");
		setShowModal(true);
	};

	// =========================================
	// OPEN EDIT MODAL
	// =========================================

	const openEditModal = (trainer) => {
		setEditingTrainer(trainer);

		setFormData({
			name: trainer.name || "",
			surname: trainer.surname || "",
			gender: trainer.gender || "",
			email: trainer.email || "",
			phoneNumber: trainer.phoneNumber || "",
			specialization: trainer.specialization || "",
			password: "",
		});

		setError("");
		setShowModal(true);
	};

	// =========================================
	// CLOSE MODAL
	// =========================================

	const closeModal = () => {
		if (saving) {
			return;
		}

		setShowModal(false);
		setEditingTrainer(null);
		setError("");
	};

	// =========================================
	// PASSWORD VALIDATION
	// =========================================

	const validatePassword = (password) => {
		const passwordRegex =
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;

		return passwordRegex.test(password);
	};

	// =========================================
	// ADD / UPDATE TRAINER
	// =========================================

	const handleSubmit = async (event) => {
		event.preventDefault();

		try {
			setSaving(true);
			setError("");

			// ADD TRAINER
			if (!editingTrainer) {
				if (!validatePassword(formData.password)) {
					setError(
						"Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character.",
					);

					setSaving(false);

					return;
				}

				await api.post("/PersonalTrainers", {
					name: formData.name,

					surname: formData.surname,

					gender: formData.gender,

					email: formData.email,

					phoneNumber: formData.phoneNumber,

					specialization: formData.specialization,

					password: formData.password,
				});
			}

			// UPDATE TRAINER
			else {
				await api.put(`/PersonalTrainers/${editingTrainer.personalTrainerId}`, {
					name: formData.name,

					surname: formData.surname,

					gender: formData.gender,

					email: formData.email,

					phoneNumber: formData.phoneNumber,

					specialization: formData.specialization,
				});
			}

			setShowModal(false);
			setEditingTrainer(null);

			await loadTrainers();
		} catch (error) {
			console.error(error);

			setError(
				error.response?.data?.message || "Failed to save personal trainer.",
			);
		} finally {
			setSaving(false);
		}
	};

	// =========================================
	// DELETE TRAINER
	// =========================================

	const openDeleteModal = (trainer) => {
		setDeletingTrainer(trainer);
		setError("");
		setShowDeleteModal(true);
	};

	const closeDeleteModal = () => {
		if (saving) return;

		setShowDeleteModal(false);
		setDeletingTrainer(null);
		setError("");
	};

	const handleDelete = async () => {
		if (!deletingTrainer) return;

		try {
			setSaving(true);
			setError("");

			await api.delete(
				`/PersonalTrainers/${deletingTrainer.personalTrainerId}`,
			);

			setShowDeleteModal(false);
			setDeletingTrainer(null);

			await loadTrainers();
		} catch (error) {
			console.error(error);

			setError(
				error.response?.data?.message || "Failed to delete personal trainer.",
			);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="fitcore-content">
			{/* =====================================
                HERO
            ====================================== */}

			<AdminHero
				title="Personal Trainers"
				subtitle="Manage your gym's personal trainers and their specializations."
			/>

			{/* =====================================
                TRAINERS HEADER
            ====================================== */}

			<div className="d-flex justify-content-between align-items-center mb-3">
				<div>
					<h5 className="mb-1 fw-bold">Personal Trainers</h5>

					<small className="text-muted">
						{globalSearch.trim()
							? `${filteredTrainers.length} matching trainers`
							: `${trainers.length} total trainers`}
					</small>
				</div>

				<button
					type="button"
					className="fitcore-btn-primary d-flex align-items-center gap-2"
					onClick={openAddModal}
				>
					<Plus size={17} />
					Add Trainer
				</button>
			</div>

			{/* =====================================
                PAGE ERROR
            ====================================== */}

			{error && !showModal && (
				<Alert
					variant="danger"
					className="mb-4"
					dismissible
					onClose={() => setError("")}
				>
					{error}
				</Alert>
			)}

			{/* =====================================
                TRAINERS TABLE
            ====================================== */}

			<div className="fitcore-card">
				{loading ? (
					<div className="text-center py-5">
						<Spinner animation="border" />
					</div>
				) : (
					<div className="table-responsive">
						<table className="fitcore-table">
							<thead>
								<tr>
									<th>Staff No.</th>

									<th>Name</th>

									<th>Surname</th>

									<th>Gender</th>

									<th>Specialization</th>

									<th>Email</th>

									<th>Actions</th>
								</tr>
							</thead>

							<tbody>
								{filteredTrainers.length === 0 ? (
									<tr>
										<td colSpan="7" className="text-center py-5 text-muted">
											{globalSearch.trim()
												? `No trainers found matching "${globalSearch}".`
												: "No trainers found."}
										</td>
									</tr>
								) : (
									filteredTrainers.map((trainer) => (
										<tr key={trainer.personalTrainerId}>
											<td>
												<strong>{trainer.staffNumber}</strong>
											</td>

											<td>{trainer.name}</td>

											<td>{trainer.surname}</td>

											<td>{trainer.gender}</td>

											<td>
												<span className="fitcore-badge fitcore-badge-blue">
													{trainer.specialization}
												</span>
											</td>

											<td>{trainer.email}</td>

											<td>
												<div className="d-flex gap-2">
													{/* EDIT */}

													<button
														type="button"
														className="btn btn-sm"
														style={{
															color: "#0878f9",

															background: "#eaf3ff",

															borderRadius: "6px",
														}}
														title="Edit"
														onClick={() => openEditModal(trainer)}
													>
														<Edit3 size={15} />
													</button>

													{/* DELETE */}

													<button
														type="button"
														className="btn btn-sm"
														style={{
															color: "#ef4444",

															background: "#fff0f0",

															borderRadius: "6px",
														}}
														title="Delete"
														onClick={() => openDeleteModal(trainer)}
													>
														<Trash2 size={15} />
													</button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{/* =====================================
                ADD / EDIT TRAINER MODAL
            ====================================== */}

			<Modal show={showModal} onHide={closeModal} centered>
				<Modal.Header
					closeButton
					style={{
						borderBottom: "1px solid #e8edf3",
					}}
				>
					<Modal.Title
						style={{
							fontSize: "18px",
							fontWeight: "700",
						}}
					>
						{editingTrainer ? "Edit Personal Trainer" : "Add Personal Trainer"}
					</Modal.Title>
				</Modal.Header>

				<Form onSubmit={handleSubmit}>
					<Modal.Body className="p-4">
						{error && (
							<Alert variant="danger" dismissible onClose={() => setError("")}>
								{error}
							</Alert>
						)}

						<div className="row g-3">
							{/* NAME */}

							<div className="col-md-6">
								<label className="fitcore-form-label">Name *</label>

								<input
									type="text"
									name="name"
									className="fitcore-form-control"
									value={formData.name}
									onChange={handleChange}
									required
								/>
							</div>

							{/* SURNAME */}

							<div className="col-md-6">
								<label className="fitcore-form-label">Surname *</label>

								<input
									type="text"
									name="surname"
									className="fitcore-form-control"
									value={formData.surname}
									onChange={handleChange}
									required
								/>
							</div>

							{/* GENDER */}

							<div className="col-md-6">
								<label className="fitcore-form-label">Gender *</label>

								<select
									name="gender"
									className="fitcore-form-control"
									value={formData.gender}
									onChange={handleChange}
									required
								>
									<option value="">Select gender</option>

									<option value="Male">Male</option>

									<option value="Female">Female</option>
								</select>
							</div>

							{/* EMAIL */}

							<div className="col-md-6">
								<label className="fitcore-form-label">Email Address *</label>

								<input
									type="email"
									name="email"
									className="fitcore-form-control"
									value={formData.email}
									onChange={handleChange}
									required
								/>
							</div>

							{/* PHONE NUMBER */}

							<div className="col-md-6">
								<label className="fitcore-form-label">Phone Number *</label>

								<input
									type="text"
									name="phoneNumber"
									className="fitcore-form-control"
									value={formData.phoneNumber}
									onChange={handleChange}
									required
								/>
							</div>

							{/* SPECIALIZATION */}

							<div className="col-md-6">
								<label className="fitcore-form-label">Specialization *</label>

								<select
									name="specialization"
									className="fitcore-form-control"
									value={formData.specialization}
									onChange={handleChange}
									required
								>
									<option value="">Select specialization</option>

									{specializations.map((specialization) => (
										<option key={specialization} value={specialization}>
											{specialization}
										</option>
									))}
								</select>
							</div>

							{/* PASSWORD - ADD ONLY */}

							{!editingTrainer && (
								<div className="col-12">
									<label className="fitcore-form-label">Password *</label>

									<input
										type="password"
										name="password"
										className="fitcore-form-control"
										value={formData.password}
										onChange={handleChange}
										required
									/>

									<small className="text-muted">
										Minimum 8 characters with uppercase, lowercase, number and
										special character.
									</small>
								</div>
							)}
						</div>
					</Modal.Body>

					<Modal.Footer
						style={{
							borderTop: "1px solid #e8edf3",
						}}
					>
						<Button variant="light" onClick={closeModal} disabled={saving}>
							<X size={15} className="me-1" />
							Cancel
						</Button>

						<button
							type="submit"
							className="fitcore-btn-primary"
							disabled={saving}
						>
							{saving ? (
								<>
									<Spinner size="sm" className="me-2" />
									Saving...
								</>
							) : editingTrainer ? (
								"Update Trainer"
							) : (
								"Save Trainer"
							)}
						</button>
					</Modal.Footer>
				</Form>
			</Modal>
			<Modal
				show={showDeleteModal}
				onHide={closeDeleteModal}
				centered
				backdrop={saving ? "static" : true}
			>
				<Modal.Header closeButton={!saving}>
					<Modal.Title
						style={{
							fontSize: "18px",
							fontWeight: 700,
							color: "#172033",
						}}
					>
						Delete Personal Trainer
					</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					{error && <Alert variant="danger">{error}</Alert>}

					<p
						style={{
							color: "#4f5d70",
							fontSize: "14px",
							marginBottom: "8px",
						}}
					>
						Are you sure you want to delete{" "}
						<strong>
							{deletingTrainer?.name} {deletingTrainer?.surname}
						</strong>
						?
					</p>

					<p
						style={{
							color: "#7b8798",
							fontSize: "12px",
							marginBottom: 0,
						}}
					>
						This action cannot be undone.
					</p>
				</Modal.Body>

				<Modal.Footer>
					<Button variant="light" onClick={closeDeleteModal} disabled={saving}>
						Cancel
					</Button>

					<Button variant="danger" onClick={handleDelete} disabled={saving}>
						{saving ? (
							<>
								<Spinner size="sm" className="me-2" />
								Deleting...
							</>
						) : (
							<>
								<Trash2 size={15} className="me-2" />
								Delete Trainer
							</>
						)}
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
}

export default PersonalTrainers;
