import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/dashboard';



function App() {
  //After succesfull login this state becomes true
  const [isLoggedIn, setisLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    //if condition to check after loggin the token exist or not?
    //hint token already is set to false
    if(token){
      setisLoggedIn(true);
    } 
    
  }, []);
   
    return (
    <div>
   
      { isLoggedIn ? (
            <Dashboard setisLoggedIn={setisLoggedIn}/>//ok soo this is called conditional Rendering 
        ):(
          //Login, here's a function you can call when login succeeds
          <Login setisLoggedIn={setisLoggedIn}/>
          
        )
    }
    </div>
      
    
  );

}

export default App;