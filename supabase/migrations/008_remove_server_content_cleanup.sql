-- Remove server-side cleanup infrastructure because BLINK content is browser-local.
drop schema if exists blink_private cascade;
