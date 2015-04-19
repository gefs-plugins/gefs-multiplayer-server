INSERT INTO players (aircraft, latitude, longitude, altitude, heading, tilt, roll, lastUpdate) SELECT
    ($1, $2::double precision, $3::double precision, $4::double precision,
     $5::double precision, $6::double precision, $7::double precision, $8::bigint)
      WHERE NOT EXISTS (SELECT 1 FROM players WHERE accountID = $9::int)