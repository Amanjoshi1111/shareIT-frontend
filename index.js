const dropZone = document.querySelector(".drop-zone");
const browseBtn = document.querySelector(".browseBtn");
const fileInput = document.querySelector("#fileInput");

const progressBar = document.querySelector(".progress-bar");
const bgProgress = document.querySelector(".bg-progress");
const percentDiv = document.querySelector("#percent");
const progressContainer = document.querySelector(".progress-container");

const fileURLInput = document.querySelector("#fileURL");
const copyBtn = document.querySelector("#copyBtn");
const emailForm = document.querySelector("#emailForm");

const sender = document.querySelector("#sender");
const reciever = document.querySelector("#reciever");

const sharingContainer = document.querySelector(".sharing-container");

const toast = document.querySelector(".toast");

const host = "https://shareit-aman.herokuapp.com/";
const uploadURL = `${host}api/files`;
const emailURL = `${host}api/files/send`;

//max file of size to be uploaded
const maxAllowedSize = 100 * 1024 * 1024 //mb

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (!dropZone.classList.contains('dragged')) {

        dropZone.classList.add('dragged');
    }
});

dropZone.addEventListener("dragleave", (e) => {
    dropZone.classList.remove('dragged');
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragged');
    //how many files drag in one time 
    // console.log(e.dataTransfer.files.length);
    const files = e.dataTransfer.files;
    console.log(files);
    if (files.length) {
        fileInput.files = files;
        uploadFile();
    }
});

fileInput.addEventListener("change", () => {
    uploadFile();
});

browseBtn.addEventListener("click", (e) => {
    fileInput.click();
});

copyBtn.addEventListener("click", () => {
    fileURLInput.select();
    document.execCommand("copy");
    showToast("Link Copied To Clipboard");
})

const resetFileInput = () => {
    fileInput.value = "";
}
const uploadFile = () => {

    //we are only allowing user to upload 1 files, so taking first file 
    if (fileInput.files.length > 1) {
        showToast('Only upload 1 file at a time');
        resetFileInput();
        return;

    }
    const file = fileInput.files[0];
    if (file.size > maxAllowedSize) {
        showToast("Can't upload more than 100 MB");
        resetFileInput();
        return;
    }
    progressContainer.style.display = "block";


    const formData = new FormData();
    formData.append("myfile", file);

    //XMLHttpRequest(XHR) is a javascript API to create AJAX request
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            console.log(xhr.response);
            onUploadSuccess(JSON.parse(xhr.response));
        }
    };

    xhr.upload.onprogress = updateProgress;

    xhr.upload.onerror = () => {
        resetFileInput();
        showToast(`Error in upload: ${xhr.statusText}`)
    }

    xhr.open("POST", uploadURL);
    xhr.send(formData);
};

const updateProgress = (e) => {
    const percent = Math.round((e.loaded / e.total) * 100);
    console.log(percent);
    bgProgress.style.width = `${percent}%`;
    percentDiv.innerText = percent;
    progressBar.style.transform = `scaleX(${percent / 100})`
}

const onUploadSuccess = ({ file: url }) => {
    console.log(url);
    resetFileInput();
    emailForm[2].removeAttribute('disabled', 'true');
    progressContainer.style.display = "none";
    sharingContainer.style.display = "block";

    fileURLInput.value = url;
};


emailForm.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("submit form");
    const url = fileURLInput.value;

    const formData = {
        uuid: url.split("/").splice(-1, 1)[0],
        emailTo: sender.value,
        emailFrom: reciever.value,
    };

    emailForm[2].setAttribute('disabled', 'true');
    console.table(formData);

    fetch(emailURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    }).then(res => res.json()).then(({ success }) => {
        if (success) {
            sharingContainer.style.display = "none";
            showToast("Email Sent")
        }
    })
});
let toastTimer;
const showToast = (msg) => {
    toast.innerText = msg;
    toast.style.transform = "translate(-50%,0px)"

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.style.transform = "translate(-50%,60px)"
    }, 2000);
}