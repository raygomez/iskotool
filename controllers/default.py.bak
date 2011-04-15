# -*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

#########################################################################
## This is a samples controller
## - index is the default action of any application
## - user is required for authentication and authorization
## - download is for downloading files uploaded in the db (does streaming)
## - call exposes all registered services (none by default)
#########################################################################


def index():
    """
    example action using the internationalization operator T and flash
    rendered by views/default/index.html or views/generic.html
    """
    
    courses = db(db.course.id > 0).select()
    my_course = ['Autodetect course']
    for course in courses:
        my_course.append(course.course)
    
    
    syllabi = db(db.syllabus.id > 0).select()
    my_syllabus = ['Autodetect syllabus']
    for syllabus in syllabi:
        my_syllabus.append(syllabus.year)
    
    form = SQLFORM.factory(
        Field('grades', 'text', label='Grades', requires=IS_NOT_EMPTY()),
        Field('course', 'list:string', requires=IS_IN_SET(range(len(my_course)),labels=my_course, zero=None)),
        Field('curriculum', 'list:string', requires=IS_IN_SET(range(len(my_syllabus)),labels=my_syllabus, zero=None))
    )
    
    contactme = SQLFORM(db.comments)
       
    subjects = None
    info = None
    mygrades = None
    mysubjects = None
    year = None
    pes = None
    cwts = None
    ges = None
    non_ges = None
    course = None
        
    if form.accepts(request.vars, session, formname='form_one'):
        info,mygrades = parse(form.vars.grades)
        if info != 'Error': 
            mysubjects,year,pes,cwts,ges,non_ges,course= parse_subjects(mygrades, info, form.vars.course, form.vars.curriculum)

    if contactme.accepts(request.vars, session, formname='form_two'):
        response.flash = 'Thank you for posting.'
        
    return dict(form=form, info=info, mygrades=mygrades, mysubjects=mysubjects, contactme=contactme, 
                    year=year, pes=pes, cwts=cwts, ges=ges, non_ges=non_ges,course=course)

