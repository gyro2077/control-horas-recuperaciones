-- Los adjuntos pequeños del MVP se conservan en PostgreSQL para no depender
-- del filesystem efímero de las instancias web de Clever Cloud.
ALTER TABLE "Permission"
ADD COLUMN "attachmentData" BYTEA;
