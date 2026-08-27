import {useState} from 'react';


function Login() {
    const [email, setEmail]= useState('');
    const [password, setPassword] = useState('');
    //two input feields

    async function handleLogin() {
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

        const data = await response.json();
        console.log(data);
        localStorage.setItem('token', data.token); 
    }


async function getWorkspaces() {
    const token = localStorage.getItem('token');

    const response = await fetch('http://localhost:3000/api/workspaces', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
})
         //Reading the data 
       const data = await response.json();
       console.log(data);
}

   
return(
    <div>
        <input type="email" value={email} onChange  ={(e)=> setEmail(e.target.value)} placeholder='Enter your Email' />
        <input type='password' value={password} onChange ={(e) => setPassword(e.target.value)} placeholder='Enter your password' />

        <button onClick = {handleLogin}> Login In </button><br></br>
        <button onClick = {getWorkspaces}> Get my workspaces</button>
    </div>
    
    );
 }


export default Login;
    
    

