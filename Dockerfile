FROM node:20-alpine AS frontend-builder
WORKDIR /app

COPY ./frontend/package*.json ./
RUN npm install

COPY ./frontend ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app

COPY ./backend/package*.json ./
RUN npm install

COPY ./backend ./

COPY --from=frontend-builder /app/dist ./public

EXPOSE 3000

CMD ["node", "server.js"]