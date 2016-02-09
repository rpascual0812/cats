CREATE or REPLACE FUNCTION insertlogs()
    RETURNS trigger
AS $insertlogs$

def generatecomment(colname, colordinal):
    comment = None
    exceptlist = ['pk','date_created','created_by','applicant_id']
    coldesc = plpy.execute("select col_description("+ repr(TD['relid']) +", "+ repr(colordinal) +")")

    if colname not in exceptlist:
    ##APPLICANTS TABLE
        if colname == 'profiled_for':
            if TD['old']['profiled_for'] <> TD['new']['profiled_for']:
                oldval=""
                oldvalq = plpy.execute("SELECT position from job_positions where pk = "+ str(TD['old']['profiled_for']))
                for i in oldvalq:
                    oldval = i['position']

                newval=""
                newvalq = plpy.execute("SELECT position from job_positions where pk = "+ str(TD['new']['profiled_for']))
                for i in newvalq:
                    newval = i['position']

                comment = str(coldesc[0].get('col_description')) + ' was changed from ' + str(oldval) + ' to ' + str(newval)
            else:
                pass

        elif colname == 'client':
            if TD['old']['client'] <> TD['new']['client']:
                oldval=""
                oldvalq = plpy.execute("SELECT client from clients where pk = "+ str(TD['old']['client']))
                for i in oldvalq:
                    oldval = i['client']

                newval=""
                newvalq = plpy.execute("SELECT client from clients where pk = "+ str(TD['new']['client']))
                for i in newvalq:
                    newval = i['client']

                comment = str(coldesc[0].get('col_description')) + ' was changed from ' + str(oldval) + ' to ' + str(newval)
            else:
                pass

        elif colname == 'status':
            if TD['old']['status'] <> TD['new']['status']:
                oldval=""
                oldvalq = plpy.execute("SELECT status from statuses where pk = "+ str(TD['old']['status']))
                for i in oldvalq:
                    oldval = i['status']

                newval=""
                newvalq = plpy.execute("SELECT status from statuses where pk = "+ str(TD['new']['status']))
                for i in newvalq:
                    newval = i['status']

                comment = str(coldesc[0].get('col_description')) + ' was changed from ' + str(oldval) + ' to ' + str(newval)
            else:
                pass

        elif colname == 'source':
            if TD['old']['source'] <> TD['new']['source']:
                oldval=""
                oldvalq = plpy.execute("SELECT source from sources where pk = "+ str(TD['old']['source']))
                for i in oldvalq:
                    oldval = i['source']

                newval=""
                newvalq = plpy.execute("SELECT source from sources where pk = "+ str(TD['new']['source']))
                for i in newvalq:
                    newval = i['source']

                comment = str(coldesc[0].get('col_description')) + ' was changed from ' + str(oldval) + ' to ' + str(newval)
            else:
                pass
        
    ##END APPLICANTS TABLE

    ##ANONYMOUS COLUMN -- APPLIES TO ALL TABLES
        elif colname == 'archived':
            if TD['old']['archived'] <> TD['new']['archived']:
                oldval=""
                newval=""

                if TD['old']['archived'] == True:
                    oldval = 'Disabled'
                else:
                    oldval = 'Enabled'

                if TD['new']['archived'] == True:
                    newval = 'Disabled'
                else:
                    newval = 'Enabled'

                comment = str(coldesc[0].get('col_description')) + ' was changed from ' + str(oldval) + ' to ' + str(newval)
            else:
                pass

        elif TD['old'][colname] != TD['new'][colname]:
            if TD['old'][colname] <> TD['new'][colname]:
                comment = str(coldesc[0].get('col_description')) + ' was changed from ' + str(TD['old'][colname]) + ' to ' + str(TD['new'][colname])
            else:
                pass
    ##END OF ANONYMOUS COLUMN -- APPLIES TO ALL

        return comment
    else:
        pass

tablename = TD['table_name']
tablecols = plpy.execute("SELECT attname, attnum from pg_attribute where attrelid = (select distinct(tableoid) from "+ tablename +") and attnum > 0 and attisdropped = 'f'")
systemcomment = []

for i in tablecols:
    data = generatecomment(i['attname'], i['attnum'])
    if data:
       	systemcomment.append(data)

if systemcomment:
    systemcomment = '\n'.join(systemcomment)
    if tablename == 'applicants':
        plpy.execute("insert into applicant_logs(applicants_pk,details,created_by) values ("+ str(TD['old']['pk']) +", $$"+ str(systemcomment) + "$$, $$0$$);")

$insertlogs$ LANGUAGE plpythonu;