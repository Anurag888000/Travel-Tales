const mongoose = require("mongoose");
const initData =require("./data.js");
const Listing=require("../Models/listing.js")

const MONGO_URL="mongodb://localhost:27017/wanderlust"

main().then(()=>{
    console.log("Connected To DB");
})
.catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(MONGO_URL)
}
const initDB = async()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj,owner:"664b1aa15334ccfd88dd2272"}));
    await Listing.insertMany(initData.data);
    console.log("Data Created");
}
initDB();
