const express = require('express');
const app = express();
const path = require(`path`);
const bodyParser = require('body-parser');
const speech = require('@google-cloud/speech');
const fs = require('fs');
let transcription ="";  
 // Imports the Google Cloud client library
//const speech = require('@google-cloud/speech');
// Creates a client


async function main(fileName) {
  const client = new speech.SpeechClient();

  console.log("fileName=====>", fileName)
  // The name of the audio file to transcribe (input of function)
  // Reads a local audio file and converts it to base64
  const file = fs.readFileSync(fileName);
  console.log("=====>", file)
  const audioBytes = file.toString('base64');
  //console.log("audioBytes=====>", audioBytes)
  // The audio file's encoding, sample rate in hertz, and BCP-47 language code
  const audio = {
    content: audioBytes,
  };
  const config = {
    encoding: 'flac',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
  };
  const request = {
    audio: audio,
    config: config,
  };
  //console.log("request", request)
  // Detects speech in the audio file
  const [response] = await client.recognize(request);
  console.log("response.results", response.results)
  let transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  console.log(`Transcription: ${transcription}`);

  const confi = response.results
  .map(result => result.alternatives[0].confidence)
  .join('\n');
  console.log(`confidence: ${confi}`);

  // fs.writeFile("OutputTranscribe.txt", transcription + "  " + confi, function(err) {
  //   if(err) {
  //       return console.log(err);
  //   }
  // }); 
  return transcription;
}

 console.log("__dirname",__dirname, path.join(__dirname, '/public/'))
app.use('/static', express.static(path.join(__dirname, 'public')))
app.get('/submit', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/form.html'));
  });

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/getResult", function(req,res){
  return res.send("customers");
});

app.post('/submit', (req, res) => {

    console.log({
      name: req.body.name,
      message: req.body.message,
      fileName:req.body.fileName

    });
    console.log("Server has started.");
    let fileName = "./resources/" + req.body.fileName;
    console.log("fileName", fileName)
    main(fileName).then(result=>{
      console.log("!!!result====>", result);
      res.send({xxx:result});
    }).catch(console.error);
 
    
  });

app.get('/', (req, res) => {
  res.send('Ok, does it work?');
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
