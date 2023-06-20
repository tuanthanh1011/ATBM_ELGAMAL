const crypto = require('crypto-browserify');
const Base64 = require('js-base64').Base64;
const JSZip = require('jszip');
import { Document, Packer, Paragraph, TextRun } from "docx";
const Docxtemplater = require('docxtemplater');
const { saveAs } = require('file-saver');
const axios = require('axios');
import bigInt from 'big-integer';
import { encode, decode } from 'js-base64';
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const txtVanbankyPS = $('.vanbanky_ps');
const btnFileVanBanKyPS = $('.btn-file_vanbanky_ps');
const btnKy = $('.btn_ky');
const txtChukyPS = $('.chuky_ps');
const btnChuyen = $('.btn-chuyen');
const btnLuu = $('.btn-luu');
const txtVanbankyKT = $('.vanbanky_kt');
const btnFileVanBanKyKT = $('.btn-file_vanbanky_kt');
const txtChuKyKT = $('.chuky_kt');
const btnFileChuKyKT = $('.btn-file_chuky_kt');
const txtThongBao = $('.vanbanky_kt_tb');
const btnKiemTra = $('.btn_kt_ky')
const btnInput = $('.file_chuky_kt')
const btnInputVanBanKyPS = $('.file_vanbanky_ps');
const btnInputVanBanKyKT = $('.file_vanbanky_kt');
const btnInputChuKyKT = $('.file_chuky_kt');
const btnDelete = $('.delete');
const outputP = $('.p');
const outputAlpha = $('.alpha');
const outputA = $('.a');
const outputBeta = $('.beta');
const outputK = $('.k');
const outputGamma = $('.gamma');
const hambamSHA = $('.hambam_ps');

let a, beta, p, alpha, k;
let check = 0, check1 = 0;

resetData();

a = 0, beta = 0, p = 0, alpha = 0, k = 0;


// Hàm random số ngẫu nhiên
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Kiểm tra số nguyên tố
function kiemTraSNT(number) {
    if (number <= 1)
        return false;

    for (let i = 2; i <= Math.sqrt(number); i++) {
        if (number % i === 0) {
            return false;
        }
    }

    return true;
}

// Tìm UCLN của 2 số bằng thuật toán Euclid
function GCD(a, b) {
    if (a == 0 && b == 0) return a + b;
    while (b > 0) {
        var r = a % b;
        a = b;
        b = r;
    }
    return a;
}

// 
function EuclidMoRong(a, n) {
    let r, q, y, y0 = 0, y1 = 1, tmp = n;
    while (a > 0) {
        r = n % a;
        q = Math.floor(n / a);
        if (r === 0) {
            break;
        }
        y = y0 - q * y1;
        y0 = y1;
        y1 = y;
        n = a;
        a = r;
    }
    if (a > 1) {
        return -1; // GCD(a,n) != 1
    }
    if (y >= 0) {
        return y; // a^-1 mod n = y mod n
    } else {
        return y + tmp; // a^-1 mod n = -y mod n = y+n mod n
    }
}

// Chuyển thập phân sang nhị phân (mảng)
function decimalToBinary(decimal) {
    if (decimal === 0) {
        return '0';
    }

    let binary = '';
    while (decimal > 0) {
        binary = (decimal % 2) + binary;
        decimal = Math.floor(decimal / 2);
    }
    var mangSo = binary.split('').map(function (item) {
        return parseInt(item);
    });
    return mangSo;
}

// Thuật toán bình phương và nhân
function BinhPhuongVaNhan(a, n, b) {
    let binary = decimalToBinary(n);
    let nBinary = binary.length;
    let p = 1;
    for (let i = 0; i < nBinary; i++) {
        if (binary[i] == 0)
            p = (p * p) % b;
        else
            p = (((p * p) % b) * a) % b;
    }
    return p;
}


function createKey() {
    a = 0, beta = 0, p = 0, alpha = 0, k = 0;

    // Chọn 1 số nguyên tố p sao cho bài toán logarithm rời rạc trong Zp là khó giải (Số lớn)
    while (!kiemTraSNT(p)) {
        p = getRandomNumber(2000, 10000);
    }
    // Chọn phần tử nguyên thủy alpha thuộc (0, p-1)
    alpha = getRandomNumber(0, p - 1);


    // Chọn khóa bí mật thứ nhất a thuộc (2, p-2)
    a = getRandomNumber(2, p - 2);

    // Tính beta = alpha^a mod p
    beta = BinhPhuongVaNhan(alpha, a, p);
}

// Hàm chuyển đổi xâu thành mảng byte
function stringToByteArray(str) {
    let byteArray = [];
    for (let i = 0; i < str.length; i++) {
        byteArray.push(str.charCodeAt(i));
    }
    return byteArray;
}

