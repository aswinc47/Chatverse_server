const formidable = require("formidable");
const registerModel = require("../models/authModel");
const fs = require('fs')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');



// Register controller

module.exports.userRegister = (req, res) => {
  const form = formidable();

  form.parse(req, async (err, fields, files) => {
    const { username, email, password, confirmpassword } = fields;
    const { image } = files;
    console.log(files);
    const errors = [];

    if (!username) {
      errors.push("Username field is required");
    }
    if (!email) {
      errors.push("Email field is required");
    }
    if (!password) {
      errors.push("Password field is required");
    }
    if (!confirmpassword) {
      errors.push("Confirm password field is required");
    }
    if (password && confirmpassword && password !== confirmpassword) {
      errors.push("Passwords not matching");
    }
    if (password && password.length < 6) {
      errors.push("Password must contain more-than 6 letters");
    }
    if (Object.keys(files).length === 0) {
      errors.push("Image field is required");
    }
    if (errors.length > 0) {
      res.status(400).json({
        error: {
          message: errors
        }
      });

    } else {
      const imageName = files.image.originalFilename;
      const randomNum = Math.floor(Math.random() * 9999);
      const newImagename = randomNum + imageName;
      files.image.originalFilename = newImagename;
      const newPath = __dirname+`/../../client/public/images/${files.image.originalFilename}`;

      try {
        const checkUser = await registerModel.findOne({ email: email });
        if (checkUser) {
          res.status(409).json({
            error: {
              message: ["Email already exist"],
            },
          });
        }else{
            fs.copyFile(files.image.filepath,newPath, async(error)=>{
                if(!error){
                    const newUser = await registerModel.create({
                        username,
                        email,
                        password : await bcrypt.hash(password,5),
                        image : files.image.originalFilename
                    })
                    const token = jwt.sign({
                      id:newUser._id,
                      username:newUser.username,
                      email:newUser.email,
                      password:newUser.password,
                      image:newUser.image,
                      createdAt:newUser.createdAt,
                      updatedAt:newUser.updatedAt
                    },process.env.JWT_KEY,
                        {expiresIn: process.env.JWT_EXPIRY}
                        )
                    res.status(201).json({
                        message:'Registration Successful',
                        token
                    })
                }else{
                    res.status(500).json({
                      error:{
                        message:['Internal Server Error']
                      }
                    })
                }
            })
        }
      } catch (error) {
        res.status(500).json({
          error:{
            message:['Internal Server Error']
          }
        });
      }
    }
  });
};

module.exports.userLogin =async (req,res)=>{
  const errors = []
  const {email,password} = req.body
  if(!email){
    errors.push('Email field is required')
  }
  if(!password){
    errors.push('Password field is required')
  }
  if (password && password.length < 6) {
    errors.push("Password must contain more-than 6 letters");
  }

  if(errors.length > 0){
    res.status(400).json({
      error:{
        message: errors
      }
    })
  
  }else{
    try {
      const checkUser = await registerModel.findOne({email:email}).select('+password');
      if(checkUser){
        const matchPassword = await bcrypt.compare(password,checkUser.password)
        if(matchPassword){
          const token = jwt.sign({
            id:checkUser._id,
            username:checkUser.username,
            email:checkUser.email,
            password:checkUser.password,
            image:checkUser.image,
            createdAt:checkUser.createdAt,
            updatedAt:checkUser.updatedAt
          },process.env.JWT_KEY,
          {expiresIn:process.env.JWT_EXPIRY}
          )
            res.status(201).json({
            message:'Login Successful',
            token
          })
        }else{
          res.status(400).json({
            error:{
              message:['Wrong Password']
            }
          })
        }
      }else{
        res.status(400).json({
          error:{
            message:['User not found']
          }
        })
      }
    } catch (error) {
      res.status(400).json({
        error:{
          message:['Internal server error']
        }
      })
    }
  }

}

module.exports.logOut = async (req,res)=>{

  try {
    res.status(200).json({
      status:true
    })
  } catch (error) {
    
  }
}