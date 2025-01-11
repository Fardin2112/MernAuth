import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        mongoose.connection.on('connected', () => 
            console.log("Database Connected")
        );

        mongoose.connection.on('error', (err) => 
            console.error("Database connection error:", err)
        );
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err.message);
        process.exit(1); // Exit the process with an error
    }
};

export default connectDB;
