import {useState} from "react";

function Register() {
    const [name, setName] = useState('');
    const [email,setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [registered, setRegistered] = useState('');


     async function handleRegister(){
        const response = await fetch('http://localhost:3000/api/auth/register', {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          // Sending the data as JSON in the request body
          body: JSON.stringify({
            name,
            email,
            password
          })

        })

        //now we have used setRegister to update the state variable(registered) registered with the message received from the backend. This will allow us to display the registration status to the user.
        const data = await response.json();
        if(response.ok){
          setRegistered(data.message);
          
        } else {
          setRegistered(data.error);
        }
      }

    return(
        <div>
            <input type = 'text' value={name} onChange= {(e) => setName(e.target.value)} placeholder='Enter your name'/>
            <input type = 'email' value={email} onChange= {(e) => setEmail(e.target.value)} placeholder='Enter your email'/>
            <input type = 'password' value={password} onChange= {(e) => setPassword(e.target.value)} placeholder='Enter your password'/>
            <p>{registered}</p>
           <button onClick = {handleRegister}> Register</button>
        </div>
    )
}

export  default Register;