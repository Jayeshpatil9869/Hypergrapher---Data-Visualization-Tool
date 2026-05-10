document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('csv-file');
    const fileNameDisplay = document.getElementById('file-name');
    const uploadForm = document.getElementById('uploadForm');
    const errorAlert = document.getElementById('errorAlert');
    const errorMsg = document.getElementById('errorMsg');
    const loading = document.getElementById('loading');
    const emptyState = document.getElementById('emptyState');
    const chartCanvas = document.getElementById('myChart');
    
    let currentChart = null;

    // Update file name display when a file is selected
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            fileNameDisplay.textContent = e.target.files[0].name;
            fileNameDisplay.classList.add('text-blue-600');
        } else {
            fileNameDisplay.textContent = 'Click to upload or drag and drop';
            fileNameDisplay.classList.remove('text-blue-600');
        }
    });

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Hide previous errors
        errorAlert.classList.add('hidden');
        
        const file = fileInput.files[0];
        const graphtype = document.getElementById('graphtype').value;

        if (!file || !graphtype) {
            showError('Please select both a file and a graph type.');
            return;
        }

        // Show loading state
        loading.classList.remove('hidden');

        // Prepare FormData for multipart/form-data POST request
        const formData = new FormData();
        formData.append('fileinput', file);
        formData.append('graphtype', graphtype);

        try {
            const response = await fetch('/HelloForm', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }

            renderChart(result.type, result.data);

        } catch (error) {
            console.error('Error fetching data:', error);
            showError(error.message);
        } finally {
            // Hide loading state
            loading.classList.add('hidden');
        }
    });

    function showError(message) {
        errorMsg.textContent = message;
        errorAlert.classList.remove('hidden');
    }

    function renderChart(type, data) {
        // Hide empty state and show canvas
        emptyState.classList.add('hidden');
        chartCanvas.classList.remove('hidden');

        // Destroy previous chart instance if it exists
        if (currentChart) {
            currentChart.destroy();
        }

        const ctx = chartCanvas.getContext('2d');
        
        const config = {
            type: type,
            data: {
                labels: data.labels,
                datasets: data.datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Dataset Visualization'
                    }
                }
            }
        };

        // Add scales config if it's not a pie/doughnut chart
        if (type !== 'pie' && type !== 'doughnut') {
            config.options.scales = {
                y: {
                    beginAtZero: true
                }
            };
        }

        currentChart = new Chart(ctx, config);
    }
});
