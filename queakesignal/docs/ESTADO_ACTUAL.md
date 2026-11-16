# Estado actual de QuakeSignal

Fecha de revisión: 16 de noviembre de 2026.

Este documento describe el código existente, sus pantallas, contratos HTTP, persistencia y ejecución. Es una fotografía técnica del repositorio, no una certificación de disponibilidad de los servicios externos ni de funcionamiento del hardware. No incluye valores de credenciales.

## 1. Resumen del sistema

QuakeSignal es un panel web para visualizar alertas, consultar nodos IoT y activar alertas manuales. Combina una interfaz React, una API Express, usuarios en MongoDB Atlas y almacenamiento de alertas/configuración en un archivo JSON local.

| Componente | Implementación | Estado observado |
|---|---|---|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4 | Implementado; arranque en Docker confirmado por registros compartidos |
| API | Node.js, Express 5, puerto 3001 | Implementada; arranque confirmado por registros compartidos |
| Usuarios | Mongoose y MongoDB Atlas | Conexión confirmada por registros compartidos |
| Alertas, nodos y configuración | `server/data/db.json` | Lectura/escritura local implementada |
| MQTT | Cliente MQTT hacia broker externo | Corregida la selección de host en Linux; conexión posterior a la corrección pendiente de confirmar |
| Telegram | Peticiones a la API de Telegram | Envío implementado; entrega externa no verificada en esta revisión |
| Radiofrecuencia | Parámetros y presentación de contingencia | La interfaz por sí sola no demuestra transmisión RF física |
| Docker | Dos contenedores con Node 22 | Configuración de desarrollo local; no despliegue público de producción |

## 2. Arquitectura y archivos principales

```text
Navegador → frontend Vite :8443
Navegador → API Express :3001
                  ├─ MongoDB Atlas: usuarios
                  ├─ data/db.json: alertas, nodos, configuración
                  ├─ logs/alertas.log: consultas con alertas activas
                  ├─ broker MQTT externo: publicación CAP
                  └─ Telegram: notificaciones
```

| Archivo/directorio | Responsabilidad |
|---|---|
| `src/App.tsx` | Sesión, navegación, permisos visuales y modo normal/contingencia |
| `src/screens/` | Pantallas utilizadas por la aplicación |
| `src/pages/Dispositivos.tsx` | Vista adicional de dispositivos; no es la pantalla montada por `App.tsx` |
| `src/context/ConfigContext.tsx` | Configuración compartida, tema y almacenamiento local |
| `src/utils/auth.ts` | Sesión, encabezados JWT, roles y selección de URL de API |
| `src/components/SantiagoMap.tsx` | Mapa Leaflet y capas cartográficas externas |
| `server/index.js` | Rutas principales, inicialización y simulación automática |
| `server/routes/auth.js`, `server/routes/users.js` | Autenticación y usuarios |
| `server/config/db.js`, `server/models/user.js` | Conexión MongoDB y modelo de usuario |
| `server/cron.js` | Despacho, vigilancia de nodos y expiración |
| `server/utils/capFormatter.js` | Conversión de alertas a un objeto JSON con estructura CAP |
| `server/services/mqttService.js` | Conexión y publicación MQTT |
| `server/utils/telegram.js` | Envío y prueba de Telegram |

## 3. Estado del dashboard y las pantallas

