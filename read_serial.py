import serial
import json
import time
import requests
from datetime import datetime, timedelta

SERIAL_PORT = 'COM7'  # Windows COM port for arduino
BAUD_RATE = 9600
API_URL = 'http://localhost:3000/api/tanks'

allData = []

def send_to_server(data):
    print("sending to server")
    data['distanceCm'] = data['distance_cm']
    data['tank_id'] = int(data['tank_id'])
    print(data)
    # post new measurement
    response = requests.post(f"{API_URL}/{data['tank_id']}/measurements", json=data)
    print(f"Sent to server. Response: {response}")


def main():
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE)
    print(f"listening on {SERIAL_PORT}")
    print(f"baud rate: {BAUD_RATE}")

    windowData = []

    while True:
        try:
            line = ser.readline().decode('utf-8')
            print(line)
            while (line.startswith("data:")):
                line = ser.readline().decode('utf-8')

                data = json.loads(line)
                allData.append(data)
                windowData.append(data)     # windowData: [data:0, data:1]

            for i in range(len(windowData)):
                data = windowData[i]
                data['timecode'] = (datetime.now() - (len(windowData)-i-1)*timedelta(seconds=8)).strftime("%Y-%m-%d %H:%M:%S")
                print(f"received data: {data}")

                send_to_server(data)
            windowData = []

                    
        except serial.SerialException as e:
            print(f"serial port error: {e}")
            time.sleep(1)  # Wait before trying to reconnect
        except KeyboardInterrupt:
            print("keyboard interrupt by user")
            break

if __name__ == "__main__":
    main()