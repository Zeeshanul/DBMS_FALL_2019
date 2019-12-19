const express = require("express");
const url = require("url");
oracledb = require("oracledb");
const bodyParser = require('body-parser');
const db_connect = require("./db_connect");

var urlencodedParser = bodyParser.urlencoded({ extended: false });

oracledb.autoCommit = true;

var app = express();
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.render('home');
});

/* ****************************************INSTRUCTOR VIEW******************************/
app.get('/update_clos_Plos', function (req, res) {
    query = `select * from (select clo.REG_NO,plo.PLO_ID, plo.CLO_ID, clo.status, plo.weight,
         ((clo.status*plo.weight)/100) AS total
        from CLO_TRANSCRIPT clo 
        INNER JOIN CLO_PLO_MAPPING plo
        on clo.CLOS_ID = plo.CLO_ID) `;

    db_connect.dbconnetion(res, query, function (result) {

        console.log('Rows updated', result)

        for (i = 0; i < result.length; i++) {
            for (j = 0; j < result[i][0]; j++) {

            }
        }
        res.send('Upadate Sussfully');
        // res.render('instructor_courses_assesment', { result: result });
    })

})
/* *****Instructor course assessent */
app.get('/instructor_courses_assesment.ejs', function (req, res) {
    console.log('Req for ', req.url, ' received')
    query = `select * from courseAssessent`;
    db_connect.dbconnetion(res, query, function (result) {

        console.log('Rows updated', result)
        res.render('instructor_courses_assesment', { result: result });
    })
});

app.get('/course-assesment-edit/:id', function (req, res) {
    console.log('Req for ', req.url, ' received')
    var id = req.params.id;
    console.log(id);
    query = `select * from COURSE_ASSESSMENT where reg_no = ${id} `;

    db_connect.dbconnetion(res, query, function (result) {
        console.log('Rows', result[0][0])
        res.render('course-assesment-edit', { result: result });

    });

})

app.get('/course-assesment-delete/:id', function (req, res) {
    console.log('Req for ', req.url, ' received')
    var id = req.params.id;
    console.log(id);
    query = `select * from COURSE_ASSESSMENT where reg_no = ${id} `;

    db_connect.dbconnetion(res, query, function (result) {
        console.log('Rows', result[0][0])
        res.render('course-assesment-delete', { result: result });

    });

})

app.post('/edit/:id', function (req, res) {
    console.log("requested parameter", req.body);
    reg = req.body.id[0];
    cid = req.body.id[1];
    quiz = req.body.id[2];
    assign = req.body.id[3];
    mid = req.body.id[4];
    proj = req.body.id[5];
    final = req.body.id[6];
    id = req.params.id;
    console.log('MY ID IS: ', id)
    query = `UPDATE COURSE_ASSESSMENT SET REG_NO='${reg}',COURSE_ID='${cid}',
    QUIZ=${quiz},ASSIGNENT=${assign},MID_TERM=${mid},PROJECT=${proj},FINAL=${final}
    where reg_no = '${id}'`;
    console.log(query);

    db_connect.dbconnetion(res, query, function (result) {

        query = `Select * from CLOCOURSEMAPPING m
        INNER JOIN COURSE_ASSESSMENT a
        ON m.COURSE_ID = a.COURSE_ID`;

        db_connect.dbconnetion(res, query, function (result) {
            console.log("Result from Join");
            console.log(result);
            console.log('One item', result[0][0]);
            console.log("One row")
            for (let i = 0; i < result[0].length; i++) {
                console.log(typeof (result[1][i]))
            }

            var array = [0, 0];
            var reg = [];
            var cloid = [];
            var cid = [];
            var d = [];
            for (i = 0; i < result.length; i++) {
                for (j = 0; j < 6; j++) {
                    console.log(result[i][i + 2], result[i][i + 9])
                    array[i] = array[i] + ((result[i][i + 2]) * (result[i][i + 9])) / 100;
                    console.log("Result after correction ", array[i])
                    reg[i] = result[i][7];
                    console.log(reg[i]);
                    cloid[i] = result[i][0];
                    console.log(cloid[i])
                    cid[i] = result[i][1];
                    console.log(cid[i])
                }
            }


            console.log("Length of array: ", array.length)
            for (k = 0; k < array.length; k++) {
                console.log("um of all values ", array[k])
                if (array[k] > 60) {
                    status = 100;
                }
                else {
                    status = 0;
                }
                console.log('My Reg Number is ', reg[k]);

                console.log('My Status value is:  ', status)
                console.log('Updating Transcript');
                query = `update CLO_TRANSCRIPT set STATUS = ${status}
                    where REG_NO = ${reg[k]} and COURSE_ID = '${cid[k]}' and CLOS_ID = '${cloid[k]}'`
                console.log('\n my query is :::: ', query);
                db_connect.dbconnetion(res, query, function (result) {
                    console.log('Transcrpt Updated Successfully')

                });
            }

        })
        console.log("Now redirecting")
        res.redirect('/instructor_courses_assesment.ejs');

    });
    return;

})