| Pantalla | Comportamiento actual | Fuente/actualización |
|---|---|---|
| Login | Inicio de sesión y acceso a recuperación de contraseña | `POST /api/auth/login` y `/api/auth/reset-password` |
| Registro | Alta pública; por defecto crea operadores | `POST /api/users` |
| Dashboard | Estado general, alerta seleccionada, tarjetas, historial resumido, mapa y botón de pánico para admin | `GET /api/alertas` cada 5 segundos |
| Detalle de alerta | Presentación de alertas e información CAP, reloj y estado | Consulta alertas cada 5 segundos |
| Dispositivos | Estado y posición de nodos; conserva datos de respaldo si falla la consulta | `GET /api/nodos/status`; intervalo configurable, 3 segundos por defecto |
| Historial | Filtros por texto, intensidad, estado y fechas | `GET /api/alertas` cada 5 segundos; filtros en frontend |
| Mapa | Alertas georreferenciadas, selección de alerta y nodo cercano | Carga al montar; usa ejemplos si no obtiene una lista no vacía |
| Configuración | Telegram, MQTT, RF, automatización, vista inicial y tema; pruebas de conexión | GET/PUT configuración y POST de pruebas |
| Perfil | Información de la sesión y cierre de sesión | Almacenamiento del navegador; sin endpoint de edición de perfil |
| Usuarios | Lista de cuentas sin hashes de contraseña | `GET /api/auth/users`; acceso visual de admin |
| No encontrada | Pantalla interna para navegación desconocida | Estado de navegación de React |

### Particularidades que afectan la interpretación

- El contador de alertas activas del dashboard muestra `1` si encuentra alguna alerta activa y `0` si no; no cuenta todas las activas.
- El dashboard elige la primera alerta activa del arreglo o, en su defecto, la primera alerta. La prioridad manual del endpoint CAP no implica que todas las pantallas apliquen la misma selección.
- Las tarjetas de comunicaciones y los teléfonos ilustrados no deben interpretarse como acuses de recepción reales de cada destinatario.
- El modo de contingencia del contenedor principal es un estado visual seleccionado manualmente. No prueba detección automática de pérdida de Internet ni conmutación física a RF.
- `App.tsx` monta `MapScreen` sin pasar el modo global: el mapa mantiene su propio modo interno.
- Hay datos iniciales/de respaldo de nodos y ejemplos de alertas. Mostrar un mapa poblado no acredita conectividad del backend ni presencia real de ESP32.
- La navegación se administra con estado, fragmentos `#...` e historial del navegador. Existe una diferencia entre el identificador `detail` y el alias de navegación `alertas`, que puede afectar recargas o navegación directa a `#detail`.

## 4. Sesión y permisos

El login devuelve `{ token, user }`; el JWT vence en 8 horas. La aplicación utiliza `sessionStorage` para sesión y navegación; al iniciar elimina las antiguas claves de autenticación en `localStorage`. La configuración visual sí se conserva en `localStorage`.

Los roles incluyen `admin`, `operador` y `destinatario`. La interfaz restringe configuración y usuarios a administradores, y el botón de pánico comprueba admin.

**Limitación importante de la API:** varias rutas solo rechazan a un solicitante cuando existe un JWT válido cuyo rol es `operador`. Si no hay token, o es inválido, el helper devuelve `null` y esas rutas continúan. Por tanto, no son rutas correctamente protegidas como “solo admin”. Esto afecta listado y eliminación de usuarios, activación de pánico y escritura de configuración. Las pruebas de comunicaciones y varias operaciones de alertas/nodos tampoco exigen autenticación.

La recuperación de contraseña permite cambiarla con correo y nueva contraseña, sin un flujo de verificación de identidad. El inicio de sesión además prueba variantes de dominio y de capitalización de contraseña. Son comportamientos actuales que requieren revisión antes de publicar el servicio.

## 5. Catálogo completo de endpoints

Base local: `http://localhost:3001`. Todos los cuerpos indicados son JSON salvo la respuesta de logs. No existe un contrato OpenAPI en este documento; la implementación es la fuente de verdad.

### Autenticación y usuarios

| Método | Ruta | Entrada | Respuesta/efecto |
|---|---|---|---|
| POST | `/api/auth/login` | `email`, `password` | 200 con token y usuario; 400 si faltan campos, 401 si no autentica, 500 ante error |
| POST | `/api/auth/reset-password` | `email`, `newPassword` | Actualiza hash; 400 si faltan campos, 404 si no existe, 500 ante error |
| GET | `/api/auth/users` | JWT opcional en implementación actual | Lista usuarios sin `password_hash`; 403 para operador reconocido |
| GET | `/api/users` | Igual limitación de autorización | Lista usuarios sin `password_hash` |
| POST | `/api/users` | `email`, `password`; opcionales `name`, `role` | 201 con usuario; mínimo 4 caracteres tras normalización; un admin autenticado puede solicitar rol, el resto obtiene operador |
| DELETE | `/api/users/:id` | ID MongoDB | Elimina usuario; 403 para operador reconocido; no comprueba que el ID eliminado existiera antes de responder éxito |

