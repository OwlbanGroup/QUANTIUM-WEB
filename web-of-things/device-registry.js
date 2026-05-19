/**
 * Web of Things - Device Registry
 * Manages IoT device registration and discovery
 */

class DeviceRegistry {
  constructor() {
    this.devices = new Map();
    this.attributes = new Map();
  }

  /**
   * Register a new device
   */
  register(deviceId, metadata) {
    const device = {
      id: deviceId,
      ...metadata,
      registeredAt: Date.now(),
      status: 'active',
      capabilities: metadata.capabilities || []
    };
    
    this.devices.set(deviceId, device);
    
    // Index by attributes for discovery
    if (metadata.type) {
      if (!this.attributes.has(metadata.type)) {
        this.attributes.set(metadata.type, new Set());
      }
      this.attributes.get(metadata.type).add(deviceId);
    }
    
    return { success: true, device };
  }

  /**
   * Unregister a device
   */
  unregister(deviceId) {
    const device = this.devices.get(deviceId);
    if (!device) {
      return { error: 'Device not found' };
    }
    
    this.devices.delete(deviceId);
    
    // Clean up attribute index
    if (device.type) {
      const typeSet = this.attributes.get(device.type);
      if (typeSet) typeSet.delete(deviceId);
    }
    
    return { success: true };
  }

  /**
   * Find devices by type
   */
  findByType(type) {
    const ids = this.attributes.get(type) || new Set();
    return Array.from(ids).map(id => this.devices.get(id));
  }

  /**
   * Get device by ID
   */
  get(deviceId) {
    return this.devices.get(deviceId) || null;
  }

  /**
   * List all devices
   */
  list() {
    return Array.from(this.devices.values());
  }

  /**
   * Update device status
   */
  updateStatus(deviceId, status) {
    const device = this.devices.get(deviceId);
    if (!device) {
      return { error: 'Device not found' };
    }
    device.status = status;
    device.updatedAt = Date.now();
    return { success: true, device };
  }
}

// Digital Twin for device simulation
class DigitalTwin {
  constructor(deviceRegistry) {
    this.registry = deviceRegistry;
    this.twins = new Map();
  }

  createTwin(deviceId) {
    const device = this.registry.get(deviceId);
    if (!device) {
      return { error: 'Device not found' };
    }

    this.twins.set(deviceId, {
      originalId: deviceId,
      state: {},
      createdAt: Date.now()
    });

    return { success: true, twinId: deviceId };
  }

  updateTwinState(deviceId, state) {
    const twin = this.twins.get(deviceId);
    if (!twin) {
      return { error: 'Twin not found' };
    }
    twin.state = { ...twin.state, ...state };
    twin.updatedAt = Date.now();
    return { success: true, twin };
  }

  getTwinState(deviceId) {
    return this.twins.get(deviceId);
  }
}

module.exports = { DeviceRegistry, DigitalTwin };

// Demo
if (require.main === module) {
  const registry = new DeviceRegistry();
  const digitalTwin = new DigitalTwin(registry);

  console.log('=== WEB OF THINGS - DEVICE REGISTRY ===');
  
  // Register devices
  registry.register('temp_sensor_1', { 
    type: 'temperature_sensor', 
    location: 'office',
    capabilities: ['read', 'alert']
  });
  
  registry.register('temp_sensor_2', { 
    type: 'temperature_sensor', 
    location: 'warehouse',
    capabilities: ['read']
  });
  
  registry.register('smart_light_1', { 
    type: 'light', 
    location: 'lobby',
    capabilities: ['on', 'off', 'dim']
  });
  
  // Find all temperature sensors
  const sensors = registry.findByType('temperature_sensor');
  console.log('Temperature Sensors:', sensors.length);
  
  // Create digital twin
  digitalTwin.createTwin('temp_sensor_1');
  digitalTwin.updateTwinState('temp_sensor_1', { temperature: 22.5 });
  console.log('Digital Twin:', digitalTwin.getTwinState('temp_sensor_1'));
  
  // List all devices
  console.log('All Devices:', registry.list().length);
}
