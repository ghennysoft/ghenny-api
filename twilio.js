import otpGenerator from 'otp-generator'
import twilio from 'twilio'
import UserModel from './Models/userModel.js'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN

const twilioClient = new twilio(accountSid, authToken);

const sendOtp = async(req, res)=>{
    const {phoneNumber} = req.body;
    try {
        const user = await UserModel.findOne({ phone_code: phoneNumber });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        const otp = otpGenerator.generate(6, {
           upperCaseAlphabets: false, 
           lowerCaseAlphabets: false, 
           specialChars: false, 
        })
        user.otp = otp;
        user.otpExpiration = Date.now() + 300000; // 5 minutes
        await user.save();

        await twilioClient.messages.create({
            body: `Votre code est: ${otp}`,
            to: phoneNumber,
            from: process.env.TWILIO_PHONE_NUMBER
        });

        res.status(200).json({ message: 'OTP envoyé avec succès' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'OTP', error });
    }
}

const verifyOTP = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  try {
    const user = await UserModel.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    if (user.otp !== otp || user.otpExpiration < Date.now()) {
      return res.status(400).json({ message: 'OTP invalide ou expiré' });
    }

    // Réinitialiser l'OTP après vérification
    user.otp = null;
    user.otpExpiration = null;
    await user.save();

    res.status(200).json({ message: 'OTP vérifié avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la vérification de l\'OTP', error });
  }
};

module.exports={sendOtp, verifyOTP}
