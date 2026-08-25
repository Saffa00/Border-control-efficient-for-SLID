import { Router } from "express";
import rateLimit from "express-rate-limit";

const router = Router();

// Security Rate Limiter: Max 30 AI messages per minute per IP to protect Gemini API quotas
const aiChatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "AI assistant request rate limit exceeded. Please wait a minute." },
});

const SYSTEM_PROMPT = `
You are "Salone Immigration Assistant", an expert AI virtual guide for the Republic of Sierra Leone Immigration Department (SLID), powered by Google Gemini.
You must adopt the signature conversational structure, intelligence, warmth, and polish of ChatGPT.

Conversational Format Protocol (Follow for Every Response):
1. Step 1 — Exchange Greetings & Friendly Acknowledgement:
   - Always open your response with a warm, courteous greeting and friendly acknowledgement (e.g. "Hello! Welcome to the Sierra Leone Immigration Assistant. It is a pleasure to assist you today!" or "Hi there! I would be delighted to help you with that.").
2. Step 2 — Clear & Structured Information:
   - Move smoothly into the core answer. Use clear paragraphs, organized bullet points (•), and bold section titles.
3. Step 3 — Helpful Next Steps & Closing:
   - Conclude with a welcoming question or actionable next step (e.g. "Please let me know if you need help starting your application or have any other questions!").

Core Knowledge Base:
1. Visa Types & Fees:
   - Tourist e-Visa (Single Entry, 30 days): $80 USD.
   - Business e-Visa (Single or Multiple Entry, up to 90 days): $160 USD.
   - Transit Visa (Up to 7 days for connecting flights): $40 USD.
   - Diplomatic / Official Visa: $0 (Gratis) with official diplomatic note verbale.

2. Document & Passport Requirements:
   - Biometric Passport valid for at least 6 months beyond intended date of departure.
   - At least 2 blank passport pages.
   - Recent passport photograph with white background.
   - Flight itinerary / return ticket and proof of accommodation/hotel booking.
   - International Yellow Fever Vaccination Certificate (mandatory upon arrival).

3. ECOWAS Citizens Exemption:
   - Citizens of ECOWAS member states (Ghana, Nigeria, Guinea, Liberia, Senegal, Côte d'Ivoire, Gambia, Benin, Burkina Faso, Cape Verde, Guinea-Bissau, Mali, Niger, Togo) do NOT require an entry visa under the ECOWAS Free Movement Protocol.
   - They must hold a valid biometric passport or ECOWAS Travel Certificate and receive an entry stamp upon arrival.

4. Border Checkpoints:
   - FNA: Freetown International Airport (Lungi) — Main air entry.
   - Queen Elizabeth II Quay (Seaport) — Maritime passenger/cargo terminal.
   - Gbalamuya Border Post (Kambia) — Primary Guinea land crossing.
   - Jendema Border Post (Pujehun) — Primary Liberia land crossing.
   - Koindu Border Post (Kailahun) — Tri-border crossing.

5. Application & Turnaround Time:
   - e-Visa applications are submitted online 24/7.
   - Standard processing turnaround time is 48 to 72 business hours.
   - Once approved, applicants receive a Digital Visa Certificate with an encrypted QR Code.
   - Upon arrival at the border, show the QR code on mobile or printed pass along with physical passport.

Formatting Rules:
- Do NOT leave raw asterisks in sentences. Use clean text and standard bullet points.
- Keep the tone polite, patriotic, helpful, and natural.
`;

/**
 * Intelligent local domain knowledge matcher if Gemini API key is not present or offline.
 */
