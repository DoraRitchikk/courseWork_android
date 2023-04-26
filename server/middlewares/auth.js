const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const connectionString = 'postgres://doraritchik:cjUJjkJiT254pgaVMoOyEvOK69smAEjN@dpg-ch3p3j4eoogsn04lonrg-a.oregon-postgres.render.com/marketdb?ssl=true'

const pool = new Pool({
  connectionString: connectionString,
});

const auth = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    if (!token)
      return res.status(401).json({ msg: 'No auth token, access denied' });

    const decodedToken = jwt.verify(token, 'passwordKey');
    if (!decodedToken)
      return res
        .status(401)
        .json({ msg: 'Token verification failed, authorization denied.' });

    const { rows } = await pool.query('SELECT id FROM "users" WHERE id=$1', [
      decodedToken.id,
    ]);
    if (rows.length !== 1) {
      return res.status(401).json({ msg: 'User not found' });
    }

    req.user = decodedToken.id;
    req.token = token;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = auth;
