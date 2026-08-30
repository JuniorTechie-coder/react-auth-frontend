import { useState, useEffect } from "react";


function Dashboard({setisLoggedIn}){
    const [workspaces, setworkspaces] = useState([]);

    useEffect(() => {
        async function getWorkspaces() {
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:3000/api/workspaces', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            console.log('My workspaces:', data);

            //"Whatever the backend returned, put it inside my workspaces state."
            setworkspaces(data);
        }
        

        getWorkspaces();

    }, []);

     function handleLogout(){

     localStorage.removeItem('token');
     localStorage.removeItem('user');
     setisLoggedIn(false);
    }

    
    return(
    <div>
         <h1>Dashboard 1</h1>
         <h2>My workspaces</h2>
         

         {workspaces.map((workspace) =>( 
           <div key ={workspace.id}>
            <h3>{workspace.name}</h3>
            <p>{workspace.description}</p>
            <button onClick = {handleLogout}>Logout</button>
            </div> 
    ))}
    </div>
    );

  
}

export default Dashboard ;