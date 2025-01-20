import express from 'express';

// create express router object
const router = express.Router();

// mock some data
let cheeses = [
    { id: 1, name: 'Marble' },
    { id: 2, name: 'Camembert' },
    { id: 3, name: 'Leicester' }
];

// GET: return all cheeses
router.get('/', (req, res) => {
    return res.status(200).json(cheeses);
});

// make controller public to rest of the app
export default router;