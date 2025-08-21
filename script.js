// WiFi 간섭 실험실 JavaScript 코드
class WiFiInterferenceLab {
    constructor() {
        this.isExperimentRunning = false;
        this.experimentInterval = null;
        this.signalData = [];
        this.currentTime = 0;
        this.ctx = null;
        this.chartData = [];
        
        this.initializeElements();
        this.bindEvents();
        this.initializeChart();
        this.loadDefaultValues();
    }

    initializeElements() {
        // DOM 요소들 초기화
        this.elements = {
            frequency: document.getElementById('frequency'),
            distance: document.getElementById('distance'),
            walls: document.getElementById('walls'),
            interference: document.getElementById('interference'),
            channel: document.getElementById('channel'),
            power: document.getElementById('power'),
            weather: document.getElementById('weather'),
            time: document.getElementById('time'),
            
            // 값 표시 요소들
            distanceValue: document.getElementById('distanceValue'),
            wallsValue: document.getElementById('wallsValue'),
            interferenceValue: document.getElementById('interferenceValue'),
            powerValue: document.getElementById('powerValue'),
            
            // 결과 표시 요소들
            rssiMeter: document.getElementById('rssiMeter'),
            rssiValue: document.getElementById('rssiValue'),
            downloadSpeed: document.getElementById('downloadSpeed'),
            uploadSpeed: document.getElementById('uploadSpeed'),
            qualityBar: document.getElementById('qualityBar'),
            qualityText: document.getElementById('qualityText'),
            interferenceMeter: document.getElementById('interferenceMeter'),
            interferenceIndex: document.getElementById('interferenceIndex'),
            
            // 버튼들
            startExperiment: document.getElementById('startExperiment'),
            resetExperiment: document.getElementById('resetExperiment'),
            saveResults: document.getElementById('saveResults'),
            
            // 차트
            signalChart: document.getElementById('signalChart')
        };
    }

    bindEvents() {
        // 슬라이더 이벤트 바인딩
        this.elements.distance.addEventListener('input', (e) => {
            this.elements.distanceValue.textContent = `${e.target.value}m`;
            this.updateCalculations();
        });

        this.elements.walls.addEventListener('input', (e) => {
            this.elements.wallsValue.textContent = `${e.target.value}개`;
            this.updateCalculations();
        });

        this.elements.interference.addEventListener('input', (e) => {
            this.elements.interferenceValue.textContent = `${e.target.value}%`;
            this.updateCalculations();
        });

        this.elements.power.addEventListener('input', (e) => {
            this.elements.powerValue.textContent = `${e.target.value}%`;
            this.updateCalculations();
        });

        // 드롭다운 이벤트 바인딩
        this.elements.frequency.addEventListener('change', () => this.updateCalculations());
        this.elements.channel.addEventListener('change', () => this.updateCalculations());
        this.elements.weather.addEventListener('change', () => this.updateCalculations());
        this.elements.time.addEventListener('change', () => this.updateCalculations());

        // 버튼 이벤트 바인딩
        this.elements.startExperiment.addEventListener('click', () => this.toggleExperiment());
        this.elements.resetExperiment.addEventListener('click', () => this.resetExperiment());
        this.elements.saveResults.addEventListener('click', () => this.saveResults());
    }

