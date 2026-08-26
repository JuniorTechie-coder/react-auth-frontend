import {useState} from 'react';
import React from 'react';

function Login() {
    const [email, setEmail]= useState('');
    const [password, setPassword] = useState('');
    //two input feields

    function handleLogin() {
         console.log('Email:', email, 'Password:', password);
        }

    return(
    <div>
        <input type="email" value={email} onChange  ={(e)=> setEmail(e.target.value)} placeholder='Enter your Email' />
        <input type='password' value={password} onChange ={(e) => setPassword(e.target.value)} placeholder='Enter your password' />

        <button onClick = {handleLogin}> Login In </button>
    </div>
    
    );
}

export default Login;
    
    

