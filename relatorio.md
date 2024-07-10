# Relatório do Projeto de Monitoramento de Tanques

## 1. Forma de Comunicação

O sistema de comunicação segue o fluxo: Sensor (Tanque) <-> Receptor (Gateway) -> Servidor

- **Sensor para Receptor**: Comunicação realizada através de LoRa, utilizando a biblioteca LoRa.h
- **Receptor para Servidor**: Dados enviados via serial, lidos por um script Python que faz chamadas à API do servidor
- **Servidor**: Backend em Express.js, armazenando dados em um banco SQLite
- **Frontend**: Dashboard web implementado com HTML, JavaScript e CSS, servido por http-server

<p align="center"><img alt=Dashboard src=https://raw.githubusercontent.com/FelipeFcosta/monitoramento-tanques/main/images/dashboard.png width="400"></p>

## 2. Coordenação e Economia de Energia

O protocolo de comunicação e economia de energia funciona da seguinte forma:

1. Inicialmente, os dispositivos LoRa (receptor e sensor) realizam polling
2. O receptor envia um ACK para o primeiro pacote (sequenceNumber = 0)
3. Após este ACK, os dispositivos sincronizam seus tempos
4. Os dispositivos entram em modo de sono por um intervalo fixo (e.g. 8 segundos)
5. Acordam em intervalos sincronizados para transmissão/recepção
6. Durante a janela de transmissão (e.g. 3 segundos), o sensor envia dados e aguarda um ACK

Este método permite que os sensores economizem energia durante os períodos de inatividade (nesse caso, 8-3=5 segundos dormindo nessa demonstração, mas possivelmente uma proporção bem maior de economia), acordando em períodos fixos para transmitir dados.

## 3. Estatísticas Utilizadas

### 3.1 Estatísticas do Tanque

- **Nível do Tanque**: Calculado com base no formato (cilíndrico horizontal/vertical) e dimensões do tanque informadas pelo usuário.
- **Consumo**: Gráfico mostrando o consumo calculado baseado na distância detectada pelo sensor ultrassônico.
- **Previsão de reabastecimento**: Calculada baseada na média da taxa de consumo a cada dois pontos do gráfico, os pontos são considerados apenas a partir do último reabastecimento.
- **Log de Dados**: Exibe informações como timestamp de cada medida e RSSI
- **Apresentação dos Dados**: Interface web com uma visualização geral de cada tanque e suas localizações destacadas no mapa, e uma visualização das estatísticas mais específicas para o tanque selecionado.

<p align="center"><img alt=Estatísticas do Tanque src=https://raw.githubusercontent.com/FelipeFcosta/monitoramento-tanques/main/images/stats.png width="400"></p>

### 3.2 Estatísticas de Rede

- **Retransmissão**: 
  - O sensor envia o pacote e aguarda ACK (formato: ack:{seq+1}:{tank_id})
  - Se ocorrer timeout do ACK, o pacote é armazenado em buffer pelo transmissor
  - Pacotes não confirmados são reenviados na próxima transmissão
  - O receptor calcula o número de retransmissões pela quantidade de pacotes recebidos em uma única janela. A informação não está integrada com o frontend e é apenas indicado no monitor serial.
- **Perda de Dados**: Ocorre quando há overflow no buffer do sensor (e.g. máximo de 10 pacotes não confirmados)
- **RSSI**: Registrado para cada transmissão, indicando a potência do sinal recebido

## 4. Resposta ao Questionamento

*"Como você poderia otimizar para retirar a restrição de acordar em tempo fixo e realizar a gestão de múltiplos tanques?"*

O LoRa transmissor pode enviar pontos de controle em tempos fixos (e.g. 30 minutos) apenas para informar ao receptor que a conexão está ativa e que o nível está inalterado. O sensor ainda irá acordar em tempos fixos (e.g. 15 minutos), mas por um tempo ativo bem curto apenas para monitorar o nível atual e verificar se houve alguma alteração significativa, se não, ele não enviará nenhuma informação ao receptor. Se houver uma alteração indicativa de uso do tanque, o transmissor informa ao receptor que irá enviar dados de maneira mais frequente (e.g. a cada minuto).


A gestão de múltiplos tanques pode ser implementada através de Time Division Multiplexing (TDM):

- Cada tanque recebe uma janela de tempo específica para transmissão
- Exemplo:
  - Nó 1: 0-2 segundos
  - Nó 2: 2-4 segundos
  - ...
