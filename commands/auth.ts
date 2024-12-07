import { createClient } from "jsr:@supabase/supabase-js@2.47.2";
import { join } from "jsr:@std/path@1.0.8";
import { writeFile } from "jsr:@opensrc/jsonfile@1.0.0";
import { systemopen } from "jsr:@lambdalisue/systemopen@1.0.0";

type TokenData = {
  access_token: string;
  expires_at: string;
  expires_in: string;
  provider_refresh_token: string;
  provider_token: string;
  refresh_token: string;
  token_type: string;
};

const supabase = createClient(
  "https://fewdjowxiqfzsfixqbzl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZld2Rqb3d4aXFmenNmaXhxYnpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzExMDM5MDIsImV4cCI6MjA0NjY3OTkwMn0.SvzrrIcLU8lCrv-xcNFoHoOdqLh8n7wvE5TZ5QFl32s",
);

const getAppDataPath = (): string => {
  return Deno.build.os === "windows"
    ? join(Deno.env.get("APPDATA") || "", ".blitz")
    : join(Deno.env.get("HOME") || "", ".blitz");
};

export async function AuthCommand() {
  try {
    const { data: { url }, error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: "http://localhost:6127/auth/callback" },
    });

    if (error) throw error;

    console.log(
      "\x1b[36m%s\x1b[0m",
      `Opening In Default Browser:\n${url}\n\n`,
    );

    await systemopen(`${url}`);

    const tokens = await CreateTempAuthServer();

    const user = await supabase.auth.getUser(tokens.access_token);
    const fullName = user?.data?.user?.user_metadata?.full_name ??
      "Unknown User";

    console.log(`Logged In As \x1b[1m${fullName}\x1b[0m`);
    Deno.exit();
  } catch (error) {
    console.log(error);
  }
}

function CreateTempAuthServer(): Promise<TokenData> {
  return new Promise((resolve, reject) => {
    const handler = async (req: Request) => {
      const url = new URL(req.url, "http://localhost:6127");
      const headers = new Headers();
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      headers.set("Access-Control-Allow-Headers", "Content-Type");

      if (req.method === "OPTIONS") {
        return new Response(null, { headers });
      }

      if (url.pathname === "/auth/callback") {
        const html = new TextEncoder().encode(`<!DOCTYPE html>
          <html>
            <script src="https://cdn.tailwindcss.com"></script>
            <head>
              <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" rel="stylesheet">
            </head>
            <body class="bg-black text-white font-sans flex items-center justify-center min-h-screen">
              <script>
                const fragment = window.location.hash.substring(1);
                const params = new URLSearchParams(fragment);
                const data = Object.fromEntries(params.entries());
                fetch('/token', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
                }).then((response) => {
                  if (response.ok) {
                    return response.json();
                  } else {
                    throw new Error("Authentication failed.");
                  }
                }).then((tokens) => {
                  document.body.innerHTML = \`
                    <div class="text-center">
                      <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#DD2832] to-[#FF30A0] mb-4">
                        Authentication successful!
                      </h1>
                      <h1 class="text-3xl font-bold text-center">
                        You can close this tab.
                      </h1>
                    </div>
                  \`;
                }).catch((error) => {
                  console.error('Error during authentication:', error);
                  document.body.innerHTML = \`
                    <div class="text-center">
                      <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#DD2832] to-[#FF30A0] mb-4">
                        Authentication failed.
                      </h1>
                      <h1 class="text-3xl font-bold text-center">
                        Please try again.
                      </h1>
                    </div>
                  \`;
                });
              </script>
            </body>
          </html>
        `);
        return new Response(html, { headers });
      }

      if (url.pathname === "/token" && req.method === "POST") {
        try {
          const body = await req.text();
          const tokens = JSON.parse(body);

          const filePath = getAppDataPath();

          // Check if the file exists using Deno.stat()
          let fileExists = false;
          try {
            await Deno.stat(filePath); // Check if the file exists
            fileExists = true;
          } catch (err) {
            if (err instanceof Deno.errors.NotFound) {
              fileExists = false;
            } else {
              throw err;
            }
          }

          if (!fileExists) {
            await writeFile(filePath, {}, { spaces: 2 }); // Create the file if it doesn't exist
          }

          await writeFile(filePath, tokens, { spaces: 2 });

          const response = new Response(
            JSON.stringify({
              message: "Tokens received successfully",
              tokens,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          );

          resolve(tokens);
          server.shutdown(); // Shutdown server after token reception

          return response;
        } catch (error) {
          console.error("Error processing tokens:", error);
          reject(error);
          return new Response(
            JSON.stringify({
              message: `Error processing tokens`,
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      }

      return new Response("BLITZ TEMP AUTH SERVER", { headers });
    };

    const server = Deno.serve({ port: 6127, onListen: () => {} }, handler);
  });
}
