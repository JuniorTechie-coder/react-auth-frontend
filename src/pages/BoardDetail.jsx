import { useEffect, useState } from "react";

function BoardDetail() {
    const [lists, setLists] = useState([]);
    const [backlogCards, setBacklogCards] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Current logged-in user
    const [currentUser, setCurrentUser] = useState(null);

    // Board / Workspace information
    const [board, setBoard] = useState(null);
    const [workspace, setWorkspace] = useState(null);

    // Theme
    const [theme, setTheme] = useState(
        localStorage.getItem("flowdesk_board_theme") || "theme-sunset"
    );

    // Role (lead vs member)
    const [role, setRole] = useState(
        localStorage.getItem("flowdesk_board_role") || "member"
    );

    // Filter cards by assignee ('all' | 'my' | 'unassigned' | number)
    const [filterAssignee, setFilterAssignee] = useState("all");

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

    // Card states (for lists)
    const [showCardModal, setShowCardModal] = useState(false);
    const [selectedListId, setSelectedListId] = useState(null);
    const [cardTitle, setCardTitle] = useState("");
    const [cardDescription, setCardDescription] = useState("");
    const [cardAssignee, setCardAssignee] = useState("");
    const [creatingCard, setCreatingCard] = useState(false);

    // Card states (for backlog)
    const [showBacklogModal, setShowBacklogModal] = useState(false);
    const [backlogTitle, setBacklogTitle] = useState("");
    const [backlogDescription, setBacklogDescription] = useState("");
    const [backlogAssignee, setBacklogAssignee] = useState("");
    const [creatingBacklogCard, setCreatingBacklogCard] = useState(false);

    // Card Edit state (applicable to list cards or backlog cards)
    const [editingCardId, setEditingCardId] = useState(null);
    const [editingCardTitle, setEditingCardTitle] = useState("");
    const [editingCardDescription, setEditingCardDescription] = useState("");
    const [editingCardAssignee, setEditingCardAssignee] = useState("");
    const [editingCardIsBacklog, setEditingCardIsBacklog] = useState(false);
    const [updatingCard, setUpdatingCard] = useState(false);

    const boardId = window.location.pathname.split("/")[2];

    // --------------------------------------------------
    // INITIAL LOAD
    // --------------------------------------------------

    useEffect(() => {
        try {
            const savedUser = localStorage.getItem("user");
            if (savedUser) {
                setCurrentUser(JSON.parse(savedUser));
            }
        } catch (e) {
            console.error("Error parsing user from localStorage:", e);
        }

        fetchBoard();
        fetchLists();
        fetchBacklog();
        fetchTeamMembers();
    }, []);

    // --------------------------------------------------
    // THEME
    // --------------------------------------------------

    useEffect(() => {
        document.body.className = theme;
        localStorage.setItem("flowdesk_board_theme", theme);

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
        localStorage.setItem("flowdesk_board_role", newRole);
    }

    // --------------------------------------------------
    // CARD STATUS HELPER
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
    // FETCH DATA API CALLS
    // --------------------------------------------------

    async function fetchBoard() {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `https://trello-backend-1dsq.onrender.com/api/boards/${boardId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch board");
            }

            setBoard(data);

            if (data.workspace_id) {
                const workspaceResponse = await fetch(
                    `https://trello-backend-1dsq.onrender.com/api/workspaces/${data.workspace_id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const workspaceData = await workspaceResponse.json();

                if (workspaceResponse.ok) {
                    setWorkspace(workspaceData);
                }
            }
        } catch (error) {
            console.error("Error fetching board:", error);
        }
    }

    async function fetchLists() {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `https://trello-backend-1dsq.onrender.com/api/lists/board/${boardId}`,
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
                        `https://trello-backend-1dsq.onrender.com/api/cards/lists/${list.id}`,
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

    async function fetchBacklog() {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `https://trello-backend-1dsq.onrender.com/api/cards/board/${boardId}/backlog`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (response.ok && Array.isArray(data)) {
                setBacklogCards(data);
            } else {
                setBacklogCards([]);
            }
        } catch (error) {
            console.error("Error fetching backlog cards:", error);
        }
    }

    async function fetchTeamMembers() {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch("https://trello-backend-1dsq.onrender.com/api/users", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok && Array.isArray(data)) {
                setTeamMembers(data);
            }
        } catch (error) {
            console.error("Error fetching team members:", error);
        }
    }

    // --------------------------------------------------
    // LIST CRUD
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

            const response = await fetch("https://trello-backend-1dsq.onrender.com/api/lists", {
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
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create list");
            }

            const newList = {
                ...data,
                cards: [],
            };

            setLists((prev) => [...prev, newList]);
            setListName("");
            setShowListModal(false);
        } catch (error) {
            console.error("Error creating list:", error);
            alert(error.message);
        } finally {
            setCreatingList(false);
        }
    }

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

            const list = lists.find((item) => item.id === editingListId);
            if (!list) return;

            const response = await fetch(
                `https://trello-backend-1dsq.onrender.com/api/lists/${editingListId}`,
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

            setLists((prev) =>
                prev.map((item) =>
                    item.id === editingListId
                        ? {
                              ...item,
                              name: data.Lists ? data.Lists.name : editingListName,
                          }
                        : item
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

    async function handleDeleteList(listId) {
        const confirmed = window.confirm("Are you sure you want to delete this list?");
        if (!confirmed) return;

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `https://trello-backend-1dsq.onrender.com/api/lists/${listId}`,
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

            setLists((prev) => prev.filter((item) => item.id !== listId));
        } catch (error) {
            console.error("Error deleting list:", error);
            alert(error.message);
        }
    }

    // --------------------------------------------------
    // CARD CREATION (BOARD LIST)
    // --------------------------------------------------

    async function handleCreateCard(e) {
        e.preventDefault();

        if (!cardTitle.trim()) {
            alert("Card title is required!");
            return;
        }

        try {
            setCreatingCard(true);
            const token = localStorage.getItem("token");

            const selectedList = lists.find((list) => list.id === selectedListId);
            if (!selectedList) throw new Error("List not found");

            const response = await fetch("https://trello-backend-1dsq.onrender.com/api/cards", {
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
                    board_id: Number(boardId),
                    is_backlog: false,
                    assigned_to: cardAssignee ? Number(cardAssignee) : null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create card");
            }

            setLists((prev) =>
                prev.map((list) =>
                    list.id === selectedListId
                        ? {
                              ...list,
                              cards: [...list.cards, data],
                          }
                        : list
                )
            );

            setCardTitle("");
            setCardDescription("");
            setCardAssignee("");
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
    // CARD CREATION (TEAM LEAD BACKLOG)
    // --------------------------------------------------

    async function handleCreateBacklogCard(e) {
        e.preventDefault();

        if (!backlogTitle.trim()) {
            alert("Card title is required!");
            return;
        }

        try {
            setCreatingBacklogCard(true);
            const token = localStorage.getItem("token");

            const response = await fetch("https://trello-backend-1dsq.onrender.com/api/cards", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: backlogTitle,
                    position: backlogCards.length,
                    description: backlogDescription,
                    board_id: Number(boardId),
                    is_backlog: true,
                    assigned_to: backlogAssignee ? Number(backlogAssignee) : null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create backlog card");
            }

            setBacklogCards((prev) => [...prev, data]);
            setBacklogTitle("");
            setBacklogDescription("");
            setBacklogAssignee("");
            setShowBacklogModal(false);
        } catch (error) {
            console.error("Error creating backlog card:", error);
            alert(error.message);
        } finally {
            setCreatingBacklogCard(false);
        }
    }

    // --------------------------------------------------
    // DIRECT ASSIGNMENT (TEAM LEAD FEATURE)
    // --------------------------------------------------

    async function handleAssignCard(cardId, newAssigneeId, e) {
        if (e) e.stopPropagation();

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `https://trello-backend-1dsq.onrender.com/api/cards/${cardId}/assign`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        assigned_to: newAssigneeId ? Number(newAssigneeId) : null,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to assign card");
            }

            const updatedCard = data.card;

            // Update in lists
            setLists((prev) =>
                prev.map((list) => ({
                    ...list,
                    cards: list.cards.map((card) =>
                        card.id === cardId
                            ? {
                                  ...card,
                                  assigned_to: updatedCard.assigned_to,
                                  assigned_to_name: updatedCard.assigned_to_name,
                                  assigned_to_email: updatedCard.assigned_to_email,
                              }
                            : card
                    ),
                }))
            );

            // Update in backlog
            setBacklogCards((prev) =>
                prev.map((card) =>
                    card.id === cardId
                        ? {
                              ...card,
                              assigned_to: updatedCard.assigned_to,
                              assigned_to_name: updatedCard.assigned_to_name,
                              assigned_to_email: updatedCard.assigned_to_email,
                          }
                        : card
                )
            );
        } catch (error) {
            console.error("Error assigning card:", error);
            alert(error.message);
        }
    }

    // --------------------------------------------------
    // EDIT & UPDATE CARD
    // --------------------------------------------------

    function openEditCard(card, isBacklog = false) {
        setEditingCardId(card.id);
        setEditingCardTitle(card.title || "");
        setEditingCardDescription(card.description || "");
        setEditingCardAssignee(card.assigned_to ? String(card.assigned_to) : "");
        setEditingCardIsBacklog(isBacklog);
    }

    async function handleUpdateCard(e) {
        e.preventDefault();

        if (!editingCardTitle.trim()) {
            alert("Card title is required!");
            return;
        }

        try {
            setUpdatingCard(true);
            const token = localStorage.getItem("token");

            const response = await fetch(
                `https://trello-backend-1dsq.onrender.com/api/cards/${editingCardId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: editingCardTitle,
                        description: editingCardDescription,
                        assigned_to: editingCardAssignee ? Number(editingCardAssignee) : null,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to update card");
            }

            const updatedCard = data.card;

            // Update list cards
            setLists((prev) =>
                prev.map((list) => ({
                    ...list,
                    cards: list.cards.map((card) =>
                        card.id === editingCardId
                            ? {
                                  ...card,
                                  title: updatedCard.title,
                                  description: updatedCard.description,
                                  assigned_to: updatedCard.assigned_to,
                                  assigned_to_name: updatedCard.assigned_to_name,
                                  assigned_to_email: updatedCard.assigned_to_email,
                              }
                            : card
                    ),
                }))
            );

            // Update backlog cards
            setBacklogCards((prev) =>
                prev.map((card) =>
                    card.id === editingCardId
                        ? {
                              ...card,
                              title: updatedCard.title,
                              description: updatedCard.description,
                              assigned_to: updatedCard.assigned_to,
                              assigned_to_name: updatedCard.assigned_to_name,
                              assigned_to_email: updatedCard.assigned_to_email,
                          }
                        : card
                )
            );

            setEditingCardId(null);
            setEditingCardTitle("");
            setEditingCardDescription("");
            setEditingCardAssignee("");
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

    async function handleDeleteCard(cardId, isBacklog = false) {
        const confirmed = window.confirm("Are you sure you want to delete this card?");
        if (!confirmed) return;

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `https://trello-backend-1dsq.onrender.com/api/cards/${cardId}`,
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

            if (isBacklog) {
                setBacklogCards((prev) => prev.filter((card) => card.id !== cardId));
            } else {
                setLists((prev) =>
                    prev.map((list) => ({
                        ...list,
                        cards: list.cards.filter((card) => card.id !== cardId),
                    }))
                );
            }
        } catch (error) {
            console.error("Error deleting card:", error);
            alert(error.message);
        }
    }

    // --------------------------------------------------
    // DRAG AND DROP (LISTS <-> BACKLOG)
    // --------------------------------------------------

    function handleDragStart(card, sourceListId) {
        setDraggedCard({
            card,
            sourceListId, // list.id or 'backlog'
        });
    }

    function handleDragEnd() {
        setDraggedCard(null);
        setDragOverList(null);
    }

    function handleDragOver(e, listId) {
        e.preventDefault();
        setDragOverList(listId);
    }

    async function handleDrop(targetListId) {
        if (!draggedCard) return;

        const { card, sourceListId } = draggedCard;

        if (sourceListId === targetListId) {
            setDraggedCard(null);
            setDragOverList(null);
            return;
        }

        const token = localStorage.getItem("token");

        // CASE 1: Dropping INTO Backlog (from a list)
        if (targetListId === "backlog") {
            // Remove from source list
            setLists((prev) =>
                prev.map((list) =>
                    list.id === sourceListId
                        ? {
                              ...list,
                              cards: list.cards.filter((item) => item.id !== card.id),
                          }
                        : list
                )
            );

            // Add to backlog
            const updatedCard = {
                ...card,
                list_id: null,
                is_backlog: true,
                position: backlogCards.length,
            };
            setBacklogCards((prev) => [...prev, updatedCard]);

            setDraggedCard(null);
            setDragOverList(null);

            try {
                const response = await fetch(
                    `https://trello-backend-1dsq.onrender.com/api/cards/${card.id}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            title: card.title,
                            description: card.description,
                            position: backlogCards.length,
                            list_id: null,
                            board_id: Number(boardId),
                            is_backlog: true,
                        }),
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to move card to backlog");
                }
            } catch (err) {
                console.error("Error moving card to backlog:", err);
                fetchLists();
                fetchBacklog();
            }
            return;
        }

        // CASE 2: Dropping FROM Backlog (into a list)
        if (sourceListId === "backlog") {
            const targetList = lists.find((l) => l.id === targetListId);
            if (!targetList) return;

            // Remove from backlog
            setBacklogCards((prev) => prev.filter((item) => item.id !== card.id));

            const newPosition = targetList.cards.length;
            const updatedCard = {
                ...card,
                list_id: targetListId,
                is_backlog: false,
                position: newPosition,
            };

            // Add to target list
            setLists((prev) =>
                prev.map((l) =>
                    l.id === targetListId
                        ? {
                              ...l,
                              cards: [...l.cards, updatedCard],
                          }
                        : l
                )
            );

            setDraggedCard(null);
            setDragOverList(null);

            try {
                const response = await fetch(
                    `https://trello-backend-1dsq.onrender.com/api/cards/${card.id}`,
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
                            board_id: Number(boardId),
                            is_backlog: false,
                        }),
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to move card into list");
                }
            } catch (err) {
                console.error("Error moving card from backlog:", err);
                fetchLists();
                fetchBacklog();
            }
            return;
        }

        // CASE 3: Dropping between two board lists
        const sourceList = lists.find((l) => l.id === sourceListId);
        const targetList = lists.find((l) => l.id === targetListId);

        if (!sourceList || !targetList) {
            setDraggedCard(null);
            setDragOverList(null);
            return;
        }

        const updatedSourceCards = sourceList.cards.filter((item) => item.id !== card.id);
        const newPosition = targetList.cards.length;
        const updatedCard = {
            ...card,
            list_id: targetListId,
            position: newPosition,
        };
        const updatedTargetCards = [...targetList.cards, updatedCard];

        setLists((prev) =>
            prev.map((list) => {
                if (list.id === sourceListId) {
                    return { ...list, cards: updatedSourceCards };
                }
                if (list.id === targetListId) {
                    return { ...list, cards: updatedTargetCards };
                }
                return list;
            })
        );

        setDraggedCard(null);
        setDragOverList(null);

        try {
            const response = await fetch(
                `https://trello-backend-1dsq.onrender.com/api/cards/${card.id}`,
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

            if (!response.ok) {
                throw new Error("Failed to update card list");
            }
        } catch (error) {
            console.error("Error moving card:", error);
            fetchLists();
        }
    }

    // --------------------------------------------------
    // CARD FILTER HELPER
    // --------------------------------------------------

    function shouldShowCard(card) {
        if (filterAssignee === "all") return true;
        if (filterAssignee === "unassigned") return !card.assigned_to;
        if (filterAssignee === "my") {
            return currentUser && card.assigned_to === currentUser.user_id;
        }
        return Number(card.assigned_to) === Number(filterAssignee);
    }

    // --------------------------------------------------
    // RENDER HELPERS
    // --------------------------------------------------

    function renderAssigneeBadge(card) {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "8px",
                    gap: "6px",
                }}
            >
                <div
                    className={`card-assignee-badge ${card.assigned_to ? "is-assigned" : ""}`}
                    title={
                        card.assigned_to
                            ? `Assigned to: ${card.assigned_to_name || "User #" + card.assigned_to}`
                            : "Not assigned"
                    }
                >
                    <span className="card-assignee-avatar">
                        {card.assigned_to_name
                            ? card.assigned_to_name[0].toUpperCase()
                            : "?"}
                    </span>
                    <span>
                        {card.assigned_to_name
                            ? card.assigned_to_name
                            : "Unassigned"}
                    </span>
                </div>

                {/* Team Lead quick assign dropdown */}
                {role === "lead" && (
                    <select
                        className="card-assign-select"
                        value={card.assigned_to || ""}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                            handleAssignCard(card.id, e.target.value, e)
                        }
                        title="Provide card to team member"
                    >
                        <option value="">+ Assign to...</option>
                        {teamMembers.map((member) => (
                            <option key={member.user_id} value={member.user_id}>
                                {member.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>
        );
    }

    // --------------------------------------------------
    // LOADING
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="main-content" style={{ padding: "40px", color: "white" }}>
                <p>Loading board &amp; workspace details...</p>
            </div>
        );
    }

    // --------------------------------------------------
    // MAIN RENDER
    // --------------------------------------------------

    return (
        <>
            {/* NAVBAR */}
            <header className="navbar">
                <a className="logo" href="/">
                    FlowDesk
                </a>

                <div className="nav-right">
                    {/* THEME SELECTOR */}
                    <div className="theme-selector" id="themeSelector">
                        <button
                            className={`theme-btn sunset ${theme === "theme-sunset" ? "active" : ""}`}
                            title="Sunset Pink"
                            onClick={() => changeTheme("theme-sunset")}
                        />
                        <button
                            className={`theme-btn magenta ${theme === "theme-magenta" ? "active" : ""}`}
                            title="Neon Magenta"
                            onClick={() => changeTheme("theme-magenta")}
                        />
                        <button
                            className={`theme-btn ocean ${theme === "theme-ocean" ? "active" : ""}`}
                            title="Ocean Blue"
                            onClick={() => changeTheme("theme-ocean")}
                        />
                        <button
                            className={`theme-btn midnight ${theme === "theme-midnight" ? "active" : ""}`}
                            title="Midnight Violet"
                            onClick={() => changeTheme("theme-midnight")}
                        />
                    </div>

                    {/* ROLE TOGGLE */}
                    <div className="role-toggle" id="roleToggle">
                        <button
                            className={`role-btn ${role === "member" ? "active" : ""}`}
                            onClick={() => changeRole("member")}
                        >
                            Team Member
                        </button>
                        <button
                            className={`role-btn ${role === "lead" ? "active" : ""}`}
                            onClick={() => changeRole("lead")}
                        >
                            👑 Team Lead
                        </button>
                    </div>

                    {/* AVATAR */}
                    <div
                        className="avatar"
                        title={currentUser ? currentUser.name : "Active User"}
                    >
                        {currentUser?.name ? currentUser.name[0].toUpperCase() : "U"}
                    </div>
                </div>
            </header>

            {/* MAIN APPLICATION */}
            <div className="app-container">
                {/* SIDEBAR */}
                <aside className="sidebar">
                    <h3>Workspace</h3>
                    <div className="workspace-name">
                        {workspace?.name || "My Workspace"}
                    </div>

                    <nav>
                        <a
                            href={
                                board?.workspace_id
                                    ? `/boards/${board.workspace_id}`
                                    : "/workspace"
                            }
                        >
                            📋 Boards
                        </a>
                        <a href="/workspace">
                            📁 Workspaces
                        </a>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                window.history.pushState({}, "", "/");
                                window.location.reload();
                            }}
                        >
                            🏠 Landing Page
                        </a>
                    </nav>

                    {/* TEAM MEMBERS SUMMARY IN SIDEBAR */}
                    <div style={{ marginTop: "30px", borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: "16px" }}>
                        <div style={{ fontSize: "12px", fontWeight: "700", color: "rgba(255,255,255,0.8)", marginBottom: "8px" }}>
                            👥 Team Members ({teamMembers.length})
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "160px", overflowY: "auto" }}>
                            {teamMembers.map((member) => (
                                <div
                                    key={member.user_id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        fontSize: "12px",
                                        color: "white",
                                        opacity: 0.9,
                                    }}
                                >
                                    <span className="card-assignee-avatar" style={{ width: "16px", height: "16px", fontSize: "8px" }}>
                                        {member.name ? member.name[0].toUpperCase() : "U"}
                                    </span>
                                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {member.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="main-content">
                    {/* BOARD HEADER */}
                    <section className="board-header">
                        <div>
                            <h1>{board?.name || "Board"}</h1>
                            <p style={{ margin: "2px 0 8px 0" }}>
                                {workspace?.name || "Workspace"} / {board?.name || "Board"}
                            </p>

                            {/* ASSIGNEE FILTER BAR */}
                            <div className="filter-bar">
                                <span style={{ fontSize: "12px", fontWeight: "600", color: "rgba(255,255,255,0.8)" }}>
                                    🔍 Filter:
                                </span>
                                <button
                                    className={`filter-btn ${filterAssignee === "all" ? "active" : ""}`}
                                    onClick={() => setFilterAssignee("all")}
                                >
                                    All Cards
                                </button>
                                <button
                                    className={`filter-btn ${filterAssignee === "my" ? "active" : ""}`}
                                    onClick={() => setFilterAssignee("my")}
                                >
                                    👤 My Tasks
                                </button>
                                <button
                                    className={`filter-btn ${filterAssignee === "unassigned" ? "active" : ""}`}
                                    onClick={() => setFilterAssignee("unassigned")}
                                >
                                    Unassigned
                                </button>
                                {teamMembers.length > 0 && (
                                    <select
                                        className="card-assign-select"
                                        value={filterAssignee}
                                        onChange={(e) => setFilterAssignee(e.target.value)}
                                        style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.4)" }}
                                    >
                                        <option value="all" style={{ color: "black" }}>Filter by Member...</option>
                                        {teamMembers.map((m) => (
                                            <option key={m.user_id} value={m.user_id} style={{ color: "black" }}>
                                                {m.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "10px" }}>
                            {role === "lead" && (
                                <button
                                    className="add-backlog-btn"
                                    onClick={() => setShowBacklogModal(true)}
                                    id="addBacklogCardHeaderBtn"
                                >
                                    + Add to Backlog
                                </button>
                            )}
                            <button
                                className="primary-btn"
                                onClick={() => setShowListModal(true)}
                            >
                                + Add List
                            </button>
                        </div>
                    </section>

                    {/* TEAM LEAD BACKLOG TRAY */}
                    {role === "lead" && (
                        <section className="backlog-panel">
                            <div className="backlog-header">
                                <div>
                                    <h2>
                                        Team Lead Backlog ({backlogCards.length})
                                    </h2>
                                    <p className="muted" id="backlogHint">
                                        Stage upcoming work &amp; assign to team members. Drag cards into board lists when ready.
                                    </p>
                                </div>
                                <button
                                    className="add-backlog-btn"
                                    onClick={() => setShowBacklogModal(true)}
                                >
                                    + New Backlog Task
                                </button>
                            </div>

                            <div
                                className={`backlog-cards ${dragOverList === "backlog" ? "drop-target" : ""}`}
                                id="backlogCards"
                                onDragOver={(e) => handleDragOver(e, "backlog")}
                                onDragLeave={() => setDragOverList(null)}
                                onDrop={() => handleDrop("backlog")}
                            >
                                {backlogCards.length === 0 ? (
                                    <p
                                        style={{
                                            color: "rgba(255,255,255,0.7)",
                                            fontSize: "13px",
                                            padding: "16px 0",
                                        }}
                                    >
                                        No backlog cards. Click "+ New Backlog Task" to stage work for your team or drag cards here.
                                    </p>
                                ) : (
                                    backlogCards
                                        .filter(shouldShowCard)
                                        .map((card) => (
                                            <div
                                                className={`card card-status-todo ${
                                                    draggedCard?.card.id === card.id
                                                        ? "dragging"
                                                        : ""
                                                }`}
                                                key={card.id}
                                                draggable={true}
                                                onDragStart={() =>
                                                    handleDragStart(card, "backlog")
                                                }
                                                onDragEnd={handleDragEnd}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        marginBottom: "6px",
                                                    }}
                                                >
                                                    <span className="card-status-badge">
                                                        <span>👑</span>
                                                        <span>Backlog</span>
                                                    </span>

                                                    <div>
                                                        <button
                                                            className="card-action-btn"
                                                            onClick={() => openEditCard(card, true)}
                                                            title="Edit backlog card"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            className="card-action-btn"
                                                            onClick={() => handleDeleteCard(card.id, true)}
                                                            title="Delete backlog card"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>

                                                <h4>{card.title}</h4>
                                                {card.description && <p>{card.description}</p>}

                                                {renderAssigneeBadge(card)}

                                                <div className="card-footer" style={{ marginTop: "8px" }}>
                                                    <span>Backlog #{card.id}</span>
                                                    <span>Drag to List &rarr;</span>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        </section>
                    )}

                    {/* BOARD LISTS */}
                    <section className="board" id="boardLists">
                        {lists.length === 0 ? (
                            <div className="empty-state" style={{ color: "white" }}>
                                No lists yet — click "+ Add List" to create your first list.
                            </div>
                        ) : (
                            [...lists]
                                .sort((a, b) => Number(a.position) - Number(b.position))
                                .map((list) => {
                                    const visibleCards = [...list.cards]
                                        .filter(shouldShowCard)
                                        .sort((a, b) => Number(a.position) - Number(b.position));

                                    return (
                                        <div className="list" key={list.id}>
                                            {/* LIST HEADER */}
                                            <div className="list-header">
                                                <h3>{list.name}</h3>
                                                <span>{visibleCards.length}</span>

                                                <button
                                                    onClick={() => openEditList(list)}
                                                    title="Edit list"
                                                >
                                                    ✏️
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteList(list.id)}
                                                    title="Delete list"
                                                >
                                                    🗑️
                                                </button>
                                            </div>

                                            {/* CARDS */}
                                            <div
                                                className={`cards ${
                                                    dragOverList === list.id
                                                        ? "drop-target"
                                                        : ""
                                                }`}
                                                onDragOver={(e) =>
                                                    handleDragOver(e, list.id)
                                                }
                                                onDragLeave={() =>
                                                    setDragOverList(null)
                                                }
                                                onDrop={() => handleDrop(list.id)}
                                            >
                                                {visibleCards.map((card) => {
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
                                                                handleDragStart(card, list.id)
                                                            }
                                                            onDragEnd={handleDragEnd}
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
                                                                            openEditCard(card, false)
                                                                        }
                                                                        title="Edit card"
                                                                    >
                                                                        ✏️
                                                                    </button>

                                                                    <button
                                                                        className="card-action-btn"
                                                                        onClick={() =>
                                                                            handleDeleteCard(card.id, false)
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

                                                            {/* ASSIGNEE BADGE & SELECT */}
                                                            {renderAssigneeBadge(card)}

                                                            {/* CARD FOOTER */}
                                                            <div className="card-footer" style={{ marginTop: "8px" }}>
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
                                                    setSelectedListId(list.id);
                                                    setShowCardModal(true);
                                                }}
                                            >
                                                + Add Card
                                            </button>
                                        </div>
                                    );
                                })
                        )}

                        {/* ADD LIST BUTTON */}
                        <button
                            className="add-list"
                            onClick={() => setShowListModal(true)}
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
                    onClick={() => setShowListModal(false)}
                >
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>New list</h3>
                        <form onSubmit={handleCreateList}>
                            <input
                                type="text"
                                placeholder="List title (e.g. In Review, QA)"
                                value={listName}
                                onChange={(e) => setListName(e.target.value)}
                                autoFocus
                            />

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="ghost-btn"
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
                                    {creatingList ? "Creating..." : "Add List"}
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
                    onClick={() => setEditingListId(null)}
                >
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Edit list</h3>
                        <form onSubmit={handleUpdateList}>
                            <input
                                type="text"
                                placeholder="List title"
                                value={editingListName}
                                onChange={(e) => setEditingListName(e.target.value)}
                                autoFocus
                            />

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="ghost-btn"
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
                                    {updatingList ? "Updating..." : "Update List"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CREATE CARD MODAL (FOR LISTS) */}
            {showCardModal && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowCardModal(false)}
                >
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>New card</h3>
                        <form onSubmit={handleCreateCard}>
                            <input
                                type="text"
                                placeholder="Card title"
                                value={cardTitle}
                                onChange={(e) => setCardTitle(e.target.value)}
                                maxLength={80}
                                autoFocus
                            />

                            <textarea
                                placeholder="Description"
                                rows={3}
                                value={cardDescription}
                                onChange={(e) => setCardDescription(e.target.value)}
                                maxLength={300}
                            />

                            <div style={{ marginBottom: "16px" }}>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "6px", color: "var(--text-secondary)" }}>
                                    Assign to Team Member:
                                </label>
                                <select
                                    value={cardAssignee}
                                    onChange={(e) => setCardAssignee(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "8px 12px",
                                        borderRadius: "var(--radius-md)",
                                        border: "1px solid var(--border-default)",
                                        fontSize: "14px",
                                    }}
                                >
                                    <option value="">Unassigned</option>
                                    {teamMembers.map((member) => (
                                        <option key={member.user_id} value={member.user_id}>
                                            {member.name} ({member.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="ghost-btn"
                                    onClick={() => {
                                        setShowCardModal(false);
                                        setCardTitle("");
                                        setCardDescription("");
                                        setCardAssignee("");
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
                                    {creatingCard ? "Creating..." : "Save Card"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CREATE BACKLOG CARD MODAL (TEAM LEAD) */}
            {showBacklogModal && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowBacklogModal(false)}
                >
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>👑 Stage Team Lead Backlog Card</h3>
                        <form onSubmit={handleCreateBacklogCard}>
                            <input
                                type="text"
                                placeholder="Task title (e.g. Implement OAuth Flow)"
                                value={backlogTitle}
                                onChange={(e) => setBacklogTitle(e.target.value)}
                                maxLength={80}
                                autoFocus
                            />

                            <textarea
                                placeholder="Task details / acceptance criteria"
                                rows={3}
                                value={backlogDescription}
                                onChange={(e) => setBacklogDescription(e.target.value)}
                                maxLength={300}
                            />

                            <div style={{ marginBottom: "16px" }}>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "6px", color: "var(--text-secondary)" }}>
                                    Provide / Assign to Team Member:
                                </label>
                                <select
                                    value={backlogAssignee}
                                    onChange={(e) => setBacklogAssignee(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "8px 12px",
                                        borderRadius: "var(--radius-md)",
                                        border: "1px solid var(--border-default)",
                                        fontSize: "14px",
                                    }}
                                >
                                    <option value="">Unassigned (Open Backlog)</option>
                                    {teamMembers.map((member) => (
                                        <option key={member.user_id} value={member.user_id}>
                                            {member.name} ({member.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="ghost-btn"
                                    onClick={() => {
                                        setShowBacklogModal(false);
                                        setBacklogTitle("");
                                        setBacklogDescription("");
                                        setBacklogAssignee("");
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={creatingBacklogCard}
                                >
                                    {creatingBacklogCard ? "Staging..." : "Stage Backlog Card"}
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
                    onClick={() => setEditingCardId(null)}
                >
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Edit Card</h3>
                        <form onSubmit={handleUpdateCard}>
                            <input
                                type="text"
                                placeholder="Card title"
                                value={editingCardTitle}
                                onChange={(e) => setEditingCardTitle(e.target.value)}
                                maxLength={80}
                                autoFocus
                            />

                            <textarea
                                placeholder="Description"
                                rows={3}
                                value={editingCardDescription}
                                onChange={(e) => setEditingCardDescription(e.target.value)}
                                maxLength={300}
                            />

                            <div style={{ marginBottom: "16px" }}>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "6px", color: "var(--text-secondary)" }}>
                                    Assigned Team Member:
                                </label>
                                <select
                                    value={editingCardAssignee}
                                    onChange={(e) => setEditingCardAssignee(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "8px 12px",
                                        borderRadius: "var(--radius-md)",
                                        border: "1px solid var(--border-default)",
                                        fontSize: "14px",
                                    }}
                                >
                                    <option value="">Unassigned</option>
                                    {teamMembers.map((member) => (
                                        <option key={member.user_id} value={member.user_id}>
                                            {member.name} ({member.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="ghost-btn"
                                    onClick={() => {
                                        setEditingCardId(null);
                                        setEditingCardTitle("");
                                        setEditingCardDescription("");
                                        setEditingCardAssignee("");
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={updatingCard}
                                >
                                    {updatingCard ? "Updating..." : "Save Changes"}
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