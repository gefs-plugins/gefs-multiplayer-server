SELECT count(*) AS numOfPlayers FROM players
WHERE lastUpdate > $1::bigint