const mongoose = require('mongoose');
require('dotenv').config();

const LearningPlan = require('./models/LearningPlan.cjs');

mongoose.connect('mongodb://127.0.0.1:27017/edupath', { useNewUrlParser: true, useUnifiedTopology: true })
.then(async () => {
    const plan = await LearningPlan.findOne().sort({ generatedAt: -1 }).lean();
    console.log("Latest plan ID:", plan._id);
    console.log("Learning plan array:");
    console.log(JSON.stringify(plan.learningPlan, null, 2));
    process.exit(0);
})
.catch(err => {
    console.error(err);
    process.exit(1);
});
