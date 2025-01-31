//Write a function regarding database
//importing should also be done here also 
//ALways export the function


//1.importing the package 
const mongoose=require('mongoose');

//2.Creating a function
const connectDB=()=>{
    mongoose.connect(process.env.MONGODB_URL).then(()=>{console.log("Database connected sucessfully")})
}


//3.ALways Exporting a function 
module.exports=connectDB;