const express = require('express');
const fs = require("fs");
const { Configuration, OpenAIApi } = require("openai");
const bodyParser = require('body-parser');
require('dotenv').config()
const app = express();
app.use(bodyParser.json());
const multer = require('multer');
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: function (req, file, cb) {
        cb(null, Date.now() + '.mp3');
    }
});
// const upload = multer({ dest: 'uploads/' });
const upload = multer({ storage: storage });

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function uploadData() {
    try {
        const response = await openai.createFile(
            fs.createReadStream('./data_prepared.jsonl'),
            "fine-tune"
        );
        console.log('File ID: ', response.data.id)
    } catch (err) {
        console.log('err: ', err)
    }
}
async function createFineTune() {
    try {
        const response = await openai.createFineTune({
            training_file: 'file-MeR1FtyrJQVQ8IcDH5FMxCfr',
            model: 'davinci'
        })
        console.log('response: ', response)
    } catch (err) {
        console.log('error: ', err.response.data.error)
    }
}
async function listFineTunes() {
    try {
        const response = await openai.listFineTunes()
        console.log('data: ', response.data.data)
    } catch (err) {
        console.log('error:', err)
    }
}
// listFineTunes();
// uploadData();
// createFineTune();

app.post('/api', async (req, res) => {
    const api_key = req.headers.authorization?.split(" ")[1];
    if (api_key === process.env.OPENAI_API_KEY) {
        const { transcript } = req.body;
        await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `Given the following medical transcript, extract and fill in the relevant information under the following headings:
                    
                    Desired format:
                        <h4>History of Present Illness:</h4> 
                            """ """
                        <h4>Medications:</h4>
                            """ """
                        <h4>Allergies:</h4>
                            """ """ 
                        <h4>Past Medical History:</h4>
                            """ """ 
                        <h4>Social History:</h4>
                            """ """
                        <h4>Family History:</h4>
                            """ """ 
                        <h4>Review of Systems:</h4>
                            <h6> - Cardiovascular:</h6>
                                """ """ 
                            <h6> - Respiratory:</h6>
                                """ """ 
                            <h6> - Gastrointestinal:</h6>
                                """ """ 
                            <h6> - Genitourinary:</h6>
                                """ """ 
                            <h6> - Neurologic:</h6>
                                """ """ 
                            <h6> - Endocrine:</h6>
                                """ """ 
                        <h4>Physical Examination:</h4> 
                            <h6> - Vital Signs:</h6>
                                """ """
                            <h6> - General:</h6>
                                """ """
                            <h6> - Cardiovascular:</h6>
                                """ """
                            <h6> - Pulmonary:</h6>
                                """ """
                            <h6> - Abdomen:</h6>
                                """ """
                            <h6> - Extremities:</h6>
                                """ """
                            <h6> - Neurologic:</h6>
                                """ """
                        <h4>Lab Results:</h4>
                            <h6> - HbA1c:</h6>
                                """ """
                            <h6> - Fasting blood glucose:</h6>
                                """ """
                            <h6> - Lipid panel:</h6>
                                """ """
                            <h6> - Kidney function tests:</h6>
                                """ """
                            <h6> - Urine microalbumin:</h6>
                                """ """
                        <h4>Assessment and Plan:</h4>
                            <h6> - Hypertension:</h6>
                                """ """
                            <h6> - Diabetes Mellitus:</h6>
                                """ """
                            <h6> - Hyperlipidemia:</h6>
                                """ """
                            <h6> - Diet/Exercise:</h6>
                                """ """
                            <h6> - Follow-Up:</h6>
                                """ """
                        
                        Text (Medical Transcript): ${transcript}.`,
            temperature: 1,
            max_tokens: 2048
        }).then((response) => {
            console.log(response.data);
            res.status(200).json(response.data.choices[0].text);
        }).catch((error) => {
            res.status(500).json({ 'error': error + "Please Try Again!" });
            console.log(error);
        });
    } else {
        res.status(500).json({ error: 'Invalid API KEY' });
    }
});
app.post('/api/test', async (req, res) => {
    const api_key = req.headers.authorization?.split(" ")[1];
    if (api_key === process.env.OPENAI_API_KEY) {
        // const { input } = req.body;
        await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `Given the following medical transcript, extract and fill in the relevant information under the following headings:
                    
                    Desired format:###
                        <h4>History of Present Illness:</h4> 
                        <h4>Medications:</h4>
                        <h4>Allergies:</h4> 
                        <h4>Past Medical History:</h4> 
                        <h4>Social History:</h4>
                        <h4>Family History:</h4> 
                        <h4>Review of Systems:</h4>
                            <h6>Cardiovascular:</h6> 
                            <h6>Respiratory:</h6> 
                            <h6>Gastrointestinal:</h6> 
                            <h6>Genitourinary:</h6> 
                            <h6>Neurologic:</h6> 
                            <h6>Endocrine:</h6> 
                        <h4>Physical Examination:</h4> 
                            <h6>Vital Signs:</h6>
                            <h6>General:</h6>
                            <h6>Cardiovascular:</h6>
                            <h6>Pulmonary:</h6>
                            <h6>Abdomen:</h6>
                            <h6>Extremities:</h6>
                            <h6>Neurologic:</h6>
                        <h4>Lab Results:</h4>
                            <h6>HbA1c:</h6>
                            <h6>Fasting blood glucose:</h6>
                            <h6>Lipid panel:</h6>
                            <h6>Kidney function tests:</h6>
                            <h6>Urine microalbumin:</h6>
                        <h4>Assessment and Plan:</h4>
                            <h6>Hypertension:</h6>
                            <h6>Diabetes Mellitus:</h6>
                            <h6>Hyperlipidemia:</h6>
                            <h6>Diet/Exercise:</h6>
                            <h6>Follow-Up:</h6>
                        ###
                        Text (Medical Transcript): ${transcript}.`,
            temperature: 1,
            max_tokens: 2048
        }).then((response) => {
            console.log(response.data.choices[0].text);
            res.status(200).json(response.data.choices[0].text);
        }).catch((error) => {
            res.status(500).json({ 'error': error + "Please Try Again!" });
            console.log(error);
        });
    } else {
        res.status(500).json({ error: 'Invalid API KEY' });
    }
});
app.post('/api/getTranscript', upload.single('audio'), async (req, res) => {
    const api_key = req.headers.authorization?.split(" ")[1];
    if (api_key === process.env.OPENAI_API_KEY) {
        const audio = req.file.path;
        await openai.createTranscription(fs.createReadStream(audio), "whisper-1").then((response) => {
            res.status(200).json(response.data.text);
        }).catch((error) => {
            res.status(500).json({ 'error': error });
        });
    } else {
        res.status(500).json({ 'error': 'Invalid API KEY' });
    }
});
app.listen(80);
