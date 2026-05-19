/**
 * QUANTIUM NET - Internet Protocol & Router
 * Distributed routing for Quantium Internet
 */

class QuantiumProtocol {
  constructor() {
    this.version = 'QUANTIUM/1.0';
    this.packets = [];
    this.maxTTL = 64;
  }

  /**
   * Create a Quantium packet
   */
  createPacket(source, target, payload, options = {}) {
    const packet = {
      id: this.generateId(),
      source,
      target,
      payload,
      type: options.type || 'data',
      priority: options.priority || 'normal',
      ttl: options.ttl || this.maxTTL,
      hops: 0,
      createdAt: Date.now(),
      protocol: this.version
    };
    
    this.packets.push(packet);
    return packet;
  }

  /**
   * Process packet hop
   */
  hop(packet, fromNode, toNode) {
    packet.hops++;
    packet.lastHop = {
      from: fromNode,
      to: toNode,
      timestamp: Date.now()
    };
    
    packet.ttl--;
    
    if (packet.ttl <= 0) {
      return { dropped: true, reason: 'TTL expired' };
    }
    
    return { forwarded: true, hops: packet.hops };
  }

  /**
   * Generate unique packet ID
   */
  generateId() {
    return `qpn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Quantum Router
class QuantiumRouter {
  constructor(protocol) {
    this.protocol = protocol;
    this.routes = new Map();
    this.routingTable = new Map();
  }

  /**
   * Add route to routing table
   */
  addRoute(destination, nextHop, metrics = {}) {
    this.routingTable.set(destination, {
      nextHop,
      metric: metrics.metric || 1,
      cost: metrics.cost || 0,
      addedAt: Date.now(),
      updatedAt: Date.now()
    });
    
    return { success: true, destination, nextHop };
  }

  /**
   * Remove route
   */
  removeRoute(destination) {
    return this.routingTable.delete(destination);
  }

  /**
   * Get next hop for destination
   */
  getRoute(destination) {
    return this.routingTable.get(destination) || null;
  }

  /**
   * Find best route using shortest path
   */
  findRoute(destination) {
    const route = this.routingTable.get(destination);
    if (route) {
      return {
        nextHop: route.nextHop,
        hops: route.metric,
        cost: route.cost
      };
    }
    return null;
  }

  /**
   * Route a packet
   */
  routePacket(packet) {
    const route = this.findRoute(packet.target);
    
    if (!route) {
      return { 
        routed: false, 
        reason: 'No route to destination',
        packet 
      };
    }
    
    return {
      routed: true,
      nextHop: route.nextHop,
      estimatedHops: route.hops,
      packet
    };
  }

  /**
   * Get routing table size
   */
  getTableSize() {
    return this.routingTable.size;
  }
}

// Distributed DNS
class QuantiumDNS {
  constructor() {
    this.records = new Map();
    this.reverseRecords = new Map();
  }

  /**
   * Register a domain
   */
  register(domain, address) {
    const record = {
      domain,
      address,
      createdAt: Date.now(),
      ttl: 3600 // 1 hour default
    };
    
    this.records.set(domain, record);
    this.reverseRecords.set(address, domain);
    
    return { success: true, record };
  }

  /**
   * Resolve domain to address
   */
  resolve(domain) {
    const record = this.records.get(domain);
    return record ? record.address : null;
  }

  /**
   * Reverse lookup
   */
  reverseResolve(address) {
    return this.reverseRecords.get(address) || null;
  }

  /**
   * Update record
   */
  update(domain, address) {
    const record = this.records.get(domain);
    if (!record) {
      return { error: 'Domain not found' };
    }
    
    record.address = address;
    record.updatedAt = Date.now();
    
    return { success: true, record };
  }
}

module.exports = { QuantiumProtocol, QuantiumRouter, QuantiumDNS };

// Demo
if (require.main === module) {
  const protocol = new QuantiumProtocol();
  const router = new QuantiumRouter(protocol);
  const dns = new QuantiumDNS();

  console.log('=== QUANTIUM NET ===');
  
  // Create and route packet
  const packet = protocol.createPacket('node_a', 'node_b', { data: 'hello' });
  console.log('Created Packet:', packet.id);
  
  // Add routes
  router.addRoute('node_b', 'gateway_1', { metric: 2, cost: 10 });
  router.addRoute('node_c', 'gateway_2', { metric: 1, cost: 5 });
  
  // Route packet
  const routed = router.routePacket(packet);
  console.log('Route Result:', routed);
  
  // Register domain
  dns.register('quantium.net', '192.168.1.100');
  dns.register('iot.quantium.net', '192.168.1.101');
  
  // Resolve
  console.log('Resolve quantium.net:', dns.resolve('quantium.net'));
  console.log('Reverse resolve:', dns.reverseResolve('192.168.1.100'));
}
