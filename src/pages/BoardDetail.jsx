import { useEffect, useState } from "react";

function BoardDetail() {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);

    // List modal
    const [showListModal, setShowListModal] = useState(false);
    const [listName, setListName] = useState("");
    const [creatingList, setCreatingList] = useState(false);

    // Card modal
    const [showCardModal, setShowCardModal] = useState(false);
    const [selectedListId, setSelectedListId] = useState(null);
    const [cardTitle, setCardTitle] = useState("");
    const [cardDescription, setCardDescription] = useState("");
    const [creatingCard, setCreatingCard] = useState(false);

    // Get board ID from URL
    const boardId = window.location.pathname.split("/")[2];

    useEffect(() => {
        fetchLists();
    }, []);

    // ==========================================
    // GET LISTS
    // ==========================================

    async function fetchLists() {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:3000/api/lists/board/${boardId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to fetch lists"
                );
            }

            // Fetch cards for every list
            const listsWithCards = await Promise.all(
                data.map(async (list) => {
                    const cardResponse = await fetch(
                        `http://localhost:3000/api/cards/lists/${list.id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    const cards = await cardResponse.json();

                    return {
                        ...list,
                        cards: cardResponse.ok ? cards : [],
                    };
                })
            );

            setLists(listsWithCards);

        } catch (error) {
            console.error("Error fetching lists:", error);
        } finally {
            setLoading(false);
        }
    }

    // ==========================================
    // CREATE LIST
    // ==========================================

    async function handleCreateList(e) {
        e.preventDefault();

        if (!listName.trim()) {
            alert("List name is required!");
            return;
        }

        try {
            setCreatingList(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:3000/api/lists",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: listName,
                        position: lists.length,
                        board_id: Number(boardId),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to create list"
                );
            }

            // Add cards array for frontend
            const newList = {
                ...data,
                cards: [],
            };

            setLists((previousLists) => [
                ...previousLists,
                newList,
            ]);

            setListName("");
            setShowListModal(false);

        } catch (error) {
            console.error("Error creating list:", error);
            alert(error.message);
        } finally {
            setCreatingList(false);
        }
    }

    // ==========================================
    // CREATE CARD
    // ==========================================

    async function handleCreateCard(e) {
        e.preventDefault();

        if (!cardTitle.trim()) {
            alert("Card title is required!");
            return;
        }

        try {
            setCreatingCard(true);

            const token = localStorage.getItem("token");

            const selectedList = lists.find(
                (list) => list.id === selectedListId
            );

            const response = await fetch(
                "http://localhost:3000/api/cards",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: cardTitle,
                        position: selectedList.cards.length,
                        description: cardDescription,
                        list_id: selectedListId,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to create card"
                );
            }

            // Add card to correct list
            setLists((previousLists) =>
                previousLists.map((list) =>
                    list.id === selectedListId
                        ? {
                              ...list,
                              cards: [
                                  ...list.cards,
                                  data,
                              ],
                          }
                        : list
                )
            );

            setCardTitle("");
            setCardDescription("");
            setSelectedListId(null);
            setShowCardModal(false);

        } catch (error) {
            console.error("Error creating card:", error);
            alert(error.message);
        } finally {
            setCreatingCard(false);
        }
    }

    if (loading) {
        return <p>Loading board...</p>;
    }

    return (
        <div className="board-page">

            {/* Board Header */}
            <div className="section-heading">

                <div>
                    <h1>Board</h1>

                    <p
                        className="muted"
                        style={{
                            fontSize: "13px",
                            marginTop: "2px",
                        }}
                    >
                        Manage your lists and cards
                    </p>
                </div>

                <div>

                    <button
                        className="primary-btn"
                        onClick={() => setShowListModal(true)}
                    >
                        + Add List
                    </button>

                    <button
                        onClick={() => {
                            window.location.href =
                                window.location.pathname
                                    .split("/")
                                    .slice(0, 2)
                                    .join("/") || "/";
                        }}
                    >
                        ← Back
                    </button>

                </div>

            </div>

            {/* Lists */}
            <div className="board-lists">

                {lists.length === 0 ? (

                    <div className="empty-state">
                        No lists yet — create your first list.
                    </div>

                ) : (

                    lists
                        .sort(
                            (a, b) =>
                                Number(a.position) -
                                Number(b.position)
                        )
                        .map((list) => (

                            <div
                                className="board-list"
                                key={list.id}
                            >

                                {/* List Header */}
                                <div className="list-header">

                                    <h3>{list.name}</h3>

                                    <span className="muted">
                                        {list.cards.length}
                                    </span>

                                </div>

                                {/* Cards */}
                                <div className="cards-container">

                                    {list.cards.map((card) => (

                                        <div
                                            className="card"
                                            key={card.id}
                                        >

                                            <h4>
                                                {card.title}
                                            </h4>

                                            {card.description && (
                                                <p className="muted">
                                                    {
                                                        card.description
                                                    }
                                                </p>
                                            )}

                                        </div>

                                    ))}

                                </div>

                                {/* Add Card */}
                                <button
                                    className="add-card-btn"
                                    onClick={() => {
                                        setSelectedListId(
                                            list.id
                                        );
                                        setShowCardModal(true);
                                    }}
                                >
                                    + Add Card
                                </button>

                            </div>

                        ))

                )}

            </div>

            {/* ==========================================
                CREATE LIST MODAL
            ========================================== */}

            {showListModal && (

                <div className="modal-overlay">

                    <div className="modal">

                        <h2>Create List</h2>

                        <form onSubmit={handleCreateList}>

                            <input
                                type="text"
                                placeholder="List name"
                                value={listName}
                                onChange={(e) =>
                                    setListName(
                                        e.target.value
                                    )
                                }
                            />

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowListModal(false);
                                        setListName("");
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={creatingList}
                                >
                                    {creatingList
                                        ? "Creating..."
                                        : "Create List"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            {/* ==========================================
                CREATE CARD MODAL
            ========================================== */}

            {showCardModal && (

                <div className="modal-overlay">

                    <div className="modal">

                        <h2>Create Card</h2>

                        <form onSubmit={handleCreateCard}>

                            <input
                                type="text"
                                placeholder="Card title"
                                value={cardTitle}
                                onChange={(e) =>
                                    setCardTitle(
                                        e.target.value
                                    )
                                }
                            />

                            <textarea
                                placeholder="Card description"
                                value={cardDescription}
                                onChange={(e) =>
                                    setCardDescription(
                                        e.target.value
                                    )
                                }
                            />

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCardModal(false);
                                        setCardTitle("");
                                        setCardDescription("");
                                        setSelectedListId(null);
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={creatingCard}
                                >
                                    {creatingCard
                                        ? "Creating..."
                                        : "Create Card"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default BoardDetail;