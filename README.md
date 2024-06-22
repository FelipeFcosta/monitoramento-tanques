# Projeto de Monitoramento Remoto de Tanques de Combustível
## Objetivo do Projeto
Desenvolver um sistema de monitoramento remoto de tanques de combustível utilizando comunicação Lora e dispositivos Arduino. O sistema deve monitorar o nível do combustível e transmitir dados quando o nível baixar, utilizando mecanismos de baixo consumo de energia que ativam o transmissor e receptor em tempos preestabelecidos. Os dados devem ser apresentados em uma interface de servidor, incluindo a expectativa de reabastecimento.

## Tecnologias e Enlaces de Comunicação
Dispositivos Arduino: Serão utilizados para medir o nível do combustível no tanque.
Comunicação Lora: A tecnologia Lora será usada para transmitir os dados do nível de combustível dos dispositivos Arduino para um receptor remoto.
Servidor Central: Receberá e armazenará os dados transmitidos, apresentando-os em uma interface gráfica.
Descrição do Sistema
Monitoramento Local (Arduino)

Sensor de Nível de Combustível: Os alunos devem definir a melhor forma de medir o nível de combustível no tanque (utilizando um tanque fictício com água com corante).
Lógica de Transmissão: O Arduino enviará dados sempre que o nível de combustível baixar. Para economizar bateria, o dispositivo ficará em modo de baixo consumo e só despertará em intervalos de tempo fixos para verificar o nível e transmitir dados se necessário.
Mecanismos de Baixo Consumo de Energia: Tanto o transmissor quanto o receptor ficarão em estado de baixo consumo de energia, ativando-se em intervalos de tempo preestabelecidos para enviar e receber dados.
Transmissão de Dados (Lora)

Módulo Lora: Utilizado para transmitir dados do Arduino para o receptor remoto.
Intervalos Fixos: Transmissões ocorrerão em intervalos fixos, ativando o transmissor e receptor para reduzir o consumo de energia.
Receptor Remoto

Recepção de Dados: O receptor remoto captará os dados enviados pelo Arduino via Lora.
Armazenamento de Dados: Os dados serão armazenados para análise e apresentação no servidor.
Servidor Central

Base de Dados: Armazenará os dados recebidos dos tanques monitorados.
Interface de Usuário: Uma interface gráfica permitirá a visualização dos níveis de combustível, histórico de dados e previsão de reabastecimento.
Análise de Consumo: Com base nos dados recebidos, o sistema calculará a expectativa de reabastecimento, considerando a taxa de consumo nos últimos intervalos.
Descrição da Interface de Servidor
Dashboard Principal: Mostrar os níveis atuais de combustível dos tanques monitorados.
Histórico de Dados: Gráficos e tabelas com os níveis de combustível ao longo do tempo.
Previsão de Reabastecimento: Informações sobre o tempo médio esperado para o tanque esvaziar com base no consumo recente.
Capacidade de Extensão: Interface que permite adicionar novos tanques e configurar suas propriedades de monitoramento.
Entregáveis do Projeto
Código Fonte: Todo o código fonte utilizado no projeto, incluindo o código Arduino e scripts do servidor.
Documentação: Documentação detalhada do projeto, explicando a configuração, uso e manutenção do sistema.
Apresentação Funcional: Uma apresentação demonstrando o sistema em funcionamento, destacando as funcionalidades e a interface do usuário.
Requisitos de Implementação
Hardware Necessário:

Arduino (um para cada tanque monitorado)
Sensores de nível de líquido (definidos pelos alunos)
Módulos Lora (transmissor e receptor)
Computador/Servidor para receber e processar os dados
Software Necessário:

IDE Arduino para programar os dispositivos
Bibliotecas Lora para Arduino
Ambiente de desenvolvimento para o servidor (Python, Node.js, etc.)
Banco de dados (MySQL, PostgreSQL, etc.)
Desenvolvimento e Testes
Fase de Desenvolvimento:

Programação dos dispositivos Arduino para leitura do nível de combustível e transmissão via Lora.
Configuração do servidor para receber, armazenar e apresentar os dados.
Implementação da interface gráfica do usuário.
Fase de Testes:

Testes de cada componente do sistema.
Testes de integração para garantir a comunicação entre dispositivos e servidor.
Testes de desempenho e consumo de energia.
Os alunos devem seguir este guia para desenvolver o projeto e garantir que todos os componentes funcionem conforme esperado, resultando em um sistema de monitoramento de tanques de combustível eficiente e eficaz.
