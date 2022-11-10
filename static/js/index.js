document.addEventListener("DOMContentLoaded", function(event) {
  console.log("Local Javascript Initialized.");

    const uploadInput = document.querySelector("#dropzone-file");
    console.log(uploadInput);
    uploadInput.addEventListener('change',(e)=> {
        console.log(e);
    });

    const dropArea = document.getElementById('dropzone');
    const transcribeText = document.getElementById('transcribe-text');
    const loadingButton = document.getElementById('loading');


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
      loadingButton.classList.add('show');

      let dt = e.dataTransfer;
      let files = dt.files;

      handleFiles(files)
    }

    function handleFiles(files) {
//      ([...files]).forEach(uploadFile);
      ([...files]).forEach(uploadFileWithFetch);
    }

//    function uploadFile(file) {
//      let url = '/upload';
//      const xhr = new XMLHttpRequest();
//      const formData = new FormData();
//      xhr.open('POST', url, true);
//
//      xhr.addEventListener('readystatechange', function(e) {
//        console.log(xhr);
//        if (xhr.readyState == 4 && xhr.status == 200) {
//          // Done. Inform the user
//          showToast("success", xhr.responseText.message);
//        }
//        else if (xhr.readyState == 4 && xhr.status != 200) {
//          // Error. Inform the user
//          showToast("warning", xhr.responseText.detail);
//        }
//      })
//
//      formData.append('file', file)
//      xhr.send(formData)
//    }



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
            loadingButton.classList.remove('show');
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

});