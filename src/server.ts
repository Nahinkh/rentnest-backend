import app from "./app";
import envConfig from "./config/envConfig";
import { prisma } from "./db";

const PORT = envConfig.port;

async function main() {
    try {
        await prisma.$connect();
        console.log("Connected to the database successfully.");
       app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
       }) 
    } catch (error) {
        console.error("Error starting the server:", error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();