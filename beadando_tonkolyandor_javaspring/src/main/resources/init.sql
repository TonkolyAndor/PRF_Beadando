DROP TABLE IF EXISTS todos;
CREATE TABLE todos(id serial PRIMARY KEY, name VARCHAR(255), description VARCHAR(255), priority INTEGER);
DROP SEQUENCE IF EXISTS hibernate_sequence;
CREATE SEQUENCE hibernate_sequence START 1;