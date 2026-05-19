#!/usr/bin/env node
/**
 * QUANTIUM CLI - Command Line Interface
 * Entry point for Quantium Internet & Web of Things
 */

import { QuantumNetwork, IoTBridge } from '../quantium-core/network.js';
import { QuantiumProtocol, QuantiumRouter, QuantiumDNS } from '../quantium-net/protocol.js';
import { DeviceRegistry, DigitalTwin } from '../web-of-things/device-registry.js';
import { SensorNetwork, ActuatorControl } from '../web-of-things/sensor-network.js';
import { AIEngine, NeuralNetwork } from '../quantium-core/ai-engine.js';
import { QuantiumSecurity, SecureSession, PermissionManager } from '../quantium-net/security.js';

class QuantiumCLI {
  constructor() {
    this.network = new QuantumNetwork();
    this.bridge = new IoTBridge(this.network);
    this.protocol = new QuantiumProtocol();
    this.router = new QuantiumRouter(this.protocol);
    this.dns = new QuantiumDNS();
    this.registry = new DeviceRegistry();
    this.digitalTwin = new DigitalTwin(this.registry);
    this.sensorNetwork = new SensorNetwork();
    this.actuatorControl = new ActuatorControl();
    this.ai = new AIEngine();
    this.security = new QuantiumSecurity();
    this.sessions = new SecureSession(this.security);
    this.permissions = new PermissionManager();
  }

