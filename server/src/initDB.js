import { connectDB } from '#config/db';
import createUsersTable from '#modules/users/models/user.model';
import createAddressTable from '#modules/users/models/address.model';
import createAddressesAssetsTable from '#modules/users/models/addressAsset.model';
import createPhonesTable from '#modules/users/models/phone.model';


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