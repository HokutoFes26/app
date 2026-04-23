import { useTranslation } from "react-i18next";
import { CardBase, CardInside, Divider } from "@/components/Layout/CardComp";
import { getPath } from "@/constants/paths";

export default function Homepage() {
    const { t } = useTranslation();
    return (
        <CardBase title="ホームページ">
            <CardInside>
                <a href="https://hokutofes26.github.io/">
                <img style={{width: "100%"}} src={getPath("/img/common/mainlogo.jpg")} />
                </a>
            </CardInside>
        </CardBase>
    );
}
