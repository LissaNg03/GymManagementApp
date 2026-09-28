/** @format */

import { useEffect, useState } from "react";
import { Edit3, Plus, Trash2, X } from "lucide-react";
import { Alert, Button, Form, Modal, Spinner } from "react-bootstrap";
import { useOutletContext } from "react-router-dom";

import api from "../../services/api";
import AdminHero from "../../components/AdminHero";

function Members() {
	const { globalSearch = "" } = useOutletContext() || {};

	const [members, setMembers] = useState([]);
	const [trainers, setTrainers] = useState([]);

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const [showModal, setShowModal] = useState(false);
	const [editingMember, setEditingMember] = useState(null);

	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deletingMember, setDeletingMember] = useState(null);

	const [error, setError] = useState("");

	const [formData, setFormData] = useState({
		name: "",
		surname: "",
		gender: "",
		dateOfBirth: "",
		homeAddress: "",
		email: "",
		phoneNumber: "",
		membershipType: "",
		personalTrainerId: "",
		password: "",
	});

	// =========================================
	// LOAD MEMBERS + TRAINERS
	// =========================================

	const loadData = async () => {
		try {
			setLoading(true);
			setError("");

			const [membersResponse, trainersResponse] = await Promise.all([
				api.get("/GymMembers"),
				api.get("/PersonalTrainers"),
			]);

			setMembers(membersResponse.data);
			setTrainers(trainersResponse.data);
		} catch (error) {
			console.error(error);

			setError(error.response?.data?.message || "Failed to load members.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, []);

	// =========================================
	// TRAINER NAME
	// =========================================

	const getTrainerName = (trainerId) => {
		const trainer = trainers.find(
			(trainer) => trainer.personalTrainerId === trainerId,
		);

		if (!trainer) {
			return "Unassigned";
		}

		return `${trainer.name} ${trainer.surname}`;
	};

	// =========================================
	// GLOBAL HEADER SEARCH
	// =========================================

	const filteredMembers = members.filter((member) => {
		const search = globalSearch.trim().toLowerCase();

		if (!search) {
			return true;
		}

		const trainerName = getTrainerName(member.personalTrainerId).toLowerCase();

		return (
			member.name?.toLowerCase().includes(search) ||
			member.surname?.toLowerCase().includes(search) ||
			member.memberNumber?.toLowerCase().includes(search) ||
			member.email?.toLowerCase().includes(search) ||
			member.membershipType?.toLowerCase().includes(search) ||
			member.gender?.toLowerCase().includes(search) ||
			trainerName.includes(search)
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
		setEditingMember(null);

		setFormData({
			name: "",
			surname: "",
			gender: "",
			dateOfBirth: "",
			homeAddress: "",
			email: "",
			phoneNumber: "",
			membershipType: "",
			personalTrainerId: "",
			password: "",
		});

		setError("");
		setShowModal(true);
	};

	// =========================================
	// OPEN EDIT MODAL
	// =========================================

	const openEditModal = (member) => {
		setEditingMember(member);

		setFormData({
			name: member.name || "",
			surname: member.surname || "",
			gender: member.gender || "",

			dateOfBirth: member.dateOfBirth
				? member.dateOfBirth.substring(0, 10)
				: "",

			homeAddress: member.homeAddress || "",

			email: member.email || "",

			phoneNumber: member.phoneNumber || "",

			membershipType: member.membershipType || "",

			personalTrainerId: member.personalTrainerId || "",

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
		setEditingMember(null);
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
	// ADD / UPDATE MEMBER
	// =========================================

	const handleSubmit = async (event) => {
		event.preventDefault();

		try {
			setSaving(true);
			setError("");

			// ADD
			if (!editingMember) {
				if (!validatePassword(formData.password)) {
					setError(
						"Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character.",
					);

					setSaving(false);
					return;
				}

				await api.post("/GymMembers", {
					name: formData.name,

					surname: formData.surname,

					gender: formData.gender,

					dateOfBirth: formData.dateOfBirth,

					homeAddress: formData.homeAddress,

					email: formData.email,

					phoneNumber: formData.phoneNumber || null,

					membershipType: formData.membershipType,

					personalTrainerId: Number(formData.personalTrainerId),

					password: formData.password,
				});
			}

			// UPDATE
			else {
				await api.put(`/GymMembers/${editingMember.gymMemberId}`, {
					name: formData.name,

					surname: formData.surname,

					gender: formData.gender,

					dateOfBirth: formData.dateOfBirth,

					homeAddress: formData.homeAddress,

					email: formData.email,

					phoneNumber: formData.phoneNumber || null,

					membershipType: formData.membershipType,

					personalTrainerId: formData.personalTrainerId
						? Number(formData.personalTrainerId)
						: null,
				});
			}

			setShowModal(false);
			setEditingMember(null);

			await loadData();
		} catch (error) {
			console.error(error);

			setError(error.response?.data?.message || "Failed to save member.");
		} finally {
			setSaving(false);
		}
	};

	// =========================================
	// DELETE MEMBER
	// =========================================

	const openDeleteModal = (member) => {
		setDeletingMember(member);
		setError("");
		setShowDeleteModal(true);
	};

	const closeDeleteModal = () => {
		if (saving) return;

		setShowDeleteModal(false);
		setDeletingMember(null);
		setError("");
	};

	const handleDelete = async () => {
		if (!deletingMember) return;

		try {
			setSaving(true);
			setError("");

			await api.delete(`/GymMembers/${deletingMember.gymMemberId}`);

			setShowDeleteModal(false);
			setDeletingMember(null);

			await loadData();
		} catch (error) {
			console.error(error);

			setError(error.response?.data?.message || "Failed to delete member.");
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
				title="Gym Members"
				subtitle="Manage your registered gym members and their membership information."
			/>

			{/* =====================================
                TABLE HEADER
            ====================================== */}

			<div className="d-flex justify-content-between align-items-center mb-3">
				<div>
					<h5 className="mb-1 fw-bold">Members</h5>

					<small className="text-muted">
						{globalSearch.trim()
							? `${filteredMembers.length} matching members`
							: `${members.length} total members`}
					</small>
				</div>

				<button
					type="button"
					className="fitcore-btn-primary d-flex align-items-center gap-2"
					onClick={openAddModal}
				>
					<Plus size={17} />
					Add Member
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
                MEMBERS TABLE
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
									<th>Member No.</th>

									<th>Name</th>

									<th>Surname</th>

									<th>Gender</th>

									<th>Membership Type</th>

									<th>Trainer</th>

									<th>Actions</th>
								</tr>
							</thead>

							<tbody>
								{filteredMembers.length === 0 ? (
									<tr>
										<td colSpan="7" className="text-center py-5 text-muted">
											{globalSearch.trim()
												? `No members found matching "${globalSearch}".`
												: "No members found."}
										</td>
									</tr>
								) : (
									filteredMembers.map((member) => (
										<tr key={member.gymMemberId}>
											<td>
												<strong>{member.memberNumber}</strong>
											</td>

											<td>{member.name}</td>

											<td>{member.surname}</td>

											<td>{member.gender}</td>

											<td>
												<span className="fitcore-badge fitcore-badge-blue">
													{member.membershipType}
												</span>
											</td>

											<td>{getTrainerName(member.personalTrainerId)}</td>

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
														onClick={() => openEditModal(member)}
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
														onClick={() => openDeleteModal(member)}
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
                ADD / EDIT MEMBER MODAL
            ====================================== */}

			<Modal show={showModal} onHide={closeModal} size="lg" centered>
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
						{editingMember ? "Edit Gym Member" : "Add Gym Member"}
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

							{/* DATE OF BIRTH */}

							<div className="col-md-6">
								<label className="fitcore-form-label">Date of Birth *</label>

								<input
									type="date"
									name="dateOfBirth"
									className="fitcore-form-control"
									value={formData.dateOfBirth}
									onChange={handleChange}
									required
								/>
							</div>

							{/* ADDRESS */}

							<div className="col-12">
								<label className="fitcore-form-label">Home Address *</label>

								<input
									type="text"
									name="homeAddress"
									className="fitcore-form-control"
									value={formData.homeAddress}
									onChange={handleChange}
									required
								/>
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

							{/* PHONE */}

							<div className="col-md-6">
								<label className="fitcore-form-label">Phone Number</label>

								<input
									type="text"
									name="phoneNumber"
									className="fitcore-form-control"
									value={formData.phoneNumber}
									onChange={handleChange}
								/>
							</div>

							{/* MEMBERSHIP */}

							<div className="col-md-6">
								<label className="fitcore-form-label">Membership Type *</label>

								<select
									name="membershipType"
									className="fitcore-form-control"
									value={formData.membershipType}
									onChange={handleChange}
									required
								>
									<option value="">Select membership</option>

									<option value="Monthly">Monthly</option>

									<option value="Quarterly">Quarterly</option>

									<option value="Annual">Annual</option>
								</select>
							</div>

							{/* PERSONAL TRAINER */}

							<div className="col-md-6">
								<label className="fitcore-form-label">Personal Trainer *</label>

								<select
									name="personalTrainerId"
									className="fitcore-form-control"
									value={formData.personalTrainerId}
									onChange={handleChange}
									required
								>
									<option value="">Select trainer</option>

									{trainers.map((trainer) => (
										<option
											key={trainer.personalTrainerId}
											value={trainer.personalTrainerId}
										>
											{trainer.name} {trainer.surname}
										</option>
									))}
								</select>
							</div>

							{/* PASSWORD - ADD ONLY */}

							{!editingMember && (
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
							) : editingMember ? (
								"Update Member"
							) : (
								"Save Member"
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
						Delete Gym Member
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
							{deletingMember?.name} {deletingMember?.surname}
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
								Delete Member
							</>
						)}
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
}

export default Members;
