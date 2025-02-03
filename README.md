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

This repository uses yarn workspaces to handle dependencies and inner shared ts modules.
* https://classic.yarnpkg.com/lang/en/docs/workspaces/

###  :electric_plug: Installation
To run the PLACEHOLDER_NAME locally you need to have docker installed (preferable >= 20.*) and docker compose.
You can simply deploy the whole application locally by running the following command in the repository root.
```sh
$ yarn start:docker
```

### :notebook: Dev Pre-Requisites
List all the pre-requisites the system needs to develop this project.
- nvm and the latest version of node.js (pref v18.12.1)
- yarn
- docker 20.* or later

##  :wrench: Development
To start developing the application you can run the following command in the repository root.

```sh
$ yarn dev
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
