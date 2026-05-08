import { connectDB } from '#config/db.js';
import createUsersTable from '#modules/users/models/user.model.js';
import createAddressTable from '#modules/users/models/address.model.js';
import createAddressesAssetsTable from '#modules/users/models/addressAsset.model.js';
import createPhonesTable from '#modules/users/models/phone.model.js';


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