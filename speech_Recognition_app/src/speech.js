window.SpeechRecognition =
    window.webkitSpeechRecognition || window.SpeechRecognition;

const recognition = new SpeechRecognition();
const icon = document.querySelector("i.fa.fa-microphone");

const earIcon = document.querySelector("i.fa.fa-assistive-listening-systems");

const sound = document.querySelector(".sound");
const input = document.querySelector("#input_box");
const loader = document.querySelector("#loading");

let flag = "";

icon.addEventListener("mousedown", e => {
    if (e.type == "mousedown") {
        //code triggers on hold
        console.log("hold");
        flag = "hold";
        recognition.abort();
        input.value = "";
        loader.style.display = "block";
        sound.play();
        dictate();
    }
});

icon.addEventListener("mouseup", e => {
    if (e.type == "mouseup") {
        //code triggers on hold done
        console.log("hold cancel");
        loader.style.display = "none";
        stopDictate();
    }
});

earIcon.addEventListener("dblclick", e => {
    if (e.type == "dblclick") {
        //code triggers on hold
        console.log("double click");
        flag = "dbclick";
        sound.play();
        dictate();
    }
});

/* for speech synthesis */
/* main function to speak the content */
const synth = window.speechSynthesis;

const speak = action => {
    utterThis = new SpeechSynthesisUtterance(action());
    synth.speak(utterThis);
};
/* for speech synthesis we have to pass the speech to utter to the speechRecognition.speak() function. */

const dictate = () => {
    /* for speech recognition (speech to text)*/

    loader.style.display = "block";
    recognition.start();
    console.log("flag: ", flag);
    if (flag == "hold") {
        recognition.onresult = event => {
            console.log("result: ", event);
            const speechToText = event.results[0][0].transcript;
            /* for speech synthesis (text to speech)*/
            if (event.results[0].isFinal) {
                loader.style.display = "none";
                // paragraph.textContent = speechToText;

                input.value = speechToText;

                wikiSearch(speechToText);

                // if (speechToText.includes("what is the time")) {
                //     speak(getTime);
                // } else if (speechToText.includes("what is today's date")) {
                //     speak(getDate);
                // } else if (speechToText.includes("how is the weather in")) {
                //     getTheWeather(speechToText);
                // } else {
                //     // speak(something);
                //     wikiSearch(speechToText);
                // }
            }
        };
    } else if (flag == "dbclick") {
        loader.style.display = "none";
        utter(input.value);
    }
};

const utter = speechToText => {
    utterThis = new SpeechSynthesisUtterance(`${speechToText}`);
    synth.speak(utterThis);
};

const wikiSearch = speechToText => {
    let text = "";
    if (speechToText.split(" ").length > 1) {
        speechToText.split(" ").forEach(element => {
            text = element + "+" + text;
        });
    } else {
        text = speechToText;
    }

    let searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${text}&format=json`;
    fetch(searchUrl)
        .then(function(response) {
            console.log("response from google search api: ", response);
            return response.json();
        })
        .then(function(searchResult) {
            console.log("search result object: ", searchResult);

            utterThis = new SpeechSynthesisUtterance(
                `${searchResult.query.search[0].snippet}`
            );
            synth.speak(utterThis);
        });
};

// const something = () => {
//     return `i am not able to understand you. Please try something else.`;
// };

const getTime = () => {
    const time = new Date(Date.now());
    return `the time is ${time.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true
  })}`;
};

const getDate = () => {
    const time = new Date(Date.now());
    return `today is ${time.toLocaleDateString()}`;
};

const getTheWeather = speech => {
    fetch(
            `http://api.openweathermap.org/data/2.5/weather?q=${speech.split(" ")[5]}
            &appid=58b6f7c78582bffab3936dac99c31b25&units=metric`
        )
        .then(function(response) {
            console.log("response from get thunder: ", response);
            return response.json();
        })
        .then(function(weather) {
            console.log("weather object: ", weather);
            if (weather.cod === "404") {
                utterThis = new SpeechSynthesisUtterance(
                    `I cannot find the weather for ${speech.split(" ")[5]}`
                );
                synth.speak(utterThis);
                return;
            }

            utterThis = new SpeechSynthesisUtterance(
                `the weather condition in ${weather.name} is mostly full of ${
          weather.weather[0].description
        } 
                    at a temperature of ${weather.main.temp} degrees Celcius`
            );
            synth.speak(utterThis);
        });
};

const stopDictate = () => {
    recognition.stop();
};