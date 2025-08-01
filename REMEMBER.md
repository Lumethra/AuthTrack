# REMEMBER 

## PSQL Table Struct

```
    -- Status history (all changes in JSON array)
    CREATE TABLE user_status (
    user_id VARCHAR(12) PRIMARY KEY,
    status_history JSONB NOT NULL DEFAULT '[]'
    );

    -- Message counts (compact daily totals in JSON)
    CREATE TABLE daily_messages (
    user_id VARCHAR(12) PRIMARY KEY,
    day_counts JSONB NOT NULL DEFAULT '{}'
    );

```

## Commands for checking the table

``` 

    SELECT * FROM user_status;
    SELECT * FROM daily_messages;

```