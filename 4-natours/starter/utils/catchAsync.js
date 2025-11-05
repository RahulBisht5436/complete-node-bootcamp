
const catchAsync = fn => {
    console.log("inside catchAsync");
    return (req, res, next) =>{
        fn(req, res, next).catch(err => next(err));
    }
}
module.exports = catchAsync;
