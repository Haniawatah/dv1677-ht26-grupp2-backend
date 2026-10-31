import jwt from "jsonwebtoken";

export default function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "No token provided" });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ error: "Invalid token format" });
    }

    try {
        const decoded = jwt.verify(parts[1], process.env.JWT_SECRET);
        req.user = { id: decoded.id, email: decoded.email };
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}