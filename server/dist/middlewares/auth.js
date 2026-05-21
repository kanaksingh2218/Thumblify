const protect = async (req, res, next) => {
    const { isLoggedIn, userId } = req.session;
    if (!isLoggedIn || !userId) {
        return res.status(401).json({ message: 'You are not logged in' });
    }
    next();
};
export default protect;
