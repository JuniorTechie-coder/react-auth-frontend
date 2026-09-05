import { useEffect, useState } from "react";

function Board() {
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);

    // Add Board modal states
    const [showModal, setShowModal] = useState(false);
    const [boardName, setBoardName] = useState("");
    const [background, setBackground] = useState("");
    const [creating, setCreating] = useState(false);

    // Get workspace ID from URL
    const workspaceId = window.location.pathname.split("/")[2];

    useEffect(() => {
        fetchBoards();
    }, []);

    // GET boards of workspace
    async function fetchBoards() {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:3000/api/boards/workspace/${workspaceId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to fetch boards"
                );
            }

            setBoards(data);

        } catch (error) {
            console.error("Error fetching boards:", error);
        } finally {
            setLoading(false);
        }
    }

    // POST new board
    async function handleCreateBoard(e) {
        e.preventDefault();

        if (!boardName.trim()) {
            alert("Board name is required!");
            return;
        }

        if (!background.trim()) {
            alert("Background is required!");
            return;
        }

        try {
            setCreating(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:3000/api/boards",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: boardName,
                        background: background,
                        workspace_id: Number(workspaceId),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to create board"
                );
            }

            // Add new board immediately to UI
            setBoards((previousBoards) => [
                ...previousBoards,
                data,
            ]);

            // Clear form
            setBoardName("");
            setBackground("");

            // Close modal
            setShowModal(false);

        } catch (error) {
            console.error("Error creating board:", error);
            alert(error.message);
        } finally {
            setCreating(false);
        }
    }

    if (loading) {
        return <p>Loading boards...</p>;
    }

    return (
        <div className="workspace-page">

            {/* Header */}
            <div className="section-heading">

                <div>
                    <h1>Boards</h1>

                    <p
                        className="muted"
                        style={{
                            fontSize: "13px",
                            marginTop: "2px",
                        }}
                    >
                        Select a board to view and manage lists
                    </p>
                </div>

                <div>
                    <button
                        className="primary-btn"
                        onClick={() => setShowModal(true)}
                    >
                        + Add Board
                    </button>

                    <button
                        onClick={() => {
                            window.location.href = "/";
                        }}
                    >
                        ← Back
                    </button>
                </div>

            </div>

            {/* Board Grid */}
            <div className="tile-grid">

                {boards.length === 0 ? (

                    <div className="empty-state">
                        No boards yet — create your first board.
                    </div>

                ) : (

                    boards.map((board, index) => (

                        <div
                            className="tile"
                            key={board.id}
                            style={{
                                cursor: "pointer",
                                animationDelay: `${Math.min(
                                    index * 0.05,
                                    0.3
                                )}s`,
                            }}
                            onClick={() => {
                                window.location.href = `/board/${board.id}`;
                            }}
                        >
                            <h3>{board.name}</h3>

                            <div
                                style={{
                                    marginTop: "12px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <span
                                    className="muted"
                                    style={{
                                        fontSize: "13px",
                                    }}
                                >
                                    🎨 {board.background}
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

            {/* Add Board Modal */}
            {showModal && (

                <div className="modal-overlay">

                    <div className="modal">

                        <h2>Create Board</h2>

                        <form onSubmit={handleCreateBoard}>

                            <input
                                type="text"
                                placeholder="Board name"
                                value={boardName}
                                onChange={(e) =>
                                    setBoardName(e.target.value)
                                }
                            />

                            <input
                                type="text"
                                placeholder="Background"
                                value={background}
                                onChange={(e) =>
                                    setBackground(e.target.value)
                                }
                            />

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setBoardName("");
                                        setBackground("");
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
                                        : "Create Board"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Board;