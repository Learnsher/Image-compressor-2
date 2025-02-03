document.getElementById('quality').addEventListener('input', function() {
    document.getElementById('qualityValue').textContent = this.value;
    updateEstimatedSize();
});

document.getElementById('bitSwitch').addEventListener('change', function() {
    updateEstimatedSize();
});

document.getElementById('imageInput').addEventListener('change', function() {
    document.getElementById('downloadLink').style.display = 'none';
    document.getElementById('downloadLink').href = '';
    document.getElementById('downloadLink').textContent = '';
    document.getElementById('progressBar').style.display = 'none';
    document.getElementById('progressBar').value = 0;
    document.getElementById('progressMessage').textContent = '';
    updateEstimatedSize();
});

document.getElementById('compressButton').addEventListener('click', function() {
    const fileInput = document.getElementById('imageInput');
    const quality = document.getElementById('quality').value;
    const bitSwitch = document.getElementById('bitSwitch').checked;
    const format = document.querySelector('input[name="format"]:checked').value;
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const progressBar = document.getElementById('progressBar');
    const progressMessage = document.getElementById('progressMessage');

    if (fileInput.files.length === 0) {
        alert('Please select an image file.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            progressBar.style.display = 'block';
            progressMessage.textContent = '0%';

            // Simulate compression progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += 1;
                progressBar.value = progress;
                progressMessage.textContent = `${progress}%`;

                if (progress >= 100) {
                    clearInterval(interval);

                    let dataUrl;
                    if (bitSwitch && format === 'png') {
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const rgba = imageData.data.buffer;
                        const png = UPNG.encode([rgba], canvas.width, canvas.height, 256);
                        dataUrl = URL.createObjectURL(new Blob([png], { type: 'image/png' }));
                    } else if (format === 'jpg') {
                        dataUrl = canvas.toDataURL('image/jpeg', quality / 100);
                    } else {
                        dataUrl = canvas.toDataURL('image/png', quality / 100);
                    }

                    console.log('Generated data URL:', dataUrl);

                    const downloadLink = document.getElementById('downloadLink');
                    downloadLink.href = dataUrl;
                    downloadLink.download = `compressed_image.${format}`;

                    downloadLink.style.display = 'block';
                    downloadLink.textContent = 'Download Compressed Image';

                    progressBar.style.display = 'none';
                    progressBar.value = 0;
                    progressMessage.textContent = 'All done! Your image is ready to download!';
                }
            }, 30); // Adjust the interval time for a smoother experience
        };
        img.src = event.target.result;
    };

    reader.readAsDataURL(file);
});

function updateFormat() {
    const format = document.querySelector('input[name="format"]:checked').value;
    const qualitySection = document.getElementById('qualitySection');
    const bitSwitchSection = document.getElementById('bitSwitchSection');

    if (format === 'jpg') {
        qualitySection.classList.remove('hidden');
        bitSwitchSection.classList.add('hidden');
    } else {
        qualitySection.classList.add('hidden');
        bitSwitchSection.classList.remove('hidden');
    }

    updateEstimatedSize();
}

function updateEstimatedSize() {
    const fileInput = document.getElementById('imageInput');
    const quality = document.getElementById('quality').value;
    const bitSwitch = document.getElementById('bitSwitch').checked;
    const format = document.querySelector('input[name="format"]:checked').value;
    const estimatedSizeElement = document.getElementById('estimatedSize');

    if (fileInput.files.length === 0) {
        estimatedSizeElement.textContent = '-';
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            let estimatedSize;
            if (bitSwitch && format === 'png') {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const rgba = imageData.data.buffer;
                const png = UPNG.encode([rgba], canvas.width, canvas.height, 256);
                estimatedSize = png.byteLength;
            } else if (format === 'jpg') {
                const dataUrl = canvas.toDataURL('image/jpeg', quality / 100);
                estimatedSize = dataURLToBlob(dataUrl).size;
            } else {
                const dataUrl = canvas.toDataURL('image/png', quality / 100);
                estimatedSize = dataURLToBlob(dataUrl).size;
            }

            estimatedSizeElement.textContent = `${(estimatedSize / 1024).toFixed(2)} KB`;
        };
        img.src = event.target.result;
    };

    reader.readAsDataURL(file);
}

function dataURLToBlob(dataurl) {
    const arr = dataurl.split(',');
    if (arr.length !== 2) {
        throw new Error('Invalid data URL.');
    }

    const mime = arr[0].match(/:(.*?);/);
    if (!mime || mime.length < 2) {
        throw new Error('Invalid MIME type.');
    }

    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime[1] });
}

const dropZone = document.getElementById('dropZone');
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-blue-500');
});

dropZone.addEventListener('dragleave', (e) => {
    dropZone.classList.remove('border-blue-500');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-blue-500');
    const files = e.dataTransfer.files;
    document.getElementById('imageInput').files = files;
    updateEstimatedSize();
});