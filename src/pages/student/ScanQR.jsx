import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import api from "../../services/api";
import toast from "react-hot-toast";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

const ScanQR = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    setScanning(true);
    setResult(null);
    setError(null);

    try {
      scannerRef.current = new Html5Qrcode("reader");

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        onScanError,
      );
    } catch (err) {
      setError("Failed to start camera. Please allow camera access.");
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText) => {
    await stopScanning();

    try {
      const response = await api.post("/student/scan-attendance", {
        qrData: decodedText,
        location: null,
        deviceInfo: navigator.userAgent,
      });

      setResult({
        success: true,
        message: response.data.message,
        data: response.data.data,
      });
      toast.success(response.data.message);
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.message || "Failed to mark attendance",
      });
      toast.error(error.response?.data?.message || "Failed to mark attendance");
    }
  };

  const onScanError = (error) => {
    // Ignore scanning errors
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Scan Attendance QR
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Scanner Area */}
        <div
          id="reader"
          className={`w-full rounded-lg overflow-hidden ${
            scanning ? "block" : "hidden"
          }`}
          style={{ minHeight: "300px" }}
        ></div>

        {/* Start/Stop Button */}
        {!result && (
          <div className="text-center">
            {!scanning ? (
              <>
                <div className="mb-6 p-8 bg-gray-50 rounded-lg">
                  <svg
                    className="w-24 h-24 mx-auto text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h2m14 0h2M6 20h2M6 4h2M4 4v16h16V4H4z"
                    />
                  </svg>
                  <p className="text-gray-500">
                    Point your camera at the QR code displayed by your teacher
                  </p>
                </div>
                <button
                  onClick={startScanning}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                >
                  Start Scanning
                </button>
              </>
            ) : (
              <button
                onClick={stopScanning}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition mt-4"
              >
                Stop Scanning
              </button>
            )}
          </div>
        )}

        {/* Result */}
        {result && (
          <div
            className={`text-center p-6 rounded-lg ${
              result.success ? "bg-green-50" : "bg-red-50"
            }`}
          >
            {result.success ? (
              <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500 mb-4" />
            ) : (
              <XCircleIcon className="w-16 h-16 mx-auto text-red-500 mb-4" />
            )}

            <h3
              className={`text-xl font-semibold mb-2 ${
                result.success ? "text-green-800" : "text-red-800"
              }`}
            >
              {result.success ? "Attendance Marked!" : "Failed"}
            </h3>

            <p
              className={`mb-4 ${
                result.success ? "text-green-600" : "text-red-600"
              }`}
            >
              {result.message}
            </p>

            {result.success && result.data && (
              <div className="text-left bg-white rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Subject:</span>{" "}
                  {result.data.lecture.subject.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(result.data.lecture.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Time:</span>{" "}
                  {result.data.lecture.time}
                </p>
              </div>
            )}

            <button
              onClick={() => {
                setResult(null);
                setError(null);
              }}
              className="mt-6 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
            >
              Scan Another
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg text-red-600 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanQR;
