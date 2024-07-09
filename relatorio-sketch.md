# Relatório do Projeto de Monitoramento de Tanques

## 1. Forma de Comunicação

O sistema de comunicação segue o fluxo: Sensor (Tanque) -> Receptor (Gateway) -> Servidor

- **Sensor para Receptor**: Comunicação realizada através de LoRa
- **Receptor para Servidor**: Dados enviados via serial através de chamadas de API
- **Servidor**: Armazena os dados em um banco de dados SQLite
- **Frontend**: Dashboard web que exibe os dados dos tanques cadastrados e suas medidas

<p align="center"><img alt=Dashboard src=https://raw.githubusercontent.com/FelipeFcosta/monitoramento-tanques/main/images/dashboard.png width="400"></p>

## 2. Coordenação e Economia de Energia

A coordenação entre o receptor e o sensor (tanque) para economizar energia segue o seguinte protocolo:

1. Inicialmente, os dispositivos LoRa (receptor e sensor) realizam polling
2. O receptor envia um ACK1 para o primeiro pacote (sequenceNumber = 0)
3. Após este ACK, os dispositivos sincronizam
4. Por um tempo configurável (hardcoded), ambos os dispositivos entram em modo de sono
5. Os dispositivos acordam em intervalos sincronizados de transmissão
6. Durante a janela de transmissão, o sensor envia dados e aguarda um ACK

Este método permite que os sensores economizem energia durante os períodos de inatividade.

## 3. Estatísticas Utilizadas

### 3.1 Estatísticas do Tanque

- **Nível do Tanque**: Calculado com base no formato e dimensões do tanque (inseridas pelo usuário no cadastro)
- **Consumo**: Gráfico mostrando o consumo calculado baseado na distância detectada pelo sensor
- **Log de Dados**: Exibe informações como timecode de cada medida e RSSI
- **Apresentação dos Dados**: Interface web com visualizações gráficas e tabulares

<p align="center"><div style="align: center"><img alt=Estatísticas do Tanque src=https://raw.githubusercontent.com/FelipeFcosta/monitoramento-tanques/main/images/stats.png width="400"></div></p>

### 3.2 Estatísticas de Rede

- **Sincronização**: Conforme descrito na seção 2
- **Retransmissão**: 
  - O sensor envia o pacote e aguarda ACK (formato: ack:{seq+1}:{tank_id})
  - Se ocorrer timeout do ACK, o pacote é armazenado em buffer
  - Pacotes não confirmados são reenviados na próxima transmissão
- **Perda de Dados**: Acontece quando ocorre overflow buffer do sensor. Não há estatísticas para esse fenômeno no sistema. 
- **RSSI**: Registrado para cada transmissão, indicando a potência do sinal

## 4. Resposta ao Questionamento

Pergunta: "Como você poderia otimizar para retirar a restrição de acordar em tempo fixo e realizar a gestão de múltiplos tanques?"

Resposta: A otimização para gerenciar múltiplos tanques pode ser implementada através de Time Division Multiplexing (TDM). Neste esquema:

- Cada tanque recebe uma janela de tempo específica para transmissão
- Exemplo:
  - Nó 1: 0-2 segundos
  - Nó 2: 2-4 segundos
  - ...
- Os tanques dormem por um período fixo (por exemplo, 1 minuto)
- O ciclo se repete

Esta abordagem permite uma gestão eficiente de energia e comunicação para múltiplos tanques.

## 5. Repositório e Informações de Execução

- **Repositório**: [https://github.com/FelipeFcosta/monitoramento-tanques](https://github.com/FelipeFcosta/monitoramento-tanques)

### Sistema de Registro de Tanques

O sistema inclui uma interface para registro de novos tanques, permitindo a entrada de informações detalhadas:

<p align="center"><img alt=Registro de Tanque src=https://raw.githubusercontent.com/FelipeFcosta/monitoramento-tanques/main/images/register.png width="400"></p>

### API para Integração de Dados

O sistema utiliza uma API RESTful para integração de dados dos sensores:

<p align="center"><img alt=API src=https://raw.githubusercontent.com/FelipeFcosta/monitoramento-tanques/main/images/api.png width="400"></p>

### Geolocalização de Tanques

Os tanques são geolocalizados e exibidos em um mapa interativo:

<p align="center"><img alt=Marcador de Tanque src=https://raw.githubusercontent.com/FelipeFcosta/monitoramento-tanques/main/images/marker.png width="400"></p>

## 6. Conclusão e TODO

### Conclusão
----
### TODO
1. Implementar gerenciamento de múltiplos tanques
2. Otimizar a eficiência no consumo de energia para despertar em tempos variáveis e enviar dados apenas quando necessário.
3. Desenvolver um sistema dinâmico de alocação de janelas de tempo para transmissão


## 7. Referências

1. Arduino-LoRa API: [github.com/sandeepmistry/arduino-LoRa/blob/master/API.md](https://github.com/sandeepmistry/arduino-LoRa/blob/master/API.md)