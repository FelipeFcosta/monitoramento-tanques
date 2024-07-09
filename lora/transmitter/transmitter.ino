// Include required libraries
#include <SPI.h>
#include <LoRa.h>
#include <LowPower.h>
#include <ArduinoJson.h>
#include "limits.h"
 
#define TRIG_PIN 3
#define ECHO_PIN 4

String contents = "";

// ultrassom
float distanceCm;
long duration;
 
unsigned long currentLoopTime;
unsigned long nextTransmissionTime = 0;
unsigned long ackTimeout;
unsigned long goToSleepTime = 0;
const unsigned long TRANSMISSION_WINDOW = 3000;

int transmissionInterval = 8000;

bool dataSent = false;

String tankId = "20";
int sequenceNumber = 0;


// Structure to store packet data
struct PacketData {
  float distanceCm;
  int sequenceNumber;
};

const int MAX_UNACKED_PACKETS = 10;
PacketData unackedPackets[MAX_UNACKED_PACKETS];
int unackedCount = 0;

bool ackReceived = false;



void setup() {
  Serial.begin(9600);
  while (!Serial);
 
  // ultrassom
  pinMode(TRIG_PIN, OUTPUT);
	pinMode(ECHO_PIN, INPUT);
 
  Serial.println("LoRa transmitter");

  // Setup LoRa module 
  if (!LoRa.begin(915E6)) {
    Serial.println("failed to start LoRa transmitter!");
    while (1);
  }
}


void loop() {
  currentLoopTime = millis();
  if (sequenceNumber == 0 || currentLoopTime >= nextTransmissionTime) {
    ackReceived = false;
    if (sequenceNumber > 0) {
      Serial.println("waking up...");
      wakeUp();
      sendData();
      nextTransmissionTime = currentLoopTime + transmissionInterval;  // 8100
      Serial.print("will wake up again in ");
      Serial.print(nextTransmissionTime - currentLoopTime);
      Serial.println(" microsseconds");
    } else {
      sendData();
    }

    Serial.println("waiting for ACK" + String(sequenceNumber+1));

    ackTimeout = currentLoopTime + TRANSMISSION_WINDOW;
    while (millis() <= ackTimeout) {
      if (listenForACK()) {
        ackReceived = true;
        break;
      }
    }

    if (sequenceNumber == 0) return;

    if (ackReceived == false) {
      Serial.println("ack timeout!");
      Serial.println("storing [" + String(distanceCm) + ", " + String(sequenceNumber) + "]");
      unackedPackets[unackedCount].distanceCm = distanceCm;
      unackedPackets[unackedCount].sequenceNumber = sequenceNumber;
      unackedCount++;
      if (unackedCount > 10) unackedCount = 0;
      sequenceNumber++;
	    Serial.println("going to sleep...");
      return;
    } else {
      unackedCount = 0;
    }
    
    if (sequenceNumber > 1) {
	    Serial.println("going to sleep...");
	    sequenceNumber++;
    }
  }
}


float getDistance() {
  // limpar pino trigger
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  
  // enviar pulso ultrasonico
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // pin vai para 1 quando ultrassom eh emitido e continua 1 ate sensor receber o eco, e volta pra 0
  duration = pulseIn(ECHO_PIN, HIGH);
  
  float speedOfSound = 0.0343; // por microssegundo
  return duration * speedOfSound/2.0;
}


void sendUnackedData() {
  // unacked packets
  for (int i = 0; i < unackedCount; i++) {
    Serial.print("sending ");
    Serial.println(String(unackedPackets[i].distanceCm));

    // Send packet in json format
    StaticJsonDocument<200> doc;
    doc["tank_id"] = tankId;
    doc["distance_cm"] = unackedPackets[i].distanceCm;
    doc["seq"] = unackedPackets[i].sequenceNumber;

    String message;
    serializeJson(doc, message);

    LoRa.beginPacket();
    LoRa.print(message);
    LoRa.endPacket();

    Serial.print("sent data: ");
    Serial.println(message);

    delay(100);
  }
}

void sendData() {
  sendUnackedData();

  distanceCm = getDistance();

  Serial.print("sending ");
  Serial.println(distanceCm);

  // Send packet in json format
  StaticJsonDocument<200> doc;
  doc["tank_id"] = tankId;
  doc["distance_cm"] = distanceCm;
  doc["seq"] = sequenceNumber;

  String message;
  serializeJson(doc, message);

  LoRa.beginPacket();
  LoRa.print(message);
  LoRa.endPacket();

  Serial.print("sent data: ");
  Serial.println(message);

  dataSent = true;

  // REMOVER SE BUGAR
  LoRa.receive();
}


bool listenForACK() {
  int packetSize = LoRa.parsePacket();

  if (packetSize) {
    if (millis() <= ackTimeout) {
      while (LoRa.available()) {
        contents += (char)LoRa.read();   // deve ser ACK{seq}:{tank_id}
      }

      const String receivedTankId = contents.substring(contents.lastIndexOf(":")+1);
      if (contents.startsWith("ACK" + String(sequenceNumber+1)) && receivedTankId == tankId) {
        Serial.println("ACK " + contents +" received!");

        if (sequenceNumber == 0) {
          sequenceNumber++;
	        nextTransmissionTime = currentLoopTime + transmissionInterval;
          Serial.println("synchronizing...");
          Serial.print("will wake up again in ");
          Serial.print(nextTransmissionTime - millis());
          Serial.println(" microsseconds");
        }

        contents = "";
        dataSent = false;
        return true;
      }
    } else {  // timeout! (retransmission?)
      Serial.println("ACK timeout!");
      // retransmit
    }
  }

  contents = "";
  dataSent = false;
  return false;


}

void wakeUp() {
  // 
  // if (!LoRa.begin(915E6)) {
  //   Serial.println("Starting LoRa failed!");
  //   while (1)
  //     ;
  // }
}

void goToSleep() {
  // aqui deve dormir
}
