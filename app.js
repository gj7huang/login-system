import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';
import User from './models/users';
import db from './config/db';
import bcrypt from 'bcrypt';


const app = express();
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

app.use('/', express.static(__dirname + '/views'));
// app.disable("etag");


app.route('/')
    .get((req, res) => {
        res.render('index');
    });

app.get('/showAllUser', (req, res) => {
    User.find({}).exec()
    .then((user) => {
        res.send(user.map(el => { 
            return { email: el.email, student_id: el.student_id, gender: el.gender }
        }));
    })
    .catch((err) => {
        res.send(500, err);
    })
})

app.post('/register', (req, res) => {
    let { email, student_id, password, gender} = req.body;
    // let email = req.param('email');
    // let student_id = req.param('student_id');
    // let password = req.param('password');
    // let gender = req.param('gender');
    let token;

    User.findOne({'$or': [{ email: email }, { student_id: student_id }]})
    .then((user) => {
        if(user){
            res.status(400).send({
                code: 400,
                errorMsg: 'This account already exists...'
            });
         } else {
            token = bcrypt.hashSync(password, 10);
            // console.log(token, password)
            let newUser = new User({ 
                email: email, 
                student_id: student_id, 
                password: password, 
                token: token,
                gender: gender
            });
            return newUser.save()
        }
    })
    .then((saved) => {
        res.send({
            code: 200,
            successMsg: 'register successfully!',
            user: {
                token: token
            }
        });
    })
    .catch((err) => {
        res.status(400).send({
            code: 400,
            errorMsg: `${email ? '': 'email '}${student_id ? '': 'student_id '}${password ? '': 'password '}${gender ? '': 'gender '}must be provided...`
        });
    })
    .catch((err) => {
        // console.log(err);
    })
});
app.post('/login', (req, res) => {
    let { email, password } = req.body;
    // let email = req.param('email');
    // let password = req.param('password');
    
    User
    .findOne({email: email})
    // .exec()
    .then((user) => {
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
    })
    .catch((err) => {
        if (email) 
            res.status(400).send({
                code: 400,
                errorMsg: 'This account doesn\'t exist...'
            });
        else
            res.status(400).send({
                code: 400,
                errorMsg: 'email must be provided...'
            });
    })
});

app.use((req, res, next) => {
    res.status(404).send('404!');
    next();
});

app.listen(PORT, () => console.log(`App started at http://${HOST}:${PORT}`));
