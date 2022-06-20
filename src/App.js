import logo from './burger.jpg';
import './App.css';
import React from 'react';
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

function App() {
  const client = new PollyClient({ region: "eu-central-1", credentials: {accessKeyId: 'AKIARGDHLEABIQFE2KFB', secretAccessKey: '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'}});
  const imageClick = async (str) => {

    // This code is not from Manu ! :D 
      try {
        const params = {
          OutputFormat: "mp3",
          Text: str,
          VoiceId: "Raveena",
        };
        const command = new SynthesizeSpeechCommand(params);
        const uIn8Array = []
        const response = await client.send(command)
        const reader = response.AudioStream.getReader()

        const audioContext = new AudioContext();
        const source = audioContext.createBufferSource()

        // "done" is a Boolean and value a "Uint8Array"
        new Promise((resolve, _reject) => {
          new ReadableStream({
            start(controller) {
              function push() {
                reader.read().then( async ({ done, value }) => {
                  // If there is no more data to read
                  if (done) {
                    resolve(uIn8Array)
                    controller.close();
                    return;
                  }
                  // Get the data and send it to the browser via the controller
                  controller.enqueue(value);
                  uIn8Array.push(value.buffer)
                  push();
                })
              }
              push()
            }
          })
        }).then(async (result) => {
          const concatenated = await new Blob(result.flat()).arrayBuffer()
          source.buffer = await audioContext.decodeAudioData(concatenated);
          source.connect(audioContext.destination);
          source.start();
        })
      } catch (err) {
          console.log("Error putting object", err);
      }
    }

    return (
    <div className="App">
      <header className="App-header">
        <img src={logo} width={400} alt="burger" onClick={() => imageClick('burger')} />
      </header>
    </div>
  );
}

export default App;