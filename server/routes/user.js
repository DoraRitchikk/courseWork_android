const express = require("express");
const userRouter = express.Router();
const auth = require("../middlewares/auth");
const { Pool } = require("pg");

const connectionString = 'postgres://dariaritchik:yR2gpWx8uka8zsyrjiTCDE7SDOE2KozC@dpg-chcb76bhp8u016660cug-a.oregon-postgres.render.com/marketdb_sbwc?ssl=true'

const pool = new Pool({
  connectionString: connectionString,
});

userRouter.post("/api/add-to-cart", auth, async (req, res) => {
  try {
    const { id } = req.body;
    const { rows } = await pool.query("CALL get_product_by_id($1)", [
      id,
    ]);
    const product = rows[0];
    let { rows: userRows } = await pool.query(
      'CALL get_user_by_id($1)',
      [req.user]
    );
    let user = userRows[0];

    if (user.cart.length == 0) {
      user.cart.push({ product, quantity: 1 });
    } else {
      let isProductFound = false;
      for (let i = 0; i < user.cart.length; i++) {
        if (user.cart[i].product.id === product.id) {
          isProductFound = true;
        }
      }

      if (isProductFound) {
        let producttt = user.cart.find((productt) =>
          productt.product.id === product.id
        );
        producttt.quantity += 1;
      } else {
        user.cart.push({ product, quantity: 1 });
      }
    }
    let jsonCart = JSON.stringify(user.cart);
    await pool.query('CALL update_user_cart($1,$2)', [
      jsonCart,
      user.id,
    ]);
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

userRouter.delete("/api/remove-from-cart/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("CALL get_product_by_id($1)", [
      id,
    ]);
    const product = rows[0];
    let { rows: userRows } = await pool.query(
      'CALL get_user_by_id($1)',
      [req.user]
    );
    let user = userRows[0];

    for (let i = 0; i < user.cart.length; i++) {
      if (user.cart[i].product.id === product.id) {
        if (user.cart[i].quantity == 1) {
          user.cart.splice(i, 1);
        } else {
          user.cart[i].quantity -= 1;
        }
      }
    }
    await pool.query('CALL update_user_cart($1,$2)', [
      user.cart,
      user.id,
    ]);
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// save user address
userRouter.post("/api/save-user-address", auth, async (req, res) => {
  try {
    const { address } = req.body;
    const client = await pool.connect();
    let result = await client.query(
      'CALL update_user_address($1, $2)',
      [address, req.user]
    );
    client.release();
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// order product
userRouter.post("/api/order", auth, async (req, res) => {
  try {
    const { cart, totalPrice, address } = req.body;
    let products = [];

    const client = await pool.connect();
    await client.query("BEGIN");

    for (let i = 0; i < cart.length; i++) {
      let result = await client.query(
        "CALL get_product_by_id($1)",
        [cart[i].productId]
      );
      let product = result.rows[0];

      if (product.quantity >= cart[i].quantity) {
        await client.query(
          "CALL update_product_quantity($1,$2)",
          [cart[i].quantity, product.id]
        );
        
        products.push({ productId: product.id, quantity: cart[i].quantity });
      } else {
        await client.query("ROLLBACK");
        client.release();
        return res
          .status(400)
          .json({ msg: `${product.name} is out of stock!` });
      }
    }

    let result = await client.query(
      'update_user_cart($1,$2)',
      [[], req.user]
    );
    let user = result.rows[0];

    let prod = JSON.stringify(products)
    result = await client.query(
      "CALL create_order($1,$2,$3,$4,$5))",
      [prod, totalPrice, address, req.user, new Date().getTime()]
    );
    let order = result.rows[0];

    await client.query("COMMIT");
    client.release();

    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

userRouter.get("/api/orders/me", auth, async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      "CALL get_user_orders($1)",
      [req.user]
    );
    const orders = result.rows;
    client.release();
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = userRouter;
