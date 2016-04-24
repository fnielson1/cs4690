var express = require('express');
var router = express.Router();
var redis = require('redis');
var client = redis.createClient();

//REST API V2 calls go here.
router.get('/api/v2/entries.json', function(req, res) {
    client.keys('*', function (err, keys) {
        if (err) throw err;

        var rows = [];
        var setStatus = function () {
            res.status(200).json(rows);
        };

        keys.forEach(function(key, index) {
            client.hgetall(key, function (err, row) {
                if (err) throw err;
                rows.push(row);
                if (index == keys.length - 1)
                    setStatus(); // Don't set our status and return until the rows have been populated
            });
        });
        if (keys.length == 0)
            setStatus(); // Set our status if there are no keys
    });
});

// Create
router.post('/api/v2/entries.json', function(req, res){
    // Store new entry and return id.
    // {"subject":"Something else","contents":"This is the contents for 'Something else'"}
    var id = Date.now().toString();
    var subject = req.body.subject;
    var contents = req.body.contents;
    var jsonObj = {'_id': id, 'subject': subject, 'contents': contents};
    console.log(`created: ${id}, ${subject}, ${contents}`);
    client.hmset(id, jsonObj, function(err, result){
        if(err) throw err;
        res.status(201).json(id);
    });
});

// Read
router.get('/api/v2/entries/:id.json', function(req, res){
    var id = req.params.id;
    console.log(`select id, subject, contents from entries_table where id = ${id}`);
    client.hgetall(id, function(err, result){
        if(err) throw err;
        res.status(200).json(result);
    });
});

// Update
router.put('/api/v2/entries/:id.json', function(req, res){
    var id = req.params.id;
    var subject = req.body.subject;
    var contents = req.body.contents;

    var jsonObj = {'_id': id, 'subject': subject, 'contents': contents};
    console.log(`updated: ${id}, ${subject}, ${contents}`);
    client.hmset(id, jsonObj, function(err, result){
        if(err) throw err;
    });
    console.log('Update called');
    res.sendStatus(204);
});

// Delete
router.delete('/api/v2/entries/:id', function(req, res){
    var id = req.params.id;
    client.del(id, function(err, result){
        if(err) throw err;
    });
    console.log('Delete called');
    res.sendStatus(204);
});

module.exports = router;
// END REAST API V2 CALLS.
