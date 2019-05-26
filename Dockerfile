FROM node:latest
RUN mkdir /website
WORKDIR /website
ADD ./website /website
RUN npm install
CMD ["npm", "run", "start"]