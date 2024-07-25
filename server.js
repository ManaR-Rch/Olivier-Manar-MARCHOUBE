var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var path = require('path');
var mysql= require('mysql2');
const nodemailer = require('nodemailer');
const session = require('express-session'); // Importer express-session
const flash = require('connect-flash'); // Importer connect-flash  

/*-------------------------*/

var app = express();

app.use(bodyParser());
app.use(cors());
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({ extended: true }));
/*__dirname = path.resolve();*/ 

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


/*----------------------------------*/
// Configuration de session et de flash
app.use(session({
    secret: '123456',
    resave: false,
    saveUninitialized: true
  }));
  app.use(flash());
  
  // Middleware pour injecter les messages flash dans les vues
  app.use((req, res, next) => {
    res.locals.message = req.flash('message');
    next();
  });

/*----------------LOGIN--------------------*/
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Ycode@2021',
    database: 'bref'
    });
    //Établir la connexion à la base de données et afficher un message de confirmation
    db.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');
    });


// Nodemailer Transporter Configuration
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'hananeassia202@gmail.com',
//         pass: 'assia123456789'
//     }
// });

//-------------------------------
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    
    db.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error('Erreur lors de la requête de connexion :', err);
            // req.flash('error', 'Erreur lors de la connexion : ' + err.message);
            // return res.redirect('/login');
            return res.status(500).send('Erreur lors de la connexion : ' + err.message);
        }
  
        if (results.length > 0) {
            const user = results[0];
            if (user.role === 'admin') {
                res.redirect('/agenda');
            } else {
                res.redirect('/index');
            }
        } else {
            console.log('E-mail ou mot de passe incorrect.');
            req.flash('error', 'E-mail ou mot de passe incorrect.');
            res.redirect('/login');
        }
    });
});


  /*-------------------------sign up --------------------------*/

  app.post('/sign', (req, res) => {
    const { nom, email, password } = req.body;
  
    // Vérifier si l'email existe déjà en base de données
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Erreur lors de la vérification de l\'email :', err);
            req.flash('error', 'Erreur lors de la vérification de l\'email.');
            return res.redirect('/sign');
        }
  
        if (results.length > 0) {
            // L'email existe déjà en base de données
            // return res.send('E-mail déjà enregistré.');
             req.flash('error', 'E-mail déjà enregistré.');
             return res.redirect('/sign');
        } else {
            var role = 'user';
            // L'email n'existe pas en base de données, procéder à l'inscription
            const insertSql = 'INSERT INTO users (nom, email, password, role) VALUES (?, ?, ?, ?)';
            db.query(insertSql, [nom, email, password, role], (err, result) => {
                if (err) {
                    console.error('Erreur lors de l\'inscription de l\'utilisateur :', err);
                    req.flash('error', 'Erreur lors de l\'inscription de l\'utilisateur.');
                    return res.redirect('/sign');
                }
                console.log('Utilisateur inscrit avec succès.');
                req.flash('msg', 'Inscription réussie ! Connectez-vous maintenant.');
                res.redirect('/login');
            });
        }
    });
});

/*-------------------------------------------------Products-------------------------------------*/

app.get('/index', (req, res) => {
    // Example SQL query to fetch products from your database
    const sql = 'SELECT * FROM products_table';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Render the 'index' template and pass products data to it
        res.render('index', { products: results });
    });
});

app.post('/purchase', (req, res) => {
    const { to, subject, text } = req.body;

    transporter.sendMail({
        from: 'hananeassia202@gmail.com',
        to: to,
        subject: subject,
        text: text
    }, (error, info) => {
        if (error) {
            console.error('Erreur lors de l\'envoi de l\'email :', error);
            res.status(500).send('Erreur lors de l\'envoi de l\'email');
        } else {
            console.log('Email envoyé :', info.response);
            res.send('Email envoyé avec succès');
        }
    });
});


  /*-----------------------------------*/
  app.get('/api/timeline', (req, res) => {
    const query = 'SELECT * FROM timeline ORDER BY date DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching timeline data:', err);
            res.status(500).send('Error fetching data');
            return;
        }
        res.json(results);
    });
});

/*---------------------------------*/
app.get('/agenda',(req,res)=>{
    res.render('agenda');
});
app.get('/', function(request, response){
    response.render('login');
});
app.get('/login', function(request, response){
    response.render('login');
});

app.get('/sign', function(request, response){
    response.render('sign');
});
app.get('/index', function(request, response){
    response.render('index');
});

app.get('/stade', function(request, response){
    response.render('stade');
});
app.get('/fertilisation', function(request, response){
    response.render('fertilisation');
});

app.listen(3004, function(){
    console.log("heard on 3004");
});