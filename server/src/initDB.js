import { connectDB } from './db/db.js';
import createUsersTable from './models/user.models.js';
import createAddressTable from './models/address.models.js';
import createContactsTable from './models/contact.models.js';


const initDB = async () => {
    try {
        await connectDB();

        await createUsersTable();
        await createAddressTable();
        await createContactsTable();

        console.log("All tables created successfully");

        process.exit(0);

    } catch(error){
        
        console.log("Init failed", error);
        process.exit(1);
    }
};


initDB();