app.post('/delete/:id', function (req, res) {
    console.log("requested parameter", req.body);
    id = req.params.id;
    console.log('MY ID IS: ', id)
    query = `delete from COURSE_ASSESSMENT Where reg_no = '${id}'`;
    console.log(query);

    db_connect.dbconnetion(res, query, function (result) {
        console.log("Now redirecting")
        res.redirect('/instructor_courses_assesment.ejs');

    });
    return;

})

app.post('/add-course-assesment', function (req, res) {
    console.log("requested parameter", req.body);
    reg = req.body.course_name;
    cid = req.body.course_id;
    quiz = req.body.number;
    assign = req.body.Assignment;
    mid = req.body.Mids;
    proj = req.body.project;
    final = req.body.Final;
    id = req.params.id;
    id = req.params.id;
    console.log('MY ID IS: ', id)
    query = `insert into COURSE_ASSESSMENT values('${reg}','${cid}',${quiz},${assign},${mid},${proj},${final})`;
    console.log(query);

    db_connect.dbconnetion(res, query, function (result) {
        console.log("Now redirecting")
        res.redirect('/instructor_courses_assesment.ejs');

    });


})


/* *****Instructor Clo Management */
app.get('/instructor_clo_management.ejs', function (req, res) {
    res.render('instructor_clo_management')
})


app.post('/course-clo', function (req, res) {
    console.log(req.body);
    cid = req.body.course_id;
    cname = req.body.course_name;
    query = `select * from CLOCOURSEMAPPING where COURSE_ID='${cid}'`;
    console.log(query);
    console.log('Here was I')
    db_connect.dbconnetion(res, query, function (result) {
        if (result.length === 0) {
            res.send("No data ");
            return;
        }
        console.log(result)
        res.render('clo-course-data.ejs', { result: result });

    });
})

app.get('/course-clo/:id', function (req, res) {
    console.log(req.body);
    cid = req.body.course_id;
    cname = req.body.course_name;
    id = req.params.id;
    console.log(id)

    query = `select * from CLOCOURSEMAPPING where COURSE_ID='${id}'`;
    console.log(query);
    console.log('Here was I')
    db_connect.dbconnetion(res, query, function (result) {
        if (result.length === 0) {
            res.send("No data ");
            return;
        }
        console.log(result)
        res.render('clo-course-data.ejs', { result: result });

    });
})



app.get('/clo-edit/:id', function (req, res) {
    console.log('Req for ', req.url, ' received')
    var id = req.params.id;
    console.log(id);
    query = `select * from CLOCOURSEMAPPING where CLOS_ID = '${id}' `;

    db_connect.dbconnetion(res, query, function (result) {
        console.log('Rows', result)
        res.render('clo-assesent-edit', { result: result });

    });

})

app.get('/clo-delete/:id', function (req, res) {
    console.log('Req for ', req.url, ' received')
    var id = req.params.id;
    console.log(id);
    query = `select * from CLOCOURSEMAPPING where CLOS_ID = '${id}' `;
    console.log(query);

    db_connect.dbconnetion(res, query, function (result) {
        console.log('Rows', result[0][0])
        res.render('clo_assesment_delete', { result: result });

    });

})

