# Aggregator for Pryv.io 

Pryv.io is Pryv's software (middleware) for management of personal and health data, see. [pryv.com](https://pryv.com)

While Pryv.io is designed to store and manage data per-individual / per-consent, it might be usefull to aggregate the data of multiple individual in a single place. As an example, when a process requires the data from a cohort of patients. 

## Aggregator's Features

### Basics

- Holds a set of [pryvApiEndpoints](https://api.pryv.com/guides/app-guidelines/) `https://{token}@{individial storage path}/` which contains the necessary credentials to access a single account. 
- When a new individual's apiEndPoint is registered on the aggregator, the aggregator 
  - Fetches the current streams structure and events
  -  Creates and register one [Webhook](https://api.pryv.com/guides/webhooks/) per individual on Pryv.io to be advertised of changes.
- Then the aggregator listen for triggers from the webhooks and advertises changes on the account.

### State Storage

- States (list of pryvApiEndpoints & synchronization statuses ) can be stored locally on the server or remotely in a dedicated Pryv.io account. 
- The aggregator offers a framework to design custom state storages.

### Data Storage

- Individual's Data can be stored locally in an sqlite database
- The aggregator offers a framework to design custom data storages.

## Install

### Requirements: 

	- Node.js 12+
	- NPM 
	- An option SSL reverse-proxy (exemple nginx) to secure trigger notices.

### Install:

- run `npm setup`

### Configuration: 

- edit `config.json`
  - **server:** Server configuration
    - **port:** the port to listen
    - **host**: the interface to use. for all:  `0.0.0.0`, for localhost only: `127.0.0.1`
  - **service**: Url to reach the aggregator service, if no SSL termination: **http://{hostname}:{port}/**
  - **state-storage**: Choose **one** stage storage to use, see stage storage bellow
  - **data-listeners**: Array of **data listeners** to use, more informations bellow

#### Configuration, State Storage

A State storage holds the list of web hooks and their status, currently supported stage storage is SQLITE. 

``` json
 "state-storage": {
    "module": "StateStorageSqlite",
    "params": {
      "dbfile": "./db-states.sqlite",
      "log": false
    }
  }
```

To implement your own State Storage, look at `src/state-storage`

#### Configuration, Data Listeners

A Data Listener, register to data change and take actions, for example `DataListenerConsole`prints outs changes and `DataListenerSQLite` keeps streams and events data in a local database.

```json
"data-listeners": [
    {
      "module": "DataListenerConsole",
      "params": {}
    },
    {
      "module": "DataListenerSQLite",
      "params": {
        "dbfile": "./db-data.sqlite",
        "log": false
      }
    }
  ]
```

To implement your own Data Listener, look at `src/data-listeners`

## Run

`npm run start`

## API

### Register a new "hook"

`POST /hook`

Content:

```json
{
	"pryvApiEndpoint": "https://{token}@{pryvApiEndPoint}"
}
```

Result:

```json
{
	"result": "OK"
}
```



## Test

`npm run test`

### License

BSD-3 Clause