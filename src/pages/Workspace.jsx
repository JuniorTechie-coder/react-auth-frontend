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
                "https://trello-backend-1dsq.onrender.com/api/workspaces",
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
                "https://trello-backend-1dsq.onrender.com/api/workspaces",
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
        return (
            <div className="workspace-page">
                <div className="section-heading">
                    <div>
                        <h1>Your Workspaces</h1>
                        <p className="muted" style={{ fontSize: "13px", marginTop: "2px" }}>
                            Select a workspace to view and manage its boards
                        </p>
                    </div>
                </div>
                <div className="tile-grid">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="tile ws-skeleton">
                            <div className="ws-skeleton-line ws-skeleton-title"></div>
                            <div className="ws-skeleton-line ws-skeleton-sub"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
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

                    <button className="ghost-btn" onClick={handleLogout}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Logout
                    </button>
                </div>
            </div>

            {/* Workspace Cards */}
            <div className="tile-grid">

                {workspaces.length === 0 ? (
                    <div className="empty-state ws-empty-state">
                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: "16px", opacity: 0.45 }}>
                            <rect x="4" y="16" width="56" height="40" rx="6" fill="#0052cc" fillOpacity="0.12" stroke="#0052cc" strokeWidth="2" strokeOpacity="0.3"/>
                            <rect x="4" y="16" width="56" height="10" rx="4" fill="#0052cc" fillOpacity="0.18"/>
                            <rect x="14" y="34" width="16" height="14" rx="3" fill="#ec4899" fillOpacity="0.35"/>
                            <rect x="34" y="34" width="16" height="9" rx="3" fill="#a855f7" fillOpacity="0.35"/>
                            <circle cx="52" cy="12" r="8" fill="#0052cc" fillOpacity="0.15" stroke="#0052cc" strokeWidth="2" strokeOpacity="0.4"/>
                            <line x1="52" y1="8" x2="52" y2="16" stroke="#0052cc" strokeWidth="2" strokeOpacity="0.6" strokeLinecap="round"/>
                            <line x1="48" y1="12" x2="56" y2="12" stroke="#0052cc" strokeWidth="2" strokeOpacity="0.6" strokeLinecap="round"/>
                        </svg>
                        <p style={{ fontWeight: "700", fontSize: "16px", color: "var(--text-primary)", marginBottom: "6px" }}>
                            No workspaces yet
                        </p>
                        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
                            Create your first workspace to start organizing boards and collaborating with your team.
                        </p>
                        <button className="primary-btn" onClick={() => setShowModal(true)}>
                            + Create your first workspace
                        </button>
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
                                cursor: "pointer",
                            }}
                            onClick={() => {
                                window.location.href = `/boards/${workspace.id}`;
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