--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: chrs; Tablespace: 
--

CREATE TABLE employees (
    pk integer NOT NULL,
    employee_id text NOT NULL,
    first_name text NOT NULL,
    middle_name text NOT NULL,
    last_name text NOT NULL,
    email_address text NOT NULL,
    archived boolean DEFAULT false,
    date_created timestamp with time zone DEFAULT now(),
    business_email_address text,
    "position" text,
    level text,
    department integer[]
);


ALTER TABLE public.employees OWNER TO chrs;

--
-- Name: employees_pk_seq; Type: SEQUENCE; Schema: public; Owner: chrs
--

CREATE SEQUENCE employees_pk_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.employees_pk_seq OWNER TO chrs;

--
-- Name: employees_pk_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: chrs
--

ALTER SEQUENCE employees_pk_seq OWNED BY employees.pk;


--
-- Name: groupings; Type: TABLE; Schema: public; Owner: chrs; Tablespace: 
--

CREATE TABLE groupings (
    employees_pk integer,
    supervisor_pk integer
);


ALTER TABLE public.groupings OWNER TO chrs;

--
-- Name: pk; Type: DEFAULT; Schema: public; Owner: chrs
--

ALTER TABLE ONLY employees ALTER COLUMN pk SET DEFAULT nextval('employees_pk_seq'::regclass);


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: chrs
--

