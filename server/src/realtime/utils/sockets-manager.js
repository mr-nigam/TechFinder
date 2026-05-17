const technicianSockets =
    new Map();

const addSocket =
(id, ws) => {
    technicianSockets.set(id, ws);
};

const getSocket =
(id) => {
    return technicianSockets.get(id);
};

const removeSocket =
(id) => {
    technicianSockets.delete(id);
};



export {
    technicianSockets,
    addSocket,
    getSocket,
    removeSocket
};