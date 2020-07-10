module.exports = app => {
    const problems = require('../controllers/problems.controller')

    var router = require("express").Router();

    // Retrieve all Problems
    router.get("/", problems.findAll);
    
    // Update a Problems with id
    router.put("/:problem_id", problems.update);

    // Retrieve a single Problem with id
    router.get("/:problem_id", problems.findOne);

    app.use('/api/problems', router);
}