const path = require('path');
const mongodb = require('mongodb');
const graderaideURL = 'mongodb://localhost:27017/graderaide';

// loads the frontend
exports.load_home = function(req, res) {
    console.log(path.join(__dirname, '..', '..', '/public/index.html'));
    res.sendfile(path.join(__dirname, '..', '..', '/public/index.html'));
};

// --------------REST CALLS------------------
// REST call for the login
exports.login = function(req, res) {
    const MongoClient = mongodb.MongoClient;
    const url = 'mongodb://localhost:27017/graderaide';
    MongoClient.connect(graderaideURL, function(err, client){
        if(err){
            console.log('Error: ', err);
        } else {
            const collection = client.db('graderaide').collection('users');
            collection.find({$and: [{'uvuId': {$eq: req.body.uvuId}}, {'password': {$eq: req.body.password}}]}).toArray(function(err, result){
                if(err){
                    console.log('Error: ', err);
                } else if (result.length) {
                    res.send(result);
                } else {
                    res.send('None');
                }
                
                client.close();
            });
        }
    });
};

// -------------REST calls for courses---------------
exports.getAllCourses = function (req, res) {
    const MongoClient = mongodb.MongoClient;
    const url = 'mongodb://localhost:27017/graderaide';
    MongoClient.connect(graderaideURL, function(err, client){
        if(err){
            console.log('Error: ', err);
        } else {
            const collection = client.db('graderaide').collection('courses');
            collection.find().toArray(function(err, result){
                if(err){
                    console.log('Error: ', err);
                } else if (result.length) {
                    let coursesArr = [];
                    for(let course of result){
                        let c = {
                            'name': course.name,
                            'section': course.section
                        };
                        coursesArr.push(c);
                    }
                    res.send(coursesArr);
                } else {
                    res.send('No documents found');
                }
                
                client.close();
            });
        }
    });
};

// -------------REST calls for students---------------
exports.getAllStudents = function (req, res) {
    const MongoClient = mongodb.MongoClient;
    const url = 'mongodb://localhost:27017/graderaide';
    MongoClient.connect(graderaideURL, function(err, client){
        if(err){
            console.log('Error: ', err);
        } else {
            const collection = client.db('graderaide').collection('users');
            collection.find( {$and: [{ 'isAdmin': false},{ 'courses': {$nin: [{'name': req.body.courseName, 'section': req.body.courseSection}]}}]}).toArray(function(err, result){
                if(err){
                    console.log('Error: ', err);
                } else if (result.length) {
                    let studArr = [];
                    for(let student of result){
                        let c = {
                            'fullName': student.fullName,
                            'uvuid': student.uvuId
                        };
                        studArr.push(c);
                    }
                    res.send(studArr);
                } else {
                    res.send('No documents found');
                }
                
                client.close();
            });
        }
    });
};

// -------------REST calls for students---------------
exports.addCourseToStudent = function (req, res) {
    const MongoClient = mongodb.MongoClient;
    const url = 'mongodb://localhost:27017/graderaide';
    MongoClient.connect(graderaideURL, function(err, client){
        if(err){
            console.log('Error: ', err);
        } else {
            const collection = client.db('graderaide').collection('users');
            collection.updateOne( {'uvuId': {$eq: req.body.uvuid}},
                { 
                    $push: {
                        'courses': {
                            $each: [{'name':req.body.courseName, 'section': req.body.courseSection}]
                        }
                    }
                }, function(err, result){
                if(err){
                    console.log('Error: ', err);
                } else if (result.matchedCount) {
                    res.send('Success');
                } else {
                    res.send('Niete');
                }
                
                client.close();
            });
        }
    });
};

// Rest call for get all student that belong to a course
exports.getCourseStudents = function (req, res) {
    const MongoClient = mongodb.MongoClient;
    const url = 'mongodb://localhost:27017/graderaide';
    MongoClient.connect(graderaideURL, function(err, client){
        if(err){
            console.log('Error: ', err);
        } else {

            const collection = client.db('graderaide').collection('users');
            collection.find( {
            	courses: { $all: [
            		{ "$elemMatch" : { name: req.body.courseName, section: req.body.courseSection }}
            	] }
            } ).toArray(function(err, result){
                if(err){
                    console.log('Error: ', err);
                } else if (result.length) {
                    res.send(result);
                } else {
                    res.send('No documents found');
                }
                
                client.close();
            });
        }
    });
};

