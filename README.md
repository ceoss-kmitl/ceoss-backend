# CEOSS Backend

## Stack used
```
# Node.js
# Typescript
# Express.js
# Typeorm
# PostgreSQL
```

## Development setup first time
1. Install extension `ESLint`, `Prettier` 
2. Edit own `.env` file
3. Set up PostgreSQL using psql cli
4. Run command `yarn`
5. Run command `yarn model:up` (update local database to match migration)
6. Run command `yarn dev`

### Example `.env` file
```
NODE_ENV = 'development'
PORT = 5050

POSTGRES_DB_NAME = 'ceoss'
POSTGRES_HOST = 'localhost'
POSTGRES_USER = 'postgres'
POSTGRES_PASSWORD = ''
POSTGRES_PORT = 5432
```

### PostgreSQL cli common command
```bash
# Open PosgreSQL cli as user "USER"
# (After open cli you can write raw SQL)
psql -U USER

# Command after open cli
\l            # see all database
\c DB_NAME    # connect to database "DB_NAME"
\c USER       # get out of current database
\dt           # see all table in current database
```

### Creating new API
1. Create new controller in `controllers/`
2. *(optional)* Create type in `controllers/types/`
3. Implement logic

### Updating table
1. Edit file in `models/`
2. When finish. Run command `yarn model:gen "SomeMessage"`
3. Run command `yarn model:up`