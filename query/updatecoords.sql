
UPDATE players
SET (aircraft, latitude, longitude, altitude, heading, tilt, roll, lastUpdate) =
    ($1, $2::double precision, $3::double precision, $4::double precision,
     $5::double precision, $6::double precision, $7::double precision, $8::bigint)
WHERE accountID = $9::int