// REST call for delete course
exports.dropThisClass = function (req, res) {
    const MongoClient = mongodb.MongoClient;
    const url = 'mongodb://localhost:27017/graderaide';
    MongoClient.connect(graderaideURL, function(err, client){
        if(err){
            console.log('Error: ', err);
        } else {
            const collection = client.db('graderaide').collection('courses');
            collection.deleteOne( {$and: [{ 'name': {$eq: req.body.courseId}},{ 'section': {$eq: req.body.section}}]}, function(err, result){
                if(err){
                    console.log('Error: ', err);
                } else if (result.deletedCount) {
                    res.send('Success');
                } else {
                    res.send('None');
                }
                
                client.close();
            });
        }
    });
};

// REST call for adding course
exports.addCourse = function (req, res) {
    const MongoClient = mongodb.MongoClient;
    const url = 'mongodb://localhost:27017/graderaide';
    const courseName = req.body.name;
    const courseSec = req.body.section;
    MongoClient.connect(graderaideURL, function(err, client){
        if(err){
            console.log('Error: ', err);
        } else {
            const collection = client.db('graderaide').collection('courses');
            collection.find({ 'name': courseName, 'section': courseSec}).toArray(function(err, result){
                if(err){
                    console.log('Error: ', err);
                } else if (result.length == 0) {
                    collection.insert({'name': courseName, 'section': courseSec}, function(err, result){
                        if(err){
                            console.log('Error: ', err);
                        }else{
                            res.send('Success');
                        }
                        
                        client.close();
                    });
                } else {
                    res.send('Course already exists');
                }
                
                client.close();
            });
        }
    });
};

// REST call for editing course
exports.editCourse = function(req, res){
    const MongoClient = mongodb.MongoClient;
        MongoClient.connect(graderaideURL, function(err, client){
        if(err){
            console.log('Error: ', err);
        } else {

            const collection = client.db('graderaide').collection('courses');

            collection.find({ 'name': req.body.name, 'section': req.body.section}).toArray(function(err, result){
                console.log(result.length);
                if(err){
                    console.log('Error: ', err);
                } else if (result.length === 0) {
                    collection.updateOne( {$and: [{ 'name': {$eq: req.body.oldName}},{ 'section': {$eq: req.body.oldSection}}]},
                        { $set: { 'name': req.body.name, 'section': req.body.section } }, function(err, result){
                            if(err){
                                console.log('Error: ', err);
                            }else{
                                res.send('Success');
                            }
                            client.close();
                    });
                } else {
                    res.send('Course already exists');
                }
                
                client.close();
            });
        }
    });
};


// exports.list_all = function(req, res) {
//     res.send("Hello World!");
//     // Task.find({}, function(err, task) {
//     //     if (err)
//     //         res.send(err);
//     //     res.json(task);
//     // });
// };

// -------------REST calls for assignments-------------
exports.getCourseAssignments = function(req, res) {
    const MongoClient = mongodb.MongoClient;
    const url = 'mongodb://localhost:27017/graderaide';
    MongoClient.connect(graderaideURL, function(err, client){
        if(err){
            console.log('Error: ', err);
        } else {
            const collection = client.db('graderaide').collection('assignments');
            collection.find({ $and: [{'course': {$eq: req.params.courseId}}, {'section': {$eq: req.params.section}}]}).toArray(function(err, result){
                if(err){
                    console.log('Error: ', err);
                } else if (result.length) {
                    res.send(result);
                } else {
                    res.send('None');
                }
                
                client.close();
            });
        }
    });
};

exports.addCourseAssignment = function(req, res) {
    const MongoClient = mongodb.MongoClient;
    MongoClient.connect(graderaideURL, function(err, client){
        if(err){
            console.log('Error: ', err);
        } else {
            const collection = client.db('graderaide').collection('assignments');
            collection.find({ 'course': req.body.course, 'section': req.body.section, 'id': req.body.name}).toArray(function(err, result){
                if(err){
                    console.log('Error: ', err);
                } else if (result.length == 0) {
                    collection.insert({'course': req.body.course, 'section': req.body.section, 'id': req.body.name,
                        'totalPts': req.body.points, 'rules': []
                    }, function(err, result){
                        if(err){
                            console.log('Error: ', err);
                        }else{
                            res.send('Success');
                        }
                        
                        client.close();
                    });
                } else {
                    res.send('Assignment already exists');
                }
                
                client.close();
            });
        }
    });
};

