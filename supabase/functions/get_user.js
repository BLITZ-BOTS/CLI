const supabase = require("../client.js");


async function Get_User() {
    const { error, data } = await supabase.auth.getUser()
    if (error) return {status: error.status, message: error.code};
    console.log(data)
}


Get_User()
