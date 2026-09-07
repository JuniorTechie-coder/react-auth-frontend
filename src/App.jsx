import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Workspace from "./pages/Workspace";
import Board from "./pages/Board";
import BoardDetail from "./pages/BoardDetail";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authView, setAuthView] = useState("login"); // "login" | "register"

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setAuthView("login");
    }

    return (
        <div>
            {isLoggedIn ? (
                window.location.pathname.startsWith("/board/") ? (
                    <BoardDetail />
                ) : window.location.pathname.startsWith("/boards/") ? (
                    <Board />
                ) : (
                    <Workspace handleLogout={handleLogout} />
                )
            ) : authView === "register" ? (
                <Register
                    onSwitchToLogin={() => setAuthView("login")}
                />
            ) : (
                <Login
                    setIsLoggedIn={setIsLoggedIn}
                    onSwitchToRegister={() => setAuthView("register")}
                />
            )}
        </div>
    );
}

export default App;