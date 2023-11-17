// Imports the index.js file to be tested.
const server = require('../index'); //TO-DO Make sure the path to your index.js is correctly added
// Importing libraries


// Chai HTTP provides an interface for live integration testing of the API's.
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const { assert, expect } = chai;


describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });


  // ===========================================================================
  // TO-DO: Part A Login unit test case

  // //We are checking POST /add_user API by passing the user info in the correct order. This test case should pass and return a status 200 along with a "Success" message.
  // //Positive cases
  // it('positive : /add_user', done => {
  //   chai
  //     .request(server)
  //     .post('/add_user')
  //     .send({ id: 5, name: 'John Doe', dob: '2020-02-20' })
  //     .end((err, res) => {
  //       expect(res).to.have.status(200);
  //       expect(res.body.message).to.equals('Success');
  //       done();
  //     });
  // });

  // Test positive register for admin:password
  it('positive : /register', done => {
    chai.request(server).post('/register').send({
      username: "admin",
      password: "password"
    }).redirects(0).end((err, res) => {
      expect(res).to.have.status(302) // we had to stop follow redirect as 302 means it succeeded and redirects to login
      done()
    })
  })

  // Test positive login for admin:password
  it('positive : /login', done => {
    chai.request(server).post('/login').send({
      username: "admin",
      password: "password"
    }).end((err, res) => {
      expect(res).to.have.status(200)
      done()
    })
  })


  // //We are checking POST /add_user API by passing the user info in in incorrect manner (name cannot be an integer). This test case should pass and return a status 200 along with a "Invalid input" message.
  // it('Negative : /add_user. Checking invalid name', done => {
  //   chai
  //     .request(server)
  //     .post('/add_user')
  //     .send({ id: '5', name: 10, dob: '2020-02-20' })
  //     .end((err, res) => {
  //       expect(res).to.have.status(200);
  //       expect(res.body.message).to.equals('Invalid input');
  //       done();
  //     });
  // });

  it('Negative : /register', done => {
    chai.request(server).post('/register').send({
      username: "admin",
      password: "short"
    }).redirects(0).end((err, res) => {
      expect(res).to.have.status(401)
      done()
    })
  })

    // Test negative login for admin:password
    it('Negative : /login', done => {
      chai.request(server).post('/login').send({
        username: "admin",
        password: "password1"
      }).end((err, res) => {
        expect(res).to.have.status(401)
        done()
      })
    })

});


// PART B

  // Test positive for a comic that exists
  it('positive : /comics/183', done => {
    chai.request(server).get('/comics/183').end((err, res) => {
      expect(res).to.have.status(200)
      done()
    })
  })


    // Test negative for a comic that exists
    it('negative : /comics/not-a-real-comic-id', done => {
      chai.request(server).get('/comics/not-a-real-comic-id').redirects(0).end((err, res) => {
        expect(res).to.have.status(302)
        done()
      })
    })