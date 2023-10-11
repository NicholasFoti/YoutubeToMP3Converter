 //required packages
 const express = require("express");
 const fetch = require("node-fetch");
 require("dotenv").config();

 //create the express server
 const app = express();

 //server port number
 const PORT = process.env.PORT || 3000;

//set template engine
app.set("view engine", "ejs");
app.use(express.static("public"));

//needed to parse html data for POST request
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json());

app.get("/", (req, res) => {
    res.render("index")
})

function extractVideoId(url) {
    const regex = /v=([^&]+)|shorts\/([^/?]+)/;
    const match = url.match(regex);
    if (match) {
        return match[1] || match[2]
    }
    return null;
}

const MAX_RETRIES = 10;
const RETRY_DELAY = 5000;

async function getVideoData(videoId, retries = 0){
    const fetchAPI = await fetch(`https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`, {
        "method" : "GET",
        "headers" : {
            "x-rapidapi-key" : process.env.API_KEY,
            "x-rapidapi-host" : process.env.MP3_API_HOST
        }
    });

    const fetchResponse = await fetchAPI.json();

    if (fetchResponse.status === "processing" && retries < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY/1000} seconds...`);
        return new Promise(resolve => {
            setTimeout(async () => {
                const data = await getVideoData(videoId, retries + 1);
                resolve(data);
            }, RETRY_DELAY);
        });
    } else {
        return fetchResponse;
    }
}

app.post("/convert-mp3", async (req, res) => {
    let videoUrl = req.body.videoUrl;
    const videoId = extractVideoId(videoUrl);
    if(
        videoId === undefined ||
        videoId === "" ||
        videoId === null
    ){
        return res.render("index", {success : false, message : "Please enter a valid URL"});
        }

        const fetchResponse = await getVideoData(videoId);

        if(fetchResponse.status === "ok"){
            return res.render("index", {success : true, mp3 : true, video_title: fetchResponse.title, video_link : fetchResponse.link});
        }else{
        return res.render("index", {success : false, message : fetchResponse.msg})
    }  
});

app.post("/convert-mp4", async (req, res) => {
    let videoUrl = req.body.videoUrl;
    const videoId = extractVideoId(videoUrl);
    if(
        videoId === undefined ||
        videoId === "" ||
        videoId === null
    ){
        return res.render("index", {success : false, message : "Please enter a valid URL"});
    }else{
        const fetchAPI = await fetch(`https://ytstream-download-youtube-videos.p.rapidapi.com/dl?id=${videoId}`, {
            "method" : "GET",
            "headers" : {
                "x-rapidapi-key" : process.env.API_KEY,
                "x-rapidapi-host" : process.env.MP4_API_HOST
            }
        });

        const fetchResponse = await fetchAPI.json();

        if(fetchResponse.status === "OK")
            return res.render("index", {success : true, mp3 : false, mp4 : true, video_title: fetchResponse.title, video_link : fetchResponse.formats[2].url});
        else
        console.log(fetchResponse);
        return res.render("index", {success : false, message : "Couldnt Retrieve Video"})
    }  
})

 //start the server
 app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
 })