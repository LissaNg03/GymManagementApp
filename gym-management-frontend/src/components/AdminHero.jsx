/** @format */

import { useAuth } from "../context/AuthContext";
import gymHero from "/assets/gym-login.png";

function AdminHero({ title, subtitle }) {
	const { user } = useAuth();

	return (
		<section className="admin-hero">
			{/* HERO BACKGROUND IMAGE */}
			<img src={gymHero} alt="" className="admin-hero-image" />

			{/* DARK GRADIENT OVER IMAGE */}
			<div className="admin-hero-overlay" />

			{/* HERO TEXT */}
			<div className="admin-hero-content">
				<p className="admin-hero-greeting">Welcome, {user?.name || "Admin"}</p>

				<h1>
					{title || (
						<>
							Welcome to <span>FitCore</span>
						</>
					)}
				</h1>

				<p className="admin-hero-subtitle">
					{subtitle ||
						"Manage your gym members, trainers, programmes and more — all in one place."}
				</p>
			</div>
		</section>
	);
}

export default AdminHero;
