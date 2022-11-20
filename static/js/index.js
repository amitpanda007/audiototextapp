document.addEventListener("DOMContentLoaded", function(event) {
  console.log("Local Javascript Initialized.");

    const uploadInput = document.querySelector("#dropzone-file");
    console.log(uploadInput);
    uploadInput.addEventListener('change',(e)=> {
        console.log(e);
    });

    const dropArea = document.getElementById('dropzone');
    const transcribeText = document.getElementById('transcribe-text');
    const loadingButton = document.getElementById('uploading');
    const uploadProgress = document.getElementById("upload-progress");
    const processingButton = document.getElementById('processing');
    const uploadProgressSection = document.getElementById("upload-progress-sec");

    ['dragenter', 'dragover', 'dragleave'].forEach(eventName => {
      dropArea.addEventListener(eventName, preventDefaults, false)
    })
    dropArea.addEventListener('drop', handleDrop, false);

    function preventDefaults (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    function handleDrop(e) {
      preventDefaults(e);
      dropArea.classList.add('disable-click');
      loadingButton.classList.remove('hide');
      uploadProgressSection.classList.remove('hide');
      let dt = e.dataTransfer;
      let files = dt.files;
      handleFiles(files)
    }

    function handleFiles(files) {
      ([...files]).forEach(uploadFile);
//      ([...files]).forEach(uploadFileWithFetch);
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
      formData.append('file', file)
      xhr.send(formData)
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

    const evtSource = new EventSource("http://localhost:8000/status/stream?param1=test");
    evtSource.addEventListener("update", function(event) {
        // Logic to handle status updates
        console.log(event)
    });
    evtSource.addEventListener("end", function(event) {
        console.log('Handling end....')
        evtSource.close();
    });

});