# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app

# Baked in at build time since Vite inlines VITE_* vars into the bundle.
# Override with: docker build --build-arg VITE_API_BASE_URL=... .
ARG VITE_API_BASE_URL=http://localhost:8080/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Runtime stage ---
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
