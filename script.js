class ThreeSumVisualizer {
    constructor() {
        this.nums = [];
        this.currentStep = 0;
        this.steps = [];
        this.results = [];
        
        this.initializeElements();
        this.initializeEventListeners();
    }

    initializeElements() {
        this.arrayVisual = document.querySelector('.array-visual');
        this.iPointer = document.getElementById('i-pointer');
        this.leftPointer = document.getElementById('left-pointer');
        this.rightPointer = document.getElementById('right-pointer');
        this.currentStepElement = document.getElementById('current-step');
        this.resultList = document.getElementById('result-list');
        this.input = document.getElementById('input');
    }

    initializeEventListeners() {
        document.getElementById('start').addEventListener('click', () => this.start());
        document.getElementById('prev').addEventListener('click', () => this.prevStep());
        document.getElementById('next').addEventListener('click', () => this.nextStep());
        document.getElementById('reset').addEventListener('click', () => this.reset());
    }

    start() {
        const input = this.input.value.split(',').map(x => parseInt(x.trim()));
        if (input.some(isNaN)) {
            alert('請輸入有效的數字，用逗號分隔');
            return;
        }
        this.nums = input;
        this.nums.sort((a, b) => a - b);
        this.generateSteps();
        this.reset();
        this.renderArray();
    }

    generateSteps() {
        this.steps = [];
        this.results = [];
        
        for (let i = 0; i < this.nums.length - 2; i++) {
            this.steps.push({
                type: 'line',
                i,
                line: 7,
                message: `檢查是否需要跳過重複的數字: idx = ${i}, a = ${this.nums[i]}`
            });
            
            if (i > 0 && this.nums[i] === this.nums[i - 1]) {
                this.steps.push({
                    type: 'skip',
                    i,
                    line: 8,
                    message: `跳過重複的數字 ${this.nums[i]}`
                });
                continue;
            }

            this.steps.push({
                type: 'line',
                i,
                line: 10,
                message: `設置左右指針: left = ${i + 1}, right = ${this.nums.length - 1}`
            });
            let left = i + 1;
            let right = this.nums.length - 1;

            while (left < right) {
                this.steps.push({
                    type: 'line',
                    i,
                    left,
                    right,
                    line: 12,
                    message: `計算三數之和: ${this.nums[i]} + ${this.nums[left]} + ${this.nums[right]}`
                });
                const sum = this.nums[i] + this.nums[left] + this.nums[right];
                
                this.steps.push({
                    type: 'check',
                    i,
                    left,
                    right,
                    sum,
                    line: sum > 0 ? 14 : (sum < 0 ? 16 : 18),
                    message: `檢查: ${this.nums[i]} + ${this.nums[left]} + ${this.nums[right]} = ${sum}`
                });

                if (sum > 0) {
                    this.steps.push({
                        type: 'line',
                        i,
                        left,
                        right,
                        line: 15,
                        message: `和 > 0，右指針左移: right 從 ${right} 變為 ${right - 1}`
                    });
                    right--;
                } else if (sum < 0) {
                    this.steps.push({
                        type: 'line',
                        i,
                        left,
                        right,
                        line: 17,
                        message: `和 < 0，左指針右移: left 從 ${left} 變為 ${left + 1}`
                    });
                    left++;
                } else {
                    this.steps.push({
                        type: 'line',
                        i,
                        left,
                        right,
                        line: 19,
                        message: `找到符合的組合，加入結果`
                    });
                    this.results.push([this.nums[i], this.nums[left], this.nums[right]]);
                    this.steps.push({
                        type: 'found',
                        i,
                        left,
                        right,
                        line: 20,
                        result: [this.nums[i], this.nums[left], this.nums[right]],
                        message: `找到組合: [${this.nums[i]}, ${this.nums[left]}, ${this.nums[right]}]`
                    });
                    
                    left++;
                    while (left < right && this.nums[left] === this.nums[left - 1]) {
                        this.steps.push({
                            type: 'skip',
                            i,
                            left,
                            right,
                            line: 23,
                            message: `跳過重複的數字 ${this.nums[left]}`
                        });
                        left++;
                    }
                }
            }
        }
        this.steps.push({
            type: 'line',
            line: 25,
            message: '演算法完成，返回結果'
        });
    }

    renderArray() {
        const table = document.querySelector('.array-table');
        const numbersRow = table.querySelector('.numbers-row');
        const pointersRow = table.querySelector('.pointers-row');
        
        // Clear existing content
        numbersRow.innerHTML = '';
        pointersRow.innerHTML = '';
        
        // Add pointer cells
        this.nums.forEach(() => {
            const pointerCell = document.createElement('td');
            pointersRow.appendChild(pointerCell);
        });
        
        // Add number cells
        this.nums.forEach((num) => {
            const cell = document.createElement('td');
            cell.className = 'number-box';
            cell.textContent = num;
            numbersRow.appendChild(cell);
        });
    }

    updatePointers(i = -1, left = -1, right = -1) {
        const boxes = document.querySelectorAll('.number-box');
        const pointerCells = document.querySelectorAll('.pointers-row td');
        
        // Clear all highlights and pointers
        boxes.forEach(box => box.classList.remove('highlighted', 'selected'));
        pointerCells.forEach(cell => {
            cell.innerHTML = '';
            cell.removeAttribute('id');
        });
        
        if (i >= 0) {
            const iLabel = document.createElement('div');
            iLabel.className = 'pointer-label';
            iLabel.textContent = 'i';
            pointerCells[i].appendChild(iLabel);
            pointerCells[i].id = 'i-pointer';
            boxes[i].classList.add('highlighted');
        }
        if (left >= 0) {
            const leftLabel = document.createElement('div');
            leftLabel.className = 'pointer-label';
            leftLabel.textContent = 'left';
            pointerCells[left].appendChild(leftLabel);
            pointerCells[left].id = 'left-pointer';
            boxes[left].classList.add('highlighted');
        }
        if (right >= 0) {
            const rightLabel = document.createElement('div');
            rightLabel.className = 'pointer-label';
            rightLabel.textContent = 'right';
            pointerCells[right].appendChild(rightLabel);
            pointerCells[right].id = 'right-pointer';
            boxes[right].classList.add('highlighted');
        }
    }

    nextStep() {
        if (this.currentStep >= this.steps.length) {
            alert('演算法已完成！');
            return;
        }

        const step = this.steps[this.currentStep];
        this.currentStepElement.textContent = step.message;

        // 清除所有高亮
        document.querySelectorAll('.line').forEach(line => {
            line.classList.remove('highlight');
        });
        
        // 高亮當前執行的程式碼行
        if (step.line) {
            document.querySelector(`.line[data-line="${step.line}"]`).classList.add('highlight');
        }

        if (step.type === 'found') {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.textContent = `[${step.result.join(', ')}]`;
            this.resultList.appendChild(resultItem);
        }

        this.updatePointers(step.i, step.left, step.right);
        this.currentStep++;
    }

    prevStep() {
        if (this.currentStep <= 1) {
            alert('已經是第一步了！');
            return;
        }

        // 只回退一步
        this.currentStep--;
        const step = this.steps[this.currentStep - 1];
        
        // 更新說明文字
        this.currentStepElement.textContent = step.message;
        
        // 清除所有高亮
        document.querySelectorAll('.line').forEach(line => {
            line.classList.remove('highlight');
        });
        
        // 高亮當前執行的程式碼行
        if (step.line) {
            document.querySelector(`.line[data-line="${step.line}"]`).classList.add('highlight');
        }

        // 如果當前步驟是找到結果，需要移除最後一個結果
        if (this.steps[this.currentStep].type === 'found') {
            const lastResult = this.resultList.lastElementChild;
            if (lastResult) {
                this.resultList.removeChild(lastResult);
            }
        }

        // 更新指針位置
        this.updatePointers(step.i, step.left, step.right);
    }

    reset() {
        this.currentStep = 0;
        this.currentStepElement.textContent = '請點擊"開始演算"開始';
        this.resultList.innerHTML = '';
        this.updatePointers();
        // 清除所有高亮
        document.querySelectorAll('.line').forEach(line => {
            line.classList.remove('highlight');
        });
    }
}

// 初始化視覺化工具
document.addEventListener('DOMContentLoaded', () => {
    new ThreeSumVisualizer();
}); 