/** @format */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Activity,
	BarChart3,
	Dumbbell,
	Eye,
	EyeOff,
	LockKeyhole,
	Mail,
	ShieldCheck,
	Target,
	UserRound,
	UsersRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function Login() {
	const navigate = useNavigate();
	const { login } = useAuth();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [rememberMe, setRememberMe] = useState(true);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [selectedRole, setSelectedRole] = useState("GymMember");

	const handleSubmit = async (event) => {
		event.preventDefault();

		try {
			setLoading(true);
			setError("");

			const data = await login(email, password);

			const role = data.user.roles[0];

			if (role === "Admin") {
				navigate("/admin");
			} else if (role === "PersonalTrainer") {
				navigate("/trainer");
			} else if (role === "GymMember") {
				navigate("/member");
			}
		} catch (error) {
			console.error(error);

			setError(error.response?.data?.message || "Invalid email or password.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fitcore-login-page">
			{/* LEFT SIDE */}
			<section className="login-showcase">
				<div className="login-overlay" />

				<div className="showcase-content">
					<div className="showcase-brand">
						<div className="brand-main">
							<Dumbbell className="brand-icon" />

							<span>
								Fit<span>Core</span>
							</span>
						</div>

						<div className="brand-subtitle">GYM MANAGEMENT SYSTEM</div>
					</div>

					<div className="showcase-message">
						<h1>
							Stronger
							<br />
							<span>Together</span>
						</h1>

						<p>
							Your goals. Our support.
							<br />A healthier you.
						</p>
					</div>

					<div className="showcase-features">
						<div className="showcase-feature">
							<BarChart3 />

							<strong>Track Progress</strong>

							<span>
								Stay accountable
								<br />
								and motivated
							</span>
						</div>

						<div className="showcase-feature">
							<UserRound />

							<strong>Expert Guidance</strong>

							<span>
								Professional trainers
								<br />
								at your side
							</span>
						</div>

						<div className="showcase-feature">
							<Target />

							<strong>Better Results</strong>

							<span>
								Build a stronger,
								<br />
								healthier you
							</span>
						</div>
					</div>
				</div>
			</section>

			{/* RIGHT SIDE */}
			<section className="login-panel">
				<div className="login-card">
					<div className="login-card-brand">
						<Dumbbell />

						<h2>
							Fit<span>Core</span>
						</h2>

						<p>GYM MANAGEMENT SYSTEM</p>
					</div>

					<div className="login-heading">
						<h1>Welcome Back</h1>
						<p>Sign in to your account</p>
					</div>

					{error && <div className="login-error">{error}</div>}

					<form onSubmit={handleSubmit}>
						<div className="login-input-group">
							<Mail size={20} className="login-input-icon" />

							<input
								type="email"
								placeholder="Email or Username"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								required
							/>
						</div>

						<div className="login-input-group">
							<LockKeyhole size={20} className="login-input-icon" />

							<input
								type={showPassword ? "text" : "password"}
								placeholder="Password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								required
							/>

							<button
								type="button"
								className="password-toggle"
								onClick={() => setShowPassword(!showPassword)}
							>
								{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
							</button>
						</div>

						<div className="login-options">
							<label className="remember-option">
								<input
									type="checkbox"
									checked={rememberMe}
									onChange={(event) => setRememberMe(event.target.checked)}
								/>

								<span>Remember me</span>
							</label>

							<button type="button" className="forgot-password">
								Forgot Password?
							</button>
						</div>

						<button type="submit" className="login-button" disabled={loading}>
							{loading ? "Signing in..." : "Login"}
						</button>
					</form>

					<div className="login-divider">
						<span />
						<p>or</p>
						<span />
					</div>

					<div className="role-preview">
						<div
							className={`role-preview-card ${
								selectedRole === "GymMember" ? "active" : ""
							}`}
							onClick={() => setSelectedRole("GymMember")}
						>
							<UserRound size={24} />

							<span>Gym Member</span>
						</div>

						<div
							className={`role-preview-card ${
								selectedRole === "PersonalTrainer" ? "active" : ""
							}`}
							onClick={() => setSelectedRole("PersonalTrainer")}
						>
							<UsersRound size={24} />

							<span>Personal Trainer</span>
						</div>

						<div
							className={`role-preview-card ${
								selectedRole === "Admin" ? "active" : ""
							}`}
							onClick={() => setSelectedRole("Admin")}
						>
							<ShieldCheck size={24} />

							<span>Administrator</span>
						</div>
					</div>

					<p className="login-contact">
						Don't have an account? Contact your administrator.
					</p>
				</div>
			</section>
		</div>
	);
}

export default Login;
