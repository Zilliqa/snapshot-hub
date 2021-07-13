FROM node:14

WORKDIR /app
COPY . .

RUN npm install

EXPOSE 3000

ARG SCRIPT="start"
ENV SCRIPT=${SCRIPT}
ENTRYPOINT ["bash", "run.sh"]
