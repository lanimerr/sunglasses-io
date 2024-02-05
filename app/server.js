const http = require('http');
const fs = require('fs');
const bodyParser = require('body-parser');
const uid = require('rand-token').uid;
const chai = require('chai');
const chaiHttp = require('chai-http');
const Router = require('router');
const queryString = require('querystring');
const { url } = require('url');
const router = Router();
const finalHandler = require('finalhandler');

let accessToken = [];
chai.use(chaiHttp);

//state variables
const PORT = 3001;
let brands = [];
let users = [];
let products = [];

// Setup router

router.use(bodyParser.json());

const server = http.createServer(function (req, res) {
  	router(req, res, finalHandler(req, res))
}).listen(PORT, () => {
  console.log("Node is running on 3001")
});

//Load data
fs.readFile("./initial-data/brands.json", "utf8", (error, data) => {
  if (error) throw error;
  brands = JSON.parse(data);
  console.log(`Server setup: ${brands.length} brands loaded`)
});

fs.readFile("./initial-data/products.json", "utf8", (error, data) => {
  if (error) throw error;
  products = JSON.parse(data);
  console.log(`Server setup: ${products.length} products loaded`)
});

fs.readFile("./initial-data/users.json", "utf8", (error, data) => {
  if (error) throw error;
  users = JSON.parse(data);
  console.log(`Server setup: ${users.length} users loaded`)
});

//Setting up routers
router.get('/brands', function(req, res) {
  if(!brands) {
    res.writeHead(404, "Nothing to return");
  }
  res.writeHead(200, {"Content-Type": "application/json"});
  return res.end(JSON.stringify(brands));
});


router.get('/products', function(req, res) {
  if(!products) {
    res.writeHead(404, "Nothing to return");
  };
res.writeHead(200, {"Content-Type": "application/json"});
return res.end(JSON.stringify(products));
});


router.get('/brands/:brandId/products', function(req, res) {
  let {brandId} = req.params;
  if (brandId > 5) {
    res.writeHead(400, "No parameter with that ID")
    return res.end("No brand with that id please choose 1 through 5")
  }

  let match = [];
  let getProduct = function (brand, product, parameter) {
    let myParam = parameter.toString();
    product.forEach(prod => {
     let myBrand = brand.find(e =>
       e.id === prod.categoryId);
       if (myBrand.id === myParam) {
         match.push(myBrand.name)
         match.push(prod.name)
         match.push(prod.price)
         match.push(prod.description)
         match.push(prod.imageUrls)
       }
   })
  }

   getProduct(brands, products, brandId);
  products = match;
  console.log(products)
  res.writeHead(200, {"Content-Type": "application/json"});
  return res.end(JSON.stringify(products));


})

router.post('/login', function(req, res)  {
  if (req.body.username && req.body.password) {
    let user = users.find((user) => {
      return user.login.username == req.body.username && user.login.password == req.body.password;
    });

    if (user) {
      let newUserAuth = {
        username: user.login.username,
        lastUpdated: new Date(),
        token: uid(16)
      }
      accessToken.push(newUserAuth);
      console.log(JSON.stringify(accessToken));
      console.log(newUserAuth)
      console.log(accessToken[0])
      let match = users.find(user => user.username === accessToken.username)
      console.log(match.cart);
      res.writeHead(200, {"Content-Type": "application/json"});
      return res.end(JSON.stringify(accessToken));
    } else {
      res.writeHead(401, "Invalid Login");
      return res.end();
    }
  } else {
    res.writehead(400, "Incorrect format");
    return res.end();
  }
})

router.get("/me/cart", function (req, res) {
  let authUser = users.find(user => user.username === accessToken.username)

  if (authUser) {
    res.writeHead(200, "Access granted")
    return res(JSON.stringify(authUser.cart))
  } else {
    res.writeHead(401, "Unauthorized to access shopping cart");
    return res.end();
  }
})

router.post('/me/cart', function (req, res) {
  let authUser = users.find(user => user.username === accessToken.username)

  let product = products.find((p) => {
    return p.id && p.categoryId && p.price;
  })

  console.log(users)

  if (authUser) {
    let cart = authUser.cart;
    cart.push(product)
    res.writeHead(201, "Access granted")
    return res(JSON.stringify(cart))
  } else {
    res.writeHead(401, "Unauthorized to access shopping cart");
    return res.end();
  }
});

router.delete('/me/cart/:productid', function (req, res) {
  let {productid} = req.params;
  let stringProduct = productid.toString();
  
  let authUser = users.find(user => user.username === accessToken.username)

  let cart = authUser.cart;
  let index = cart.indexOf(stringProduct);

  if (authUser) {
    let newCart = cart.splice(index);
    res.writeHead(200, "Access granted")
    return res(JSON.stringify(newCart))
    } else {
      res.writeHead(401, "Unauthorized to access shopping cart");
      return res.end();
    }
})

router.post('/me/cart/:productid', function (req, res) {
  let {productid} = req.params;
  let stringProduct = productid.toString();

  let productToEdit = products.filter(p => {
    return p.id === stringProduct;
  })
  
  let authUser = users.find(user => user.username === accessToken.username)

  let cart = authUser.cart;


  if (authUser) {
    let addCart = cart.push(productToEdit);
    res.writeHead(200, "Access granted")
    return res(JSON.stringify(addCart))
    } else {
      res.writeHead(401, "Unauthorized to access shopping cart");
      return res.end();
    }
})

module.exports = server;

   