import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    user_name: "",
    father_name: "",
    mother_name: "",
    email: "",
    date_of_birth: "",
    gender: "",
    status: "Active",
  });

  const [users, setUsers] = useState([]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  // Stores the ID of the user currently being edited
  const [editingUserId, setEditingUserId] = useState(null);

  // Stores the ID of the user currently being deleted
  const [deletingUserId, setDeletingUserId] = useState(null);


  // -----------------------------
  // Handle input changes
  // -----------------------------
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setMessage("");
    setError("");
  };


  // -----------------------------
  // Get all users
  // -----------------------------
  const fetchUsers = async () => {
    setUsersLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/users"
      );

      const data = await response.json();

      if (response.ok) {
        setUsers(data.data);
      } else {
        setError(
          data.detail || "Unable to load users"
        );
      }

    } catch (error) {
      console.error(error);

      setError(
        "Unable to connect to the backend server."
      );

    } finally {
      setUsersLoading(false);
    }
  };


  // Load users when page opens
  useEffect(() => {
    fetchUsers();
  }, []);


  // -----------------------------
  // Edit user
  // -----------------------------
  const handleEdit = (user) => {

    setEditingUserId(user.id);

    setFormData({
      user_name: user.user_name,
      father_name: user.father_name,
      mother_name: user.mother_name,
      email: user.email,
      date_of_birth: user.date_of_birth,
      gender: user.gender,
      status: user.status,
    });

    setMessage("");
    setError("");

    // Scroll to registration form
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  // -----------------------------
  // Cancel edit
  // -----------------------------
  const handleCancelEdit = () => {

    setEditingUserId(null);

    setFormData({
      user_name: "",
      father_name: "",
      mother_name: "",
      email: "",
      date_of_birth: "",
      gender: "",
      status: "Active",
    });

    setMessage("");
    setError("");
  };


  // -----------------------------
  // Register / Update user
  // -----------------------------
  const handleSubmit = async (event) => {

    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {

      let url = "http://127.0.0.1:8000/users";
      let method = "POST";

      // If editingUserId exists,
      // update the existing user
      if (editingUserId !== null) {

        url = `http://127.0.0.1:8000/users/${editingUserId}`;

        method = "PUT";
      }

      const response = await fetch(url, {

        method: method,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(formData),

      });

      const data = await response.json();


      if (response.ok) {

        setMessage(data.message);

        // Clear edit mode
        setEditingUserId(null);

        // Clear form
        setFormData({
          user_name: "",
          father_name: "",
          mother_name: "",
          email: "",
          date_of_birth: "",
          gender: "",
          status: "Active",
        });

        // Reload table
        fetchUsers();

      } else {

        if (Array.isArray(data.detail)) {

          const errorMessages = data.detail
            .map((item) => item.msg)
            .join(", ");

          setError(errorMessages);

        } else {

          setError(
            data.detail || "Operation failed"
          );
        }
      }

    } catch (error) {

      console.error(error);

      setError(
        "Unable to connect to the backend server."
      );

    } finally {

      setLoading(false);
    }
  };


  // -----------------------------
  // Delete user
  // -----------------------------
  const handleDelete = async (userId) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) {
      return;
    }

    setMessage("");
    setError("");

    setDeletingUserId(userId);

    try {

      const response = await fetch(
        `http://127.0.0.1:8000/users/${userId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();


      if (response.ok) {

        setMessage(data.message);

        // Reload users
        fetchUsers();

      } else {

        setError(
          data.detail || "Unable to delete user"
        );
      }

    } catch (error) {

      console.error(error);

      setError(
        "Unable to connect to the backend server."
      );

    } finally {

      setDeletingUserId(null);
    }
  };


  return (
    <div className="page">

      {/* ========================= */}
      {/* Registration Form */}
      {/* ========================= */}

      <div className="container">

        <h1>
          {editingUserId !== null
            ? "Edit User"
            : "User Registration"}
        </h1>


        <form onSubmit={handleSubmit}>

          <label>User Name</label>

          <input
            type="text"
            name="user_name"
            value={formData.user_name}
            onChange={handleChange}
            placeholder="Enter user name"
            required
          />


          <label>Father Name</label>

          <input
            type="text"
            name="father_name"
            value={formData.father_name}
            onChange={handleChange}
            placeholder="Enter father name"
            required
          />


          <label>Mother Name</label>

          <input
            type="text"
            name="mother_name"
            value={formData.mother_name}
            onChange={handleChange}
            placeholder="Enter mother name"
            required
          />


          <label>Email</label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
            required
          />


          <label>Date of Birth</label>

          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            required
          />


          <label>Gender</label>

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >

            <option value="">
              Select Gender
            </option>

            <option value="Male">
              Male
            </option>

            <option value="Female">
              Female
            </option>

            <option value="Other">
              Other
            </option>

          </select>


          <label>Status</label>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>

          </select>


          <button
            type="submit"
            disabled={loading}
          >

            {loading
              ? "Please wait..."
              : editingUserId !== null
              ? "Update User"
              : "Register"}

          </button>


          {/* Cancel Edit button */}

          {editingUserId !== null && (

            <button
              type="button"
              className="cancel-button"
              onClick={handleCancelEdit}
            >
              Cancel Edit
            </button>

          )}

        </form>


        {/* Success message */}

        {message && (

          <div className="success">
            ✓ {message}
          </div>

        )}


        {/* Error message */}

        {error && (

          <div className="error">
            ✕ {error}
          </div>

        )}

      </div>


      {/* ========================= */}
      {/* Users Table */}
      {/* ========================= */}

      <div className="users-container">

        <div className="users-header">

          <h2>
            Registered Users
          </h2>


          <button
            className="refresh-button"
            onClick={fetchUsers}
            disabled={usersLoading}
          >

            {usersLoading
              ? "Loading..."
              : "Refresh"}

          </button>

        </div>


        {usersLoading ? (

          <p className="table-message">
            Loading users...
          </p>

        ) : users.length === 0 ? (

          <p className="table-message">
            No users registered yet.
          </p>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>ID</th>

                  <th>User Name</th>

                  <th>Father Name</th>

                  <th>Mother Name</th>

                  <th>Email</th>

                  <th>Date of Birth</th>

                  <th>Gender</th>

                  <th>Status</th>

                  <th>Actions</th>

                </tr>

              </thead>


              <tbody>

                {users.map((user) => (

                  <tr key={user.id}>

                    <td>
                      {user.id}
                    </td>

                    <td>
                      {user.user_name}
                    </td>

                    <td>
                      {user.father_name}
                    </td>

                    <td>
                      {user.mother_name}
                    </td>

                    <td>
                      {user.email}
                    </td>

                    <td>
                      {user.date_of_birth}
                    </td>

                    <td>
                      {user.gender}
                    </td>

                    <td>

                      <span
                        className={
                          user.status === "Active"
                            ? "status-active"
                            : "status-inactive"
                        }
                      >

                        {user.status}

                      </span>

                    </td>


                    {/* Actions */}

                    <td>

                      <div className="action-buttons">

                        <button
                          className="edit-button"
                          onClick={() =>
                            handleEdit(user)
                          }
                        >
                          Edit
                        </button>


                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(user.id)
                          }
                          disabled={
                            deletingUserId === user.id
                          }
                        >

                          {deletingUserId === user.id
                            ? "Deleting..."
                            : "Delete"}

                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default App;
