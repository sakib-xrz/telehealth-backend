const puppeteer = require('puppeteer');

const generatePrescriptionHtml = ({
    patientName,
    patientAge,
    appointmentDate,
    doctorName,
    doctorContact,
    medicines = [],
    tests = [],
    followUpDate = null
}) => {
    // Conditionally render the Prescription Section if medicines array is not empty
    const prescriptionSection =
        medicines.length > 0
            ? `
            <section>
                <h2>Prescription</h2>
                <table>
                    <tr>
                        <th>Medication</th>
                        <th>Dosage</th>
                        <th>Instructions</th>
                    </tr>
                    ${medicines
                        .map(
                            med => `
                    <tr>
                        <td>${med?.medicine}</td>
                        <td>${med?.dosage || 'N/A'}</td>
                        <td>${med?.instructions || 'N/A'}</td>
                    </tr>`
                        )
                        .join('')}
                </table>
            </section>
        `
            : '';

    // Conditionally render the Test Section if tests array is not empty
    const testSection =
        tests.length > 0
            ? `
            <section>
                <h2>Recommended Tests</h2>
                <table>
                    <tr>
                        <th>Test</th>
                        <th>Instructions</th>
                    </tr>
                    ${tests
                        .map(
                            test => `
                    <tr>
                        <td>${test.test}</td>
                        <td>${test.instructions || 'N/A'}</td>
                    </tr>`
                        )
                        .join('')}
                </table>
            </section>
        `
            : '';

    // Conditionally render the Follow-Up Date Section if followUpDate is not null
    const followUpDateSection = followUpDate
        ? `
            <section>
                <h2>Follow-Up Date</h2>
                <p><strong>Next Appointment:</strong> ${followUpDate}</p>
            </section>
        `
        : '';

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Prescription</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
            }
            .container {
                margin: 40px auto;
                background-color: #ffffff !important;
                border-radius: 8px;
                margin: 27mm 16mm 27mm 16mm;
            }
            header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 2px solid #ddd;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            header h1 {
                font-size: 24px;
                color: #333;
                margin: 0;
            }
            header p {
                font-size: 14px;
                color: #555;
                margin: 2px 0;
            }
            section {
                margin-bottom: 20px;
            }
            section h2 {
                font-size: 18px;
                color: #333;
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
                margin-bottom: 10px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th, td {
                padding: 10px;
                font-size: 16px;
                color: #333;
                border-bottom: 1px solid #ddd;
            }
            th {
                background-color: #f9f9f9;
                text-align: left;
            }
            td {
                background-color: #fff;
            }
            footer {
                margin-top: 100px;
                border-top: 1px solid #ddd;
                padding-top: 10px;
                text-align: center;
                font-size: 14px;
                color: #555;
            }
        </style>
    </head>
    <body>

        <div class="container">
            <!-- Clinic Header -->
            <header>
                <div>
                    <h1>Telehealth</h1>
                    <p>House 38, Lean 2 Block A, Section 6, Dhaka, Bangladesh</p>
                    <p>Phone: +881540581443 | Email: info@telehealth.com</p>
                </div>
                <div style="text-align: right;">
                    <p style="font-size: 16px; margin: 0;">${doctorName}</p>
                    <p style="font-size: 14px; color: #555;">Contact No: ${doctorContact}</p>
                </div>
            </header>

            <!-- Patient Info -->
            <section>
                <h2>Patient Information</h2>
                <p><strong>Name:</strong> ${patientName}</p>
                <p><strong>Age:</strong> ${patientAge ? `${patientAge} Years` : 'N/A'}</p>
                <p><strong>Date:</strong> ${appointmentDate}</p>
            </section>

            <!-- Prescription Section -->
            ${prescriptionSection}

            <!-- Test Section -->
            ${testSection}

            <!-- Follow-Up Date Section -->
            ${followUpDateSection}

            <!-- Footer -->
            <footer>
                <p>&copy; 2024 Telehealth. All rights reserved.</p>
                <p>For any questions, please contact us at info@telehealth.com or call +8801540581443.</p>
            </footer>
        </div>

    </body>
    </html>
  `;
};

// Function to generate PDF from HTML content
const generatePdfPrescription = async (
    htmlContent,
    prescriptionPath
) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    await page.pdf({ path: prescriptionPath, format: 'A4' });
    await browser.close();
};

module.exports = {
    generatePrescriptionHtml,
    generatePdfPrescription
};
