// var assert = require('assert');
// describe('Array', function() {
//   describe('#indexOf()', function() {
//     it('should return -1 when the value is not present', function(){
//       assert.equal(-1, [1,2,3].indexOf(4));
//     });
//   });
// });

process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let assert = require('chai').assert;
let expect = require("chai").expect;
//let chaiHttp = require('chai-http');
//let server = require('../app');
//let should = chai.should();
let chaiShould = require('chai').should;
let supertest = require("supertest");
let should = require("supertest").should;

//chai.use(chaiHttp);
//describe();




let server = supertest.agent('../app');


// UNIT test begin

describe("SAMPLE unit test",function(){

  // #1 should return home page

  it("should get all courses",function(done){

    // calling home page api
    server
    .get('/api/v1/allCourses')
    .expect("Content-type",/json/)
    .expect(200) // THis is HTTP response
    .end(function(err,res){
        if(err){
            
        }
        console.log('asdfasdf',res);
      // HTTP status should be 200
      res.status.should.equal(200);
      // Error key should be false.
      res.body.error.should.equal(false);
      done();
    });
  });

});




