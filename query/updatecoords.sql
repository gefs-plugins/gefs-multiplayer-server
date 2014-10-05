UPDATE players
SET (latitude, longitude, altitude, heading, tilt, roll, lastUpdate) =
    ($1::double precision, $2::double precision, $3::double precision, $4::double precision, $5::double precision, $6::double precision, $7::bigint)
WHERE accountID = $8::int
