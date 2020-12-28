import express from 'express';
import path from 'path';

const router = express.Router();

/* GET socket test page */
router.get('/test', (req, res) => {
    res.sendFile(path.join(`${__dirname}/../test.html`));
});

module.exports = router;
