import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/dashboard';



function App() {
  //After succesfull login this state becomes true
  const [isLoggedIn, setisLoggedIn] = useState(false);
   
    return (
    <div>
   
      { isLoggedIn ? (
            <Dashboard/>//ok soo this is called conditional Rendering 
        ):(
          //Login, here's a function you can call when login succeeds
          <Login setisLoggedIn={setisLoggedIn}/>
          
        )
    }
    </div>
      
    
  );

}

export default App;