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
    process.env.NEXT_PUBLIC_URL || "https://secure-flow-base.vercel.app";

  const manifest = {
    accountAssociation: {
      header: process.env.FARCASTER_ACCOUNT_ASSOCIATION_HEADER,
      payload: process.env.FARCASTER_ACCOUNT_ASSOCIATION_PAYLOAD,
      signature: process.env.FARCASTER_ACCOUNT_ASSOCIATION_SIGNATURE,
    },

    baseBuilder: {
      ownerAddress: "0x3Be7fbBDbC73Fc4731D60EF09c4BA1A94DC58E41",
    },
    miniapp: {
      version: "1",
      name: "SecureFlow",
      homeUrl: URL,
      iconUrl: `${URL}/secureflow-logo.svg`,
      splashImageUrl: `${URL}/secureflow-logo.svg`,
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
      heroImageUrl: `${URL}/secureflow-logo.svg`,
      tagline: "Trustless payments, milestones",
      ogTitle: "SecureFlow - Trustless Escrow",
      ogDescription:
        "Decentralized freelance marketplace with transparent milestone payments powered by Base blockchain.",
      ogImageUrl: `${URL}/secureflow-logo.svg`,
      noindex: false,
    },
  };

  return Response.json(manifest);
}
