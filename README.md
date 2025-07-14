# 🌱 Dashboard de Monitoreo Ambiental para Macetas - Facultad de Gastronomía PUCP
Este proyecto consiste en el desarrollo de un dashboard interactivo para visualizar en tiempo real la temperatura y humedad de macetas ubicadas en la Facultad de Gastronomía de la PUCP. Está diseñado para apoyar el cuidado óptimo de plantas sensibles al ambiente, clave en entornos gastronómicos donde se cultivan hierbas y otros ingredientes frescos.

El sistema emplea un ESP32U conectado a sensores ambientales (DHT11 y VH400), enviando datos a través de MQTT hacia una base de datos central. La interfaz gráfica fue desarrollada con React, y permite al usuario:

- Consultar datos históricos y en tiempo real.
- Visualizar gráficas de temperatura y humedad por planta.
- Evaluar el estado actual de cada maceta (crítico, estable u óptimo).
- Seleccionar macetas específicas para análisis personalizado.

Este proyecto combina hardware embebido, comunicación en la nube y visualización de datos para aportar una solución tecnológica al cuidado sostenible de plantas en contextos educativos.