app.post('/clo-delete/:id', function (req, res) {
    console.log("requested parameter", req.body);
    courseid = req.body[1];
    console.log('Course is is: ', courseid)
    id = req.params.id;
    console.log('MY ID IS: ', id)
    query = `delete from CLOCOURSEMAPPING Where CLOS_ID = '${id}'`;
    console.log("Quere")
    console.log(query);

    db_connect.dbconnetion(res, query, function (result) {
        if (!result) {
            res.send('Deleted Successfully');
            return;
        }

        res.send(result);

    });
    return;

})

app.post('/clo-edit/:id', function (req, res) {
    console.log("requested parameter", req.body);
    cloname = req.body.id[0];
    courseid = req.body.id[1];
    quiz = req.body.id[2];
    Assignment = req.body.id[3];
    Mids = req.body.id[4];
    Project = req.body.id[5];
    Final = req.body.id[6];

    id = req.params.id;
    console.log('MY ID IS: ', id)
    query = `UPDATE CLOCOURSEMAPPING 
    SET CLOS_ID='${cloname}',COURSE_ID='${courseid}',
    quiz=${quiz},ASSIGNMENT=${Assignment},Mid=${Mids},project=${Project},final=${Final}
    where CLOS_ID='${cloname}' and COURSE_ID='${courseid}' `;
    console.log(query);

    db_connect.dbconnetion(res, query, function (result) {

        if (!result) {
            res.send('Updated Successfully');
            return;
        }

        res.send(result);

    });
    return;

})

app.post('/clo-add', function (req, res) {
    console.log("Now I am here")
    console.log(req.body);
    query = `INSERT INTO CLOCOURSEMAPPING values('${req.body.cloid}',
    '${req.body.cid}',${req.body.quiz},${req.body.Assignment},${req.body.Mid},
    ${req.body.Project},${req.body.Final})`
    console.log(query);
    db_connect.dbconnetion(res, query, function (result) {
        if (!result) {
            res.send('Added Sussfully');
            return;
        }

        res.send(result);
    });
    return;
})


/*******************LOGINS ******************/
app.get('/dean_login.ejs', function (req, res) {
    console.log(req.url);
    res.render('dean_login', { data: "Welcome to Dean View" });
});

app.get('/instruct_login.ejs', function (req, res) {
    res.render('instruct_login', { data: "Welcome to Instructor View" });
});

app.get('/controller_login.ejs', function (req, res) {
    res.render('controller_login', { data: "Welcome to Instructor View" });
});


/* *************************Dean View******************************************** */

app.get('/course_management/:id', function (req, res) {
    dean = req.params.id;
    query = `SELECT * FROM courses where OFFERED_BY = '${dean}'`;
    db_connect.dbconnetion(res, query, function (result) {
        console.log(result)
        res.render('Dept/course_management', { result: result });

    });
})

app.get('/course-edit/:id1/:id2', function (req, res) {
    id1 = req.params.id1;
    id2 = req.params.id2;
    console.log('IDS', id1, id2);
    query = `select * from COURSES where C_ID = '${id1}'`
    db_connect.dbconnetion(res, query, function (result) {
        console.log(result)
        res.render('Dept/course-edit', { result: result });

    });

})

app.post('/course-edit/:id1', function (req, res) {
    console.log("POST REQUEST")
    id1 = req.params.id1;
    console.log(req.body)
    console.log('IDS', id1);
    query = `Update COURSES set C_ID = '${req.body.id[0]}',
    C_NAME = '${req.body.id[1]}',CRD_HRS=${req.body.id[2]}, PRE_REQ='${req.body.id[3]}',
    CO_REQ='${req.body.id[4]}',OFFERED_BY='${req.body.id[5]}'
    where C_ID = '${id1}'`

    console.log(query);
    db_connect.dbconnetion(res, query, function (result) {
        console.log(result)
        res.send('Values updated');

    });

})

app.get('/course-delete/:id1/:id2', function (req, res) {
    id1 = req.params.id1;
    id2 = req.params.id2;
    console.log('IDS', id1, id2);
    query = `select * from COURSES where C_ID = '${id1}'`
    db_connect.dbconnetion(res, query, function (result) {
        console.log(result)
        res.render('Dept/course-delete', { result: result });

    });

})

