var express = require('express');
var router = express.Router();
var cassandra = require('cassandra-driver');
var Uuid = cassandra.types.Uuid;
var client = new cassandra.Client({contactPoints: ['127.0.0.1'], keyspace: 'test'});

//REST API V2 calls go here.
router.get('/api/v2/entries.json', function(req, res) {
    client.execute('select id, subject from entries_table', function(err, result){
        if(err) throw err;
        res.status(200).json(result.rows);
    });
});

// Create
router.post('/api/v2/entries.json', function(req, res){
    // Store new entry and return id.
    // {"subject":"Something else","contents":"This is the contents for 'Something else'"}
    var id = Uuid.random(); //new uuid v4
    var subject = req.body.subject;
    var contents = req.body.contents;
    console.log(`insert into entries_table(id, subject, contents) values (${id}, '${subject}', '${contents}')`);
    client.execute(`insert into entries_table(id, subject, contents) values (${id}, '${subject}', '${contents}')`, function(err, result){
        if(err) throw err;
        res.status(201).json(id.toString());
    });
});

// Read
router.get('/api/v2/entries/:id.json', function(req, res){
    var id = Uuid.fromString(req.params.id);
    console.log(`select id, subject, contents from entries_table where id = ${id}`);
    client.execute(`select id, subject, contents from entries_table where id = ${id}`, function(err, result){
        if(err) throw err;
        var row = result.rows[0];
        row._id = row.id; // Make it compatible with our controller
        delete row.id; // Get rid of the extra property
        res.status(200).json(row);
    });
});

// Update
router.put('/api/v2/entries/:id.json', function(req, res){
    var id = Uuid.fromString(req.params.id);
    var subject = req.body.subject;
    var contents = req.body.contents;

    console.log(`update entries_table set subject = '${subject}', contents = '${contents}' WHERE id = ${id}`);
    client.execute(`update entries_table set subject = '${subject}', contents = '${contents}' WHERE id = ${id}`, function(err, result){
        if(err) throw err;
    });
    console.log('Update called');
    res.sendStatus(204);
});

// Delete
router.delete('/api/v2/entries/:id', function(req, res){
    var id = Uuid.fromString(req.params.id);
    client.execute(`delete from entries_table where id = ${id}`, function(err, result){
        if(err) throw err;
    });
    console.log('Delete called');
    res.sendStatus(204);
});

module.exports = router;
// END REAST API V2 CALLS.
