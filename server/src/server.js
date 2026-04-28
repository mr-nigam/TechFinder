import 'dotenv/config';
import { connectDB } from './db/db.js';
import app from './app.js';


const startServer = async () => {
    try {
        await connectDB();

        app.on("error", (error) => {
            console.log("Error:", error);
            throw error;
        });

        const PORT = process.env.PORT || 8000;

        app.listen(PORT, () => {
            console.log(`Server is running at port: ${PORT}`);
        });

    } catch(error){
        
        console.log("POSTGRE db connection failed !!!", error);
    }
};


startServer();