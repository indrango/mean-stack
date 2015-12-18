var jwt = require('jsonwebtoken');
var config = require('../../config');
var User = require('../models/user');

//set super secret
var superSecret = config.secret;

module.exports = function(app, express) {

  var apiRouter = express.Router();

  apiRouter.post('/authenticate', function(req, res) {
    console.log(res.body.username);

    //find user and select password
    User.findOne({
      username: req.body.username
    }).select('password').exec(function(err, user) {
      if (err) throw err;

      //no user with that username was found
      if (!user) {
        res.json({
          success: false,
          message : 'Authentication failed. User not found.'
        });
      } else if (user) {
        //check if password matches
        var validPassword = user.comparePassword(req.body.password);
        if (!validPassword) {
          res.json({
            success : false,
            message : 'Authentication failded. Wrong password.'
          });
        } else {
          //if user is found and password is right
          //create token
          var token = jwt.sign(user, superSecret, {
            expiresInMinutes : 1440
          });

          res.json({
            success : true,
            message : 'Enjoy your token!'
          });
        }
      }
    });
  });

  //route middleware to verify the token
  apiRouter.use(function(req, res, next) {
    console.log('Somebody just came to our app!');

    //check header or url parameter
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    //decode token
    if (token) {
      jwt.verify(token, superSecret, function(err, decoded) {
        if (err) {
          return res.json ({
            success: false,
            message : 'Failed to authenticate token.'
          });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      //if there is no token
      return res.status(403).send({
        success: false,
        message : 'No token provided.'
      });
    }
  });

//test route to make sure everything is working
apiRouter.get('/', function(req, res) {
  res.json({
    message: 'Yeah! welcome to our api!'
  });
});

//on route that end in /users
apiRouter.route('/users')
  //create user
  .post(function(req, res) {

    var user = new User();
    user.name = req.body.name;
    user.username = req.body.username;
    user.password= req.body.password;

    user.save(function(err) {
      if (err) res.send(err);

      res.json ({
        message : 'User created!'
      });
    });
  })

  //get all the users
  .get(function(req, res) {
    User.find(function(err, users) {
      if (err) res.send(err);
      res.json(users)
    });
  });

  //on router that end in /users/:user_id
  apiRouter.route('/users/:user_id')

    //get the user with that id
    .get(function(req, res) {
      User.findById(req.params.user_id, function(err, user) {
        if (err) res.send(err);

        res.json(user);
      });
    })

    //update the user with that id
    .put(function(req, res) {
      User.findById(req.params.user_id, function(err, user) {
        if (err) res.send(err);

        //set the new user infomation if it exist in the request
        if (req.body.name) user.name = req.body.name;
        if (req.body.username) user.username = req.body.username;
        if (req.body.password) user.password = req.body.password;

        user.save(function(err) {
          if (err) res.send(err);

          res.json({
            message : 'User update!'
          });
        });
      });
    })

    .delete(function(req, res) {
      User.remove({
        _id : req.params.user_id
      }, function(err, user) {
        if(err) res.send(err);

        res.json({
          message : 'Successfully deleted!'
        });
      });
    });

  return apiRouter;
};
