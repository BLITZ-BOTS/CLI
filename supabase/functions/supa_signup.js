const supabase = require("../client.js");


async function Supa_SignUp(email, password) {
    const { error, data } = await supabase.auth.signUp({ email, password})
    if (error) return console.error(`Login failed: ${error.message}`);
    console.log(`Sign up successful for email: ${email}`);
}

module.exports = Supa_SignUp;