module.exports = app => {
    const problems = require('../controllers/problems.controller')

    var router = require("express").Router();

    // Retrieve all Problems
    router.get("/", problems.findAll);

    // Update a Problems with id
    router.put("/:id", problems.update);

    app.use('/api/problems', router);
}