'use strict';

module.exports = function(app) {
    const controller = require('../controllers/all');
    
    // publish index.html
    app.get('/', controller.load_home);

    // ---------------API REST-----------------
    // REST Routes
    // app.get('/test', controller.list_all);
    app.get('/users', controller.get_users);
    app.post('/api/v1/login', controller.login);
    
    // ----------REST calls for courses-------------
    // get all courses
    app.get('/api/v1/allCourses', controller.getAllCourses);
    // get all students
    app.post('/api/v1/getAllStudents', controller.getAllStudents);
    // get all students
    app.put('/api/v1/addCourseToStudent', controller.addCourseToStudent);
    // get student that belong to a course
    app.post('/api/v1/getCourseStudents', controller.getCourseStudents);
    // addes a new course
    app.put('/api/v1/addCourse', controller.addCourse);
    // edits a course
    app.patch('/api/v1/editCourse', controller.editCourse);
    // REST call for delete a class
    app.delete('/api/v1/dropClass', controller.dropThisClass);
    
    
    // -----------REST calls for assignments------------
    // get assignments for the course
    app.get('/api/v1/courseAssigns/:courseId/:section', controller.getCourseAssignments);
    // create new assignment for course
    app.put('/api/v1/addAssignment', controller.addCourseAssignment);
    // update an assignment
    app.patch('/api/v1/editAssignment', controller.editCourseAssignment);
    // delete assignment
    app.delete('/api/v1/removeAssignment', controller.removeAssignment);
    // update an assignment
    app.patch('/api/v1/saveAssignment', controller.saveAssignmentRules);
    // save an assignment to a student
    app.patch('/api/v1/saveAssignmentToStudent', controller.saveAssignmentToStudent);
    // get graded assignment for specific student
    app.post('/api/v1/getGradedAssignment', controller.getGradedAssignment);
    
    
    // REST calls for comments
    app.get('/api/v1/comments', controller.getComments);
    //save comments
    app.patch('/api/v1/comments', controller.saveComments);
    
    //REST call for registration
    app.post('/api/v1/registerNewStudent', controller.registerNewStudent);
    
    // app.route('/api/v1/comment')
    //     .get(controller.getComments)
    //     .patch(controller.saveComments);
    
    
    //     .post(todoList.create_a_task);
    //
    //
    // app.route('/tasks/:taskId')
    //     .get(todoList.read_a_task)
    //     .put(todoList.update_a_task)
    //     .delete(todoList.delete_a_task);
    // app.route('/chat').get(test.start_chat);
    // app.route('/push').get(test.push_to_mongo);
};
