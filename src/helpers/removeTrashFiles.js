const fs = require('fs');
const path = require('path');

const directories = [
    path.resolve(__dirname, '../../../uploads'),
    path.resolve(__dirname, '../../../prescriptions'),
    path.resolve(__dirname, '../../../invoices')
];

const removeTrashFiles = () => {
    directories.forEach(directory => {
        fs.readdir(directory, (err, files) => {
            if (err) {
                console.error(
                    `Error reading directory: ${directory}`,
                    err
                );
                return;
            }

            for (const file of files) {
                fs.unlink(path.join(directory, file), err => {
                    if (err) {
                        console.error(
                            `Error deleting file: ${file} in ${directory}`,
                            err
                        );
                    } else {
                        console.log(
                            `Deleted file: ${file} in ${directory}`
                        );
                    }
                });
            }
        });
    });
};

module.exports = removeTrashFiles;
