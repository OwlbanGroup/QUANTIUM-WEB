/**
 * WEB OF THINGS - Sensor Network
 * Coordinates distributed sensor networks for IoT
 */

class SensorNetwork {
  constructor() {
    this.sensors = new Map();
    this.readings = new Map();
    this.aggregators = new Map();
    this.alerts = [];
  }

  /**
   * Register a sensor
   */
  register(sensorId, config) {
    const sensor = {
      id: sensorId,
      type: config.type, // 'temperature', 'humidity', 'pressure', etc.
      location: config.location,
      unit: config.unit,
      minValue: config.minValue,
      maxValue: config.maxValue,
      threshold: config.threshold,
      registeredAt: Date.now(),
      status: 'active',
      lastReading: null
    };
    
    this.sensors.set(sensorId, sensor);
    
    if (!this.readings.has(sensorId)) {
      this.readings.set(sensorId, []);
    }
    
    return { success: true, sensor };
  }

  /**
   * Read sensor data
   */
  read(sensorId, value) {
    const sensor = this.sensors.get(sensorId);
    if (!sensor) {
      return { error: 'Sensor not found' };
    }
    
    const reading = {
      sensorId,
      value,
      timestamp: Date.now(),
      unit: sensor.unit
    };
    
    // Store reading
    const readings = this.readings.get(sensorId);
    readings.push(reading);
    
    // Keep only last 1000 readings per sensor
    if (readings.length > 1000) {
      readings.shift();
    }
    
    sensor.lastReading = reading;
    
    // Check threshold
    if (sensor.threshold) {
      if (value > sensor.threshold.max || value < sensor.threshold.min) {
        this.triggerAlert(sensorId, value, sensor.threshold);
      }
    }
    
    return { success: true, reading };
  }

  /**
   * Trigger alert
   */
  triggerAlert(sensorId, value, threshold) {
    const alert = {
      id: `alert_${Date.now()}`,
      sensorId,
      value,
      threshold,
      timestamp: Date.now(),
      acknowledged: false
    };
    
    this.alerts.push(alert);
    return alert;
  }

  /**
   * Get latest reading
   */
  getLatest(sensorId) {
    const sensor = this.sensors.get(sensorId);
    return sensor ? sensor.lastReading : null;
  }

  /**
   * Get reading history
   */
  getHistory(sensorId, limit = 100) {
    const readings = this.readings.get(sensorId) || [];
    return readings.slice(-limit);
  }

  /**
   * Aggregate readings across sensors
   */
  aggregate(sensorIds, type = 'average') {
    const values = sensorIds.map(id => {
      const latest = this.getLatest(id);
      return latest ? latest.value : null;
    }).filter(v => v !== null);
    
    if (values.length === 0) {
      return { error: 'No readings available' };
    }
    
    let result;
    switch (type) {
      case 'average':
        result = values.reduce((a, b) => a + b, 0) / values.length;
        break;
      case 'min':
        result = Math.min(...values);
        break;
      case 'max':
        result = Math.max(...values);
        break;
      case 'sum':
        result = values.reduce((a, b) => a + b, 0);
        break;
      default:
        result = values.reduce((a, b) => a + b, 0) / values.length;
    }
    
    return { type, value: result, count: values.length };
  }

  /**
   * Get all active alerts
   */
  getAlerts() {
    return this.alerts.filter(a => !a.acknowledged);
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) {
      return { error: 'Alert not found' };
    }
    
    alert.acknowledged = true;
    alert.acknowledgedAt = Date.now();
    
    return { success: true, alert };
  }

  /**
   * Get network status
   */
  getStatus() {
    return {
      sensors: this.sensors.size,
      readings: Array.from(this.readings.values()).reduce((sum, arr) => sum + arr.length, 0),
      alerts: this.getAlerts().length,
      uptime: Date.now()
    };
  }
}

// Actuator Control Module
class ActuatorControl {
  constructor() {
    this.actuators = new Map();
    this.commands = new Map();
  }

  /**
   * Register actuator
   */
  register(actuatorId, config) {
    const actuator = {
      id: actuatorId,
      type: config.type, // 'relay', 'servo', 'valve', etc.
      location: config.location,
      capabilities: config.capabilities, // ['on', 'off'], ['0-180'], etc.
      registeredAt: Date.now(),
      status: 'idle',
      lastCommand: null
    };
    
    this.actuators.set(actuatorId, actuator);
    return { success: true, actuator };
  }

  /**
   * Execute command on actuator
   */
  command(actuatorId, command, value = null) {
    const actuator = this.actuators.get(actuatorId);
    if (!actuator) {
      return { error: 'Actuator not found' };
    }
    
    // Check if command is valid
    if (actuator.capabilities && !actuator.capabilities.includes(command)) {
      return { error: `Invalid command: ${command}` };
    }
    
    const cmd = {
      id: `cmd_${Date.now()}`,
      actuatorId,
      command,
      value,
      executedAt: Date.now(),
      status: 'executed'
    };
    
    actuator.lastCommand = cmd;
    actuator.status = command === 'off' ? 'idle' : 'active';
    
    if (!this.commands.has(actuatorId)) {
      this.commands.set(actuatorId, []);
    }
    this.commands.get(actuatorId).push(cmd);
    
    return { success: true, cmd };
  }

  /**
   * Get command history
   */
  getHistory(actuatorId, limit = 50) {
    const cmdList = this.commands.get(actuatorId) || [];
    return cmdList.slice(-limit);
  }
}

module.exports = { SensorNetwork, ActuatorControl };

// Demo
if (require.main === module) {
  const network = new SensorNetwork();
  const control = new ActuatorControl();

  console.log('=== SENSOR NETWORK ===');
  
  // Register sensors
  network.register('temp_1', {
    type: 'temperature',
    location: 'office',
    unit: '°C',
    minValue: -40,
    maxValue: 80,
    threshold: { min: 15, max: 30 }
  });
  
  network.register('temp_2', {
    type: 'temperature',
    location: 'warehouse',
    unit: '°C',
    minValue: -40,
    maxValue: 80,
    threshold: { min: 10, max: 35 }
  });
  
  network.register('humidity_1', {
    type: 'humidity',
    location: 'office',
    unit: '%',
    minValue: 0,
    maxValue: 100,
    threshold: { min: 30, max: 70 }
  });
  
  // Read sensor data
  network.read('temp_1', 22.5);
  network.read('temp_1', 24.1);
  network.read('temp_2', 18.7);
  network.read('humidity_1', 55);
  
  // Get latest
  console.log('Latest temp_1:', network.getLatest('temp_1'));
  
  // Aggregate
  const avg = network.aggregate(['temp_1', 'temp_2'], 'average');
  console.log('Average temperature:', avg);
  
  // Register actuator
  control.register('relay_1', {
    type: 'relay',
    location: 'hvac',
    capabilities: ['on', 'off']
  });
  
  // Execute command
  control.command('relay_1', 'on');
  console.log('Actuator last command:', control.actuators.get('relay_1').lastCommand);
  
  // Status
  console.log('Network status:', network.getStatus());
}
