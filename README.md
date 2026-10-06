# DesarrolloQuakeSignal
Repositorio de desarrollo del proyecto QuakeSignal

http://localhost:3001/api/alertas/cap	: La última alerta generada (sea de pánico o automática).
http://localhost:3001/api/alertas/cap?activas=true	: Una lista en CAP de todas las alertas activas del sistema.
http://localhost:3001/api/alertas/cap?todas=true	: El historial completo de alertas en formato CAP.
http://localhost:3001/api/alertas/:id/cap	: El CAP de una alerta específica por su ID (ej: ALERT-6044/cap).

