module.exports = (sequelize, Sequelize) => {
    const Problems = sequelize.define("problems", {
      problem_id: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      tags: {
        type: Sequelize.STRING
      },
      difficulty: {
        type: Sequelize.INTEGER
      },
      number_solved: {
        type: Sequelize.STRING
      },
      page_url: {
        type: Sequelize.STRING
      },
      time_limit: {
        type: Sequelize.FLOAT
      },
      memory_limit: {
        type: Sequelize.STRING
      },
      completed: {
        type: Sequelize.BOOLEAN
      },
      completion_date: {
        type: 'TIMESTAMP'
      },
      completion_time: {
        type: Sequelize.TIME
      }
    }, {
      timestamps: false
    });
  
    return Problems;
};