import { useState, useEffect } from "react";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Workspace from "./pages/Workspace";
import Board from "./pages/Board";
import BoardDetail from "./pages/BoardDetail";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authView, setAuthView] = useState("landing"); // "landing" | "login" | "register"
    const [currentPath, setCurrentPath] = useState(window.location.pathname);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            setIsLoggedIn(true);
        }

        const handlePopState = () => {
            setCurrentPath(window.location.pathname);
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setAuthView("landing");
        window.history.pushState({}, "", "/");
        setCurrentPath("/");
    }

    function navigateTo(path) {
        window.history.pushState({}, "", path);
        setCurrentPath(path);
    }

    // Determine what to render
    if (isLoggedIn) {
        if (currentPath.startsWith("/board/")) {
            return <BoardDetail />;
        }
        if (currentPath.startsWith("/boards/")) {
            return <Board />;
        }
        if (currentPath === "/workspace" || currentPath === "/workspaces") {
            return <Workspace handleLogout={handleLogout} />;
        }
        // If at root '/' and authView is landing, show Landing with Open Workspace button
        if (authView === "landing" && currentPath === "/") {
            return (
                <Landing
                    onOpenWorkspace={() => navigateTo("/workspace")}
                    onOpenLogin={() => setAuthView("login")}
                    onOpenRegister={() => setAuthView("register")}
                    isLoggedIn={true}
                />
            );
        }
        return <Workspace handleLogout={handleLogout} />;
    }

    // Unauthenticated state
    if (authView === "login") {
        return (
            <Login
                setIsLoggedIn={(val) => {
                    setIsLoggedIn(val);
                    setAuthView("landing");
                    navigateTo("/workspace");
                }}
                onSwitchToRegister={() => setAuthView("register")}
            />
        );
    }

    if (authView === "register") {
        return (
            <Register
                onSwitchToLogin={() => setAuthView("login")}
            />
        );
    }

    // Default unauthenticated view: Landing Page
    return (
        <Landing
            onOpenWorkspace={() => setAuthView("login")}
            onOpenLogin={() => setAuthView("login")}
            onOpenRegister={() => setAuthView("register")}
            isLoggedIn={false}
        />
    );
}

export default App;