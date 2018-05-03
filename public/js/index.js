    /*global axios*/
    /*global Vue*/
    /*global VueRouter*/
    Vue.use(VueRouter);

    // Modal Component
    const Modal = Vue.extend({
        props: {
            config: {
                validator: function(value) {
                    return value.hasOwnProperty('show') && typeof value.show === 'boolean'
                },
            },
        },
        data: function() {
            return {
                ordernumber: 888
            }
        },
        methods: {
            close: function() {
                this.config.show = false
            },
        },
        data: function() {
            return {
                ordernumber: 999
            }
        },
        ready: function() {
            // Close the modal when the escape key is pressed.
            var self = this
            document.addEventListener('keydown', function() {
                if (self.config.show && event.keyCode === 27) {
                    self.close()
                }
            })
        },
        template: '#modal',
    });

    // Modal Comment Component for editing and creating new assignments
    const ModalComment = Vue.extend({
        props: ['config', 'assignment', 'course', 'title'],
        data: function() {
            return {
                oldData: {},
                idFirstTimeEdit: false,
                pointsFirstTimeEdit: false,
                error: 'That assignment already exists for the course',
                isError: false
            };
        },
        components: {
            modal: Modal,
        },
        methods: {
            updateValue: function(value) {
                if (!this.idFirstTimeEdit && this.assignment.editIdx != -1) {
                    this.oldData.id = this.assignment.id;
                    this.idFirstTimeEdit = true;
                }
                this.assignment.id = value;
            },
            updatePoints: function(points) {
                if (!this.pointsFirstTimeEdit && this.assignment.editIdx != -1) {
                    this.oldData.points = this.assignment.points;
                    this.pointsFirstTimeEdit = true;
                }
                this.assignment.points = points;
            },
            close: function() {
                console.log('closing the modal');
                this.config.calledBy = null;
                this.config.show = false;
            },
            save: function() {
                if (!this.idFirstTimeEdit && this.assignment.editIdx != -1) {
                    this.oldData.id = this.assignment.id;
                }
                if (!this.sectionFirstTimeEdit && this.assignment.editIdx != -1) {
                    this.oldData.points = this.assignment.points;
                }
                if (this.assignment.id && this.assignment.points) {
                    if (this.assignment.editIdx == -1) { //-1 is for new courses
                        let self = this;
                        //axios put
                        axios.put('/api/v1/addAssignment', {
                            name: this.assignment.id,
                            points: this.assignment.points,
                            course: this.course.name,
                            section: this.course.section
                        }).then(function(res) {
                            console.log(res.data);
                            if (res.data == 'Assignment already exists') {
                                console.log(self.isError);
                                self.error = 'That assignment already exists for the course';
                                self.isError = true;
                            }
                            else if (res.status == 200 && res.data == 'Success') {
                                self.isError = false;
                                self.$emit('update:assignment', self.assignment);
                                self.close();
                            }
                        });
                    }
                    else {
                        console.log('this is an edit');
                        let self = this;
                        //axios put
                        axios.patch('/api/v1/editAssignment', {
                            course: this.course.name,
                            section: this.course.section,
                            oldId: this.oldData.id,
                            id: this.assignment.id,
                            points: this.assignment.points
                        }).then(function(res) {
                            console.log(res.data);
                            if (res.data == 'Assignment already exists') {
                                console.log(self.isError);
                                self.error = 'That assignment already exists for the course';
                                self.isError = true;
                            }
                            else if (res.status == 200 && res.data == 'Success') {
                                self.isError = false;
                                this.idFirstTimeEdit = false;
                                this.pointsFirstTimeEdit = false;
                                self.$emit('update:assignment', self.assignment);
                                self.close();
                            }
                        });
                    }
                }
                else {
                    this.error = "Please enter a assignment name and point value";
                    this.isError = true;
                }
                // if (this.assignment.id)
                //     this.$emit('update:assignment', this.assignment);
                // this.close();
            },
        },
        template: '#modal-comment',
    });

    // Modal Comment Component for editing and creating new course
    const ModalCourse = Vue.extend({
        props: ['config', 'course', 'title'],
        data: function() {
            return {
                oldData: {},
                nameFirstTimeEdit: false,
                sectionFirstTimeEdit: false,
                error: 'That course and section already exists',
                isError: false
            };
        },
        components: {
            modal: Modal,
        },
        methods: {
            updateValue: function(value) {
                if (!this.nameFirstTimeEdit && this.course.editIdx != -1) {
                    this.oldData.name = this.course.name;
                    this.nameFirstTimeEdit = true;
                }
                this.course.name = value;

            },
            updatePoints: function(section) {
                if (!this.sectionFirstTimeEdit && this.course.editIdx != -1) {
                    this.oldData.section = this.course.section;
                    this.sectionFirstTimeEdit = true;
                }

                this.course.section = section;

            },
            close: function() {
                this.config.show = false;
            },
            saveCourse: function() {
                if (!this.nameFirstTimeEdit && this.course.editIdx != -1) {
                    this.oldData.name = this.course.name;
                }
                if (!this.sectionFirstTimeEdit && this.course.editIdx != -1) {
                    this.oldData.section = this.course.section;
                }
                // TODO: implement the form logic.
                //console.log('save save', this.assignment);
                console.log(this.course);
                if (this.course.name && this.course.section) {
                    if (this.course.editIdx == -1) { //-1 is for new courses
                        let self = this;
                        //axios put
                        axios.put('/api/v1/addCourse', {
                            name: this.course.name,
                            section: this.course.section
                        }).then(function(res) {
                            console.log(res.data);
                            if (res.data == 'Course already exists') {
                                console.log(self.isError);
                                self.error = 'That course and section already exists';
                                self.isError = true;
                            }
                            else if (res.status == 200 && res.data == 'Success') {
                                self.isError = false;
                                self.$emit('update:courses', self.course);
                                self.close();
                            }
                        });
                    }
                    else {
                        console.log('this is an edit');
                        let self = this;
                        //axios put
                        axios.patch('/api/v1/editCourse', {
                            name: this.course.name,
                            section: this.course.section,
                            oldName: this.oldData.name,
                            oldSection: this.oldData.section
                        }).then(function(res) {
                            console.log(res.data);
                            if (res.data == 'Course already exists') {
                                console.log(self.isError);
                                self.error = 'That course and section already exists';
                                self.isError = true;
                            }
                            else if (res.status == 200 && res.data == 'Success') {
                                self.isError = false;
                                this.nameFirstTimeEdit = false;
                                this.sectionFirstTimeEdit = false;
                                self.$emit('update:courses', self.course);
                                self.close();
                            }
                        });
                    }
                }
                else {
                    this.error = "Please enter a course name and section";
                    this.isError = true;
                }
                //this.close();
            },
        },
        template: '#modal-course',
    });

    //Modal new student
    const ModalNewStudent = Vue.extend({
        props: ['config', 'course', 'title', 'students'],
        data: function() {
            return {
                currentStudent: null,
                studentSelected: false,
                nameFirstTimeEdit: false,
                sectionFirstTimeEdit: false,
                error: 'That student already exists',
                isError: false
            };
        },
        components: {
            modal: Modal,
        },
        methods: {
            close: function() {
                this.config.calledBy = null;
                this.config.show = false;
            },
            saveStudent: function() {
                let self = this;
                console.log(this.course);
                console.log(this.students);
                console.log(this.currentStudent.split('-')[0], this.currentStudent.split('-')[1]);
                console.log(`this puup`, this.currentStudent.substring(this.currentStudent.indexOf('-') + 1, this.currentStudent.length));
                console.log('this other puup', this.course);
                axios.put('/api/v1/addCourseToStudent', {
                        'courseName': this.course.name,
                        'courseSection': this.course.section,
                        'uvuid': this.currentStudent.substring(this.currentStudent.indexOf('-') + 1, this.currentStudent.length)
                    })
                    .then(function(res) {
                        // console.log(res);
                        if (res.status == 200 && res.data != 'Niete') {
                            console.log('this puppy has been called');
                            self.$emit('update:students');
                            self.close();
                        }
                    })
                    .catch(function(err) {
                        console.log(err);
                    })
            },
        },
        template: '#modal-newStudent',
    });

    //template for login
    const Login = {
        template: `
<div>
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-6 col-md-offset-3">
            <div class="card mt-5">
                <!--<div class="card-heading">-->
                <!--</div>-->
                <div class="text-center">
                    <img src="https://lh6.googleusercontent.com/proxy/UKIX35V_6Xz-ZH3ANPV2_h_M0ii2bazpEOiU-SmYvRl9WAbHifCf0VPOmOInEP4kQ4C1sd9S_z6o7zNuNvaHL3RD-qnRUZ61PLeL2NKlEPW0f-uIGDJRAXgp1DsI-tZ7CH0kRuUIIn-0xXDA8pF5aV0ruxbkmdI=w160-h160-k-no" class="img-rounded" alt="not found">
                </div>
                <div class="card-body">
                    <h4 class="login-title">GraderAide Sign In</h4>
                    <form>
                        <div class="form-group">
                        <input type="text" id="name" class="form-control" v-model="userId" required>
                        <label class="form-control-placeholder" for="name">UVU Id</label>
                    </div>
                    <div class="form-group">
                        <input type="password" id="password" class="form-control" v-model="password" required>
                        <label class="form-control-placeholder" for="password">Password</label>
                    </div>
                        
                        <button type="submit" class="btn btn-default btn-block btn-colored btn-space" @click="login()">LOG IN</button>
                    </form>
                    <div class="divider space-top my-3">
                        <h5>Haven't registered yet?</h5>
                    </div>
                    
                    <button type="button" class="btn btn-default btn-block btn-space btn-colored" @click="register()">REGISTER</button>
                    <hr class="space-top"/>
                    <footer class="text-center">
                            &copy; 2018 Copyright Utah Valley University CS Department
                    </footer>
                </div>
            </div>
        </div>
    </div>
</div>
</div>`,
        data: function() {
            return {
                userId: "",
                password: "",
                isAdmin: false,
                isLogedIn: false,
                incorrect: false
            };
        },
        created: function() {

        },
        methods: {
            register: function(){
                console.log('made it to registration');
                router.push({ name: 'register' });
            },
            login: function() {
                let self = this;
                console.log('Logging In', this.userId, this.password);
                axios.post('/api/v1/login', {
                        uvuId: this.userId,
                        password: this.password
                    })
                    .then(function(res) {
                        console.log(res);
                        if (res.status == 200 && res.data != 'None') {
                            // console.log(res);
                            console.log('the isAdmin var is: ', res.data[0].isAdmin);
                            if (res.data[0].isAdmin) {
                                authenication.auth = true;
                                router.push({ name: 'grader', params: { user: res.data[0] } });
                            }
                            else {
                                authenication.auth = true;
                                router.push({ name: 'student', params: { user: res.data[0] } });
                            }
                        }
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
            }
        }
    };

    //template for login
    const Register = {
        template: `
<div>
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-6 col-md-offset-3">
            <div class="card mt-5">
                <!--<div class="card-heading">-->
                <!--</div>-->
                <div class="text-center">
                    <img src="https://lh6.googleusercontent.com/proxy/UKIX35V_6Xz-ZH3ANPV2_h_M0ii2bazpEOiU-SmYvRl9WAbHifCf0VPOmOInEP4kQ4C1sd9S_z6o7zNuNvaHL3RD-qnRUZ61PLeL2NKlEPW0f-uIGDJRAXgp1DsI-tZ7CH0kRuUIIn-0xXDA8pF5aV0ruxbkmdI=w160-h160-k-no" class="img-rounded" alt="not found">
                </div>
                <div class="card-body">
                    <h4 class="login-title">GraderAide Register</h4>
                    <form>
                        <div class="form-group">
                            <input type="text" id="firstName" class="form-control" v-model="firstName" required>
                            <label class="form-control-placeholder" for="name">First Name</label>
                        </div>
                        <div class="form-group">
                            <input type="text" id="lastName" class="form-control" v-model="lastName" required>
                            <label class="form-control-placeholder" for="name">Last Name</label>
                        </div>
                        <div class="form-group">
                            <input type="text" id="uvuID" class="form-control" v-model="uvuID" required>
                            <label class="form-control-placeholder" for="name">UVU Id</label>
                        </div>
                        <div class="form-group">
                            <input type="password" id="password" class="form-control" v-model="password" required>
                            <label class="form-control-placeholder" for="password">Password</label>
                        </div>
                        
                        <button type="submit" class="btn btn-default btn-block btn-colored btn-space" @click="register()">REGISTER</button>
                    </form>
                    <hr class="space-top"/>
                    <footer class="text-center">
                            &copy; 2018 Copyright Utah Valley University CS Department
                    </footer>
                </div>
            </div>
        </div>
    </div>
</div>
</div>`,
        data: function() {
            return {
                firstName: "",
                lastName: "",
                uvuID: "",
                password: "",
                incorrect: false
            };
        },
        created: function() {

        },
        methods: {
            register: function() {
                if(this.firstName === "" || this.lastName === "" || this.uvuID === "" || this.password === ""){
                    
                }
                else{
                    let self = this;
                    console.log('Logging In', this.firstName, this.lastName, this.uvuID, this.password);
                    axios.post('/api/v1/registerNewStudent', {
                        firstName: this.firstName,
                        lastName: this.lastName,
                        uvuid: this.uvuID,
                        pass: this.password
                    })
                    .then(function(res) {
                        console.log(res);
                        if (res.status == 200 && res.data != 'None') {
                            console.log('here is the student retured from registration', res.data);
                            authenication.auth = true;
                            router.push({ name: 'student', params: { user: res.data } });
                        }
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
                }
                
                
                
                
                
                
                router.push({ name: 'home' });
            }
        }
    };

    //template for grader view
    const Grader = {
        props: ['user'],
        template: `
<div>
    <modal-comment :config="modalConfig" :assignment="assignment" :title="modalTitle" :course="currentCourse" :caller="this"
                    @update:assignment="value => pushValue(value)"></modal-comment>
                  
    <modal-course :config="modalCourseConfig" :course="course" :title="modalTitle"
                    @update:courses="value => loadCourses(value)"></modal-course>
                    
    <modal-newStudent :config="modalNewStudentConfig" :course="course" :title="modalTitle" :students="availableStudents"
                    @update:students="() => getCourseStudents()"></modal-newStudent>

    <div class="row">

        <!-- title row -->
        <div class="col-xl-8 offset-xl-2">
            <div class="card" style="margin-top: 4rem">
                <div class="card-body">
                    <nav class="navbar navbar-default">
                        <div class="container-fluid">
                            <ul class="nav navbar-nav">
                                <select class="custom-select custom-select-lg mb-3" v-model="currentCourse"
                                        @change="getCourseAssignments()">
                                    <option selected disabled value="">Select Course</option>
                                    <option v-for="course in courses" v-bind:value="course">
                                        {{course.name}}-{{course.section}}
                                    </option>
                                </select>
                            </ul>
                            
                            <ul class="navbar-nav mx-auto">
                                <li class="nav-item nav-custom" v-if="showCourseAssignments">
                                    <a class="nav-link" href="javascript:void(0)" @click="editCourse()" title="Edit Selected Course">Edit</a>
                                </li>
                            </ul>
                            <ul class="navbar-nav mx-auto">
                                <li class="nav-item nav-custom" v-if="showCourseAssignments">
                                    <a class="nav-link" href="javascript:void(0)" @click="dropCourse()" title="Drop Selected Course">Drop</a>
                                </li>
                            </ul>
                            <ul class="navbar-nav mx-auto">
                                <li class="nav-item nav-custom" v-if="showCourseAssignments">
                                    <a class="nav-link" href="javascript:void(0)" @click="addStudentToCourse()" title="Add Student">Add Student</a>
                                </li>
                            </ul>
                            <ul class="navbar-nav mx-auto">
                                <li class="nav-item nav-custom">
                                    <a class="nav-link" href="javascript:void(0)" @click="newCourse()" title="Create Course">Create</a>
                                </li>
                            </ul>
                        </div>
                    </nav>
                    <hr>
                    <nav class="navbar navbar-default">
                        <div class="container-fluid">
                            <ul class="nav navbar-nav" v-if="showCourseAssignments">
                                <select class="custom-select custom-select-lg mb-3" v-model="currentAssignment"
                                        @change="getAssignment()">
                                    <option :selected="currentAssignment.id" disabled>Select Assignment</option>
                                    <option v-for="assignment in assignments" ref="criteria" v-bind:value="assignment.id">
                                        {{assignment.id}}
                                    </option>
                                </select>

                            </ul>
                            <!--<ul class="navbar-nav mx-auto">
                                <li class="nav-item nav-custom">
                                    <a class="nav-link"  href="javascript:void(0)" v-if="currentAssignment != 'Select Assignment'"
                                      @click="saveState()" title="Save Assignment">Save</a>
                                </li>
                            </ul>-->
                            <ul class="navbar-nav mx-auto">
                                <li class="nav-item nav-custom">
                                    <a class="nav-link"  href="javascript:void(0)" v-if="currentAssignment != 'Select Assignment'"
                                      @click="editAssignment()" title="Edit Assignment">Edit</a>
                                </li>
                            </ul>
                            <ul class="navbar-nav mx-auto">
                                <li class="nav-item nav-custom">
                                    <a class="nav-link"  href="javascript:void(0)" v-if="currentAssignment != 'Select Assignment'"
                                      @click="removeAssignment()" title="Remove Assignment">Delete</a>
                                </li>
                            </ul>
                            <ul class="navbar-nav mx-auto">
                                <li class="nav-item nav-custom" v-if="showCourseAssignments">
                                    <a class="nav-link" href="javascript:void(0)" @click="newAssignment()" title="Create Assignment">Create</a>
                                </li>

                            </ul>
                        </div>
                    </nav>
                    <hr>
                    <nav class="navbar navbar-default">
                        <div class="container-fluid">
                            <ul class="nav navbar-nav" v-if="showStudentsInAssignment">
                                <select class="custom-select custom-select-lg mb-3" v-model="currentStudent"
                                        @change="studentSelected()">
                                    <option :selected="currentAssignment.id" disabled>Select Student</option>
                                    <option v-for="student in courseStudents" v-bind:value="student">
                                        {{student.fullName}}
                                    </option>
                                </select>

                            </ul>
                            <ul class="navbar-nav mx-auto" v-if="ableToSaveGrade">
                                <li class="nav-item nav-custom">
                                    <a class="nav-link"  href="javascript:void(0)" v-if="currentAssignment != 'Select Assignment'"
                                      @click="saveGradeToStudent()" title="Remove Assignment">Save Grade <span v-if="isSaved"> <img src="img/checkGreen.svg"></span></a>
                                </li>
                            </ul>
                        </div>
                    </nav>
                    
                    <!--rules section-->
                    <hr class="cus-hr"/>
                    <div class="row justify-content-center">
                        <p><b>Points {{totalPts}}</b></p>
                    </div>
                    <div class="row">
                        <div class="col-sm-4">
                            <h5>Rules</h5>
                        </div>
                        <div class="col-sm-1" v-if="!plusFormActive && currentAssignment != 'Select Assignment'"
                             @click="plusFormActive=true"><img src="img/plusGreen.svg" class="clickable"
                                                              title="Open Add Fields">
                        </div>

                        <div class="col-sm-1"
                             v-if="removedRulesStack.length > 0 && currentAssignment != 'Select Assignment'"
                             @click="undoRemove()"><img src="img/undoBlack.svg" class="clickable"
                                                        title="Undo">
                        </div>
                    </div>
                    <!-- rules rows -->
                    <div v-for="(rule, i) of rules" :key="i"><!-- TODO -->
                        <div v-if="ruleIndToEdit == i">
                            <input type="text" class="col-sm-2" :value="rule.pts" v-model.number.lazy="rule.pts"
                                  @keyup.enter="saveRuleEdit(rule)" title="pts (positive or negative)">
                            <input type="text" class="col-sm-9" :value="rule.desc" v-model.trim.lazy="rule.desc"
                                  @keyup.enter="saveRuleEdit(rule)">
                            <img src="img/pencilBlack.svg" class="clickable float-right" @click="saveRuleEdit(rule)"
                                 title="Save"><br>
                        </div>
                        <div v-if="ruleIndToEdit != i">
                            <input type="checkbox" name="rubric" :value="rule" v-model="selectedRules">
                            {{rule.pts | positive}} {{rule.desc}}
                            <img src="img/pencilBlack.svg" class="clickable float-right" @click="ruleIndToEdit = i"
                                 title="Edit">
                            <img src="img/xRed.svg" class="clickable float-right removeButton" @click="removeRule(i)"
                                 title="Remove">
                            <br>
                            </input>
                        </div>
                    </div>

                    <!-- add row -->
                    <div v-if="plusFormActive">
                        <input type="text" class="col-sm-2" v-model.number.lazy="addNum" @keyup.enter="addRule()"
                              title="pts (positive or negative)">
                        <input type="text" class="col-sm-9" v-model.trim.lazy="addDesc" @keyup.enter="addRule()"
                              placeholder="Type your new rule here ...">
                        <img src="img/plusGreen.svg" class="clickable float-right" @click="addRule()" title="Add"><br>
                    </div>

                    <!-- output rows -->
                    <div v-if="actualPts < totalPts" class="alert alert-warning mt-3" role="alert">
                        <span v-for="selectedRule of selectedRules">{{selectedRule.pts | positive}} {{selectedRule.desc}}<br></span>
                        <b>Comments</b><br>
                        <span v-for="selectedComment of selectedComments">- {{selectedComment}}<br></span>
                        <div class="row justify-content-end">
                            <button class="btn btn-warning" v-clipboard:copy="otherCopyMessage" v-clipboard:success="onCopy">
                                Copy
                            </button>
                        </div>
                        <hr>
                        <b>Points Earned </b> {{actualPts}}

                    </div>
                    <div v-else class="alert alert-success mt-3" role="alert">
                        <span v-for="selectedRule of selectedRules" >{{selectedRule.pts | positive}} {{selectedRule.desc}}<br></span>
                        <b>Good Job</b><br>
                        <b>Comments</b><br>
                        <span v-for="selectedComment of selectedComments">- {{selectedComment}}<br></span>
                        <div class="row justify-content-end">
                            <button class="btn btn-success" v-clipboard:copy="goodCopyMessage" v-clipboard:success="onCopy">
                                Copy
                            </button>
                        </div>
                        <hr>
                        <b>Points Earned </b> {{actualPts}}
                    </div>

                    <div class="row">
                        <div class="col-sm-4">
                            <h5>Comments</h5>
                        </div>
                        <div class="col-sm-1 float-right" @click="saveComments()">
                            <img srcset="img/verifiedBlack.svg" class="clickable" title="Save Comments">
                        </div>
                        <div class="col-sm-1 float-right" v-if="!addCommentActive"
                             @click="addCommentActive=true"><img srcset="img/plusGreen.svg" class="clickable"
                                                                 title="Open Add Fields">
                        </div>
                        <div class="col-sm-1"
                             v-if="removeCommentStack.length > 0"
                             @click="undoRemoveComment()"><img src="img/undoBlack.svg" class="clickable"
                                                              title="Undo">
                        </div>
                    </div>

                    <!-- comment rows -->
                    <div v-for="(comment, i) of comments" :key="comment.id"><!-- TODO -->
                        <div v-if="commIndToEdit != i">
                            <input type="checkbox" name="rubric" :value="comment.body" v-model="selectedComments">
                            {{comment.body}}
                            <img src="img/pencilBlack.svg" class="clickable float-right" @click="commIndToEdit = i"
                                 title="Edit">
                            <img src="img/xRed.svg" class="clickable float-right removeButton" @click="removeComment(i)"
                                 title="Remove">
                            <br>
                            </input>
                        </div>
                        <div v-if="commIndToEdit == i">
                            <input v-if="commIndToEdit != -1" type="text" class="col-sm-9" name="rubric"
                                  :value="comment.body"
                                  v-model="comment.body" @keyup.enter="commIndToEdit = -1">
                            <img src="img/pencilBlack.svg" class="clickable float-right" @click="commIndToEdit = -1"
                                 title="Save Edit">
                            <br>
                            </input>
                        </div>


                    </div>
                    <!-- add comment -->
                    <div v-if="addCommentActive">
                        <input type="text" class="col-sm-9" v-model.trim.lazy="addCommentBody"
                              @keyup.enter="addComment()"
                              placeholder="Type your new comment here ...">
                        <img src="img/plusGreen.svg" class="clickable float-right" @click="addComment()"
                             title="Add"><br>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!--<pre>selectedComments is {{selectedComments}}</pre>-->
    <br>
</div>`,
        data: function() {
            return {
                name: null,
                totalPts: 0,
                rules: [],
                assignments: [],
                comments: [],
                courses: [],
                currentCourse: null,
                profile: null,
                //temporary gui state
                selectedRules: [],
                selectedComments: [],
                addNum: null,
                addDesc: null,
                addCommentBody: null,
                addAssignment: null,
                plusFormActive: false,
                addCommentActive: false,
                showCourseAssignments: false,
                currentAssignment: "Select Assignment",
                createNew: false,
                commIndToEdit: -1,
                ruleIndToEdit: -1,
                assignment: {
                    id: null,
                    points: 0,
                    editIdx: -1
                },
                course: {
                    name: null,
                    section: 0,
                    editIdx: -1
                },
                modalConfig: {
                    show: false,
                    ordernumber: null,
                    calledBy: null
                },
                modalCourseConfig: {
                    show: false,
                    ordernumber: null
                },
                modalNewStudentConfig: {
                    show: false,
                    ordernumber: null,
                    calledBy: null
                },
                srtRulesAmount: 0,
                endRulesAmount: 0,
                removedRulesStack: [],
                removeCommentStack: [],
                modalTitle: "New Assignment",
                showStudentsInAssignment: false,
                currentStudent: null,
                availableStudents: [],
                courseStudents: [],
                ableToSaveGrade: false,
                isSaved: false,
                assignSelected: false,
                studSelected: false,
                copyElements: null,
                message:'Text to copy'
            };
        },
        components: {
            ModalComment: ModalComment,
            ModalCourse: ModalCourse,
            ModalNewStudent: ModalNewStudent
        },
        filters: {
            positive: function(num) { //TODO make all caps
                if (num > 0) return `+${num}`;
                return num;
            }
        },
        computed: {
            actualPts: function() { //add up all selected pts and subtract from totalPts
                return this.selectedRules.reduce((acc, el) => Number(acc) + Number(el.pts), this.totalPts);

                //   let sum = this.totalPts;
                //   for (rule of this.selectedRules) {
                //       sum += rule.pts;
                //   }
                //   return sum;
            },
            goodCopyMessage: function() {
                return this.selectedRules.map(function(elem){
                    return elem.pts + ' ' + elem.desc;
                }).join('\n').concat('\nGood Job').concat('\nComments').concat(((this.selectedComments.length > 0) ? '\n' : '')).concat(this.selectedComments.map(function(el){
                    return '- ' + el;
                }).join('\n')).concat('\nPoints Earned '+this.actualPts);
            },
            otherCopyMessage: function() {
                return this.selectedRules.map(function(elem){
                    return elem.pts + ' ' + elem.desc;
                }).join('\n').concat('\nComments').concat(((this.selectedComments.length > 0) ? '\n' : '')).concat(this.selectedComments.map(function(el){
                    return '- ' + el;
                }).join('\n')).concat('\nPoints Earned '+this.actualPts);
            }
        },
        created: function() {
            console.log('In Grader Component');
            let self = this;
            console.log(self.user);
            //make call to get courses
            axios.get('/api/v1/allCourses')
                .then(function(res) {
                    // console.log(res);
                    if (res.status == 200 && res.data.length != 0) {
                        // console.log(res.data);
                        self.courses = res.data;
                        // console.log(self.courses);
                    }
                })
                .catch(function(err) {
                    console.log(err);
                });
            axios.get('/api/v1/comments')
                .then(function(res) {
                    // console.log(res);
                    if (res.status == 200 && res.data != 'None') {
                        console.log(res.data);
                        self.comments = res.data;
                        // console.log(self.comments);
                    }
                })
                .catch(function(err) {
                    console.log(err);
                })

        },
        methods: {
            copyGood: function() {
                let copyString = "";
                for(const selectedRule of this.selectedRules){
                    console.log(selectedRule);
                }
                // return 'good';
            },
            undoRemoveComment: function() {
                let i = this.removeCommentStack.pop();
                console.log(i.idx, i.val);
                this.comments.splice(i.idx, 0, i.val);
            },
            removeComment: function(i) {
                let obj = {
                    'idx': i,
                    'val': this.comments[i]
                };
                this.removeCommentStack.push(obj);
                this.comments.splice(i, 1);
            },
            removeRule: function(i) {
                let obj = {
                    'idx': i,
                    'val': this.rules[i]
                };
                this.removedRulesStack.push(obj);
                this.rules.splice(i, 1);
                this.endRulesAmount--;
            },
            saveRuleEdit: function(rule) {
                console.log("save an edit");
                if (!rule.pts) return;
                if (!rule.desc) return;
                this.ruleIndToEdit = -1;
            },
            addRule: function() {
                if (!this.addNum) return;
                if (!this.addDesc) return;
                console.log(typeof(this.addNum), typeof(this.addDesc));
                this.rules.push({ pts: this.addNum, desc: this.addDesc });
                console.log(this.rules);
                console.log(typeof this.rules[0].addNum);
                this.addNum = null;
                this.addDesc = null;
                this.plusFormActive = false;
                this.endRulesAmount++;
            },
            undoRemove: function() {
                let i = this.removedRulesStack.pop();
                console.log(i.idx, i.val);
                this.rules.splice(i.idx, 0, i.val);
            },
            dropCourse: function() {
                let self = this;
                console.log(this.currentCourse);
                this.showCourseAssignments = false;
                axios.delete('/api/v1/dropClass', {
                        data: {
                            'courseId': this.currentCourse.name,
                            'section': this.currentCourse.section
                        }
                    })
                    .then(function(res) {
                        console.log(res);
                        if (res.status == 200 && res.data == 'Success') {
                            self.getCourses();

                        }
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
            },
            getCourses: function() {
                let self = this;
                axios.get('/api/v1/allCourses')
                    .then(function(res) {
                        // console.log(res);
                        if (res.status == 200 && res.data.length != 0) {
                            // console.log(res.data);
                            self.courses = res.data;
                            // console.log(self.courses);
                        }
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
            },
            getCourseAssignments: function() {
                //need to call getCourseStudents()
                let self = this;
                this.assignments = [];
                this.availableStudents = [];
                this.courseStudents = [];
                this.assignSelected = false;
                this.studSelected = false;
                this.ableToSaveGrade = false;
                this.rules = [];
                this.selectedRules = [];
                // console.log('this is for the refs testing ', this.$refs);//this.$refs.assignSelectElement, this.$el);
                // console.log('this is for the refs testing ', self.$refs);//this.$refs.assignSelectElement, this.$el);
                // console.log('this is for the refs testing ', this.$refs.criteria);//this.$refs.assignSelectElement, this.$el);
                // console.log('this is for the refs testing ', this.$route);//this.$refs.assignSelectElement, this.$el);
                // // DOM is not updated yet
                //   this.$nextTick(function () {
                //       let self = this;
                //     console.log('this is for the refs testing ', self.$refs);//this.$refs.assignSelectElement, this.$el);
                //     console.log('this is for the refs testing ', self.$refs.criteria);//this.$refs.assignSelectElement, this.$el);
                //   })
                
                console.log('this is for the refs testing ', this.$refs.criteria);//this.$refs.assignSelectElement, this.$el);
                this.showCourseAssignments = true;
                //console.log('the course is a changin', this.currentCourse);
                //console.log(`/api/v1/courseAssigns/${this.currentCourse.name}/${this.currentCourse.section}`);
                axios.get(`/api/v1/courseAssigns/${this.currentCourse.name}/${this.currentCourse.section}`)
                    .then(function(res) {
                        //console.log(res);
                        if (res.status == 200 && res.data.length != 0) {
                            //console.log(res.data);
                           // console.log(self.assignments);
                            self.assignments = res.data;
                            //console.log(self.assignments);
                            //console.log(self.assignments);
                            self.getCourseStudents();
                        }
                        else if (res.data === 'None') {

                        }
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
            },
            getCourseStudents: function() {
                let self = this;
                console.log('gettin student for this course', this.currentCourse);
                axios.post(`/api/v1/getCourseStudents`, {
                    courseName: this.currentCourse.name,
                    courseSection: this.currentCourse.section
                })
                .then(function(res) {
                        console.log(res);
                        if (res.status == 200 && res.data.length != 0) {
                            console.log('these be the students', res.data);
                            self.courseStudents = res.data;
                            console.log(self.courseStudents);
                            self.showStudentsInAssignment = true;
                        }
                        else if (res.data === 'None') {

                        }
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
            },
            getAssignment: function() {
                console.log('getting Assignment');
                //console.log(this.currentAssignment);
                //console.log(this.assignments.filter(e => e.id === this.currentAssignment));
                console.log(this.removedRulesStack);
                while (this.removedRulesStack.length > 0) {
                    let i = this.removedRulesStack.pop();
                    console.log(i.idx, i.val);
                    this.rules.splice(i.idx, 0, i.val);

                    // this.removedRulesStack = [];
                }
                console.log(this.currentAssignment);
                let found = this.assignments.filter(e => e.id === this.currentAssignment);
                console.log(found);

                this.rules = found[0].rules;
                this.totalPts = found[0].totalPts;
                this.plusFormActive = false;
                this.selectedRules = [];

                //need to find away to figure out if the rules changed
                this.srtRulesAmount = this.rules.length;
                this.endRulesAmount = this.rules.length;
                
                this.assignSelected = true;
                if(this.studSelected){
                    this.ableToSaveGrade = true;
                }
                console.log('assignSelected = ', this.assignSelected);
                console.log('studSelected = ', this.studSelected);
                console.log('ableToSaveGrade = ', this.ableToSaveGrade);
            },
            removeAssignment: function() {
                let self = this;
                console.log(this.currentCourse);
                // this.showCourseAssignments = false;
                axios.delete('/api/v1/removeAssignment', {
                        data: {
                            'course': this.currentCourse.name,
                            'section': this.currentCourse.section,
                            'id': this.currentAssignment
                        }
                    })
                    .then(function(res) {
                        console.log(res);
                        if (res.status == 200 && res.data == 'Success') {
                            self.totalPts = 0;
                            self.getCourseAssignments();

                        }
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
            },
            showAssingmentModal: function() {
                // this.modalConfig.ordernumber = id;
                console.log(this.assignment);
                this.modalConfig.calledBy = this;
                this.modalConfig.show = true;
                //this.assignment.id = null;
                //this.assignment.totalPts = 0;
            },
            showCourseModal: function() {
                // this.modalConfig.ordernumber = id;
                console.log(this.assignment);
                this.modalCourseConfig.show = true;
                //this.assignment.id = null;
                //this.assignment.totalPts = 0;
            },
            showNewStudentModal: function() {
                this.modalNewStudentConfig.calledBy = this;
                this.modalNewStudentConfig.show = true;
            },
            pushValue: function(value) {
                console.log('getting courseAssignments');
                this.getCourseAssignments(function() {
                    if (value.editIdx >= 0) {
                        // this.assignments[value.editIdx].id = value.id;
                        // this.assignments[value.editIdx].totalPts = value.points;
                        this.currentAssignment = this.assignments[value.editIdx].id;
                        // this.totalPts = this.assignments[value.editIdx].totalPts;
                        this.getAssignment();
                        console.log('done getting Assignment');
                    }
                });
                console.log('done getting courseAssignments');
                // console.log(value);
                // let found = this.assignments.findIndex(e => e.id === value.id);
                // this.currentAssignment = this.assignments[found].id;
                //  this.totalPts = this.assignments[value.editIdx].totalPts
                // this.getAssignment();
                //edit current course in mongodb
                // if (value.editIdx >= 0) {
                //     // this.assignments[value.editIdx].id = value.id;
                //     // this.assignments[value.editIdx].totalPts = value.points;
                //     this.currentAssignment = this.assignments[value.editIdx].id;
                //     // this.totalPts = this.assignments[value.editIdx].totalPts;
                //     this.getAssignment();
                //     console.log('done getting Assignment');
                // }
                // else {
                //     // create new course in mongodb
                //     let newObj = {};
                //     newObj.id = value.id;
                //     newObj.totalPts = value.points;
                //     newObj.rules = [];
                //     this.assignments.push(newObj);
                // }
                //console.log('this is the new obj', newObj);

                this.assignment.id = null;
                this.assignment.points = 0;
                this.assignment.editIdx = -1;
                this.modalTitle = "New Assignment";
                // console.log(value);
            },
            loadCourses: function(value) {
                console.log(value.name, value.section);
                this.getCourses(function() {
                    let found = this.courses.findIndex(e => (e.name === value.name && e.section === value.section));
                    //this.course = this.courses[found];
                    console.log(found);
                    this.currentCourse = this.courses[found];
                    this.showCourseAssignments = false;
                    console.log(this.currentCourse);
                    this.getCourseAssignments();
                });
            },
            editAssignment: function() {
                this.assignment.id = this.currentAssignment;
                this.assignment.points = this.totalPts;
                this.assignment.editIdx = this.assignments.findIndex(e => e.id === this.currentAssignment);
                this.modalTitle = "Edit Assignment";
                this.showAssingmentModal();
            },
            newAssignment: function() {
                this.assignment.id = null;
                this.assignment.points = 0;
                this.assignment.editIdx = -1;
                this.modalTitle = "New Assignment";
                this.showAssingmentModal();
            },
            editCourse: function() {
                this.course.name = this.currentCourse.name;
                this.course.section = this.currentCourse.section;
                this.course.editIdx = this.courses.findIndex(e => (e.name === this.currentCourse.name && e.section === this.currentCourse.section));
                this.modalTitle = "Edit Course";
                this.showCourseModal();
            },
            newCourse: function() {
                this.course.name = null;
                this.course.section = null;
                this.course.editIdx = -1;
                this.modalTitle = "New Course";
                this.showCourseModal();
            },
            addStudentToCourse: function() {
                this.course.name = this.currentCourse.name;
                this.course.section = this.currentCourse.section;
                this.modalTitle = "New Student";
                let self = this;
                axios.post('/api/v1/getAllStudents', {
                        'courseName': this.currentCourse.name,
                        'courseSection': this.currentCourse.section
                    })
                    .then(function(res) {
                        // console.log(res);
                        if (res.status == 200 && res.data != 'None') {
                            console.log(res.data);
                            self.availableStudents = res.data;
                            // self.students = res.data;
                            self.showNewStudentModal();
                        }
                    })
                    .catch(function(err) {
                        console.log(err);
                    })
            },
            studentSelected: function() {
                this.studSelected = true;
                if(this.assignSelected){
                    this.ableToSaveGrade = true;
                }
                console.log(this.currentStudent)  ;
                console.log('assignSelected = ', this.assignSelected);
                console.log('studSelected = ', this.studSelected);
                console.log('ableToSaveGrade = ', this.ableToSaveGrade);
            },
            saveState: function() {
                axios.patch('/api/v1/saveAssignment', {
                    name: this.currentCourse.name,
                    section: this.currentCourse.section,
                    id: this.currentAssignment,
                    rules: this.rules
                }).then(function(res) {
                    console.log(res.data);
                    if (res.status == 200 && res.data == 'Success') {
                        console.log('Saved the rules!');
                    }
                });
            },
            addComment: function() {
                if (!this.addCommentBody) return;
                // const nextId = this.comments[this.comments.length - 1].id++;
                //add comment to array with id
                this.comments.push({ 'body': this.addCommentBody });
                this.addCommentBody = null;
                this.addCommentActive = false;
                // console.log(this.addCommentBody);
            },
            saveComments: function() {
                console.log(this.comments);
                axios.patch('/api/v1/comments', {
                    comments: this.comments
                }).then(function(res) {
                    console.log(res.data);
                    if (res.status == 200 && res.data == 'Success') {
                        console.log('Saved the comments!');
                    }
                });
            },
            saveGradeToStudent: function(){
                console.log('selected rules are ',this.selectedRules);
                console.log('total points are ', this.totalPts);
                console.log('actual points are ', this.actualPts);
                console.log('comments are ', this.selectedComments);
                console.log('current student ', this.currentStudent.uvuId);
                console.log('current course ', this.currentCourse);
                console.log('current assignment ', this.currentAssignment);
                let self = this;
                axios.patch('/api/v1/saveAssignmentToStudent', {
                    assignment: this.currentAssignment,
                    section: this.currentCourse.section,
                    course: this.currentCourse.name,
                    uvuid: this.currentStudent.uvuId,
                    totPts: this.totalPts,
                    actPts: this.actualPts,
                    comments: this.selectedComments,
                    rules: this.selectedRules
                }).then(function(res) {
                    console.log(res.data);
                    if (res.status == 200 && res.data == 'Success') {
                        console.log('Saved the assignment to the student!');
                        self.isSaved = true;
                    }
                });
            },
            onCopy: function(e) {
                console.log('you just copied ', e.text);
            }
        }
    };

    //template for student view
    const Student = {
        props: ['user'],
        template: `
            <div>
                <div class="row"> 
                    <!-- title row -->
                    <div class="col-xl-8 offset-xl-2">
                        <div class="card" style="margin-top: 4rem">
                            <div class="card-body">
                                <nav class="navbar navbar-default">
                                    <div class="container-fluid">
                                        <ul class="nav navbar-nav">
                                            <select class="custom-select custom-select-lg mb-3" v-model="currentCourse"
                                                    @change="getCourseAssignments()">
                                                <option selected disabled value="">Select Course</option>
                                                <option v-for="course in courses" v-bind:value="course">
                                                    {{course.name}}-{{course.section}}
                                                </option>
                                            </select>
                                        </ul>
                                    </div>
                                </nav>
                                <hr>
                                <nav class="navbar navbar-default">
                                    <div class="container-fluid">
                                        <ul class="nav navbar-nav" v-if="showCourseAssignments">
                                            <select class="custom-select custom-select-lg mb-3" v-model="currentAssignment"
                                                    @change="getAssignment()">
                                                <option :selected="currentAssignment.id" disabled>Select Assignment</option>
                                                <option v-for="assignment in assignments" v-bind:value="assignment.id">
                                                    {{assignment.id}}
                                                </option>
                                            </select>
                                        </ul>
                                    </div>
                                </nav>
                                
                                <!--rules section-->
                                <hr class="cus-hr"/>
                                <div class="row justify-content-center">
                                    <p><b>Points Possible: {{totalPts}}</b></p>
                                </div>
                                <div class="row">
                                    <div class="col-sm-4">
                                        <h5>Rules</h5>
                                    </div>
                                </div>
                                <div class="row" v-if="isGraded">
                                    <div class="col-sm-4">
                                        <h5>Graded</h5>
                                    </div>
                                </div>
                                <!-- output rows -->
                                <div v-if="actualPts < totalPts" class="alert alert-warning mt-3" role="alert">
                                    <span v-for="selectedRule of selectedRules">{{selectedRule.pts | positive}} {{selectedRule.desc}}<br></span>
                                    <span v-for="selectedComment of selectedComments">- {{selectedComment}}<br></span>
                                    <hr>
                                    <p><b>Points Earned: {{actualPts}}</b></p>
            
                                </div>
                                <div v-else class="alert alert-success mt-3" role="alert">
                                    <span v-for="selectedRule of selectedRules">{{selectedRule.pts | positive}} {{selectedRule.desc}}<br></span>
                                    <b>Good Job</b><br>
                                    <span v-for="selectedComment of selectedComments">- {{selectedComment}}<br></span>
                                    <hr>
                                    {{actualPts}}
                                </div>
                                <div v-if="!isGraded">
                                    <div class="input-group mb-3">
                                        <div class="input-group-prepend">
                                            <span class="input-group-text">Upload</span>
                                        </div>
                                        <div class="custom-file">
                                            <input id="uploadFile" type="file" class="custom-file-input clickable" ref="file" @change="onFileChange">
                                            <label class="custom-file-label" for="uploadFile">{{image}}</label>
                                        </div>
                                    </div>
                                    <div v-if="image != 'Choose file'">
                                        {{image}}
                                        <button class="btn btn-default float-right" @click="removeImage">Remove File</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!--<pre>selectedComments is {{this.courses}}</pre>-->
                <br>
            </div>
        `,
        data: function() {
            return {
                name: null,
                totalPts: 0,
                actualPts: 0,
                rules: [],
                assignments: [],
                comments: [],
                courses: [],
                currentCourse: null,
                profile: null,
                //temporary gui state
                selectedRules: [],
                selectedComments: [],
                addNum: null,
                addDesc: null,
                addCommentBody: null,
                addAssignment: null,
                plusFormActive: false,
                addCommentActive: false,
                showCourseAssignments: false,
                currentAssignment: "Select Assignment",
                createNew: false,
                commIndToEdit: -1,
                ruleIndToEdit: -1,
                assignment: {
                    id: null,
                    points: 0,
                    editIdx: -1
                },
                course: {
                    name: null,
                    section: 0,
                    editIdx: -1
                },
                modalConfig: {
                    show: false,
                    ordernumber: null
                },
                modalCourseConfig: {
                    show: false,
                    ordernumber: null
                },
                srtRulesAmount: 0,
                endRulesAmount: 0,
                removedRulesStack: [],
                removeCommentStack: [],
                modalTitle: "New Assignment",
                image: 'Choose file',
                isGraded: false

            };
        },
        created: function() {
            this.courses = this.user.courses;
            console.log(this.courses);
            console.log(this.file);
        },
        methods: {
            getCourseAssignments: function() {
                let self = this;
                this.showCourseAssignments = true;
                console.log(this.currentCourse);
                //console.log(`/api/v1/courseAssigns/${this.currentCourse.name}/${this.currentCourse.section}`);
                axios.get(`/api/v1/courseAssigns/${this.currentCourse.name}/${this.currentCourse.section}`)
                    .then(function(res) {
                        console.log(res);
                        if (res.status == 200 && res.data.length != 0) {
                            console.log(res.data);
                            console.log(self.assignments);
                            self.assignments = res.data;
                            console.log(self.assignments);
                            console.log(self.assignments);
                        }
                        else if (res.data === 'None') {

                        }
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
            },
            getAssignment: function(){
                console.log('this is the current assignment: ', this.currentAssignment);
                console.log('this is the current section: ', this.currentCourse.section);
                console.log('this is the current course: ', this.currentCourse.name);
                console.log('this is the current uvuId: ', this.user.uvuId);
                let self = this;
                axios.post(`/api/v1/getGradedAssignment`, {
                    assignment: this.currentAssignment,
                    course: this.currentCourse.name,
                    section: this.currentCourse.section,
                    id: this.user.uvuId
                })
                .then(function(res) {
                    if (res.status == 200 && res.data != 'None') {
                        console.log(res.data);
                        console.log('this is the total points returned', res.data[0].totPts);
                        self.totalPts = res.data[0].totPts;
                        self.actualPts = res.data[0].actPts;
                        self.selectedComments = res.data[0].comments;
                        self.selectedRules = res.data[0].rules;
                        console.log('this is the current total points: ', self.totalPts);
                        console.log('this is the current actual points: ', self.actualPts);
                        console.log('this is the current comments: ', self.selectedComments);
                        console.log('this is the current rules: ', self.selectedRules);
                        self.isGraded = true;
                        //self.availableStudents = res.data;
                        // self.students = res.data;
                        //sself.showNewStudentModal();
                    }
                })
                .catch(function(err) {
                    console.log(err);
                })
            },
            onFileChange(e) {
                var files = e.target.files || e.dataTransfer.files;
                if (!files.length)
                    return;
                console.log(files[0]);
                this.image = files[0].name;
                //this.createImage(files[0]);
            },
            // createImage(file) {
            //     console.log(file);
            //   var image = new Image();
            //   var reader = new FileReader();
            //   var vm = this;

            //   reader.onload = (e) => {
            //     vm.image = e.target.result;
            //       };
            //       reader.readAsDataURL(file);
            //     },
            removeImage: function(e) {
                this.image = 'Choose file';
            },
            submitFile() {
                let fileData = new FormData();
                fileData.append('file', this.file);
            }
        }

    };


    const routes = [
        { path: '/', name: 'home', component: Login },
        { path: '/Grader', name: 'grader', component: Grader, props: true, meta: { requiresAuth: true } },
        { path: '/Student', name: 'student', component: Student, props: true, meta: { requiresAuth: true } },
        { path: '*', component: Login },
        { path: '/Register', name: 'register', component: Register }
    ];

    let router = new VueRouter({
        routes
    });

    let Authenication = Vue.extend({
        data: function() {
            return {
                auth: false,
            };
        },
        methods: {
            setAuth: function(passedAuth) { this.auth = passedAuth; },
            getAuth: function() { return this.auth; }
        }
    });

    let authenication = new Authenication({
        data: {
            auth: false
        }
    });

    router.beforeEach((to, from, next) => {
        // console.log(authenication.auth);
        // console.log(router.beforeEach());
        // console.log(from.fullPath);
        if (to.matched.some(record => record.meta.requiresAuth)) {
            // console.log('In required Authenication');
            if (authenication.auth) {
                // console.log('The Authenication was true');
                next();
            }
            else {
                router.push({ name: 'home' });
            }
        }
        else {
            next();
        }
    });

    let app = new Vue({
        el: '#app',
        router,

        data: {},
        methods: {}
    });
    