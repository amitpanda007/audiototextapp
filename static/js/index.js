document.addEventListener("DOMContentLoaded", function(event) {
  console.log("Local Javascript Initialized.");

    const uploadInput = document.querySelector("#dropzone-file");
    console.log(uploadInput);
    uploadInput.addEventListener('change',(e)=> {
        console.log(e);
    });

    const dropZone = document.querySelector("#dropzone");
    let dropArea = document.getElementById('dropzone');
    console.log(dropArea);

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
      let dt = e.dataTransfer;
      let files = dt.files;

      handleFiles(files)
    }

    function handleFiles(files) {
      ([...files]).forEach(uploadFile);
    }

    function uploadFile(file) {
      let url = '/upload';
      const xhr = new XMLHttpRequest()
      const formData = new FormData()
      xhr.open('POST', url, true)

      xhr.addEventListener('readystatechange', function(e) {
        if (xhr.readyState == 4 && xhr.status == 200) {
          // Done. Inform the user
        }
        else if (xhr.readyState == 4 && xhr.status != 200) {
          // Error. Inform the user
        }
      })

      formData.append('file', file)
      xhr.send(formData)
    }

});