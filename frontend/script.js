let selectedImage = null;
let cameraStream = null;

const imageInput = document.getElementById("imageInput");
const takePictureButton = document.getElementById("takePictureButton");
const closeCameraButton = document.getElementById("closeCameraButton");
const captureButton = document.getElementById("captureButton");
const predictButton = document.getElementById("predictButton");

const cameraBox = document.getElementById("cameraBox");
const cameraVideo = document.getElementById("cameraVideo");

const previewSection = document.getElementById("previewSection");
const previewImage = document.getElementById("previewImage");

const errorMessage = document.getElementById("errorMessage");
const resultBox = document.getElementById("resultBox");

const predictedClass = document.getElementById("predictedClass");
const confidence = document.getElementById("confidence");
const recommendedBin = document.getElementById("recommendedBin");
const advice = document.getElementById("advice");
const predictionList = document.getElementById("predictionList");
const uncertainWarning = document.getElementById("uncertainWarning");

const threwTrashButton = document.getElementById("threwTrashButton");
const rewardFill = document.getElementById("rewardFill");
const rewardText = document.getElementById("rewardText");

const couponPopup = document.getElementById("couponPopup");
const giftBox = document.getElementById("giftBox");
const couponContent = document.getElementById("couponContent");
const closeCouponButton = document.getElementById("closeCouponButton");

const predictButtonForReward = document.getElementById("predictButton");



imageInput.addEventListener("change", handleImageSelection);
takePictureButton.addEventListener("click", openCamera);
closeCameraButton.addEventListener("click", closeCamera);
captureButton.addEventListener("click", capturePhoto);
predictButton.addEventListener("click", predictImage);


let recycledCount = Number(localStorage.getItem("recycledCount")) || 0;
let canThrowTrash = false;

function updateRewardBar() {
    const percentage = (recycledCount / 5) * 100;

    rewardFill.style.height = percentage + "%";
    rewardText.textContent = recycledCount + " / 5 items recycled";
}

function enableThrowTrashButton() {
    canThrowTrash = true;
    threwTrashButton.disabled = false;
}

function disableThrowTrashButton() {
    canThrowTrash = false;
    threwTrashButton.disabled = true;
}

updateRewardBar();
disableThrowTrashButton();

if (predictButtonForReward) {
    predictButtonForReward.addEventListener("click", function () {
        enableThrowTrashButton();
    });
}

threwTrashButton.addEventListener("click", function () {
    if (!canThrowTrash) {
        return;
    }

    recycledCount++;

    if (recycledCount >= 5) {
        recycledCount = 5;
        updateRewardBar();

        couponPopup.classList.remove("hidden");

        localStorage.setItem("recycledCount", "0");

        recycledCount = 0;
    } else {
        localStorage.setItem("recycledCount", recycledCount.toString());
        updateRewardBar();
    }

    disableThrowTrashButton();
});

giftBox.addEventListener("click", function () {
    giftBox.classList.add("hidden");
    couponContent.classList.remove("hidden");
});

closeCouponButton.addEventListener("click", function () {
    couponPopup.classList.add("hidden");
    giftBox.classList.remove("hidden");
    couponContent.classList.add("hidden");

    updateRewardBar();
});



function handleImageSelection(event) {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    selectedImage = file;
    showPreview(file);
    hideError();
    hideResult();
}

function showPreview(file) {
    const imageUrl = URL.createObjectURL(file);

    previewImage.src = imageUrl;
    previewSection.classList.remove("hidden");
}

async function openCamera() {
    hideError();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showError("Camera is not supported in this browser.");
        return;
    }

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        cameraVideo.srcObject = cameraStream;
        cameraBox.classList.remove("hidden");

        await cameraVideo.play();

        cameraBox.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } catch (error) {
        console.error(error);
        showError("Camera could not be opened. Please check browser camera permissions.");
    }
}

function closeCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(function (track) {
            track.stop();
        });

        cameraStream = null;
    }

    cameraVideo.srcObject = null;
    cameraBox.classList.add("hidden");
}

function capturePhoto() {
    if (!cameraVideo.videoWidth || !cameraVideo.videoHeight) {
        showError("Camera is not ready yet. Please wait a second and try again.");
        return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = cameraVideo.videoWidth;
    canvas.height = cameraVideo.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
        showError("Could not capture photo.");
        return;
    }

    context.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(function (blob) {
        if (!blob) {
            showError("Could not capture photo.");
            return;
        }

        selectedImage = new File([blob], "desktop-camera-photo.jpg", {
            type: "image/jpeg"
        });

        showPreview(selectedImage);
        hideResult();
        hideError();
        closeCamera();

        previewSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, "image/jpeg");
}

async function predictImage() {
    if (!selectedImage) {
        showError("Please upload or take a picture first.");
        return;
    }

    predictButton.disabled = true;
    predictButton.textContent = "Analysing...";

    hideError();
    hideResult();

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
        const response = await fetch("http://127.0.0.1:5000/api/predict", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong.");
        }

        showResult(data);

        resultBox.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } catch (error) {
        showError(error.message);
    } finally {
        predictButton.disabled = false;
        predictButton.textContent = "Analyse trash item";
    }
}

function showResult(data) {
    predictedClass.textContent = data.predictedClass;
    confidence.textContent = data.confidence;
    recommendedBin.textContent = data.recommendedBin;
    advice.textContent = data.advice;

    if (data.confidence < 70) {
        uncertainWarning.classList.remove("hidden");
        uncertainWarning.textContent =
            "⚠ The model is not fully sure about this prediction. Please double-check the item before throwing it away.";
    } else {
        uncertainWarning.classList.add("hidden");
    }

    predictionList.innerHTML = "";

    data.allPredictions.forEach(function (item) {
        const predictionItem = document.createElement("div");
        predictionItem.className = "prediction-item";

        predictionItem.innerHTML = `
            <span>${item.className}</span>
            <div class="bar-background">
                <div class="bar-fill" style="width: ${item.confidence}%"></div>
            </div>
            <span>${item.confidence}%</span>
        `;

        predictionList.appendChild(predictionItem);
    });

    resultBox.classList.remove("hidden");
}

function hideResult() {
    resultBox.classList.add("hidden");

    if (uncertainWarning) {
        uncertainWarning.classList.add("hidden");
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
}

function hideError() {
    errorMessage.textContent = "";
    errorMessage.classList.add("hidden");
}