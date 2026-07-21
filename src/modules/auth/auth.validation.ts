export const validateRegister=(payload:any):string | null=>{
    const {name,email,password}=payload;
    if(!name || !email || !password ){
        return "All fields are required";
    }
    if(!email.includes("@")){
        return "Invalid email";
    }
    if(password.length<6){
        return "Password must be at least 6 characters";
    }

    return null;
}


export const validateLogin=(payload:any):string | null=>{
    const {email,password}=payload;
    if(!email || !password){
        return "All fields are required";
    }
    if(!email.includes("@")){
        return "Invalid email";
    }
    if(password.length<6){
        return "Password must be at least 6 characters";
    }
    return null;
}