exports.editCourseAssignment = function(req, res) {
    const MongoClient = mongodb.MongoClient;
        MongoClient.connect(graderaideURL, function(err, client){
        if(err){
            console.log('Error: ', err);
        } else {
            const collection = client.db('graderaide').collection('assignments');
            collection.find({ 'course': req.body.course, 'section': req.body.section, 'id': req.body.id, 'totalPts': req.body.points }).toArray(function(err, result){
                if(err){
                    console.log('Error: ', err);
                } else if (result.length === 0) {
                    collection.updateOne( {$and: [{ 'course': {$eq: req.body.course}},{ 'section': {$eq: req.body.section}}, {'id': {$eq: req.body.oldId}} ]},
                        { $set: { 'id': req.body.id, 'totalPts': req.body.points } }, function(err, result){
                            if(err){
                                console.log('Error: ', err);
                            }else{
                                res.send('Success');
                            }
                            client.close();
                    });
                } else {
                    res.send('Success');
                }
                
                client.close();
            });
        }
    });
};

exports.removeAssignment = function(req, res) {
    const MongoClient = mongodb.MongoClient;
    MongoClient.connect(graderaideURL, function(err, client){
        if(err){
            console.log('Error: ', err);
        } else {

            const collection = client.db('graderaide').collection('assignments');

            collection.deleteOne( {$and: [{ 'course': {$eq: req.body.course}},{ 'section': {$eq: req.body.section}},
                                    {'id': {$eq: req.body.id}}]}
                , function(err, result){
                    if(err){
                        console.log('Error: ', err);
                    } else if (result.deletedCount) {
                        res.send('Success');
                    } else {
                        res.send('None');
                    }
                client.close();
            });
        }
    });
}

exports.saveAssignmentRules = function(req, res) {
    const MongoClient = mongodb.MongoClient;
        MongoClient.connect(graderaideURL, function(err, client){
        if(err){
            console.log('Error: ', err);
        } else {
            const collection = client.db('graderaide').collection('assignments');

            collection.updateOne( {$and: [{ 'course': {$eq: req.body.name}},{ 'section': {$eq: req.body.section}}, {'id': {$eq: req.body.id}} ]},
                { $set: { 'rules': req.body.rules} }, function(err, result){
                    console.log(result);
                    if(err){
                        console.log('Error: ', err);
                    }else{
                        // console.log(result);
                        res.send('Success');
                    }
                    client.close();
            });
        }
    });
};

exports.saveAssignmentToStudent = function(req, res) {
    const MongoClient = mongodb.MongoClient;
    const url = 'mongodb://localhost:27017/graderaide';
    console.log('uvuid ', req.body.uvuid);
    console.log('course ', req.body.course);
    console.log('section ', req.body.section);
    console.log('assignment ', req.body.assignment);
    console.log('totpts ', req.body.totPts);
    console.log('actpts ', req.body.actPts);
    console.log('rules ', req.body.rules);
    console.log('comments ', req.body.comments);
    MongoClient.connect(graderaideURL, function(err, client){
        if(err){
            console.log('Error: ', err);
        } else {
            const collection = client.db('graderaide').collection('graded');
            collection.find({'uvuId': req.body.uvuid,'course': req.body.course,'section': req.body.section,'assignment': req.body.assignment}).toArray(function(err, result){
                console.log('this is the result', result);
                    if(err){
                        console.log('Error: ', err);
                    } else if (result.length !== 0) {
                        console.log('found the document to be replaced', result[0]._id);
                        collection.replaceOne({_id: result[0]._id},
                            {'uvuId': req.body.uvuid,'course': req.body.course,'section': req.body.section,'assignment': req.body.assignment,'totPts': req.body.totPts,'actPts': req.body.actPts,
                            'rules': req.body.rules,'comments': req.body.comments}, function(err, result){
                                console.log('this is the result from the replaceOne', result.result.nModified);
                                if(err){
                                    console.log('Error: ', err);
                                } else if (result.result.nModified === 1) {
                                    console.log('replaced the graded assignment');
                                    res.send('Success');
                                } else {
                                    console.log('The existing doc wasnt modified');
                                    res.send('None');
                                }
                                
                                client.close();
                        });
                    } else {
                        collection.insertOne({'uvuId': req.body.uvuid,'course': req.body.course,'section': req.body.section,'assignment': req.body.assignment,'totPts': req.body.totPts,'actPts': req.body.actPts,
                            'rules': req.body.rules,'comments': req.body.comments}, function(err, result){
                                console.log('this is the result from the insertOne', result.insertedCount);
                                if(err){
                                    console.log('Error: ', err);
                                } else if (result.insertedCount === 1) {
                                    console.log('inserted the new graded assignment');
                                    res.send('Success');
                                } else {
                                    console.log('The doc wasnt inserted');
                                    res.send('None');
                                }
                                
                                client.close();
                        });
                    }
                    
                    client.close();
            });
        }
    });
};


