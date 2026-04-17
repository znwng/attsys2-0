import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../../styles/teacher/TeacherDash.css';

const AttendanceHistory = () => {
    const { id } = useParams();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [selectedHistorySubject, setSelectedHistorySubject] = useState('');
    const [selectedHistoryDate, setSelectedHistoryDate] = useState('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!id) return;

            try {
                const API_BASE_URL = import.meta.env.VITE_PORT
                    ? `${import.meta.env.VITE_URL}:${import.meta.env.VITE_PORT}`
                    : import.meta.env.VITE_URL;

                const response = await fetch(`${API_BASE_URL}/api/profile/${id}`);
                const data = await response.json();

                if (response.ok) {
                    setCourses(data.courses || []);
                } else {
                    console.error('Profile fetch error:', data.error);
                }
            } catch (error) {
                console.error('Connection error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [id]);

    useEffect(() => {
        const fetchAttendanceHistory = async () => {
            if (!id) return;

            try {
                const API_BASE_URL = import.meta.env.VITE_PORT
                    ? `${import.meta.env.VITE_URL}:${import.meta.env.VITE_PORT}`
                    : import.meta.env.VITE_URL;

                const response = await fetch(`${API_BASE_URL}/api/attendance/history/${id}`);
                const data = await response.json();

                if (response.ok) {
                    setAttendanceHistory(Array.isArray(data) ? data : []);
                } else {
                    console.error('Attendance history fetch error:', data.error);
                }
            } catch (error) {
                console.error('Connection error fetching attendance history:', error);
            } finally {
                setHistoryLoading(false);
            }
        };

        fetchAttendanceHistory();
    }, [id]);

    const historyBySubjectAndDate = attendanceHistory.reduce((acc, record) => {
        const recordDate = new Date(record.date);
        const dateKey = recordDate.toISOString().split('T')[0];
        const timeKey = recordDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
        const subjectKey = record.subject;

        if (!acc[subjectKey]) {
            acc[subjectKey] = {};
        }

        if (!acc[subjectKey][dateKey]) {
            acc[subjectKey][dateKey] = {};
        }

        if (!acc[subjectKey][dateKey][timeKey]) {
            acc[subjectKey][dateKey][timeKey] = [];
        }

        acc[subjectKey][dateKey][timeKey].push(record);
        return acc;
    }, {});

    const historySubjects = courses.map((course) => course.subject);
    const availableDatesForSubject = selectedHistorySubject
        ? Object.keys(historyBySubjectAndDate[selectedHistorySubject] || {}).sort((a, b) =>
              b.localeCompare(a),
          )
        : [];
    const selectedDateRecords =
        historyBySubjectAndDate[selectedHistorySubject]?.[selectedHistoryDate] || {};

    if (loading) {
        return <div className="TeacherDash">Loading Attendance History...</div>;
    }

    return (
        <div className="TeacherDash">
            <div className="dashboard-container">
                <span className="dash-section">Attendance history</span>

                <Link to={`/dash/teacher/${id}`}>
                    <button type="button" className="attendance-btn">
                        Back to Dashboard
                    </button>
                </Link>

                <div className="attendance-history">
                    {historyLoading ? (
                        <p className="muted-text">Loading attendance history...</p>
                    ) : attendanceHistory.length === 0 ? (
                        <p className="muted-text">No attendance records found.</p>
                    ) : (
                        <>
                            <div className="subjects">
                                {historySubjects.map((subject) => {
                                    const hasHistory = Boolean(
                                        historyBySubjectAndDate[subject] &&
                                            Object.keys(historyBySubjectAndDate[subject]).length > 0,
                                    );

                                    return (
                                        <div className="subject" key={`history-${subject}`}>
                                            <h2 className="subject-title">{subject}</h2>
                                            <div className="section-grid">
                                                <button
                                                    type="button"
                                                    className={`attendance-btn ${
                                                        selectedHistorySubject === subject
                                                            ? 'history-active-btn'
                                                            : ''
                                                    }`}
                                                    onClick={() => {
                                                        setSelectedHistorySubject(subject);
                                                        setSelectedHistoryDate('');
                                                    }}
                                                    disabled={!hasHistory}
                                                >
                                                    {hasHistory ? 'Select Subject' : 'No History'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {selectedHistorySubject ? (
                                <div className="history-date-block">
                                    <h3 className="history-date-title">
                                        {selectedHistorySubject} - Choose Date
                                    </h3>
                                    {availableDatesForSubject.length === 0 ? (
                                        <p className="muted-text">
                                            No attendance history for this subject.
                                        </p>
                                    ) : (
                                        <div className="section-grid">
                                            {availableDatesForSubject.map((dateKey) => (
                                                <button
                                                    type="button"
                                                    key={dateKey}
                                                    className={`attendance-btn ${
                                                        selectedHistoryDate === dateKey
                                                            ? 'history-active-btn'
                                                            : ''
                                                    }`}
                                                    onClick={() => setSelectedHistoryDate(dateKey)}
                                                >
                                                    {new Date(
                                                        `${dateKey}T00:00:00`,
                                                    ).toLocaleDateString()}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="muted-text">
                                    Select a subject to view attendance history dates.
                                </p>
                            )}

                            {selectedHistoryDate && (
                                <div className="history-date-block">
                                    <h3 className="history-date-title">
                                        Attendance for{' '}
                                        {new Date(
                                            `${selectedHistoryDate}T00:00:00`,
                                        ).toLocaleDateString()}
                                    </h3>
                                    <div className="history-time-list">
                                        {Object.entries(selectedDateRecords).map(
                                            ([time, records]) => (
                                                <div
                                                    className="history-time-block"
                                                    key={`${selectedHistoryDate}-${time}`}
                                                >
                                                    <h4 className="history-time-title">{time}</h4>
                                                    <div className="history-records">
                                                        {records.map((record) => (
                                                            <div
                                                                className="history-record"
                                                                key={`${record._id}-${record.usn}`}
                                                            >
                                                                <span>{record.studentName}</span>
                                                                <span>{record.usn}</span>
                                                                <span>{record.branch}</span>
                                                                <span>Sec {record.section}</span>
                                                                <span>Sem {record.semester}</span>
                                                                <span>{record.status}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendanceHistory;
