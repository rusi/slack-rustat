# The Rustat Hristov Slack bot

**Rusi:**
> btw, I am thinking about adding a bot to help me set my slack status easier... something to help with the whole WFH situation :confused:

> I want to have pre-defined statuses, like ":hamburger: ...lunch" and ":afk: away from the keyboard", and others

> and that would be easy to trigger with `/status lunch` or `/status afk` or `/status clear` ...

> actually that exists :smile:

> it is not as nice as a one word status msg... but it's usable :slightly_smiling_face:

**Me:**
> So what you want is actually pre-defined status messages that may be activated with a shortcut/keyword?

**Rusi:**
> yes, and maybe some other functions similar to slack's workflows - say I set my status with `/status lunch` - maybe after an hour, a message will popup with a button - "are you back" or something like that

> or I can have `/status meeting 30` to set a 30 minute meeting status message

> the idea is that you should be able to see my slack status, and know what's going on - similar to when we are in the office together - you can just look at my desk and see me working, or having a meeting, or eating, or not being there :smile:

## Installation

TBD

## Usage

```
/rustat help
/rustat add <key> <message>
/rustat remove <key>
/rustat list
/rusi <key> [<expire in minutes>]
/rusi clear
```

## Development

### Setup

Requires:
- NodeJS 12.x
- Serverless Framework
    ```sh
    npm i -g serverless
    ```

```sh
npm i
sls dynamodb install
```

### Running locally

```sh
npm run start:dev

# or
IS_OFFLINE=1 sls offline start
```

To invoke individual functions:
```sh
IS_OFFLINE=1 sls invoke local -f createRustat --path sample.rustat.payload.json
# (snip)
# Sample response:
{
    "statusCode": 200,
    "headers": {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
    },
    "body": {
        "message": "Successfully created lunch for rusi"
    }
}

# or
npm run invoke:local -- createRustat --path sample.rustat.payload.json
```

where `sample.rustat.payload.json` contains:
```js
{
  "body": "{ \"key\": \"lunch\", \"message\": \"BURGER\", \"username\": \"rusi\" }"
}
```

### DynamoDB data model

#### `installations`

Slack workspace installations

| Entity         | Hash                           | Range           |
|----------------|--------------------------------|-----------------|
| `installation` | `PK#<enterprise_id>#<team_id>` | `#SK#<user_id>` |

#### `rustats`

| Entity                    | Hash                  | Range                   | Other attributes |
|---------------------------|-----------------------|-------------------------|------------------|
| `rustat`                  | `rustat#<username>`   | `#key#<username>#<key>` | `key`, `message` |
| Active, expiring `rustat` | `expiring#<username>` | `expires#<timestamp>`   |                  |

Ref: https://aws.amazon.com/getting-started/projects/design-a-database-for-a-mobile-app-with-dynamodb/4/