app.post('/course-delete/:id1', function (req, res) {
    console.log("POST REQUEST")
    id1 = req.params.id1;
    console.log(req.body)
    console.log('IDS', id1);
    query = `Delete from COURSES 
    where C_ID = '${id1}'`

    console.log(query);
    db_connect.dbconnetion(res, query, function (result) {
        console.log(result)
        res.send('Values updated');

    });

})



app.post('/dean_add_course', function (req, res) {
    console.log(req.body)
    cname = req.body.cname;
    code = req.body.cid;
    crdhrs = req.body.crdhrs;
    pre = req.body.Pre_req;
    co = req.body.coreq;
    offered = req.body.Offered;
    query = `insert into COURSES values('${code}','${cname}',${crdhrs},'${pre}','${co}','${offered}')`;
    console.log(query);

    db_connect.dbconnetion(res, query, function (result) {
        console.log("Now redirecting")
        res.redirect('course_management/FCSE');

    });

})

/******** Dean Set Degree Plan *****/
app.get('/degree_plan/:id', function (req, res) {
    console.log('Here is the id ', req.params.id);
    query = `select * from PROGRAM where DEPT_ID = '${req.params.id}'`;

    db_connect.dbconnetion(res, query, function (result) {
        if (result.length == 0) {
            res.send('No Data Available for', req.params.id)
            return;
        }
        res.render('Dept/degreeplan', { result: result });

    });
})

app.get('/degree/:id', function (req, res) {
    console.log("Request Received I am")
    query = `SELECT * from DEGREE_PLAN where PROG_ID = '${req.params.id}'`
    db_connect.dbconnetion(res, query, function (result) {
        console.log(result);
        res.render('Dept/degree_form', { result: result })
    })
});


app.post('/degree/:id', function (req, res) {
    console.log(req.params.id)
    console.log(req.body)
    query = `insert into DEGREE_PLAN values('${req.body.progid}',
    ${req.body.Year},'${req.body.cid}',
    '${req.body.type}','${req.body.Offered}',
    ${req.body.semnum},'${req.body.semtype}')`;
    db_connect.dbconnetion(res, query, function (result) {
        //res.redirect('')
        res.send('Course Added Successfully . Go baack to to add more courses');

    });
})

app.get('/degree/view_degree_paln/:id', function (req, res) {

    console.log('Request for degree paln view')
    query = `select * from DEGREE_PLAN where PROG_ID = '${req.params.id}'`

    db_connect.dbconnetion(res, query, function (result) {
        res.render('Dept/view_degree_paln', { result: result, id: req.params.id });

    });
})

app.get('/degree-edit/:id1/:id2/:id3', function (req, res) {
    console.log('ID RECEIVED', req.params.id1);
    console.log('ID RECEIVED', req.params.id2);

    query = `Select * from DEGREE_PLAN where PROG_ID = '${req.params.id1}'
     and YEAR= ${ req.params.id2} and COURSE_ID= '${req.params.id3}'`
    db_connect.dbconnetion(res, query, function (result) {
        console.log(result);
        res.render('Dept/degree-edit', { result: result })

    });
})