- Os tanques dormem por um período variável, calculado com base em seu ID
- O receptor mantém uma escuta ativa durante todo o ciclo

*"Como obter os dados de timestamp para os pacotes retransmitidos?"*

- Solução: Adicionar o atributo de quantos microssecondos atrás (considerando o tempo da trasmissão de dados atual) a informação da distância foi detectada pelo sensor quando os dados do pacote não confirmado foram coletados.


## 5. Repositório e Informações de Execução

- **Repositório**: [https://github.com/FelipeFcosta/monitoramento-tanques](https://github.com/FelipeFcosta/monitoramento-tanques)

## 6. Mais funcionalidades do Dashboard

### Registro de Tanques

O sistema inclui uma interface para registro de novos tanques, permitindo a entrada de informações detalhadas, calculando a capacidade de acordo com o tipo e dimensões do tanque, o ID do tanque precisa ser o mesmo do sensor respectivo (hardcoded):

<p align="center"><img alt=Registro de Tanque src=https://raw.githubusercontent.com/FelipeFcosta/monitoramento-tanques/main/images/register.png width="400"></p>

### API para Integração de Dados

O sistema utiliza uma API RESTful para integração de dados dos sensores, essa é a requisição que o script python execute para enviar os dados ao servidor:

<p align="center"><img alt=API src=https://raw.githubusercontent.com/FelipeFcosta/monitoramento-tanques/main/images/api.png width="400"></p>

### Geolocalização de Tanques

A localização do tanque é realizada pelo usuário durante o registro e exibidos em um mapa interativo:

<p align="center"><img alt=Marcador de Tanque src=https://raw.githubusercontent.com/FelipeFcosta/monitoramento-tanques/main/images/marker.png width="300"></p>

## 7. Conclusão e TODO

### Conclusão
O sistema desenvolvido envolve uma série de protocolos de comunicação em diferentes níveis que enriquecem o conhecimento prático sobre as diversas tecnologias atuais necessárias para resolver o problema de comunicação de dados por longa distância, com restrições de baixo consumo, e a apresentação das informações úteis por meio de um dashboard. Foi realizado um protótipo, que, como prova de conceito, demonstrou as possibilidades desse sistema que pode ser tornado mais robusto para um uso mais eficiente de energia e com a possibilidade de múltiplos tanques, que apesar de ser suportado pelo dashboard, ainda não é viável na prática apenas adicionando mais sensores à rede simultaneamente.

### TODO
1. Implementar gerenciamento de múltiplos tanques
2. Otimizar a eficiência no consumo de energia para despertar em tempos variáveis e enviar informações quando estritamente necessário para poupar a energia do receptor que estará gerenciando mais de um tanque.
3. Desenvolver um sistema dinâmico de alocação de janelas de tempo para transmissão
4. Implementar um sistema de alerta para níveis críticos de tanque


## 8. Referências

1. Arduino-LoRa API: [github.com/sandeepmistry/arduino-LoRa/blob/master/API.md](https://github.com/sandeepmistry/arduino-LoRa/blob/master/API.md)
2. https://github.com/sandeepmistry/arduino-LoRa/blob/master/examples/LoRaSender/LoRaSender.ino
3. https://github.com/sandeepmistry/arduino-LoRa/blob/master/examples/LoRaReceiver/LoRaReceiver.ino

## Instruções de Instalação e Execução

### Backend (API)
1. Na pasta `api`, execute:
- `npm install`

- `npm start`

### Frontend
1. Na pasta `frontend`, execute:
- `npm install`

- `npm start`

### Arduino
1. Upload dos códigos `receiver.ino` e `transmitter.ino` para os respectivos Arduinos.
2. Instale as bibliotecas "ArduinoJson (by Benoit Blanchon)" e "LoRa (by Sandeep Mistry)" no Arduino IDE.

### Script Python
1. Instale as dependências:
- `pip install pyserial`
-  `pip install requests`
2. Execute:
- `python read_serial.py`

(Não esqueça de configurar a porta correta para o receptor, ex: COM7 no Windows)

## Tecnologias Utilizadas

- **Frontend**: HTML, JavaScript e CSS puro (sem framework), servido por http-server
- **Backend**: Express.js para endpoints da API, SQLite para banco de dados
- **Comunicação**: LoRa para transmissão de longo alcance, Python para leitura serial e envio de dados ao servidor
- **Hardware**: Arduino com módulos LoRa e sensor ultrassônicos no transmissor