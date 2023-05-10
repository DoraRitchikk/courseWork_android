    const express = require("express");
    const adminRouter = express.Router();
    const admin = require("../middlewares/admin");
    const { Pool } = require("pg");
  

    const connectionString = 'postgres://dariaritchik:yR2gpWx8uka8zsyrjiTCDE7SDOE2KozC@dpg-chcb76bhp8u016660cug-a.oregon-postgres.render.com/marketdb_sbwc?ssl=true'
    const pool = new Pool({
      connectionString: connectionString,
    });
    
    // Add product
    adminRouter.post("/admin/add-product", admin, async (req, res) => {
      try {
        const { name, description, images, quantity, price, category } = req.body;
        // Insert the new product into the database
        
        let jsonImage = JSON.stringify(images);
        const result = await pool.query(
          "CALL add_product($1, $2, $3, $4, $5, $6) ",
          [name, description, jsonImage, quantity, price, category]
        );
    
        // Return the inserted product
        res.json(result.rows[0]);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });
    
    // Get all your products
    adminRouter.get("/admin/get-products", admin, async (req, res) => {
      try {
        const client = await pool.connect();
        const queryText = "CALL get_all_products()";
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
        const queryText = "CALL delete_product($1)";
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
        const queryText = "CALL get_all_orders()";
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
        const queryText = "CALL update_order_status($1, $2)";
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
      const result = await pool.query('CALL get_all_products()');
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
  });
  async function fetchCategoryWiseProduct(category) {
    let earnings = 0;

    const categoryOrders = await db.query(`
      SELECT * 
      FROM orders 
      WHERE products @> '[{"product": {"category": "${category}"}}]'`);
  
    for (const order of categoryOrders.rows) {
      for (const product of order.products) {
        earnings += product.quantity * product.product.price;
      }
    }
  
    return earnings;
  }  

  module.exports = adminRouter;