// Hàm chuyển đổi chuỗi Base64 thành mã Unicode dạng số
function base64ToUnicodeArray(base64) {
    let unicodeArray = [];
    for (let i = 0; i < base64.length; i++) {
        let unicode = base64.charCodeAt(i);
        unicodeArray.push(unicode);
    }
    return unicodeArray;
}

// Chuyển mảng số thành chuỗi base64
function arrayToBase64(arr) {
    // Chuyển mảng số thành chuỗi JSON
    const jsonString = JSON.stringify(arr);

    // Mã hóa chuỗi JSON thành chuỗi base64
    const base64String = Base64.encode(jsonString);

    return base64String;
}

function base64ToArray(base64) {
    let arr;
    try {
        // Giải mã chuỗi base64 thành chuỗi JSON
        const jsonString = Base64.decode(base64);

        // Chuyển chuỗi JSON thành mảng số
        arr = JSON.parse(jsonString);
    } catch (error) {
        txtThongBao.value = "Chữ kí đã bị thay đổi!";
        return null; // Hoặc giá trị khác thích hợp để xử lý lỗi
    }

    return arr;
}

function hamKyElgamal() {
    if (txtVanbankyPS.value != "") {
        let banMa = [];
        let j = 0;
        let y1, y2;
        let result = "";
        // Tạo p, a, alpha, beta

        createKey();

        k = getRandomNumber(1, p - 2);
        while (GCD(k, p - 1) != 1) {
            k = getRandomNumber(1, p - 2);
        }

        // Chuyển đổi xâu thành mảng byte
        let byteArray = stringToByteArray(txtVanbankyPS.value);

        // Băm mảng byte bằng SHA-256 và trả về chuỗi Base64
        let hash = crypto.createHash("sha256").update(byteArray).digest("base64");

        // Chuyển đổi chuỗi Base64 thành mã Unicode (dạng số)
        let unicodeArray = base64ToUnicodeArray(hash);

        y1 = BinhPhuongVaNhan(alpha, k, p);
        outputP.value = p;
        outputAlpha.value = alpha;
        outputA.value = a;
        outputBeta.value = beta;
        outputK.value = k;
        outputGamma.value = y1;
        hambamSHA.value = hash;
        
        for (var i = 0; i < unicodeArray.length; i++) {
            banMa[j] = y1;
            let k_nd = EuclidMoRong(k, p - 1);
            let check = ((unicodeArray[i] - a * y1) * k_nd) % (p - 1);

            y2 = check < 0 ? (p - 1) + check : check;
            banMa[j + 1] = y2;
            j += 2;
        }

        var base64String = arrayToBase64(banMa);
        txtChukyPS.value = base64String;

    }
    else
        alert("Chưa nhập văn bản ký!");
}

function power(base, exponent) {
    let result = BigInt(1);

    // Kiểm tra trường hợp đặc biệt: mũ bằng 0
    if (exponent === 0) {
        return BigInt(1);
    }

    // Xử lý trường hợp mũ âm
    if (exponent < 0) {
        base = 1 / base;
        exponent = -exponent;
    }

    // Tính toán mũ với kiểu dữ liệu BigInt
    while (exponent > 0) {
        result *= BigInt(base);
        exponent--;
    }

    return result;
}

function calculateRemainder(number, divisor) {
    // Chuyển đổi number và divisor thành kiểu BigInt
    const numberBigInt = BigInt(number);
    const divisorBigInt = BigInt(divisor);

    // Tính toán phần dư với phép toán %
    const remainder = numberBigInt % divisorBigInt;

    return remainder.toString();
}

function kiemTraChuKyElgamal() {
    if (txtChuKyKT.value !== "" && txtVanbankyKT.value !== "") {
        let j = 0;
        let check = true;

        var restoredArray = base64ToArray(txtChuKyKT.value)
        // Chuyển đổi xâu thành mảng byte
        let byteArray = stringToByteArray(txtVanbankyKT.value);

        // Băm mảng byte bằng SHA-256 và trả về chuỗi Base64
        let hash = crypto.createHash("sha256").update(byteArray).digest("base64");

        // Chuyển đổi chuỗi Base64 thành mã Unicode dạng số
        let unicodeArray = base64ToUnicodeArray(hash);

        for (var i = 0; i < unicodeArray.length; i++) {

            if (calculateRemainder(power(beta, restoredArray[0]) * power(restoredArray[0], restoredArray[1]), p) == BinhPhuongVaNhan(alpha, unicodeArray[0], p)) {
                check = true;
            }
            else {
                check = false;
                break;
            }
            j += 2;
        }

        if (check == false)
            txtThongBao.value = "Văn bản ký đã bị thay đổi";
        else
            txtThongBao.value = "Chữ ký đúng";
    }
    else
        alert("Bạn cần chuyển văn bản ký và chữ ký trước khi kiểm tra!");
}

