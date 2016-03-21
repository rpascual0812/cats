-- sudo apt-get install postgresql-contrib-9.4 postgresql-plpython-9.4

CREATE or REPLACE FUNCTION insertlogs()
    RETURNS trigger
AS $insertlogs$

def generatecomment(colname, colordinal):
    comment = None
    exceptlist = ['pk','date_created','created_by','applicant_id','requisition_id']
    coldesc = plpy.execute("select col_description("+ repr(TD['relid']) +", "+ repr(colordinal) +")")

    if colname not in exceptlist:
        ##ANONYMOUS COLUMN -- APPLIES TO ALL TABLES
        if colname == 'archived':
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
        ##APPLICANTS TABLE
        elif TD['table_name'] == "applicants":
            if colname == 'job_positions_pk':
                if TD['old']['job_positions_pk'] <> TD['new']['job_positions_pk']:
                    oldval=""
                    oldvalq = plpy.execute("SELECT position from job_positions where pk = "+ str(TD['old']['job_positions_pk']))
                    for i in oldvalq:
                        oldval = i['position']

                    newval=""
                    newvalq = plpy.execute("SELECT position from job_positions where pk = "+ str(TD['new']['job_positions_pk']))
                    for i in newvalq:
                        newval = i['position']

                    comment = str(coldesc[0].get('col_description')) + ' was changed from ' + str(oldval) + ' to ' + str(newval)
                else:
                    pass

        
            elif colname == 'statuses_pk':
                if TD['old']['statuses_pk'] <> TD['new']['statuses_pk']:
                    oldval=""
                    oldvalq = plpy.execute("SELECT status from statuses where pk = "+ str(TD['old']['statuses_pk']))
                    for i in oldvalq:
                        oldval = i['status']

                    newval=""
                    newvalq = plpy.execute("SELECT status from statuses where pk = "+ str(TD['new']['statuses_pk']))
                    for i in newvalq:
                        newval = i['status']

                    comment = str(coldesc[0].get('col_description')) + ' was changed from ' + str(oldval) + ' to ' + str(newval)
                else:
                    pass

            elif colname == 'sources_pk':
                if TD['old']['sources_pk'] <> TD['new']['sources_pk']:
                    oldval=""
                    oldvalq = plpy.execute("SELECT source from sources where pk = "+ str(TD['old']['sources_pk']))
                    for i in oldvalq:
                        oldval = i['source']

                    newval=""
                    newvalq = plpy.execute("SELECT source from sources where pk = "+ str(TD['new']['sources_pk']))
                    for i in newvalq:
                        newval = i['source']

                    comment = str(coldesc[0].get('col_description')) + ' was changed from ' + str(oldval) + ' to ' + str(newval)
                else:
                    pass

            elif colname == 'clients_pk':
                if TD['old']['clients_pk'] <> TD['new']['clients_pk']:
                    oldval=""
                    oldvalq = plpy.execute("SELECT client from clients where pk = "+ str(TD['old']['clients_pk']))
                    for i in oldvalq:
                        oldval = i['client']

                    newval=""
                    newvalq = plpy.execute("SELECT client from clients where pk = "+ str(TD['new']['clients_pk']))
                    for i in newvalq:
                        newval = i['client']

                    comment = str(coldesc[0].get('col_description')) + ' was changed from ' + str(oldval) + ' to ' + str(newval)
                else:
                    pass

            elif colname == 'requisitions_pk':
                if TD['old']['requisitions_pk'] <> TD['new']['requisitions_pk']:
                    oldval=""
                    oldvalq = plpy.execute("SELECT client from clients where pk = "+ str(TD['old']['requisitions_pk']))
                    for i in oldvalq:
                        oldval = i['client']

                    newval=""
                    newvalq = plpy.execute("SELECT client from clients where pk = "+ str(TD['new']['requisitions_pk']))
                    for i in newvalq:
                        newval = i['client']

                    comment = str(coldesc[0].get('col_description')) + ' was changed from ' + str(oldval) + ' to ' + str(newval)
                else:
                    pass

            elif colname == 'cv':
                if TD['old']['cv'] <> TD['new']['cv']:
                    #a = strip_tags('<a ng-click="download_cv("'+ str(TD['old']['cv']) +'")" >Old</a>')
                    #b = strip_tags('<a ng-click="download_cv("'+ str(TD['new']['cv']) +'")" >New</a>')
                    a = '"' + str(TD["old"]["cv"]) + '"'
                    b = '"' + str(TD["new"]["cv"]) + '"'
                    c = "<a ng-click='download_cv("+ a +")'>Old</a>"
                    d = "<a ng-click='download_cv("+ b +")'>New</a>"
                    comment = str(coldesc[0].get('col_description')) + ' was changed from '+ c +' to '+ d
                else:
                    pass
            
        ##END APPLICANTS TABLE
        elif TD['table_name'] == "clients":
        ##CLIENTS TABLE
            if colname == 'code':
                if TD['old']['code'] <> TD['new']['code']:
                    comment = str(coldesc[0].get('col_description')) + ' was changed from ' + str(TD['old']['code']) + ' to ' + str(TD['new']['code'])
                else:
                    pass

            elif colname == 'client':
                if TD['old']['client'] <> TD['new']['client']:
                    comment = str(coldesc[0].get('col_description')) + ' was changed from ' + str(TD['old']['client']) + ' to ' + str(TD['new']['client'])
                else:
                    pass

        ##END OF CLIENTS TABLE

        elif TD['table_name'] == "sources":
        ##SOURCES TABLE
            if colname == 'source':
                if TD['old']['source'] <> TD['new']['source']:
                    comment = str(coldesc[0].get('col_description')) + ' was changed from ' + str(TD['old']['source']) + ' to ' + str(TD['new']['source'])
                else:
                    pass
        ##END OF SOURCES TABLE

        

            
        ##END OF ANONYMOUS COLUMN -- APPLIES TO ALL

            return comment
    else:
        pass

