/** @format */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import Members from "./pages/admin/Members";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PersonalTrainers from "./pages/admin/PersonalTrainers";
import TrainingProgrammes from "./pages/admin/TrainingProgrammes";
import WorkoutPlans from "./pages/admin/WorkoutPlans";
import TrainerLayout from "./components/TrainerLayout";

import MemberLayout from "./components/MemberLayout";
import MemberDashboard from "./pages/member/MemberDashboard";
import MemberProgrammes from "./pages/member/MemberProgrammes";
import MemberWorkoutPlans from "./pages/member/MemberWorkoutPlans";
import MemberWorkoutTasks from "./pages/member/MemberWorkoutTasks";

import TrainerDashboard from "./pages/trainer/TrainerDashboard";
import TrainerMembers from "./pages/trainer/TrainerMembers";
import TrainerProgrammes from "./pages/trainer/TrainerProgrammes";
import TrainerWorkoutPlans from "./pages/trainer/TrainerWorkoutPlans";
import TrainerWorkoutTasks from "./pages/trainer/TrainerWorkoutTasks";
function App() {
	return (
		<BrowserRouter>
			<Routes>
				{/* Public */}
				<Route path="/login" element={<Login />} />

				{/* Admin */}
				<Route
					path="/admin"
					element={
						<ProtectedRoute allowedRoles={["Admin"]}>
							<AdminLayout />
						</ProtectedRoute>
					}
				>
					<Route index element={<AdminDashboard />} />

					<Route path="members" element={<Members />} />

					<Route path="trainers" element={<PersonalTrainers />} />

					<Route path="programmes" element={<TrainingProgrammes />} />

					<Route path="workout-plans" element={<WorkoutPlans />} />
				</Route>

				{/* Future Trainer */}
				<Route
					path="/trainer"
					element={
						<ProtectedRoute allowedRoles={["PersonalTrainer"]}>
							{" "}
							<TrainerLayout />
						</ProtectedRoute>
					}
				>
					<Route index element={<TrainerDashboard />} />{" "}
					<Route path="members" element={<TrainerMembers />} />
					<Route path="programmes" element={<TrainerProgrammes />} />{" "}
					<Route path="workout-plans" element={<TrainerWorkoutPlans />} />
					<Route path="workout-tasks" element={<TrainerWorkoutTasks />} />
				</Route>

				{/* Future Member */}
				<Route
					path="/member"
					element={
						<ProtectedRoute allowedRoles={["GymMember"]}>
							<MemberLayout />
						</ProtectedRoute>
					}
				>
					<Route index element={<MemberDashboard />} />

					<Route path="programmes" element={<MemberProgrammes />} />

					<Route path="workout-plans" element={<MemberWorkoutPlans />} />

					<Route path="workout-tasks" element={<MemberWorkoutTasks />} />
				</Route>

				{/* Unknown route */}
				<Route path="*" element={<Navigate to="/login" replace />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
