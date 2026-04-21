import React, { useState } from "react";
import { Button, Modal } from "antd";
import QrCodeIcon from "@mui/icons-material/QrCode";

interface BoothHandoverQRProps {
    assignedStall: string | null;
}

export default function BoothHandoverQR({ assignedStall }: BoothHandoverQRProps) {
    const [showQR, setShowQR] = useState(false);

    const generateHandoverURL = () => {
        if (typeof window === "undefined") return "";
        const pass = localStorage.getItem("admin_pass") || "";
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?pass=${encodeURIComponent(pass)}&booth=${encodeURIComponent(assignedStall || "")}`;
    };

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        generateHandoverURL(),
    )}`;

    return (
        <>
            <div style={{ textAlign: "center" }}>
                <Button
                    type="default"
                    icon={<QrCodeIcon />}
                    onClick={() => setShowQR(true)}
                    style={{ border: "none", color: "#666" }}
                >
                    交代用QRコードを表示
                </Button>
            </div>

            <Modal
                title="シフト引き継ぎ用QR"
                open={showQR}
                onCancel={() => setShowQR(false)}
                footer={null}
                centered
                getContainer={() => document.querySelector(".webapp-root") || document.body}
            >
                <div style={{ textAlign: "center", padding: "20px" }}>
                    <p style={{ fontSize: "12px", color: "#666", marginBottom: "20px" }}>
                        次の担当者のスマホでこのQRを読み取ってください。
                        <br />
                        自動的にログインと店舗設定が完了します。
                    </p>
                    <div
                        style={{
                            background: "#fff",
                            padding: "15px",
                            borderRadius: "12px",
                            display: "inline-block",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                    >
                        <img src={qrUrl} alt="Handover QR" style={{ width: "200px", height: "200px" }} />
                    </div>
                    <p style={{ marginTop: "20px", fontWeight: "bold", color: "var(--main-color)" }}>
                        担当: {assignedStall}
                    </p>
                </div>
            </Modal>
        </>
    );
}