def parse_subjects(mygrades, info, mycourse, myyear):

    courses = db(db.course.id > 0).select()
    my_course = ['Autodetect course']
    for course in courses:
        my_course.append(course.course)

    syllabi = db(db.syllabus.id > 0).select()
    my_syllabus = []
    for syllabus in syllabi:
        my_syllabus.append(syllabus.year)

    if mycourse == '0':
        course = db(db.course.course == info['course']).select().first()
        if course is None:
            if 'Master ' in info['course']:   
                return 'not BS',None,None,None,None,None,None        
            else: return 'not supported',None,None,None,None,None,None
    else: course = db(db.course.course == my_course[int(mycourse)]).select().first()  
    
    if myyear == '0':
        studno = int(info['studno'][:4])
        year = filter(lambda x: x >= studno, my_syllabus)
        if year is not None:
            syllabus = db(db.syllabus.year == year[0]).select().first()
        else: return 'too old',None,None,None,None,None,None

    else: syllabus = db(db.syllabus.year == int(my_syllabus[int(myyear)-1])).select().first()
    
    majors = db((db.subject_course.course == course.id) & (db.subject_course.year == syllabus.id))._select(db.subject_course.subject)
    
    major_subjects = db(db.subject.id.belongs(majors)).select()
    require = db(db.subject_requirements.id > 0).select()
    prereqs = db(db.prerequisites.year == syllabus.id).select()    
    coreqs = db(db.corequisites.year == syllabus.id).select()
    
    ges_domain = db(db.ge_domain.id > 0)._select(db.ge_domain.ge)
    ah = db(db.domains.domain == 'AH').select().first()
    ssp = db(db.domains.domain == 'SSP').select().first()
    mst = db(db.domains.domain == 'MST').select().first()        
    ges_ah = db(db.ge_domain.domain == ah.id).select()
    ges_ssp = db(db.ge_domain.domain == ssp.id).select()
    ges_mst = db(db.ge_domain.domain == mst.id).select()
    ges = db(db.subject.id.belongs(ges_domain)).select()    
     
    phil = db(db.phil_stud.id > 0)._select(db.phil_stud.ge)   
    ges_phil_stud = db(db.subject.id.belongs(phil)).select()

    eng = db(db.english.id > 0)._select(db.english.ge)   
    ges_english = db(db.subject.id.belongs(eng)).select()
 
    taken_majors = []
    taken_pes = []
    taken_non_majors = []
    taken_cwts = []
    taken_msts = []
    taken_ahs = []
    taken_ssps = []
    taken_phil_stud = []
    taken_english = []

    taken_mst = []
    taken_ah = []
    taken_ssp = []
    taken_phil = []
    taken_eng = []
    
    for sem in mygrades:
        semester = sem['sem'].replace('Semester', 'Sem').replace('20', '').replace('First','1st').replace('Second', '2nd')
        for subject in sem['subject']:
            subject['grade'] = subject['grade'].strip()
            if subject['subject'] == 'Bio 1': subject['subject'] = 'BIO 1'   #Fixed for Bio 1
            if subject['subject'] == 'Soc Sci I': subject['subject'] = 'Soc Sci 1'   #Fixed for Soc Sci I
            if subject['subject'] == 'Soc Sci II': subject['subject'] = 'Soc Sci 2'   #Fixed for Soc Sci II
            if subject['subject'] == 'Comm 3 Eng': subject['subject'] = 'Comm 3'   #Fixed for Comm 3

            blank = subject['grade'] == ''
            fail = '5.00' in subject['grade']
            ng = subject['grade'] == 'NG'
            inc = subject['grade'] == 'INC'
            four = subject['grade'] == '4.00'
            drp = subject['grade'] == 'DRP'
            f = 'F' in subject['grade']
            
            if not blank and not drp and not fail and not ng and not inc and not four and not f:
                if len(major_subjects.find(lambda row: row.name == subject['subject'])) != 0:
                    taken_majors.append(subject['subject'])
                elif subject['unit'].find('(') != -1:
                    if 'PE' in subject['subject']:
                        taken_pes.append({'subject':subject['subject'], 'sem':semester})
                    elif 'CWTS' in subject['subject']:
                        taken_cwts.append({'subject':subject['subject'], 'sem':semester})
                elif len(ges.find(lambda row: row.name == subject['subject'])) != 0:
                    ge = ges_ah.find(lambda row: row.ge.name == subject['subject']).first()
                    if ge is not None: 
                        taken_ahs.append({'subject':subject['subject'], 'sem':semester, 'title':ge.ge.title, 'description':ge.ge.description})
                        taken_ah.append(subject['subject'])

                    ge = ges_mst.find(lambda row: row.ge.name == subject['subject']).first()                 
                    if ge is not None: 
                        taken_msts.append({'subject':subject['subject'], 'sem':semester, 'title':ge.ge.title, 'description':ge.ge.description})                    
                        taken_mst.append(subject['subject'])

                    ge = ges_ssp.find(lambda row: row.ge.name == subject['subject']).first()                                    
                    if ge is not None: 
                        taken_ssps.append({'subject':subject['subject'], 'sem':semester, 'title':ge.ge.title, 'description':ge.ge.description})                    
                        taken_ssp.append(subject['subject'])
                        
                    if len(ges_phil_stud.find(lambda row: row.name == subject['subject'])) != 0: 
                        taken_phil_stud.append({'subject':subject['subject'], 'sem':semester})
                        taken_phil.append(subject['subject'])

                    if len(ges_english.find(lambda row: row.name == subject['subject'])) != 0: 
                        taken_english.append({'subject':subject['subject'], 'sem':semester})                        
                        taken_eng.append(subject['subject'])
                        
                else:
                    taken_non_majors.append({'subject':subject['subject'], 'sem':semester})

    if 'Math 53' in taken_majors: 
        taken_majors.append('Math 17')
        if 'Math 14' in taken_majors: taken_majors.remove('Math 14')
        if 'Math 11' in taken_majors: taken_majors.remove('Math 11')

        for subject in taken_non_majors:
            if subject['subject'] == 'Math 14': 
                taken_non_majors.remove(subject)  
                break
        for subject in taken_non_majors:
            if subject['subject'] == 'Math 11': 
                taken_non_majors.remove(subject)  
                break

    taken_ges = {'mst':taken_msts, 'ah':taken_ahs, 'ssp':taken_ssps, 'phil_stud':taken_phil_stud, 
                    'english':taken_english, 'others':taken_non_majors}

    eligible = []
    not_taken_majors = db(~db.subject.name.belongs(taken_majors) & db.subject.id.belongs(majors)).select()

    _msts = db(db.subject.name.belongs(taken_mst))._select(db.subject.id)
    not_taken_msts =  db(~db.ge_domain.ge.belongs(_msts) & (db.ge_domain.domain == mst.id)).select()
    _ssps = db(db.subject.name.belongs(taken_ssp))._select(db.subject.id)    
    not_taken_ssps =  db(~db.ge_domain.ge.belongs(_ssps) & (db.ge_domain.domain == ssp.id)).select()
    _ahs = db(db.subject.name.belongs(taken_ah))._select(db.subject.id)    
    not_taken_ahs =  db(~db.ge_domain.ge.belongs(_ahs) & (db.ge_domain.domain == ah.id)).select()
    _phil = db(db.subject.name.belongs(taken_phil))._select(db.subject.id)    
    not_taken_phils =  db(~db.phil_stud.ge.belongs(_phil)).select()
    _eng = db(db.subject.name.belongs(taken_eng))._select(db.subject.id)    
    not_taken_eng =  db(~db.english.ge.belongs(_eng)).select()
    
    not_taken_ges = {'mst':not_taken_msts, 'ssp':not_taken_ssps, 'ah':not_taken_ahs, 'phil_stud':not_taken_phils, 'english':not_taken_eng}

    mysubjects = {}
    mysubjects['elig'] = []
    mysubjects['non_elig'] = []
    mysubjects['senior'] = []
    
    for subject in not_taken_majors:
        if len(require.find(lambda row: row.subject == subject.id)) == 1:
            req = require.find(lambda row: row.subject == subject.id).first()    
            mysubjects['senior'].append({'subject':subject.name, 'requirements':req.requirements})    
        elif len(prereqs.find(lambda row: row.subject == subject.id)) == 0:
            coreq = coreqs.find(lambda row: row.subject == subject.id)
            
            if len(coreq): mysubjects['elig'].append({'subject':subject.name, 'coreq':coreq.first().coreq.name})        
            else: mysubjects['elig'].append({'subject':subject.name, 'coreq':''})        
        else:
            prereq_sub = []
            prereq = prereqs.find(lambda row: row.subject.id == subject.id)
            count = 0

            for subj in prereq:
                if subj.prereq.name not in taken_majors: prereq_sub.append(subj.prereq.name)
                else: count = count + 1
                
            if count == len(prereq):
                coreq = coreqs.find(lambda row: row.subject == subject.id)
                
                if len(coreq): mysubjects['elig'].append({'subject':subject.name, 'coreq':coreq.first().coreq.name})
                else: mysubjects['elig'].append({'subject':subject.name, 'coreq':''})
            else:
                coreq = coreqs.find(lambda row: row.subject == subject.id)
                if len(coreq): 
                    mysubjects['non_elig'].append({'subject':subject.name, 'prereq':', '.join(prereq_sub), 'coreq':coreq.first().coreq.name})        
                else: mysubjects['non_elig'].append({'subject':subject.name, 'prereq':', '.join(prereq_sub), 'coreq':''})        
                                 
    return mysubjects, syllabus.year, taken_pes, taken_cwts, taken_ges, not_taken_ges, course.course
    
