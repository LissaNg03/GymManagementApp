/** @format */

import { useEffect, useState } from "react";
import { Edit3, Plus, Trash2, X } from "lucide-react";
import { Alert, Button, Form, Modal, Spinner } from "react-bootstrap";
import { useOutletContext } from "react-router-dom";

import api from "../../services/api";
import AdminHero from "../../components/AdminHero";

function TrainingProgrammes() {
	const { globalSearch = "" } = useOutletContext() || {};

	const [programmes, setProgrammes] = useState([]);

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const [showModal, setShowModal] = useState(false);
	const [editingProgramme, setEditingProgramme] = useState(null);

	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deletingProgramme, setDeletingProgramme] = useState(null);

	const [error, setError] = useState("");

	const [formData, setFormData] = useState({
		programmeName: "",
		description: "",
		duration: "",
	});

	// =========================================
	// LOAD PROGRAMMES
	// =========================================

	const loadProgrammes = async () => {
		try {
			setLoading(true);
			setError("");

			const response = await api.get("/TrainingProgrammes");

			setProgrammes(response.data);
		} catch (error) {
			console.error(error);

			setError(
				error.response?.data?.message || "Failed to load training programmes.",
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadProgrammes();
	}, []);

	// =========================================
	// GLOBAL HEADER SEARCH
	// =========================================

	const filteredProgrammes = programmes.filter((programme) => {
		const search = globalSearch.trim().toLowerCase();

		if (!search) {
			return true;
		}

		return (
			programme.programmeName?.toLowerCase().includes(search) ||
			programme.description?.toLowerCase().includes(search) ||
			String(programme.duration ?? "")
				.toLowerCase()
				.includes(search)
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
		setEditingProgramme(null);

		setFormData({
			programmeName: "",
			description: "",
			duration: "",
		});

		setError("");
		setShowModal(true);
	};

	// =========================================
	// OPEN EDIT MODAL
	// =========================================

	const openEditModal = (programme) => {
		setEditingProgramme(programme);

		setFormData({
			programmeName: programme.programmeName || "",

			description: programme.description || "",

			duration: programme.duration || "",
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
		setEditingProgramme(null);
		setError("");
	};

	// =========================================
	// CREATE / UPDATE PROGRAMME
	// =========================================

	const handleSubmit = async (event) => {
		event.preventDefault();

		try {
			setSaving(true);
			setError("");

			// CREATE
			if (!editingProgramme) {
				await api.post("/TrainingProgrammes", {
					programmeName: formData.programmeName,

					description: formData.description,

					duration: formData.duration,
				});
			}

			// UPDATE
			else {
				await api.put(
					`/TrainingProgrammes/${editingProgramme.trainingProgrammeId}`,
					{
						programmeName: formData.programmeName,

						description: formData.description,

						duration: formData.duration,
					},
				);
			}

			setShowModal(false);
			setEditingProgramme(null);

			await loadProgrammes();
		} catch (error) {
			console.error(error);

			setError(
				error.response?.data?.message || "Failed to save training programme.",
			);
		} finally {
			setSaving(false);
		}
	};

	// =========================================
	// DELETE PROGRAMME
	// =========================================

	const openDeleteModal = (programme) => {
		setDeletingProgramme(programme);
		setError("");
		setShowDeleteModal(true);
	};

	const closeDeleteModal = () => {
		if (saving) return;

		setShowDeleteModal(false);
		setDeletingProgramme(null);
		setError("");
	};

	const handleDelete = async () => {
		if (!deletingProgramme) return;

		try {
			setSaving(true);
			setError("");

			await api.delete(
				`/TrainingProgrammes/${deletingProgramme.trainingProgrammeId}`,
			);

			setShowDeleteModal(false);
			setDeletingProgramme(null);

			await loadProgrammes();
		} catch (error) {
			console.error(error);

			setError(
				error.response?.data?.message || "Failed to delete training programme.",
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
				title="Training Programmes"
				subtitle="Create and manage training programmes for your gym members."
			/>

			{/* =====================================
                PROGRAMMES HEADER
            ====================================== */}

			<div className="d-flex justify-content-between align-items-center mb-3">
				<div>
					<h5 className="mb-1 fw-bold">Training Programmes</h5>

					<small className="text-muted">
						{globalSearch.trim()
							? `${filteredProgrammes.length} matching programmes`
							: `${programmes.length} total programmes`}
					</small>
				</div>

				<button
					type="button"
					className="fitcore-btn-primary d-flex align-items-center gap-2"
					onClick={openAddModal}
				>
					<Plus size={17} />
					Create Programme
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
                PROGRAMMES TABLE
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
									<th>Programme</th>

									<th>Description</th>

									<th>Duration</th>

									<th>Status</th>

									<th>Actions</th>
								</tr>
							</thead>

							<tbody>
								{filteredProgrammes.length === 0 ? (
									<tr>
										<td colSpan="5" className="text-center py-5 text-muted">
											{globalSearch.trim()
												? `No programmes found matching "${globalSearch}".`
												: "No training programmes found."}
										</td>
									</tr>
								) : (
									filteredProgrammes.map((programme) => (
										<tr key={programme.trainingProgrammeId}>
											{/* PROGRAMME */}

											<td>
												<strong>{programme.programmeName}</strong>
											</td>

											{/* DESCRIPTION */}

											<td
												style={{
													maxWidth: "350px",
												}}
											>
												<span
													style={{
														color: "#6f7b8b",
													}}
												>
													{programme.description}
												</span>
											</td>

											{/* DURATION */}

											<td>{programme.duration}</td>

											{/* STATUS */}

											<td>
												<span className="fitcore-badge fitcore-badge-green">
													Active
												</span>
											</td>

											{/* ACTIONS */}

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
														onClick={() => openEditModal(programme)}
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
														onClick={() => openDeleteModal(programme)}
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
                CREATE / EDIT PROGRAMME MODAL
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
						{editingProgramme
							? "Edit Training Programme"
							: "Create Training Programme"}
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
							{/* PROGRAMME NAME */}

							<div className="col-12">
								<label className="fitcore-form-label">Programme Name *</label>

								<input
									type="text"
									name="programmeName"
									className="fitcore-form-control"
									placeholder="e.g. Beginner Strength Programme"
									value={formData.programmeName}
									onChange={handleChange}
									required
								/>
							</div>

							{/* DESCRIPTION */}

							<div className="col-12">
								<label className="fitcore-form-label">Description *</label>

								<textarea
									name="description"
									className="fitcore-form-control"
									rows="4"
									placeholder="Describe what this programme is designed to achieve..."
									value={formData.description}
									onChange={handleChange}
									required
									style={{
										height: "110px",
										paddingTop: "10px",
										resize: "vertical",
									}}
								/>
							</div>

							{/* DURATION */}

							<div className="col-12">
								<label className="fitcore-form-label">Duration *</label>

								<input
									type="text"
									name="duration"
									className="fitcore-form-control"
									placeholder="e.g. 12 Weeks"
									value={formData.duration}
									onChange={handleChange}
									required
								/>
							</div>
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
							) : editingProgramme ? (
								"Update Programme"
							) : (
								"Create Programme"
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
						Delete Training Programme
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
						<strong>{deletingProgramme?.programmeName}</strong>?
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
								Delete Programme
							</>
						)}
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
}

export default TrainingProgrammes;
