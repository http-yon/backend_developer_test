# Node.js backend developer starter code

## Requirements

- Node.js 18
- Express.js

## Instructions

This repository contains a simple Node app to simulate a database server. The app loads and writes data from JSON files to simulate reading and writing to a database.

In order to query the database, it's important to understand the data model:

### User

They represent app users. A user has the following attributes:

- name (String): It's the user's name.
- phone (String).
- email (String).
- accounts (Object): The accounts the user is linked to. The keys for this object are account IDs and the values are objects with the following structure:
    - name (String): Account name.
    - role (String): Role for this user in this account.

### Account

They represent a storage space where all the data from a customer is stored. It's not an independent database.

A single customer can have multiple accounts, with different users for each one. Also, different accounts from the same customer, can have different configurations and crops.

- name (String): The account name.
- roles (Object): Object linking the account with its forms. It also defines what permissions have users belonging to this role on each form.
    - name (String): Role name.
    - permissions (Object): Object whose keys are form IDs and its values are objects describing CRUD permissions:
        - create (Boolean)
        - read (Boolean)
        - update (Boolean)
        - delete (Boolean)

### Form

They describe the structure for a database table or a document from a collection. They can be linked to one or many accounts.

- name (String): Form name. It's supposed to be shown to the users on the frontend and error messages.
- fields (Array): Array of objects. Each item has the following properties:
    - field (String): This is the field ID. It's the equivalent of the column name for a database table.
    - label (String): Friendly name to show to users.
    - type (String): Describes the variable type for this field.

When making a request to the database server, the path should always include the resource name accoding to the data model. The available operations are simple CRUD operations. There are two paths for the GET method, one to retrieve all the documents in a collection, and the other one to get a single record.

The database server runs on port 20000 and expects JSON payloads.

## Query examples

```sh
curl http://localhost:20000/users

curl -X POST http://localhost:20000/accounts \
   -H "Content-Type: application/json" \
   -d '{"Name": "Test Account"}'
```