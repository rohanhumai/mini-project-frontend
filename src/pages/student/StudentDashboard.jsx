import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  QrCodeIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/student/dashboard");
      setDashboardData(response.data.data);
    } catch (error) {
      console.error("Error fetching dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Welcome, {user?.name}!
      </h1>
      <p className="text-gray-600 mb-8">
        {dashboardData?.student?.branch?.name} | Semester{" "}
        {dashboardData?.student?.semester} | Section{" "}
        {dashboardData?.student?.section}
      </p>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/student/scan"
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:shadow-lg transition"
        >
          <QrCodeIcon className="h-12 w-12 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Scan QR Code</h3>
          <p className="opacity-90">
            Mark your attendance by scanning the lecture QR code
          </p>
        </Link>

        <Link
          to="/student/attendance"
          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:shadow-lg transition"
        >
          <ClipboardDocumentListIcon className="h-12 w-12 mb-4" />
          <h3 className="text-xl font-semibold mb-2">View Attendance</h3>
          <p className="opacity-90">
            Check your attendance history and statistics
          </p>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h4 className="text-gray-500 text-sm mb-2">Total Lectures</h4>
          <p className="text-3xl font-bold text-gray-800">
            {dashboardData?.stats?.totalLectures || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h4 className="text-gray-500 text-sm mb-2">Attended</h4>
          <p className="text-3xl font-bold text-green-600">
            {dashboardData?.stats?.attended || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h4 className="text-gray-500 text-sm mb-2">Attendance %</h4>
          <p className="text-3xl font-bold text-blue-600">
            {dashboardData?.stats?.percentage || 0}%
          </p>
        </div>
      </div>

      {/* Today's Lectures */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Today's Lectures
        </h2>
        {dashboardData?.todayLectures?.length > 0 ? (
          <div className="space-y-3">
            {dashboardData.todayLectures.map((lecture) => (
              <div
                key={lecture._id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  lecture.attended ? "bg-green-50" : "bg-gray-50"
                }`}
              >
                <div>
                  <h4 className="font-medium text-gray-800">
                    {lecture.subject.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {lecture.startTime} - {lecture.endTime} |{" "}
                    {lecture.teacher?.user?.name}
                  </p>
                </div>
                {lecture.attended ? (
                  <span className="flex items-center text-green-600">
                    <CheckCircleIcon className="h-5 w-5 mr-1" />
                    Attended
                  </span>
                ) : (
                  <span className="flex items-center text-gray-400">
                    <ClockIcon className="h-5 w-5 mr-1" />
                    Pending
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No lectures scheduled for today</p>
        )}
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Attendance
        </h2>
        {dashboardData?.recentAttendance?.length > 0 ? (
          <div className="space-y-3">
            {dashboardData.recentAttendance.map((record) => (
              <div
                key={record._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <h4 className="font-medium text-gray-800">
                    {record.lecture?.subject?.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {new Date(record.markedAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    record.status === "present"
                      ? "bg-green-100 text-green-800"
                      : record.status === "late"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {record.status.charAt(0).toUpperCase() +
                    record.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No attendance records yet</p>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
