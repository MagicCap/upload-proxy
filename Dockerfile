FROM node:10-stretch
WORKDIR /var/proxy
COPY . .
EXPOSE 8080
ENV MAGICCAP_HOST 0.0.0.0
RUN sh ./get_uploaders.sh
RUN npm i --unsafe-perm=true
CMD node .