Se aceptan tokens mediante `Authorization: Bearer <token>` o `x-access-token`. No se documentan tokens ni contraseñas reales aquí.

### Alertas y CAP

| Método | Ruta | Respuesta/efecto |
|---|---|---|
| GET | `/api/alertas` | Arreglo nativo; expira alertas de una hora y registra consultas cuando hay activas |
| GET | `/api/alertas/cap` | CAP de la alerta prioritaria o selección mediante query |
| GET | `/api/alertas/manual/cap` | Última manual prioritaria en CAP; admite listas por query |
| GET | `/api/alertas/manuales/cap` | Alias del anterior |
| GET | `/api/alertas/cap/manual` | Alias del anterior |
| GET | `/api/alertas/cap/manuales` | Alias del anterior |
| GET | `/api/alertas/manuales` | Arreglo nativo de alertas consideradas manuales |
| GET | `/api/alertas/:id/cap` | CAP por ID o identificadores especiales |
| GET | `/api/alertas/cap/:id` | Alias de CAP por ID |
| GET | `/api/alertas/:id` | Alerta nativa; `?format=cap` transforma a CAP |
| POST | `/api/alertas/panico` | Crea manual, guarda CAP y dispara comunicaciones; responde 201 con `{status, alerta, cap}` |
| PUT | `/api/alertas/:id/resolver` | Marca `activa=false`; 404 si no encuentra coincidencia exacta de ID |
| GET | `/api/logs/alertas` | Texto de `alertas.log` o mensaje si todavía no existe; 500 si falla lectura |

Parámetros de `GET /api/alertas/cap`:

| Query | Comportamiento |
|---|---|
| Sin parámetros | Manual activa primero; después activa reciente; finalmente reciente histórica |
| `manual=true`, `manuales=true` u `origen=manual` | Filtra manuales |
| `todas=true` o `all=true` | Arreglo CAP; puede combinarse con filtro manual |
| `activas=true` | Arreglo CAP de activas; puede combinarse con filtro manual |
| `id=ALERT-1234` | Consulta flexible por ID |

El orden del handler da precedencia a `todas/all`, luego `activas`, luego `id`; no todos los parámetros se combinan entre sí. Las rutas dedicadas a CAP manual admiten `todas/all` y `activas`. Sin alertas disponibles los handlers CAP pueden responder 404; una lista filtrada también puede ser un arreglo vacío.

La búsqueda flexible admite identificadores completos, variaciones de mayúsculas y sufijos numéricos. Las rutas CAP por ID reconocen `latest`, `ultima`, `actual` y el literal `:id`; `manual` y `manuales` seleccionan una manual. La ruta nativa por ID reconoce `latest`, `ultima` y el literal `:id`; `manual` devuelve una lista. `/api/alertas/manuales` tiene handler propio y devuelve JSON nativo.

Cuerpo de pánico: campos opcionales `tipo`, `intensidad`, `ubicacion`, `lat`, `lng`, `radioKm`. Usa valores predeterminados cuando faltan, crea `manual=true`, `origen="manual"`, `activa=true` y `despachada=false`. Su invocación tiene efectos externos; no es una prueba de lectura.

CAP se representa como JSON a partir de `capFormatter.js`; la presencia de esa estructura no acredita validación formal de conformidad CAP 1.2 ni entrega a dispositivos.

### Nodos y configuración

