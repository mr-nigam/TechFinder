import { 
    ApiError
} from '#shared';


const sendRealtime = (ws, payload = {}) => {

    if(!ws){
        throw new ApiError(
            400,
            'WebSocket instance required'
        );
    }

    // ws package OPEN state
    if(ws.readyState !== 1){
        return false;
    }

    try{
        ws.send(
            JSON.stringify({
                timestamp: Date.now(),
                ...payload
            })
        );

        return true;
    
    }catch(error){
        throw new ApiError(
            500,
            error.message || 'Failed to send websocket message'
        );
    }
};


export default sendRealtime;