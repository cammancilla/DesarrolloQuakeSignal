// server/config/db.js
const mongoose = require("mongoose");
const dns = require("dns");

// En Windows o redes con DNS locales que bloquean registros SRV (_mongodb._tcp):
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignorar si el entorno restringe cambiar servidores DNS
}

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
