import useRequest from "../../hooks/use-request";
import Router from 'next/router'

const TicketShow = ({ticket})=>{
    const {doRequest,errors} = useRequest({
        method:"post",
        url:"/api/orders",
        body:{ticketId:ticket.id},
        onSuccess:(data)=>{
           Router.push('/orders/[orderId]',`/orders/${data.id}`)
        }
    });
    return <div>
        <h1>{ticket?.title}</h1>
        <h4>${ticket?.price}</h4>
        {errors}
        <button onClick={doRequest} className="btn btn-primary">Purchase</button>
    </div>
}


TicketShow.getInitialProps = async(context,client)=>{
    const {ticketId} = context.query;
    const { data } = await client.get(`/api/tickets/${ticketId}`);
    return {ticket:data}
}

export default TicketShow;