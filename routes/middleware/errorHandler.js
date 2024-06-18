const ErrorHandler = (err, req, res, next) => {
    console.log("Middleware Error Handling");
    const errStatus = err.statusCode || 500;
    const errMsg = err.message || "Something went wrong";
    const errorResponse = {
        success: false,
        status: errStatus,
        message: errMsg,
        stack: process.env.NODE_ENV === "development" ? err.stack : {},
    };
    console.error(errorResponse);
    res.status(errStatus).json({ errors: [errorResponse] });
};

module.exports = ErrorHandler;
