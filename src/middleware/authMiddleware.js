import jwt from 'jsonwebtoken';

export default function authMiddleware(handler) {
  return async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = decoded; // Add user info to the request
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token.' });
    }
  };
}
