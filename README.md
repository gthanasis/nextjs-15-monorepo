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
* [Tailwind](https://tailwindcss.com/)
* [MongoDB](https://www.mongodb.com/)
* [Docker](https://www.docker.com/)
* [Cypress](https://www.cypress.io/)
* [Vitest](https://vitejs.dev/guide/)
* [GitHub Actions](https://docs.github.com/en/actions)
* [Auth.js](https://authjs.dev/)
* [Turborepo](https://turborepo.dev/)

### :notebook: Dev Pre-Requisites
List all the pre-requisites the system needs to develop this project.
- nvm and the latest version of node.js (pref v20)
- yarn
- docker 20.* or later

##  :wrench: Development
Install the dependencies by running the following command in the root of the repository
```shell
yarn
```

Fill up your `.env` file with values from `.env.example` file for
- frontend
- microservices/control
- microservices/storage
```sh
VAPID_PRIVATE_KEY=

CONTROL_BACKEND_URL=http://localhost:3001
STORAGE_BACKEND_URL=http://localhost:3002
BACKEND_URL=http://localhost

AUTH_URL=http://localhost
AUTH_SECRET=super-secert-token
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_LOGIN_REDIRECT_URI=http://localhost/api/auth/callback/google
NEXT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoibmV4dCIsImlkIjoiaW50ZXJuYWwiLCJleHAiOjQ4ODg1NzQ0MjcsImltcGVyc29uYXRlIjp0cnVlLCJpbXBlcnNvbmF0b3JJRCI6bnVsbCwiaXNzIjoiaW50ZXJuYWwiLCJpYXQiOjE3MzQ5NzQ0Mjd9.dlCl-hmkrl1seUxr1nTnjaWtri-3f_PbIfwNf3IX3bU

# Public
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

To start developing the application you can run the
following command in the repository root. You need Docker
Engine running for this!

NOTE: Under frontend and each microservice 
- Fill up your `.env` file with values from `.env.example` file.


```sh
$ yarn dev
```

To run tests for all workspaces you can run the following command in the repository root.
```shell
$ yarn test
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
docker compose -f docker-compose.yml -f docker-compose-test.yml up
```

###  :fire: Contribution

Your contributions are always welcome and appreciated. Following are the things you can do to contribute to this project.

1. **Create a pull request** <br>
   You can start by creating your branch named after the task you pick. E.g
- feature/my-awesome-feature.
- fix/unbroke-your-code.
- chore/added-ci-cd.

When you finish developing or need to collaborate on the changes you can open a pull request.


### :cactus: Branches

1. **`main`** is the production branch.

3. No other permanent branches should be created in the main repository, you can create feature branches but they should get merged with the master.

**Steps to create a pull request**

1. Make a PR to `main` branch.
2. Comply with the best practices and guidelines
3. It must pass all the tests get positive reviews.

After this, changes will be merged.
