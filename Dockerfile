FROM mhart/alpine-node:10.15.1
RUN mkdir -p /usr/src/app
COPY ./src /usr/src/app
WORKDIR /usr/src/app
RUN which nodemon || (npm install -g nodemon)
COPY ./package.json /usr/src/app
COPY ./tsconfig.json /usr/src/app
RUN npm install
RUN which tsc || (npm install -g typescript) 
RUN tsc
EXPOSE 3007
CMD ["npm", "start"]
