import {useState} from 'react'
import useRequest from '../../hooks/use-request';
import Router  from 'next/router';

export default ()=>{
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const onSuccess = (res)=>{
        console.log(res)
        Router.push("/")
    }
    const {errors,doRequest} = useRequest({url:"/api/users/signin",method:"post",body:{email,password},onSuccess})
    const onSubmit = async (e)=>{
        e.preventDefault();
        
        await doRequest();
    
        
    }
    return <form className='container' onSubmit={onSubmit}>
        <h1>Signin</h1>
        <div className="form-group">
            <label>Email Adress</label>
            <input 
               onChange={e=>{setEmail(e.target.value)}} 
               value={email} 
               className="form-control"/>
        </div>
        <div className="form-group">
            <label>Password</label>
            <input 
                onChange={e=>{setPassword(e.target.value)}} 
                password={password} 
                type="password" 
                className="form-control"/>
        </div>
          {errors}
        <button className="btn btn-primary mt-3">SignIn</button>
    </form>
}