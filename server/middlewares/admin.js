const jwt = require("jsonwebtoken");
const { Pool } = require("pg");


const connectionString = 'postgres://dariaritchik:yR2gpWx8uka8zsyrjiTCDE7SDOE2KozC@dpg-chcb76bhp8u016660cug-a.oregon-postgres.render.com/marketdb_sbwc?ssl=true'
const pool = new Pool({
  connectionString : connectionString});

const admin = async (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token)
      return res.status(401).json({ msg: "No auth token, access denied" });

    const verified = jwt.verify(token, "passwordKey");
    if (!verified)
      return res
        .status(401)
        .json({ msg: "Token verification failed, authorization denied." });

    const userQuery = {
      text: 'SELECT * FROM "users" WHERE id = $1',
      values: [verified.id],
    };
    const { rows } = await pool.query(userQuery);
    const user = rows[0];

    if (user.type === "user" || user.type === "seller") {
      return res.status(401).json({ msg: "You are not an admin!" });
    }
    req.user = verified.id;
    req.token = token;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = admin;
