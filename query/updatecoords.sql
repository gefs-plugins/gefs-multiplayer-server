UPDATE players
SET (latitude, longitude, altitude, heading, tilt, roll, lastUpdate) =
    ($1::real, $2::real, $3::real, $4::real, $5::real, $6::real, extract(epoch FROM now())::int)
WHERE accountID = $7::int
