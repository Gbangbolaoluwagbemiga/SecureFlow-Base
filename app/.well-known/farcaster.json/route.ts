function withValidProperties(
  properties: Record<string, undefined | string | string[]>
) {
  return Object.fromEntries(
    Object.entries(properties).filter(([_, value]) =>
      Array.isArray(value) ? value.length > 0 : !!value
    )
  );
}

export async function GET() {
  const URL =
    process.env.NEXT_PUBLIC_URL || "https://secureflow-app.vercel.app";

  const manifest = {
    accountAssociation: {
      // Replace these with your generated credentials from Base Build
      header: "YOUR_GENERATED_HEADER_HERE",
      payload: "YOUR_GENERATED_PAYLOAD_HERE",
      signature: "YOUR_GENERATED_SIGNATURE_HERE",
    },
    baseBuilder: {
      ownerAddress: "0x3Be7fbBDbC73Fc4731D60EF09c4BA1A94DC58E41", // Your Base Account address
    },
    miniapp: {
      version: "1",
      name: "SecureFlow",
      homeUrl: URL,
      iconUrl: `${URL}/secureflow-favicon.svg`,
      splashImageUrl: `${URL}/secureflow-favicon.svg`,
      splashBackgroundColor: "#000000",
      webhookUrl: `${URL}/api/webhook`,
      subtitle: "Trustless Escrow on Base",
      description:
        "Decentralized freelance marketplace with transparent milestone payments powered by Base blockchain.",
      screenshotUrls: [
        `${URL}/screenshots/dashboard.png`,
        `${URL}/screenshots/create-job.png`,
        `${URL}/screenshots/milestones.png`,
      ],
      primaryCategory: "finance",
      tags: ["escrow", "freelance", "base", "web3", "payments"],
      heroImageUrl: `${URL}/og-image.png`,
      tagline: "Trustless payments, transparent milestones",
      ogTitle: "SecureFlow - Trustless Escrow on Base",
      ogDescription:
        "Decentralized freelance marketplace with transparent milestone payments powered by Base blockchain.",
      ogImageUrl: `${URL}/og-image.png`,
      noindex: false,
    },
  };

  return Response.json(manifest);
}
