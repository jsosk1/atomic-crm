-- Real estate fields on properties: code, listing agency, listing date and
-- the date of the last status update with the owner or colleague

create or replace function "public"."generate_property_code"() returns text
    language sql volatile
    set search_path to ''
    as $$
  select string_agg(chr(65 + floor(random() * 26)::int), '')
  from generate_series(1, 6)
$$;

grant all on function public.generate_property_code() to authenticated;
grant all on function public.generate_property_code() to service_role;

-- The volatile default gives each existing row its own random code
alter table "public"."properties" add column "code" text not null default public.generate_property_code();
alter table "public"."properties" add constraint "properties_code_key" unique ("code");

alter table "public"."properties" add column "listing_agency" text;
alter table "public"."properties" add column "listed_at" date default current_date;
alter table "public"."properties" add column "status_updated_at" date default current_date;

update "public"."properties"
set "listed_at" = "created_at"::date,
    "status_updated_at" = "created_at"::date;
