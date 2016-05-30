create database chrs_employees;
create user chrs password 'chrs';
\c chrs_employees;

create table employees
(
	pk serial primary key,
	employee_id text not null,
	first_name text not null,
	middle_name text not null,
	last_name text not null,
	email_address text not null,
	business_email_address text not null,
	position int not null,
	level text not null,
	department int[] not null,
	date_created timestamptz default now(),
	archived boolean default false	
);
alter table employees owner to chrs;
create unique index employee_id_unique_idx on employees (employee_id);

create table employees_logs
(
	employees_pk int references employees(pk),
	log text not null,
	created_by int references employees(pk),
	date_created timestamptz default now()
);
alter table employees_logs owner to chrs;

create table accounts
(
	employees_id text references employees(employee_id),
	password text default md5('chrs123456')
);
alter table accounts owner to chrs;

create table titles
(
	pk serial primary key,
	title text not null,
	created_by int references employees(pk),
	date_created timestamptz default now()
);
alter table titles owner to chrs;

-- create table employees_titles
-- (
-- 	employees_pk int references employees(pk),
-- 	titles_pk int references titles(pk),
-- 	created_by int references employees(pk),
-- 	date_created timestamptz default now()
-- );
-- alter table employees_titles owner to chrs;

create table time_log
(
	employees_pk int references employees(pk),
	type text not null default 'In',
	time_log timestamptz default now(),
	date_created timestamptz default now()
);
alter table time_log owner to chrs;

create table departments
(
	pk serial primary key,
	department text not null,
	code text not null,
	archived boolean default false
);
alter table departments owner to chrs;
create unique index code_unique_idx on departments (code);
create unique index department_unique_idx on departments (department);

create table groupings
(
	employees_pk int references employees(pk),
	supervisor_pk int references employees(pk)
);
alter table groupings owner to chrs;
create unique index groupings_unique_idx on groupings (employees_pk, supervisor_pk);

create table feedbacks
(
	pk serial primary key,
	feedback text not null,
	tool text not null,
	date_created timestamptz default now()
);
alter table feedbacks owner to chrs;
-- insert into accounts
-- (
-- 	employee_id,
-- 	password
-- )
-- values
-- (
-- 	'070001',
-- 	md5('user123456')
-- );

-- insert into accounts
-- (
-- 	employee_id,
-- 	password
-- )
-- values
-- (
-- 	'160002',
-- 	md5('iloveyou')
-- );

-- insert into accounts
-- (
-- 	employee_id,
-- 	password
-- )
-- values
-- (
-- 	'160001',
-- 	md5('user123456')
-- );

create index first_name_idx on employees(first_name);
create index middle_name_idx on employees(middle_name);
create index last_name_idx on employees(last_name);
create index employee_id_idx on employees(employee_id);








