#include <SPI.h>
#include <LoRa.h>
#include <ArduinoJson.h>
 
// Receive message variables
String contents = "";

int msgCount = 0;

int msgCountWindow = 0;

// configured data
int margin = 500;
int transmissionInterval = 8000;
int receiveInterval = transmissionInterval + margin; // after configured

// data received
float distanceCm;
String tankId;
long unsigned sequenceNumber;
long unsigned ackNumber = 0;

unsigned long currentLoopTime;
unsigned long nextWakeTime = 0;

const unsigned long windowStart = 0;
const unsigned long LISTEN_WINDOW = 3000;

int retransmissions = 0;

 
void setup() {
  Serial.begin(9600);
  while (!Serial);
 
  // Setup LoRa module
  Serial.println("LoRa Receiver");
 
  // Start LoRa module at local frequency
  if (!LoRa.begin(915E6)) {
    Serial.println("failed to start LoRa receiver!");
    while (1);
  }
}

void loop() {
  currentLoopTime = millis(); // 150
  if (currentLoopTime >= nextWakeTime) {
    msgCountWindow = 0;
    Serial.println("listening for data...");

    if (msgCount != 0) {
      nextWakeTime = currentLoopTime + receiveInterval - margin;
      Serial.print("will wake up again in ");
      Serial.print(nextWakeTime - currentLoopTime);
      Serial.println(" microsseconds");

      while (millis() - currentLoopTime <= LISTEN_WINDOW) {
        listenForData();
      }
      contents = "";

      if (msgCountWindow != 0)
        retransmissions += msgCountWindow-1;
      msgCountWindow = 0;
      Serial.println("total number of retransmissions: " + String(retransmissions));
      Serial.println("going to sleep...");
    } else {
      listenForData();
    }
  }
}


void listenForData() {
  contents = "";
  // Try to parse packet
  int packetSize = LoRa.parsePacket();
 
  // Received a packet
  if (packetSize) {
    // first synchronize
    if (msgCount == 0) {
      nextWakeTime = millis() + receiveInterval - 2*margin;
      Serial.println("synchronizing...");
    }

    // Read packet
    while (LoRa.available()) {
      contents += (char)LoRa.read();
    }

    StaticJsonDocument<200> jsonDoc;
    DeserializationError error = deserializeJson(jsonDoc, contents);

    if (error) {
      Serial.print("deserialization failed: ");
      Serial.println(error.c_str());
      return false;
    }

    tankId = jsonDoc["tank_id"].as<String>();
    distanceCm = jsonDoc["distance_cm"];
    sequenceNumber = jsonDoc["seq"];


    // if (sequenceNumber == ackNumber)
    // if (isTankMonitored(tankId))

    ackNumber = sequenceNumber + 1;

    sendJsonToSerial();

    sendACK();
 
    contents = "";
    msgCount++;
    msgCountWindow++;
  }
}

void sendACK() {
  Serial.println("sending ACK"+ String(ackNumber) + ":" + tankId);
  LoRa.beginPacket();
  LoRa.print("ACK");
  LoRa.print(ackNumber); // esperando seq+1 do transmissor
  LoRa.print(":");
  LoRa.print(tankId);
  LoRa.endPacket();

  LoRa.receive();
}


void sendJsonToSerial() {
  StaticJsonDocument<200> outputDoc;
  outputDoc["tank_id"] = tankId;
  outputDoc["distance_cm"] = distanceCm;
  outputDoc["seq"] = sequenceNumber;
  outputDoc["rssi"] = LoRa.packetRssi();

  String outputMessage;
  serializeJson(outputDoc, outputMessage);

  // ler isso pelo python!
  Serial.println("data:" + String(msgCountWindow));
  Serial.println(outputMessage);
}



