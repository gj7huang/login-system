import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';
import User from './models/users';
import db from './config/db';
import bcrypt from 'bcrypt';


const app = express();
// const pool = mysql.createPool(db.mysql);
const [PORT = 3000, HOST = `localhost`] = [process.env.PORT, process.env.CUSTOMVAR_HOSTNAME];


app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.get('/*', function (req, res, next) {
    res.setHeader('Last-Modified', (new Date()).toUTCString());
    next();
});

// app.use('/', express.static(__dirname + '/views'));
// // app.disable("etag");

// // show index
// app.route('/')
//     .get((req, res) => {
//         res.render('index');
//     });

app.get('/showAllUser', (req, res) => {
    User.find({}).exec((err, user) => {
        if(err) {
            res.send(500, err);
        } else {
            res.send(user.map(el => { 
                return { email: el.email, student_id: el.student_id, gender: el.gender }
            }));
        }
        
    })
})

app.post('/register', (req, res) => {
    let { email, student_id, password, gender} = req.body;
    //console.log(req.body);

    bcrypt.hash(password, 10).then((hash) => {

        let newUser = new User({ 
            email: email, 
            student_id: student_id, 
            password: password, 
            token: hash,
            gender: gender
        });
        //console.log(hash);
        newUser.save(err => {
            if (err) {
                if (err.code === 11000) {
                    res.status(400).send({
                        code: 400,
                        errorMsg: 'This account already exists...'
                    });
                } else {
                    res.status(400).send({
                        code: 400,
                        errorMsg: err.message
                    });
                }
            } else {
                res.send({
                    code: 200,
                    successMsg: 'register successfully!',
                    user: {
                        token: hash,
                    }
                });
            }
        })
    })
});
app.post('/login', (req, res) => {
    let { email, password } = req.body;
    if(email && password) {
        User.findOne({
            email: email,
            //student_id: student_id
        }).exec((err, user) => {
            if(!user) {
                console.log(err);
                res.status(400).send({
                    code: 400,
                    errorMsg: 'Account doesn\'t exist...'
                });
            } else {
                if(!bcrypt.compareSync(password, user.token)) {
                    res.status(400).send({
                        code: 400,
                        errorMsg: 'Password is wrong...'
                    });
                } else {
                    let { _id, email, student_id, token, gender } = user;
                    res.status(200).send({
                        code: 200,
                        successMsg: 'Login !',
                        user: { 
                            id: _id,
                            email: email, 
                            student_id: student_id, 
                            token: token,
                            gender: gender
                        }
                    });
                }
            }
        })
    } else {
        res.status(400).send({
            code: 400,
            errorMsg: 'Email, Password must be provided...'
        });
    }
    
});


app.use((req, res, next) => {
    res.status(404).send('404!');
    next();
});

app.listen(PORT, () => console.log(`App started at http://${HOST}:${PORT}`));
