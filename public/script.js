class ChartTool {
    constructor() {
        this.chart = null;
        this.originalData = null;
        this.currentData = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const applyFilter = document.getElementById('applyFilter');
        const resetFilter = document.getElementById('resetFilter');

        // File upload events
        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Drag and drop events
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });

        // Filter events
        applyFilter.addEventListener('click', () => this.applyDateFilter());
        resetFilter.addEventListener('click', () => this.resetFilter());
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.handleFileUpload(file);
        }
    }

    async handleFileUpload(file) {
        if (!file.type.includes('json')) {
            this.showStatus('Please select a JSON file', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('jsonFile', file);

        try {
            this.showStatus('Uploading and processing file...', 'info');
            
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.originalData = result.data;
                this.currentData = result.data;
                this.showStatus('File uploaded successfully!', 'success');
                this.processData();
            } else {
                this.showStatus(result.error || 'Upload failed', 'error');
            }
        } catch (error) {
            this.showStatus('Error uploading file: ' + error.message, 'error');
        }
    }

    processData() {
        if (!this.currentData) return;

        // Show filter and chart sections
        document.getElementById('filterSection').style.display = 'block';
        document.getElementById('chartSection').style.display = 'block';

        // Set date range inputs (this will also apply filter and create chart)
        this.setDateRangeInputs();
    }

    setDateRangeInputs() {
        if (!this.currentData) return;

        const dates = this.extractDates(this.currentData);
        if (dates.length === 0) return;

        const endDate = new Date(Math.max(...dates));
        const startDate = new Date(endDate);
        startDate.setMonth(startDate.getMonth() - 1); // 1ヶ月前

        // データの最古日が1ヶ月以内の場合は、最古日を使用
        const oldestDate = new Date(Math.min(...dates));
        if (oldestDate > startDate) {
            startDate.setTime(oldestDate.getTime());
        }

        document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
        document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
        
        // 初期表示時にフィルターを適用
        this.applyDateFilter();
    }

    extractDates(data) {
        const dates = [];
        
        // Handle different ccusage output formats
        if (Array.isArray(data)) {
            data.forEach(item => {
                if (item.date) {
                    dates.push(new Date(item.date));
                }
            });
        } else if (data.daily) {
            // Handle ccusage JSON format where daily is an array
            if (Array.isArray(data.daily)) {
                data.daily.forEach(item => {
                    if (item.date) {
                        dates.push(new Date(item.date));
                    }
                });
            } else {
                // Handle if daily is an object
                Object.keys(data.daily).forEach(date => {
                    dates.push(new Date(date));
                });
            }
        } else if (data.sessions) {
            data.sessions.forEach(session => {
                if (session.date) {
                    dates.push(new Date(session.date));
                }
            });
        }

        return dates;
    }

    createChart() {
        if (!this.currentData) return;

        const chartData = this.prepareChartData(this.currentData);
        
        if (chartData.labels.length === 0) {
            this.showStatus('No valid data found for charting', 'error');
            return;
        }

        // Calculate and display summary statistics
        this.updateSummaryStats(chartData.data);

        const ctx = document.getElementById('usageChart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Total Cost ($)',
                    data: chartData.data,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Cost Trends Over Time'
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('en-US', { 
                                        style: 'currency', 
                                        currency: 'USD',
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Cost (USD)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    prepareChartData(data) {
        const labels = [];
        const values = [];

        if (Array.isArray(data)) {
            data.forEach(item => {
                if (item.date && (item.totalCost !== undefined)) {
                    labels.push(new Date(item.date).toLocaleDateString());
                    values.push(item.totalCost);
                }
            });
        } else if (data.daily) {
            // Handle ccusage JSON format where daily is an array
            if (Array.isArray(data.daily)) {
                data.daily.forEach(item => {
                    if (item.date && item.totalCost !== undefined) {
                        labels.push(new Date(item.date).toLocaleDateString());
                        values.push(item.totalCost);
                    }
                });
            } else {
                // Handle if daily is an object
                Object.keys(data.daily).sort().forEach(date => {
                    labels.push(new Date(date).toLocaleDateString());
                    values.push(data.daily[date].totalCost || 0);
                });
            }
        } else if (data.sessions) {
            const dailyData = {};
            data.sessions.forEach(session => {
                if (session.date && session.totalCost !== undefined) {
                    const date = new Date(session.date).toDateString();
                    if (!dailyData[date]) {
                        dailyData[date] = 0;
                    }
                    dailyData[date] += session.totalCost;
                }
            });
            
            Object.keys(dailyData).sort().forEach(date => {
                labels.push(new Date(date).toLocaleDateString());
                values.push(dailyData[date]);
            });
        }

        return { labels, data: values };
    }

    applyDateFilter() {
        const startDate = new Date(document.getElementById('startDate').value);
        const endDate = new Date(document.getElementById('endDate').value);

        if (startDate > endDate) {
            this.showStatus('Start date must be before end date', 'error');
            return;
        }

        this.currentData = this.filterDataByDate(this.originalData, startDate, endDate);
        this.createChart();
        this.showStatus('Filter applied successfully', 'success');
    }

    filterDataByDate(data, startDate, endDate) {
        if (Array.isArray(data)) {
            return data.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate >= startDate && itemDate <= endDate;
            });
        } else if (data.daily) {
            // Handle ccusage JSON format where daily is an array
            if (Array.isArray(data.daily)) {
                const filtered = {
                    daily: data.daily.filter(item => {
                        const itemDate = new Date(item.date);
                        return itemDate >= startDate && itemDate <= endDate;
                    })
                };
                return filtered;
            } else {
                // Handle if daily is an object
                const filtered = { daily: {} };
                Object.keys(data.daily).forEach(date => {
                    const itemDate = new Date(date);
                    if (itemDate >= startDate && itemDate <= endDate) {
                        filtered.daily[date] = data.daily[date];
                    }
                });
                return filtered;
            }
        } else if (data.sessions) {
            return {
                sessions: data.sessions.filter(session => {
                    const sessionDate = new Date(session.date);
                    return sessionDate >= startDate && sessionDate <= endDate;
                })
            };
        }

        return data;
    }

    resetFilter() {
        this.currentData = this.originalData;
        this.setDateRangeInputs();
        this.createChart();
        this.showStatus('Filter reset', 'info');
    }

    updateSummaryStats(data) {
        const total = data.reduce((sum, value) => sum + value, 0);
        const average = data.length > 0 ? total / data.length : 0;

        document.getElementById('periodTotal').textContent = new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(total);

        document.getElementById('dailyAverage').textContent = new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(average);
    }

    showStatus(message, type) {
        const statusElement = document.getElementById('status');
        statusElement.textContent = message;
        statusElement.className = `status ${type}`;
        statusElement.style.display = 'block';

        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 5000);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new ChartTool();
});