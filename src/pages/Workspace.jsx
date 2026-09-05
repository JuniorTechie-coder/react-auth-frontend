import { useEffect, useState } from "react";

function Workspace({ handleLogout }) {
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);

    // New workspace states
    const [showModal, setShowModal] = useState(false);
    const [workspaceName, setWorkspaceName] = useState("");
    const [workspaceDescription, setWorkspaceDescription] = useState("");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    // GET all workspaces
    async function fetchWorkspaces() {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:3000/api/workspaces",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch workspaces");
            }

            setWorkspaces(data);
        } catch (error) {
            console.error("Error fetching workspaces:", error);
        } finally {
            setLoading(false);
        }
    }

    // POST new workspace
    async function handleCreateWorkspace(e) {
        e.preventDefault();

        if (!workspaceName.trim()) {
            alert("Workspace name is required!");
            return;
        }

        try {
            setCreating(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:3000/api/workspaces",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: workspaceName,
                        description: workspaceDescription,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to create workspace"
                );
            }

            // Add newly created workspace to UI
            setWorkspaces((previousWorkspaces) => [
                ...previousWorkspaces,
                data,
            ]);

            // Clear form
            setWorkspaceName("");
            setWorkspaceDescription("");

            // Close modal
            setShowModal(false);

        } catch (error) {
            console.error("Error creating workspace:", error);
            alert(error.message);
        } finally {
            setCreating(false);
        }
    }

    if (loading) {
        return <p>Loading workspaces...</p>;
    }

    return (
        <div className="workspace-page">

            {/* Header */}
            <div className="section-heading">
                <div>
                    <h1>Your Workspaces</h1>

                    <p
                        className="muted"
                        style={{
                            fontSize: "13px",
                            marginTop: "2px",
                        }}
                    >
                        Select a workspace to view and manage its boards
                    </p>
                </div>

                <div>
                    <button
                        className="primary-btn"
                        onClick={() => setShowModal(true)}
                    >
                        + New Workspace
                    </button>

                    <button onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            {/* Workspace Cards */}
            <div className="tile-grid">

                {workspaces.length === 0 ? (
                    <div className="empty-state">
                        No workspaces yet — create your first one to start
                        adding boards.
                    </div>
                ) : (
                    workspaces.map((workspace, index) => (
                        <div
                            className="tile"
                            key={workspace.id}
                            style={{
                                animationDelay: `${Math.min(
                                    index * 0.05,
                                    0.3
                                )}s`,
                            }}
                        >
                            <div>
                                <h3>{workspace.name}</h3>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginTop: "12px",
                                }}
                            >
                                <span
                                    className="muted"
                                    style={{
                                        fontSize: "13px",
                                        fontWeight: "500",
                                    }}
                                >
                                    📁 Boards
                                </span>

                                <span
                                    style={{
                                        color: "var(--primary)",
                                        fontSize: "13px",
                                        fontWeight: "600",
                                    }}
                                >
                                    Open →
                                </span>
                            </div>
                        </div>
                    ))
                )}

            </div>

            {/* New Workspace Modal */}
            {showModal && (
                <div className="modal-overlay">

                    <div className="modal">

                        <h2>Create Workspace</h2>

                        <form onSubmit={handleCreateWorkspace}>

                            <input
                                type="text"
                                placeholder="Workspace name"
                                value={workspaceName}
                                onChange={(e) =>
                                    setWorkspaceName(e.target.value)
                                }
                            />

                            <textarea
                                placeholder="Workspace description"
                                value={workspaceDescription}
                                onChange={(e) =>
                                    setWorkspaceDescription(e.target.value)
                                }
                            />

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setWorkspaceName("");
                                        setWorkspaceDescription("");
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={creating}
                                >
                                    {creating
                                        ? "Creating..."
                                        : "Create Workspace"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}
        </div>
    );
}

export default Workspace;