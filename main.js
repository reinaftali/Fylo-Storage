var totalDiskSpace = 10; // in MB
var currentSpace = 0;
var files = {}; // Store file names and their sizes
var allowedFormats = ['.jpg', '.jpeg', '.gif', '.png']; // Allowed file formats

function openFileExplorer() {
    var input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;

    input.addEventListener('change', function(event) {
        var newFiles = event.target.files;
        for (var i = 0; i < newFiles.length; i++) {
            var file = newFiles[i];
            var fileName = file.name;
            var fileSizeMB = file.size / (1024 * 1024);

            var fileExtension = fileName.split('.').pop().toLowerCase();
            if (!allowedFormats.includes('.' + fileExtension)) {
                alert('File format isn’t supported: ' + fileName);
                continue; 
            }

            if (!files[fileName]) {
                if ((currentSpace + fileSizeMB) <= totalDiskSpace) {
                    files[fileName] = fileSizeMB;
                    updateAvailableSpace(fileSizeMB);
                    displayFileName(fileName);
                } else {
                    alert('File size exceeds the available space.');
                    break;
                }
            } else {
                alert('File "' + fileName + '" is already uploaded.');
            }
        }

        // Save files localStorage after processing all files
        saveStateToLocalStorage();
    });

    input.click();
}

function updateAvailableSpace(fileSizeMB) {
    currentSpace += fileSizeMB;
    currentSpace = Math.min(currentSpace, totalDiskSpace);

    var usedStorageElement = document.getElementById('usedStorage');
    var remainingSpaceElement = document.getElementById('remainingSpace');

    usedStorageElement.textContent = currentSpace.toFixed(0) + ' MB';
    remainingSpaceElement.textContent = (totalDiskSpace - currentSpace).toFixed(0);

    var gradientBar = document.querySelector('.gradient-bar');
    var usedPercentage = (currentSpace / totalDiskSpace) * 100;

    if ((totalDiskSpace - currentSpace).toFixed(0) == 0) {
        gradientBar.style.width = 100 + '%';
    } else {
        gradientBar.style.width = usedPercentage + '%';
    }
}

function saveStateToLocalStorage() {
    localStorage.setItem('files', JSON.stringify(files));
}

function loadStateFromLocalStorage() {
    var savedFiles = localStorage.getItem('files');
    if (savedFiles !== null) {
        files = JSON.parse(savedFiles);
        for (var fileName in files) {
            if (files.hasOwnProperty(fileName)) {
                displayFileName(fileName);
            }
        }
    }

    // Calculate current space based on loaded files
    currentSpace = Object.values(files).reduce((acc, fileSize) => acc + fileSize, 0);
    updateAvailableSpace(0); // Update UI without adding any file sizes
}

function displayFileName(fileName) {
    var listItem = document.createElement('li');
    var fileNameElement = document.createElement('span');
    fileNameElement.textContent = fileName;
    fileNameElement.style.color = 'red';

    var removeText = document.createElement('span');
    removeText.textContent = ' X';
    removeText.style.cursor = 'pointer';
    removeText.style.color = 'red';
    removeText.addEventListener('click', function() {
        listItem.remove();
        var fileSizeMB = files[fileName];
        delete files[fileName];
        updateAvailableSpace(-fileSizeMB);
        saveStateToLocalStorage(); // Update localStorage after removing file
    });

    listItem.appendChild(fileNameElement);
    listItem.appendChild(removeText);

    document.getElementById('fileList').appendChild(listItem);
}

function clearLocalStorage() {
    localStorage.clear();
    location.reload(); // Reload the page to reflect the cleared storage
}

window.onload = function() {
    loadStateFromLocalStorage();
};
