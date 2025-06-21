# Usar a imagem oficial do MySQL
FROM mysql:8.0

# Definir variáveis de ambiente para o MySQL
ENV MYSQL_ROOT_PASSWORD=12345678
ENV MYSQL_DATABASE=Scheduler

# Copiar os scripts SQL para o contêiner
COPY init.sql /docker-entrypoint-initdb.d/01-init.sql
COPY schema.sql /docker-entrypoint-initdb.d/02-schema.sql

# Expor a porta padrão do MySQL
EXPOSE 3306