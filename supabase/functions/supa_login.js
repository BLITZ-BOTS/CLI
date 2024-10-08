const supabase = require("../client.js");
const Set_Session = require("../../files/set_session.js");

async function Supa_Login(email, password) {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) return console.error(`Login failed: ${error.message}`);
    

    // Log success
    console.log(`Login successful for email: ${email}`);
    Set_Session(data.session);

}

module.exports = Supa_Login;