COPY employees (pk, employee_id, first_name, middle_name, last_name, email_address, archived, date_created, business_email_address, "position", level, department) FROM stdin;
20	201400089	Ma. Fe	Pariscal	Bolinas	mfbolinas.chrs@gmail.com	f	2016-02-14 23:42:40.014678+08	mafe.bolinas@gmail.com	Business Development Associate	Associate	\N
24	201400102	John Erasmus Mari	Regado	Fernandez	N/A	f	2016-02-14 23:42:40.014678+08	johnerasmusmarif@gmail.com	HR Associate	Associate	\N
10	201000001	Rheyan	Feliciano	Lipardo	waynelipardo.chrs@gmail.com	f	2016-02-14 23:42:40.014678+08	wayne.lipardo@gmail.com 	Owner & Managing Director	C-Level	{20}
26	201400103	Gerlie	Pagaduan	Andres	gerlie.andres@chrsglobal.com	f	2016-02-14 23:42:40.014678+08	gerlieandres0201@gmail.com	HR Associate	Intern	{24}
18	201400059	Marilyn May	Villano	Bolocon	mbolocon.chrs@gmail.com	f	2016-02-14 23:42:40.014678+08	bolocon.marilynmay@yahoo.com	Talent Acquisition Associate	Associate	{21}
17	201400088	Arjev	Price	De Los Reyes	adlreyes.chrs@gmail.com	f	2016-02-14 23:42:40.014678+08	arjevdelosreyes@gmail.com	Asst HR Manager	Asst Manager	{24}
13	201400078	Lita	Llanera	Elejido	lelejido.chrs@gmail.com	f	2016-02-14 23:42:40.014678+08	lhitaelejido@gmail.com	Talent Acquisition Associate	Associate	{28}
23	201400100	Rolando	Carillo	Fabi	rolly.fabi@chrsglobal.com	f	2016-02-14 23:42:40.014678+08	rollyfabi_23@yahoo.com	Accounting Supervisor	Supervisor	{23}
16	201400084	Michelle	Balasta	Gongura	mgongura.chrs@gmail.com	f	2016-02-14 23:42:40.014678+08	N/A	HR Associate	Intern	{21}
19	201300004	Mary Grace	Soriano 	Lacerna	gracesoriano.chrs@gmail.com	f	2016-02-14 23:42:40.014678+08	N/A	Client & Recruitment Supervisor	Supervisor	{22,29}
25	201400058	Rodette Joyce	Magaway	Laurio	jlaurio.chrs@gmail.com	f	2016-02-14 23:42:40.014678+08	N/A	HR Associate	Associate	{28}
22	201400098	Rolando	Garfin	Lipardo	N/A	f	2016-02-14 23:42:40.014678+08	N/A	Liason Associate	Associate	{23}
15	201400087	Faya Lou	Mahinay	Parenas	fparenas.chrs@gmail.com	f	2016-02-14 23:42:40.014678+08	N/A	Asst Recruitment & Client Specialist	Specialist	{27}
14	201400081	Vincent	Yturralde	Ramil	vramil.chrs@gmail.com	f	2016-02-14 23:42:40.014678+08	N/A	Asst Client & Recruitment Supervisor	Supervisor	{21}
11	201400066	Judy Ann	Lantican	Reginaldo	jreginaldo.chrs@gmail.com	f	2016-02-14 23:42:40.014678+08	N/A	Asst Client and Recruitment Manager	Manager	{28}
21	201400097	Ariel	Dela Cruz	Solis	N/A	f	2016-02-14 23:42:40.014678+08	acsolis10@yahoo.com 	Accounting Consultant	Associate	{23}
12	201400072	Ken	Villanueva	Tapdasan	ktapdasan.chrs@gmail.com	f	2016-02-14 23:42:40.014678+08	bluraven20@gmail.com	HR and Admin Associate	Associate	{27}
28	201400105	Rafael	Aurelio	Pascual	rpascual.chrs@gmail.com	f	2016-02-14 23:42:40.014678+08	rpascual0812@gmail.com	Project IT Manager	Manager	{26}
27	201400104	Eliza	Alcaraz	Mandique	emandique.chrs@gmail.com	f	2016-02-14 23:42:40.014678+08	eliza.mandique@yahoo.com	Corporate Quality Supervisor	Supervisor	{25}
32	201400109	Angelica	Barredo	Abaleta	aabelata.chrs@gmail.com	f	2016-02-14 23:42:40.014678+08	a.abaleta@yahoo.com	HR Associate Intern	Associate	\N
36	201400113	Aprilil Mae	Denalo	Nefulda	Aprilil.nefulda@chrsglobal.com	f	2016-02-14 23:42:40.014678+08	Aprililmaenefulda@ymail.com	HR Associate Intern	Associate	\N
29	201400106	Eralyn May	Bayot	Adino	emadino.chrs@gmail.com	f	2016-02-14 23:42:40.014678+08	jinra25@gmail.com	HR Associate Intern	Associate	{27}
31	201400108	Irone John	Mendoza	Amor	ijamor.chrs@gmail.com	f	2016-02-14 23:42:40.014678+08	ironejohn@gmail.com	HR Associate Intern	Associate	{27}
38	201400115	Jennifer	Araneta	Balucay	jbalucay.chrs@gmail.com	f	2016-02-14 23:42:40.014678+08	jennbalucay93@gmail.com	Cashier/Skin Care Advisor	Associate	{29}
34	201400111	Angelyn	Daguro	Cuevas	acuevas.chrs@gmail.com	f	2016-02-14 23:42:40.014678+08	angelyn.cuevas1017@gmail.com	HR Associate Intern	Associate	{21}
37	201400114	Karen	Medo	Esmeralda	kesmeraldo@gmail.com	f	2016-02-14 23:42:40.014678+08	kesmeraldo.chrs@gmail.com	Cashier/Skin Care Advisor	Associate	{29}
30	201400107	Ana Margarita	Hernandez	Galero	amgalero.chrs@gmail.com	f	2016-02-14 23:42:40.014678+08	anamgalero@gmail.com	HR Associate Intern	Associate	{27}
35	201400112	Alween Orange	Ceredon	Gemao	aogemao.chrs@gmail.com	f	2016-02-14 23:42:40.014678+08	orangegemao@yahoo.com	HR Associate Intern	Associate	{21}
40	201400118	Cristina	Tulayan	Ibanez	cibanez.chrs@gmail.com	f	2016-02-14 23:42:40.014678+08	tina_041481@yahoo.com	HR Associate Intern	Associate	{22,29}
42	201400120	Aimee	Gaborni	Legaspi	alegaspi.chrs@gmail.com	f	2016-02-14 23:42:40.014678+08	aimeelgsp@icloud.com	HR Associate Intern	Associate	{22,29}
33	201400110	Shena Mae	Jardinel	Nava	shena.nava@chrsglobal.com	f	2016-02-14 23:42:40.014678+08	shenamaenavacalma@yahoo.com	HR Associate Intern	Associate	{21}
39	201400117	Arlene	Diama	Obasa	aobasa.chrs@gmail.com	f	2016-02-14 23:42:40.014678+08	obasa_arlene@yahoo.com	Cashier/Skin Care Advisor	Associate	{29}
43	201400121	Kathleen Kay	Macalino	Ongcal	kkongcal.chrs@gmail.com	f	2016-02-14 23:42:40.014678+08	kathleen.ongcal@chrsglobal.com	Clinic Consultant	Associate	{29}
41	201400119	Alyssa	Iligan	Panaguiton	apanaguiton.chrs@gmail.com	f	2016-02-14 23:42:40.014678+08	panaguitonalyssaend121@gmail.com	HR Associate Intern	Associate	{24}
44	201400122	Marry Jeane	Genteroy	Sadsad	mjsadsad.chrs@gmail.com	f	2016-02-14 23:42:40.014678+08	marry.sadsad@chrsglobal.com	Clinic Consultant	Associate	{29}
45	201400126	Michelle	Tan	De Guzman	mdeguzman.chrs@gmail.com	f	2016-03-04 16:14:08.15679+08	michelle.deguzman@chrsglobal.com 	Assistant Client and Recruitment Manager	Manager	{27}
47	201400128	Aleine Leilanie	Braza	Oro	aloro.chrs@gmail.com	f	2016-03-07 12:16:40.262446+08	aleine.oro@chrsglobal.com	Business Development Officer	Officer	{30}
48	201400132	Maria Eliza	Querido	De Mesa	medemesa.chrs@gmail.com	f	2016-03-07 16:21:37.202235+08	maria.demesa@chrsglobal.com	Talent Acquisition Associate	Associate	{22}
49	201400124	Renz	Santiago	Feliciano	rfeliciano.chrs@gmail.com	f	2016-03-08 09:05:10.063741+08	renz.feliciano@chrsglobal.com	HR Associate	Associate	{22}
\.


