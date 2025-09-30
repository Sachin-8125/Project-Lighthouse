class ApiResponse {
    constructor(statusCode, message = "Success", data = null, stack = "") {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode < 400;

        if (stack) {
            this.stack = stack;
        }
    }
}

module.exports = { ApiResponse };