const path = require('path');
const axios = require('axios');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

module.exports = {
    entry: './src/public/model/script.js',
    mode: 'development',
    output: {
        path: path.resolve(__dirname, './src/public/model'),
        filename: 'bundle.js',
    },
    resolve: {
        fallback: {
            buffer: require.resolve('buffer/'),
            stream: require.resolve('stream-browserify'),
            crypto: require.resolve('crypto-browserify'),
            util: require.resolve('util/'),
            path: require.resolve('path-browserify'),
        },
        alias: {
            'big-integer': 'big-integer/biginteger',
            'stream': 'stream-browserify',
            'buffer': 'buffer',
            'crypto': 'crypto-browserify',
            'util': 'util',
        },
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
            {
                test: /\.docx$/,
                use: 'raw-loader',
            },
        ],
    },
    plugins: [
        {
            apply: (compiler) => {
                compiler.hooks.beforeCompile.tapPromise('FetchTemplatePlugin', async (params) => {
                    try {
                        const response = await axios.get('http://localhost:3000/template.docx', { responseType: 'arraybuffer' });
                        const templateData = response.data;

                        const zip = new PizZip(templateData);
                        const doc = new Docxtemplater().loadZip(zip);
                        doc.setData({ value: 'Nội dung từ thẻ input' });

                        doc.render();

                        const generatedDoc = doc.getZip().generate({ type: 'arraybuffer' });
                        const output = new Blob([generatedDoc], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

                        // Lưu tệp DOCX
                        const fileSaver = require('file-saver');
                        fileSaver.saveAs(output, 'document.docx');
                    } catch (error) {
                        console.error('Lỗi khi tải tệp DOCX:', error);
                    }
                });
            },
        },
    ],
};