function docFile(element, e) {
    let input = e.target;
    const file = input.files[0];

    if (input.files[0].type === 'text/plain') {
        check = 1;
        let reader = new FileReader();
        reader.onload = function () {
            element.value = reader.result;
        };
        reader.readAsText(input.files[0]);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        check = 2;
        let reader = new FileReader();
        reader.onload = function () {
            const arrayBuffer = reader.result;

            const zip = new JSZip();
            zip.loadAsync(arrayBuffer)
                .then(function (doc) {
                    doc.file('word/document.xml').async('string')
                        .then(function (content) {

                            // Xử lý XML
                            const parser = new DOMParser();
                            const xmlDoc = parser.parseFromString(content, 'application/xml');
                            const paragraphs = xmlDoc.getElementsByTagName('w:p');
                            let text = '';
                            for (let i = 0; i < paragraphs.length; i++) {
                                const paragraph = paragraphs[i];
                                const runs = paragraph.getElementsByTagName('w:r');
                                for (let j = 0; j < runs.length; j++) {
                                    const run = runs[j];
                                    const texts = run.getElementsByTagName('w:t');
                                    for (let k = 0; k < texts.length; k++) {
                                        const node = texts[k];
                                        text += node.textContent;
                                    }
                                }
                                text += '\n';
                            }

                            // Gán nội dung văn bản vào element.value
                            element.value = text;
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                })
                .catch(function (error) {
                    console.log(error);
                });
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert('Đầu vào không hợp lệ!');
        e.target.value = "";
    }
}


function saveTextAsFile(textContent, fileName) {
    // Create a Blob with the text content
    const blob = new Blob([textContent], { type: 'text/plain' });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create an anchor element
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName || 'file.txt';

    // Trigger a click event to download the file
    anchor.click();

    // Clean up the URL object
    URL.revokeObjectURL(url);
}


function createDocxFromContent(content) {
    // Create a new Document
    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    new Paragraph({
                        children: [new TextRun(content)],
                    }),
                ],
            },
        ],
    });

    // Used to export the document into a .docx file
    Packer.toBlob(doc).then((blob) => {
        // Save the blob as a .docx file
        saveAs(blob, "ChuKy.docx");
    });
}

function showPrompt(message, defaultValue) {
    var result = prompt(message, defaultValue);

    if (result !== null)
        return result;
    else {
        return 0;
    }
}

function resetData() {
    txtChuKyKT.value = "";
    txtChukyPS.value = "";
    txtVanbankyKT.value = "";
    txtThongBao.value = "";
    txtVanbankyPS.value = "";
    outputP.value = "";
    outputAlpha.value = "";
    outputA.value = "";
    outputBeta.value = "";
    outputK.value = "";
    outputGamma.value = "";

    btnInputVanBanKyPS.value = "";
    btnInputVanBanKyKT.value = "";
    btnInputChuKyKT.value = "";
    check = 0;
    hambamSHA.value = "";
}

// Handle Event

btnKy.addEventListener('click', hamKyElgamal);

btnChuyen.addEventListener('click', function () {
    txtVanbankyKT.value = txtVanbankyPS.value;
    txtChuKyKT.value = txtChukyPS.value;
})

btnKiemTra.addEventListener('click', kiemTraChuKyElgamal)

btnFileVanBanKyPS.onclick = function () {
    btnInputVanBanKyPS.click();
}

btnFileVanBanKyKT.onclick = function () {
    btnInputVanBanKyKT.click();
}

btnFileChuKyKT.onclick = function () {
    btnInputChuKyKT.click();
}

btnInputVanBanKyPS.addEventListener('change', (e) => {
    docFile(txtVanbankyPS, e)
})

btnInputVanBanKyKT.addEventListener('change', (e) => {

    docFile(txtVanbankyKT, e)
})

btnInputChuKyKT.addEventListener('change', (e) => {
    docFile(txtChuKyKT, e)
})

btnLuu.addEventListener('click', function () {
    if (check1 == 0 && check == 0)
        check1 = showPrompt("Mặc định lưu file txt. Nhập 2 để lưu file docx!", 1)

    if (check == 1 || check1 == 1) {
        const content = txtChukyPS.value;
        const filename = 'ChuKy.txt';
        saveTextAsFile(content, filename);
    }
    if (check == 2 || check1 == 2) {
        const content = txtChukyPS.value;
        createDocxFromContent(content);
    }
    check1 = 0;
})

btnDelete.addEventListener('click', resetData)
