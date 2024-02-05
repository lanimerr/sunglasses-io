const http = require('http');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server');
const expect = chai.expect;

const removeAll = function () {
  products = [];
}

chai.use(chaiHttp);
chai.should();


describe('Server API', () => {
  describe('GET brands', () => {
    it('should get all the brands', (done) => {
      chai
        .request(server)
        .get('/brands')
        .end((err, res) => {
          res.should.have.status(200);
            res.body.should.be.an('array');
            res.body.length.should.be.eql(5);
            done();
        });
    });
  });

    describe('/GET sunglasses by brand', () => {
      it('should get all sunglasses of a specific brand', (done) => {
        chai.request(server)
          .get(`/brands/:brandId/products`) 
          .end((err, res) => {
            // console.log(res.status); 
            // console.log(res.body);
            res.should.have.status(200);
            res.body.should.be.an('array');
            res.body.length.should.be.eql(0);
            done();
          });
      });
    });
  
    describe('GET sunglasses by brand', () => {
      it('should return an error if a brand with no sunglasses is entered', (done) => {  
        chai.request(server)
          .get(`/brands/3/products`) 
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
    });
  });


  describe('Products', () => {
    beforeEach(() => {
      removeAll();
    })

    //this one has an error 
  
    describe('/GET Products', () => {
      it("it should GET all of the products", done => {
        chai
        .request(server)
        .get('/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(0);
          done();
        });
      });
    });
    
    describe('/GET Products/:id', () => {  
      it("it should GET all of the products that match brandId", done => {
        chai
        .request(server)
        .get('/brands/:brandId/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(0);
          done();
        });
      });
    });
  });
  
   
describe('Login', () => {
  describe('/POST login data', () => {
    it("post all required login data", done => {
      let user = {
        "username": "greenlion235",
        "password": "waters"
      }
      chai
      .request(server)
      .post('/login')
      .send(user)
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body[0].username).to.equal('greenlion235');
        expect(res.body[0].lastUpdated).to.be.a('string');
        expect(res.body[0].token).to.have.lengthOf(16);
        const token = res.body[0].token;
        done();
      });
    });
  });
});

  describe('/GET Cart', () => {
    it("it should GET items in users cart", done => {
      let user = {
        "username": "greenlion235",
        "password": "waters"
      }
      let agent = chai.request.agent(server)
      agent
      .post('/login')
      .send(user)
      done()

      .then(function (res) {
        const token = res.body[0].token;
        expect(res).to.have.cookie(token)
        return agent.get('/me/cart')
        .then(function (res) {
           expect(res).to.have.status(200);
           agent.close();
        });
    });
  });
});

  describe('/POST Cart', () => {
    it("it should POST an item in users cart", done => {
      let user = {
        "username": "greenlion235",
        "password": "waters"
      }
      let agent = chai.request.agent(server)
      agent
      .post('/login')
      .send(user)
      done()

      .then(function (res) {
        const token = res.body[0].token;
        expect(res).to.have.cookie(token)
        return agent.post('/me/cart')
        .then(function (res) {
           expect(res).to.have.status(201);
           expect(res).to.be.an('array');
           agent.close();
        });
    });
  });
});

  describe('/DELETE Cart/productId', () => {
    it("it should DELETE an item in users cart", done => {
      let user = {
        "username": "greenlion235",
        "password": "waters"
      }
      let agent = chai.request.agent(server)
      agent
      .post('/login')
      .send(user)
      done()

      .then(function (res) {
        const token = res.body[0].token;
        expect(res).to.have.cookie(token)
        return agent.delete('/me/cart/:productid')
        .then(function (res) {
           expect(res).to.have.status(201);
           expect(res).to.be.an('array');
           agent.close();
        });
    });
  });
});

  describe('/POST Cart/productId', () => {
    it("it should Update the quantity of an item in users cart", done => {
      let user = {
        "username": "greenlion235",
        "password": "waters"
      }
      let agent = chai.request.agent(server)
      agent
      .post('/login')
      .send(user)
      done()

      .then(function (res) {
        const token = res.body[0].token;
        expect(res).to.have.cookie(token)
        return agent.post('/me/cart/:productid')
        .then(function (res) {
           expect(res).to.have.status(201);
           expect(res).to.be.an('array');
           agent.close();
           done();
        });
    });
  });
});


//mocha test/server.test.js
