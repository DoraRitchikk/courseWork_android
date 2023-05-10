const express = require("express");
const { Pool } = require("pg");
const productRouter = express.Router();

const connectionString = 'postgres://dariaritchik:yR2gpWx8uka8zsyrjiTCDE7SDOE2KozC@dpg-chcb76bhp8u016660cug-a.oregon-postgres.render.com/marketdb_sbwc?ssl=true'

const pool = new Pool({
  connectionString: connectionString,
});

productRouter.get("/api/products/", async (req, res) => {
  try {
    const query = {
      text: "SELECT * FROM products WHERE category=$1",
      values: [req.query.category],
    };

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

productRouter.get("/api/products/search/:name", async (req, res) => {
  try {
    const query = {
      text: "SELECT * FROM products WHERE name LIKE $1",
      values: [`%${req.params.name}%`],
    };

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

productRouter.post("/api/rate-product", async (req, res) => {
  try {
    const { id, rating } = req.body;
    let query = {
      text: "SELECT * FROM products WHERE id=$1",
      values: [id],
    };
    let result = await pool.query(query);
    let product = result.rows[0];

    for (let i = 0; i < product.ratings.length; i++) {
      if (product.ratings[i].userId == req.user) {
        product.ratings.splice(i, 1);
        break;
      }
    }

    const ratingSchema = {
      userId: req.user,
      rating,
    };

    product.ratings.push(ratingSchema);

    query = {
      text: "UPDATE products SET ratings=$1 WHERE id=$2 ",
      values: [product.ratings, id],
    };
    result = await pool.query(query);
    product = result.rows[0];

    res.json(product);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

productRouter.get("/api/deal-of-day", async (req, res) => {
  try {
    const query = {
      text: "SELECT * FROM products",
    };

    const result = await pool.query(query);
    let products = result.rows;

    products = products.sort((a, b) => {
      let aSum = 0;
      let bSum = 0;

      for (let i = 0; i < a.ratings.length; i++) {
        aSum += a.ratings[i].rating;
      }

      for (let i = 0; i < b.ratings.length; i++) {
        bSum += b.ratings[i].rating;
      }
      return aSum < bSum ? 1 : -1;
    });

    res.json(products[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = productRouter;
