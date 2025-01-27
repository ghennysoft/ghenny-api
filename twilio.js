import OtpModel from '../models/otp.js'
import otpGenerator from 'otp-generator'
import twilio from 'twilio'
import otpVerification from './utils/otpValidate.js'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN

const twilioClient = new twilio(accountSid, authToken);

const sendOtp = async(req, res)=>{
    const {phoneNumber} = req.body;
    try {
        const otp = otpGenerator.generate(6, {
           upperCaseAlphabets: false, 
           lowerCaseAlphabets: false, 
           specialChars: false, 
        })

        const cDate = new Date();

        await OtpModel.findOneAndUpdate(
            {phoneNumber},
            {otp, otpExpiration: new Date(cDate.getTime())},
            {upsert: true, new: true, setDefaultsOnInsert: true}
        );

        await twilioClient.messages.create({
            body: `Your OTP is: ${otp}`,
            to: phoneNumber,
            from: process.env.TWILIO_PHONE_NUMBER
        });

        return res.status(200).json('OTP sent successfully')
    } catch (error) {
        return res.status(500).json(error)
    }
}

const verifyOtp = async(req, res)=>{
    const {phoneNumber, otp} = req.body;
    try {
        const optData = await OtpModel.findOne({phoneNumber, otp});
        if(!optData){
            return res.status(400).json('Mauvais otp')
        }

        const isOtpExpired = otpVerification(optData.otpExpiration);
        if(isOtpExpired){
            return res.status(400).json('Your otp has already expired')
        }

        return res.status(200).json('OTP verified sucessfully')

    } catch (error) {
        return res.status(500).json(error)
    }
}

module.exports={sendOtp, verifyOtp}
