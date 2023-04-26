    const express = require("express");
    const adminRouter = express.Router();
    const admin = require("../middlewares/admin");
    const { Pool } = require("pg");
  
    const connectionString = 'postgres://doraritchik:cjUJjkJiT254pgaVMoOyEvOK69smAEjN@dpg-ch3p3j4eoogsn04lonrg-a.oregon-postgres.render.com/marketdb?ssl=true'

    const pool = new Pool({
      connectionString: connectionString,
    });
    
    // Add product
    adminRouter.post("/admin/add-product", admin, async (req, res) => {
      try {
        const { name, description, images, quantity, price, category } = req.body;
        const client = await pool.connect();
        const queryText = "INSERT INTO products(name, description, images, quantity, price, category) VALUES($1, $2, $3, $4, $5, $6) RETURNING *";
        const values = [name, description, images, quantity, price, category];
        const result = await client.query(queryText, values);
        product = result.rows[0];
        client.release();
        res.json(product);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });
    
    // Get all your products
    adminRouter.get("/admin/get-products", admin, async (req, res) => {
      try {
        const client = await pool.connect();
        const queryText = "SELECT * FROM products";
        const result = await client.query(queryText);
        const products = result.rows;
        client.release();
        res.json(products);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });
    
    // Delete the product
    adminRouter.post("/admin/delete-product", admin, async (req, res) => {
      try {
        const { id } = req.body;
        const client = await pool.connect();
        const queryText = "DELETE FROM products WHERE id = $1";
        const values = [id];
        const result = await client.query(queryText, values);
        const product = result.rows[0];
        client.release();
        res.json(product);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });
    
    adminRouter.get("/admin/get-orders", admin, async (req, res) => {
      try {
        const client = await pool.connect();
        const queryText = "SELECT * FROM orders";
        const result = await client.query(queryText);
        const orders = result.rows;
        client.release();
        res.json(orders);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });
    
    adminRouter.post("/admin/change-order-status", admin, async (req, res) => {
      try {
        const { id, status } = req.body;
        const client = await pool.connect();
        const queryText = "UPDATE orders SET status = $1 WHERE id = $2";
        const values = [status, id];
        const result = await client.query(queryText, values);
        const order = result.rows[0];
        client.release();
        res.json(order);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });
    
    adminRouter.get("/admin/analytics", admin, async (req, res) => {
      try {
      const result = await pool.query('SELECT * FROM Order');
      const orders = result.rows;
      let totalEarnings = 0;
      for (let i = 0; i < orders.length; i++) {
        for (let j = 0; j < orders[i].products.length; j++) {
          totalEarnings +=
            orders[i].products[j].quantity * orders[i].products[j].product.price;
        }
      }
      // CATEGORY WISE ORDER FETCHING
      let mobileEarnings = await fetchCategoryWiseProduct("Mobiles");
      let essentialEarnings = await fetchCategoryWiseProduct("Essentials");
      let applianceEarnings = await fetchCategoryWiseProduct("Appliances");
      let booksEarnings = await fetchCategoryWiseProduct("Books");
      let fashionEarnings = await fetchCategoryWiseProduct("Fashion");

      let earnings = {
        totalEarnings,
        mobileEarnings,
        essentialEarnings,
        applianceEarnings,
        booksEarnings,
        fashionEarnings,
      };
  
      res.json(earnings);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  async function fetchCategoryWiseProduct(category) {
    let earnings = 0;
    let categoryOrders = await Order.find({
      "products.product.category": category,
    });
  
    for (let i = 0; i < categoryOrders.length; i++) {
      for (let j = 0; j < categoryOrders[i].products.length; j++) {
        earnings +=
          categoryOrders[i].products[j].quantity *
          categoryOrders[i].products[j].product.price;
      }
    }
    return earnings;
  }
  
  module.exports = adminRouter;