import mongoose from 'mongoose';

const connectDB = async () => {
    try{
        mongoose.connection.on('connected', ()=>console.log('MongoDB connected'));
        await mongoose.connect(process.env.MONGODB_URI as string, )
    }catch(error){
        console.error('MongoDB connection error:', error);
    }
}

export default connectDB;