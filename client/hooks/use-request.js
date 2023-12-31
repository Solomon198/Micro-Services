import axios from "axios";
import { useState } from "react";



export default  ({url,method,body,onSuccess})=>{
   const [errors,setErrors] = useState(null);

   const doRequest = async ()=> {
         try{
            setErrors(null)
            const response = await axios[method](url,body);
            if(onSuccess){
                onSuccess(response.data);
            }
         }catch(err){
            setErrors( <div className='alert alert-danger my-3'>
            <h4>Ooops</h4>
            <ul>
                {err.response.data.errors.map((error,index)=><li key={index}>
                    {error.message}
                </li>)}
            </ul>
        </div>)
         }
   }

   return {doRequest, errors}
}