/**
 * QUANTIUM WEB SERVER
 * Express.js web server for Quantium Internet & Web of Things
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { QuantumNetwork, IoTBridge } from '../quantium-core/network.js';
import { QuantiumProtocol, QuantiumRouter, QuantiumDNS } from '../quantium-net/protocol.js';
import { DeviceRegistry, DigitalTwin } from '../web-of-things/device-registry.js';
import { SensorNetwork, ActuatorControl } from '../web-of-things/sensor-network.js';
import { AIEngine, NeuralNetwork } from '../quantium-core/ai-engine.js';
import { QuantiumSecurity, SecureSession, PermissionManager } from '../quantium-net/security.js';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize all Quantium modules
const network = new QuantumNetwork();
const bridge = new IoTBridge(network);
const protocol = new QuantiumProtocol();
const router = new QuantiumRouter(protocol);
const dns = new QuantiumDNS();
const registry = new DeviceRegistry();
const digitalTwin = new DigitalTwin(registry);
const sensorNetwork = new SensorNetwork();
const actuatorControl = new ActuatorControl();
const aiEngine = new AIEngine();
const security = new QuantiumSecurity();
const sessions = new SecureSession(security);
const permissions = new PermissionManager();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Quantium',
    version: '1.0.0',
    timestamp: Date.now()
  });
});

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    network: network.getStatus(),
    sensors: sensorNetwork.getStatus(),
    ai: aiEngine.getStatus(),
    devices: registry.list().length,
    sessions: sessions.getActiveCount()
  });
});

// ==================== QUANTUM NETWORK API ====================

// Register node
app.post('/api/network/nodes', (req, res) => {
  const { nodeId, ...nodeData } = req.body;
  const result = network.registerNode(nodeId, nodeData);
  res.json(result);
});

// Get all nodes
app.get('/api/network/nodes', (req, res) => {
  res.json(Array.from(network.nodes.entries()));
});

// Connect nodes
app.post('/api/network/connect', (req, res) => {
  const { sourceId, targetId } = req.body;
  const result = network.connect(sourceId, targetId);
  res.json(result);
});

// Send data
app.post('/api/network/send', (req, res) => {
  const { sourceId, targetId, data } = req.body;
  const result = network.send(sourceId, targetId, data);
  res.json(result);
});

// ==================== IOT BRIDGE API ====================

// Register device
app.post('/api/iot/devices', (req, res) => {
  const { deviceId, deviceType, capabilities } = req.body;
  const result = bridge.registerDevice(deviceId, deviceType, capabilities);
  res.json(result);
});

// Send command to device
app.post('/api/iot/devices/:deviceId/command', (req, res) => {
  const { deviceId } = req.params;
  const { command } = req.body;
  const result = bridge.sendToDevice(deviceId, command);
  res.json(result);
});

// ==================== PROTOCOL API ====================

// Create packet
app.post('/api/protocol/packets', (req, res) => {
  const { source, target, payload, options } = req.body;
  const packet = protocol.createPacket(source, target, payload, options);
  res.json(packet);
});

// Get all packets
app.get('/api/protocol/packets', (req, res) => {
  res.json(protocol.packets);
});

// Add route
app.post('/api/protocol/routes', (req, res) => {
  const { destination, nextHop, metrics } = req.body;
  const result = router.addRoute(destination, nextHop, metrics);
  res.json(result);
});

// Get route
app.get('/api/protocol/routes/:destination', (req, res) => {
  const { destination } = req.params;
  const result = router.findRoute(destination);
  res.json(result);
});

// ==================== DNS API ====================

// Register domain
app.post('/api/dns/register', (req, res) => {
  const { domain, address } = req.body;
  const result = dns.register(domain, address);
  res.json(result);
});

// Resolve domain
app.get('/api/dns/resolve/:domain', (req, res) => {
  const { domain } = req.params;
  const address = dns.resolve(domain);
  res.json({ domain, address });
});

// Reverse resolve
app.get('/api/dns/reverse/:address', (req, res) => {
  const { address } = req.params;
  const domain = dns.reverseResolve(address);
  res.json({ address, domain });
});

// ==================== DEVICE REGISTRY API ====================

// Register device
app.post('/api/devices', (req, res) => {
  const { deviceId, metadata } = req.body;
  const result = registry.register(deviceId, metadata);
  res.json(result);
});

// Get all devices
app.get('/api/devices', (req, res) => {
  res.json(registry.list());
});

// Get device by ID
app.get('/api/devices/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  const device = registry.get(deviceId);
  res.json(device);
});

// Find devices by type
app.get('/api/devices/type/:type', (req, res) => {
  const { type } = req.params;
  const devices = registry.findByType(type);
  res.json(devices);
});

// Unregister device
app.delete('/api/devices/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  const result = registry.unregister(deviceId);
  res.json(result);
});

// ==================== DIGITAL TWIN API ====================

// Create twin
app.post('/api/twins', (req, res) => {
  const { deviceId } = req.body;
  const result = digitalTwin.createTwin(deviceId);
  res.json(result);
});

// Update twin state
app.put('/api/twins/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  const { state } = req.body;
  const result = digitalTwin.updateTwinState(deviceId, state);
  res.json(result);
});

// Get twin state
app.get('/api/twins/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  const twin = digitalTwin.getTwinState(deviceId);
  res.json(twin);
});

// ==================== SENSOR NETWORK API ====================

// Register sensor
app.post('/api/sensors', (req, res) => {
  const { sensorId, config } = req.body;
  const result = sensorNetwork.register(sensorId, config);
  res.json(result);
});

// Read sensor
app.post('/api/sensors/:sensorId/read', (req, res) => {
  const { sensorId } = req.params;
  const { value } = req.body;
  const result = sensorNetwork.read(sensorId, value);
  res.json(result);
});

// Get latest reading
app.get('/api/sensors/:sensorId/latest', (req, res) => {
  const { sensorId } = req.params;
  const reading = sensorNetwork.getLatest(sensorId);
  res.json(reading);
});

// Get history
app.get('/api/sensors/:sensorId/history', (req, res) => {
  const { sensorId } = req.params;
  const { limit } = req.query;
  const history = sensorNetwork.getHistory(sensorId, parseInt(limit) || 100);
  res.json(history);
});

// Aggregate sensors
app.post('/api/sensors/aggregate', (req, res) => {
  const { sensorIds, type } = req.body;
  const result = sensorNetwork.aggregate(sensorIds, type);
  res.json(result);
});

// Get alerts
app.get('/api/alerts', (req, res) => {
  const alerts = sensorNetwork.getAlerts();
  res.json(alerts);
});

// Acknowledge alert
app.post('/api/alerts/:alertId/acknowledge', (req, res) => {
  const { alertId } = req.params;
  const result = sensorNetwork.acknowledgeAlert(alertId);
  res.json(result);
});

// ==================== ACTUATOR CONTROL API ====================

// Register actuator
app.post('/api/actuators', (req, res) => {
  const { actuatorId, config } = req.body;
  const result = actuatorControl.register(actuatorId, config);
  res.json(result);
});

// Send command
app.post('/api/actuators/:actuatorId/command', (req, res) => {
  const { actuatorId } = req.params;
  const { command, value } = req.body;
  const result = actuatorControl.command(actuatorId, command, value);
  res.json(result);
});

// Get command history
app.get('/api/actuators/:actuatorId/history', (req, res) => {
  const { actuatorId } = req.params;
  const { limit } = req.query;
  const history = actuatorControl.getHistory(actuatorId, parseInt(limit) || 50);
  res.json(history);
});

// ==================== AI ENGINE API ====================

// Register model
app.post('/api/ai/models', (req, res) => {
  const { modelId, modelConfig } = req.body;
  const result = aiEngine.registerModel(modelId, modelConfig);
  res.json(result);
});

// Run inference
app.post('/api/ai/infer', (req, res) => {
  const { modelId, input } = req.body;
  const result = aiEngine.infer(modelId, input);
  res.json(result);
});

// Get inference history
app.get('/api/ai/history', (req, res) => {
  const { limit } = req.query;
  const history = aiEngine.getHistory(parseInt(limit) || 10);
  res.json(history);
});

// Create training job
app.post('/api/ai/training', (req, res) => {
  const { modelId, trainingConfig } = req.body;
  const result = aiEngine.createTrainingJob(modelId, trainingConfig);
  res.json(result);
});

// ==================== SECURITY API ====================

// Generate keys
app.post('/api/security/keys', (req, res) => {
  const { userId } = req.body;
  const result = security.generateKeyPair(userId);
  res.json(result);
});

// Encrypt
app.post('/api/security/encrypt', (req, res) => {
  const { plaintext, key } = req.body;
  const result = security.encrypt(plaintext, key);
  res.json(result);
});

// Decrypt
app.post('/api/security/decrypt', (req, res) => {
  const { encryptedData, key } = req.body;
  const result = security.decrypt(encryptedData, key);
  res.json({ decrypted: result });
});

// Hash
app.post('/api/security/hash', (req, res) => {
  const { data, algorithm } = req.body;
  const result = security.hash(data, algorithm);
  res.json({ hash: result });
});

// ==================== SESSION API ====================

// Create session
app.post('/api/sessions', (req, res) => {
  const { userId, metadata } = req.body;
  const result = sessions.create(userId, metadata);
  res.json(result);
});

// Validate session
app.get('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const result = sessions.validate(sessionId);
  res.json(result);
});

// Delete session
app.delete('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const result = sessions.invalidate(sessionId);
  res.json({ success: result });
});

// ==================== PERMISSIONS API ====================

// Define role
app.post('/api/roles', (req, res) => {
  const { roleId, permissions: perms } = req.body;
  const result = permissions.defineRole(roleId, perms);
  res.json(result);
});

// Grant permission
app.post('/api/permissions', (req, res) => {
  const { userId, permission } = req.body;
  const result = permissions.grant(userId, permission);
  res.json(result);
});

// Check permission
app.get('/api/permissions/:userId/:permission', (req, res) => {
  const { userId, permission } = req.params;
  const result = permissions.hasPermission(userId, permission);
  res.json({ hasPermission: result });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     ██████╗ ███████╗ █████╗ ██████╗                      ║
║     ██╔══██╗██╔════╝██╔══██╗██╔══██╗                     ║
║     ██║  ██║█████╗  ███████║██████╔╝                     ║
║     ██║  ██║██╔══╝  ██╔══██║██╔═══╝                      ║
║     ██████╔╝███████╗██║  ██║██║                          ║
║     ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝                          ║
║                                                               ║
║          QUANTIUM INTERNET & WEB OF THINGS                    ║
║                    Web Server v1.0.0                           ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

🚀 Server running on http://localhost:${PORT}
📋 API Endpoints:
   • GET  /health           - Health check
   • GET  /api/status      - System status
   • POST /api/network/nodes      - Register node
   • POST /api/iot/devices         - Register IoT device
   • POST /api/protocol/packets    - Create packet
   • POST /api/dns/register     - Register domain
   • POST /api/devices         - Register device
   • POST /api/sensors        - Register sensor
   • POST /api/ai/models      - Register AI model
   • POST /api/security/keys  - Generate keys

💡 Try: curl http://localhost:${PORT}/health
  `);
});

export default app;
