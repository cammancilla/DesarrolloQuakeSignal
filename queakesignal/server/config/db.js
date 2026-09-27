// server/config/db.js
const mongoose = require("mongoose");


const MONGO_URI = "mongodb+srv://cammancilla_db_user:koZdnRg05GkxGsz8@cluster0.pypltcy.mongodb.net/quakesignal?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(` Conectado exitosamente a MongoDB Atlas: ${conn.connection.host}`);
  } catch (error) {
    console.error(" Error al conectar con MongoDB Atlas:", error.message);
  }
};

module.exports = connectDB;