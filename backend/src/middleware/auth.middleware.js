const { clerkClient } = require('@clerk/express');

const protectRoute = async (req, res, next) => {
    if (!req.auth || !req.auth.userId) {
        return res.status(401).json({
            message: "unauthorized - you must be logged in"
        });
    }
    return next();
}

const isAdminUser = async (userId) => {
    try {
        const currentUser = await clerkClient.users.getUser(userId);
        const primaryEmail = currentUser?.primaryEmailAddress?.emailAddress;
        return process.env.ADMIN_EMAIL && primaryEmail && process.env.ADMIN_EMAIL === primaryEmail;
    } catch (err) {
        console.error('isAdminUser error:', err?.message || err);
        return false;
    }
};

const requireAdmin = async (req, res, next) => {
    try {
        if (!req.auth || !req.auth.userId) {
            return res.status(401).json({ message: 'unauthorized - missing user id' });
        }

        const isAdmin = await isAdminUser(req.auth.userId);

        if (!isAdmin) {
            return res.status(403).json({
                message: "forbidden - admin only"
            });
        }

        return next();
    } catch (err) {
        console.error('requireAdmin error:', err?.message || err);
        return res.status(500).json({ message: 'internal server error' });
    }
}

module.exports = { protectRoute, requireAdmin, isAdminUser };