  printBanner() {
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
║                                                               ║
║                    Version 1.0.0                             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    `);
  }

  runDemo() {
    this.printBanner();
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('                    INITIALIZING...');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Initialize Quantum Network
    console.log('🔗 [1] QUANTUM NETWORK');
    console.log('───────────────────────────────────────────────────────────');
    
    this.network.registerNode('gateway_1', { role: 'gateway', location: 'datacenter_a' });
    this.network.registerNode('edge_1', { role: 'edge', location: 'office_b' });
    this.network.registerNode('edge_2', { role: 'edge', location: 'warehouse_c' });
    
    console.log('   ✓ Registered nodes:', this.network.nodes.size);
    
    // Create quantum connections
    this.network.connect('gateway_1', 'edge_1');
    this.network.connect('gateway_1', 'edge_2');
    console.log('   ✓ Quantum connections:', this.network.connections.size);

    // Send test data
    const result = this.network.send('edge_1', 'edge_2', { temperature: 23.5, humidity: 45 });
    console.log('   ✓ Data transmitted:', result.transmitted);
    
    console.log('   Network Status:', this.network.getStatus());
    console.log();

    // Initialize IoT Bridge
    console.log('📡 [2] IOT BRIDGE');
    console.log('───────────────────────────────────────────────────────────');
    
    this.bridge.registerDevice('sensor_temp_1', 'temperature', ['read', 'alert']);
    this.bridge.registerDevice('sensor_humidity_1', 'humidity', ['read']);
    this.bridge.registerDevice('actuator_relay_1', 'relay', ['on', 'off', 'toggle']);
    this.bridge.registerDevice('actuator_light_1', 'light', ['on', 'off', 'dim']);
    
    console.log('   ✓ Registered devices:', this.bridge.devices.size);
    
    const cmdResult = this.bridge.sendToDevice('actuator_relay_1', 'on');
    console.log('   ✓ Command executed:', cmdResult.executed);
    console.log();

    // Initialize Protocol & Routing
    console.log('🌐 [3] QUANTIUM NET PROTOCOL');
    console.log('───────────────────────────────────────────────────────────');
    
    const packet = this.protocol.createPacket('node_a', 'node_b', { data: 'hello quantium' }, { priority: 'high' });
    console.log('   ✓ Created packet:', packet.id);
    
    this.router.addRoute('node_b', 'gateway_1', { metric: 2, cost: 10 });
    this.router.addRoute('node_c', 'gateway_2', { metric: 1, cost: 5 });
    console.log('   ✓ Routing table size:', this.router.getTableSize());
    
    // DNS
    this.dns.register('quantium.io', '192.168.1.100');
    this.dns.register('iot.quantium.io', '192.168.1.101');
    this.dns.register('ai.quantium.io', '192.168.1.102');
    console.log('   ✓ Registered domains:', this.dns.records.size);
    console.log('   ✓ Resolved quantium.io:', this.dns.resolve('quantium.io'));
    console.log();

    // Initialize Device Registry
    console.log('📋 [4] DEVICE REGISTRY');
    console.log('───────────────────────────────────────────────────────────');
    
    this.registry.register('dev_temp_001', { type: 'temperature_sensor', location: 'office', capabilities: ['read', 'alert'] });
    this.registry.register('dev_temp_002', { type: 'temperature_sensor', location: 'warehouse', capabilities: ['read'] });
    this.registry.register('dev_light_001', { type: 'light', location: 'lobby', capabilities: ['on', 'off', 'dim'] });
    this.registry.register('dev_motion_001', { type: 'motion_sensor', location: 'entrance', capabilities: ['detect'] });
    
    console.log('   ✓ Registered devices:', this.registry.devices.size);
    
    const tempSensors = this.registry.findByType('temperature_sensor');
    console.log('   ✓ Temperature sensors:', tempSensors.length);
    
    // Digital Twin
    this.digitalTwin.createTwin('dev_temp_001');
    this.digitalTwin.updateTwinState('dev_temp_001', { temperature: 22.5, battery: 85 });
    console.log('   ✓ Digital twin created for:', 'dev_temp_001');
    console.log();

    // Initialize Sensor Network
    console.log('📊 [5] SENSOR NETWORK');
    console.log('───────────────────────────────────────────────────────────');
    
    this.sensorNetwork.register('sns_temp_1', {
      type: 'temperature',
      location: 'office',
      unit: '°C',
      minValue: -40,
      maxValue: 80,
      threshold: { min: 15, max: 30 }
    });
    
    this.sensorNetwork.register('sns_temp_2', {
      type: 'temperature',
      location: 'warehouse',
      unit: '°C',
      minValue: -40,
      maxValue: 80,
      threshold: { min: 10, max: 35 }
    });
    
    this.sensorNetwork.register('sns_humidity_1', {
      type: 'humidity',
      location: 'office',
      unit: '%',
      minValue: 0,
      maxValue: 100,
      threshold: { min: 30, max: 70 }
    });
    
    console.log('   ✓ Registered sensors:', this.sensorNetwork.sensors.size);
    
    // Read sensor data
    this.sensorNetwork.read('sns_temp_1', 22.5);
    this.sensorNetwork.read('sns_temp_1', 24.1);
    this.sensorNetwork.read('sns_temp_2', 18.7);
    this.sensorNetwork.read('sns_humidity_1', 55);
    
    const latest = this.sensorNetwork.getLatest('sns_temp_1');
    console.log('   ✓ Latest reading (sns_temp_1):', latest.value, latest.unit);
    
    // Aggregation
    const avg = this.sensorNetwork.aggregate(['sns_temp_1', 'sns_temp_2'], 'average');
    console.log('   ✓ Average temperature:', avg.value.toFixed(2), '°C');
    console.log();

    // Initialize Actuator Control
    console.log('⚙️  [6] ACTUATOR CONTROL');
    console.log('───────────────────────────────────────────────────────────');
    
    this.actuatorControl.register('actuator_hvac', {
      type: 'relay',
      location: 'hvac_system',
      capabilities: ['on', 'off']
    });
    
    this.actuatorControl.register('actuator_servo', {
      type: 'servo',
      location: 'valve',
      capabilities: ['open', 'close', 'set_position'],
      positionRange: [0, 180]
    });
    
    console.log('   ✓ Registered actuators:', this.actuatorControl.actuators.size);
    
    const actResult = this.actuatorControl.command('actuator_hvac', 'on');
    console.log('   ✓ Command executed:', actResult.success);
    console.log();

    // Initialize AI Engine
    console.log('🤖 [7] AI ENGINE');
    console.log('───────────────────────────────────────────────────────────');
    
    this.ai.registerModel('image_classifier', {
      type: 'convolutional',
      layers: [224, 128, 64, 10],
      accuracy: 0.92
    });
    
    this.ai.registerModel('anomaly_detector', {
      type: 'autoencoder',
      layers: [64, 32, 16, 32, 64],
      threshold: 0.1
    });
    
    console.log('   ✓ Registered models:', this.ai.models.size);
    
    const inference = this.ai.infer('image_classifier', [0.5, 0.3, 0.8, 0.1]);
    console.log('   ✓ Inference confidence:', (inference.output.confidence * 100).toFixed(1) + '%');
    
    // Neural Network Demo
    const nn = new NeuralNetwork({ layers: [4, 8, 2] });
    const output = nn.forward([1, 0, 1, 0]);
    console.log('   ✓ Neural network output:', output.map(v => v.toFixed(4)));
    console.log();

    // Initialize Security
    console.log('🔐 [8] SECURITY');
    console.log('───────────────────────────────────────────────────────────');
    
    const keys = this.security.generateKeyPair('user_admin');
    console.log('   ✓ Generated key pair for:', 'user_admin');
    
    const encrypted = this.security.encrypt('Sensitive Quantium Data', keys.privateKey);
    console.log('   ✓ Data encrypted:', encrypted.encrypted.substring(0, 20) + '...');
    
    const decrypted = this.security.decrypt(encrypted, keys.privateKey);
    console.log('   ✓ Data decrypted:', decrypted);
    
    // Sessions
    const session = this.sessions.create('user_admin', { role: 'admin' });
    console.log('   ✓ Session created:', session.sessionId.substring(0, 16) + '...');
    console.log('   ✓ Session valid:', this.sessions.validate(session.sessionId).valid);
    
    // Permissions
    this.permissions.defineRole('admin', ['read', 'write', 'delete', 'execute']);
    this.permissions.defineRole('user', ['read']);
    this.permissions.defineRole('operator', ['read', 'execute']);
    
    this.permissions.grant('user_admin', 'read');
    this.permissions.grant('user_admin', 'write');
    console.log('   ✓ Permissions granted');
    console.log('   ✓ Has read permission:', this.permissions.hasPermission('user_admin', 'read'));
    console.log('   ✓ Has delete permission:', this.permissions.hasPermission('user_admin', 'delete'));
    console.log();

    // Summary
    console.log('══════════════════════════════════════════════════════════���');
    console.log('                    SYSTEM SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('   Quantum Network Nodes:    ', this.network.nodes.size);
    console.log('   IoT Devices:             ', this.bridge.devices.size);
    console.log('   Registered Devices:      ', this.registry.devices.size);
    console.log('   Sensor Network:         ', this.sensorNetwork.sensors.size);
    console.log('   AI Models:              ', this.ai.models.size);
    console.log('   Active Sessions:        ', this.sessions.getActiveCount());
    console.log('   Protocol:               ', this.network.protocol);
    console.log('═══════════════════════════════════════════════════════════');
    console.log();
    console.log('✅ Quantium system initialized successfully!');
    console.log();
    console.log('Next steps:');
    console.log('   • Run web server: npm run server');
    console.log('   • Build Docker: npm run docker:build');
    console.log('   • View docs: cat MATH_ALGORITHMS.md');
    console.log();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'demo';

const cli = new QuantiumCLI();

switch (command) {
  case 'demo':
  case 'run':
  case 'start':
    cli.runDemo();
    break;
  
  case 'network':
    console.log('Running network demo...');
    const { QuantumNetwork } = await import('../quantium-core/network.js');
    const network = new QuantumNetwork();
    network.registerNode('node_1', { role: 'gateway' });
    console.log('Network nodes:', network.nodes.size);
    break;
  
  case 'iot':
    console.log('Running IoT demo...');
    const { SensorNetwork } = await import('../web-of-things/sensor-network.js');
    const sensors = new SensorNetwork();
    sensors.register('sensor_1', { type: 'temperature', location: 'test', unit: '°C' });
    console.log('Registered sensors:', sensors.sensors.size);
    break;
  
  case 'ai':
    console.log('Running AI demo...');
    const { AIEngine } = await import('../quantium-core/ai-engine.js');
    const ai = new AIEngine();
    ai.registerModel('test_model', { type: 'test' });
    console.log('Registered models:', ai.models.size);
    break;
  
  case 'security':
    console.log('Running security demo...');
    const { QuantiumSecurity } = await import('../quantium-net/security.js');
    const security = new QuantiumSecurity();
    const keys = security.generateKeyPair('test');
    console.log('Generated keys:', keys.publicKey.substring(0, 8) + '...');
    break;
  
  case 'version':
  case 'v':
    console.log('Quantium version: 1.0.0');
    break;
  
  case 'help':
  case 'h':
  case '-h':
    console.log(`
Quantium CLI - Command Line Interface

Usage: quantium [command]

Commands:
  demo, run, start    Run the full demo (default)
  network            Run network demo only
  iot               Run IoT demo only
  ai                Run AI demo only
  security          Run security demo only
  version, v        Show version
  help, h            Show this help message

Examples:
  quantium
  quantium demo
  quantium network
  quantium --help
    `.trim());
    break;
  
  default:
    console.log(`Unknown command: ${command}`);
    console.log('Run "quantium help" for usage information');
    process.exit(1);
}

export default QuantiumCLI;
