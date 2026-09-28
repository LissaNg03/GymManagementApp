/** @format */

import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ClipboardList, Dumbbell, Target } from "lucide-react";

import api from "../../services/api";

function MemberWorkoutPlans() {
	const { globalSearch = "" } = useOutletContext() || {};

	const [plans, setPlans] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const loadWorkoutPlans = async () => {
			try {
				setLoading(true);
				setError("");

				const response = await api.get("/GymMembers/my/workout-plans");

				setPlans(Array.isArray(response.data) ? response.data : []);
			} catch (error) {
				console.error("Failed to load workout plans:", error);

				setError(
					error.response?.data?.message || "Failed to load your workout plans.",
				);
			} finally {
				setLoading(false);
			}
		};

		loadWorkoutPlans();
	}, []);

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
			${plan.description || ""}
			${plan.trainingProgramme || ""}
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
					<p className="admin-hero-greeting">Gym Member</p>

					<h1>
						My Workout <span>Plans</span>
					</h1>

					<p className="admin-hero-subtitle">
						View the workout plans assigned to you and stay focused on your
						training.
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
					<h2 className="fitcore-page-title">My Workout Plans</h2>

					<div className="fitcore-page-subtitle">
						{loading
							? "Loading workout plans..."
							: `${filteredPlans.length} ${
									filteredPlans.length === 1 ? "workout plan" : "workout plans"
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
							Loading your workout plans...
						</p>
					</div>
				</div>
			) : filteredPlans.length === 0 ? (
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
						<ClipboardList size={27} />
					</div>

					<strong
						style={{
							fontSize: "14px",
							color: "#172033",
						}}
					>
						{globalSearch
							? "No workout plans found"
							: "No workout plans assigned"}
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
							? "No workout plans match your search."
							: "You currently have no workout plans assigned to you."}
					</p>
				</div>
			) : (
				/* =================================================
					WORKOUT PLAN CARDS
				================================================= */

				<div className="row g-4">
					{filteredPlans.map((plan) => (
						<div key={plan.workoutPlanId} className="col-12 col-md-6 col-xl-4">
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
									{/* ICON */}

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
											<Dumbbell size={21} />
										</div>

										<span className="fitcore-badge fitcore-badge-blue">
											Workout Plan
										</span>
									</div>

									{/* PLAN NAME */}

									<h3
										style={{
											fontSize: "17px",
											fontWeight: 700,
											color: "#172033",
											marginBottom: "8px",
										}}
									>
										{plan.planName}
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
										{plan.description ||
											"No description provided for this workout plan."}
									</p>

									{/* DIVIDER */}

									<div
										style={{
											height: "1px",
											background: "#edf0f4",
											marginBottom: "17px",
										}}
									/>

									{/* PROGRAMME */}

									<div
										style={{
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											gap: "15px",
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
											<Target
												size={15}
												style={{
													color: "#0878f9",
												}}
											/>
											Programme
										</div>

										<strong
											style={{
												fontSize: "12px",
												color: "#172033",
												textAlign: "right",
											}}
										>
											{plan.trainingProgramme || "—"}
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

export default MemberWorkoutPlans;
