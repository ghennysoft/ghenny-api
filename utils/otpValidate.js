const otpVerification = async(otpTime)=>{
    try {
        const cDate = new Date();
        var diffValue = (otpTime - cDate.getTime())/1000;
        diffValue /= 60;
        const minutes = Math.abs(diffValue);

        if(minutes>2){
            return true
        }
        return false;
    } catch (error) {
        console.log(error.message);        
    }
}

export default otpVerification