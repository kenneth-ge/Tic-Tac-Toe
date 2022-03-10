let express = require('express');
let path = require('path')
let router = require('./router')
let fs = require('fs')

const app = express();

const middleware = [
    express.static('public')
];

app.use(middleware)
express.static('public')
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use('/', router)

//Failsafe for unauthorized pages
app.use((req, res, next) => {
    res.status(404).render("error", {
        code: "404",
        reason: "Page Not Found",
        description: "The page you are looking for does not exist."
    })
})

app.listen(8080)