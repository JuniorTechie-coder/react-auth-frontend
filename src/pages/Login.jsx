import {useState} from 'react';


function Login({setisLoggedIn}) {
    const [email, setEmail]= useState('');
    const [password, setPassword] = useState('');
    //two input feields

    async function handleLogin() {
        //This is Login request
         const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })

    })
  
        //This is Backend Response
        const data = await response.json();
        if(response.ok){
            console.log('Login Successfull!', data);
            //is response ok? store JWT
            localStorage.setItem('token', data.token); 
            //To store user data      
            localStorage.setItem('user', JSON.stringify({
            user_id: data.user_id,
            name: data.name,
            email: data.email
            }));

            //set true
            setisLoggedIn(true);
        } else{
            console.log("Login failed", data);
        }

        
       
    }


return(
    <div>
        <input type="email" value={email} onChange  ={(e)=> setEmail(e.target.value)} placeholder='Enter your Email' />
        <input type='password' value={password} onChange ={(e) => setPassword(e.target.value)} placeholder='Enter your password' />

        <button onClick = {handleLogin}> Login In </button><br></br>
       
    </div>
    
    );
 }


export default Login;
    
    