exports.getGradedAssignment = function(req, res){
    const MongoClient = mongodb.MongoClient;
    const url = 'mongodb://localhost:27017/graderaide';
    MongoClient.connect(graderaideURL, function(err, client){
        if(err){
            console.log('Error: ', err);
        } else {
            const collection = client.db('graderaide').collection('graded');
            collection.find({'uvuId': req.body.id, 'course': req.body.course, 'section': req.body.section, 'assignment': req.body.assignment}).toArray(function(err, result){
                if(err){
                    console.log('Error: ', err);
                } else if (result.length !== 0) {
                    console.log('this is the assignment returned ', result);
                    res.send(result);
                } else {
                    res.send('None');
                }
                
                client.close();
            });
        }
    });
};


exports.get_users = function(req, res) {
    const MongoClient = mongodb.MongoClient;
    const url = 'mongodb://localhost:27017/graderaide';
    MongoClient.connect(graderaideURL, function(err, client){
        if(err){
            console.log('Error: ', err);
        } else {
            const collection = client.db('graderaide').collection('users');
            collection.find({'isAdmin': true}).toArray(function(err, result){
                if(err){
                    console.log('Error: ', err);
                } else if (result.length) {
                    res.send(result);
                } else {
                    res.send('No documents found');
                }
                
                client.close();
            });
        }
    });
};

// REST calls for comments
// getting all the comments
exports.getComments = function(req, res){
    const MongoClient = mongodb.MongoClient;
    const url = 'mongodb://localhost:27017/graderaide';
    
    MongoClient.connect(graderaideURL, function(err, client){
        if(err){
            console.log('Error: ', err);
        } else {
            const collection = client.db('graderaide').collection('comments');
            collection.find().toArray(function(err, result){
                if(err){
                    console.log('Error: ', err);
                } else if (result.length) {
                    res.send(result);
                } else {
                    res.send('None');
                }
                
                client.close();
            });
        }
    });
};

exports.saveComments = function(req, res) {
    const MongoClient = mongodb.MongoClient;
    console.log(req.body);
        MongoClient.connect(graderaideURL, function(err, client){
        if(err){
            console.log('Error: ', err);
        } else {
            const collection = client.db('graderaide').collection('comments');
            // collection.insertMany(req.body.comments, function (err, result) {
            //             if(err){
            //                 console.log(err);
            //             } else {
            //                 res.send('Success');
            //             }
            //         });
            collection.remove({ },function(err, result){
                if(err){
                    console.log(result);
                } else{
                    console.log(result);
                    collection.insertMany(req.body.comments, function (err, result) {
                        if(err){
                            console.log(err);
                        } else {
                            res.send('Success');
                        }
                    });
                }
            });
        }
    });
};

exports.registerNewStudent = function(req, res){
    const MongoClient = mongodb.MongoClient;
    console.log(req.body);
    MongoClient.connect(graderaideURL, function(err, client){
        if(err){
            console.log('Error: ', err);
        } else {
            const collection = client.db('graderaide').collection('users');
            collection.insertOne({'firstName': req.body.firstName,'lastName': req.body.lastName,'fullName': req.body.firstName + ' ' + req.body.lastName,'userName': req.body.lastName,'password': req.body.pass,'isAdmin': false,
                                    'uvuId': req.body.uvuid,'courses': []},function(err, result){
                if(err){
                    console.log(result);
                } 
                else if(result.insertedCount===1){
                    console.log(result.ops[0]);
                    res.send(result.ops[0]);
                }else{
                    res.send('None');
                }
            });
        }
    });
};