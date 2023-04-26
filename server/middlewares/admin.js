const jwt = require("jsonwebtoken");
const { Pool } = require('pg');

const connectionString = 'postgres://doraritchik:cjUJjkJiT254pgaVMoOyEvOK69smAEjN@dpg-ch3p3j4eoogsn04lonrg-a.oregon-postgres.render.com/marketdb?ssl=true'

const pool = new Pool({
  connectionString: connectionString,
});

const admin = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM "users" WHERE id = $1', [id]);
    const user = rows[0];

    if (user.type === "user" || user.type === "seller") {
      return res.status(401).json({ msg: "You are not an admin!" });
    }

    req.user = id;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = admin;