def parse(grades):
    
    index = grades.find('View Grades')
    
    if index == -1: return 'Error',None
    grades = grades[index:]
    lines = grades.splitlines()

    if 'Load another student' in lines[1]: del lines[1]

    if len(lines) < 5: return 'Error',None
            
    name, studno, course = lines[1:4]
    
    info = {}
    info['name'] = name
    info['studno'] = studno
    info['course'] = course
    
    mygrades = []
    
    more_than_one = 0
    for line in lines[5:]:
        if 'Summer' in line or 'Semester' in line:
            mygrades.append({'sem':line})
            mygrades[-1]['subject'] = []
        elif more_than_one:
            l = line.split('\t')
            if len(l) == 4:
                unit, grade = l[-3], l[-2] 
                mygrades[-1]['subject'][-1]['unit'] = unit
                mygrades[-1]['subject'][-1]['grade'] = grade
                more_than_one = 0
        elif 'Class Code' in line: continue
        elif len(line) == 0: continue
        elif 'Notice' in line: break
        elif 'Unresolved INC or 4.00' in line: break
        else:
            l = line.split('\t')
            if len(l) == 3:
                subj = l[1][:l[1].rfind(' ')]
                mygrades[-1]['subject'].append({'subject':subj})
                more_than_one = 1

            elif len(l) == 6:
                subj,unit, grade = l[1][:l[1].strip().rfind(' ')],l[-3], l[-2] 
                mygrades[-1]['subject'].append({'subject':subj,'unit':unit,'grade':grade})
        
    return info, mygrades

#def user():
    """
    exposes:
    http://..../[app]/default/user/login
    http://..../[app]/default/user/logout
    http://..../[app]/default/user/register
    http://..../[app]/default/user/profile
    http://..../[app]/default/user/retrieve_password
    http://..../[app]/default/user/change_password
    use @auth.requires_login()
        @auth.requires_membership('group name')
        @auth.requires_permission('read','table name',record_id)
    to decorate functions that need access control
    """
#    return dict(form=auth())

#def download():
    """
    allows downloading of uploaded files
    http://..../[app]/default/download/[filename]
    """
#    return response.download(request,db)


#def call():
    """
    exposes services. for example:
    http://..../[app]/default/call/jsonrpc
    decorate with @services.jsonrpc the functions to expose
    supports xml, json, xmlrpc, jsonrpc, amfrpc, rss, csv
    """
#    session.forget()
#    return service()`
