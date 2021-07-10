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
4. Run `yarn model:up`

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

## API structure

```
Router -> Services -> Model
```

### Coding
1. Create router in `api/routes/`
2. Create service in `api/services/`
3. *(optional)* Create interface in `api/interfaces/`
3. Implement logic
5. When finish. Apply router in `middlewares/api.ts`

### Updating table
1. Edit file in `models/`
2. When finish. Run command `yarn model:gen "SomeMessage"`
3. Run command `yarn model:up`