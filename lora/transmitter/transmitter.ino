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
const unsigned long TRANSMISSION_WINDOW = 2000;

int transmissionInterval = 8000;

bool dataSent = false;

String tankId = "20";
int sequenceNumber = 0;


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
  if (currentLoopTime >= nextTransmissionTime) {
    Serial.println("waking up...");
    wakeUp();
    sendData();
    nextTransmissionTime = currentLoopTime + transmissionInterval;  // 8100
    Serial.print("will wake up again in ");
    Serial.print(nextTransmissionTime - currentLoopTime);
    Serial.println(" microsseconds");

    Serial.println("waiting for ACK" + String(sequenceNumber));
    ackTimeout = currentLoopTime + TRANSMISSION_WINDOW;
    while (millis() <= ackTimeout) {
      listenForACK();
    }
    Serial.println("going to sleep...");
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



void sendData() {
  distanceCm = getDistance();

  Serial.print("sending ");
  Serial.println(distanceCm);

  // Send packet in json format
  StaticJsonDocument<200> doc;
  doc["tank_id"] = tankId;
  doc["distance_cm"] = distanceCm;
  doc["seq"] = sequenceNumber++;

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


void listenForACK() {
  int packetSize = LoRa.parsePacket();

  if (packetSize) {
    if (millis() <= ackTimeout) {
      while (LoRa.available()) {
        contents += (char)LoRa.read();   // deve ser ACK{seq}:{tank_id}
      }

      const String receivedTankId = contents.substring(contents.lastIndexOf(":")+1);
      if (contents.startsWith("ACK" + String(sequenceNumber)) && receivedTankId == tankId) {
        Serial.println("ACK " + contents +" received!");
      }
    } else {  // timeout! (retransmission?)
      Serial.println("ACK timeout!");
      // retransmit
    }
  }


  contents = "";
  dataSent = false;
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
