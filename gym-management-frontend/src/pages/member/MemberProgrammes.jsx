/** @format */

import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { CalendarDays, Target } from "lucide-react";

import api from "../../services/api";

function MemberProgrammes() {
	const { globalSearch = "" } = useOutletContext() || {};

	const [programmes, setProgrammes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const loadProgrammes = async () => {
			try {
				setLoading(true);
				setError("");

				const response = await api.get("/GymMembers/my/training-programmes");

				setProgrammes(Array.isArray(response.data) ? response.data : []);
			} catch (error) {
				console.error("Failed to load training programmes:", error);

				setError(
					error.response?.data?.message ||
						"Failed to load your training programmes.",
				);
			} finally {
				setLoading(false);
			}
		};

		loadProgrammes();
	}, []);

	/* =====================================================
		GLOBAL SEARCH
	===================================================== */

	const filteredProgrammes = programmes.filter((programme) => {
		const search = globalSearch.trim().toLowerCase();

		if (!search) {
			return true;
		}

		const searchableText = `
				${programme.programmeName || ""}
				${programme.description || ""}
				${programme.duration || ""}
				${programme.fitnessGoal || ""}
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
					<Target size={165} />
				</div>

				<div className="admin-hero-overlay" />

				<div className="admin-hero-content">
					<p className="admin-hero-greeting">Gym Member</p>

					<h1>
						My Training <span>Programme</span>
					</h1>

					<p className="admin-hero-subtitle">
						View the training programmes assigned to you and keep track of your
						fitness goals.
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
					<h2 className="fitcore-page-title">My Training Programmes</h2>

					<div className="fitcore-page-subtitle">
						{loading
							? "Loading programmes..."
							: `${filteredProgrammes.length} ${
									filteredProgrammes.length === 1 ? "programme" : "programmes"
								} assigned`}
					</div>
				</div>
			</div>

			{/* =====================================================
				LOADING
			===================================================== */}

			{loading ? (
				<div
					className="fitcore-card"
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
							Loading your training programmes...
						</p>
					</div>
				</div>
			) : filteredProgrammes.length === 0 ? (
				/* =================================================
					EMPTY STATE
				================================================= */

				<div
					className="fitcore-card"
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
						<Target size={27} />
					</div>

					<strong
						style={{
							fontSize: "14px",
							color: "#172033",
						}}
					>
						{globalSearch ? "No programmes found" : "No programmes assigned"}
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
							? "No training programmes match your search."
							: "You currently have no training programmes assigned to you."}
					</p>
				</div>
			) : (
				/* =================================================
					PROGRAMME CARDS
				================================================= */

				<div className="row g-4">
					{filteredProgrammes.map((programme) => (
						<div
							key={programme.trainingProgrammeId}
							className="col-12 col-md-6 col-xl-4"
						>
							<div
								className="fitcore-card h-100"
								style={{
									overflow: "hidden",
								}}
							>
								{/* BLUE ACCENT */}

								<div
									style={{
										height: "4px",
										background: "#0878f9",
									}}
								/>

								<div
									style={{
										padding: "22px",
									}}
								>
									{/* ICON + GOAL */}

									<div
										style={{
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											gap: "12px",
											marginBottom: "18px",
										}}
									>
										<div
											className="fitcore-icon-box"
											style={{
												width: "46px",
												height: "46px",
												borderRadius: "11px",
												background: "#e7f1ff",
												color: "#0878f9",
											}}
										>
											<Target size={21} />
										</div>

										<span className="fitcore-badge fitcore-badge-blue">
											{programme.fitnessGoal || "General Fitness"}
										</span>
									</div>

									{/* NAME */}

									<h3
										style={{
											fontSize: "17px",
											fontWeight: 700,
											color: "#172033",
											marginBottom: "8px",
										}}
									>
										{programme.programmeName}
									</h3>

									{/* DESCRIPTION */}

									<p
										style={{
											fontSize: "12px",
											lineHeight: 1.7,
											color: "#7b8798",
											marginBottom: "20px",
											minHeight: "61px",
										}}
									>
										{programme.description ||
											"No description available for this training programme."}
									</p>

									{/* DIVIDER */}

									<div
										style={{
											height: "1px",
											background: "#edf0f4",
											marginBottom: "17px",
										}}
									/>

									{/* DURATION */}

									<div
										style={{
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
										}}
									>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												gap: "8px",
												color: "#7b8798",
												fontSize: "12px",
											}}
										>
											<CalendarDays
												size={15}
												style={{
													color: "#0878f9",
												}}
											/>
											Duration
										</div>

										<strong
											style={{
												fontSize: "12px",
												color: "#172033",
											}}
										>
											{programme.duration}{" "}
											{programme.duration === 1 ? "week" : "weeks"}
										</strong>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default MemberProgrammes;
