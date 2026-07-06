FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY . .

# db.json cần được ghi được và giữ lại dữ liệu khi container restart
VOLUME ["/app/data"]
ENV DB_FILE=/app/data/db.json

RUN mkdir -p /app/data && \
    if [ ! -f /app/data/db.json ]; then echo '{"todos":[]}' > /app/data/db.json; fi

EXPOSE 4000

CMD ["node", "server.js"]
