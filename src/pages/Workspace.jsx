import { useEffect, useState } from "react";

function Workspace({ handleLogout }) {
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWorkspaces();
    }, []);

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
                            marginTop: "2px"
                        }}
                    >
                        Select a workspace to view and manage its boards
                    </p>
                </div>

                <div>
                    <button
                        className="primary-btn"
                        onClick={() => console.log("New workspace")}
                    >
                        + New Workspace
                    </button>

                    <button onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            {/* Workspace Grid */}
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
        </div>
    );
}

export default Workspace;