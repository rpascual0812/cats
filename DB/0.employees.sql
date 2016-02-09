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
	department int[] not null,
	archived boolean default false,
	date_created timestamptz default now()
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

create table employees_titles
(
	employees_pk int references employees(pk),
	title_pk int references titles(pk),
	created_by int references employees(pk),
	date_created timestamptz default now()
);
alter table employees_titles owner to chrs;

create table time_log
(
	employees_pk int references employees(pk),
	type text not null default 'In',
	date_created timestamptz default now()
);
alter table time_log owner to chrs;

insert into employees 
(
	employee_id,
	first_name,
	middle_name,
	last_name,
	email_address
)
values
(
	'070001',
	'Wayne',
	'',
	'Lipardo',
	'rwayne.lipardo@chrsglobal.com'
);

insert into employees 
(
	employee_id,
	first_name,
	middle_name,
	last_name,
	email_address
)
values
(
	'160002',
	'Rafael',
	'Aurelio',
	'Pascual',
	'rafael.pascual@chrsglobal.com'
);

insert into employees 
(
	employee_id,
	first_name,
	middle_name,
	last_name,
	email_address
)
values
(
	'160001',
	'Eliza',
	'',
	'Mandique',
	'eliza.mandique@chrsglobal.com'
);

insert into accounts
(
	employee_id,
	password
)
values
(
	'070001',
	md5('user123456')
);

insert into accounts
(
	employee_id,
	password
)
values
(
	'160002',
	md5('iloveyou')
);

insert into accounts
(
	employee_id,
	password
)
values
(
	'160001',
	md5('user123456')
);

create index first_name_idx on employees(first_name);
create index middle_name_idx on employees(middle_name);
create index last_name_idx on employees(last_name);
create index employee_id_idx on employees(employee_id);