| Método | Ruta | Entrada / salida |
|---|---|---|
| GET | `/api/nodos/status` | `{total, online, detalle}`; cuenta según estado almacenado |
| POST | `/api/nodos/ping` | Requiere `id`; `ubicacion` opcional. Actualiza o crea nodo y registra `lastPing`; 400 si falta ID |
| GET | `/api/configuracion` | Objeto de configuración completo o valores por defecto |
| PUT | `/api/configuracion` | Fusiona configuración, persiste JSON y reinicializa MQTT si está activo; 403 para operador reconocido |
| POST | `/api/configuracion/test-telegram` | `botToken`, `chatId` opcionales con fallback; envía mensaje real; 400 si proveedor rechaza, 500 ante error |
| POST | `/api/configuracion/test-mqtt` | Requiere `broker`; opcionales `puerto`, `usuario`, `password`; conexión de prueba; 400 si falta broker, 500 por error, 504 por espera agotada |

La configuración contiene `comunicaciones` (Telegram, MQTT y RF), `automatizacion` y `interfaz`. La fusión de `comunicaciones` es por subobjeto: enviar solo una parte de `mqtt` puede reemplazar ese subobjeto; es preferible conservar el objeto completo al guardar.

El middleware final devuelve 404 JSON para rutas y métodos no registrados. `GET /` no sirve el frontend y devuelve 404. No hay un endpoint dedicado de salud/readiness.

## 6. Datos y tareas automáticas

| Entidad | Almacenamiento / campos principales |
|---|---|
| Usuario | MongoDB: nombre, email, hash, rol y estado según modelo |
| Alerta | JSON: `id`, `tipo`, `intensidad`, `ubicacion`, `fecha`, `activa`, `despachada`, coordenadas, radio, origen manual y CAP opcional |
| Nodo | JSON: ID, ubicación/zona, estado, `lastPing`, coordenadas cuando existen |
| Configuración | JSON y copia/cache del navegador |
| Consultas con activas | Archivo `server/logs/alertas.log` |

Al iniciar se completa la estructura JSON, se agregan nodos iniciales cuando corresponde, se asignan coordenadas a alertas sin ubicación geográfica y se asegura una cuenta administradora predeterminada en MongoDB.

| Tarea | Frecuencia | Efecto |
|---|---|---|
| Simulador | 120 segundos | Inserta alerta sísmica simulada y publica CAP por MQTT si está habilitado |
| Despachador cron | 10 segundos | Intenta enviar por Telegram alertas activas pendientes y marca despacho |
| Watchdog | 1 minuto | Marca offline nodos que exceden el umbral; predeterminado 180 segundos |
| Limpieza | 1 minuto | Inactiva alertas con una hora desde emisión |
| Consulta general | Cada GET de alertas | También verifica expiración y registra activas |

El simulador está activo en código sin interruptor de entorno. El pánico envía Telegram inmediatamente y deja `despachada=false`, de modo que el cron puede volver a enviarlo. Una marca de despacho no equivale a un acuse de recepción del destinatario. No ejecutar varias instancias como si hubiera coordinación distribuida: el JSON no aporta transacciones ni control de concurrencia entre procesos.

## 7. Comunicaciones y límites actuales

- MQTT usa `MQTT_HOST` si está definido, después `config.broker` y finalmente el dominio predeterminado. Ya no fuerza loopback por ejecutarse en Linux.
- MQTT publica CAP con QoS 1 y `retain=true`; intenta reconectar cada 5 segundos. Esto no confirma recepción ni activación de un ESP32.
- `MQTT_HOST` debe declararse explícitamente en `environment` del servicio si se quiere usar desde Compose; crear un `.env` no lo inyecta automáticamente en este código.
- El endpoint de prueba MQTT usa su propia lógica de resolución de host; no es exactamente el mismo flujo que el servicio persistente.
- La bandera MQTT controla inicialización/publicación en varios puntos, pero desactivarla mediante PUT no cierra explícitamente una conexión ya abierta.
- El helper de envío Telegram lee token/chat configurados; no aplica la bandera `telegram.activo` antes de enviar.
- Las capas del mapa requieren acceso externo. No está implementada una garantía de cartografía offline.

