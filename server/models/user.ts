import mongoose, { Document } from "mongoose";

export interface IUser extends Document{
    name: string;
    email: string;
    password: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const userSchema = new mongoose.Schema<IUser>({
    name: { type: String, required: true,trim: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },

}, { timestamps: true })

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;