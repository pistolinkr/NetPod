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
        
        // 차트 초기화 완료 후 데이터 추가를 위한 지연
        setTimeout(() => {
            this.loadDefaultValues();
            
            // Update specs summary and dynamic messages initially
            this.updateSpecsSummary();
            this.updateDynamicMessages();
            this.updateBroadbandMessages();
        }, 200); // 차트 초기화를 위한 충분한 시간
        
        // Initialize drag and drop for settings button
        this.initializeDragAndDrop();
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
        
        // Broadband specifications elements
        this.maxDownloadSpeed = document.getElementById('maxDownloadSpeed');
        this.downloadSpeedUnit = document.getElementById('downloadSpeedUnit');
        this.downloadSpeedStability = document.getElementById('downloadSpeedStability');
        this.maxUploadSpeed = document.getElementById('maxUploadSpeed');
        this.uploadSpeedUnit = document.getElementById('uploadSpeedUnit');
        this.uploadSpeedStability = document.getElementById('uploadSpeedStability');
        this.internetType = document.getElementById('internetType');
        this.networkCongestion = document.getElementById('networkCongestion');
        
        // Broadband summary elements
        this.summaryDownload = document.getElementById('summaryDownload');
        this.summaryUpload = document.getElementById('summaryUpload');
        this.summaryInternet = document.getElementById('summaryInternet');
        
        // JSON import elements
        this.jsonFileInput = document.getElementById('jsonFileInput');
        this.selectJsonFile = document.getElementById('selectJsonFile');
        this.selectedFileName = document.getElementById('selectedFileName');
        this.overwriteCurrent = document.getElementById('overwriteCurrent');
        this.loadChartData = document.getElementById('loadChartData');
        this.loadRouterSpecs = document.getElementById('loadRouterSpecs');
        this.loadBroadbandSpecs = document.getElementById('loadBroadbandSpecs');
        this.loadJsonResults = document.getElementById('loadJsonResults');
        this.importStatus = document.getElementById('importStatus');
        
        // Settings button and modal elements
        this.settingsButton = document.getElementById('settingsButton');
        this.settingsModal = document.getElementById('settingsModal');
        this.closeSettings = document.getElementById('closeSettings');
        
        this.settingsButton.addEventListener('click', () => this.openSettings());
        this.closeSettings.addEventListener('click', () => this.closeSettingsModal());
        
        // 모달 외부 클릭 시 닫기
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettingsModal();
            }
        });
        
        // ESC 키로 모달 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.settingsModal.classList.contains('show')) {
                this.closeSettingsModal();
            }
        });
        
        // Navigation button events
        this.navStartExperiment = document.getElementById('navStartExperiment');
        this.navResetExperiment = document.getElementById('navResetExperiment');
        this.navLoadResults = document.getElementById('navLoadResults');
        this.navJsonFileInput = document.getElementById('navJsonFileInput');
        
        this.navStartExperiment.addEventListener('click', () => this.toggleExperiment());
        this.navResetExperiment.addEventListener('click', () => this.resetExperiment());
        this.navLoadResults.addEventListener('click', () => this.navJsonFileInput.click());
        this.navJsonFileInput.addEventListener('change', (e) => this.handleNavFileSelection(e));
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
        
        // Broadband specifications events
        this.maxDownloadSpeed.addEventListener('input', () => this.updateBroadbandSpecs());
        this.downloadSpeedUnit.addEventListener('change', () => this.updateBroadbandSpecs());
        this.downloadSpeedStability.addEventListener('change', () => this.updateBroadbandSpecs());
        this.maxUploadSpeed.addEventListener('input', () => this.updateBroadbandSpecs());
        this.uploadSpeedUnit.addEventListener('change', () => this.updateBroadbandSpecs());
        this.uploadSpeedStability.addEventListener('change', () => this.updateBroadbandSpecs());
        this.internetType.addEventListener('change', () => this.updateBroadbandSpecs());
        this.networkCongestion.addEventListener('change', () => this.updateBroadbandSpecs());
        
        // JSON import events
        this.selectJsonFile.addEventListener('click', () => this.jsonFileInput.click());
        this.jsonFileInput.addEventListener('change', (e) => this.handleFileSelection(e));
        this.loadJsonResults.addEventListener('click', () => this.loadJsonFile());
        
        // Settings button events
        this.settingsButton.addEventListener('click', () => this.openSettings());
        this.closeSettings.addEventListener('click', () => this.closeSettingsModal());
        
        // 모달 외부 클릭 시 닫기
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettingsModal();
            }
        });
        
        // ESC 키로 모달 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.settingsModal.classList.contains('show')) {
                this.closeSettingsModal();
            }
        });
        
        // Navigation button events
        this.navStartExperiment = document.getElementById('navStartExperiment');
        this.navResetExperiment = document.getElementById('navResetExperiment');
        this.navLoadResults = document.getElementById('navLoadResults');
        this.navJsonFileInput = document.getElementById('navJsonFileInput');
        
        this.navStartExperiment.addEventListener('click', () => this.toggleExperiment());
        this.navResetExperiment.addEventListener('click', () => this.resetExperiment());
        this.navLoadResults.addEventListener('click', () => this.navJsonFileInput.click());
        this.navJsonFileInput.addEventListener('change', (e) => this.handleNavFileSelection(e));
    }

    initializeChart() {
        // Chart.js가 로드되었는지 확인
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded! Please check if Chart.js is included in the HTML.');
            this.showChartError('Chart.js가 로드되지 않았습니다. HTML에 Chart.js 스크립트를 포함해주세요.');
            return;
        }

        // Canvas 요소 찾기
        const canvas = document.getElementById('signalChart');
        if (!canvas) {
            console.error('Signal chart canvas not found!');
            this.showChartError('차트 캔버스를 찾을 수 없습니다.');
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Failed to get canvas context!');
            this.showChartError('캔버스 컨텍스트를 가져올 수 없습니다.');
            return;
        }

        console.log('Canvas found, dimensions:', canvas.offsetWidth, 'x', canvas.offsetHeight);

        try {
            // Chart.js 설정
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'RSSI (dBm)',
                        data: [],
                        borderColor: '#000000',
                        backgroundColor: 'rgba(0, 0, 0, 0.05)', // Lighter fill
                        borderWidth: 2, // Thinner line
                        fill: true, // Fill area below line
                        tension: 0.4, // Smoother curve
                        pointRadius: 4, // Smaller points
                        pointBackgroundColor: '#000000',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 1,
                        pointHoverRadius: 6,
                        pointHoverBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 300, // Faster animation
                        easing: 'easeInOutQuart'
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: -100,
                            max: -30,
                            grid: {
                                color: '#e0e0e0', // Lighter grid
                                lineWidth: 1
                            },
                            ticks: {
                                color: '#666666', // Lighter ticks
                                font: {
                                    size: 11 // Smaller font
                                },
                                stepSize: 10
                            },
                            title: {
                                display: true,
                                text: 'RSSI (dBm)',
                                color: '#000000',
                                font: {
                                    size: 13, // Smaller font
                                    weight: '600' // Lighter weight
                                }
                            }
                        },
                        x: {
                            grid: {
                                color: '#e0e0e0', // Lighter grid
                                lineWidth: 1
                            },
                            ticks: {
                                color: '#666666', // Lighter ticks
                                font: {
                                    size: 11 // Smaller font
                                },
                                maxTicksLimit: 15 // Fewer ticks
                            },
                            title: {
                                display: true,
                                text: '시간 (초)',
                                color: '#000000',
                                font: {
                                    size: 13, // Smaller font
                                    weight: '600' // Lighter weight
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
                                    size: 12,
                                    weight: '500' // Added weight
                                }
                            }
                        },
                        tooltip: { // Re-added tooltip
                            backgroundColor: '#ffffff',
                            titleColor: '#000000',
                            bodyColor: '#000000',
                            borderColor: '#000000',
                            borderWidth: 1,
                            cornerRadius: 4,
                            displayColors: false,
                            callbacks: {
                                label: function(context) {
                                    return `RSSI: ${context.parsed.y.toFixed(1)} dBm`;
                                }
                            }
                        }
                    },
                    interaction: { // Re-added interaction
                        intersect: false,
                        mode: 'index'
                    }
                }
            });

            console.log('Chart initialized successfully, chart object:', this.chart);
            
            // 차트가 제대로 생성되었는지 확인
            if (this.chart && this.chart.data && this.chart.data.datasets) {
                console.log('Chart verification successful, datasets:', this.chart.data.datasets.length);
                // 초기 데이터 추가 (빈 차트 방지)
                this.addInitialChartData();
            } else {
                console.error('Chart verification failed!');
            }
            
        } catch (error) {
            console.error('Error initializing chart:', error);
            this.showChartError(`차트 초기화 오류: ${error.message}`);
        }
    }

    // 차트 에러 표시
    showChartError(message) {
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px;">
                    <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
                    <div style="font-size: 16px; margin-bottom: 10px; font-weight: 600;">차트를 불러올 수 없습니다</div>
                    <div style="font-size: 14px; color: #888;">${message}</div>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">페이지 새로고침</button>
                </div>
            `;
        }
    }

    // 초기 차트 데이터 추가 (빈 차트 방지)
    addInitialChartData() {
        if (!this.chart) return;
        
        // 기존 데이터 초기화
        this.chartData = [];
        
        // 샘플 데이터 생성 (100개 포인트로 증가)
        for (let i = 0; i < 100; i++) {
            const time = i;
            const baseRSSI = -60; // 기본 RSSI 값
            
            // 더 명확한 사인파 패턴 생성
            const sineVariation = Math.sin(i * 0.3) * 15; // 진폭 증가, 주기 조정
            const cosineVariation = Math.cos(i * 0.15) * 8; // 코사인 변동
            const noiseVariation = (Math.random() - 0.5) * 3; // 노이즈 증가
            
            let rssi = baseRSSI + sineVariation + cosineVariation + noiseVariation;
            rssi = Math.max(-100, Math.min(-30, rssi));
            
            this.chartData.push({ time, rssi });
        }
        
        this.updateChart();
        console.log('Initial chart data added:', this.chartData.length, 'points');
        
        // 차트가 제대로 표시되는지 확인
        if (this.chart && this.chart.data && this.chart.data.datasets[0].data.length > 0) {
            console.log('Chart data verified:', this.chart.data.datasets[0].data.length, 'points');
        } else {
            console.error('Chart data verification failed!');
        }
    }

    loadDefaultValues() {
        // 기본값으로 계산 실행
        this.updateCalculations();
        
        // 차트가 완전히 초기화되었는지 확인 후 초기 데이터 추가
        if (this.chart && this.chart.data && this.chart.data.datasets) {
            console.log('Chart is ready, adding initial data...');
            if (this.chartData.length === 0) {
                this.addInitialChartData();
            }
        } else {
            console.log('Chart not ready yet, waiting...');
            // 차트가 준비되지 않았다면 다시 시도
            setTimeout(() => {
                this.loadDefaultValues();
            }, 100);
        }
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
        
        if (!this.chartData || this.chartData.length === 0) {
            console.log('No chart data available for update');
            return;
        }
        
        console.log('Updating chart with', this.chartData.length, 'data points');
        
        try {
            // 차트 데이터 업데이트
            this.chart.data.labels = this.chartData.map(point => point.time);
            this.chart.data.datasets[0].data = this.chartData.map(point => point.rssi);
            
            // 차트 업데이트 (애니메이션 없이)
            this.chart.update('none');
            
            console.log('Chart updated successfully with', this.chart.data.datasets[0].data.length, 'points');
            
            // 차트 컨테이너가 보이는지 확인
            const chartContainer = document.querySelector('.chart-container');
            if (chartContainer) {
                console.log('Chart container found, dimensions:', chartContainer.offsetWidth, 'x', chartContainer.offsetHeight);
            } else {
                console.error('Chart container not found!');
            }
            
        } catch (error) {
            console.error('Error updating chart:', error);
        }
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
        
        // 차트 데이터 추가 - 차트 상태를 안전하게 확인
        if (this.isExperimentRunning) {
            this.addChartData(rssi);
        } else if (this.chartData.length === 0 && this.chart && this.chart.data) {
            // 실험 중이 아니고 차트 데이터가 없으며 차트가 준비된 경우에만 초기 데이터 생성
            console.log('Adding initial chart data in updateUI...');
            this.addInitialChartData();
        }
    }

    addChartData(rssi) {
        // 차트가 준비되지 않았으면 데이터만 저장하고 차트 업데이트는 하지 않음
        if (!this.chart || !this.chart.data || !this.chart.data.datasets) {
            console.log('Chart not ready, storing data only');
            // 데이터는 저장
            let time = this.currentTime;
            let sineVariation = Math.sin(time * 0.2) * 8;
            let cosineVariation = Math.cos(time * 0.1) * 5;
            let noiseVariation = (Math.random() - 0.5) * 2;
            
            let enhancedRSSI = rssi + sineVariation + cosineVariation + noiseVariation;
            enhancedRSSI = Math.max(-100, Math.min(-30, enhancedRSSI));
            
            this.chartData.push({ time, rssi: enhancedRSSI });
            
            // 최근 100개 데이터만 유지
            if (this.chartData.length > 100) {
                this.chartData.shift();
            }
            return;
        }
        
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
        
        // 네비게이션 버튼 업데이트
        if (this.navStartExperiment) {
            this.navStartExperiment.innerHTML = '<span class="btn-icon">⏸️</span><span class="btn-text">실험 중지</span>';
            this.navStartExperiment.classList.remove('nav-btn-primary');
            this.navStartExperiment.classList.add('nav-btn-secondary');
        }
        
        // 기존 버튼 업데이트 (아직 남아있다면)
        if (this.elements.startExperiment) {
            this.elements.startExperiment.textContent = '실험 중지';
            this.elements.startExperiment.classList.remove('btn-primary');
            this.elements.startExperiment.classList.add('btn-secondary');
        }
        
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
        
        // 사용자 피드백
        this.showExperimentStatus('실험이 시작되었습니다! 🚀', 'success');
    }

    stopExperiment() {
        console.log('Stopping experiment...');
        this.isExperimentRunning = false;
        
        // 네비게이션 버튼 업데이트
        if (this.navStartExperiment) {
            this.navStartExperiment.innerHTML = '<span class="btn-icon">▶️</span><span class="btn-text">실험 시작</span>';
            this.navStartExperiment.classList.remove('nav-btn-secondary');
            this.navStartExperiment.classList.add('nav-btn-primary');
        }
        
        // 기존 버튼 업데이트 (아직 남아있다면)
        if (this.elements.startExperiment) {
            this.elements.startExperiment.textContent = '실험 시작';
            this.elements.startExperiment.classList.remove('btn-secondary');
            this.elements.startExperiment.classList.add('btn-primary');
        }
        
        if (this.experimentInterval) {
            clearInterval(this.experimentInterval);
            this.experimentInterval = null;
        }
        
        // 사용자 피드백
        this.showExperimentStatus('실험이 중지되었습니다. 📊', 'info');
    }

    // 실험 상태 표시
    showExperimentStatus(message, type) {
        const status = document.createElement('div');
        status.className = `experiment-status ${type}`;
        status.textContent = message;
        
        Object.assign(status.style, {
            position: 'fixed',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: type === 'success' ? 'rgba(40, 167, 69, 0.9)' : 'rgba(0, 123, 255, 0.9)',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '600',
            zIndex: '1000',
            opacity: '0',
            transition: 'opacity 0.3s ease',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        });
        
        document.body.appendChild(status);
        
        // 페이드 인
        setTimeout(() => status.style.opacity = '1', 100);
        
        // 3초 후 페이드 아웃
        setTimeout(() => {
            status.style.opacity = '0';
            setTimeout(() => document.body.removeChild(status), 300);
        }, 3000);
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
            experimentSettings: {
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
            routerSpecs: {
                power24: this.router24Power.value,
                channel24: this.router24Channels.value,
                bandwidth24: this.router24Bandwidth.value,
                power5: this.router5Power.value,
                channel5: this.router5Channels.value,
                bandwidth5: this.router5Bandwidth.value,
                antenna: this.routerAntenna.value,
                height: this.routerHeight.value,
                location: this.routerLocation.value
            },
            broadbandSpecs: {
                maxDownloadSpeed: this.maxDownloadSpeed.value,
                downloadSpeedUnit: this.downloadSpeedUnit.value,
                downloadSpeedStability: this.downloadSpeedStability.value,
                maxUploadSpeed: this.maxUploadSpeed.value,
                uploadSpeedUnit: this.uploadSpeedUnit.value,
                uploadSpeedStability: this.uploadSpeedStability.value,
                internetType: this.internetType.value,
                networkCongestion: this.networkCongestion.value
            },
            chartData: this.chartData
        };
        
        // JSON 파일로 다운로드
        const dataStr = JSON.stringify(experimentData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `netpod_experiment_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
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
        
        // Update dynamic messages
        this.updateDynamicMessages();
        
        // Update summary
        this.updateSpecsSummary();
        
        // If experiment is running, recalculate with new specs
        if (this.isExperimentRunning) {
            this.updateCalculations();
        }
    }

    updateBroadbandSpecs() {
        // Update value displays
        this.summaryDownload.textContent = `${this.maxDownloadSpeed.value} Mbps`;
        this.summaryUpload.textContent = `${this.maxUploadSpeed.value} Mbps`;
        this.summaryInternet.textContent = `${this.internetType.options[this.internetType.selectedIndex].text}`;

        // Update dynamic messages
        this.updateDynamicMessages();

        // If experiment is running, recalculate with new specs
        if (this.isExperimentRunning) {
            this.updateCalculations();
        }
    }

    updateDynamicMessages() {
        // 2.4GHz Power message
        const power24 = parseInt(this.router24Power.value);
        let power24Message = "";
        if (power24 <= 50) {
            power24Message = `${power24}mW 설정: 배터리 절약 모드, 간섭 최소화, 범위 제한적`;
        } else if (power24 <= 100) {
            power24Message = `${power24}mW 설정: 균형잡힌 성능, 일반적인 가정 환경에 적합`;
        } else {
            power24Message = `${power24}mW 설정: 범위 확장, 높은 신호 강도, 간섭 가능성 증가`;
        }
        document.getElementById('power24Message').querySelector('.message-text').textContent = power24Message;

        // 2.4GHz Channel message
        const channel24 = this.router24Channels.value;
        let channel24Message = "";
        if (channel24 === "1") {
            channel24Message = "채널 1 선택됨: 다른 2.4GHz 장치와 간섭 최소화, 다만 블루투스와 간섭 가능성";
        } else if (channel24 === "6") {
            channel24Message = "채널 6 선택됨: 다른 2.4GHz 장치와 간섭 최소화, 가장 안정적인 선택";
        } else if (channel24 === "11") {
            channel24Message = "채널 11 선택됨: 다른 2.4GHz 장치와 간섭 최소화, 마이크로웨이브와 간섭 가능성";
        } else {
            channel24Message = "자동 선택: 환경에 따라 최적 채널 자동 선택, 간헐적 채널 변경 가능";
        }
        document.getElementById('channel24Message').querySelector('.message-text').textContent = channel24Message;

        // 2.4GHz Bandwidth message
        const bandwidth24 = this.router24Bandwidth.value;
        let bandwidth24Message = "";
        if (bandwidth24 === "20") {
            bandwidth24Message = "20MHz 선택됨: 최대 안정성, 간섭 최소화, 다만 속도 제한적";
        } else {
            bandwidth24Message = "40MHz 선택됨: 속도 향상, 다만 간섭 가능성 증가, 채널 겹침 주의";
        }
        document.getElementById('bandwidth24Message').querySelector('.message-text').textContent = bandwidth24Message;

        // 5GHz Power message
        const power5 = parseInt(this.router5Power.value);
        let power5Message = "";
        if (power5 <= 100) {
            power5Message = `${power5}mW 설정: 5GHz는 낮은 파워로도 충분, 배터리 절약 및 간섭 감소`;
        } else if (power5 <= 500) {
            power5Message = `${power5}mW 설정: 5GHz 표준 파워, 균형잡힌 성능, 대부분 환경에 적합`;
        } else {
            power5Message = `${power5}mW 설정: 5GHz 고파워, 범위 확장 시도, 다만 벽 투과력 한계`;
        }
        document.getElementById('power5Message').querySelector('.message-text').textContent = power5Message;

        // 5GHz Channel message
        const channel5 = this.router5Channels.value;
        let channel5Message = "";
        if (channel5 === "auto") {
            channel5Message = "자동 선택: 환경에 따라 최적 채널 자동 선택, DFS 채널 활용 가능";
        } else if (parseInt(channel5) <= 48) {
            channel5Message = `채널 ${channel5} 선택됨: 낮은 주파수, DFS 제한 가능성, 실내 사용 권장`;
        } else {
            channel5Message = `채널 ${channel5} 선택됨: 높은 주파수, DFS 제한 없음, 안정적인 신호 전송`;
        }
        document.getElementById('channel5Message').querySelector('.message-text').textContent = channel5Message;

        // 5GHz Bandwidth message
        const bandwidth5 = this.router5Bandwidth.value;
        let bandwidth5Message = "";
        if (bandwidth5 === "20") {
            bandwidth5Message = "20MHz 선택됨: 최대 안정성, 간섭 최소화, 다만 속도 제한적";
        } else if (bandwidth5 === "40") {
            bandwidth5Message = "40MHz 선택됨: 속도 향상, 안정성 유지, 대부분 환경에 적합";
        } else if (bandwidth5 === "80") {
            bandwidth5Message = "80MHz 선택됨: 속도와 안정성의 균형, 대부분 환경에 적합";
        } else {
            bandwidth5Message = "160MHz 선택됨: 최고 속도, 다만 간섭에 민감, 깨끗한 환경 필요";
        }
        document.getElementById('bandwidth5Message').querySelector('.message-text').textContent = bandwidth5Message;

        // Antenna message
        const antenna = this.routerAntenna.value;
        let antennaMessage = "";
        if (antenna === "internal") {
            antennaMessage = "내장 안테나 선택됨: 간섭 최소화, 다만 범위 제한적, 소형 장치에 적합";
        } else if (antenna === "external") {
            antennaMessage = "외장 안테나 (3dBi) 선택됨: 균형잡힌 성능, 범위와 안정성 조화, 일반적인 선택";
        } else {
            antennaMessage = "고이득 안테나 (6dBi) 선택됨: 범위 확장, 다만 간섭 증가, 넓은 공간에 적합";
        }
        document.getElementById('antennaMessage').querySelector('.message-text').textContent = antennaMessage;

        // Height message
        const height = parseFloat(this.routerHeight.value);
        let heightMessage = "";
        if (height <= 1.0) {
            heightMessage = `${height}m 높이: 특정 구역 집중 신호, 다만 범위 제한적, 작은 공간에 적합`;
        } else if (height <= 2.0) {
            heightMessage = `${height}m 높이: 일반적인 가정 환경에 적합, 균형잡힌 신호 분포`;
        } else {
            heightMessage = `${height}m 높이: 범위 확장, 전체 공간 커버, 다만 특정 구역 신호 약화 가능`;
        }
        document.getElementById('heightMessage').querySelector('.message-text').textContent = heightMessage;

        // Location message
        const location = this.routerLocation.value;
        let locationMessage = "";
        if (location === "center") {
            locationMessage = "중앙 설치: 균등한 신호 분포, 모든 방에 고른 신호, 다만 벽 반사 효과 제한적";
        } else if (location === "corner") {
            locationMessage = "구석 설치: 특정 방에 집중된 신호, 벽 반사 효과 활용, 다만 반대편 신호 약화";
        } else if (location === "wall") {
            locationMessage = "벽면 설치: 한쪽 방향 신호 집중, 벽 투과력 향상, 다만 반대편 신호 약화";
        } else {
            locationMessage = "천장 설치: 전체 범위 확장, 모든 방에 고른 신호, 다만 설치 및 관리 복잡";
        }
        document.getElementById('locationMessage').querySelector('.message-text').textContent = locationMessage;
        
        // Broadband dynamic messages
        this.updateBroadbandMessages();
    }

    updateBroadbandMessages() {
        // Download speed message
        const downloadSpeed = parseInt(this.maxDownloadSpeed.value);
        const downloadUnit = this.downloadSpeedUnit.value;
        let downloadSpeedMessage = "";
        if (downloadSpeed <= 100) {
            downloadSpeedMessage = `${downloadSpeed}${downloadUnit} 설정: 기본 인터넷 환경, 웹서핑과 이메일 충분`;
        } else if (downloadSpeed <= 500) {
            downloadSpeedMessage = `${downloadSpeed}${downloadUnit} 설정: 중급 인터넷 환경, HD 스트리밍과 온라인 게임 가능`;
        } else if (downloadSpeed <= 1000) {
            downloadSpeedMessage = `${downloadSpeed}${downloadUnit} 설정: 기가비트 인터넷 환경, 고속 다운로드와 4K 스트리밍`;
        } else {
            downloadSpeedMessage = `${downloadSpeed}${downloadUnit} 설정: 초고속 인터넷 환경, 대용량 파일 전송과 멀티태스킹`;
        }
        document.getElementById('downloadSpeedMessage').querySelector('.message-text').textContent = downloadSpeedMessage;

        // Download stability message
        const downloadStability = this.downloadSpeedStability.value;
        let downloadStabilityMessage = "";
        if (downloadStability === "stable") {
            downloadStabilityMessage = "안정적 선택: 일정한 속도 유지, 스트리밍과 게임에 최적, 지연시간 최소화";
        } else if (downloadStability === "moderate") {
            downloadStabilityMessage = "보통 선택: 약간의 속도 변동, 일반적인 인터넷 사용에 적합";
        } else {
            downloadStabilityMessage = "불안정 선택: 속도 변동이 큼, 다만 비용 절약, 간헐적 사용에 적합";
        }
        document.getElementById('downloadStabilityMessage').querySelector('.message-text').textContent = downloadStabilityMessage;

        // Upload speed message
        const uploadSpeed = parseInt(this.maxUploadSpeed.value);
        const uploadUnit = this.uploadSpeedUnit.value;
        let uploadSpeedMessage = "";
        if (uploadSpeed <= 20) {
            uploadSpeedMessage = `${uploadSpeed}${uploadUnit} 설정: 기본 업로드 환경, 이메일과 소셜미디어 충분`;
        } else if (uploadSpeed <= 50) {
            uploadSpeedMessage = `${uploadSpeed}${uploadUnit} 설정: 중급 업로드 환경, 화상회의와 클라우드 백업 가능`;
        } else if (uploadSpeed <= 100) {
            uploadSpeedMessage = `${uploadSpeed}${uploadUnit} 설정: 고속 업로드 환경, 대용량 파일 업로드와 라이브 스트리밍`;
        } else {
            uploadSpeedMessage = `${uploadSpeed}${uploadUnit} 설정: 초고속 업로드 환경, 전문가급 콘텐츠 제작과 클라우드 작업`;
        }
        document.getElementById('uploadSpeedMessage').querySelector('.message-text').textContent = uploadSpeedMessage;

        // Upload stability message
        const uploadStability = this.uploadSpeedStability.value;
        let uploadStabilityMessage = "";
        if (uploadStability === "stable") {
            uploadStabilityMessage = "안정적 선택: 원격 작업과 클라우드 업로드에 최적, 지연시간 최소화";
        } else if (uploadStability === "moderate") {
            uploadStabilityMessage = "보통 선택: 약간의 속도 변동, 일반적인 업로드 작업에 적합";
        } else {
            uploadStabilityMessage = "불안정 선택: 속도 변동이 큼, 다만 비용 절약, 간헐적 업로드에 적합";
        }
        document.getElementById('uploadStabilityMessage').querySelector('.message-text').textContent = uploadStabilityMessage;

        // Internet type message
        const internetType = this.internetType.value;
        let internetTypeMessage = "";
        if (internetType === "fiber") {
            internetTypeMessage = "광케이블 선택: 최고 속도와 안정성, 낮은 지연시간, 대부분 환경에 최적";
        } else if (internetType === "cable") {
            internetTypeMessage = "케이블 선택: 안정적인 속도, 다만 공유 사용자에 따른 속도 변동 가능";
        } else if (internetType === "dsl") {
            internetTypeMessage = "DSL 선택: 안정적인 연결, 다만 속도 제한적, 거리에 따른 성능 저하";
        } else {
            internetTypeMessage = "무선 선택: 이동성과 편의성, 다만 날씨와 환경에 따른 성능 변동";
        }
        document.getElementById('internetTypeMessage').querySelector('.message-text').textContent = internetTypeMessage;

        // Network congestion message
        const congestion = this.networkCongestion.value;
        let congestionMessage = "";
        if (congestion === "low") {
            congestionMessage = "낮은 혼잡도: 최대 속도 달성, 안정적인 연결, 새벽/아침 시간대 특성";
        } else if (congestion === "medium") {
            congestionMessage = "보통 혼잡도: 약간의 속도 저하, 일반적인 인터넷 사용에 적합";
        } else {
            congestionMessage = "높은 혼잡도: 속도 저하 가능, 다만 대부분 서비스 정상 이용 가능";
        }
        document.getElementById('congestionMessage').querySelector('.message-text').textContent = congestionMessage;
    }

    handleFileSelection(event) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFileName.textContent = file.name;
            this.loadJsonResults.disabled = false;
            this.showImportStatus('파일이 선택되었습니다. "결과 불러오기" 버튼을 클릭하세요.', 'info');
        }
    }

    handleNavFileSelection(event) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFileName.textContent = file.name;
            this.loadJsonResults.disabled = false;
            this.showImportStatus('파일이 선택되었습니다. "결과 불러오기" 버튼을 클릭하세요.', 'info');
        }
    }

    loadJsonFile() {
        const file = this.jsonFileInput.files[0];
        if (!file) {
            this.showImportStatus('파일을 먼저 선택해주세요.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                this.processJsonData(jsonData);
                this.showImportStatus('JSON 파일을 성공적으로 불러왔습니다!', 'success');
            } catch (error) {
                this.showImportStatus(`JSON 파싱 오류: ${error.message}`, 'error');
            }
        };
        reader.onerror = () => {
            this.showImportStatus('파일 읽기 오류가 발생했습니다.', 'error');
        };
        reader.readAsText(file);
    }

    processJsonData(data) {
        try {
            // Load chart data if enabled
            if (this.loadChartData.checked && data.chartData) {
                this.loadChartDataFromJson(data.chartData);
            }

            // Load router specifications if enabled
            if (this.loadRouterSpecs.checked && data.routerSpecs) {
                this.loadRouterSpecsFromJson(data.routerSpecs);
            }

            // Load broadband specifications if enabled
            if (this.loadBroadbandSpecs.checked && data.broadbandSpecs) {
                this.loadBroadbandSpecsFromJson(data.broadbandSpecs);
            }

            // Load experiment settings if enabled
            if (this.overwriteCurrent.checked && data.experimentSettings) {
                this.loadExperimentSettingsFromJson(data.experimentSettings);
            }

            // Update all displays
            this.updateAllDisplays();
            
        } catch (error) {
            this.showImportStatus(`데이터 처리 오류: ${error.message}`, 'error');
        }
    }

    loadChartDataFromJson(chartData) {
        if (Array.isArray(chartData)) {
            this.chartData = chartData.map(item => ({
                time: item.time || 0,
                rssi: item.rssi || -50
            }));
            this.updateChart();
        }
    }

    loadRouterSpecsFromJson(routerSpecs) {
        if (routerSpecs.power24) this.router24Power.value = routerSpecs.power24;
        if (routerSpecs.channel24) this.router24Channels.value = routerSpecs.channel24;
        if (routerSpecs.bandwidth24) this.router24Bandwidth.value = routerSpecs.bandwidth24;
        if (routerSpecs.power5) this.router5Power.value = routerSpecs.power5;
        if (routerSpecs.channel5) this.router5Channels.value = routerSpecs.channel5;
        if (routerSpecs.bandwidth5) this.router5Bandwidth.value = routerSpecs.bandwidth5;
        if (routerSpecs.antenna) this.routerAntenna.value = routerSpecs.antenna;
        if (routerSpecs.height) this.routerHeight.value = routerSpecs.height;
        if (routerSpecs.location) this.routerLocation.value = routerSpecs.location;
        
        // 설정 값 변경 후 UI 업데이트
        this.updateRouterSpecs();
    }

    loadBroadbandSpecsFromJson(broadbandSpecs) {
        if (broadbandSpecs.maxDownloadSpeed) this.maxDownloadSpeed.value = broadbandSpecs.maxDownloadSpeed;
        if (broadbandSpecs.downloadSpeedUnit) this.downloadSpeedUnit.value = broadbandSpecs.downloadSpeedUnit;
        if (broadbandSpecs.downloadSpeedStability) this.downloadSpeedStability.value = broadbandSpecs.downloadSpeedStability;
        if (broadbandSpecs.maxUploadSpeed) this.maxUploadSpeed.value = broadbandSpecs.maxUploadSpeed;
        if (broadbandSpecs.uploadSpeedUnit) this.uploadSpeedUnit.value = broadbandSpecs.uploadSpeedUnit;
        if (broadbandSpecs.uploadSpeedStability) this.uploadSpeedStability.value = broadbandSpecs.uploadSpeedStability;
        if (broadbandSpecs.internetType) this.internetType.value = broadbandSpecs.internetType;
        if (broadbandSpecs.networkCongestion) this.networkCongestion.value = broadbandSpecs.networkCongestion;
        
        // 설정 값 변경 후 UI 업데이트
        this.updateBroadbandSpecs();
    }

    loadExperimentSettingsFromJson(experimentSettings) {
        if (experimentSettings.frequency) this.elements.frequency.value = experimentSettings.frequency;
        if (experimentSettings.distance) this.elements.distance.value = experimentSettings.distance;
        if (experimentSettings.walls) this.elements.walls.value = experimentSettings.walls;
        if (experimentSettings.interference) this.elements.interference.value = experimentSettings.interference;
        if (experimentSettings.channel) this.elements.channel.value = experimentSettings.channel;
        if (experimentSettings.power) this.elements.power.value = experimentSettings.power;
        if (experimentSettings.weather) this.elements.weather.value = experimentSettings.weather;
        if (experimentSettings.time) this.elements.time.value = experimentSettings.time;
        
        // 설정 값 변경 후 UI 업데이트
        this.updateCalculations();
    }

    updateAllDisplays() {
        // Update experiment calculations
        this.updateCalculations();
        
        // Update chart if data was loaded
        if (this.chartData.length > 0) {
            this.updateChart();
        }
    }

    showImportStatus(message, type) {
        this.importStatus.textContent = message;
        this.importStatus.className = `import-status ${type}`;
        
        // Auto-clear success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                this.importStatus.textContent = '';
                this.importStatus.className = 'import-status';
            }, 5000);
        }
    }

    openSettings() {
        this.settingsModal.classList.add('show');
    }

    closeSettingsModal() {
        this.settingsModal.classList.remove('show');
    }

    // 설정 버튼 드래그 기능 - 참고 사이트처럼 자유롭게 움직이도록 완전 재작성
    initializeDragAndDrop() {
        // 설정 버튼 컨테이너를 직접 찾기
        const settingsContainer = document.querySelector('.settings-button-container');
        
        if (!settingsContainer) {
            console.error('Settings button container not found!');
            return;
        }

        let isDragging = false;
        let dragOffsetX = 0;
        let dragOffsetY = 0;

        // 마우스 이벤트 - 더 간단하고 직접적인 접근
        settingsContainer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            isDragging = true;
            
            // 드래그 중 CSS 클래스 추가
            settingsContainer.classList.add('dragging');
            
            // 마우스 위치와 요소 위치의 차이를 계산
            const rect = settingsContainer.getBoundingClientRect();
            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;
            
            // 커서 변경
            settingsContainer.style.cursor = 'grabbing';
            
            console.log('Mouse down - starting drag, offset:', dragOffsetX, dragOffsetY);
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            
            // 마우스 위치에서 오프셋을 빼서 요소 위치 계산
            let newLeft = e.clientX - dragOffsetX;
            let newTop = e.clientY - dragOffsetY;
            
            // 화면 경계 제한 (더 관대하게)
            const maxX = window.innerWidth - settingsContainer.offsetWidth;
            const maxY = window.innerHeight - settingsContainer.offsetHeight;
            
            newLeft = Math.max(-20, Math.min(newLeft, maxX + 20)); // 약간의 여유 공간
            newTop = Math.max(-20, Math.min(newTop, maxY + 20));
            
            // 위치 적용
            settingsContainer.style.left = newLeft + 'px';
            settingsContainer.style.top = newTop + 'px';
            
            console.log('Dragging to:', newLeft, newTop);
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                // 드래그 중 CSS 클래스 제거
                settingsContainer.classList.remove('dragging');
                settingsContainer.style.cursor = 'grab';
                console.log('Mouse up - drag ended');
            }
        });

        // 터치 이벤트도 동일한 로직으로
        settingsContainer.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            isDragging = true;
            // 드래그 중 CSS 클래스 추가
            settingsContainer.classList.add('dragging');
            
            const touch = e.touches[0];
            
            const rect = settingsContainer.getBoundingClientRect();
            dragOffsetX = touch.clientX - rect.left;
            dragOffsetY = touch.clientY - rect.top;
            
            console.log('Touch start - starting drag, offset:', dragOffsetX, dragOffsetY);
        });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            
            const touch = e.touches[0];
            let newLeft = touch.clientX - dragOffsetX;
            let newTop = touch.clientY - dragOffsetY;
            
            const maxX = window.innerWidth - settingsContainer.offsetWidth;
            const maxY = window.innerHeight - settingsContainer.offsetHeight;
            
            newLeft = Math.max(-20, Math.min(newLeft, maxX + 20));
            newTop = Math.max(-20, Math.min(newTop, maxY + 20));
            
            settingsContainer.style.left = newLeft + 'px';
            settingsContainer.style.top = newTop + 'px';
        });

        document.addEventListener('touchend', () => {
            if (isDragging) {
                isDragging = false;
                // 드래그 중 CSS 클래스 제거
                settingsContainer.classList.remove('dragging');
                console.log('Touch end - drag ended');
            }
        });

        console.log('Drag and drop initialized successfully for:', settingsContainer);
        
        // 초기 위치 설정 - CSS의 fixed 위치를 JavaScript로 제어
        const initialTop = 100; // CSS의 top: 100px와 일치
        const initialRight = parseInt(getComputedStyle(settingsContainer).right) || 20;
        
        settingsContainer.style.top = initialTop + 'px';
        settingsContainer.style.right = 'auto';
        settingsContainer.style.left = (window.innerWidth - settingsContainer.offsetWidth - initialRight) + 'px';
        
        console.log('Initial position set:', settingsContainer.style.left, settingsContainer.style.top);
        
        // 성공 메시지 표시 (사용자에게 드래그 가능함을 알림)
        this.showDragHint();
    }

    // 드래그 힌트 표시
    showDragHint() {
        const hint = document.createElement('div');
        hint.className = 'drag-hint';
        hint.textContent = '💡 설정 버튼을 드래그하여 위치를 변경할 수 있습니다';
        
        Object.assign(hint.style, {
            position: 'fixed',
            top: '90px',
            right: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#ffffff',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: '999',
            opacity: '0',
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none'
        });
        
        document.body.appendChild(hint);
        
        // 페이드 인
        setTimeout(() => hint.style.opacity = '1', 100);
        
        // 3초 후 페이드 아웃
        setTimeout(() => {
            hint.style.opacity = '0';
            setTimeout(() => document.body.removeChild(hint), 300);
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
