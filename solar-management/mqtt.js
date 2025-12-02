// <?php

// /*
// Current Json Message Format - 
// {"ID":"IND.DEL.del129","PVV":16.4,"PVC":1.0,"BV":12.9,"BC":1.2,"KWh":0.083,"Time":"11:51:50 31/10/2025"}
// */

// $server   = 'localhost';
// $port     = 1883;
// $clientId = 'evmqtt-sub';
// $_TOPIC    = 'mppt_demo'; //31-10-2025

// //Database variables
// $servername = "localhost";
// $username = "";
// $password = "";
// $dbname = "";

// function addToDB(string $message)
// {
// 	global $conn;


// 	$reading = json_decode($message);
// 	//echo $reading->Time;
	
// 	//echo "adding data" . "\r\n";
// 	$loc = $reading->ID;
// 	$uid = crc32($loc);
// 	$volt = $reading->PVV * 100;
// 	$cur = $reading->PVC * 100;
// 	$bvolt = $reading->BV * 100;
// 	$bcur = $reading->BC * 100;
// 	$temp = 0;
// 	$bkwh = 0;
// 	$kwh = $reading->KWh * 1000;
// 	$load = 0;
// 	$pass = 'pass';
// 	$IP = 'Not Set';
        
//         //Split into time and date
// 	list($time, $date) = explode(" ", $reading->Time);
// 	// Further split time and date
// 	$timeParts = explode(":", $time);      // [14, 0, 10]
// 	$dateParts = explode("/", $date);      // [1, 11, 2025]
//         //create date time string acceptable to MySQL in Y-m-d h:i:s format
//         $dateToBeInserted = $dateParts[2]."-".$dateParts[1]."-".$dateParts[0]." ".$timeParts[0].":".$timeParts[1].":".$timeParts[2];

	
// 	//echo "making sql" . "\r\n";
// 	$sql = "INSERT INTO SolarCharger (Location, UID, BatVoltage, BatCurrent, PvVolt, PvCur, LoadVoltage, LoadCurrent, BatKWh, PVKWh, Temperature, Time, IP)
//         VALUES ('$loc', $uid, $bvolt, $bcur, $volt, $cur, $bvolt, $load, $bkwh, $kwh, $temp, '$dateToBeInserted', '$IP')";
// 	//echo "run query"  . "\r\n" . $sql . PHP_EOL;
// 	$query_res = $conn->query($sql);
// 	if ($query_res === TRUE)
// 	{
// 	    echo "Stored=ok,TIME=" . date('H:i:s d-m-Y') . "\r\n";
// 		echo "Record Sent & Updated" . "\r\n";
// 	} 
// 	else 
// 	{
// 		echo "Error: " . $sql . "<br>" . $conn->error;
// 	}
// }

// date_default_timezone_set('Asia/Kolkata');
// $conn = new mysqli($servername, $username, $password, $dbname);
// // Check connection
// if ($conn->connect_error) {
//     echo "Connection failed: " . $conn->connect_error . "\r\n";
// } else
// 	echo "Connected to DB" . "\r\n";


// $_USERNAME = '';
// $_TOKEN = '';
// $_TOKEN_HASH = md5($_TOKEN);
// $_HOST = 'everonsolar.com';
// $_PORT = 1883;

// // Use port 8883 for SSL
// $_PAYLOAD = 'Subscribing MQTT Topic - ' . $_TOPIC;
// $_QOS = 0;

// // Using the PHP Mosquitto extension (https://github.com/mgdm/Mosquitto-PHP).
// $client = new Mosquitto\Client();

// // Bind callbacks
// $client->onConnect('on_connect');
// $client->onDisconnect('on_disconnect');
// $client->onSubscribe('on_subscribe');
// $client->onMessage('on_message');

// // Set client credentials.
// $client->setCredentials($_USERNAME, $_TOKEN_HASH);
// $client->connect($_HOST, $_PORT);

// // Subscribe to a topic
// $client->subscribe($_TOPIC, $_QOS);

// // Loop forever to maintain a connection with the host.
// for (;;) {
//     $client->loop();
// }