app.post('/degree-edit/:id1/:id2/:id3', function (req, res) {
    console.log(req.body)
    console.log(req.params.id1, req.params.id2, req.params.id2)
    query = `Update DEGREE_PLAN set PROG_ID = '${req.body.id[0]}',
    YEAR = ${req.body.id[1]}, COURSE_ID = '${req.body.id[2]}',
    COURSE_TYPE='${req.body.id[3]}',OFFERED_BY='${req.body.id[4]}',
    SEMESTER#=${req.body.id[5]}, SEMESTER_TYPE='${req.body.id[6]}'
    where PROG_ID = '${req.params.id1}' and YEAR = ${req.params.id2}
    and COURSE_ID = '${req.params.id3}'`;
    console.log(query)
    console.log("Check")

    db_connect.dbconnetion(res, query, function (result) {
        console.log(result);
        res.send('Table updated Successfully');
        //res.redirect(`http://localhost:8000/degree/view_degree_paln/${req.body.id[0]}`)

    });
})
app.get('/degree-delete/:id1/:id2/:id3', function (req, res) {
    console.log('ID RECEIVED', req.params.id1);
    console.log('ID RECEIVED', req.params.id2);

    query = `Select * from DEGREE_PLAN where PROG_ID = '${req.params.id1}'
     and YEAR= ${ req.params.id2} and COURSE_ID= '${req.params.id3}'`
    db_connect.dbconnetion(res, query, function (result) {
        console.log(result);
        res.render('Dept/degree-delete', { result: result })

    });
})
app.post('/degree-delete/:id1/:id2/:id3', function (req, res) {
    console.log('equested data', req.body)
    query = `Delete from DEGREE_PLAN 
    where PROG_ID = '${req.body.id[0]}' and YEAR = ${req.body.id[1]}
    and COURSE_ID = '${req.body.id[2]}'`;
    console.log(query)
    console.log("Check")

    db_connect.dbconnetion(res, query, function (result) {
        console.log(result);
        if (!result) {
            res.send('Delte perfrom successfully');
            return;
        }
        res.send(result);

        //res.redirect(`http://localhost:8000/degree/view_degree_paln/${req.body.id[0]}`)

    });
})




/************Dean Plos Management */

app.get('/plo_management/:id', function (req, res) {
    id = req.params.id;
    console.log(id)
    query = `Select * from CLO_PLO_MAPPING where DEPARTEMENT = '${id}' `
    console.log(query);
    db_connect.dbconnetion(res, query, function (result) {
        console.log(result);
        res.render('Dept/plo-management', { result: result });
    });


})


app.post('/plo-add', function (req, res) {
    id = req.params.id;
    console.log(req.body);
    query = `Insert into CLO_PLO_MAPPING values ('${req.body.cname}','${req.body.cid}',
    ${req.body.crdhrs},'${req.body.dept}') `
    console.log(query);
    db_connect.dbconnetion(res, query, function (result) {
        console.log(result);
        if (!result) {
            res.send("Added Successfully")
            return;
        }
        res.send(result)
    });
})

app.get('/plo-edit/:id1/:id2/:id3', function (req, res) {
    console.log('ID RECEIVED', req.params.id1);
    console.log('ID RECEIVED', req.params.id2);

    query = `Select * from CLO_PLO_MAPPING where PLO_ID = '${req.params.id1}'
     and CLO_ID= '${ req.params.id2}' and DEPARTEMENT= '${req.params.id3}'`
    console.log(query);
    db_connect.dbconnetion(res, query, function (result) {
        console.log(result);
        res.render('Dept/plo-edit', { result: result })

    });
})



app.post('/plo-edit/:id1/:id2/:id3', function (req, res) {
    console.log(req.body)
    query = `Update CLO_PLO_MAPPING  set PLO_ID = '${req.body.id[0]}',
    CLO_ID = '${req.body.id[1]}', WEIGHT = ${req.body.id[2]},
    DEPARTEMENT='${req.body.id[3]}'
    where PLO_ID = '${req.params.id1}' and CLO_ID = '${req.params.id2}'
    and DEPARTEMENT = '${req.params.id3}'`;
    console.log(query)
    console.log("Check")

    db_connect.dbconnetion(res, query, function (result) {
        console.log(result);
        res.send('Table updated Successfully');
        //res.redirect(`http://localhost:8000/degree/view_degree_paln/${req.body.id[0]}`)

    });
})
app.get('/plo-delete/:id1/:id2/:id3', function (req, res) {
    console.log('ID RECEIVED', req.params.id1);
    console.log('ID RECEIVED', req.params.id2);

    query = `Select * from CLO_PLO_MAPPING where PLO_ID = '${req.params.id1}'
     and CLO_ID= '${ req.params.id2}' and DEPARTEMENT= '${req.params.id3}'`
    db_connect.dbconnetion(res, query, function (result) {
        console.log(result);
        res.render('Dept/plo-delete', { result: result })

    });
})
app.post('/plo-delete/:id1/:id2/:id3', function (req, res) {
    console.log('equested data', req.body)
    query = `Delete from CLO_PLO_MAPPING 
    where PLO_ID = '${req.params.id1}' and CLO_ID = '${req.params.id2}'
    and DEPARTEMENT = '${req.params.id3}'`;
    console.log(query)
    console.log("Check")

    db_connect.dbconnetion(res, query, function (result) {
        if (!result) {
            res.send('Delte perfrom successfully');
            return;
        }

        res.send(result);
    });
})






