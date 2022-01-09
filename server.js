const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT;
const connectDB = require("./utilsServer/connectDB");
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require("./routes/categoriesRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes");
const cors = require("cors");

app.use(express.json());
app.use(cors());
app.use('/api/auth', authRoutes);
app.use("/api/categories", categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);

connectDB(() => {
  app.listen(PORT, () => {
    console.log("Server listening on Port ", PORT);
  });
});