    initializeChart() {
        const ctx = this.elements.signalChart.getContext('2d');
        
        // Chart.js 설정
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'RSSI (dBm)',
                    data: [],
                    borderColor: '#000000',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#000000',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 300
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: -100,
                        max: -30,
                        grid: {
                            color: '#000000',
                            lineWidth: 1
                        },
                        ticks: {
                            color: '#000000',
                            font: {
                                size: 12
                            }
                        },
                        title: {
                            display: true,
                            text: 'RSSI (dBm)',
                            color: '#000000',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: '#000000',
                            lineWidth: 1
                        },
                        ticks: {
                            color: '#000000',
                            font: {
                                size: 12
                            }
                        },
                        title: {
                            display: true,
                            text: '시간 (초)',
                            color: '#000000',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#000000',
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#ffffff',
                        titleColor: '#000000',
                        bodyColor: '#000000',
                        borderColor: '#000000',
                        borderWidth: 1,
                        cornerRadius: 0
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
        
        this.chartData = [];
    }

    loadDefaultValues() {
        // 기본값으로 계산 실행
        this.updateCalculations();
    }

    updateCalculations() {
        // 실험 중일 때도 차트 업데이트 허용
        const frequency = parseFloat(this.elements.frequency.value);
        const distance = parseFloat(this.elements.distance.value);
        const walls = parseInt(this.elements.walls.value);
        const interference = parseInt(this.elements.interference.value);
        const channel = this.elements.channel.value;
        const power = parseInt(this.elements.power.value);
        const weather = this.elements.weather.value;
        const time = this.elements.time.value;

        // RSSI 계산 (실제 WiFi 공학 공식 기반)
        let baseRSSI = this.calculateBaseRSSI(frequency, distance, walls, power);
        let interferenceEffect = this.calculateInterferenceEffect(interference, channel, weather, time);
        let finalRSSI = baseRSSI - interferenceEffect;

        // 전송 속도 계산
        let speeds = this.calculateSpeed(frequency, finalRSSI, interference);

        // 신호 품질 계산
        let quality = this.calculateQuality(finalRSSI, interference);

        // UI 업데이트
        this.updateUI(finalRSSI, speeds, quality, interference);
        
        // 실험 중일 때는 차트 데이터 추가
        if (this.isExperimentRunning) {
            this.addChartData(finalRSSI);
        }
    }

    calculateBaseRSSI(frequency, distance, walls, power) {
        // 자유 공간 경로 손실 공식 기반
        let pathLoss = 20 * Math.log10(frequency) + 20 * Math.log10(distance) + 20 * Math.log10(4 * Math.PI / 3e8);
        
        // 벽 손실 (2.4GHz: 약 3-6dB, 5GHz: 약 6-12dB per wall)
        let wallLoss = walls * (frequency === 2.4 ? 4 : 8);
        
        // 전송 파워 효과
        let powerEffect = (power - 100) * 0.5;
        
        // 기본 RSSI (일반적으로 -30dBm에서 시작)
        let baseRSSI = -30;
        
        return baseRSSI - pathLoss - wallLoss + powerEffect;
    }

    calculateInterferenceEffect(interference, channel, weather, time) {
        let totalInterference = 0;
        
        // 기본 간섭
        totalInterference += interference * 0.3;
        
        // 채널 간섭
        if (channel === '1' || channel === '6' || channel === '11') {
            totalInterference += 5; // 최적 채널
        } else if (channel === 'auto') {
            totalInterference += 15; // 자동 선택은 간섭이 많을 수 있음
        } else {
            totalInterference += 25; // 인접 채널
        }
        
        // 날씨 효과
        switch(weather) {
            case 'rainy': totalInterference += 20; break;
            case 'humid': totalInterference += 15; break;
            case 'dry': totalInterference += 5; break;
            default: totalInterference += 0; break;
        }
        
        // 시간대 효과
        switch(time) {
            case 'evening': totalInterference += 25; break; // 저녁 시간대 간섭 최대
            case 'afternoon': totalInterference += 15; break;
            case 'morning': totalInterference += 10; break;
            default: totalInterference += 5; break;
        }
        
        return totalInterference;
    }

    calculateSpeed(frequency, rssi, interference) {
        // RSSI 기반 최대 속도 계산 (더 현실적인 값으로 조정)
        let maxSpeed;
        if (frequency === 2.4) {
            // 2.4GHz: 37 ~ 600 Mbps 범위로 제한
            maxSpeed = Math.max(37, Math.min(600, 600 * Math.pow(10, (rssi + 30) / 30)));
        } else {
            // 5GHz: 270 ~ 9600 Mbps 범위로 제한
            maxSpeed = Math.max(270, Math.min(9600, 9600 * Math.pow(10, (rssi + 30) / 30)));
        }
        
        // 간섭에 의한 속도 감소 (더 현실적인 감소율)
        let interferenceFactor = Math.max(0.1, 1 - (interference / 150)); // 간섭 효과를 줄임
        let actualMaxSpeed = maxSpeed * interferenceFactor;
        
        // 다운로드 속도 (일반적으로 더 빠름)
        let downloadSpeed = actualMaxSpeed * (0.7 + Math.random() * 0.2); // 70-90%
        
        // 업로드 속도 (일반적으로 더 느림)
        let uploadSpeed = actualMaxSpeed * (0.4 + Math.random() * 0.3); // 40-70%
        
        return {
            download: Math.round(downloadSpeed),
            upload: Math.round(uploadSpeed)
        };
    }

    calculateQuality(rssi, interference) {
        let quality = 100;
        
        // RSSI 기반 품질
        if (rssi > -30) quality -= 0;
        else if (rssi > -50) quality -= 10;
        else if (rssi > -70) quality -= 30;
        else quality -= 60;
        
        // 간섭 기반 품질
        quality -= interference * 0.5;
        
        quality = Math.max(0, Math.min(100, quality));
        
        return quality;
    }

    updateUI(rssi, speeds, quality, interference) {
        // RSSI 미터 업데이트
        let rssiPercentage = Math.max(0, Math.min(100, ((rssi + 100) / 70) * 100));
        this.elements.rssiMeter.style.width = `${rssiPercentage}%`;
        this.elements.rssiValue.textContent = `${rssi.toFixed(1)} dBm`;
        
        // 속도 업데이트
        this.elements.downloadSpeed.textContent = `${speeds.download} Mbps`;
        this.elements.uploadSpeed.textContent = `${speeds.upload} Mbps`;
        
        // 품질 바 업데이트
        this.elements.qualityBar.style.setProperty('--quality-width', `${quality}%`);
        this.elements.qualityBar.style.setProperty('--quality-width', `${quality}%`);
        
        let qualityText = quality > 80 ? '우수' : quality > 60 ? '양호' : quality > 40 ? '보통' : quality > 20 ? '나쁨' : '매우 나쁨';
        this.elements.qualityText.textContent = qualityText;
        
        // 간섭 미터 업데이트
        let interferencePercentage = Math.min(100, interference);
        this.elements.interferenceMeter.style.width = `${interferencePercentage}%`;
        
        let interferenceText = interference < 20 ? '낮음' : interference < 50 ? '보통' : interference < 80 ? '높음' : '매우 높음';
        this.elements.interferenceIndex.textContent = interferenceText;
        
        // 차트 데이터 추가
        // this.addChartData(rssi); // 실험 중일 때는 차트 데이터 추가 로직을 updateCalculations에 통합
    }

    addChartData(rssi) {
        this.currentTime += 1;
        this.chartData.push({ time: this.currentTime, rssi: rssi });
        
        // 최근 50개 데이터만 유지
        if (this.chartData.length > 50) {
            this.chartData.shift();
        }
        
        this.chart.data.labels = this.chartData.map(d => d.time);
        this.chart.data.datasets[0].data = this.chartData.map(d => d.rssi);
        this.chart.update();
    }

    toggleExperiment() {
        if (this.isExperimentRunning) {
            this.stopExperiment();
        } else {
            this.startExperiment();
        }
    }

    startExperiment() {
        this.isExperimentRunning = true;
        this.elements.startExperiment.textContent = '실험 중지';
        this.elements.startExperiment.classList.remove('btn-primary');
        this.elements.startExperiment.classList.add('btn-secondary');
        
        // 실험 데이터 초기화
        this.currentTime = 0;
        this.chartData = [];
        
        // 초기 데이터 포인트 추가
        this.updateCalculations();
        
        // 실시간 업데이트 시작
        this.experimentInterval = setInterval(() => {
            this.currentTime += 1;
            this.updateCalculations();
        }, 1000); // 1초마다 업데이트
        
        // 성공 메시지
        this.showNotification('실험이 시작되었습니다!', 'success');
    }

    stopExperiment() {
        this.isExperimentRunning = false;
        this.elements.startExperiment.textContent = '실험 시작';
        this.elements.startExperiment.classList.remove('btn-secondary');
        this.elements.startExperiment.classList.add('btn-primary');
        
        if (this.experimentInterval) {
            clearInterval(this.experimentInterval);
            this.experimentInterval = null;
        }
        
        // 실험 중지 후에도 차트는 계속 표시
        this.showNotification('실험이 중지되었습니다.', 'info');
    }

    resetExperiment() {
        this.stopExperiment();
        
        // 모든 컨트롤을 기본값으로 리셋
        this.elements.frequency.value = '2.4';
        this.elements.distance.value = '3';
        this.elements.walls.value = '1';
        this.elements.interference.value = '20';
        this.elements.channel.value = '1';
        this.elements.power.value = '100';
        this.elements.weather.value = 'clear';
        this.elements.time.value = 'morning';
        
        // UI 업데이트
        this.elements.distanceValue.textContent = '3m';
        this.elements.wallsValue.textContent = '1개';
        this.elements.interferenceValue.textContent = '20%';
        this.elements.powerValue.textContent = '100%';
        
        // 차트 초기화
        this.currentTime = 0;
        this.chartData = [];
        if (this.chart) {
            this.chart.data.labels = [];
            this.chart.data.datasets[0].data = [];
            this.chart.update();
        }
        
        // 계산 업데이트
        this.updateCalculations();
        
        this.showNotification('실험이 초기화되었습니다.', 'success');
    }

    saveResults() {
        if (this.chartData.length === 0) {
            this.showNotification('저장할 실험 데이터가 없습니다.', 'warning');
            return;
        }
        
        // 실험 결과 데이터 구성
        const experimentData = {
            timestamp: new Date().toISOString(),
            settings: {
                frequency: this.elements.frequency.value,
                distance: this.elements.distance.value,
                walls: this.elements.walls.value,
                interference: this.elements.interference.value,
                channel: this.elements.channel.value,
                power: this.elements.power.value,
                weather: this.elements.weather.value,
                time: this.elements.time.value
            },
            results: {
                rssi: this.elements.rssiValue.textContent,
                downloadSpeed: this.elements.downloadSpeed.textContent,
                uploadSpeed: this.elements.uploadSpeed.textContent,
                quality: this.elements.qualityText.textContent,
                interference: this.elements.interferenceIndex.textContent
            },
            chartData: this.chartData
        };
        
        // JSON 파일로 다운로드
        const dataStr = JSON.stringify(experimentData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `wifi_experiment_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        this.showNotification('실험 결과가 저장되었습니다!', 'success');
    }

    showNotification(message, type = 'info') {
        // 간단한 알림 시스템
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // 스타일 적용
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '0',
            color: '#ffffff',
            fontWeight: '600',
            zIndex: '1000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            border: '1px solid #000000',
            backgroundColor: '#000000'
        });
        
        document.body.appendChild(notification);
        
        // 애니메이션
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // 자동 제거
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// 페이지 로드 시 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    new WiFiInterferenceLab();
});

// 추가 기능: 키보드 단축키
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'Enter':
                e.preventDefault();
                document.getElementById('startExperiment').click();
                break;
            case 'r':
                e.preventDefault();
                document.getElementById('resetExperiment').click();
                break;
            case 's':
                e.preventDefault();
                document.getElementById('saveResults').click();
                break;
        }
    }
});

// 추가 기능: 실험 힌트 시스템
function showExperimentHint() {
    const hints = [
        "💡 2.4GHz는 벽 투과력이 좋아 여러 방에서 사용하기 좋습니다",
        "💡 5GHz는 빠른 속도가 필요할 때 사용하세요",
        "💡 채널 1, 6, 11은 서로 간섭이 적습니다",
        "💡 습한 날씨는 WiFi 신호를 약하게 만듭니다",
        "💡 저녁 시간대는 다른 사용자들이 많아 간섭이 증가할 수 있습니다"
    ];
    
    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    
    // 힌트 표시
    const hintElement = document.createElement('div');
    hintElement.className = 'hint-tooltip';
    hintElement.textContent = randomHint;
    
    Object.assign(hintElement.style, {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#ffffff',
        color: '#000000',
        padding: '10px 20px',
        borderRadius: '0',
        fontSize: '14px',
        zIndex: '1000',
        opacity: '0',
        transition: 'opacity 0.3s ease',
        border: '1px solid #000000'
    });
    
    document.body.appendChild(hintElement);
    
    setTimeout(() => {
        hintElement.style.opacity = '1';
    }, 100);
    
    setTimeout(() => {
        hintElement.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(hintElement);
        }, 300);
    }, 4000);
}

// 주기적으로 힌트 표시
setInterval(showExperimentHint, 30000); // 30초마다
