const broadcast = (data, exclude = null) => {

    const message = JSON.stringify(data);

    for(const [clientId, client] of clients.entries()){

        if(
            client.readyState === client.OPEN &&
            client !== exclude
        ){
            client.send(message);
        }
    }
};


export default broadcast;