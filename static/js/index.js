document.addEventListener("DOMContentLoaded", function(event) {
  console.log("Local Javascript Initialized.");

    const uploadInput = document.querySelector("#dropzone-file");

    if(uploadInput) {
        uploadInput.addEventListener('change',(e)=> {});
    }

    const dropArea = document.getElementById('dropzone');
    const transcribeText = document.getElementById('transcribe-text');
    const transcribeCard = document.getElementById('transcribe-card');
    const transcribeCardText = document.getElementById('transcribe-card-text');
    const transcribeCardBtn = document.getElementById('transcribe-card-btn');
    const loadingButton = document.getElementById('uploading');
    const uploadProgress = document.getElementById("upload-progress");
    const processingButton = document.getElementById('processing');
    const uploadProgressSection = document.getElementById("upload-progress-sec");

    ['dragenter', 'dragover', 'dragleave'].forEach(eventName => {
        if(dropArea) {
            dropArea.addEventListener(eventName, preventDefaults, false);
        }
    })

    if(dropArea){
        dropArea.addEventListener('drop', handleDrop, false);
    }

    const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

    transcribeCardBtn.addEventListener('click', (e) => {
        console.log(e);
        transcribeCard.classList.remove('show');
        transcribeCardText.innerHTML = "";
    });

    function preventDefaults (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    function handleDrop(e) {
      preventDefaults(e);
      dropArea.classList.add('disable-click');
      loadingButton.classList.remove('hide');
      uploadProgressSection.classList.remove('hide');
      let dt = e.dataTransfer;
      let files = dt.files;
      handleFiles(files);
    }

    function handleFiles(files) {
      ([...files]).forEach(uploadFile);
    }

    function uploadFile(file) {
      let url = '/transcribe-upload';
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      xhr.open('POST', url, true);
      xhr.addEventListener('readystatechange', (e) => {
        if (xhr.readyState == 4 && xhr.status == 200) {
          let responseData = JSON.parse(xhr.responseText);
          showToast("success", responseData.message);
          dropArea.classList.remove('disable-click');
          processingButton.classList.add('hide');
          uploadProgressSection.classList.add('hide');

          transcribeText.innerHTML = responseData.transcription;
        }
        else if (xhr.readyState == 4 && xhr.status != 200) {
          let responseData = JSON.parse(xhr.responseText);
          showToast("warning", responseData.message);
        }
      });

      xhr.upload.addEventListener('progress', progressHandle);
      const folderName = genRanHex(16);
      formData.append('folder', folderName)
      formData.append('file', file)
      xhr.send(formData)
      triggerEvent(folderName);
    }

    function progressHandle(e) {
        if (e.lengthComputable) {
            let progress = parseInt((e.loaded / e.total) * 100);
            console.log("upload progress:", progress);
            uploadProgress.style.width = progress + "%";
            uploadProgress.innerHTML = progress + "%";

            if(progress == 100) {
                loadingButton.classList.add('hide');
                processingButton.classList.remove('hide');
            }
      }
    }

    function uploadFileWithFetch(file) {
        const formData = new FormData();
        const fileField = document.querySelector('input[type="file"]');

        formData.append('file', file);

        fetch('/transcribe-upload', {
          method: 'post',
          body: formData
        })
          .then((response) => {
            console.log(response);
            if(response.ok) {
                return response.json();
            }
            return Promise.reject(response);
          })
          .then((result) => {
            showToast("success", result.message);
            transcribeText.innerHTML = result.transcription;
            dropArea.classList.remove('disable-click');
            processingButton.classList.add('hide');
            uploadProgressSection.classList.add('hide');
          })
          .catch((response) => {
            response.json().then((json) => {
                showToast("warning", json.message);
            })
          });
    }

    let successTimeout;
    let warningTimeout;
    function showToast(type, msg) {
        if(type == "success") {
            window.clearTimeout(successTimeout);
            let successToastSection = document.getElementById('toast-success');
            let successToastMsg = document.getElementById('toast-success-message');
            successToastSection.classList.add('show');
            successToastMsg.innerHTML = msg;

            successTimeout = setTimeout(() => {
                successToastSection.classList.remove('show');
            }, 3000);
        }else if(type == "warning") {
            window.clearTimeout(warningTimeout);
            let warningToastSection = document.getElementById('toast-warning');
            let warningToastMsg = document.getElementById('toast-warning-message');
            warningToastSection.classList.add('show');
            warningToastMsg.innerHTML = msg;

            warningTimeout = setTimeout(() => {
                warningToastSection.classList.remove('show');
            }, 3000);
        }
    }

    function triggerEvent(folderName) {
        const evtSource = new EventSource(`http://localhost:8000/transcribe/result?param=${folderName}`);
        evtSource.addEventListener("update", function(event) {
            // Logic to handle status updates
            console.log(event);
            showToast("success", "Transcription Complete");
            transcribeText.innerHTML = event.data;
            transcribeCard.classList.add('show');
            transcribeCardText.innerHTML = event.data;
        });
        evtSource.addEventListener("end", function(event) {
            console.log('SSE Event end.')
            evtSource.close();
        });
    }

});