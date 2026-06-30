import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/util.js";
import crypto from "crypto";
import sendEmail from "../lib/mailer.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";

const googleClient = process.env.GOOGLE_CLIENT_ID
    ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
    : null;

export const signup = async (req, res) => {
    const{fullName,email,password}=req.body;
    try{
        if(!fullName || !email || !password){       
            return res.status(400).json({message:"Please provide all required fields"});
        }
        if(password.length<6){
            return res.status(400).json({message:"Password must be at least 6 characters long"});
        }
        const user = await User.findOne({email}); 
        if(user){
            return res.status(400).json({message:"User already exists"});
        }
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);
        const newUser= new User({
            fullName,
            email,
            password:hashedPassword
        });

       if(newUser){
        const token = generateToken(newUser._id, res);
        await newUser.save();
        res.status(201).json({ message: "User registered successfully", token });
       }else{
        res.status(400).json({message:"Failed to register user"});
       }
    }catch(error){
        console.error("Error during signup:", error.message);
        if(error.message.includes("connect")) {
            return res.status(503).json({ message: "Database connection error. Please try again later." });
        }
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!googleClient) {
            return res.status(500).json({ message: "Google auth is not configured on the backend" });
        }

        if (!credential) {
            return res.status(400).json({ message: "Google credential is required" });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const email = payload?.email;
        const fullName = payload?.name || payload?.given_name || "Google User";
        const googleId = payload?.sub;
        const profilePic = payload?.picture;

        if (!email || !googleId) {
            return res.status(400).json({ message: "Invalid Google account data" });
        }

        let user = await User.findOne({ email });

        if (user) {
            user.authProvider = "google";
            user.googleId = googleId;
            if (!user.profilePic && profilePic) {
                user.profilePic = profilePic;
            }
            await user.save();
        } else {
            user = await User.create({
                fullName,
                email,
                password: undefined,
                authProvider: "google",
                googleId,
                profilePic: profilePic || undefined,
            });
        }

        const token = generateToken(user._id, res);

        return res.status(200).json({
            message: "Google authentication successful",
            token,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePic: user.profilePic,
                authProvider: user.authProvider,
            },
        });
    } catch (error) {
        console.error("Error during Google auth:", error.message);
        return res.status(500).json({ message: "Google authentication failed", error: error.message });
    }
};

export const login = async (req, res) => {
   const { email, password } = req.body;
   try {
       const user= await User.findOne({ email });
       if(!user){
        return res.status(400).json({message:"Invalid email or password"});
       }
       if (user.authProvider === "google" && !user.password) {
        return res.status(400).json({message:"Please sign in with Google"});
       }
       const isMatch= await bcrypt.compare(password,user.password);
       if(!isMatch){
        return res.status(400).json({message:"Invalid email or password"});
       }
       const token= generateToken(user._id,res);
       res.status(200).json({
        _id:user._id,
        fullName:user.fullName,
        email:user.email,
        profilePic:user.profilePic,
        token,
       });
   } catch (error) {
       console.log("Error during login:", error.message);
       res.status(500).json({ message: "Internal server error", error: error.message });
   }
};

export const logout = (req, res) => {
   try {
    res.cookie("jwt", "", {maxAge: 0});
    res.status(200).json({message:"Logged out successfully"});
   } catch (error) {
    console.error("Error during logout:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
   }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { fullName, email, username, bio, profilePic, currentPassword, password } = req.body;

        const currentUser = await User.findById(userId).select('+password');
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updatePayload = {};
        if (fullName) updatePayload.fullName = fullName;
        if (email) updatePayload.email = email;
        if (username) updatePayload.username = username;
        if (bio !== undefined) updatePayload.bio = bio;

        if (password !== undefined && password !== '') {
            if (currentUser.password) {
                if (!currentPassword) {
                    return res.status(400).json({ message: 'Current password is required to change password' });
                }
                const passwordMatch = await bcrypt.compare(currentPassword, currentUser.password);
                if (!passwordMatch) {
                    return res.status(400).json({ message: 'Current password is incorrect' });
                }
            }
            if (password.length < 6) {
                return res.status(400).json({ message: 'New password must be at least 6 characters long' });
            }
            const salt = await bcrypt.genSalt(10);
            updatePayload.password = await bcrypt.hash(password, salt);
        }

        if (typeof profilePic === 'string' && profilePic.trim()) {
            if (profilePic.startsWith('http')) {
                updatePayload.profilePic = profilePic;
            } else {
                const uploadResponse = await cloudinary.uploader.upload(profilePic);
                updatePayload.profilePic = uploadResponse.secure_url;
            }
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updatePayload, {
            new: true,
            runValidators: true,
            context: 'query',
        }).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user: updatedUser });
    } catch (error) {
        console.error("Error during profile update:", error.message);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Username or email already in use' });
        }
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Please provide an email" });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "No user with that email" });

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        const subject = "Password reset request";
        const text = `You requested a password reset. Click here to reset: ${resetUrl}`;
        const html = `<p>You requested a password reset.</p><p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`;

        await sendEmail({ to: user.email, subject, text, html });

        res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
        console.error("Error in forgotPassword:", error.message);
        // attempt to clear token on error
        try {
            if (req.body.email) {
                const u = await User.findOne({ email: req.body.email });
                if (u) {
                    u.resetPasswordToken = null;
                    u.resetPasswordExpires = null;
                    await u.save();
                }
            }
        } catch (e) {
            console.error("Error clearing reset token:", e.message);
        }
        res.status(500).json({ message: "Error sending reset email", error: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        if (!token) return res.status(400).json({ message: "Invalid or missing token" });
        if (!password || password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ message: "Token is invalid or has expired" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        const tokenJwt = generateToken(user._id, res);
        res.status(200).json({ message: "Password reset successful", token: tokenJwt });
    } catch (error) {
        console.error("Error in resetPassword:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};