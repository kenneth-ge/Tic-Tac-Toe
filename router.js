let express = require('express');
const router = express.Router();

function setCookie(token, res) {
    const cookieOptions = {
        httpOnly: true,
        maxAge: 9000000
    }

    res.cookie(constants.token, token, cookieOptions)
}

router.get('/', (req, res) => {
    res.render('index')
})


module.exports = router;
