#!/bin/bash
echo -e "\n - Building logger \n" && cd logger && yarn build && cd ..
echo -e "\n - Building library \n" && cd library && yarn build && cd ..
echo -e "\n - Building microservice \n" && cd microservice && yarn build && cd ..
echo -e "\n - Building middlewares \n" && cd middlewares && yarn build && cd ..
echo -e "\n - Building middlewares \n" && cd api-client && yarn build && cd ..
echo -e "\n"