app.get('/dean-data-edit/:id', function (req, res) {
    console.log('Req for ', req.url, ' received')
    var id = req.params.id;
    console.log(id);
    query = `select * from COURSES where C_ID = ${id} `;

    db_connect.dbconnetion(res, query, function (result) {
        console.log('Rows', result[0][0])
        res.render('Dept/dean-data-edit', { result: result });

    });

})



app.get('/dean-data-delete/:id', function (req, res) {
    console.log('Req for ', req.url, ' received')
    var id = req.params.id;
    console.log(id);
    query = `select * from COURSES where C_ID = ${id} `;

    db_connect.dbconnetion(res, query, function (result) {
        console.log('Rows', result[0][0])
        res.render('Dept/dean-data-edit', { result: result });

    });

})

/***************************************** CONTROLLER VIEW ****************************/
app.get('/manage_offered_semester', function (req, res) {

    query = `select * from OFFERED_SEMESTER`;

    db_connect.dbconnetion(res, query, function (result) {
        console.log('Rows', result[0][0])
        res.render('Controller/manage_offered_semester', { result: result });

    });

    console.log('Req Received');

})

app.get('/offered_semester_edit/:id1/:id2', function (req, res) {
    query = `select * from OFFERED_SEMESTER where SEM_TYPE = '${req.params.id1}' and YEAR = ${req.params.id2}`
    db_connect.dbconnetion(res, query, function (result) {
        console.log('Rows', result[0][0])
        res.render('Controller/offered_semester_edit', { result: result });

    });
})

app.post('/offered_semester_edit/:id1/:id2', function (req, res) {
    query = `Update OFFERED_SEMESTER  set 
    SEM_TYPE = '${req.body.id[0]}', YEAR = ${req.body.id[1]}
    where SEM_TYPE = '${req.params.id1}' and YEAR = ${req.params.id2}`
    db_connect.dbconnetion(res, query, function (result) {
        if (!result) {
            res.send('Updated Successfully');
            return
        }
        res.send(result)


    });
})

app.get('/offered_semester_delete/:id1/:id2', function (req, res) {
    query = `select * from OFFERED_SEMESTER where SEM_TYPE = '${req.params.id1}' and YEAR = ${req.params.id2}`
    db_connect.dbconnetion(res, query, function (result) {
        console.log('Rows', result[0][0])
        res.render('Controller/offered_semester_delete', { result: result });

    });
})

app.post('/offered_semester_delete/:id1/:id2', function (req, res) {
    query = `Delete from OFFERED_SEMESTER where SEM_TYPE = '${req.params.id1}' and YEAR = ${req.params.id2}`
    db_connect.dbconnetion(res, query, function (result) {
        if (!result) {
            res.send('Deleted Successfully');
            return
        }
        res.send(result)


    });
})

app.post('/offer_seester', function (req, res) {
    console.log(req.body)
    query = `Insert into OFFERED_SEMESTER values('${req.body.type}',${req.body.year})`

    db_connect.dbconnetion(res, query, function (result) {
        if (!result) {
            res.send('Data Inserted Successfully');
            return
        }
        res.send(result)


    });

})


/****Controller Course Offering *****/
app.get('/course_offer', function (req, res) {
    query = `SELECT * from OFFERED_COURSES `;
    db_connect.dbconnetion(res, query, function (result) {
        if (result.length === 0) {
            res.send('No Data Available');
        }
        console.log("Here I am")
        console.log(result)
        res.render('Controller/course_offer', { result: result });
    });
})

app.post('/course_offer', function (req, res) {
    query = `Insert into OFFERED_COURSES values('${req.body.cid}','${req.body.type}'
    '${req.body.pid}',${req.body.year})`

    db_connect.dbconnetion(res, query, function (result) {
        if (!result) {
            res.send('Data Inserted Successfully');
            return
        }
        res.send(result)


    });

})


