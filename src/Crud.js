import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Crud() {
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", age: "", email: "" });
  const [data, setData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [jwttoken, setJwttoken] = useState("");

  // Fetch users function moved to outer scope so it can be reused.
  const fetchUsers = async () => {
    try {
      const response = await fetch(
        "https://localhost:7042/api/Crud/getAllUsers"
      );
      if (response.ok) {
        const users = await response.json();
        setData(users);
      } else {
        toast.error("Failed to fetch users.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching users.");
    }
  };

  // Fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form input change
  const handleInputChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  // Add or update user via API call
  const handleAddUser = async () => {
    if (newUser.name && newUser.age && newUser.email) {
      try {
        let response;
        if (isEditing) {
          response = await fetch(
            `https://localhost:7042/api/Crud/updateUser/${editingUserId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newUser),
            }
          );
        } else {
          response = await fetch("https://localhost:7042/api/Crud/addUser", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser),
          });
        }

        if (response.ok) {
          toast.success(
            isEditing
              ? "User updated successfully!"
              : "User added successfully!"
          );
          fetchUsers(); // Refresh the users list
        } else {
          const errorText = await response.text();
          console.error(
            "Server responded with error:",
            response.status,
            errorText
          );
          toast.error("Failed to save user. Please try again.");
        }
      } catch (error) {
        console.error("Error during fetch:", error);
        toast.error("An error occurred while saving the user.");
      }

      // Reset form and close modal
      setNewUser({ name: "", age: "", email: "" });
      setShowModal(false);
      setIsEditing(false);
      setEditingUserId(null);
    }
  };

  // Edit user
  const handleEdit = (id) => {
    const userToEdit = data.find((user) => user.id === id);
    setNewUser({
      name: userToEdit.name,
      age: userToEdit.age,
      email: userToEdit.email,
    });
    setEditingUserId(id);
    setIsEditing(true);
    setShowModal(true);
  };

  // Delete user via API call
  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `https://localhost:7042/api/Crud/deleteUser/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setData(data.filter((user) => user.id !== id));
        toast.success("User deleted successfully!");
      } else {
        toast.error("Failed to delete user.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the user.");
    }
  };
  const handleGenerateToken = async (id) => {
    try {
      const response = await fetch(
        `https://localhost:7042/api/Crud/getJwtToken/${id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
  
      if (response.ok) {
        const data = await response.json(); // Correctly extract JSON data
        setJwttoken(data.token); // Store the token in state
        setShowTokenModal(true); // Show modal after setting token
      } else {
        toast.error("Failed to generate token.");
      }
    } catch (error) {
      toast.error("An error occurred while generating the token.");
    }
  };
  

  const copyToClipboard = () => {
    const textarea = document.getElementById("jwtTokenTextArea");
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(jwttoken);
    //toast.success("Token copied to clipboard!");
  };
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="container" style={{ width: "2500px", marginBottom: "30px" }}>
        <div className="row justify-content-center">
          <div className="col-md-12">
            <div className="card shadow-lg p-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="mb-0">
                    <i className="fa fa-users me-2"></i> User Management
                  </h3>

                  <button
                    className="btn btn-success"
                    onClick={() => setShowModal(true)}
                  >
                    + Add User
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="table table-bordered table-striped text-center">
                    <thead className="table-dark">
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Email</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>{item.name}</td>
                          <td>{item.age}</td>
                          <td>{item.email}</td>
                          <td>
                            <button
                              className="btn btn-info btn-sm ms-2"
                              onClick={() => handleGenerateToken(item.id)}
                            >
                              <i className="fa fa-key"></i>
                            </button>

                            <button
                              className="btn btn-primary btn-sm ms-2"
                              onClick={() => handleEdit(item.id)}
                            >
                              <i className="fa fa-edit"></i>
                            </button>

                            <button
                              className="btn btn-danger btn-sm ms-2"
                              onClick={() => handleDelete(item.id)}
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isEditing ? "Edit User" : "Add New User"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={newUser.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Age</label>
                    <input
                      type="number"
                      className="form-control"
                      name="age"
                      value={newUser.age}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={newUser.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddUser}
                >
                  {isEditing ? "Update User" : "Add User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Token Modal */}
{showTokenModal && (
  <div className="modal show d-block" tabIndex="-1" role="dialog">
    <div className="modal-dialog modal-lg"> {/* Small modal size */}
      <div className="modal-content">
        <div className="modal-body p-3">
          {/* Close button aligned right */}
          <div className="d-flex justify-content-between mb-3">
          <i
              className="fa fa-copy text-primary"
              style={{ cursor: "pointer", fontSize: "1.5rem" }}
              onClick={copyToClipboard}
              title="Copy Token"
            ></i>
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowTokenModal(false)}
            ></button>
                      </div>     

          {/* Token Display Section */}
          <div className="d-flex align-items-center border p-2 rounded">
            <textarea
              id="jwtTokenTextArea"
              className="form-control border-0 bg-light"
              rows="3"
              value={jwttoken}
              readOnly
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default Crud;
