import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const GenerateQR = () => {
  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    branchId: '',
    subjectCode: '',
    subjectName: '',
    semester: 1,
    section: 'A',
    startTime: '',
    endTime: '',
    validMinutes: 60
  });

  useEffect(() => {
    fetchAssignedData();
  }, []);

  const fetchAssignedData = async () => {
    try {
      const response = await api.get('/teacher/assigned');
      setBranches(response.data.data.branches);
    } catch (error) {
      toast.error('Failed to fetch assigned branches');
    }
  };

  const handleBranchChange = (e) => {
    const branchId = e.target.value;
    const branch = branches.find((b) => b._id === branchId);
    setFormData({ ...formData, branchId });
    setSubjects(branch?.subjects || []);
  };

  const handleSubjectChange = (e) => {
    const subjectCode = e.target.value;
    const subject = subjects.find((s) => s.code === subjectCode);
    setFormData({
      ...formData,
      subjectCode,
      subjectName: subject?.name || ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/teacher/lectures/generate-qr', formData);
      setQrData(response.data.data);
      toast.success('QR Code generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate QR');
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.download = `QR_${formData.subjectCode}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Generate Lecture QR Code</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch
              </label>
              <select
                required
                value={formData.branchId}
                onChange={handleBranchChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name} ({branch.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                required
                value={formData.subjectCode}
                onChange={handleSubjectChange}
                disabled={!formData.branchId}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject.code} value={subject.code}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) =>
                    setFormData({ ...formData, semester: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <select
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {['A', 'B', 'C', 'D'].map((sec) => (
                    <option key={sec} value={sec}>
                      Section {sec}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                QR Valid Duration (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="180"
                value={formData.validMinutes}
                onChange={(e) =>
                  setFormData({ ...formData, validMinutes: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate QR Code'}
            </button>
          </form>
        </div>

        {/* QR Code Display */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Generated QR Code</h2>

          {qrData ? (
            <div className="text-center">
              <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg mb-4">
                <QRCodeSVG
                  id="qr-code"
                  value={qrData.lecture.qrCodeData}
                  size={250}
                  level="H"
                  includeMargin
                />
              </div>

              <div className="text-left space-y-2 mb-4">
                <p className="text-sm">
                  <span className="font-medium">Subject:</span>{' '}
                  {qrData.lecture.subject.name}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Time:</span>{' '}
                  {qrData.lecture.startTime} - {qrData.lecture.endTime}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Expires:</span>{' '}
                  {new Date(qrData.expiresAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={downloadQR}
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
              >
                Download QR Code
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
              <p className="text-gray-500">QR code will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateQR;