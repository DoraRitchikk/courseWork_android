const express = require("express");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const authRouter = express.Router();

const connectionString = 'postgres://dariaritchik:yR2gpWx8uka8zsyrjiTCDE7SDOE2KozC@dpg-chcb76bhp8u016660cug-a/marketdb_sbwc'
const pool = new Pool({
  connectionString: connectionString,
});

// SIGN UP
authRouter.post("/api/signup", async (req, res) => {
    const { name, email, password } = req.body;

    try {

    const query = 'CALL get_user_by_email($1)';
    const values = [email];

    const { rowCount } = await pool.query(query, values);
    if (rowCount > 0) {
      return res
        .status(400)
        .json({ msg: "User with same email already exists!" });
    }

    const hashedPassword = await bcryptjs.hash(password, 8);
    console.log('Alohaaaa')
    await pool.query('CALL insert_user($1,$2,$3)',[email, hashedPassword, name]);
     res.sendStatus(201);
     
    }
    catch (e) {
    console.error(e)
    res.sendStatus(500);
  }
});

// Sign In Route
// Exercise
authRouter.post("/api/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query('SELECT * from "users" WHERE email like $1',
      [email]
    );
    if (user.rowCount === 0) {
      return res
        .status(400)
        .json({ msg: "User with this email does not exist!" });
    }
    console.log('Aloha')

    const isMatch = await bcryptjs.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect password." });
    }
    const token = jwt.sign({ id: user.rows[0].id }, "passwordKey");
    res.json({ token, ...user.rows[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// get user data
authRouter.get("/", async (req, res) => {
  try {
    const query = 'CALL get_user_by_id(1)';
    const values = [req.user];

    const { rows } = await pool.query(query, values);
    const user = rows[0];

    res.json({ ...user });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = authRouter;

