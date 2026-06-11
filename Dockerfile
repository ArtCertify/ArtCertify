FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM nginx:alpine

RUN adduser -D -H -u 1001 -s /sbin/nologin webapp

RUN mkdir -p /app/www

COPY --from=builder /app/dist /app/www

COPY nginx.conf /etc/nginx/templates/default.conf.template

# Set permissions for the webapp user
RUN chown -R webapp:webapp /app/www && \
    chmod -R 755 /app/www  &&\
    chown -R webapp:webapp /var/cache/nginx && \
    chown -R webapp:webapp /var/log/nginx && \
    chown -R webapp:webapp /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown webapp:webapp /var/run/nginx.pid


# Tell nginx's template processing which variables to replace
ENV NGINX_ENVSUBST_TEMPLATE_DIR=/etc/nginx/templates
ENV NGINX_ENVSUBST_TEMPLATE_SUFFIX=.template
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx/conf.d
ENV PORT=8080
EXPOSE 8080

# Switch to non-root user
USER webapp

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
