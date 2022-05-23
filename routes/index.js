var express = require('express');
var coockie = require('cookie-parser')
const { send } = require('process');
const app = require('../app');
// const data = require("../data.json")
const { json } = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('todo.db')

// TODO: check sqlite at work for progress
// TODO: build SQL database

// ------------------------------* GET home page. * -----------------------------
router.get('/', function(req, res, next) {
    const sql = db.all('SELECT * FROM todo WHERE user_id = 1', (err, rows) => {
        if (err) {
            throw err
        }
        res.render('index', {
            title: "Manage your task's",
            toList: rows,
            csslink: '../stylesheets/style.css',
            jslink: '/javascripts/index.js'
        });
    });
})

// --------------------- POST FOR PRIORITY CHANGE ---------------------------------
router.post("/priority", (req, res, next) => {
    db.run(`UPDATE todo
            SET priority = ?
            WHERE id = ?`,
            req.body.priority, req.body.id)
        // res.render('index', { title: "Manage your task's", toList: data });
})

// -------------------- POST METHOD DELETE LIST ITEM HANDLER -----------------------
router.post('/handle', (req, res, next) => {
    db.run(`DELETE FROM todo 
            WHERE id = ?`,
        req.body.itemId)
})

// ------------------- POST METHOD FOR ADDING ITEMS TO LIST HANDLER ----------------
router.post('/addItem', (req, res, next) => {

    console.log("im inside the additem")
    db.serialize(() => {
        const stmt = db.prepare(`INSERT INTO todo
                                 (task, priority) 
                                 VALUES('${req.body.content}',1)`)
        stmt.run()
        stmt.finalize()
    })
})

// ------------------------- REGISTER AND LOGIN HANDLING ----------------------------------

router.post('/enter', function(req, res, next) {
    const data = db.get(`SELECT id, email, hash_password From users WHERE email = ?`, [req.body.email], (err, data) => {
        if (err) { throw err }
        if (req.body.pass == data.hash_password) {

            console.log(data);
            res.redirect('/')
        } else {
            console.log("pass not match");
            res.redirect('/login')
        }
    })


})

router.post('/register', function(req, res, next) {

    db.run(`INSERT INTO users fname, lname, email, country, hash_password VALUES(?,?,?,?,?);`, [req.body.fname, req.body.lname, req.body.email, req.body.country, req.body.pass])

    console.log('im in register func');
    console.log(req.body);
    res.redirect('/')
})

module.exports = router;