const User=require("../model/userModel");
const express=require("express");
const router=express.Router();
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");

router.post("/register", async (req, res) => {
    try {
        const { name, email, username, password } = req.body;

        // Check if user with the same email already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: "User with this email already exists" });
        }

        // Password Hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const user = new User({
            ...req.body,
            password: hashedPassword
        });

        // Save the user to the database
        await user.save();

        res.status(201).json({
            user,
            message: "User created successfully"
        });
    } catch (error) {
        // Handle duplicate key error
        if (error.code === 11000) { // MongoDB error code for duplicate keys
            return res.status(400).json({
                error: "Username already taken"
            });
        }

        // Handle other errors
        res.status(500).json({ error: error.message });
    }
});

router.post("/login",async(req,res)=>{
    try{
        const {email,password}=req.body;
        const user=await User.findOne({email});

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }
        
        // Validate user > Check if user exists
        if(!user){
            return res.status(400).json({error:"Invalid email or password"});
        }

        // Validate password 
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({error:"Invalid email or password"});
        }
        
        const token=jwt.sign({_id:user._id},process.env.JWT_SECRET_KEY);
        res.status(200).json({
            user,
            token,
            message:"Login successful"    
        });
    }catch(error){        
        res.status(500).json({error:error.message});
    }
})

// forget password

module.exports=router;