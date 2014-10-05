-- get other players <125km from current player using haversine formula

SELECT * FROM players
WHERE lastUpdate > ($1::double precision)
AND accountID != $1::int
AND 6371.0087714 * 2 * asin(
  sqrt(
    pow(sin(radians(latitude - $3) / 2), 2) +
    cos(radians($3)) * cos(radians(latitude)) * pow(sin(radians(longitude - $4) / 2), 2)
  )
) < 125