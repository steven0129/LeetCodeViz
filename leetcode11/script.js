class ContainerVisualizer {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.height = [1,8,6,2,5,4,8,3,7]; // 預設值
        this.left = 0;
        this.right = 0;
        this.maxArea = 0;
        this.currentArea = 0;
        this.steps = [];
        this.currentStep = -1;
        this.codeLines = {
            INIT: [2, 3, 4, 5],
            CALC_AREA: [8],
            UPDATE_MAX: [9],
            CHECK_OPTIMIZE: [11, 12],
            MOVE_POINTER: [14, 15, 16, 17]
        };
        this.currentHighlight = [];

        this.setupCanvas();
        this.setupEventListeners();
        this.reset();
    }

    setupCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    setupEventListeners() {
        document.getElementById('submitBtn').addEventListener('click', () => {
            this.updateHeight();
        });

        document.getElementById('heightInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.updateHeight();
            }
        });

        document.getElementById('prevBtn').addEventListener('click', () => {
            this.prevStep();
        });

        document.getElementById('nextBtn').addEventListener('click', () => {
            this.nextStep();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.reset();
        });

        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.draw();
        });
    }

    updateHeight() {
        const input = document.getElementById('heightInput').value;
        const newHeight = input.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
        
        if (newHeight.length < 2) {
            alert('請至少輸入兩個數字！');
            return;
        }
        
        if (newHeight.some(num => num < 0)) {
            alert('請不要輸入負數！');
            return;
        }

        this.height = newHeight;
        this.reset();
    }

    generateSteps() {
        this.steps = [];
        let left = 0;
        let right = this.height.length - 1;
        let maxArea = 0;
        const highest = Math.max(...this.height);

        // 添加初始化步驟
        this.steps.push({
            left,
            right,
            currentArea: 0,
            maxArea: 0,
            phase: 'INIT',
            description: '初始化左右指針'
        });

        while (left < right) {
            // 計算面積步驟
            const area = Math.min(this.height[right], this.height[left]) * (right - left);
            this.steps.push({
                left,
                right,
                currentArea: area,
                maxArea,
                phase: 'CALC_AREA',
                description: `計算當前面積: min(${this.height[left]}, ${this.height[right]}) × ${right - left} = ${area}`
            });

            // 更新最大面積步驟
            const newMaxArea = Math.max(maxArea, area);
            if (newMaxArea > maxArea) {
                this.steps.push({
                    left,
                    right,
                    currentArea: area,
                    maxArea: newMaxArea,
                    phase: 'UPDATE_MAX',
                    description: `更新最大面積: ${newMaxArea}`
                });
            }
            maxArea = newMaxArea;

            // 檢查優化條件步驟
            if (highest * (right - left) < maxArea) {
                this.steps.push({
                    left,
                    right,
                    currentArea: area,
                    maxArea,
                    phase: 'CHECK_OPTIMIZE',
                    description: '提前結束：即使使用最高高度也無法獲得更大面積'
                });
                break;
            }

            // 移動指針步驟
            const oldLeft = left;
            const oldRight = right;
            if (this.height[right] > this.height[left]) {
                left++;
            } else {
                right--;
            }
            this.steps.push({
                left,
                right,
                currentArea: area,
                maxArea,
                phase: 'MOVE_POINTER',
                description: this.height[oldRight] > this.height[oldLeft] 
                    ? `左指針向右移動: ${oldLeft} → ${left}`
                    : `右指針向左移動: ${oldRight} → ${right}`
            });
        }
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.applyStep();
        }
    }

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.applyStep();
        }
    }

    applyStep() {
        const step = this.steps[this.currentStep];
        this.left = step.left;
        this.right = step.right;
        this.currentArea = step.currentArea;
        this.maxArea = step.maxArea;
        this.updateInfo();
        this.draw();
        this.highlightCode(step.phase);
    }

    reset() {
        this.left = 0;
        this.right = this.height.length - 1;
        this.maxArea = 0;
        this.currentArea = 0;
        this.currentStep = -1;
        this.generateSteps();
        this.updateInfo();
        this.draw();
    }

    updateInfo() {
        document.getElementById('currentArea').textContent = this.currentArea;
        document.getElementById('maxArea').textContent = this.maxArea;
        // 顯示當前步驟的描述
        const step = this.steps[this.currentStep];
        if (step && step.description) {
            document.getElementById('stepDescription').textContent = step.description;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const barWidth = this.canvas.width / (this.height.length + 1);
        const scale = (this.canvas.height - 40) / Math.max(...this.height);

        // 繪製柱狀圖
        this.height.forEach((h, i) => {
            const x = (i + 1) * barWidth;
            const barHeight = h * scale;
            
            // 設置柱子顏色
            if (i === this.left || i === this.right) {
                this.ctx.fillStyle = '#1a73e8';
            } else {
                this.ctx.fillStyle = '#90caf9';
            }
            
            this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth - 10, barHeight);
            
            // 繪製高度數字
            this.ctx.fillStyle = '#000';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(h.toString(), x + (barWidth - 10) / 2, this.canvas.height - barHeight - 5);
        });

        // 繪製當前容器區域
        if (this.currentStep >= 0) {
            const leftX = (this.left + 1) * barWidth;
            const rightX = (this.right + 1) * barWidth;
            const height = Math.min(this.height[this.left], this.height[this.right]) * scale;
            
            this.ctx.fillStyle = 'rgba(26, 115, 232, 0.2)';
            this.ctx.fillRect(leftX, this.canvas.height - height, rightX - leftX, height);
        }
    }

    highlightCode(phase) {
        // 移除舊的高亮
        document.querySelectorAll('.code-line-highlight').forEach(el => {
            el.classList.remove('code-line-highlight');
        });

        // 添加新的高亮
        const lines = this.codeLines[phase];
        if (lines) {
            lines.forEach(lineNum => {
                const lineElement = document.querySelector(`.code-line[data-line-number="${lineNum}"]`);
                if (lineElement) {
                    lineElement.classList.add('code-line-highlight');
                }
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const visualizer = new ContainerVisualizer();
    // 設置預設值到輸入框
    document.getElementById('heightInput').value = '1,8,6,2,5,4,8,3,7';
}); 