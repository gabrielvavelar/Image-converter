# Image Converter 🖼️🔄

API REST desenvolvida com Spring Boot e arquitetura de microsserviços para conversão assíncrona de imagens (PNG, JPEG, WEBP). 
Utiliza RabbitMQ para comunicação entre a API e um worker de processamento em background, com armazenamento das imagens no AWS S3.

## Funcionalidades

- **Upload e Conversão de Imagens**: Faça upload de imagens e converta para PNG, JPEG ou WEBP.
- **Processamento Assíncrono**: Conversões são processadas em segundo plano usando RabbitMQ.
- **Armazenamento na Nuvem**: Integração com AWS S3 para armazenamento de imagens.
- **Download de Resultados**: Download das imagens convertidas.

## Tecnologias Utilizadas

- **Backend**: Java 17, Spring Boot
- **Mensageria**: RabbitMQ
- **Armazenamento**: AWS S3
- **Containerização**: Docker, Docker Compose
- **Build Tool**: Maven

## Uso da API

### 1. Converter Imagem
**Endpoint**: `POST /`

Faça upload de uma imagem para conversão.

**Parâmetros (form-data)**:
- `imageFile`: Arquivo da imagem (MultipartFile)
- `sourceFormat`: Formato de origem (PNG, JPEG, WEBP)
- `targetFormat`: Formato desejado (PNG, JPEG, WEBP)

**Exemplo com curl**:
```bash
curl -X POST http://localhost:8080 \
  -F "imageFile=@image.png" \
  -F "sourceFormat=PNG" \
  -F "targetFormat=JPEG"
```

**Resposta**:
```json
{
  "id": "uuid-da-conversao",
  "status": "PROCESSING"
}
```

### 2. Verificar Status
**Endpoint**: `GET /{id}/status`

Verifique o status da conversão.

**Exemplo**:
```bash
curl http://localhost:8080/uuid-da-conversao/status
```

**Resposta**:
```json
{
  "status": "COMPLETED"
}
```

### 3. Baixar Imagem Convertida
**Endpoint**: `GET /`

Baixe a imagem convertida.

**Parâmetros de query**:
- `id`: UUID da conversão
- `format`: Formato da imagem (PNG, JPEG, WEBP)
- `originalName`: Nome original do arquivo

**Exemplo**:
```bash
curl -O -J "http://localhost:8080?id=uuid&format=JPEG&originalName=image.png"
```
---
Feito por [Gabriel Venancio de Avelar](https://github.com/gabrielvavelar)
