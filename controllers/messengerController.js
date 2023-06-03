const Users = require('../models/authModel')
const Messages = require('../models/messegeModel')
const formidable = require('formidable')
const fs = require('fs')

module.exports.getFriend = async (req,res) => {
    let friendsmessages = []
    try {
        const Friends = await Users.find({
            _id:{
                $ne : req.myId
            }
        });
        for(let i=0 ; i < Friends.length ; i++ ){
            let lastMessage = await getLastMessage(req.myId,Friends[i]._id);
            friendsmessages = [...friendsmessages,{
                friendDetails:Friends[i],msgDetails:lastMessage
            }]
        }
        // const filteredfriends = Friends.filter(friend => friend.id !== req.myId)
        
        res.status(200).json({
            success:true,friends:friendsmessages
        })
    } catch (error) {
        res.status(404).json({
            error:{
                message: 'Internal server error'
            }
        })
    }
}

const getLastMessage = async (myId,friendId)=>{
    const LastMessage = await Messages.findOne({
        $or:[{
            $and :[{
                senderId : {
                    $eq : myId
                }
                },{
                    receiverId:{
                        $eq : friendId
                    }
                }
            ]
        },{
            $and: [{
                receiverId:{
                    $eq : myId
                }
            },{
                senderId:{
                    $eq : friendId
                }
            }]
        }]
    }).sort({updatedAt : -1});

    return LastMessage;
}

module.exports.sendMessage = async (req,res) => {
    try{
        const newMessage = await Messages.create({
            senderId:req.myId,
            senderName:req.body.sender,
            receiverId:req.body.receiverId,
            message:{
                text:req.body.message,
                image:''
            }
        })
        res.status(201).json({
            success:true,
            message:newMessage
        })
    }catch(error){
        res.status(500).json({
            error:{
                message:'Internal server error'
            }
        })
    }
}

module.exports.getAllmessages = async (req,res)=>{
    const myId = req.myId
    const friendId = req.params.id
    try {
        let allMessages = await Messages.find({
            $or:[{
                $and :[{
                    senderId : {
                        $eq : myId
                    }
                    },{
                        receiverId:{
                            $eq : friendId
                        }
                    }
                ]
            },{
                $and: [{
                    receiverId:{
                        $eq : myId
                    }
                },{
                    senderId:{
                        $eq : friendId
                    }
                }]
            }]
        })

        // allMessages = allMessages.filter(m => m.senderId === myId && m.receiverId === friendId || 
        //     m.receiverId === myId && m.senderId === friendId)
        res.status(200).json({
            status:true,
            message:allMessages
        })
    } catch (error) {
        res.status(500).json({
            error:{
                message:'Internal server error'
            }
        })
    }
}
module.exports.sendImage = (req,res)=>{
    const form = formidable()
    form.parse(req,(err,fields,files)=>{
        const{sender,recieverId,imageName} = fields
        files.image.originalFilename = imageName
        const newPath = __dirname+`/../../client/public/images/${imageName}`
        console.log(newPath)

        try {
            fs.copyFile(files.image.filepath,newPath, async(err)=>{
                if(err){
                    console.log('hello');
                    res.status(500).json({
                        error:{
                            message: 'Image upload fail'
                        }
                    })
                }else{
                    const insertImage = await Messages.create({
                        senderId:req.myId,
                        senderName:sender,
                        receiverId:recieverId,
                        message:{
                            text:'',
                            image:files.image.originalFilename
                        }
                    })
                    
                    res.status(201).json({
                        success:true,
                        message:insertImage
                    })
                }
            })
        } catch (error) {
            res.status(500).json({
                error:{
                    message: 'Internal Server error'
                }
            })
        }

    })
}
