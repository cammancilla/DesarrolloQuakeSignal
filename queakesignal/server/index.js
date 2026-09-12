const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const connectDB = require("./config/db");
const { iniciarCron } = require('./cron');

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'data', 'db.json');

// Conectar a MongoDB
connectDB();

app.use(cors());
app.use(express.json());


// Endpoints
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));



// Leer alertas de la base dummy
const getAlertas = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const saveAlertas = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// GET: Obtener todas las alertas para el Dashboard
app.get('/api/alertas', (req, res) => {
  const alertas = getAlertas();
  res.json(alertas);
});

// POST: Activar Botón de Pánico desde el Dashboard
app.post('/api/alertas/panico', (req, res) => {
  const alertas = getAlertas();
  
  const nuevaAlerta = {
    id: `ALERT-${Date.now().toString().slice(-4)}`,
    tipo: req.body.tipo || "Sismo de Gran Magnitud",
    intensidad: req.body.intensidad || "Alerta Crítica",
    ubicacion: req.body.ubicacion || "Zona Central, Chile",
    fecha: new Date().toISOString(),
    activa: true,
    despachada: false
  };

  alertas.unshift(nuevaAlerta);
  saveAlertas(alertas);

  console.log(`\n ¡BOTÓN DE PÁNICO ACTIVADO! Alerta ${nuevaAlerta.id} guardada en BD.`);
  res.status(201).json({ status: "OK", alerta: nuevaAlerta });
});

// Iniciar servidor y CRON
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(` Backend Core QuakeSignal corriendo en http://localhost:${PORT}`);
    iniciarCron();
  });
};

startServer();