#def strip_tags(html):

    #SELECT regexp_replace(regexp_replace($1, E'(?x)<[^>]*?(\s alt \s* = \s* ([\'"]) ([^>]*?) \2) [^>]*? >', E'\3'), E'(?x)(< [^>]*? >)', '', 'g')
    #return plpy.execute("SELECT regexp_replace(regexp_replace("+html+", E'(?x)<[^>]*?(\s alt \s* = \s* ([\'\"]) ([^>]*?) \2) [^>]*? >', E'\3'), E'(?x)(< [^>]*? >)', '', 'g')")

tablename = TD['table_name']
tablecols = plpy.execute("SELECT attname, attnum from pg_attribute where attrelid = (select distinct(tableoid) from "+ tablename +") and attnum > 0 and attisdropped = 'f'")
systemcomment = []

for i in tablecols:
    data = generatecomment(i['attname'], i['attnum'])
    if data:
       	systemcomment.append(data)

if systemcomment:
    systemcomment = '\n'.join(systemcomment)

    if tablename in ['applicants','applicants_tags']:
        plpy.execute("insert into applicants_logs(applicants_pk,type,details,created_by) values ("+ str(TD['old']['pk']) +", $$Logs$$, $$"+ str(systemcomment) + "$$, $$0$$);")
    elif tablename in ['job_positions']:
        plpy.execute("insert into job_positions_logs(position_pk,type,details,created_by) values ("+ str(TD['old']['pk']) +", $$Logs$$, $$"+ str(systemcomment) + "$$, $$0$$);")
    elif tablename in ['clients']:
        plpy.execute("insert into clients_logs(client_pk,type,details,created_by) values ("+ str(TD['old']['pk']) +", $$Logs$$, $$"+ str(systemcomment) + "$$, $$0$$);")
    elif tablename in ['sources']:
        plpy.execute("insert into sources_logs(source_pk,type,details,created_by) values ("+ str(TD['old']['pk']) +", $$Logs$$, $$"+ str(systemcomment) + "$$, $$0$$);")                

$insertlogs$ LANGUAGE plpythonu;