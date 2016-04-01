create table roles
(
	pk serial primary key not null,
	role text not null,
	r_order int not null,
	archived boolean default false
);
alter table roles owner to cats;
create unique index role_idx on roles (role);

insert into roles
(
	role,
	r_order
)
values
(
	'Administrator',
	1
),
(
	'Director',
	2
),
(
	'Manager',
	3
),
(
	'Team Leader',
	4
),
(
	'Talent Acquisition',
	5
),
(
	'Sourcer',
	6
);

create table employees_permission
(
	employees_pk int not null,
	employee_id text not null,
	employee text not null,
	title text not null,
	department text[] not null,
	supervisor int not null,
	roles_pk int references roles(pk),
	permission json not null
);
alter table employees_permission owner to cats;
create unique index employees_pk_idx on employees_permission (employees_pk);
create unique index employees_id_idx on employees_permission (employee_id);
COMMENT ON COLUMN employees_permission.roles_pk is 'ROLE';

create table employees_permission_logs
(
	employees_pk int references employees_permission(employees_pk),
	type text not null,
	details text not null,
	created_by int not null,
	date_created timestamptz default now()
);
alter table employees_permission_logs owner to cats;

create table talent_acquisition_group
(
	employees_pk int not null,
	supervisor_pk int not null
);
alter table talent_acquisition_group owner to cats;
create unique index employees_idx on talent_acquisition_group (employees_pk, supervisor_pk);

create table job_positions
(
	pk serial primary key,
	position text not null,
	archived boolean default false
);
alter table job_positions owner to cats;
create unique index position_idx on job_positions (position);
COMMENT ON COLUMN job_positions.position is 'PROFILE';
COMMENT ON COLUMN job_positions.archived is 'STATUS';

create table statuses
(
	pk serial primary key,
	status text not null,
	archived boolean default false
);
alter table statuses owner to cats;
create unique index status_idx on statuses (status);

create table clients
(
	pk serial primary key,
	code text not null,
	client text not null,
	archived boolean default false
);
alter table clients owner to cats;
create unique index client_idx on clients (code,client);
COMMENT ON COLUMN clients.code is 'CODE';
COMMENT ON COLUMN clients.client is 'CLIENT';
COMMENT ON COLUMN clients.archived is 'STATUS';

create table sources
(
	pk serial primary key,
	source text not null,
	archived boolean default false
);
alter table sources owner to cats;
create unique index source_idx on sources (source);
COMMENT ON COLUMN sources.source is 'SOURCE';

create table requisitions
(
	pk serial primary key,
	requisition_id text not null,
	alternate_title text,
	job_positions_pk int not null references job_positions(pk),
	total int not null,
	end_date timestamptz,
	created_by int references employees_permission(employees_pk),
	date_created timestamptz default now(),
	archived boolean default false
);
alter table requisitions owner to cats;
create unique index requisitions_unique_idx on requisitions (requisition_id);
COMMENT ON COLUMN requisitions.job_positions_pk is 'Job Position';
COMMENT ON COLUMN requisitions.total is 'TOTAL';
COMMENT ON COLUMN requisitions.end_date is 'END DATE';
COMMENT ON COLUMN requisitions.archived is 'STATUS';

create table requisitions_logs
(
	requisitions_pk int references requisitions(pk),
	type text not null,
	details text not null,
	created_by int not null,
	date_created timestamptz default now()
);
alter table requisitions_logs owner to cats;

create table applicants
(
	pk serial primary key,
	applicant_id text not null,
	requisitions_pk int not null references requisitions(pk),
	sources_pk int not null references sources(pk),
	created_by int not null,
	date_created timestamptz default now(),
	date_received timestamptz not null,
	date_interaction timestamptz,
	time_completed timestamptz,
	-- over_due boolean default false,
	first_name text not null,
	last_name text not null,
	middle_name text,
	birthdate timestamptz,
	job_positions_pk int references job_positions(pk),
	contact_number text not null,
	email_address text not null,
	endorcer text,
	endorcement_date timestamptz,
	clients_pk int references clients(pk),
	cv text not null,
	appointment_date timestamptz,
	statuses_pk int references statuses(pk)
);
alter table applicants owner to cats;
create unique index applicant_id_idx on applicants (applicant_id);

