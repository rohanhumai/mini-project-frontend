import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/common/PrivateRoute";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageBranches from "./pages/admin/ManageBranches";
import AttendanceReports from "./pages/admin/AttendanceReports";

// Teacher Pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import GenerateQR from "./pages/teacher/GenerateQR";
import ViewAttendance from "./pages/teacher/ViewAttendance";
import LectureHistory from "./pages/teacher/LectureHistory";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import ScanQR from "./pages/student/ScanQR";
import AttendanceHistory from "./pages/student/AttendanceHistory";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Toaster position="top-right" />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={<PrivateRoute allowedRoles={["admin"]} />}
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="branches" element={<ManageBranches />} />
              <Route path="reports" element={<AttendanceReports />} />
            </Route>

            {/* Teacher Routes */}
            <Route
              path="/teacher"
              element={<PrivateRoute allowedRoles={["teacher"]} />}
            >
              <Route index element={<TeacherDashboard />} />
              <Route path="generate-qr" element={<GenerateQR />} />
              <Route path="lectures" element={<LectureHistory />} />
              <Route
                path="lectures/:lectureId/attendance"
                element={<ViewAttendance />}
              />
            </Route>

            {/* Student Routes */}
            <Route
              path="/student"
              element={<PrivateRoute allowedRoles={["student"]} />}
            >
              <Route index element={<StudentDashboard />} />
              <Route path="scan" element={<ScanQR />} />
              <Route path="attendance" element={<AttendanceHistory />} />
            </Route>

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
