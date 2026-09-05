import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Workspace from "./pages/Workspace";
import Board from "./pages/Board";
import BoardDetail from "./pages/BoardDetail";

function App() {

    const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    }

    return (
        <div>

            {isLoggedIn ? (

                window.location.pathname.startsWith("/board/") ? (

                    <BoardDetail />

                ) : window.location.pathname.startsWith("/boards/") ? (

                    <Board />

                ) : (

                    <Workspace
                        handleLogout={handleLogout}
                    />

                )

            ) : (

                <Login
                    setIsLoggedIn={setIsLoggedIn}
                />

            )}

        </div>
    );
}

export default App;