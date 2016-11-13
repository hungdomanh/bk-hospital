var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send("Wellcome: "+req.session.username);
});



module.exports = router;
