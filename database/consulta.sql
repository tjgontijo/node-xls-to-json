SELECT DISTINCT PLANS.STATE
FROM PUBLIC.ITEMS
LEFT JOIN ACTIONS ON ACTIONS."actionId" = ITEMS."actionId"
LEFT JOIN SPECIFIC_GOALS ON SPECIFIC_GOALS."goalId" = ACTIONS."goalId"
LEFT JOIN PLANS ON SPECIFIC_GOALS."planId" = PLANS."planId"
WHERE ITEMS."plannedValue" > 0

SELECT PLANS."state" as UF,
	PLANS."thematicArea" as "Área Temática",
	SPECIFIC_GOALS."shortName" as "nº Meta",
	actions."actionName" as "Ação",
	COUNT(DISTINCT actions."actionNum") AS Quantidade
FROM actions
LEFT JOIN SPECIFIC_GOALS ON SPECIFIC_GOALS."goalId" = ACTIONS."goalId"
LEFT JOIN PLANS ON SPECIFIC_GOALS."planId" = PLANS."planId"
GROUP BY PLANS."state",
	PLANS."thematicArea",
	SPECIFIC_GOALS."shortName",
	actions."actionName"
HAVING COUNT(DISTINCT actions."actionNum") > 1
ORDER BY PLANS."state",
	PLANS."thematicArea";	
	
WITH FIRSTACTIONNUMS AS
	(SELECT "actionName",
			MIN("actionNum") AS "firstActionNum"
		FROM actions
		GROUP BY "actionName"
		HAVING COUNT(DISTINCT "actionNum") > 1)
UPDATE actions AS A
SET "actionNum" = F."firstActionNum"
FROM FIRSTACTIONNUMS AS F
WHERE A."actionName" = F."actionName"
	AND A."actionNum" <> F."firstActionNum";