--
-- Name: employees_pk_seq; Type: SEQUENCE SET; Schema: public; Owner: chrs
--

SELECT pg_catalog.setval('employees_pk_seq', 49, true);


--
-- Data for Name: groupings; Type: TABLE DATA; Schema: public; Owner: chrs
--

COPY groupings (employees_pk, supervisor_pk) FROM stdin;
32	11
29	45
31	45
26	17
20	10
18	14
34	14
45	11
17	10
48	19
13	11
23	10
49	19
24	19
30	45
35	14
16	14
40	19
19	10
25	11
42	19
22	10
27	10
33	14
36	11
47	10
41	17
15	10
28	10
14	45
11	10
21	10
12	28
\.


--
-- Name: employees_pkey; Type: CONSTRAINT; Schema: public; Owner: chrs; Tablespace: 
--

ALTER TABLE ONLY employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (pk);


--
-- Name: employee_id_idx; Type: INDEX; Schema: public; Owner: chrs; Tablespace: 
--

CREATE INDEX employee_id_idx ON employees USING btree (employee_id);


--
-- Name: employee_id_unique_idx; Type: INDEX; Schema: public; Owner: chrs; Tablespace: 
--

CREATE UNIQUE INDEX employee_id_unique_idx ON employees USING btree (employee_id);


--
-- Name: first_name_idx; Type: INDEX; Schema: public; Owner: chrs; Tablespace: 
--

CREATE INDEX first_name_idx ON employees USING btree (first_name);


--
-- Name: groupings_unique_idx; Type: INDEX; Schema: public; Owner: chrs; Tablespace: 
--

CREATE UNIQUE INDEX groupings_unique_idx ON groupings USING btree (employees_pk, supervisor_pk);


--
-- Name: last_name_idx; Type: INDEX; Schema: public; Owner: chrs; Tablespace: 
--

CREATE INDEX last_name_idx ON employees USING btree (last_name);


--
-- Name: middle_name_idx; Type: INDEX; Schema: public; Owner: chrs; Tablespace: 
--

CREATE INDEX middle_name_idx ON employees USING btree (middle_name);


--
-- Name: groupings_employees_pk_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chrs
--

ALTER TABLE ONLY groupings
    ADD CONSTRAINT groupings_employees_pk_fkey FOREIGN KEY (employees_pk) REFERENCES employees(pk);


--
-- Name: groupings_supervisor_pk_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chrs
--

ALTER TABLE ONLY groupings
    ADD CONSTRAINT groupings_supervisor_pk_fkey FOREIGN KEY (supervisor_pk) REFERENCES employees(pk);


--
-- PostgreSQL database dump complete
--

