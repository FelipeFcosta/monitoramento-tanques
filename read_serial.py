import serial
import json
import time
import requests
from datetime import datetime

SERIAL_PORT = 'COM4'  # Windows COM port for arduino
BAUD_RATE = 9600
API_URL = 'http://localhost:3000/api/tanks'

def send_to_server(data):
    # post new measurement
    response = requests.post(f"{API_URL}/{data['tank_id']}/measurements", json=data)
    print(f"Sent to server. Response: {response}")


def main():
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE)
    print(f"listening on {SERIAL_PORT}")
    print(f"baud rate: {BAUD_RATE}")

    while True:
        try:
            line = ser.readline().decode('utf-8')
            if line:
                data = json.loads(line)
                data['timecode'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                print(f"received data: {data}")

                send_to_server(data)
                    
        except serial.SerialException as e:
            print(f"serial port error: {e}")
            time.sleep(1)  # Wait before trying to reconnect
        except KeyboardInterrupt:
            print("keyboard interrupt by user")
            break

if __name__ == "__main__":
    main()