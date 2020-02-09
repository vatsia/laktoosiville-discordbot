FROM node:alpine

WORKDIR /laktoosi
COPY ./src /laktoosi
RUN npm install \
    && adduser -DS laktoosi \ 
    && chown -R laktoosi /laktoosi
ENV AUTH_TOKEN <auth token>
USER laktoosi

CMD ["node", "laktoosi.js"]