# Dockerfile
FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

# Instalar o netcat (nc)
RUN apt-get update && apt-get install -y netcat-traditional
RUN npm install -g nodemon

COPY . .

RUN chmod +x ./wait-for-db.sh

EXPOSE 3000

CMD ["sh", "./wait-for-db.sh", "npm", "run", "dev"]


