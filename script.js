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
        
        // Update specs summary initially
        this.updateSpecsSummary();
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
        
        // Router specifications elements
        this.router24Power = document.getElementById('router24Power');
        this.router24PowerValue = document.getElementById('router24PowerValue');
        this.router24Channels = document.getElementById('router24Channels');
        this.router24Bandwidth = document.getElementById('router24Bandwidth');
        
        this.router5Power = document.getElementById('router5Power');
        this.router5PowerValue = document.getElementById('router5PowerValue');
        this.router5Channels = document.getElementById('router5Channels');
        this.router5Bandwidth = document.getElementById('router5Bandwidth');
        
        this.routerAntenna = document.getElementById('routerAntenna');
        this.routerHeight = document.getElementById('routerHeight');
        this.routerHeightValue = document.getElementById('routerHeightValue');
        this.routerLocation = document.getElementById('routerLocation');
        
        // Summary elements
        this.summary24 = document.getElementById('summary24');
        this.summary5 = document.getElementById('summary5');
        this.summaryAntenna = document.getElementById('summaryAntenna');
        this.summaryLocation = document.getElementById('summaryLocation');
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
        
        // Router specifications events
        this.router24Power.addEventListener('input', () => this.updateRouterSpecs());
        this.router24Channels.addEventListener('change', () => this.updateRouterSpecs());
        this.router24Bandwidth.addEventListener('change', () => this.updateRouterSpecs());
        
        this.router5Power.addEventListener('input', () => this.updateRouterSpecs());
        this.router5Channels.addEventListener('change', () => this.updateRouterSpecs());
        this.router5Bandwidth.addEventListener('change', () => this.updateRouterSpecs());
        
        this.routerAntenna.addEventListener('change', () => this.updateRouterSpecs());
        this.routerHeight.addEventListener('input', () => this.updateRouterSpecs());
        this.routerLocation.addEventListener('change', () => this.updateRouterSpecs());
    }

    initializeChart() {
        console.log('Initializing chart...');
        const ctx = this.elements.signalChart.getContext('2d');
        
        if (!ctx) {
            console.error('Failed to get canvas context!');
            return;
        }
        
        console.log('Canvas context obtained successfully');
        
        // Chart.js가 로드되었는지 확인
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded!');
            return;
        }
        
        console.log('Chart.js is available, creating chart...');
        
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
                    borderWidth: 3,
                    fill: false,
                    tension: 0.6, // 더 부드러운 곡선
                    pointRadius: 6, // 더 큰 포인트
                    pointBackgroundColor: '#000000',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 8,
                    pointHoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 500, // 더 긴 애니메이션
                    easing: 'easeInOutQuart' // 부드러운 이징
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
                            },
                            stepSize: 10 // 10dBm 단위로 표시
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
                            },
                            maxTicksLimit: 20 // X축 라벨 개수 제한
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
                        borderWidth: 2,
                        cornerRadius: 0,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `RSSI: ${context.parsed.y.toFixed(1)} dBm`;
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                elements: {
                    point: {
                        hoverBackgroundColor: '#000000',
                        hoverBorderColor: '#ffffff'
                    }
                }
            }
        });
        
        this.chartData = [];
        console.log('Chart initialization completed successfully');
        console.log('Chart object:', this.chart);
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
        
        // 실험 중일 때는 차트 데이터 추가 (updateUI에서 처리됨)
        // if (this.isExperimentRunning) {
        //     this.addChartData(finalRSSI);
        // }
    }

    updateChart() {
        if (!this.chart) {
            console.error('Chart is not initialized!');
            return;
        }
        
        console.log('Updating chart with data:', this.chartData);
        
        // 차트 데이터 업데이트
        this.chart.data.labels = this.chartData.map(d => d.time);
        this.chart.data.datasets[0].data = this.chartData.map(d => d.rssi);
        
        console.log('Chart labels:', this.chart.data.labels);
        console.log('Chart data:', this.chart.data.datasets[0].data);
        
        // 차트 업데이트 (애니메이션과 함께)
        this.chart.update('active');
        
        console.log('Chart updated successfully');
    }

    calculateBaseRSSI(frequency, distance, walls, power) {
        // 자유 공간 경로 손실 공식 기반 (5GHz는 더 큰 손실)
        let pathLoss = 20 * Math.log10(frequency) + 20 * Math.log10(distance) + 20 * Math.log10(4 * Math.PI / 3e8);
        
        // 벽 손실 (2.4GHz: 약 4dB, 5GHz: 약 8-12dB per wall)
        let wallLoss;
        if (frequency === 2.4) {
            wallLoss = walls * 4; // 2.4GHz: 4dB per wall
        } else {
            wallLoss = walls * 10; // 5GHz: 10dB per wall (더 큰 손실)
        }
        
        // 전송 파워 효과 (5GHz는 더 민감)
        let powerEffect;
        if (frequency === 2.4) {
            powerEffect = (power - 100) * 0.5;
        } else {
            powerEffect = (power - 100) * 0.8; // 5GHz는 파워 변화에 더 민감
        }
        
        // 기본 RSSI (주파수별로 다름, 항상 음수)
        let baseRSSI;
        if (frequency === 2.4) {
            baseRSSI = -30; // 2.4GHz 기본값
        } else {
            baseRSSI = -35; // 5GHz는 기본적으로 더 낮은 RSSI
        }
        
        // RSSI 계산 및 범위 제한 (-100 ~ -30 dBm)
        let calculatedRSSI = baseRSSI - pathLoss - wallLoss + powerEffect;
        return Math.max(-100, Math.min(-30, calculatedRSSI));
    }

    calculateInterferenceEffect(interference, channel, weather, time) {
        let totalInterference = 0;
        
        // 기본 간섭
        totalInterference += interference * 0.3;
        
        // 채널 간섭 (주파수별로 다름)
        if (this.elements.frequency.value === '2.4') {
            // 2.4GHz 채널 간섭
            if (channel === '1' || channel === '6' || channel === '11') {
                totalInterference += 5; // 최적 채널
            } else if (channel === 'auto') {
                totalInterference += 15; // 자동 선택은 간섭이 많을 수 있음
            } else {
                totalInterference += 25; // 인접 채널
            }
        } else {
            // 5GHz 채널 간섭 (일반적으로 더 적음)
            if (channel === '36' || channel === '40' || channel === '44' || channel === '48') {
                totalInterference += 3; // UNII-1 대역 (최적)
            } else if (channel === '149' || channel === '153' || channel === '157' || channel === '161') {
                totalInterference += 5; // UNII-3 대역 (DFS 채널, 간섭 적음)
            } else if (channel === 'auto') {
                totalInterference += 8; // 자동 선택
            } else {
                totalInterference += 10; // 기타 채널
            }
        }
        
        // 날씨 효과 (5GHz는 더 민감)
        let weatherEffect;
        switch(weather) {
            case 'rainy': weatherEffect = this.elements.frequency.value === '2.4' ? 20 : 35; break;
            case 'humid': weatherEffect = this.elements.frequency.value === '2.4' ? 15 : 25; break;
            case 'dry': weatherEffect = this.elements.frequency.value === '2.4' ? 5 : 8; break;
            default: weatherEffect = 0; break;
        }
        totalInterference += weatherEffect;
        
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
        // RSSI 기반 최대 속도 계산 (주파수별로 다른 특성)
        let maxSpeed;
        if (frequency === 2.4) {
            // 2.4GHz: 37 ~ 600 Mbps 범위로 제한
            maxSpeed = Math.max(37, Math.min(600, 600 * Math.pow(10, (rssi + 30) / 30)));
        } else {
            // 5GHz: 270 ~ 9600 Mbps 범위로 제한 (더 현실적인 계산)
            let rssiFactor = Math.max(0.1, (rssi + 100) / 70); // RSSI를 0~1 범위로 정규화
            maxSpeed = Math.max(270, Math.min(9600, 270 + (9600 - 270) * rssiFactor));
        }
        
        // 간섭에 의한 속도 감소 (주파수별로 다른 감소율)
        let interferenceFactor;
        if (frequency === 2.4) {
            interferenceFactor = Math.max(0.1, 1 - (interference / 150)); // 2.4GHz는 간섭에 덜 민감
        } else {
            interferenceFactor = Math.max(0.05, 1 - (interference / 120)); // 5GHz는 간섭에 더 민감
        }
        
        let actualMaxSpeed = maxSpeed * interferenceFactor;
        
        // 다운로드/업로드 속도 계산 (주파수별로 다른 비율)
        let downloadSpeed, uploadSpeed;
        
        if (frequency === 2.4) {
            // 2.4GHz: 다운로드 70-90%, 업로드 40-70%
            downloadSpeed = actualMaxSpeed * (0.7 + Math.random() * 0.2);
            uploadSpeed = actualMaxSpeed * (0.4 + Math.random() * 0.3);
        } else {
            // 5GHz: 다운로드 80-95%, 업로드 60-85% (더 균형잡힌 비율)
            downloadSpeed = actualMaxSpeed * (0.8 + Math.random() * 0.15);
            uploadSpeed = actualMaxSpeed * (0.6 + Math.random() * 0.25);
        }
        
        // 업로드 속도가 다운로드 속도를 넘지 않도록 보장
        uploadSpeed = Math.min(uploadSpeed, downloadSpeed * 0.9);
        
        return {
            download: Math.round(downloadSpeed),
            upload: Math.round(uploadSpeed)
        };
    }

    calculateQuality(rssi, interference) {
        let quality = 100;
        
        // RSSI 기반 품질 (음수 값 기준)
        if (rssi > -30) quality -= 0;        // -30dBm 이상: 우수
        else if (rssi > -50) quality -= 10;  // -50dBm ~ -30dBm: 양호
        else if (rssi > -70) quality -= 30;  // -70dBm ~ -50dBm: 보통
        else if (rssi > -90) quality -= 60;  // -90dBm ~ -70dBm: 나쁨
        else quality -= 80;                   // -90dBm 이하: 매우 나쁨
        
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
        
        let qualityText = quality > 80 ? '우수' : quality > 60 ? '양호' : quality > 40 ? '보통' : quality > 20 ? '나쁨' : '매우 나쁨';
        this.elements.qualityText.textContent = qualityText;
        
        // 간섭 미터 업데이트
        let interferencePercentage = Math.min(100, interference);
        this.elements.interferenceMeter.style.width = `${interferencePercentage}%`;
        
        let interferenceText = interference < 20 ? '낮음' : interference < 50 ? '보통' : interference < 80 ? '높음' : '매우 높음';
        this.elements.interferenceIndex.textContent = interferenceText;
        
        // 실험 중일 때만 차트 데이터 추가 (중복 방지)
        if (this.isExperimentRunning) {
            this.addChartData(rssi);
        }
    }

    addChartData(rssi) {
        // 더 부드러운 사인파 패턴을 위한 데이터 생성
        let time = this.currentTime;
        
        // 디버깅을 위한 콘솔 로그
        console.log(`Adding chart data: time=${time}, rssi=${rssi}`);
        
        // 기본 RSSI에 사인파 변동 추가 (더 명확한 패턴)
        let sineVariation = Math.sin(time * 0.2) * 8; // 진폭 8dBm, 주기 약 31초
        let cosineVariation = Math.cos(time * 0.1) * 5; // 코사인 변동 추가로 복합 패턴
        let noiseVariation = (Math.random() - 0.5) * 2; // 랜덤 노이즈 2dBm
        
        let enhancedRSSI = rssi + sineVariation + cosineVariation + noiseVariation;
        
        // RSSI 범위 제한 (-100 ~ -30 dBm) - 절대값이 아닌 실제 음수 범위
        enhancedRSSI = Math.max(-100, Math.min(-30, enhancedRSSI));
        
        console.log(`Enhanced RSSI: ${enhancedRSSI}, sine: ${sineVariation}, cosine: ${cosineVariation}`);
        
        this.chartData.push({ 
            time: time, 
            rssi: enhancedRSSI 
        });
        
        console.log(`Chart data length: ${this.chartData.length}`);
        
        // 최근 100개 데이터만 유지 (더 긴 패턴 표시)
        if (this.chartData.length > 100) {
            this.chartData.shift();
        }
        
        this.updateChart();
    }

    toggleExperiment() {
        if (this.isExperimentRunning) {
            this.stopExperiment();
        } else {
            this.startExperiment();
        }
    }

    startExperiment() {
        console.log('Starting experiment...');
        this.isExperimentRunning = true;
        this.elements.startExperiment.textContent = '실험 중지';
        this.elements.startExperiment.classList.remove('btn-primary');
        this.elements.startExperiment.classList.add('btn-secondary');
        
        // 실험 데이터 초기화
        this.currentTime = 0;
        this.chartData = [];
        
        console.log('Chart data reset, current time:', this.currentTime);
        
        // 차트 초기화
        if (this.chart) {
            console.log('Resetting chart...');
            this.chart.data.labels = [];
            this.chart.data.datasets[0].data = [];
            this.chart.update();
        } else {
            console.error('Chart is null during experiment start!');
        }
        
        // 초기 데이터 포인트 추가
        this.updateCalculations();
        
        // 실시간 업데이트 시작 (더 빠른 업데이트로 부드러운 사인파)
        this.experimentInterval = setInterval(() => {
            this.currentTime += 1;
            console.log(`Experiment tick: ${this.currentTime}`);
            this.updateCalculations();
        }, 500); // 0.5초마다 업데이트 (더 부드러운 곡선)
        
        // 성공 메시지
        this.showNotification('실험이 시작되었습니다!', 'success');
        console.log('Experiment started successfully');
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

    updateSpecsSummary() {
        // Update 2.4GHz summary
        const power24 = this.router24Power.value;
        const channel24 = this.router24Channels.options[this.router24Channels.selectedIndex].text;
        const bandwidth24 = this.router24Bandwidth.value;
        this.summary24.textContent = `${power24}mW, ${channel24}, ${bandwidth24}MHz`;
        
        // Update 5GHz summary
        const power5 = this.router5Power.value;
        const channel5 = this.router5Channels.options[this.router5Channels.selectedIndex].text;
        const bandwidth5 = this.router5Bandwidth.value;
        this.summary5.textContent = `${power5}mW, ${channel5}, ${bandwidth5}MHz`;
        
        // Update antenna summary
        const antenna = this.routerAntenna.options[this.routerAntenna.selectedIndex].text;
        this.summaryAntenna.textContent = antenna;
        
        // Update location summary
        const location = this.routerLocation.options[this.routerLocation.selectedIndex].text;
        const height = this.routerHeight.value;
        this.summaryLocation.textContent = `${location}, ${height}m 높이`;
    }

    updateRouterSpecs() {
        // Update value displays
        this.router24PowerValue.textContent = `${this.router24Power.value} mW`;
        this.router5PowerValue.textContent = `${this.router5Power.value} mW`;
        this.routerHeightValue.textContent = `${this.routerHeight.value} m`;
        
        // Update summary
        this.updateSpecsSummary();
        
        // If experiment is running, recalculate with new specs
        if (this.isExperimentRunning) {
            this.updateCalculations();
        }
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
