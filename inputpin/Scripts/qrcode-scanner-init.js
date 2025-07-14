const qrcodeScannerInit = (function (window, document) {
    function setUpDom(inputSelector, buttonSelector) {
        // 輸入框的元素
        const _input = document.querySelector(inputSelector);
        // 整個掃描元件的容器。 _container 要貼放在 _input 下方
        const _container = createContainer(buttonSelector);
        // 顯示按鈕圖片的元素。 _img 顯示在 _input 靠右側邊緣
        const _img = createImgButton();
        // Html5Qrcode 套件用來顯示視窗的元素
        const _monitor = createMonitor();

        _container.appendChild(_img);
        _container.appendChild(_monitor);

        const config = {
            fps: 10,
            qrbox: { width: 260, height: 260 },
            rememberLastUsedCamera: true,
            // Only support camera scan type.
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
        };

        const html5Qrcode = new Html5Qrcode(_monitor.id, config);

        /**
         * 容納 Qrcode scanner 的元素。 _container 要貼放在 _input 下方
         * @param {string} selector 選擇該元素
         * @returns
         */
        function createContainer(selector) {
            const _container = document.querySelector(selector);
            _container.innerHTML = "";
            return _container;
        }
        /**
         * 顯示圖片按鈕的元素。 _img 要顯示在 _input 靠右側邊緣
         * @returns
         */
        function createImgButton() {
            const _div = document.createElement("div");
            _div.style.position = "relative";

            const _img = document.createElement("img");
            _img.src = "./images/qr_code_scanner_100dp.svg";
            _img.style.cursor = "pointer";
            _img.style.height = "1.5em";
            _img.style.transform = "translateY(-50%)";
            _img.style.position = "absolute";
            _img.style.fontSize = "2rem";
            _img.style.top = "2rem";
            _img.style.right = "0.5rem";

            _div.appendChild(_img);

            return _div;
        }
        /**
         * Html5Qrcode 套件用來顯示視窗的元素
         * @returns
         */
        function createMonitor() {
            const _monitor = document.createElement("div");
            _monitor.id = "reader";
            return _monitor;
        }
        /**
         * 檢查數字是不是在陣列的中間
         * @param {object} args
         * @param {number} args.num 要比對的數字
         * @param {Array<number>} args.arr 要比較位置的數字陣列
         * @returns {boolean}
         */
        function isNumInTheMiddle({ num, arr }) {
            if (arr.indexOf(num) < 0) arr.push(num);
            if (arr.length < 3) return false;
            arr = arr.sort((x, y) => (x - y));
            const idx = arr.indexOf(num);
            return idx !== 0 && idx + 1 !== arr.length;
        }
        /**
         * 點擊外部任意區域，關閉 scanner
         * @param {Event} event
         */
        function closeScannerOnclickOutside(event) {
            const rect = _container.getBoundingClientRect();
            if (!isNumInTheMiddle({ num: event.clientX, arr: [rect.left, rect.right] }) ||
                !isNumInTheMiddle({ num: event.clientY, arr: [rect.top, rect.bottom] })
            ) {
                html5Qrcode.stop().then(_ => {
                    window.removeEventListener("click", closeScannerOnclickOutside);
                });
            }
        }
        /**
         * 成功讀取 Qrcode 以後的工作
         * @param {string} decodedText
         * @param {object} decodedResult
         */
        function onScanSuccess(decodedText, decodedResult) {
            // Handle on success condition with the decoded text or result.
            console.log(`Scan result: ${decodedText}`, decodedResult);
            _input.value = decodedText;
            html5Qrcode.stop().then(_ => {
                window.removeEventListener("click", closeScannerOnclickOutside);
            });
        }
        function StartQRCodeScan() {
            _input.value = "";

            html5Qrcode.start({
                facingMode: "environment"
            }, config, onScanSuccess).then(_ => {
                window.addEventListener("click", closeScannerOnclickOutside);
            });
        }

        _container.removeEventListener("click", StartQRCodeScan);
        _container.addEventListener("click", StartQRCodeScan);

        return Object.freeze({
            start() {
                return html5Qrcode.start({ facingMode: "environment" }, config, onScanSuccess);
            },
            stop() {
                return html5Qrcode.stop();
            }
        });
    }

    return function ({ inputSelector, buttonSelector }) {
        return setUpDom(inputSelector, buttonSelector);
    };
})(window, document);