## 8. Docker y ejecución

Los archivos `Dockerfile.frontend`, `Dockerfile.backend`, `.dockerignore` y `compose.yaml` están en la raíz de esta aplicación (`queakesignal`).

| Servicio | Proceso | Puerto publicado | Persistencia |
|---|---|---|---|
| frontend | Vite en Node 22 | `127.0.0.1:8443` | Código incorporado en imagen |
| backend | `node index.js` en Node 22 | `127.0.0.1:3001` | `./server/data:/app/data`, `./server/logs:/app/logs` |

MongoDB y Mosquitto no son servicios del Compose actual. El frontend ejecuta un servidor de desarrollo; no hay Nginx, HTTPS, políticas de reinicio ni healthchecks declarados. Los cambios de código requieren reconstrucción porque no hay bind mount de fuentes.

Desde esta carpeta:

```powershell
docker compose config --quiet
docker compose up --build -d
docker compose ps
docker compose logs --tail=100
docker compose logs -f backend
docker compose down
```

Reconstruir solo backend: `docker compose up --build -d backend`.

Abrir `http://localhost:8443`. La API está en `http://localhost:3001/api/alertas`.

Para ejecutar sin Docker, instalar dependencias en raíz y `server`, y usar `npm run dev` en la raíz. También existen `dev:frontend`, `dev:backend`, `build` y `preview`. `node index.js` desde `server` inicia únicamente la API.

### Acceso desde otro equipo

Los puertos ligados a `127.0.0.1` solo admiten acceso desde el equipo anfitrión. Para LAN se necesitan publicación en interfaz de red, firewall y ajuste de la base de API. El helper actual usa `localhost:3001` para localhost/127.0.0.1 y DuckDNS para cualquier otro hostname, incluida una IP privada. `DashboardScreen` duplica esa lógica localmente.

Otra opción es copiar/clonar el proyecto en un notebook con Docker y levantarlo allí. Requiere los archivos Docker y `server/data`, acceso de red a servicios externos y autorización de la IP en Atlas cuando corresponda.

## 9. Pendientes antes de uso público

1. Exigir JWT válido y roles permitidos en el backend, sin permitir paso cuando el token falta o falla.
2. Sustituir la recuperación de contraseña por un flujo con verificación y token de un solo uso.
3. Retirar y rotar credenciales incorporadas en código, incluida la clave JWT y la cuenta predeterminada; evitar exponer secretos mediante GET configuración.
4. Centralizar URL de API, configurar CORS para el despliegue y servir frontend compilado con HTTPS.
5. Separar simulaciones de operación real y controlar sus efectos externos.
6. Revisar duplicados y confirmaciones de entrega; respetar banderas de activación de comunicaciones.
7. Sustituir o coordinar almacenamiento JSON para concurrencia, respaldos y varias instancias.
8. Corregir el conteo de activas, revisar navegación directa y distinguir métricas reales de elementos demostrativos.
9. Agregar validación de entradas, manejo consistente de errores, comprobación de salud y pruebas de integración.

## 10. Evidencia y alcance de la revisión

- Se inspeccionaron pantallas, helper de autenticación, rutas Express, cron, persistencia, MQTT, Telegram y archivos Docker.
- En la revisión previa de esta sesión, TypeScript y la validación de Compose pasaron. No se vuelven a presentar como pruebas ejecutadas hoy.
- Los registros compartidos confirmaron frontend, API y MongoDB arrancados; mostraron el fallo MQTT por loopback antes de corregirlo.
- La corrección MQTT pasó `node --check`; no hay evidencia aportada después de ella que confirme conexión al broker o entrega a hardware.
- Esta actualización solo agrega documentación. No se enviaron alertas, no se probaron endpoints de escritura, no se inició Docker ni se verificó visualmente cada pantalla en vivo.

Actualizar este documento cuando cambien rutas, permisos, persistencia, comunicaciones o despliegue.
