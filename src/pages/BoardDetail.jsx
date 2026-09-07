import { useEffect, useState } from "react";

function BoardDetail() {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);

    // Board / Workspace information
    const [board, setBoard] = useState(null);
    const [workspace, setWorkspace] = useState(null);

    // Theme
    const [theme, setTheme] = useState(
        localStorage.getItem("trello_board_theme") || "theme-sunset"
    );

    // Role
    const [role, setRole] = useState(
        localStorage.getItem("trello_board_role") || "member"
    );

    // Drag and Drop
    const [draggedCard, setDraggedCard] = useState(null);
    const [dragOverList, setDragOverList] = useState(null);

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

    // --------------------------------------------------
    // INITIAL LOAD
    // --------------------------------------------------

    useEffect(() => {
        fetchBoard();
        fetchLists();
    }, []);

    // --------------------------------------------------
    // THEME
    // --------------------------------------------------

    useEffect(() => {
        document.body.className = theme;
        localStorage.setItem("trello_board_theme", theme);

        return () => {
            document.body.className = "";
        };
    }, [theme]);

    function changeTheme(newTheme) {
        setTheme(newTheme);
    }

    // --------------------------------------------------
    // ROLE
    // --------------------------------------------------

    function changeRole(newRole) {
        setRole(newRole);
        localStorage.setItem("trello_board_role", newRole);
    }

    // --------------------------------------------------
    // CARD STATUS HELPER (Done = Green, To Do/Unstarted = Red, Progress = Blue)
    // --------------------------------------------------

    function getCardStatus(listName) {
        const name = (listName || "").toLowerCase().trim();
        if (name.includes("done") || name.includes("complete") || name.includes("finish")) {
            return {
                className: "card-status-done",
                label: "Done",
                icon: "✓"
            };
        }
        if (name.includes("progress") || name.includes("doing") || name.includes("review") || name.includes("working") || name.includes("test")) {
            return {
                className: "card-status-progress",
                label: "In Progress",
                icon: "⚡"
            };
        }
        return {
            className: "card-status-todo",
            label: "To Do",
            icon: "●"
        };
    }

    // --------------------------------------------------
    // FETCH BOARD
    // --------------------------------------------------

    async function fetchBoard() {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:3000/api/boards/${boardId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to fetch board"
                );
            }

            setBoard(data);

            // Fetch workspace belonging to this board
            if (data.workspace_id) {
                const workspaceResponse = await fetch(
                    `http://localhost:3000/api/workspaces/${data.workspace_id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const workspaceData =
                    await workspaceResponse.json();

                if (workspaceResponse.ok) {
                    setWorkspace(workspaceData);
                }
            }
        } catch (error) {
            console.error("Error fetching board:", error);
        }
    }

    // --------------------------------------------------
    // FETCH LISTS + CARDS
    // --------------------------------------------------

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

    // --------------------------------------------------
    // CREATE LIST
    // --------------------------------------------------

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

    // --------------------------------------------------
    // EDIT LIST
    // --------------------------------------------------

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
                (item) => item.id === editingListId
            );

            if (!list) {
                return;
            }

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
                throw new Error(
                    data.error || "Failed to update list"
                );
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

    // --------------------------------------------------
    // DELETE LIST
    // --------------------------------------------------

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
                throw new Error(
                    data.error || "Failed to delete list"
                );
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

    // --------------------------------------------------
    // CREATE CARD
    // --------------------------------------------------

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

            if (!selectedList) {
                throw new Error("List not found");
            }

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

    // --------------------------------------------------
    // EDIT CARD
    // --------------------------------------------------

    function openEditCard(card) {
        setEditingCardId(card.id);
        setEditingCardTitle(card.title);
        setEditingCardDescription(
            card.description || ""
        );
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

            if (!currentCard) {
                throw new Error("Card not found");
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
                        list_id: currentCard.list_id,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to update card"
                );
            }

            setLists((previousLists) =>
                previousLists.map((list) => ({
                    ...list,
                    cards: list.cards.map((card) =>
                        card.id === editingCardId
                            ? {
                                  ...card,
                                  title: data.card.title,
                                  description:
                                      data.card.description,
                                  position:
                                      data.card.position,
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

    // --------------------------------------------------
    // DELETE CARD
    // --------------------------------------------------

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
                throw new Error(
                    data.error || "Failed to delete card"
                );
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

    // --------------------------------------------------
    // DRAG START
    // --------------------------------------------------

    function handleDragStart(card, sourceListId) {
        setDraggedCard({
            card,
            sourceListId,
        });
    }

    // --------------------------------------------------
    // DRAG END
    // --------------------------------------------------

    function handleDragEnd() {
        setDraggedCard(null);
        setDragOverList(null);
    }

    // --------------------------------------------------
    // DRAG OVER
    // --------------------------------------------------

    function handleDragOver(e, listId) {
        e.preventDefault();
        setDragOverList(listId);
    }

    // --------------------------------------------------
    // DROP CARD
    // --------------------------------------------------

    async function handleDrop(targetListId) {
        if (!draggedCard) {
            return;
        }

        const { card, sourceListId } = draggedCard;

        if (Number(sourceListId) === Number(targetListId)) {
            setDraggedCard(null);
            setDragOverList(null);
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
            setDragOverList(null);
            return;
        }

        const updatedSourceCards = sourceList.cards.filter(
            (item) => item.id !== card.id
        );

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
        setDragOverList(null);

        // Update database
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

            // Restore UI from database
            fetchLists();

            alert(error.message);
        }
    }

    // --------------------------------------------------
    // BACK TO BOARDS
    // --------------------------------------------------

    function handleBack() {
        if (board?.workspace_id) {
            window.location.href = `/boards/${board.workspace_id}`;
        } else {
            window.location.href = "/";
        }
    }

    // --------------------------------------------------
    // LOADING
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="main-content">
                <p style={{ color: "white" }}>
                    Loading board...
                </p>
            </div>
        );
    }

    // --------------------------------------------------
    // RENDER
    // --------------------------------------------------

    return (
        <>
            {/* NAVBAR */}
            <header className="navbar">

                <a className="logo" href="/">
                    Trello Clone
                </a>

                <div className="navbar-center">

                    <a
                        href={
                            board?.workspace_id
                                ? `/boards/${board.workspace_id}`
                                : "/"
                        }
                        className="crumb-btn"
                    >
                        {workspace?.name || "Workspace"}
                    </a>

                    <span className="crumb-sep">
                        /
                    </span>

                    <span className="crumb-current">
                        {board?.name || "Board"}
                    </span>

                </div>

                <div className="user-section">

                    {/* THEME PICKER */}
                    <div
                        className="theme-picker"
                        id="themePicker"
                        title="Board Theme"
                    >

                        <button
                            className={`theme-btn sunset ${
                                theme === "theme-sunset"
                                    ? "active"
                                    : ""
                            }`}
                            data-theme="theme-sunset"
                            title="Pink Sunset"
                            onClick={() =>
                                changeTheme("theme-sunset")
                            }
                        />

                        <button
                            className={`theme-btn magenta ${
                                theme === "theme-magenta"
                                    ? "active"
                                    : ""
                            }`}
                            data-theme="theme-magenta"
                            title="Neon Magenta"
                            onClick={() =>
                                changeTheme("theme-magenta")
                            }
                        />

                        <button
                            className={`theme-btn ocean ${
                                theme === "theme-ocean"
                                    ? "active"
                                    : ""
                            }`}
                            data-theme="theme-ocean"
                            title="Ocean Blue"
                            onClick={() =>
                                changeTheme("theme-ocean")
                            }
                        />

                        <button
                            className={`theme-btn midnight ${
                                theme === "theme-midnight"
                                    ? "active"
                                    : ""
                            }`}
                            data-theme="theme-midnight"
                            title="Midnight Violet"
                            onClick={() =>
                                changeTheme("theme-midnight")
                            }
                        />

                    </div>

                    {/* ROLE TOGGLE */}
                    <div
                        className="role-toggle"
                        id="roleToggle"
                    >

                        <button
                            className={`role-btn ${
                                role === "member"
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                changeRole("member")
                            }
                        >
                            Team Member
                        </button>

                        <button
                            className={`role-btn ${
                                role === "lead"
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                changeRole("lead")
                            }
                        >
                            Team Lead
                        </button>

                    </div>

                    {/* AVATAR */}
                    <div
                        className="avatar"
                        title="Active User"
                    >
                        T
                    </div>

                </div>

            </header>

            {/* MAIN APPLICATION */}
            <div className="app-container">

                {/* SIDEBAR */}
                <aside className="sidebar">

                    <h3>
                        Workspace
                    </h3>

                    <div className="workspace-name">
                        {workspace?.name ||
                            "My Workspace"}
                    </div>

                    <nav>

                        <a
                            href={
                                board?.workspace_id
                                    ? `/boards/${board.workspace_id}`
                                    : "/"
                            }
                        >
                            📋 Boards
                        </a>

                        <a
                            href="#"
                            style={{ opacity: 0.8 }}
                            onClick={(e) =>
                                e.preventDefault()
                            }
                        >
                            👥 Members
                        </a>

                        <a
                            href="#"
                            style={{ opacity: 0.8 }}
                            onClick={(e) =>
                                e.preventDefault()
                            }
                        >
                            ⚙️ Settings
                        </a>

                    </nav>

                </aside>

                {/* MAIN CONTENT */}
                <main className="main-content">

                    {/* BOARD HEADER */}
                    <section className="board-header">

                        <div>

                            <h1>
                                {board?.name ||
                                    "Board"}
                            </h1>

                            <p>
                                {workspace?.name ||
                                    "Workspace"}{" "}
                                /{" "}
                                {board?.name ||
                                    "Board"}
                            </p>

                        </div>

                    </section>

                    {/* BACKLOG */}
                    {role === "lead" && (
                        <section className="backlog-panel">

                            <div className="backlog-header">

                                <div>

                                    <h2>
                                        Team Lead Backlog
                                    </h2>

                                    <p
                                        className="muted"
                                        id="backlogHint"
                                    >
                                        Drag a card into a
                                        list to start
                                        working on it.
                                    </p>

                                </div>

                            </div>

                            <div
                                className="backlog-cards"
                                id="backlogCards"
                            >
                                <p
                                    style={{
                                        color: "rgba(255,255,255,0.7)",
                                        fontSize: "13px",
                                    }}
                                >
                                    No backlog cards.
                                </p>
                            </div>

                        </section>
                    )}

                    {/* BOARD LISTS */}
                    <section
                        className="board"
                        id="boardLists"
                    >

                        {lists.length === 0 ? (

                            <div
                                className="empty-state"
                                style={{
                                    color: "white",
                                }}
                            >
                                No lists yet — create
                                your first list.
                            </div>

                        ) : (

                            [...lists]
                                .sort(
                                    (a, b) =>
                                        Number(
                                            a.position
                                        ) -
                                        Number(
                                            b.position
                                        )
                                )
                                .map((list) => (

                                    <div
                                        className="list"
                                        key={list.id}
                                    >

                                        {/* LIST HEADER */}
                                        <div className="list-header">

                                            <h3>
                                                {list.name}
                                            </h3>

                                            <span>
                                                {
                                                    list.cards
                                                        .length
                                                }
                                            </span>

                                            <button
                                                onClick={() =>
                                                    openEditList(
                                                        list
                                                    )
                                                }
                                                title="Edit list"
                                            >
                                                ✏️
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleDeleteList(
                                                        list.id
                                                    )
                                                }
                                                title="Delete list"
                                            >
                                                🗑️
                                            </button>

                                        </div>

                                        {/* CARDS */}
                                        <div
                                            className={`cards ${
                                                dragOverList ===
                                                list.id
                                                    ? "drop-target"
                                                    : ""
                                            }`}
                                            onDragOver={(e) =>
                                                handleDragOver(
                                                    e,
                                                    list.id
                                                )
                                            }
                                            onDragLeave={() =>
                                                setDragOverList(
                                                    null
                                                )
                                            }
                                            onDrop={() =>
                                                handleDrop(
                                                    list.id
                                                )
                                            }
                                        >

                                            {[...list.cards]
                                                .sort(
                                                    (a, b) =>
                                                        Number(
                                                            a.position
                                                        ) -
                                                        Number(
                                                            b.position
                                                        )
                                                )
                                                .map((card) => {
                                                    const cardStatus = getCardStatus(list.name);
                                                    return (
                                                        <div
                                                            className={`card ${cardStatus.className} ${
                                                                draggedCard?.card.id === card.id
                                                                    ? "dragging"
                                                                    : ""
                                                            }`}
                                                            key={card.id}
                                                            draggable={true}
                                                            onDragStart={() =>
                                                                handleDragStart(
                                                                    card,
                                                                    list.id
                                                                )
                                                            }
                                                            onDragEnd={
                                                                handleDragEnd
                                                            }
                                                        >
                                                            {/* CARD TOP STATUS & ACTIONS */}
                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    justifyContent: "space-between",
                                                                    alignItems: "center",
                                                                    marginBottom: "6px",
                                                                }}
                                                            >
                                                                <span className="card-status-badge">
                                                                    <span>{cardStatus.icon}</span>
                                                                    <span>{cardStatus.label}</span>
                                                                </span>

                                                                <div>
                                                                    <button
                                                                        className="card-action-btn"
                                                                        onClick={() =>
                                                                            openEditCard(
                                                                                card
                                                                            )
                                                                        }
                                                                        title="Edit card"
                                                                    >
                                                                        ✏️
                                                                    </button>

                                                                    <button
                                                                        className="card-action-btn"
                                                                        onClick={() =>
                                                                            handleDeleteCard(
                                                                                card.id
                                                                            )
                                                                        }
                                                                        title="Delete card"
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* CARD TITLE */}
                                                            <h4>{card.title}</h4>

                                                            {card.description && (
                                                                <p>{card.description}</p>
                                                            )}

                                                            {/* CARD FOOTER */}
                                                            <div className="card-footer">
                                                                <span>Card #{card.id}</span>
                                                                <span>↕ {card.position}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                        </div>

                                        {/* ADD CARD */}
                                        <button
                                            className="add-card"
                                            onClick={() => {
                                                setSelectedListId(
                                                    list.id
                                                );
                                                setShowCardModal(
                                                    true
                                                );
                                            }}
                                        >
                                            + Add Card
                                        </button>

                                    </div>

                                ))

                        )}

                        {/* ADD LIST */}
                        <button
                            className="add-list"
                            onClick={() =>
                                setShowListModal(true)
                            }
                        >
                            + Add another list
                        </button>

                    </section>

                </main>

            </div>

            {/* CREATE LIST MODAL */}
            {showListModal && (
                <div
                    className="modal-overlay"
                    onClick={() =>
                        setShowListModal(false)
                    }
                >

                    <div
                        className="modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <h3>
                            New list
                        </h3>

                        <form
                            onSubmit={handleCreateList}
                        >

                            <input
                                type="text"
                                placeholder="List title (e.g. In Review)"
                                value={listName}
                                onChange={(e) =>
                                    setListName(
                                        e.target.value
                                    )
                                }
                                autoFocus
                            />

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="ghost-btn"
                                    onClick={() => {
                                        setShowListModal(
                                            false
                                        );
                                        setListName("");
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={
                                        creatingList
                                    }
                                >
                                    {creatingList
                                        ? "Creating..."
                                        : "Add List"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* EDIT LIST MODAL */}
            {editingListId !== null && (
                <div
                    className="modal-overlay"
                    onClick={() =>
                        setEditingListId(null)
                    }
                >

                    <div
                        className="modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <h3>
                            Edit list
                        </h3>

                        <form
                            onSubmit={
                                handleUpdateList
                            }
                        >

                            <input
                                type="text"
                                placeholder="List title"
                                value={
                                    editingListName
                                }
                                onChange={(e) =>
                                    setEditingListName(
                                        e.target.value
                                    )
                                }
                                autoFocus
                            />

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="ghost-btn"
                                    onClick={() => {
                                        setEditingListId(
                                            null
                                        );
                                        setEditingListName(
                                            ""
                                        );
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={
                                        updatingList
                                    }
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

            {/* CREATE CARD MODAL */}
            {showCardModal && (
                <div
                    className="modal-overlay"
                    onClick={() =>
                        setShowCardModal(false)
                    }
                >

                    <div
                        className="modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <h3>
                            New card
                        </h3>

                        <form
                            onSubmit={
                                handleCreateCard
                            }
                        >

                            <input
                                type="text"
                                placeholder="Card title"
                                value={cardTitle}
                                onChange={(e) =>
                                    setCardTitle(
                                        e.target.value
                                    )
                                }
                                maxLength={80}
                                autoFocus
                            />

                            <textarea
                                placeholder="Description"
                                rows={3}
                                value={
                                    cardDescription
                                }
                                onChange={(e) =>
                                    setCardDescription(
                                        e.target.value
                                    )
                                }
                                maxLength={300}
                            />

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="ghost-btn"
                                    onClick={() => {
                                        setShowCardModal(
                                            false
                                        );
                                        setCardTitle("");
                                        setCardDescription(
                                            ""
                                        );
                                        setSelectedListId(
                                            null
                                        );
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={
                                        creatingCard
                                    }
                                >
                                    {creatingCard
                                        ? "Creating..."
                                        : "Save Card"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* EDIT CARD MODAL */}
            {editingCardId !== null && (
                <div
                    className="modal-overlay"
                    onClick={() =>
                        setEditingCardId(null)
                    }
                >

                    <div
                        className="modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <h3>
                            Edit card
                        </h3>

                        <form
                            onSubmit={
                                handleUpdateCard
                            }
                        >

                            <input
                                type="text"
                                placeholder="Card title"
                                value={
                                    editingCardTitle
                                }
                                onChange={(e) =>
                                    setEditingCardTitle(
                                        e.target.value
                                    )
                                }
                                maxLength={80}
                                autoFocus
                            />

                            <textarea
                                placeholder="Description"
                                rows={3}
                                value={
                                    editingCardDescription
                                }
                                onChange={(e) =>
                                    setEditingCardDescription(
                                        e.target.value
                                    )
                                }
                                maxLength={300}
                            />

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="ghost-btn"
                                    onClick={() => {
                                        setEditingCardId(
                                            null
                                        );
                                        setEditingCardTitle(
                                            ""
                                        );
                                        setEditingCardDescription(
                                            ""
                                        );
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={
                                        updatingCard
                                    }
                                >
                                    {updatingCard
                                        ? "Updating..."
                                        : "Save Card"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </>
    );
}

export default BoardDetail;