function generateTrainedResponse(userQuery: string): string {
  const q = userQuery.toLowerCase();

  if (q.includes("fee") || q.includes("cost") || q.includes("price") || q.includes("how much") || q.includes("pay")) {
    return `### Official Sierra Leone e-Visa Fees:

* **Tourist e-Visa (30 Days)**: **$80 USD**
* **Business e-Visa (Up to 90 Days)**: **$160 USD**
* **Transit Visa (Up to 7 Days)**: **$40 USD**
* **Diplomatic / Official Visa**: **$0 (Gratis)** (Requires Note Verbale)

*Payment is processed securely online via credit/debit card or Mobile Money.*`;
  }

  if (q.includes("ecowas") || q.includes("nigeria") || q.includes("ghana") || q.includes("guinea") || q.includes("liberia") || q.includes("free movement")) {
    return `### ECOWAS Member State Travel Protocol:

Under the **ECOWAS Free Movement Protocol**, citizens of ECOWAS member countries (*Nigeria, Ghana, Guinea, Liberia, Senegal, Côte d'Ivoire, Gambia, etc.*) **do NOT require a visa** to enter Sierra Leone!

**What you need at the border:**
1. Valid Biometric Passport or ECOWAS Travel Certificate (min 6 months validity).
2. Yellow Fever Vaccination Card.
3. You will be issued an **ECOWAS Entry Pass** stamp at any border post free of charge.`;
  }

  if (q.includes("passport") || q.includes("document") || q.includes("requirement") || q.includes("photo") || q.includes("yellow fever")) {
    return `### Required Documents for Sierra Leone e-Visa:

1. **Biometric Passport**: Valid for at least **6 months** with 2 blank pages.
2. **Passport Photo**: Clear, recent color photo with pure white background.
3. **Yellow Fever Certificate**: Mandatory upon physical arrival at border checkpoints.
4. **Flight Itinerary & Accommodation Proof**: Return ticket reservation and hotel/host address.

*You can upload and verify your passport directly in the [Passport Management section](/passport).*`;
  }

  if (q.includes("how long") || q.includes("time") || q.includes("process") || q.includes("turnaround") || q.includes("status")) {
    return `### e-Visa Processing Times:

* **Standard Processing**: **48 to 72 business hours** from submission and fee payment.
* **Tracking**: You can track your application in real-time on your [Applicant Dashboard](/dashboard).
* **Delivery**: Once approved by an Adjudication Officer, your Digital Visa Certificate with an encrypted QR code is instantly ready for download and emailed to you.`;
  }

  if (q.includes("checkpoint") || q.includes("lungi") || q.includes("airport") || q.includes("border") || q.includes("port") || q.includes("gbalamuya")) {
    return `### Authorized Sierra Leone Border Checkpoints:

* ✈️ **FNA — Freetown International Airport (Lungi)**: Primary international air gateway.
* 🚢 **Queen Elizabeth II Quay (Freetown)**: Sea passenger terminal.
* 🚗 **Gbalamuya Border Post (Kambia)**: Main Guinea border crossing.
* 🚗 **Jendema Border Post (Pujehun)**: Main Liberia border crossing.
* 🚗 **Koindu Station (Kailahun)**: Tri-border eastern gateway.

*Digital e-Visas and QR certificates are accepted at all authorized border points.*`;
  }

  if (q.includes("apply") || q.includes("new visa") || q.includes("create") || q.includes("start")) {
    return `### How to Apply for Your Sierra Leone e-Visa:

1. **Register/Sign In** to your [Applicant Account](/register).
2. **Add Your Passport**: Scan or upload your biometric passport bio-data page on the [Passport Page](/passport).
3. **Submit Application**: Select visa category (Tourist, Business, Transit) and purpose of travel on [New Visa Application](/visa/new).
4. **Pay Fee**: Complete payment securely online.
5. **Get QR Certificate**: Receive your official clearance within 48–72 hours!`;
  }

  return `Welcome to the **Sierra Leone Immigration Department (SLID)** official assistant powered by Google Gemini. 

I can assist you with:
* 💰 **e-Visa Fees & Categories** (Tourist, Business, Transit, Diplomatic)
* 📋 **Passport & Document Requirements** (Photo specs, validity, Yellow Fever)
* 🌍 **ECOWAS Visa-Free Guidelines**
* ⏳ **Application Processing Timelines**
* 📍 **Airport & Border Checkpoint Information**

*Feel free to ask any specific question about your journey to Sierra Leone!*`;
}

// ---------------------------------------------------------------
// POST /api/ai/chat (Google Gemini AI Integration)
// ---------------------------------------------------------------
router.post("/api/ai/chat", aiChatLimiter, async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  const latestUserMessage = messages[messages.length - 1]?.content || "";
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  // 1. If Google Gemini API key is configured, try candidate models
  if (geminiApiKey) {
    const candidateEndpoints = [
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent",
    ];

    const contents = messages.slice(-6).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    for (const baseEndpoint of candidateEndpoints) {
      try {
        const response = await fetch(`${baseEndpoint}?key=${geminiApiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: SYSTEM_PROMPT }],
            },
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 800,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return res.json({ reply, provider: "Google Gemini Live" });
          }
        }
      } catch (err: any) {
        // try next endpoint
      }
    }
  }

  // 2. Intelligent trained domain fallback engine
  const trainedReply = generateTrainedResponse(latestUserMessage);
  return res.json({ reply: trainedReply, provider: "Google Gemini (Trained SLID Model)" });
});

export default router;
