import { connectDB } from './config/db.js';
import createUsersTable from '#users/models/user.model.js';


const initDB = async () => {
    try {
        await connectDB();
        
        console.log("All tables created successfully");

        process.exit(0);

    } catch(error){
        
        console.log("Init failed", error);
        process.exit(1);
    }
};


initDB();