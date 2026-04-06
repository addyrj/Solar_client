const mqtt = require("mqtt");
const db = require("../DB/config"); 
const { Op } = require("sequelize");

class MQTTService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.solarCharger = db.solarCharger;
    this.newDevice = db.newdevicelocationdetails;
    this.messageCount = 0;
    this.errorCount = 0;
    this.lastMessageTime = null;
  }

  initialize() {
    // MQTT Configuration
    const MQTT_HOST = process.env.MQTT_HOST;
    const MQTT_USERNAME = process.env.MQTT_USERNAME;
    const MQTT_PASSWORD = process.env.MQTT_PASSWORD;
    const MQTT_PASSWORD_HASH = require("crypto")
      .createHash("md5")
      .update(MQTT_PASSWORD)
      .digest("hex");

    const TOPIC = process.env.MQTT_TOPIC;

    try {
      this.client = mqtt.connect(MQTT_HOST, {
        username: MQTT_USERNAME,
        password: MQTT_PASSWORD_HASH,
        reconnectPeriod: 5000,
        connectTimeout: 30000
      });

      this.client.on("connect", () => {
        this.isConnected = true;
        console.log("✅ Connected to MQTT Server");
        console.log(`📡 MQTT Host: ${MQTT_HOST}`);
        
        this.client.subscribe(TOPIC, (err) => {
          if (err) {
            console.error("❌ Subscription error:", err);
          } else {
            console.log(`✅ Subscribed to topic: ${TOPIC}`);
          }
        });
      });

      this.client.on("error", (err) => {
        this.isConnected = false;
        this.errorCount++;
        console.error("❌ MQTT Error:", err);
      });

      this.client.on("message", (topic, message) => {
        this.messageCount++;
        this.lastMessageTime = new Date();
        console.log(`📨 Received MQTT Message #${this.messageCount} [${topic}]`);
        this.processMQTTMessage(message.toString());
      });

      this.client.on("close", () => {
        this.isConnected = false;
        console.log("🔌 MQTT Connection closed");
      });

      this.client.on("reconnect", () => {
        console.log("🔄 Attempting to reconnect to MQTT...");
      });

    } catch (error) {
      console.error("❌ MQTT Initialization failed:", error);
    }
  }

  // CRC32 function for UID generation
  crc32(str) {
    let crc = 0 ^ -1;
    for (let i = 0; i < str.length; i++) {
      crc = (crc >>> 8) ^ this.table[(crc ^ str.charCodeAt(i)) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }

  get table() {
    let t = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      t[i] = c;
    }
    return t;
  }

  // Check if device is registered
  async checkDeviceRegistered(UID) {
    try {
      const device = await this.newDevice.findOne({ where: { UID } });
      return device !== null;
    } catch (error) {
      console.error("Error checking device registration:", error);
      return false;
    }
  }
  async saveUnregisteredDevice(UID, Location) {
  try {
    const existing = await db.unregisteredDevices.findOne({
      where: { UID }
    });

    if (existing) {
      await existing.update({
        lastSeen: new Date(),
        count: existing.count + 1,
      });
    } else {
      await db.unregisteredDevices.create({
        UID,
        Location,
        firstSeen: new Date(),
        lastSeen: new Date(),
        count: 1,
      });
    }

    console.warn(`🚫 Unregistered device stored: ${UID}`);
  } catch (err) {
    console.error("❌ Failed to save unregistered device:", err.message);
  }
}


  // Process MQTT message and save to database
 async processMQTTMessage(payload) {
  try {
    console.log("🔄 Raw MQTT payload:", payload);

    // ------------------------------------
    // FIX INVALID JSON (ID without quotes)
    // ------------------------------------
 let fixedPayload = payload
  // Fix ID
  .replace(/"ID"\s*:\s*([A-Za-z0-9._-]+)/, `"ID":"$1"`)

  // Fix Time (normalize completely)
  .replace(/"Time"\s*:\s*"?([^"}]+)"?/, (match, p1) => {
    return `"Time":"${p1.trim()}"`;
  })

  // ❗ Remove accidental double quotes
  .replace(/""/g, '"')

  // Clean new lines
  .replace(/\r?\n|\r/g, "")
  .trim();
    console.log("🛠️ Fixed MQTT payload:", fixedPayload);

    const reading = JSON.parse(fixedPayload);

    const Location = reading.ID;
    const UID = this.crc32(Location).toString();

    // ✅ CHECK DEVICE REGISTRATION
 const isRegistered = await this.checkDeviceRegistered(UID);

if (!isRegistered) {
  console.warn(`⚠️ Device not registered: ${UID} (${Location})`);

  await this.saveUnregisteredDevice(UID, Location);

  return; // DO NOT save charger data
}


    // -----------------------------
    // Data Mapping
    // -----------------------------
    const PvVolt = reading.PVV ?? null;
    const PvCur = reading.PVC ?? null;
    const BatVoltage = reading.BV ?? null;
    const BatCurrent = reading.BC ?? null;
    const PVKWh = reading.KWh ?? null;

    const LoadVoltage = BatVoltage;
    const LoadCurrent = 0;
    const BatKWh = 0;
    const Temperature = 0;
    const IP = "MQTT";

    // -----------------------------
    // Time Conversion
    // -----------------------------
    let RecordTime;
    try {
      const [time, date] = reading.Time.split(" ");
      const [d, m, y] = date.split("/");
      RecordTime = new Date(`${y}-${m}-${d} ${time}`);
      if (isNaN(RecordTime)) RecordTime = new Date();
    } catch {
      RecordTime = new Date();
    }

    const roundedRecordTime = new Date(
      Math.floor(RecordTime.getTime() / 1000) * 1000
    );

    // -----------------------------
    // Avoid Duplicates
    // -----------------------------
    const exists = await this.solarCharger.findOne({
      where: { UID, RecordTime: roundedRecordTime }
    });

    if (exists) {
      console.log("ℹ️ Duplicate record skipped");
      return;
    }

    // -----------------------------
    // Save Data
    // -----------------------------
    const record = await this.solarCharger.create({
      Location,
      UID,
      PvVolt,
      PvCur,
      BatVoltage,
      BatCurrent,
      LoadVoltage,
      LoadCurrent,
      BatKWh,
      PVKWh,
      Temperature,
      RecordTime: roundedRecordTime,
      Time: new Date(),
      IP
    });

    console.log("✅ MQTT data saved:", {
      UID,
      Location,
      RecordTime: record.RecordTime
    });

  } catch (error) {
    this.errorCount++;
    console.error("❌ MQTT Processing Error:", error.message);
  }
}



  getStatus() {
    return {
      isConnected: this.isConnected,
      messagesReceived: this.messageCount,
      errorCount: this.errorCount,
      lastMessageTime: this.lastMessageTime,
      uptime: this.client ? 'Connected' : 'Disconnected',
      timestamp: new Date().toISOString()
    };
  }

   
  publish(topic, message) {
    if (this.client && this.isConnected) {
      this.client.publish(topic, message);
      console.log(`📤 Published to ${topic}: ${message}`);
      return true;
    } else {
      console.error('❌ MQTT client not connected');
      return false;
    }
  }

  // Disconnect MQTT client
  disconnect() {
    if (this.client) {
      this.client.end();
      console.log('🔌 MQTT client disconnected');
    }
  }
}

// Create singleton instance
const mqttService = new MQTTService();

module.exports = mqttService;

      
