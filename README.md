# DesarrolloQuakeSignal
Repositorio de desarrollo del proyecto QuakeSignal

### Endpoints de Alertas en Formato CAP (Common Alerting Protocol v1.2)

- **Última alerta generada (prioriza alertas manuales de pánico activas sobre simulaciones):**
  http://localhost:3001/api/alertas/cap

- **Última alerta MANUAL específica (Botón de Pánico):**
  http://localhost:3001/api/alertas/manual/cap
  *(También disponible como: `http://localhost:3001/api/alertas/cap?manual=true`)*

- **Todas las alertas MANUALES en formato CAP:**
  http://localhost:3001/api/alertas/cap?manual=true&todas=true
  *(O solo manuales activas: `http://localhost:3001/api/alertas/cap?manual=true&activas=true`)*

- **Todas las alertas activas en formato CAP:**
  http://localhost:3001/api/alertas/cap?activas=true

- **Historial completo en formato CAP:**
  http://localhost:3001/api/alertas/cap?todas=true

- **CAP de una alerta específica por su ID:**
  http://localhost:3001/api/alertas/:id/cap
  *(Reemplazar `:id` por el ID de la alerta, por ejemplo: `http://localhost:3001/api/alertas/ALERT-6044/cap` o `http://localhost:3001/api/alertas/6044/cap`)*

- **Buscar CAP por parámetro query:**
  http://localhost:3001/api/alertas/cap?id=ALERT-6044


Iniciar backend en GCP en pestaña SSH:

# 1. Ir a la carpeta compartida del proyecto
cd /opt/DesarrolloQuakeSignal

# 2. Traer los cambios de GitHub
git pull

# 3. Ir a la carpeta del servidor e iniciar/reiniciar
cd queakesignal/server
node index.js

