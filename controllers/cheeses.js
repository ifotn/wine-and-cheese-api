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

// GET: {id} return selected cheese by id
router.get('/:id', (req, res) => {
    let index = cheeses.findIndex(c => c.id == req.params.id);

    if (index == -1) {
        return res.status(404).json({ msg: 'Not Found' });
    }

    return res.status(200).json(cheeses[index]);
});

// POST: add new cheese from POST body
router.post('/', (req, res) => {
    cheeses.push(req.body);

    return res.status(201).json();  // 201: resource created
});

// make controller public to rest of the app
export default router;