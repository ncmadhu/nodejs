# Set the base image to node 
FROM node:7.8.0 

# File Author / Maintainer
MAINTAINER Madhu Chakravarthy

#copy the restserver
ADD ./oneview/ /usr/src/oneview/

# Set the default directory where CMD will execute
WORKDIR /usr/src/oneview

# Install node modules
RUN npm install

# Expose ports
EXPOSE 4000

# Set the default command to execute    
# when creating a new container
CMD ["node", "index.js"] 

