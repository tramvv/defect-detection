document.addEventListener('DOMContentLoaded', () => {
    // Lấy các phần tử HTML
    const fileInput = document.getElementById('fileInput');
    const predictBtn = document.getElementById('predictBtn');
    const resultsContainer = document.getElementById('resultsContainer');
    const inputPreview = document.getElementById('inputPreview');
    const outputPreview = document.getElementById('outputPreview');
    const spinner = document.getElementById('spinner');

    let selectedFile = null;

    // Gắn các sự kiện
    fileInput.addEventListener('change', handleFileSelect);
    predictBtn.addEventListener('click', handlePrediction);

    function handleFileSelect(event) {
        selectedFile = event.target.files[0];
        if (!selectedFile) {
            predictBtn.disabled = true;
            return;
        }

        resultsContainer.classList.remove('hidden');
        outputPreview.closest('.result-box').classList.add('hidden');
        displayInput(selectedFile);
        predictBtn.disabled = false;
    }

    async function handlePrediction() {
        if (!selectedFile) return;

        predictBtn.disabled = true;
        outputPreview.closest('.result-box').classList.remove('hidden');
        outputPreview.innerHTML = '';
        spinner.classList.remove('hidden');
        outputPreview.appendChild(spinner);
        
        // Tạo đối tượng FormData để gửi file
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            // Thay thế 'YOUR_API_GATEWAY_ENDPOINT' bằng URL API thực tế của bạn
            const response = await fetch('https://05njq8omqa.execute-api.ap-southeast-1.amazonaws.com/prod', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Server returned an error: ${response.status}`);
            }

            const result = await response.json(); // Giả sử API trả về JSON
            displayOutput(result);

        } catch (error) {
            console.error('Lỗi khi gọi API:', error);
            outputPreview.innerHTML = '<p class="error-message">Có lỗi xảy ra khi dự đoán. Vui lòng thử lại.</p>';
        } finally {
            spinner.classList.add('hidden');
            predictBtn.disabled = false;
        }
    }

    function displayInput(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            inputPreview.innerHTML = '';
            let mediaElement;
            if (file.type.startsWith('image/')) {
                mediaElement = document.createElement('img');
            } else if (file.type.startsWith('video/')) {
                mediaElement = document.createElement('video');
                mediaElement.controls = true;
                mediaElement.muted = true;
            }
            mediaElement.src = e.target.result;
            inputPreview.appendChild(mediaElement);
        };
        reader.readAsDataURL(file);
    }
    
    function displayOutput(data) {
        outputPreview.innerHTML = '';

        // Hiển thị file output (ảnh hoặc video)
        let mediaElement;
        if (data.type === 'image') {
            mediaElement = document.createElement('img');
        } else if (data.type === 'video') {
            mediaElement = document.createElement('video');
            mediaElement.controls = true;
            mediaElement.autoplay = true;
            mediaElement.muted = true;
            mediaElement.loop = true;
        }
        
        if (mediaElement) {
            mediaElement.src = data.output_url;
            outputPreview.appendChild(mediaElement);
        }
    }
});