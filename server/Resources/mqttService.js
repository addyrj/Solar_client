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
    const MQTT_HOST = process.env.MQTT_HOST || "mqtt://everonsolar.com:1883";
    const MQTT_USERNAME = process.env.MQTT_USERNAME || "your_username";
    const MQTT_PASSWORD = process.env.MQTT_PASSWORD || "your_password";
    const MQTT_PASSWORD_HASH = require("crypto")
      .createHash("md5")
      .update(MQTT_PASSWORD)
      .digest("hex");

    const TOPIC = process.env.MQTT_TOPIC || "mppt_demo";

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

  // Process MQTT message and save to database
  async processMQTTMessage(payload) {
    try {
      console.log('🔄 Processing MQTT payload:', payload);
      
      const reading = JSON.parse(payload);
      
      const Location = reading.ID;
      const UID = this.crc32(Location).toString();
      
      // ✅ CHECK IF DEVICE IS REGISTERED
      const isRegistered = await this.checkDeviceRegistered(UID);
      
      if (!isRegistered) {
        console.warn(`⚠️  Device ${UID} (Location: ${Location}) is not registered!`);
        console.warn(`📋 Please register this device first using POST /api/createNewDevice`);
        console.warn(`📋 Device details needed: UID: ${UID}, Location: ${Location}`);
        return {
          success: false,
          message: "Device not registered",
          UID,
          Location
        };
      }

      console.log(`✅ Device ${UID} is registered, processing data...`);
      
      // Convert values based on MQTT payload structure
      const PvVolt = reading.PVV !== undefined ? reading.PVV  : null;
      const PvCur = reading.PVC !== undefined ? reading.PVC  : null;
      const BatVoltage = reading.BV !== undefined ? reading.BV  : null;
      const BatCurrent = reading.BC !== undefined ? reading.BC  : null;
      const PVKWh = reading.KWh !== undefined ? reading.KWh  : null;
      
      // Default values for required fields
      const LoadVoltage = BatVoltage;
      const LoadCurrent = 0;
      const BatKWh = 0;
      const Temperature = 0;
      const IP = "MQTT";

      let RecordTime;
      try {
        const [time, date] = reading.Time.split(" ");
        const [d, m, y] = date.split("/");
        RecordTime = new Date(`${y}-${m}-${d} ${time}`);
        
        if (isNaN(RecordTime.getTime())) {
          console.log('⚠️  Invalid date format, using current time');
          RecordTime = new Date();
        }
      } catch (dateError) {
        console.log('⚠️  Date parsing error, using current time:', dateError);
        RecordTime = new Date();
      }

      // Round to second to avoid duplicates
      const roundToSecond = (date) =>
        new Date(Math.floor(new Date(date).getTime() / 1000) * 1000);

      const roundedRecordTime = roundToSecond(RecordTime);

      // Check for existing record
      const existingRecord = await this.solarCharger.findOne({
        where: {
          UID: UID,
          RecordTime: roundedRecordTime
        }
      });

      if (existingRecord) {
        console.log('ℹ️  Record already exists, skipping duplicate...');
        return {
          success: false,
          message: "Duplicate record",
          UID,
          RecordTime: roundedRecordTime
        };
      }

      // Create new record
      const newRecord = await this.solarCharger.create({
        Location: Location,
        UID: UID,
        PvVolt: PvVolt,
        PvCur: PvCur,
        BatVoltage: BatVoltage,
        BatCurrent: BatCurrent,
        LoadVoltage: LoadVoltage,
        LoadCurrent: LoadCurrent,
        BatKWh: BatKWh,
        PVKWh: PVKWh,
        Temperature: Temperature,
        RecordTime: roundedRecordTime,
        Time: new Date(),
        IP: IP
      });

      console.log('✅ MQTT Data stored successfully:', {
        ID: newRecord.ID,
        Location: newRecord.Location,
        UID: newRecord.UID,
        BatVoltage: newRecord.BatVoltage,
        PvVolt: newRecord.PvVolt,
        PVKWh: newRecord.PVKWh,
        RecordTime: newRecord.RecordTime
      });

      return {
        success: true,
        record: newRecord
      };

    } catch (error) {
      this.errorCount++;
      console.error('❌ Error processing MQTT message:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      return {
        success: false,
        error: error.message
      };
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


// const mqtt = require("mqtt");
// const db = require("../DB/config"); 
// const { Op } = require("sequelize");

// class MQTTService {
//   constructor() {
//     this.client = null;
//     this.isConnected = false;
//     this.solarCharger = db.solarCharger; 
//   }

//   initialize() {
//     // MQTT Configuration - Update with your credentials
//     const MQTT_HOST = "mqtt://everonsolar.com:1883";
//     const MQTT_USERNAME = "your_username"; // Add your username
//     const MQTT_PASSWORD = "your_password"; // Add your password
//     const MQTT_PASSWORD_HASH = require("crypto")
//       .createHash("md5")
//       .update(MQTT_PASSWORD)
//       .digest("hex");

//     const TOPIC = "mppt_demo";

//     try {
//       this.client = mqtt.connect(MQTT_HOST, {
//         username: MQTT_USERNAME,
//         password: MQTT_PASSWORD_HASH,
//       });

//       this.client.on("connect", () => {
//         this.isConnected = true;
//         console.log("✅ Connected to MQTT Server");
//         this.client.subscribe(TOPIC, (err) => {
//           if (err) {
//             console.error("Subscription error:", err);
//           } else {
//             console.log(`✅ Subscribed to topic: ${TOPIC}`);
//           }
//         });
//       });

//       this.client.on("error", (err) => {
//         this.isConnected = false;
//         console.error("❌ MQTT Error:", err);
//       });

//       this.client.on("message", (topic, message) => {
//         console.log(`📨 Received MQTT Message [${topic}]`);
//         this.processMQTTMessage(message.toString());
//       });

//       this.client.on("close", () => {
//         this.isConnected = false;
//         console.log("🔌 MQTT Connection closed");
//       });

//     } catch (error) {
//       console.error("❌ MQTT Initialization failed:", error);
//     }
//   }

//   // CRC32 function like PHP
//   crc32(str) {
//     let crc = 0 ^ -1;
//     for (let i = 0; i < str.length; i++) {
//       crc = (crc >>> 8) ^ this.table[(crc ^ str.charCodeAt(i)) & 0xff];
//     }
//     return (crc ^ -1) >>> 0;
//   }

//   get table() {
//     let t = [];
//     for (let i = 0; i < 256; i++) {
//       let c = i;
//       for (let j = 0; j < 8; j++) {
//         c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
//       }
//       t[i] = c;
//     }
//     return t;
//   }

//   // Process MQTT message and save to database
//   async processMQTTMessage(payload) {
//     try {
//       console.log('Processing MQTT payload:', payload);
      
//       const reading = JSON.parse(payload);
      
//       const Location = reading.ID;
//       const UID = this.crc32(Location).toString();
      
//       // Convert values based on your MQTT payload structure
//       const PvVolt = reading.PVV !== undefined ? reading.PVV / 100 : null;
//       const PvCur = reading.PVC !== undefined ? reading.PVC / 100 : null;
//       const BatVoltage = reading.BV !== undefined ? reading.BV / 100 : null;
//       const BatCurrent = reading.BC !== undefined ? reading.BC / 100 : null;
//       const PVKWh = reading.KWh !== undefined ? reading.KWh / 1000 : null;
      
//       // Default values for required fields
//       const LoadVoltage = BatVoltage; // Using battery voltage as load voltage
//       const LoadCurrent = 0;
//       const BatKWh = 0;
//       const Temperature = 0;
//       const IP = "MQTT";

//       // Convert time format from "18:29:30 18/11/2025" to JavaScript Date
//       let RecordTime;
//       try {
//         const [time, date] = reading.Time.split(" ");
//         const [d, m, y] = date.split("/");
//         RecordTime = new Date(`${y}-${m}-${d} ${time}`);
        
//         // Validate the date
//         if (isNaN(RecordTime.getTime())) {
//           console.log('Invalid date, using current time');
//           RecordTime = new Date();
//         }
//       } catch (dateError) {
//         console.log('Date parsing error, using current time:', dateError);
//         RecordTime = new Date();
//       }

//       // Round to second to avoid duplicates
//       const roundToSecond = (date) =>
//         new Date(Math.floor(new Date(date).getTime() / 1000) * 1000);

//       const roundedRecordTime = roundToSecond(RecordTime);

//       // Check for existing record
//       const existingRecord = await this.solarCharger.findOne({
//         where: {
//           UID: UID,
//           RecordTime: roundedRecordTime
//         }
//       });

//       if (existingRecord) {
//         console.log('Record already exists, skipping...');
//         return;
//       }

//       // Create new record
//       const newRecord = await this.solarCharger.create({
//         Location: Location,
//         UID: UID,
//         PvVolt: PvVolt,
//         PvCur: PvCur,
//         BatVoltage: BatVoltage,
//         BatCurrent: BatCurrent,
//         LoadVoltage: LoadVoltage,
//         LoadCurrent: LoadCurrent,
//         BatKWh: BatKWh,
//         PVKWh: PVKWh,
//         Temperature: Temperature,
//         RecordTime: roundedRecordTime,
//         Time: new Date(),
//         IP: IP
//       });

//       console.log('✅ MQTT Data stored successfully:', {
//         ID: newRecord.ID,
//         Location: newRecord.Location,
//         UID: newRecord.UID,
//         BatVoltage: newRecord.BatVoltage,
//         PvVolt: newRecord.PvVolt,
//         PVKWh: newRecord.PVKWh,
//         RecordTime: newRecord.RecordTime
//       });

//       return newRecord;

//     } catch (error) {
//       console.error('❌ Error processing MQTT message:', error);
//       console.error('Error details:', {
//         message: error.message,
//         stack: error.stack
//       });
//     }
//   }

//   // Get MQTT connection status
//   getStatus() {
//     return {
//       isConnected: this.isConnected,
//       timestamp: new Date().toISOString()
//     };
//   }

//   // Publish message (if needed)
//   publish(topic, message) {
//     if (this.client && this.isConnected) {
//       this.client.publish(topic, message);
//       console.log(`📤 Published to ${topic}: ${message}`);
//     } else {
//       console.error('❌ MQTT client not connected');
//     }
//   }
// }

// // Create singleton instance
// const mqttService = new MQTTService();

// module.exports = mqttService;