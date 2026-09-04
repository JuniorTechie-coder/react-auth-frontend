import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/dashboard';
import Workspace from "./pages/Workspace";



function App() {
  //After succesfull login this state becomes true
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    //if condition to check after loggin the token exist or not?
    //hint token already is set to false
    if(token){
      setIsLoggedIn(true);
    } 
    
  }, []);

  function handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
    }
   
    return (
    <div>
   
      { isLoggedIn ? (

         <Workspace handleLogout={handleLogout} />
      ) : (
          <Login setIsLoggedIn={setIsLoggedIn} />
    
    )}
           
    </div>
      
    
  );

}

export default App;



// <Dashboard setisLoggedIn={setisLoggedIn}/>//ok soo this is called conditional Rendering 
       // ):(
          //Login, here's a function you can call when login succeeds
         // <Login setisLoggedIn={setisLoggedIn}/>
          
        //)
    //}