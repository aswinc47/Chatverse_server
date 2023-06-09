const jwt = require('jsonwebtoken')

module.exports.authMiddleware = async(req,res,next)=>{
    const authToken = req.headers.token;
    if(authToken){
        const decodeToken = await jwt.verify(authToken,process.env.JWT_KEY);
        req.myId = decodeToken.id
        next();
    }else{
        res.status(400).json({
            error:{
                message:'Please Login first'
            }
        })
    }
}