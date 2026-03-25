require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('../src/models/Job');
const Company = require('../src/models/Company');

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const jobs = await Job.find({ $or: [{ companyId: { $exists: false } }, { companyId: null }] });
  console.log('Jobs with missing companyId:', jobs.length);

  for (const job of jobs) {
    if (!job.company) {
      console.log('Skipping job missing company name:', job._id);
      continue;
    }

    const company = await Company.findOne({ companyName: { $regex: new RegExp('^' + job.company + '$', 'i') } });
    if (company) {
      job.companyId = company._id;
      await job.save();
      console.log('Updated', job._id, 'with', company._id);
    } else {
      console.log('No matching company for job', job._id, 'companyName', job.company);
    }
  }

  mongoose.disconnect();
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});