document.addEventListener("DOMContentLoaded", function() {
    const videoUrlMp3 = document.getElementById("videoUrlMp3");
    const videoUrlMp4 = document.getElementById("videoUrlMp4");
    const formMp3 = document.getElementById("form-mp3");
    const formMp4 = document.getElementById("form-mp4");

    const validateInput = (input) => {
        const isValidUrl = /^https?:\/\/[^/\s]+(\/.*)?$/.test(input.value);
        if (isValidUrl) {
            input.classList.remove("is-invalid");
        } else {
            input.classList.add("is-invalid");
        }
    };

    formMp3.addEventListener("submit", function(event) {
        validateInput(videoUrlMp3);
    });

    formMp4.addEventListener("submit", function(event) {
        validateInput(videoUrlMp4);
    });
});