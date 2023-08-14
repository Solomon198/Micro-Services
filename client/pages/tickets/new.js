import {useState} from 'react';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const NewTicket = ()=>{
    const [title,setTitle] = useState('');
    const [price, setPrice] = useState('');
    const {doRequest,errors} = useRequest({
        method: "post",
        url:"/api/tickets",
        body:{price,title},
        onSuccess:(data)=>{
            Router.push('/')
        }
    })

    const onSubmit = (e)=>{
        e.preventDefault();
        doRequest();
    }

    const onBlur = ()=>{
        const value = parseFloat(price);
        if(isNaN(value)){
            return;
        }
        setPrice(value.toFixed(2))
    }
    return <div>
        <h1>Create Ticket</h1>
        <form onSubmit={onSubmit} >
             <div className="form-group">
                <label>Title</label>
                <input value={title} onChange={(e)=>{setTitle(e.target.value)}} className="form-control"/>
             </div>
             <div className="form-group my-3">
                <label>Price</label>
                <input onBlur={onBlur} value={price} onChange={(e)=>{setPrice(e.target.value)}} className="form-control"/>
             </div>
             {errors}
             <button className="btn btn-primary my-3">Submit</button>
        </form>
    </div>
}

export default NewTicket;