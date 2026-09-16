import QRCode from "qrcode";

export async function generateQrPngDataUrl(
  destinationUrl: string,
  size = 1000,
): Promise<string> {
  return QRCode.toDataURL(destinationUrl, {
    width: size,
    margin: 1,
    errorCorrectionLevel: "M",
    color: {
      dark: "#111111",
      light: "#ffffff",
    },
  });
}
