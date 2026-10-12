
import { useCallback, useEffect, useState } from "react";
import "./App.css";

const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const emptyForm = {
  studentId: "",
  name: "",
  email: "",
  department: "Computer Engineering",
  semester: "1",
  contact: "",
};

export default function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const request = useCallback(async (path, options = {}) => {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || "Request failed.");
    }

    return result;
  }, []);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const result = await request("/api/students");
      setStudents(result.data || []);
      setError("");
    } catch (err) {
      setError(err.message || "Could not load students.");
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        ...form,
        studentId: form.studentId.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        department: form.department.trim(),
        semester: Number(form.semester),
        contact: form.contact.trim(),
      };

      const result = await request(
        editingId ? `/api/students/${editingId}` : "/api/students",
        {
          method: editingId ? "PUT" : "POST",
          body: JSON.stringify(payload),
        }
      );

      setMessage(result.message);
      resetForm();
      await loadStudents();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function editStudent(student) {
    setEditingId(student._id);
    setForm({
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      department: student.department,
      semester: String(student.semester),
      contact: student.contact || "",
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteStudent(student) {
    if (!window.confirm(`Delete ${student.name} (${student.studentId})?`)) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const result = await request(`/api/students/${student._id}`, {
        method: "DELETE",
      });
      setMessage(result.message);

      if (editingId === student._id) resetForm();
      await loadStudents();
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredStudents = students.filter((student) => {
    const query = search.trim().toLowerCase();

    return [
      student.studentId,
      student.name,
      student.email,
      student.department,
    ].some((value) => value?.toLowerCase().includes(query));
  });

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-icon">S</span>
          Student<span>Hub</span>
        </a>
        <span className="topbar-label">INFORMATION MANAGEMENT</span>
      </header>

      <section className="hero">
        <span className="eyebrow">STUDENT ADMINISTRATION</span>
        <h1>Student Information System</h1>
        <p>Manage student records in one simple, connected workspace.</p>
      </section>

      <section className="stats">
        <article className="stat-card">
          <span>Total Students</span>
          <strong>{students.length}</strong>
        </article>
        <article className="stat-card">
          <span>Departments</span>
          <strong>{new Set(students.map((s) => s.department)).size}</strong>
        </article>
        <article className="stat-card">
          <span>Active Semesters</span>
          <strong>{new Set(students.map((s) => s.semester)).size}</strong>
        </article>
      </section>

      {(message || error) && (
        <div className={`notice ${error ? "notice-error" : "notice-success"}`}>
          {error || message}
          <button
            className="notice-close"
            onClick={() => {
              setMessage("");
              setError("");
            }}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      <section className="content-grid">
        <article className="panel form-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">
                {editingId ? "UPDATE RECORD" : "NEW RECORD"}
              </span>
              <h2>{editingId ? "Edit Student" : "Add Student"}</h2>
            </div>
            <span className="heading-icon">＋</span>
          </div>

          <form onSubmit={handleSubmit}>
            <label>
              Student ID *
              <input
                name="studentId"
                value={form.studentId}
                onChange={handleChange}
                placeholder="e.g. ST101"
                required
                maxLength={30}
              />
            </label>

            <label>
              Full Name *
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
                maxLength={100}
              />
            </label>

            <label>
              Email Address *
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="student@example.com"
                required
                maxLength={254}
              />
            </label>

            <label>
              Department *
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                required
              >
                <option>Computer Engineering</option>
                <option>Information Technology</option>
                <option>Computer Science</option>
                <option>Electronics Engineering</option>
                <option>Mechanical Engineering</option>
                <option>Civil Engineering</option>
              </select>
            </label>

            <div className="form-row">
              <label>
                Semester *
                <select
                  name="semester"
                  value={form.semester}
                  onChange={handleChange}
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>
                      Semester {n}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Contact
                <input
                  name="contact"
                  value={form.contact}
                  onChange={handleChange}
                  placeholder="Mobile number"
                  maxLength={20}
                />
              </label>
            </div>

            <div className="form-actions">
              <button className="primary-btn" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Add Student"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </article>

        <article className="panel list-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">DATABASE RECORDS</span>
              <h2>Student Directory</h2>
            </div>
            <span className="count-pill">{students.length} records</span>
          </div>

          <input
            className="search-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search ID, name, email or department..."
            aria-label="Search students"
          />

          {loading ? (
            <p className="empty-state">Loading student records...</p>
          ) : filteredStudents.length === 0 ? (
            <p className="empty-state">
              {students.length
                ? "No matching students found."
                : "No students yet. Add your first record."}
            </p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Department</th>
                    <th>Sem.</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student._id}>
                      <td>
                        <strong>{student.name}</strong>
                        <span className="student-sub">
                          {student.studentId} · {student.email}
                        </span>
                      </td>
                      <td>{student.department}</td>
                      <td>{student.semester}</td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="edit-btn"
                            onClick={() => editStudent(student)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => deleteStudent(student)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button className="refresh-btn" onClick={loadStudents}>
            ↻ Refresh records
          </button>
        </article>
      </section>

      <footer>
        <span>StudentHub · Three-Tier Cloud Architecture</span>
        <span>React · Express · MongoDB Atlas</span>
      </footer>
    </main>
  );
}
