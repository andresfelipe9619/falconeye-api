--FIRST SQUARE
SELECT
  COUNT(*)
FROM
  falconeye.fs_maintenance
where
  CreationDate BETWEEN '2019-01-01'
  AND '2020-04-30';
SELECT
  COUNT(*)
FROM
  falconeye.fs_maintenance
where
  CreationDate BETWEEN '2020-05-01'
  AND '2020-05-30';
------------------------------------
  --SECOND SQUARE
  ------------------------------------
  --THIRD SQUARE
  ------------------------------------
  --FOURTH SQUARE
  ------------------------------------
  --FIFTH SQUARE
SELECT
  COUNT(*)
FROM
  falconeye.fs_maintenance
where
  CreationDate BETWEEN '2019-01-01'
  AND '2020-04-30'
  AND Status = 'Pendiente de Aprobación';
------------------------------------
  --SIXTH SQUARE
SELECT
  COUNT(*)
FROM
  falconeye.fs_maintenance
where
  CreationDate BETWEEN '2019-01-01'
  AND '2020-04-30'
  AND Status = 'Aprobada';
------------------------------------