// // Define callback functions.
// function on_connect($rc, $message)
// {
//     global $_TOPIC, $_PAYLOAD, $client;
//     // Display the connection's result code and explanation message.
//     echo 'Code: ' . $rc . ' (' . $message . ')' . PHP_EOL;
// }

// function on_subscribe()
// {
//     global $_TOPIC;
//     // Confirm that the subscription has been made.
//     echo 'Subscription confirmed to ' . $_TOPIC . PHP_EOL;
// }

// function on_message($message)
// { 
//     global $_TOPIC, $servername, $username, $password, $dbname;
//     	try {
// 		global $conn;
// 		echo sprintf("Received message on topic [%s]: %s\n", $_TOPIC, $message->payload);
// 		addToDB($message->payload);	
// 	}
// 	//catch exception
// 	catch(Exception $e) {
// 		echo 'Message: ' .$e->getMessage();
// 	}
// }


// ?>



const mqtt = require("mqtt");
const mysql = require("mysql2/promise");

// ---------------------------
// Database Connection
// ---------------------------
const dbConfig = {
  host: "localhost",
  user: "",
  password: "",
  database: "",
};

let conn;

async function initDB() {
  try {
    conn = await mysql.createConnection(dbConfig);
    console.log("Connected to DB");
  } catch (err) {
    console.error("DB Connection Failed:", err);
  }
}

initDB();

// ---------------------------
// MQTT Configuration
// ---------------------------
const MQTT_HOST = "mqtt://everonsolar.com:1883";
const MQTT_USERNAME = "";
const MQTT_PASSWORD = "";       // Actual password
const MQTT_PASSWORD_HASH = require("crypto")
  .createHash("md5")
  .update(MQTT_PASSWORD)
  .digest("hex");

const TOPIC = "mppt_demo";

// ---------------------------
// Convert PHP addToDB()
// ---------------------------
async function addToDB(payload) {
  try {
    const reading = JSON.parse(payload);

    const loc = reading.ID;
    const uid = crc32(loc);
    const volt = reading.PVV * 100;
    const cur = reading.PVC * 100;
    const bvolt = reading.BV * 100;
    const bcur = reading.BC * 100;
    const temp = 0;
    const bkwh = 0;
    const kwh = reading.KWh * 1000;
    const load = 0;
    const IP = "Not Set";

    // --------------------------
    // Convert Time Format
    // "11:51:50 31/10/2025"
    // → "2025-10-31 11:51:50"
    // --------------------------
    const [time, date] = reading.Time.split(" ");
    const [d, m, y] = date.split("/");
    const finalDate = `${y}-${m}-${d} ${time}`;

    const sql = `
      INSERT INTO SolarCharger 
      (Location, UID, BatVoltage, BatCurrent, PvVolt, PvCur, LoadVoltage, LoadCurrent, BatKWh, PVKWh, Temperature, Time, IP)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      loc,
      uid,
      bvolt,
      bcur,
      volt,
      cur,
      bvolt,
      load,
      bkwh,
      kwh,
      temp,
      finalDate,
      IP,
    ];

    await conn.execute(sql, values);

    console.log(`Stored=ok, TIME=${new Date().toLocaleString("en-IN")}`);
    console.log("Record Sent & Updated\n");
  } catch (err) {
    console.error("Insert Error:", err);
  }
}

// ---------------------------
// MQTT Client
// ---------------------------
const client = mqtt.connect(MQTT_HOST, {
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD_HASH,
});

client.on("connect", () => {
  console.log("Connected to MQTT Server");
  client.subscribe(TOPIC, () => {
    console.log("Subscribed to topic:", TOPIC);
  });
});

client.on("error", (err) => {
  console.error("MQTT Error:", err);
});

client.on("message", (topic, message) => {
  console.log(`Received Message [${topic}] => ${message.toString()}`);
  addToDB(message.toString());
});

// ---------------------------
// CRC32 function like PHP
// ---------------------------
function crc32(str) {
  let crc = 0 ^ -1;

  for (let i = 0; i < str.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i)) & 0xff];
  }

  return (crc ^ -1) >>> 0;
}

const table = (() => {
  let t = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    t[i] = c;
  }
  return t;
})();


