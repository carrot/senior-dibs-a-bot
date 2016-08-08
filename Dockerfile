FROM node:4.2-onbuild
RUN npm i -g pm2

CMD ["pm2", "start", "index.js", "--no-daemon"] 
