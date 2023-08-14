import {useState,useEffect} from 'react';
import { PaystackButton,usePaystackPayment } from 'react-paystack';


const config = {
    reference: (new Date()).getTime().toString(),
    email: "user@example.com",
    amount: 20000, //Amount is in the country's lowest currency. E.g Kobo, so 20000 kobo = N200
    publicKey: 'pk_test_859b6f03960efb1702afcd149d483ac8a7a2ac95',
  };


const OrderShow = ({order})=>{
    const initializePayment = usePaystackPayment(config);

   const [timeLeft,setTimeLeft] = useState(0);

   const handlePaystackSuccessAction = (reference) => {
    // Implementation for whatever you want to do with reference and after success call.
    console.log(reference);
  };

  const componentProps = {
    ...config,
    text: 'Paystack Button Implementation',
    onSuccess: (reference) => handlePaystackSuccessAction(reference),
};

  // you can call this function anything
  const handlePaystackCloseAction = () => {
    // implementation for  whatever you want to do when the Paystack dialog closed.
    console.log('closed')
  }
   useEffect(()=>{
     const findTimeLeft = ()=>{
        const ttLeft = new Date(order.expiresAt) - new Date();
        if(ttLeft < 0){
            clearTimeout(timer)
        }
        setTimeLeft(Math.round(ttLeft/1000))
     }

     let timer = setInterval(findTimeLeft,1000);
     findTimeLeft();

     return ()=>{
        clearTimeout(timer);
     }

   },[])
   if(timeLeft < 0) {
      return <div>Order Expired {timeLeft}</div>
   }
   return  <div>
   <p> Time Left to Pay: {timeLeft} Seconds</p>
   <PaystackButton onClose={()=>{console.log("working")}} {...componentProps} />

</div>
}


OrderShow.getInitialProps = async(context,client)=>{
    const {orderId} = context.query;
    const {data} = await client.get(`/api/orders/${orderId}`);
    return {order:data};
}


export default OrderShow;