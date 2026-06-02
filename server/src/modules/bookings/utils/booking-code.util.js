import bookingRedis from 
'#config/redis/booking.redis.js';

const generateBookingCode = async () => {

    const today =
        new Date()
        .toISOString()
        .slice(0,10)
        .replace(/-/g,'');

    const key =
        `booking_seq:${today}`;

    const seq =
        await bookingRedis.incr(key);

    if(seq === 1){
        await bookingRedis.expire(
            key,
            86400
        );
    }

    return `BK-${today}-${String(
        seq
    ).padStart(4,'0')}`;
};


export default generateBookingCode;