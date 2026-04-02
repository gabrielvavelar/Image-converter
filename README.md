# Image Converter 🖼️🔄

<img width="1911" height="575" alt="image" src="https://github.com/user-attachments/assets/2eb21d63-4cfe-4b10-9e64-f6b0cc255c62" />

## Sobre o Projeto

Aplicação full stack desenvolvida com Spring Boot e arquitetura de microsserviços para conversão assíncrona de imagens (PNG, JPEG, WEBP).
Utiliza RabbitMQ para comunicação entre a API e um worker de processamento em background, com armazenamento das imagens no Amazon S3.
Frontend desenvolvido com HTML, CSS e JavaScript vanilla.

## Como Funciona

O fluxo da aplicação é assíncrono e acontece em etapas:

1. O usuário envia uma imagem pelo frontend e escolhe o formato de saída (PNG, JPEG ou WEBP).
2. A API recebe o arquivo, salva a imagem original no Amazon S3 (pasta `input/`) e cria uma tarefa com status inicial `PENDING`.
3. A API publica o `id` da tarefa em uma fila no RabbitMQ para processamento em background.
4. O worker consome a mensagem da fila, atualiza o status para `PROCESSING`, baixa a imagem original do S3 e executa a conversão.
5. Após converter, o worker salva o arquivo final no S3 (pasta `output/`) e atualiza a tarefa para `COMPLETED` (ou `FAILED` em caso de erro).
6. O frontend consulta o status da conversão e, quando concluída, disponibiliza o download da imagem convertida.


## Tecnologias Utilizadas

- **Backend**: Java 17, Spring Boot
- **Mensageria**: RabbitMQ
- **Armazenamento**: AWS S3
- **Containerização**: Docker, Docker Compose
- **Build Tool**: Maven

---
Feito por [Gabriel Venancio de Avelar](https://github.com/gabrielvavelar)
