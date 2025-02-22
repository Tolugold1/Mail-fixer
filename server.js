require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const EmailDomainFixer = require("./EmailFixerFile");

const defaultMails = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"]
const fixer = new EmailDomainFixer(defaultMails);

const app = express();
app.use(express.json());

// connect to DB
mongoose.connect(process.env.MONGO_DB)
.then(res => {
    console.log("Connected to database Mongodb")
}).catch(err => console.log("Error connecting to database", err));

// create a test model
const EmailModel = mongoose.Schema({
    email: { type: String}
});

const Email = mongoose.model("email", EmailModel);

// create an endpoint to add email
app.post("/addMail", async (req, res, next) => {
    const { email } = req.body;
    const newEmail = new Email({ email });
    await newEmail.save();
    res.status(200).json({
        message: "Mail added successfully"
    });
});

// create an endpoint to correct/fix email
app.put("/fixMails", async (req, res, next) => {
    let emails = await Email.find({});
    let fixedEmail = emails.map(emailObj => {
        let correctedEmail = fixer.correctEmail(emailObj.email);
        return { oldMail: emailObj.email, correctMail: correctedEmail };
    });
    // update the database
    for (const { oldMail, correctMail} of fixedEmail) {
        if (oldMail !== correctMail) {
            // then update
            await Email.updateOne({ email: oldMail }, { $set: { email: correctMail }})
        }
    }

    res.status(200).json({
        message: "Mails corrected successfully."
    })
});

app.listen(4000, () => console.log("server listening on port 4000"));