app.get('/orourse_offer_edit/:id1/:id2/:id3/:id4', function (req, res) {
    query = `select * from OFFERED_COURSES where COURSE_ID='${req.params.id1}' and
     SEM_TYPE = '${req.params.id2}' and PROGRAM_ID ='${req.params.id3}'and YEAR = ${req.params.id4}`
    db_connect.dbconnetion(res, query, function (result) {
        console.log('Rows', result[0][0])
        res.render('Controller/course_offer_edit', { result: result });

    });
})

app.post('/course_offer_edit/:id1/:id2/:id3/:id4', function (req, res) {
    query = `Update OFFERED_COURSES  set 
    SEM_TYPE = '${req.body.id[0]}', YEAR = ${req.body.id[1]}
    where SEM_TYPE = '${req.params.id1}' and YEAR = ${req.params.id2}`
    db_connect.dbconnetion(res, query, function (result) {
        if (!result) {
            res.send('Updated Successfully');
            return
        }
        res.send(result)


    });
})

app.get('/course_offer_delete/:id1/:id2/:id3/:id4', function (req, res) {
    query = `select * from OFFERED_COURSES where SEM_TYPE = '${req.params.id1}' and YEAR = ${req.params.id2}`
    db_connect.dbconnetion(res, query, function (result) {
        console.log('Rows', result[0][0])
        res.render('Controller/course_offer_delete', { result: result });

    });
})

app.post('/course_offer_delete/:id1/:id2/:id3/:id4', function (req, res) {
    query = `Delete from OFFERED_COURSES where SEM_TYPE = '${req.params.id1}' and YEAR = ${req.params.id2}`
    db_connect.dbconnetion(res, query, function (result) {
        if (!result) {
            res.send('Deleted Successfully');
            return
        }
        res.send(result)


    });
})

/****** DEAN PLO Transcript */
app.get('/plo_transcript', function (req, res) {
    query = `SELECT * from PLO_TRANSCRIPT `;

    db_connect.dbconnetion(res, query, function (result) {
        if (result.length === 0) {
            res.send('No Data Availabe');
            return
        }
        res.render('Controller/plo_transcript', { result: result });


    });

    app.post('/plo_search', function (req, res) {
        console.log(req.body)

        query = `select s.REG_NO, s.FNAME, s.LNAME, s.PROGRAM, x.PLO_ID,x.status from students s
        INNER JOIN (SELECT * from PLO_TRANSCRIPT where REG_NO = '${req.body.reg}') x
        ON s.REG_NO = x.REG_NO`;
        console.log(query);
        db_connect.dbconnetion(res, query, function (result) {
            if (result.length === 0) {
                res.send('No Data Availabe');
                return
            }
            console.log(result)
            res.render('Controller/plo_transcript_student', { result: result });


        });

    })



})

/*************************************************LOGINS **********************************/
app.post('/login', urlencodedParser, function (req, res) {
    console.log(req.body);
    data = req.body;

    query = "SELECT * FROM users";
    query2 = "SELECT * FROM courses";
    db_connect.dbconnetion(res, query, function (result) {

        console.log("My Data is ", result)
        console.log('\n');

        if (result.length === 0) {
            console.log("No data Available");
            res.render('dbmsEmpty');
            return
        }
        for (var j = 0; j < result.length; j++) {

            for (var i = 0; i < result[j].length; i++) {
                if (result[j][0] == data.login && result[j][1] == data.password) {
                    console.log(result[j][2], 'of ', result[j][3])
                    x = result[j][2]
                    y = result[j][3]
                    if (result[j][2] == 'Dean') {
                        console.log(result[j][2], 'of ', result[j][3])
                        res.render('Dept/dean_view', { result: result[j][3] })
                        return;
                    }

                    else if (result[j][2] == 'Controller') {

                        res.render('Controller/controller_view');

                        return;
                    }

                    else if (result[j][2] == 'Instructor') {

                        res.render('Instructor_view', { result: result });
                        return;
                    }

                    else {
                        console.log("No Mach");
                        return;
                    }

                }

            }



        }

        res.render('dean_login', { mess: "Invalid Password" });

    });

});

//dbconnetion()
app.listen(8000, function () {
    console.log("Server has started and Runnig on Port 8000");
});
