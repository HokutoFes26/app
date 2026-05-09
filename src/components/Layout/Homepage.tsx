import { useTranslation } from "react-i18next";
import { CardBase, CardInside, Divider } from "@/components/Layout/CardComp";
import { getPath } from "@/constants/paths";

export default function Homepage() {
    const { t } = useTranslation();
    return (
        <CardBase title="ホームページ">
            <CardInside>
                <a href="https://hokutofes26.github.io/" target="_blank" rel="noreferrer">
                <img style={{width: "60%"}} src={getPath("/img/common/mainlogo.png")} />
                </a>
            </CardInside>
        </CardBase>
    );
}
