const { response } = require('express')
const express = require('express')
const mysql = require("mysql2")
const config = require("./config")
request = require('request')

const app = express()

// Check for a heroku port
app.set('port', (process.env.PORT || 5000));

app.set('view engine', 'ejs')
app.use(express.urlencoded({extended:false}))

// On start up render index ejs file with 3 context inputs: msg, link, error
app.get('/', (req, res)=>{
    res.render('index',{msg:"small Link will be here", link: '/', error:null})
})

// Takes short url from link parameter and searches database for item. If shorturl present return long url and redirect to there. Else throw an error and pass to frontend
app.get('/app/:shorturl', (req, res)=>{
    let shorturlid = req.params.shorturl;
	let sql = `SELECT * FROM url WHERE ShortUrl='${shorturlid}' LIMIT 1`;
	const conn = mysql.createConnection(config.db)
	conn.query(sql,function(err, results, fields) {
		if (err){
			console.log(err)
		}
		else{
			if (results.length!=0){
				console.log('helo')
				res.redirect(results[0].LongUrl)
			}else{
				res.render('index',{msg:shorturlid, link:`/app/${shorturlid}`, error:'ShortURL not in Database'})
			}
		}
	});
    conn.end()    
})

app.post('/shrinkedURLs', async(req, res)=>{
    let uniqueID = Math.random().toString(36).replace(/[^a-z0-9]/gi,'').substring(2,10)
    let sql = `INSERT INTO url(LongUrl, ShortUrl) VALUES('${req.body.fullurl}','${uniqueID}');`
    const conn = mysql.createConnection(config.db)
	// simple query
	conn.query(sql,function(err, results, fields) {
		if (err){
			console.log(err)
		}
	});

    conn.end()
    res.render('index',{msg:uniqueID, link:`/app/${uniqueID}`, error:null})
})

// Listen on assigned port
app.listen(app.get('port'), function () {
    console.log('listening on port ' + app.get('port'));
});