UPDATE players
SET (latitude, longitude, altitude, heading, tilt, roll, lastUpdate) = ($1, $2, $3, $4, $5, $6, $7)
WHERE accountID = $8::int
