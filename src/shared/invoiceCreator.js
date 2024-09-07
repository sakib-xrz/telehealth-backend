const puppeteer = require('puppeteer');

const generateInvoiceHtml = ({
    patientName,
    patientEmail,
    patientAddress,
    transactionId,
    doctorName,
    appointmentDate,
    amount
}) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice - Telehealth</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
            }
            .invoice-container {
                margin: 40px auto;
                background-color: #ffffff !important;
                border-radius: 8px;
                margin: 27mm 16mm 27mm 16mm;
            }
            .invoice-header {
                background-color: #4a90e2;
                color: #ffffff;
                text-align: center;
                padding: 20px;
                font-size: 28px;
                font-weight: bold;
                border-radius: 8px 8px 0 0;
            }
            .invoice-body {
                padding: 20px;
                color: #333333;
                line-height: 1.6;
                border-left: 2px solid #f2f2f2;
                border-right: 2px solid #f2f2f2;
            }
            .invoice-details {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
            }
            .invoice-details div {
                width: 48%;
            }
            .invoice-details p {
                margin: 4px 0;
                font-size: 16px;
            }
            .invoice-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            .invoice-table th, .invoice-table td {
                padding: 12px;
                border: 1px solid #f2f2f2;
                text-align: left;
            }
            .invoice-table th {
                background-color: #f2f2f2;
                font-weight: bold;
            }
            .invoice-total {
                text-align: right;
                margin-top: 20px;
                font-size: 18px;
                font-weight: bold;
            }
            .invoice-footer {
                text-align: center;
                padding: 20px;
                background-color: #f2f2f2;
                color: #888888;
                font-size: 14px;
                border-radius: 0 0 8px 8px;
            }
            .invoice-footer a {
                color: #4a90e2;
                text-decoration: none;
            }
            .invoice-footer a:hover {
                text-decoration: underline;
            }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <div class="invoice-header">
                Telehealth - Invoice
            </div>
            <div class="invoice-body">
                <div class="invoice-details">
                    <div>
                        <p><strong>Telehealth</strong></p>
                        <p>House 38, Lean 2</p>
                        <p>Block A, Section 6</p>
                        <p>Dhaka, Bangladesh</p>
                        <p>Email: info@telehealth.com</p>
                    </div>
                    <div>
                        <p><strong>Invoice To:</strong></p>
                        <p>${patientName}</p>
                        <p>${patientEmail}</p>
                        <p>${patientAddress}</p>
                    </div>
                </div>
                <p><strong>Appointment Details:</strong></p>
                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th>Service</th>
                            <th>Transaction Id</th>
                            <th>Date</th>
                            <th>Doctor</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Telehealth Consultation</td>
                            <td>${transactionId}</td>
                            <td>${appointmentDate}</td>
                            <td>${doctorName}</td>
                            <td>${amount} BDT</td>
                        </tr>
                    </tbody>
                </table>
                <div class="invoice-total">
                    Total: ${amount} BDT
                </div>
            </div>
            <div class="invoice-footer">
                <p>Thank you for choosing Telehealth for your consultation. If you have any questions, please contact us at <a href="mailto:support@telehealth.com">support@telehealth.com</a>.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

const generatePdfInvoice = async (htmlContent, invoicePath) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    await page.pdf({ path: invoicePath, format: 'A4' });
    await browser.close();
};

module.exports = {
    generateInvoiceHtml,
    generatePdfInvoice
};
