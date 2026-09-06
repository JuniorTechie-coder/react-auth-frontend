import { useEffect, useState } from "react";

function BoardDetail() {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);

    const [draggedCard, setDraggedCard] = useState(null);

    // List states
    const [showListModal, setShowListModal] = useState(false);
    const [listName, setListName] = useState("");
    const [creatingList, setCreatingList] = useState(false);

    const [editingListId, setEditingListId] = useState(null);
    const [editingListName, setEditingListName] = useState("");
    const [updatingList, setUpdatingList] = useState(false);

    // Card states
    const [showCardModal, setShowCardModal] = useState(false);
    const [selectedListId, setSelectedListId] = useState(null);

    const [cardTitle, setCardTitle] = useState("");
    const [cardDescription, setCardDescription] = useState("");
    const [creatingCard, setCreatingCard] = useState(false);

    const [editingCardId, setEditingCardId] = useState(null);
    const [editingCardTitle, setEditingCardTitle] = useState("");
    const [editingCardDescription, setEditingCardDescription] = useState("");
    const [updatingCard, setUpdatingCard] = useState(false);

    const boardId = window.location.pathname.split("/")[2];

    useEffect(() => {
        fetchLists();
    }, []);

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
                throw new Error(data.error || "Failed to fetch lists");
            }

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

    // =========================
    // CREATE LIST
    // =========================

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
                throw new Error(data.error || "Failed to create list");
            }

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

    // =========================
    // EDIT LIST
    // =========================

    function openEditList(list) {
        setEditingListId(list.id);
        setEditingListName(list.name);
    }

    async function handleUpdateList(e) {
        e.preventDefault();

        if (!editingListName.trim()) {
            alert("List name is required!");
            return;
        }

        try {
            setUpdatingList(true);

            const token = localStorage.getItem("token");

            const list = lists.find(
                (list) => list.id === editingListId
            );

            const response = await fetch(
                `http://localhost:3000/api/lists/${editingListId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: editingListName,
                        position: list.position,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to update list");
            }

            setLists((previousLists) =>
                previousLists.map((list) =>
                    list.id === editingListId
                        ? {
                            ...list,
                            name: data.Lists.name,
                            position: data.Lists.position,
                        }
                        : list
                )
            );

            setEditingListId(null);
            setEditingListName("");
        } catch (error) {
            console.error("Error updating list:", error);
            alert(error.message);
        } finally {
            setUpdatingList(false);
        }
    }

    // =========================
    // DELETE LIST
    // =========================

    async function handleDeleteList(listId) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this list?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:3000/api/lists/${listId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to delete list");
            }

            setLists((previousLists) =>
                previousLists.filter(
                    (list) => list.id !== listId
                )
            );
        } catch (error) {
            console.error("Error deleting list:", error);
            alert(error.message);
        }
    }

    // =========================
    // CREATE CARD
    // =========================

    async function handleCreateCard(e) {
        e.preventDefault();

        if (!cardTitle.trim()) {
            alert("Card title is required!");
            return;
        }

        if (!cardDescription.trim()) {
            alert("Card description is required!");
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
                throw new Error(data.error || "Failed to create card");
            }

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


    // =========================
    // EDIT CARD
    // =========================

    function openEditCard(card) {
        setEditingCardId(card.id);
        setEditingCardTitle(card.title);
        setEditingCardDescription(card.description || "");
    }

    async function handleUpdateCard(e) {
        e.preventDefault();

        if (!editingCardTitle.trim()) {
            alert("Card title is required!");
            return;
        }

        if (!editingCardDescription.trim()) {
            alert("Card description is required!");
            return;
        }

        try {
            setUpdatingCard(true);

            const token = localStorage.getItem("token");

            let currentCard = null;

            for (const list of lists) {
                const foundCard = list.cards.find(
                    (card) => card.id === editingCardId
                );

                if (foundCard) {
                    currentCard = foundCard;
                    break;
                }
            }

            const response = await fetch(
                `http://localhost:3000/api/cards/${editingCardId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: editingCardTitle,
                        description: editingCardDescription,
                        position: currentCard.position,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to update card");
            }

            setLists((previousLists) =>
                previousLists.map((list) => ({
                    ...list,
                    cards: list.cards.map((card) =>
                        card.id === editingCardId
                            ? {
                                ...card,
                                title: data.card.title,
                                description: data.card.description,
                                position: data.card.position,
                            }
                            : card
                    ),
                }))
            );

            setEditingCardId(null);
            setEditingCardTitle("");
            setEditingCardDescription("");
        } catch (error) {
            console.error("Error updating card:", error);
            alert(error.message);
        } finally {
            setUpdatingCard(false);
        }
    }

    // =========================
    // DELETE CARD
    // =========================

    async function handleDeleteCard(cardId) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this card?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:3000/api/cards/${cardId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to delete card");
            }

            setLists((previousLists) =>
                previousLists.map((list) => ({
                    ...list,
                    cards: list.cards.filter(
                        (card) => card.id !== cardId
                    ),
                }))
            );
        } catch (error) {
            console.error("Error deleting card:", error);
            alert(error.message);
        }
    }


    // =========================
    // DRAG START
    // =========================

    function handleDragStart(card, sourceListId) {
        setDraggedCard({
            card,
            sourceListId,
        });
    }


    // =========================
    // DRAG END
    // =========================

    function handleDragEnd() {
        setDraggedCard(null);
    }


    // =========================
    // DRAG OVER
    // =========================

    function handleDragOver(e) {
        e.preventDefault();
    }


    // =========================
    // DROP CARD
    // =========================

    async function handleDrop(targetListId) {
        if (!draggedCard) {
            return;
        }

        const { card, sourceListId } = draggedCard;

        // Same list = do nothing
        if (Number(sourceListId) === Number(targetListId)) {
            setDraggedCard(null);
            return;
        }

        const sourceList = lists.find(
            (list) => list.id === sourceListId
        );

        const targetList = lists.find(
            (list) => list.id === targetListId
        );

        if (!sourceList || !targetList) {
            setDraggedCard(null);
            return;
        }

        // Remove card from source list
        const updatedSourceCards = sourceList.cards.filter(
            (item) => item.id !== card.id
        );

        // Add card to target list
        const newPosition = targetList.cards.length;

        const updatedCard = {
            ...card,
            list_id: targetListId,
            position: newPosition,
        };

        const updatedTargetCards = [
            ...targetList.cards,
            updatedCard,
        ];

        // Update UI immediately
        setLists((previousLists) =>
            previousLists.map((list) => {

                if (list.id === sourceListId) {
                    return {
                        ...list,
                        cards: updatedSourceCards,
                    };
                }

                if (list.id === targetListId) {
                    return {
                        ...list,
                        cards: updatedTargetCards,
                    };
                }

                return list;
            })
        );

        setDraggedCard(null);

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:3000/api/cards/${card.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: card.title,
                        description: card.description,
                        position: newPosition,
                        list_id: targetListId,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to move card"
                );
            }

        } catch (error) {
            console.error("Error moving card:", error);

            // If backend fails, reload the real database state
            fetchLists();

            alert(error.message);
        }
    }

    if (loading) {
        return <p>Loading board...</p>;
    }

    return (
        <div className="board-page">

            {/* ================= HEADER ================= */}

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

            {/* ================= LISTS ================= */}

            <div className="board-lists">

                {lists.length === 0 ? (
                    <div className="empty-state">
                        No lists yet — create your first list.
                    </div>
                ) : (
                    [...lists]
                        .sort(
                            (a, b) =>
                                Number(a.position) -
                                Number(b.position)
                        )
                        .map((list) => (

                            <div
                                className="board-list"
                                key={list.id}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(list.id)
                                    
                                }
                            >

                                {/* LIST HEADER */}

                                <div className="list-header">

                                    <h3>{list.name}</h3>

                                    <span className="muted">
                                        {list.cards.length}
                                    </span>

                                    <button
                                        onClick={() =>
                                            openEditList(list)
                                        }
                                    >
                                        ✏️
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDeleteList(list.id)
                                        }
                                    >
                                        🗑️
                                    </button>

                                </div>

                                {/* CARDS */}

                                <div className="cards-container">

                                    {list.cards
                                        .sort(
                                            (a, b) =>
                                                Number(a.position) -
                                                Number(b.position)
                                        )
                                        .map((card) => (

                                            <div
                                                className="card"
                                                key={card.id}
                                                draggable={true}
                                                onDragStart={() =>
                                                    handleDragStart(card, list.id)
                                                }
                                                onDragEnd={handleDragEnd}
                                            >

                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        alignItems:
                                                            "flex-start",
                                                    }}
                                                >

                                                    <h4>
                                                        {card.title}
                                                    </h4>

                                                    <div>

                                                        <button
                                                            onClick={() =>
                                                                openEditCard(
                                                                    card
                                                                )
                                                            }
                                                        >
                                                            ✏️
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                handleDeleteCard(
                                                                    card.id
                                                                )
                                                            }
                                                        >
                                                            🗑️
                                                        </button>

                                                    </div>

                                                </div>

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

                                {/* ADD CARD */}

                                <button
                                    className="add-card-btn"
                                    onClick={() => {
                                        setSelectedListId(list.id);
                                        setShowCardModal(true);
                                    }}
                                >
                                    + Add Card
                                </button>

                            </div>
                        ))
                )}

            </div>

            {/* ================= CREATE LIST MODAL ================= */}

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
                                    setListName(e.target.value)
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

            {/* ================= EDIT LIST MODAL ================= */}

            {editingListId !== null && (
                <div className="modal-overlay">

                    <div className="modal">

                        <h2>Edit List</h2>

                        <form onSubmit={handleUpdateList}>

                            <input
                                type="text"
                                placeholder="List name"
                                value={editingListName}
                                onChange={(e) =>
                                    setEditingListName(
                                        e.target.value
                                    )
                                }
                            />

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingListId(null);
                                        setEditingListName("");
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={updatingList}
                                >
                                    {updatingList
                                        ? "Updating..."
                                        : "Update List"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* ================= CREATE CARD MODAL ================= */}

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
                                    setCardTitle(e.target.value)
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

            {/* ================= EDIT CARD MODAL ================= */}

            {editingCardId !== null && (
                <div className="modal-overlay">

                    <div className="modal">

                        <h2>Edit Card</h2>

                        <form onSubmit={handleUpdateCard}>

                            <input
                                type="text"
                                placeholder="Card title"
                                value={editingCardTitle}
                                onChange={(e) =>
                                    setEditingCardTitle(
                                        e.target.value
                                    )
                                }
                            />

                            <textarea
                                placeholder="Card description"
                                value={editingCardDescription}
                                onChange={(e) =>
                                    setEditingCardDescription(
                                        e.target.value
                                    )
                                }
                            />

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingCardId(null);
                                        setEditingCardTitle("");
                                        setEditingCardDescription("");
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={updatingCard}
                                >
                                    {updatingCard
                                        ? "Updating..."
                                        : "Update Card"}
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