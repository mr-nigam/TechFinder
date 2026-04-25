import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;


const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const connectDB = async() => {
    try{
        await pool.query('SELECT 1');
        console.log('POSTGRE connected successfully !!');
    }catch(err){
        console.log('POSTGRE connection failed !!');
        process.exit(1);
    }
};


export { pool };
export default connectDB;
