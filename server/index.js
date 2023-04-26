const express = require("express");
const { Pool } = require("pg");
const adminRouter = require("./routes/admin");
const authRouter = require("./routes/auth");
const productRouter = require("./routes/product");
const userRouter = require("./routes/user");

// INIT
const PORT = 5432;
const app = express();

const connectionString = 'postgres://doraritchik:cjUJjkJiT254pgaVMoOyEvOK69smAEjN@dpg-ch3p3j4eoogsn04lonrg-a.oregon-postgres.render.com/marketdb?ssl=true'

const pool = new Pool({
  connectionString: connectionString,
});

// middleware
app.use(express.json());
app.use(authRouter);
app.use(adminRouter);
app.use(productRouter);
app.use(userRouter);

// Connections
pool.connect()
.then(() => {
console.log("Connection Successful");
})
.catch((e) => {
console.log(e);
});

app.listen(PORT, "0.0.0.0", () => {
console.log('connected at port ${PORT}');
});