import { useState, useEffect } from "react";

function Dashboard({ setIsLoggedIn }) {
    const [workspaces, setWorkspaces] = useState([]);

    

    useEffect(() => {
        async function getWorkspaces() {
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:3000/api/workspaces', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setIsLoggedIn(false);
                return;
            }

            setWorkspaces(data);
        }

        getWorkspaces();
    }, []);

    return (
        <div>
            <h1>Dashboard</h1>
            <button onClick={handleLogout}>Logout</button>

            <h2>My Workspaces</h2>

            {workspaces.map((workspace) => (
                <div key={workspace.id}>
                    <h3>{workspace.name}</h3>
                    <p>{workspace.description}</p>
                </div>
            ))}
        </div>
    );
}

export default Dashboard;