COMMENT ON COLUMN applicants.requisitions_pk is 'REQUISITION';
COMMENT ON COLUMN applicants.sources_pk is 'SOURCE';
COMMENT ON COLUMN applicants.date_received is 'DATE RECEIVED';
-- COMMENT ON COLUMN applicants.talent_acquisition is 'TALENT ACQUISITION';
-- COMMENT ON COLUMN applicants.date_interaction is 'DATE INTERACTION';
-- COMMENT ON COLUMN applicants.time_completed is 'TIME COMPLETED';
-- COMMENT ON COLUMN applicants.over_due is 'OVERDUE';
COMMENT ON COLUMN applicants.first_name is 'FIRST NAME';
COMMENT ON COLUMN applicants.last_name is 'LAST NAME';
COMMENT ON COLUMN applicants.middle_name is 'MIDDLE NAME';
COMMENT ON COLUMN applicants.birthdate is 'BIRTHDATE';
COMMENT ON COLUMN applicants.job_positions_pk is 'PROFILED FOR';
COMMENT ON COLUMN applicants.contact_number is 'CONTACT NUMBER';
COMMENT ON COLUMN applicants.email_address is 'EMAIL ADDRESS';
-- COMMENT ON COLUMN applicants.endorcer is 'ENDORCER';
-- COMMENT ON COLUMN applicants.endorcement_date is 'ENDORCEMENT DATE';
COMMENT ON COLUMN applicants.clients_pk is 'CLIENT';
COMMENT ON COLUMN applicants.cv is 'CV';
-- COMMENT ON COLUMN applicants.appointmed_by is 'APPOINTED By';
-- COMMENT ON COLUMN applicants.appointment_date is 'APPOINTMENT DATE';
COMMENT ON COLUMN applicants.statuses_pk is 'STATUS';

create table applicants_talent_acquisition
(
	applicants_pk int references applicants(pk),
	employees_pk int references employees_permission(employees_pk),
	date_created timestamptz default now()
);
alter table applicants_talent_acquisition owner to cats;

create table applicants_endorser
(
	applicants_pk int references applicants(pk),
	endorsement timestamptz,
	employees_pk int references employees_permission(employees_pk),
	date_created timestamptz default now()
);
alter table applicants_endorser owner to cats;

create table applicants_appointer
(
	applicants_pk int references applicants(pk),
	appointment timestamptz,
	employees_pk int references employees_permission(employees_pk),
	date_created timestamptz default now()
);
alter table applicants_appointer owner to cats;

create table applicants_tags
(
	applicants_pk int references applicants(pk),
	tags text[] not null
);
alter table applicants_tags owner to cats;
create unique index applicants_pk_idx on applicants_tags (applicants_pk);
COMMENT ON COLUMN applicants_tags.tags is 'TAGS';

create table applicants_logs
(
	applicants_pk int references applicants(pk),
	type text not null,
	details text not null,
	created_by int not null,
	date_created timestamptz default now()
);
alter table applicants_logs owner to cats;

create table notifications
(
	pk serial primary key,
	employees_pk int not null,
	notification text not null,
	type text not null,
	table_pk int not null,
	date_created timestamptz default now(),
	read boolean default false
);
alter table notifications owner to cats;

-- create table permissions
-- (
-- 	pk serial primary key not null,
-- 	role text not null,
-- 	parent text not null,
-- 	item text not null,
-- 	archived boolean default false
-- );
-- alter table permissions owner to cats;

create table job_positions_logs
(
	position_pk int references job_positions(pk),
	type text not null,
	details text not null,
	created_by int not null,
	date_created timestamptz default now()
);
alter table job_positions_logs owner to cats;

create table clients_logs
(
	client_pk int references clients(pk),
	type text not null,
	details text not null,
	created_by int not null,
	date_created timestamptz default now()
);
alter table clients_logs owner to cats;

create table sources_logs
(
	source_pk int references sources(pk),
	type text not null,
	details text not null,
	created_by int not null,
	date_created timestamptz default now()
);
alter table sources_logs owner to cats;



create trigger insertlogs before update on applicants for each row execute procedure insertlogs();
create trigger insertlogs before update on applicants_tags for each row execute procedure insertlogs();

create trigger insertlogs before update on job_positions for each row execute procedure insertlogs();
create trigger insertlogs before update on clients for each row execute procedure insertlogs();
create trigger insertlogs before update on sources for each row execute procedure insertlogs();