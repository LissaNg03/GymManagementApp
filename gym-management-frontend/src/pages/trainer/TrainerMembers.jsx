/** @format */

import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Mail, Phone, UserRound, Users } from "lucide-react";

import api from "../../services/api";

function TrainerMembers() {
	const { globalSearch = "" } = useOutletContext() || {};

	const [members, setMembers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		loadMembers();
	}, []);

	const loadMembers = async () => {
		try {
			setLoading(true);
			setError("");

			const response = await api.get("/PersonalTrainers/my/members");

			setMembers(Array.isArray(response.data) ? response.data : []);
		} catch (error) {
			console.error("Failed to load assigned members:", error);

			setError(
				error.response?.data?.message || "Failed to load assigned members.",
			);
		} finally {
			setLoading(false);
		}
	};

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

	const filteredMembers = members.filter((member) => {
		const search = globalSearch.trim().toLowerCase();

		if (!search) {
			return true;
		}

		const searchableText = `
				${member.memberNumber || ""}
				${member.name || ""}
				${member.surname || ""}
				${member.gender || ""}
				${member.email || ""}
				${member.phoneNumber || ""}
				${member.membershipType || ""}
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
					<Users size={165} />
				</div>

				<div className="admin-hero-overlay" />

				<div className="admin-hero-content">
					<p className="admin-hero-greeting">Personal Trainer</p>

					<h1>
						My <span>Members</span>
					</h1>

					<p className="admin-hero-subtitle">
						View the gym members currently assigned to you.
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
					<h2 className="fitcore-page-title">Assigned Members</h2>

					<div className="fitcore-page-subtitle">
						{loading
							? "Loading members..."
							: `${filteredMembers.length} ${
									filteredMembers.length === 1 ? "member" : "members"
								}`}
					</div>
				</div>
			</div>

			{/* =====================================================
				MEMBERS TABLE
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
								Loading members...
							</p>
						</div>
					</div>
				) : filteredMembers.length === 0 ? (
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
								width: "55px",
								height: "55px",
								borderRadius: "12px",
								marginBottom: "13px",
							}}
						>
							<Users size={25} />
						</div>

						<strong
							style={{
								fontSize: "14px",
								color: "#172033",
							}}
						>
							No members found
						</strong>

						<p
							style={{
								fontSize: "12px",
								color: "#7b8798",
								marginTop: "5px",
								marginBottom: 0,
							}}
						>
							{globalSearch
								? "No assigned members match your search."
								: "You currently have no gym members assigned to you."}
						</p>
					</div>
				) : (
					<div className="table-responsive">
						<table className="fitcore-table">
							<thead>
								<tr>
									<th>Member No.</th>
									<th>Member</th>
									<th>Gender</th>
									<th>Contact</th>
									<th>Membership</th>
								</tr>
							</thead>

							<tbody>
								{filteredMembers.map((member) => (
									<tr key={member.gymMemberId}>
										{/* MEMBER NUMBER */}
										<td>
											<strong
												style={{
													color: "#172033",
												}}
											>
												{member.memberNumber || "—"}
											</strong>
										</td>

										{/* MEMBER */}
										<td>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "11px",
													minWidth: "180px",
												}}
											>
												<div
													className="fitcore-icon-box"
													style={{
														width: "38px",
														height: "38px",
														borderRadius: "50%",
													}}
												>
													<UserRound size={18} />
												</div>

												<div>
													<div
														style={{
															fontWeight: 600,
															color: "#172033",
														}}
													>
														{member.name} {member.surname}
													</div>

													<div
														style={{
															fontSize: "11px",
															color: "#8a96a6",
															marginTop: "2px",
														}}
													>
														Gym Member
													</div>
												</div>
											</div>
										</td>

										{/* GENDER */}
										<td>{member.gender || "—"}</td>

										{/* CONTACT */}
										<td>
											<div
												style={{
													display: "flex",
													flexDirection: "column",
													gap: "5px",
													minWidth: "200px",
												}}
											>
												<div
													style={{
														display: "flex",
														alignItems: "center",
														gap: "6px",
													}}
												>
													<Mail
														size={13}
														style={{
															color: "#8a96a6",
															flexShrink: 0,
														}}
													/>

													<span>{member.email || "—"}</span>
												</div>

												<div
													style={{
														display: "flex",
														alignItems: "center",
														gap: "6px",
														fontSize: "11px",
														color: "#7b8798",
													}}
												>
													<Phone
														size={12}
														style={{
															flexShrink: 0,
														}}
													/>

													<span>{member.phoneNumber || "No phone number"}</span>
												</div>
											</div>
										</td>

										{/* MEMBERSHIP */}
										<td>
											<span
												className={`fitcore-badge ${getMembershipBadge(
													member.membershipType,
												)}`}
											>
												{member.membershipType || "—"}
											</span>
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

export default TrainerMembers;
