-- get other players <125km from current player using haversine formula

SELECT * FROM players
WHERE lastUpdate > extract(epoch FROM now())::int - 15
AND accountID != $1::int
AND 6371.0087714 * 2 * asin(
  sqrt(
    pow(sin(radians(latitude - $2::real) / 2), 2) +
    cos(radians($3::real)) * cos(radians(latitude)) * pow(sin(radians(longitude - $3::real) / 2), 2)
  )
) < 125
