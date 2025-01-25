# Introduction
This is a boilerplate Monorepo with next.js and node.js microservices

## Detach 
To detach this and start working on it you need to decide on some names:
- Project name
- Database name (optional, if you skip this it will default to the project name)

Then run the following command in the root of the repository
```shell
yarn detach --name=MY_APP --db=MY_DB
```

## :ledger: Index

- [About](#beginner-about)
    - [Installation](#electric_plug-installation)
- [Pre-Requisites](#notebook-pre-requisites)
- [Development](#wrench-development)
- [Community](#cherry_blossom-community)
    - [Contribution](#fire-contribution)
    - [Branches](#cactus-branches)

##  :beginner: About
The project is built with Next.js and Node.js and utilizes a mongodb database. Both parts of the codebase are written in typescript. Here are some useful resources to get started. 
* [React.js](https://reactjs.org/)
* [Next.js](https://nextjs.org/)
* [Node.js](https://nodejs.org/en/)
* [TypeScript](https://www.typescriptlang.org/)
* [CSS Modules](https://github.com/css-modules/css-modules)
* [Redux toolkit](https://redux-toolkit.js.org/)
* [Redux thunks](https://github.com/reduxjs/redux-thunk)

This repository uses yarn workspaces to handle dependencies and inner shared ts modules.
* https://classic.yarnpkg.com/lang/en/docs/workspaces/

###  :electric_plug: Installation
To run the PLACEHOLDER_NAME locally you need to have docker installed (preferable >= 20.*) and docker compose.
You can simply deploy the whole application locally by running the following command in the repository root.
```sh
$ docker compose up
```

### :notebook: Dev Pre-Requisites
List all the pre-requisites the system needs to develop this project.
- nvm and the latest version of node.js (pref v18.12.1)
- yarn
- docker 20.* or later

##  :wrench: Development
To start developing the application you can run the following command.

```sh
$ docker compose up mongo
```

After this you should have a mongodb container running. You can the start by installing the repository dependencies with the following command in the repository root.

```sh
$ yarn # installing the deps
```

### Common modules <br>
When installing the app for the first time you need to build the library. (And you need to rebuild when you change something under /modules folder). To do this you can run

```shell
$ cd modules
$ ./build.sh
```

> USEFUL FACT: There is a module that is called project-types which holds all typescript types and is shared between frontend and backend. This won't require a rebuild after changes.

### Backend <br>
> IMPORTANT NOTE: You need to either add your GOOGLE MAPS API KEY  key to your .bash_profile or export it like this <br>

```shell
$ export GOOGLE_MAPS_API_KEY="you-api-key-here"
```

You can then go to the main microservice and start the development server
```shell
$ cd microservices/control
$ yarn dev # starting the backend in watch mode
```

Our backend has been written with the clean architecture paradigm which enables us to run test in parallel with the development. To do that you can start a new shell and run the following command
```shell
$ cd microservices/control 
$ yarn test:watch
```

### Frontend

The Next.js app can be run with the following command

```sh
$ cd frontend
$ yarn dev # start the frontend in watch mode
```

To run the frontend test suite you can run the following command
```shell
$ cd frontend && yarn test
```

### E2e tests

You need to issue the following command to start the e2e tests. These will run in docker as they would run in github actions.

```shell
yarn e2e:run
```

Then you can start the test environment. (Non persistent DB)
```shell
docker-compose -f docker-compose.yml -f docker-compose-test.yml up
``` 

To run them in cypress:open mode you can go into e2e dir
```shell
cd e2e
yarn install
yarn cypress:open
```

If you want to reapply the fixtures you can run this command in the repo root
```shell
yarn pree2e:run
docker-compose -f docker-compose.yml -f docker-compose-test.yml up
```

###  :fire: Contribution

Your contributions are always welcome and appreciated. Following are the things you can do to contribute to this project.

1. **Create a pull request** <br>
   You can pick an item from the trello board, assign it to you and move it to doing column. After doing this you can start by creating your branch named after the task you pick. E.g PLACEHOLDER_NAME_BRANCH_PREFIX-7. When you finish developing or need to collaborate on the changes you can open a pull request and move the issue from doing to code-review.


### :cactus: Branches

1. **`main`** is the production branch.

3. No other permanent branches should be created in the main repository, you can create feature branches but they should get merged with the master.

**Steps to create a pull request**

1. Make a PR to `main` branch.
2. Comply with the best practices and guidelines
3. It must pass all the tests get positive reviews.

After this, changes will be merged.
