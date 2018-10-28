var express = require('express');
var router = express.Router();
//const x509 = require('x509');
var fs = require('fs');
var crypto = require('crypto');


router.get('/', function (req, res) {
	//res.setHeader('Content-Type', 'application/json');
	res.json({"message":"Welcome to Monomer!.."});
});

router.get('/:identity', function (req, res) {
	var content = fs.readFileSync('./keys/server.crt', 'utf8');
	var hash = crypto.createHash('sha256').update(content).digest('hex');
	return res.json({'key': hash});
});

module.exports = router;
