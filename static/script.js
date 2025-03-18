 document.getElementById('meme-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const topText = document.getElementById('top-text').value.toUpperCase();
    const bottomText = document.getElementById('bottom-text').value.toUpperCase();
    const topPosition = document.getElementById('top-position').value;
    const bottomPosition = document.getElementById('bottom-position').value;

    const textPositions = {
        top: topPosition,
        bottom: bottomPosition
    };

    formData.append('top_text', topText);
    formData.append('bottom_text', bottomText);
    formData.append('text_positions', JSON.stringify(textPositions));

    try {
        const response = await fetch('/generate', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const images = await response.json();
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '';

            images.forEach((imageData, index) => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                resultDiv.appendChild(container);

                const img = document.createElement('img');
                img.src = `data:image/png;base64,${imageData}`;
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                container.appendChild(img);

                img.onload = function() {
                    resizeImageToFitWindow(img);
                };

                if (topText) {
                    const topTextElement = document.createElement('div');
                    topTextElement.textContent = topText;
                    topTextElement.classList.add('draggable');
                    topTextElement.style.top = '10px';
                    topTextElement.style.left = '50%';
                    topTextElement.style.transform = 'translateX(-50%)';
                    container.appendChild(topTextElement);
                    makeDraggable(topTextElement, 'top');
                }

                if (bottomText) {
                    const bottomTextElement = document.createElement('div');
                    bottomTextElement.textContent = bottomText;
                    bottomTextElement.classList.add('draggable');
                    bottomTextElement.style.bottom = '10px';
                    bottomTextElement.style.left = '50%';
                    bottomTextElement.style.transform = 'translateX(-50%)';
                    container.appendChild(bottomTextElement);
                    makeDraggable(bottomTextElement, 'bottom');
                }

                const downloadButton = document.createElement('button');
                downloadButton.textContent = 'Download Image';
                downloadButton.addEventListener('click', async () => {
                    const downloadResponse = await fetch('/download', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ image_data: imageData })
                    });

                    if (downloadResponse.ok) {
                        const blob = await downloadResponse.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'edited_image.png';
                        a.click();
                    }
                });

                resultDiv.appendChild(downloadButton);
            });
        } else {
            console.error('Error generating meme:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

function resizeImageToFitWindow(img) {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const imgAspectRatio = img.naturalWidth / img.naturalHeight;

    let newWidth, newHeight;

    if (img.naturalWidth > windowWidth || img.naturalHeight > windowHeight) {
        if (img.naturalWidth / windowWidth > img.naturalHeight / windowHeight) {
            newWidth = windowWidth * 0.9; // 90% of window width
            newHeight = newWidth / imgAspectRatio;
        } else {
            newHeight = windowHeight * 0.9; // 90% of window height
            newWidth = newHeight * imgAspectRatio;
        }

        img.style.width = `${newWidth}px`;
        img.style.height = `${newHeight}px`;
    }
}

function makeDraggable(element, positionKey) {
    let offsetX, offsetY;

    element.addEventListener('mousedown', (e) => {
        offsetX = e.clientX - element.getBoundingClientRect().left;
        offsetY = e.clientY - element.getBoundingClientRect().top;
        element.style.cursor = 'grabbing';

        const moveHandler = (moveEvent) => {
            const x = moveEvent.clientX - offsetX;
            const y = moveEvent.clientY - offsetY;
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
            element.style.transform = 'translate(0, 0)';

            const textPositions = JSON.parse(document.querySelector('form').text_positions.value);
            textPositions[positionKey] = [x, y];
            document.querySelector('form').text_positions.value = JSON.stringify(textPositions);
        };

        const upHandler = () => {
            window.removeEventListener('mousemove', moveHandler);
            window.removeEventListener('mouseup', upHandler);
            element.style.cursor = 'grab';
        };

        window.addEventListener('mousemove', moveHandler);
        window.addEventListener('mouseup', upHandler);
    });
}

// Toggle dark mode
document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.createElement('button');
    darkModeToggle.textContent = 'Toggle Dark Mode';
    darkModeToggle.style.position = 'fixed';
    darkModeToggle.style.top = '1rem';
    darkModeToggle.style.right = '1rem';
    darkModeToggle.style.padding = '0.5rem 1rem';
    darkModeToggle.style.border = 'none';
    darkModeToggle.style.borderRadius = '5px';
    darkModeToggle.style.background = 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)';
    darkModeToggle.style.color = 'white';
    darkModeToggle.style.cursor = 'pointer';
    darkModeToggle.style.transition = 'background 0.3s';

    darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
    });

    document.body.appendChild(darkModeToggle);
});