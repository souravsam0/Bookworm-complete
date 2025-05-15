import jwt from "jsonwebtoken";
import User from "../../models/User.js";

const protectRoute = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        
        if (!authHeader) {
            return res.status(401).json({message: "No authentication token provided, access denied"});
        }
        
        // get token
        const token = authHeader.startsWith("Bearer ") 
            ? authHeader.replace("Bearer ", "") 
            : authHeader;

        if(!token) {
            return res.status(401).json({message: "No authentication token, access denied"});
        }

        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decoded || !decoded.userId) {
            return res.status(401).json({message: "Token is invalid or malformed"});
        }

        // find user from the database
        const user = await User.findById(decoded.userId).select("-password");

        if(!user) {
            return res.status(401).json({message: "User not found, access denied"});
        }

        req.user = user;
        next();

    } catch (error) {
        console.error("Authentication error", error.message || error);
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({message: "Invalid token"});
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({message: "Token has expired"});
        }
        res.status(401).json({message: "Authentication failed"});
    }
};

export default protectRoute;