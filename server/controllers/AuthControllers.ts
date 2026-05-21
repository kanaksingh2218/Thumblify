import { Request, Response } from 'express';
import User from '../models/user.js';
import bcrypt from 'bcrypt';

// Controllers for user registration

export const registerUser = async (req: Request, res: Response) => {
    
try{
    const {name, email, password} = req.body;

    //find user by email
    const user = await User.findOne({email});
    if(user){
        return res.status(400).json({message: 'User already exists'});
    }
    
    // Encrypt password

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
        name,
        email,
        password: hashedPassword
    });

    await newUser.save();

    req.session.isLoggedIn = true;
    req.session.userId = newUser._id;

    return res.json({message: 'Account created successfully', user: {id: newUser._id, name: newUser.name, email: newUser.email}});

}catch(error: any){
    console.error(error);
    res.status(500).json({message: error.message });

}
}

//Controllers for user login

export const LoginUser = async (req: Request, res: Response) => {
    try{
    const {email, password} = req.body;

    //find user by email
    const user = await User.findOne({email});
    if(!user){
        return res.status(400).json({message: 'Invalid email or password'});
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    
    if(!isPasswordCorrect){
        return res.status(400).json({message: 'Invalid email or password'});
    }

    req.session.isLoggedIn = true;
    req.session.userId = user._id;

    return res.json({message: 'Login successful', user: {id: user._id, name: user.name, email: user.email}});

}catch(error: any){
    console.error(error);
    res.status(500).json({message: error.message });

}
    
}


//Controllers for user logout

export const logoutUser = async (req: Request, res: Response) => {
    req.session.destroy((error: any)=>{
        if(error){
            console.error(error);
            return res.status(500).json({message: error.message });
        }
    })
    return res.json({message: 'Logout successful'});
}

//Controllers for user verify

export const verifyUser = async (req: Request, res: Response) => {
    try {
        const {userId} = req.session;

        const user = await User.findById(userId).select('-password');

        if(!user){
            return res.status(404).json({message: 'Invalid user'});
        }

        return res.json({user})
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({message: error.message });
    }
}


