# API Documentation

Welcome to the API documentation for the Telehealth service. Below you will find the base URL and a link to the comprehensive Postman documentation.

## Base URL

https://telehealth.talentproweb.com/api/v1


## Postman Documentation

For detailed information about each API endpoint, request parameters, responses, and more, please refer to the [Postman API Documentation](https://documenter.getpostman.com/view/25329986/2sAXqngR9U).

---

## Getting Started Locally

To run this project locally, follow these steps:

1. **Clone the Repository**

    ```bash
    https://github.com/sakib-xrz/telehealth-backend.git
    ```

2. **Install Dependencies**

    Navigate to the project directory and install the dependencies using Yarn:

    ```bash
    cd telehealth-backend
    yarn install
    ```

3. **Set Up Environment Variables**

    Create a `.env` file in the root directory. You can get a sample configuration from the `.env.example` file:

    ```bash
    cp .env.example .env
    ```

    Update the `.env` file with your local configuration.

4. **Set Up PostgreSQL**

    Make sure PostgreSQL is installed on your local machine. You can download it from the [official PostgreSQL website](https://www.postgresql.org/download/).

5. **Run Database Migrations**

    Run the following command to apply database migrations:

    ```bash
    npx prisma migrate dev
    ```

6. **Start the Project**

    Finally, start the project with:

    ```bash
    yarn dev
    ```

---

If you have any questions or need further assistance, please contact support.

Happy coding!
